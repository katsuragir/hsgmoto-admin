// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
// UI
import { SubheaderService } from '../../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, MessageType, QueryParamsModel, HttpUtilsService } from '../../../../../../core/_base/crud';
// Services and Models
import {
	DiscountModel,
	DiscountsPageRequested,
	OneDiscountDeleted,
	ManyDiscountsDeleted,
	DiscountsParentUpdated,
	discountsReducer,
	selectDiscountsPageLastQuery,
	DiscountsDataSource,
	DiscountService
} from '../../../../../../core/catalog';
import { TranslateService } from '@ngx-translate/core';
import { ProductListComponent } from './products-list.component';
import { DatePipe } from '@angular/common';
// import { element } from '@angular/core/src/render3';
// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-discounts-list',
	templateUrl: './discount-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})
export class DiscountsListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: DiscountsDataSource;
	// tslint:disable-next-line: max-line-length
	displayedColumns = [ 'kode', 'description', 'from', 'to', 'disc', 'status', 'by', 'date', 'time', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	filterParent: string = '';
	filterName: string = '';
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<DiscountModel>(true, []);
	discountsResult: DiscountModel[] = [];
	private subscriptions: Subscription[] = [];
	private localURl: string;
	private disc = 'disc';
	private prod = 'prod';

	/**
	 * Component constructor
	 *
	 * @param dialog: MatDialog
	 * @param activatedRoute: ActivatedRoute
	 * @param router: Router
	 * @param subheaderService: SubheaderService
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param store: Store<AppState>
	 */
	constructor(public dialog: MatDialog,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private domainLocal: HttpUtilsService,
		private translate: TranslateService,
		private discountService: DiscountService,
		private datePipe: DatePipe) { this.localURl = this.domainLocal.domain; }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadDiscountsList())
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadDiscountsList();
			})
		)
		.subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Categories');

		// Init DataSource
		this.dataSource = new DiscountsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.discountsResult = res;
			// console.log(this.discountsResult);
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectDiscountsPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadDiscountsList();
			}); // Remove this line, just loading imitation
		});
		this.subscriptions.push(routeSubscription);
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Load Products List
	 */
	loadDiscountsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new DiscountsPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/**
	 * Returns object for filter
	 */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		if (this.filterParent && this.filterParent.length > 0) {
			filter.parent = +this.filterParent;
		}

		filter.kode_disc = searchText;
		filter.description = searchText;
		filter.from_date = searchText;
		filter.to_date = searchText;
		filter.create_by = searchText;

		return filter;
	}

	/**
	 * Restore state
	 *
	 * @param queryParams: QueryParamsModel
	 * @param id: number
	 */
	restoreState(queryParams: QueryParamsModel, id: number) {

		if (!queryParams.filter) {
			return;
		}

		if ('parent' in queryParams.filter) {
			this.filterParent = queryParams.filter.parent.toString();
		}

		if (queryParams.filter.name) {
			this.searchInput.nativeElement.value = queryParams.filter.name;
		}
	}

	/** ACTIONS */
	/**
	 * Delete product
	 *
	 * @param _item: DiscountModel
	 */
	deleteDiscount(discount: DiscountModel) {
		const _title: string = 'Discount Delete';
		const _description: string = 'Are you sure to permanently delete this discount?';
		const _waitDesciption: string = 'Discount is deleting...';
		const _deleteMessage = `Discount has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneDiscountDeleted({ id: discount.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	/**
	 * Delete discounts
	 */
	deleteDiscounts() {
		const _title: string = 'Discounts Delete';
		const _description: string = 'Are you sure to permanently delete selected discounts?';
		const _waitDesciption: string = 'Discounts are deleting...';
		const _deleteMessage = 'Selected discounts have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const idsForDeletion: number[] = [];
			// tslint:disable-next-line:prefer-for-of
			for (let i = 0; i < this.selection.selected.length; i++) {
				idsForDeletion.push(this.selection.selected[i].id);
			}
			this.store.dispatch(new ManyDiscountsDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
		});
	}

	/**
	 * Fetch selected products
	 */
	fetchDiscounts() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.description}`,
				id: elem.kode_disc,
				By: elem.create_by
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	onSelect(discount: DiscountModel, params: string) {
		console.log(discount, params);
		let saveMessageTranslateParam = 'SUCCESS ';
		saveMessageTranslateParam = discount.kode_disc ? 'SELECT PRODUCT DISCOUNT' : '';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam);
		const _messageType = discount.kode_disc ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(ProductListComponent, { data: { discount, params }, width: '1000px' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType);
			this.loadDiscountsList();
		});
	}

	/**
	 * Redirect to edit page
	 *
	 * @param id: any
	 */
	editDiscount(id) {
		this.router.navigate(['../discounts/edit', id], { relativeTo: this.activatedRoute });
	}

	/**
	 * Check all rows are selected
	 */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.discountsResult.length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection
	 */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.discountsResult.forEach(row => this.selection.select(row));
		}
	}

	/* UI */
	/**
	 * Returns CSS Class by status
	 *
	 * @param status: number
	 */
	getItemCssClassByStatus(status: number = 0): string {
		switch (status) {
			case 0:
				return 'metal';
			case 1:
				return 'success';
		}
		return '';
	}

	/**
	 * Returns status string
	 *
	 * @param status: number
	 */
	getItemStatusString(parent: number = 0): string {
		switch (parent) {
			case 0:
				return 'Disable';
			case 1:
				return 'Enable';
		}
		return '';
	}

	onActive(id: string, status) {
		const date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

		if (status.to_date < date) {

			const message = `To date is smaller than date now.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		} else {

			let active = 1;
			let deactive = 0;
			let stat: number;
			// tslint:disable-next-line: new-parens
			const tgl = this.datePipe.transform(date, 'yyyy-MM-dd');
			const time = this.datePipe.transform(date, 'hh:mm:ss');
			if (status.status === 0) {
				stat = active;
			} else {
				stat = deactive;
			}
			const data = {
				kd_disc: id,
				flag: stat,
				tgl: tgl,
				tm: time
			};
			this.discountService.updateStat(data).subscribe();
			this.ngOnInit();
		}
	}
}
