// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription, BehaviorSubject } from 'rxjs';
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
	ConfirmService,
	OrderModel,
	OrderService,
	ShippingService,
	OrdersPageRequested,
	OrdersDataSource,
	selectOrdersPageLastQuery
} from '../../../../../../core/order';
import {
	CustomerService,
} from '../../../../../../core/customer';
import { selectConfirmsPageLastQuery } from '../../../../../../core/order/_selectors/confirm.selectors';
import { ConfirmsDataSource } from '../../../../../../core/order/_data-sources/confirms.datasource';
// import { element } from '@angular/core/src/render3';
import { TranslateService } from '@ngx-translate/core';
import { DeliveryService } from '../../../../../../core/order/_services';
// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-check-confirm',
	templateUrl: './check-confirm.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
	})
export class CheckConfirmComponent implements OnInit, OnDestroy {
	selectedTab: number = 0;
	confirmHeaderA: ConfirmModel;
	confirmHeaderB: any;
	hasFormErrors: boolean = false;
	loadingSubject =  new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	customer: any;
	ongkir: any;
	message: any;
	public pay = '';
	// Table fields
	dataSource: OrdersDataSource;
	displayedColumns = [ 'ID', 'Order ID', 'customer', 'total', 'payment', 'status', 'date', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	filterParent: string = '';
	filterName: string = '';
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<OrderModel>(true, []);
	ordersResult: OrderModel[] = [];
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
		private customerService: CustomerService,
		private location: Location,
		private orderService: OrderService,
		private shippingService: ShippingService,
		private datePipe: DatePipe,
		private deliveryService: DeliveryService) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe( params => {
			const id = params['id'];
			this.deliveryService.idOrder = id;
				this.confirmService.getConfirmById(id).subscribe(
					result => {
						this.confirmHeaderA = result;
					}
				);
				this.orderService.getOrderByOrder(id).subscribe(
					result => {
						this.confirmHeaderB = result;
						this.getCustomer(this.confirmHeaderB.id_customer);
						this.getOngkir(this.confirmHeaderB.id_ongkir);
					}
				);
		});
		const unique = '1234567890';
		const lengthOfUnique = 2;
		this.makeUnique(lengthOfUnique, unique);
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadOrdersList())
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadOrdersList();
			})
		)
		.subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Orders');

		// Init DataSource
		this.dataSource = new OrdersDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.ordersResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectOrdersPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadOrdersList();
			}); // Remove this line, just loading imitation
		});
		this.subscriptions.push(routeSubscription);
	}

	makeUnique(lengthOfUnique: number, unique: string) {
		for (let i = 0; i < lengthOfUnique; i++) {
			this.pay += unique.charAt(Math.floor(Math.random() * unique.length));
		}
		return this.pay;
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Load Orders List
	 */
	loadOrdersList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new OrdersPageRequested({ page: queryParams }));
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
		filter.customerName = searchText;
		filter.total = searchText;

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
	 * confirm Payment
	 *
	 * @param _item: ConfirmModel
	 */
	confirmPayment(id: number) {
		const date = this.datePipe.transform(this.confirmHeaderB.create_at, 'yyyyMMdd');
		const create_at = this.datePipe.transform(this.confirmHeaderB.create_at, 'yyyy-MM-dd');
		const unique = +this.pay;
		const data = {
			id: {id},
			invoice: 'INV|' + date + '|' + unique + '|' + this.confirmHeaderB.id_order,
			id_order: this.confirmHeaderB.id_order,
			create_at: {create_at}
		};
		// console.log(data);
		/*
		return this.confirmService.confirmPayment(data).subscribe(
			res => {
				this.message = res;
				this.router.navigate(['admin/order/confirm']);
			}
		);
		*/
	}

	backPage() {
		this.location.back();
	}

	/**
	 * Fetch selected orders
	 */
	fetchOrders() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.id_order}`,
				id: elem.id,
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

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
		const numRows = this.ordersResult.length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection
	 */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.ordersResult.forEach(row => this.selection.select(row));
		}
	}

	/* UI */
	/**
	 * Return Customer Name
	 */
	getCustomer(id: number) {
		this.customerService.getCustomerById(id).subscribe(
			res => {
				this.customer = res;
			}
		);
	}

	/**
	 * Return ongkir
	 */
	getOngkir(id: number) {
		this.shippingService.getShippingById(id).subscribe(
			result => {
				this.ongkir = result;
				// console.log(this.ongkir[0]);
			}
		);
	}

	/**
	 * Returns status string
	 *
	 * @param status: number
	 */
	getStatusString(status: number): string {
		switch (status) {
			case 0:
				return 'Waitting for Payment';
			case 1:
				return 'Process Order';
		}
		return '';
	}

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
				return 'accent';
			case 1:
				return 'primary';
		}
		return '';
	}
}
