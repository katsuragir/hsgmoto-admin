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
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../../core/_base/crud';
// Services and Models
import {
	ConfirmModel,
	ConfirmsPageRequested,
	OneConfirmDeleted,
	ManyConfirmsDeleted,
	ConfirmsParentUpdated,
	confirmsReducer,
	ConfirmService,
} from '../../../../../../core/order';
import {
	CustomerService
} from '../../../../../../core/customer';
import { selectConfirmsPageLastQuery } from '../../../../../../core/order/_selectors/confirm.selectors';
import { ConfirmsDataSource } from '../../../../../../core/order/_data-sources/confirms.datasource';
// import { element } from '@angular/core/src/render3';
import { TranslateService } from '@ngx-translate/core';
// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-confirm-list',
	templateUrl: './confirm-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
	})
export class ConfirmListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: ConfirmsDataSource;
	displayedColumns = ['select', 'ID', 'Order ID', 'total', 'fullname', 'date', 'payment', 'virtual', 'note', 'status', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	filterParent: string = '';
	filterName: string = '';
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<ConfirmModel>(true, []);
	confirmsResult: ConfirmModel[] = [];
	private subscriptions: Subscription[] = [];
	test: any;

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
		private confirmService: ConfirmService,
		private translate: TranslateService,
		private customerService: CustomerService) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

		// categoryName: any = [];
	/*
	getCategoryName(id_category) {
		const name = this.categoryName;

		this.catagoryService.getCategoryNameById(id_category).subscribe(
			res => {
				this.categoryName = res;
			}
		);
		console.log(this.categoryName);
		return name;
	}
	*/
	/**
	 * On init
	 */
	ngOnInit() {
		/*
		this.catagoryService.getCategoryById(this.confirm.id_category).subscribe(
			res => {
				this.categoryName = res;
			},
			err => console.log(err)
		);
		*/
		// If the user changes the sort confirm, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadConfirmsList())
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadConfirmsList();
			})
		)
		.subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Confirms');

		// Init DataSource
		this.dataSource = new ConfirmsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.confirmsResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectConfirmsPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadConfirmsList();
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
	 * Load Confirms List
	 */
	loadConfirmsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new ConfirmsPageRequested({ page: queryParams }));
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

		filter.transaction_id = searchText;
		filter.first_name = searchText;
		filter.last_name = searchText;
		filter.harga = searchText;

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
	 * Delete confirm
	 *
	 * @param _item: ConfirmModel
	 */

	deleteConfirm(confirm: ConfirmModel) {
		const _title: string = 'Confirm Delete';
		const _description: string = 'Are you sure to permanently delete this confirm?';
		const _waitDesciption: string = 'Confirm is deleting...';
		const _deleteMessage = `Confirm has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneConfirmDeleted({ id: confirm.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});

	}

	/**
	 * Delete confirms
	 */
	deleteConfirms() {
		const _title: string = 'Confirms Delete';
		const _description: string = 'Are you sure to permanently delete selected confirms?';
		const _waitDesciption: string = 'Confirms are deleting...';
		const _deleteMessage = 'Selected confirms have been deleted';

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
			this.store.dispatch(new ManyConfirmsDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
		});

	}

	/**
	 * Fetch selected confirms
	 */
	fetchConfirms() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.transaction_id}`,
				id: elem.id,
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	/**
	 * Update status dialog
	 */
	/*
	updateParentForConfirms(confirm: ConfirmModel) {
		const _title = 'Update Parent for selected categories';
		const _updateMessage = 'Parent has been updated for selected categories';
		const id = confirm.id;
		const name = confirm.transaction_id;
		// tampil di list
		const _statuses = [{ value: `${id}`, text: `${name}` }];
		const _messages = [];

		this.selection.selected.forEach(elem => {
			_messages.push({
				text: `${elem.transaction_id}`,
				id: elem.id,
			});
		});

		const dialogRef = this.layoutUtilsService.updateStatusForEntities(_title, _statuses, _messages);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.selection.clear();
				return;
			}

			this.store.dispatch(new ConfirmsParentUpdated({
				id_parent: +res,
				confirms: this.selection.selected
			}));

			this.layoutUtilsService.showActionNotification(_updateMessage, MessageType.Update);
			this.selection.clear();
		});
	}
	*/
	/**
	 * Redirect to edit page
	 *
	 * @param id: any
	 */
	checkConfirm(id) {
		this.router.navigate(['../confirm/check', id], { relativeTo: this.activatedRoute });
	}
	/**
	 * Check all rows are selected
	 */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.confirmsResult.length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection
	 */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.confirmsResult.forEach(row => this.selection.select(row));
		}
	}

	/* UI */
	/**
	 * return css
	 */
	getClassByStatus(status: number): string {
		switch (status) {
			case 0:
				return 'accent';
			case 1:
				return 'primary';
		}
		return '';
	}

	/**
	 * return status string
	 */
	getStatus(status: number): string {
		switch (status) {
			case 0:
				return 'Not Verified';
			case 1:
				return 'verified';
		}
		return '';
	}

	/**
	 * Return Customer Name
	 */
	getCustomer(id: number) {
		return this.customerService.getCustomerById(id).subscribe(
			res => {
				const firstname: string = res.firstname;
				console.log(firstname);
				return firstname;
			}
		);
	}
	/**
	 * Returns status string
	 *
	 * @param status: number
	 */
	getItemStatusString(parent: number = 1): string {
		switch (parent) {
			case 1:
				return 'BCA';
		}
		return '';
	}

	/**
	 * Returns CSS Class by status
	 *
	 * @param status: number
	 */
	getItemCssClassByStatus(status: number = 1): string {
		switch (status) {
			case 1:
				return 'success';
		}
		return '';
	}

	/**
	 * Rerurns condition string
	 *
	 * @param condition: number
	 */
	getItemConditionString(condition: number = 0): string {
		switch (condition) {
			case 0:
				return 'Waiting Payment';
			case 1:
				return 'Process';
		}
		return '';
	}

	/**
	 * Returns CSS Class by condition
	 *
	 * @param condition: number
	 */
	getItemCssClassByCondition(condition: number = 0): string {
		switch (condition) {
			case 0:
				return 'primary';
			case 1:
				return 'accent';
		}
		return '';
	}
}
