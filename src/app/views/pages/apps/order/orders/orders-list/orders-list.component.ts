
// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, Inject } from '@angular/core';
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
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../../core/_base/crud';
// Services and Models
import {
	OrderModel,
	OrdersPageRequested,
	OneOrderDeleted,
	ManyOrdersDeleted,
	OrdersParentUpdated,
	ordersReducer,
	OrderService,
} from '../../../../../../core/order';
import {
	CustomerService
} from '../../../../../../core/customer';
import { selectOrdersPageLastQuery } from '../../../../../../core/order/_selectors/order.selectors';
import { OrdersDataSource } from '../../../../../../core/order/_data-sources/orders.datasource';
// import { element } from '@angular/core/src/render3';
import { TranslateService } from '@ngx-translate/core';
import { DeliveryService, NotifService, ReportService } from '../../../../../../core/order/_services';
import { currentUser, User } from '../../../../../../core/auth';
import { DOCUMENT, DatePipe } from '@angular/common';
import { TransactionReportComponent } from './transaction-report/transaction-report.component';

// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-orders-list',
	templateUrl: './orders-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
	})
export class OrdersListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: OrdersDataSource;
	displayedColumns = [ 'Order ID', 'customer', 'courier', 'phone', 'total', 'payment', 'status', 'date', 'pay', 'actions'];
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
	isAdmin: any;
	user$: User;
	filterStatus: string = '';
	result: any;

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
		private orderService: OrderService,
		private translate: TranslateService,
		private customerService: CustomerService,
		private deliveryService: DeliveryService,
		private notifService: NotifService,
		private datePipe: DatePipe,
		private reportService: ReportService,
		@Inject(DOCUMENT) private document: Document) { }

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
		this.catagoryService.getCategoryById(this.order.id_category).subscribe(
			res => {
				this.categoryName = res;
			},
			err => console.log(err)
		);
		*/
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
		// console.log(this.dataSource);
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
		this.store.pipe(select(currentUser), first(res => {
			return res !== undefined;
		})
		).subscribe(result => {
			this.user$ = result;
			this.isAdmin = this.user$.roles;
		});
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

		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}

		if (this.filterParent && this.filterParent.length > 0) {
			filter.parent = +this.filterParent;
		}

		filter.id_order = searchText;
		filter.customerName = searchText;
		filter.total = searchText;
		filter.nameReceive = searchText;
		filter.phone = searchText;
		filter.email = searchText;
		// filter.barcode = searchText;

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

		if ('status' in queryParams.filter) {
			this.filterStatus = queryParams.filter.status.toString();
		}


		if (queryParams.filter.name) {
			this.searchInput.nativeElement.value = queryParams.filter.name;
		}
	}

	/** ACTIONS */
	/**
	 * Redirect to edit page
	 *
	 * @param id: any
	 */
	viewOrder(id) {
		this.orderService.idOrder = id;
		this.deliveryService.idOrder = id;
		this.router.navigate(['../orders/view', id], { relativeTo: this.activatedRoute });
	}
	/**
	 * Delete order
	 *
	 * @param _item: OrderModel
	 */

	deleteOrder(order: OrderModel) {
		const _title: string = 'Order Delete';
		const _description: string = 'Are you sure to permanently delete this order?';
		const _waitDesciption: string = 'Order is deleting...';
		const _deleteMessage = `Order has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneOrderDeleted({ id: order.id_order }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});

	}

	/**
	 * Delete orders
	 */
	deleteOrders() {
		const _title: string = 'Orders Delete';
		const _description: string = 'Are you sure to permanently delete selected orders?';
		const _waitDesciption: string = 'Orders are deleting...';
		const _deleteMessage = 'Selected orders have been deleted';

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
			this.store.dispatch(new ManyOrdersDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
		});

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
	 * Update status dialog
	 */
	updateParentForOrders(order: OrderModel) {
		const _title = 'Update Parent for selected categories';
		const _updateMessage = 'Parent has been updated for selected categories';
		const id = order.id;
		const name = order.id_order;
		// tampil di list
		const _statuses = [{ value: `${id}`, text: `${name}` }];
		const _messages = [];

		this.selection.selected.forEach(elem => {
			_messages.push({
				text: `${elem.id_order}`,
				id: elem.id,
			});
		});

		const dialogRef = this.layoutUtilsService.updateStatusForEntities(_title, _statuses, _messages);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.selection.clear();
				return;
			}

			this.store.dispatch(new OrdersParentUpdated({
				id_parent: +res,
				orders: this.selection.selected
			}));

			this.layoutUtilsService.showActionNotification(_updateMessage, MessageType.Update);
			this.selection.clear();
		});
	}

	/**
	 * status action
	 */
	waitPay(order: OrderModel) {
		const _title: string = `Order ID : ${order.id_order}`;
		const _description: string = `Payment Not Completed`;
		const _waitDesciption: string = 'Payment Not Completed...';
		const _Message = ``;

		const dialogRef = this.layoutUtilsService.MessageElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.layoutUtilsService.showActionNotification(_Message);
		});
	}
	/*
	orderPro(order) {
		this.orderService.idOrder = order;
		this.deliveryService.idOrder = order;
		this.router.navigate(['../orders/view', order], { relativeTo: this.activatedRoute });
	}

	comfPay(order) {
		this.router.navigate(['../confirm/check', order], { relativeTo: this.activatedRoute });
	}
	*/
	/**
	 * cancel
	 */
	cancel(order: OrderModel) {
		const _title: string = 'Cancel Order';
		const _description: string = 'Are you sure to cancel this order?';
		const _waitDesciption: string = 'Cancelling Order...';
		const _deleteMessage = `Order has been Cancelled`;

		const dialogRef = this.layoutUtilsService.cancelElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const cancel = {
				// tslint:disable-next-line: object-literal-shorthand
				id_order: order.id_order,
				st: 6,
				ad: this.user$.fullname
			};
			this.orderService.updatestatus(cancel).subscribe(
				result => {
					this.result = result;
					this.ngOnInit();
					this.notifService.getAllCheckoutNotif();
					// this.router.navigate(['admin/order/orders']);
				}
			);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
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
	 * Reminder Whatapp
	 */
	reminder(order) {
		const date = order.create_at;
		let amount = '';
		if (order.amountv) {
			amount = order.amountv;
		} else {
			amount = order.total;
		}
		const quote = 'WE ARE SERVE BETTER';
		// tslint:disable-next-line: max-line-length
		return window.open(`https://wa.me/${order.phone}?text=Hai%20Vapehan%20Friend%2C%0A%0ATerima%20kasih%20sudah%20berbelanja%20di%20website%20kita%0ADengan%20Nomor%20transaksi%20%3A%20%2A${order.id_order}%2A%0ATanggal%20%3A%20%2A${date}%2A%0ATotal%20Belanja%20%3A%20%2A${amount}%2A%0A%0AApabila%20belum%20melakukan%20pembayaran%2C%20segera%20lakukan%20pembayaran%20ya%20friend%2C%0Asebelum%20barang%20nya%20kehabisan%2C%0ADan%20apabila%20ada%20kendala%20dalam%20proses%2C%2C%20bisa%20hubungi%20Vapehan%20Team%20CS%2C%20Kami%20akan%20menghubungi%20friend%20secepatnya%0A%0AHappy%20vaping%0A%0A%2A${quote}%2A%0A%0ATerima%20kasih%2C%0AVapehan%20Team%20CS`, '_blank');
	}

	/**
	 * Return Customer Name
	 */
	getCustomer(id: number) {
		return this.customerService.getCustomerById(id).subscribe(
			res => {
				const firstname: string = res.firstname;
				// console.log(firstname);
				return firstname;
			}
		);
	}
	/**
	 * Returns status string
	 *
	 * @param status: number
	 */
	getItemStatusString(parent): string {
		console.log(parent);
		switch (parent) {
			case '0':
				return 'Cancel Payment';
			case '01':
				return 'BCA Transfer';
			case '41':
				return 'Mandiri VA';
			case '15':
				return 'Credit Card Visa/Master/JCB';
			case '16':
				return 'Credit Cart';
			case '04':
				return 'Doku Wallet';
			case '33':
				return 'Danamon VA';
			case '32':
				return 'CIMB VA';
			case '26':
				return 'Danamon Internet Banking';
			case '25':
			return 'Muamalat Internet Banking';
			case '19':
				return 'CIMB Clicks';
			case '35':
				return 'Alfa VA';
		}
		return '';
	}

	/**
	 * Returns CSS Class by status
	 *
	 * @param status: number
	 */
	getItemCssClassByStatus(status: string): string {
		switch (status) {
			case 'BCA':
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
				return 'Verification Payment';
			case 2:
				return 'Accept Payment';
			case 3:
				return 'On Process';
			case 4:
				return 'Sending';
			case 5:
				return 'Order Received';
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
				return 'orange';
			case 2:
				return 'green';
			case 3:
				return 'drakblue';
			case 4:
				return 'abuabu';
			case 5:
				return 'success';
			case 6:
				return 'red';
		}
		return '';
	}

	/**
	 * Transaction Report
	 */

	report() {
		const report = {
			month: null,
			date: null
		};

		this.reportService.report = report;

		let saveMessageTranslateParam = 'SUCCESS ';
		// saveMessageTranslateParam = inv.id_order ? 'TRANSACTION REPORT' : '';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam);
		// const _messageType = inv.id_order ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(TransactionReportComponent, { width: '1000px' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			// this.layoutUtilsService.showActionNotification(_saveMessage, _messageType);
			this.loadOrdersList();
		});
	}
}
