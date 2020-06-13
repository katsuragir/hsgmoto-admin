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
import { AppState } from '../../../../../core/reducers';
// UI
import { SubheaderService } from '../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
// Services and Models
import {
	ListInvModel,
	ListInvPageRequested,
	OneListInvDeleted,
	ManysListInvDeleted,
	ListInvParentUpdated,
	ReducerListInv,
	ListInvService,
	selectsListInvPageLastQuery,
	ListInvDataSource
} from '../../../../../core/customer';
// import { element } from '@angular/core/src/render3';
import { TranslateService } from '@ngx-translate/core';
import { currentUser } from '../../../../../core/auth';
import { DeliveryService,
	DeliverysDataSource,
	selectDeliverysPageLastQuery,
	DeliveryModel,
	DeliverysPageRequested } from '../../../../../core/order';
// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4

@Component({
	selector: 'kt-customer-list-invoice',
	templateUrl: './customer-list-invoice.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
	})
export class CustomersListInvoiceComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: ListInvDataSource;
	public dataSource1: DeliverysDataSource;
	deliverysResult: DeliveryModel[] = [];
	displayedColumns = ['Date', 'ID Order', 'Invoice', 'Status'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	filterParent: string = '';
	filterName: string = '';
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<ListInvModel>(true, []);
	customersResult: ListInvModel[] = [];
	private subscriptions: Subscription[] = [];
	@ViewChild(MatPaginator, {static: true}) paginator1: MatPaginator;
	@ViewChild('sort1', {static: true}) sort1: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput1: ElementRef;
	filterParent1: string = '';
	filterName1: string = '';
	lastQuery1: QueryParamsModel;
	// Selection
	selection1 = new SelectionModel<ListInvModel>(true, []);
	customersResult1: ListInvModel[] = [];
	private subscriptions1: Subscription[] = [];
	test: any;
	isAdmin: any = [];
	isButtonVisible = false;
	public Cart = 0;
	private result: any[] = [];

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
		private translate: TranslateService,
		private customerService: ListInvService,
		private deliveryService: DeliveryService) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {
				this.customerService.id_customer = id;
				this.customerService.getAllCustomerslistInv().subscribe();
			}
		});
		// If the user changes the sort customer, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadCustomersList())
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadCustomersList();
			})
		)
		.subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('List Invoice');

		// Init DataSource
		this.dataSource = new ListInvDataSource(this.store);
		const coba = new ListInvDataSource(this.store);
		// console.log(coba);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.customersResult = res;
			// console.log(this.customersResult);
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectsListInvPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadCustomersList();
			}); // Remove this line, just loading imitation
		});
		this.subscriptions.push(routeSubscription);

		this.store.pipe(select(currentUser), first(res => {
			return res !== undefined;
		})
		).subscribe(result => {
			// this.user$ = result;
			this.isAdmin = result.roles;
			if (this.isAdmin === 1) {
				this.isButtonVisible = false;
			} else {
				this.isButtonVisible = true;
			}
		});
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Load Customers List
	 */
	loadCustomersList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new ListInvPageRequested({ page: queryParams }));
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

		filter.id_order = searchText;
		filter.invoice = searchText;

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
	 * View Order
	 */
	viewOrder(inv: ListInvModel) {
		this.router.navigate(['/vp-admin/order/orders/view', inv.id_order], { relativeTo: this.activatedRoute });
	}

	/**
	 * View Chart
	 */

	viewCart(inv) {
		this.Cart = 0;
		this.deliveryService.idOrder = inv.id_order;
		this.deliveryService.getAllDeliverys().subscribe();
		this.refreshlist(inv);

	}

	refreshlist(inv) {
		// If the user changes the sort delivery, reset back to the first page.
		const sortSubscription = this.sort1.sortChange.subscribe(() => (this.paginator1.pageIndex = 0));
		this.subscriptions1.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort1.sortChange, this.paginator1.page).pipe(
			tap(() => this.loadDeliverysList())
		)
		.subscribe();
		this.subscriptions1.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput1.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator1.pageIndex = 0;
				this.loadDeliverysList();
			})
		)
		.subscribe();
		this.subscriptions1.push(searchSubscription);

		// Init DataSource
		this.dataSource1 = new DeliverysDataSource(this.store);
		console.log(this.dataSource);
		const entitiesSubscription = this.dataSource1.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.deliverysResult = res;
			// console.log(this.deliverysResult);
		});
		// console.log(this.dataSource);
		this.subscriptions1.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectDeliverysPageLastQuery)).subscribe(res => this.lastQuery1 = res);
		// Load last query from store
		this.subscriptions1.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery1, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadDeliverysList();
			}); // Remove this line, just loading imitation
		});
		this.subscriptions1.push(routeSubscription);
		this.Cart = 1;
		// console.log(inv.id_order);
		// console.log(this.Cart);
	}

	/**
	 * Load Deliveries List
	 */
	loadDeliverysList() {
		this.selection1.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort1.direction,
			this.sort1.active,
			this.paginator1.pageIndex,
			this.paginator1.pageSize
		);
		// Call request from server
		this.store.dispatch(new DeliverysPageRequested({ page: queryParams }));
		this.selection1.clear();
	}

	/**
	 * Delete customer
	 *
	 * @param _item: CustomerListInvModel
	 */

	deleteCustomer(customer: ListInvModel) {
		const _title: string = 'Customer Delete';
		const _description: string = 'Are you sure to permanently delete this customer?';
		const _waitDesciption: string = 'Customer is deleting...';
		const _deleteMessage = `Customer has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneListInvDeleted({ id: customer.id_order }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});

	}

	/**
	 * Delete customers
	 */
	deleteCustomers() {
		const _title: string = 'Customers Delete';
		const _description: string = 'Are you sure to permanently delete selected customers?';
		const _waitDesciption: string = 'Customers are deleting...';
		const _deleteMessage = 'Selected customers have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const idsForDeletion: string[] = [];
			// tslint:disable-next-line:prefer-for-of
			for (let i = 0; i < this.selection.selected.length; i++) {
				idsForDeletion.push(this.selection.selected[i].id_order);
			}
			this.store.dispatch(new ManysListInvDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
		});

	}

	/**
	 * Fetch selected customers
	 */
	fetchCustomers() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.Cusname}`,
				id: elem.invoice,
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	/**
	 * Redirect to edit page
	 *
	 * @param id: any
	 */
	editCustomer(id) {
		this.router.navigate(['../customer/edit', id], { relativeTo: this.activatedRoute });
	}

	/**
	 * Check all rows are selected
	 */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.customersResult.length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection
	 */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.customersResult.forEach(row => this.selection.select(row));
		}
	}

	/* UI */
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
				return 'Awaiting Payment';
			case 1:
				return 'On Process';
			case 2:
				return 'Sending';
			case 3:
				return 'Delivered';
			case 4:
				return 'Verification';
			case 5:
				return 'Accept Payment';
			case 6:
				return 'Cancel Order';
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
				return 'accent';
			case 1:
				return 'drakblue';
			case 2:
				return 'abuabu';
			case 3:
				return 'success';
			case 4:
				return 'orange';
			case 5:
				return 'green';
			case 6:
				return 'red';
		}
		return '';
	}
}
