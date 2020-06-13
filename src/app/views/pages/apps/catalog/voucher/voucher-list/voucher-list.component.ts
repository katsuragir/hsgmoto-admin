// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, delay, first } from 'rxjs/operators';
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
	VoucherModel,
	VouchersPageRequested,
	OneVoucherDeleted,
	ManyVouchersDeleted,
	VouchersParentUpdated,
	vouchersReducer,
	selectVouchersPageLastQuery,
	VouchersDataSource,
	VoucherService
} from '../../../../../../core/catalog';
import { TranslateService } from '@ngx-translate/core';
import { VInvoicesListComponent } from '../../../order/invoice/invoice-list-vouch/invoice-list.component';
import { DatePipe } from '@angular/common';
import { User, currentUser } from '../../../../../../core/auth';

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
	selector: 'kt-vouchers-list',
	templateUrl: './voucher-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})
export class VouchersListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: VouchersDataSource;
	// tslint:disable-next-line: max-line-length
	displayedColumns = [ 'vid', 'vname', 'from', 'to', 'value', 'status', 'create', 'update', 'qouta', 'use', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	filterParent: string = '';
	filterName: string = '';
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<VoucherModel>(true, []);
	vouchersResult: VoucherModel[] = [];
	private subscriptions: Subscription[] = [];
	private localURl: string;
	private disc = 'disc';
	private prod = 'prod';
	user$: User;
	isAdmin: any = [];
	found = false;

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
		private voucherService: VoucherService,
		private datePipe: DatePipe) { this.localURl = this.domainLocal.domain; }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.store.pipe(select(currentUser), first(res => {
			return res !== undefined;
		})
		).subscribe(result => {
			this.user$ = result;
			this.isAdmin = this.user$.roles;
		});
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadVouchersList())
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadVouchersList();
			})
		)
		.subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Categories');

		// Init DataSource
		this.dataSource = new VouchersDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.vouchersResult = res;
			if (res.length > 0) {
				this.found = true;
			} else {
				this.found = false;
			}
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectVouchersPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadVouchersList();
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
	loadVouchersList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new VouchersPageRequested({ page: queryParams }));
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
	onSelect(voucher: VoucherModel) {
		const params = 'vouch';
		// console.log(params);
		let saveMessageTranslateParam = 'SUCCESS ';
		saveMessageTranslateParam = voucher.voucherid ? 'SELECT VOUCHER' : '';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam);
		const _messageType = voucher.voucherid ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(VInvoicesListComponent, { data: { voucher, params }, width: '1000px' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType);
			this.loadVouchersList();
		});
	}

	/**
	 * Delete product
	 *
	 * @param _item: VoucherModel
	 */
	deleteVoucher(voucher: VoucherModel) {
		const _title: string = 'Delete Voucher';
		const _description: string = 'Are you sure to permanently delete this voucher?';
		const _waitDesciption: string = 'Voucher is deleting...';
		const _deleteMessage = `Voucher has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneVoucherDeleted({ id: voucher.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	/**
	 * Delete vouchers
	 */
	deleteVouchers() {
		const _title: string = 'Vouchers Delete';
		const _description: string = 'Are you sure to permanently delete selected vouchers?';
		const _waitDesciption: string = 'Vouchers are deleting...';
		const _deleteMessage = 'Selected vouchers have been deleted';

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
			this.store.dispatch(new ManyVouchersDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
		});
	}

	/**
	 * Fetch selected products
	 */
	fetchVouchers() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.vouchername}`,
				id: elem.voucherid,
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	/**
	 * Redirect to edit page
	 *
	 * @param id: any
	 */
	editVoucher(id) {
		this.router.navigate(['../vouchers/edit', id], { relativeTo: this.activatedRoute });
	}

	/**
	 * Check all rows are selected
	 */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.vouchersResult.length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection
	 */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.vouchersResult.forEach(row => this.selection.select(row));
		}
	}

	/* UI */
	/**
	 * Returns CSS Class by status
	 *
	 * @param status: number
	 */
	getItemCssClassByStatus(status: number): string {
		switch (status) {
			case 1:
				return 'success';
			case 0:
				return 'red';
		}
		return '';
	}

	/**
	 * Returns status string
	 *
	 * @param status: number
	 */
	getItemStatusString(parent: number): string {
		switch (parent) {
			case 1:
				return 'Enable';
			case 0:
				return 'Disable';
		}
		return '';
	}

	onActive(id: string, status) {
		const date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
		if (status.todate < date) {

			const message = `To date is smaller than date now.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		} else {
			let active = 1;
			let deactive = 0;
			let stat: number;
			if (status.status === 0) {
				stat = active;
			} else {
				stat = deactive;
			}
			const data = {
				vid: id,
				flag: stat
			};
			this.voucherService.updateStat(data).subscribe();
			this.ngOnInit();
		}
	}
}
