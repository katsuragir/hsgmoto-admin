// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, delay, first } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription, BehaviorSubject } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
// UI
import { SubheaderService } from '../../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, MessageType, QueryParamsModel, HttpUtilsService } from '../../../../../../core/_base/crud';
// Services and Models
import {
	ConfirmModel,
	ConfirmService,
	OrderModel,
	OrderService,
	ShippingService,
	OrdersPageRequested,
	OrdersDataSource,
	selectOrdersPageLastQuery,
	DeliverysDataSource,
	DeliverysPageRequested,
	DeliveryModel,
	selectDeliverysPageLastQuery,
	InvoiceModel
} from '../../../../../../core/order';
import {
	CustomerService,
} from '../../../../../../core/customer';
import { selectConfirmsPageLastQuery } from '../../../../../../core/order/_selectors/confirm.selectors';
import { ConfirmsDataSource } from '../../../../../../core/order/_data-sources/confirms.datasource';
// import { element } from '@angular/core/src/render3';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DeliveryService, InvoiceService } from '../../../../../../core/order/_services';
import { currentUser, User, CompanyService } from '../../../../../../core/auth';
import * as $ from 'jquery';

// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-view-order',
	templateUrl: './view-order.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
	})
export class ViewOrderComponent implements OnInit, OnDestroy {
	selectedTab: number = 0;
	confirm: ConfirmModel;
	orderHeaderA: any;
	delivery: DeliveryModel;
	deliveries: any;
	hasFormErrors: boolean = false;
	loadingSubject =  new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	customer: any;
	ongkir: any;
	message: any;
	loading = false;
	public pay = '';
	// Table fields
	dataSource: DeliverysDataSource;
	displayedColumns = [ 'ID', 'Image', 'Product', 'Weight', 'Price', 'Quantity', 'Stock', 'Sub Total', 'Total'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	filterParent: string = '';
	filterName: string = '';
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<DeliveryModel>(true, []);
	deliverysResult: DeliveryModel[] = [];
	private subscriptions: Subscription[] = [];
	test: any;
	statusForm: FormGroup;
	district: any;
	inputResi: boolean;
	cekConfirm: boolean;
	result: any;
	ongkos: any;
	selected: any;
	private localURl: string;
	noResi: any;
	user$: User;
	isAdmin: any = [];
	invoice: any[] = [];
	company: any;
	dateorder: any;
	payment: any;
	invoiceid: any;
	weight: any;
	total: any;
	courier: any;
	service: any;
	totalall: any;
	payid: any;
	vid: any;
	vname: any;
	amountv: any;
	potongan: any;
	subtotal: any;
	layanan: any;

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
		private statusFB: FormBuilder,
		private http: HttpClient,
		private deliveryService: DeliveryService,
		private invoiceService: InvoiceService,
		private domainLocal: HttpUtilsService,
		private companyService: CompanyService,
		) {
			this.localURl = this.domainLocal.domain;
			this.store.pipe(select(currentUser), first(res => {
				return res !== undefined;
			})
			).subscribe(result => {
				this.user$ = result;
				this.isAdmin = this.user$.roles;
			});
		}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.inputResi = false;
		this.cekConfirm = false;
		this.activatedRoute.params.subscribe( params => {
			const id = params['id'];
			this.deliveryService.idOrder = id;
				this.orderService.getOrderByOrder(id).subscribe(
					result => {
						this.orderHeaderA = result;
						this.selected = this.orderHeaderA.status.toString();
						this.initStatus();
						this.getInvoice(result.id_order);
						// this.getCustomer(result.id_customer);
						this.getShipping(result.id_order);
						// console.log(this.orderHeaderA);
						if (result.status === 0) {
							this.cekConfirm = true;
						}
						/*
						this.getDelivery(this.order.id_order);
						this.getCustomer(this.order.id_customer);
						this.getOngkir(this.order.id_ongkir);
						this.getInvoice(this.order.id_order);
						this.initStatus();
						*/
					}
				);
				this.getCustomer(id);
				this.getCompanyInfo();
		});
		const unique = '1234567890';
		const lengthOfUnique = 2;
		this.makeUnique(lengthOfUnique, unique);
		// If the user changes the sort delivery, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadDeliverysList())
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadDeliverysList();
			})
		)
		.subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('View Order');

		// Init DataSource
		this.dataSource = new DeliverysDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.deliverysResult = res;
			// console.log(this.deliverysResult);
		});
		// console.log(this.dataSource);
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectDeliverysPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadDeliverysList();
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
		this.loading = false;
	}

	/**
	 * initStatus
	 */
	initStatus() {
		// console.log(this.orderHeaderA.status);
		this.statusForm = this.statusFB.group({
			status: [this.orderHeaderA.status.toString(), [Validators.min(0), Validators.max(5)]],
			rest: ['']
		});
	}

	/**
	 * Load Deliveries List
	 */
	loadDeliverysList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new DeliverysPageRequested({ page: queryParams }));
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

		filter.name = searchText;
		filter.stock = searchText;
		filter.price = searchText;
		filter.barcode = searchText;

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
	 * Print
	 */
	print() {
		window.open(`https://www.hsgmoto.com/shop/print/invoice/${this.orderHeaderA.id_order}/${this.customer.accessToken}`, '_blank');
	}

	/**
	 *
	 */
	onOption(option, order) {
		// console.log(option);
		const controls = this.statusForm.controls;
		this.inputResi = false;
		switch (option) {
			case '1':
				const _title3: string = 'Change Order :';
				const _description3: string = 'Are you sure to change status this order?';
				const _waitDesciption3: string = 'Change status order...';
				const _deleteMessage3 = `Change Order Status Success`;
				const flag2 = 'confirm';

				const confirm = {
					id_order: order.id_order,
					st: 1,
					// shipping: 1,
					ad: this.user$.fullname
				};
				// console.log(update);

				const dialogRef3 = this.layoutUtilsService.ApproveorderElement(_title3, _description3, _waitDesciption3, confirm, flag2);
				dialogRef3.afterClosed().subscribe(res => {
					if (!res) {
						this.ngOnInit();
						return;
					}

					// console.log(update);
					this.orderService.updateorderconfirm(confirm).subscribe(
						result => {
							this.message = result;
							// this.router.navigate(['vp-admin/order/orders']);
						}
					);

					this.layoutUtilsService.showActionNotification(_deleteMessage3, MessageType.Delete);
				});

				break;
			case '2':

				const _title1: string = 'Confirmation Approved Order :';
				const _description1: string = 'Are you sure to approve this order?';
				const _waitDesciption1: string = 'Approving order...';
				const _deleteMessage1 = `Approve Order Success`;
				const flag = 'approve';

				const update = {
					// tslint:disable-next-line: object-literal-shorthand
					id_order: order.id_order,
					st: controls['status'].value,
					ad: this.user$.fullname
					// dt: this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')
				};
				// console.log(update);

				const dialogRef1 = this.layoutUtilsService.ApproveorderElement(_title1, _description1, _waitDesciption1, update, flag);
				dialogRef1.afterClosed().subscribe(res => {
					if (!res) {
						this.ngOnInit();
						return;
					}

					// console.log(update);
					this.orderService.accPayment(update).subscribe(
						result => {
							this.result = result;
							// this.router.navigate(['vp-admin/order/orders']);
						}
					);

					this.layoutUtilsService.showActionNotification(_deleteMessage1, MessageType.Delete);
				});
				break;
			case '3':
				// console.log(option);
				const date = this.datePipe.transform(this.orderHeaderA.create_at, 'yyMMdd');
				const create = this.datePipe.transform(this.orderHeaderA.create_at, 'yyyy-MM-dd');
				const invoice = {
					invoice: 'INV.' + date + '.' + 'HM' + '.' + this.orderHeaderA.id_order,
					id_order: this.orderHeaderA.id_order,
					create_at: create
				};
				const address = this.district;
				this.confirmService.confirmPayment(invoice, address).subscribe(
					res => {
						this.message = res;
						// this.router.navigate(['vp-admin/order/orders']);
					}
				);

				break;
				case '4':
					const _title: string = 'Please Input No Resi';
					const _description: string = 'Create Receipt Sending';
					const _waitDesciption: string = 'Creating Receipt Sending...';
					const _deleteMessage = `Create Recaipt Sending Success`;
					const data = {
						// tslint:disable-next-line: object-literal-shorthand
						id_order: order.id_order,
						status: controls['status'].value,
						rest: controls['rest'].value,
						id_invoice: this.invoice[0].invoice,
						param: 'create'
					};

					const dialogRef = this.layoutUtilsService.CreteResiElement(_title, _description, _waitDesciption, data);
					dialogRef.afterClosed().subscribe(res => {
						if (!res) {
							return;
						}

						this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					});

				break;
			case '5':
				const _title2: string = 'Confirmation Order Received on Customer :';
				const _description2: string = 'Are you sure to confirm this order?';
				const _waitDesciption2: string = 'Change status order...';
				const _deleteMessage2 = `Change Order Status Success`;
				const flag1 = 'delivered';

				const done = {
					id: order.id_order,
					order: 5,
					shipping: 1,
					ad: this.user$.fullname
				};
				// console.log(update);

				const dialogRef2 = this.layoutUtilsService.ApproveorderElement(_title2, _description2, _waitDesciption2, done, flag1);
				dialogRef2.afterClosed().subscribe(res => {
					if (!res) {
						this.ngOnInit();
						return;
					}

					// console.log(update);
					this.deliveryService.updateDelivery(done).subscribe(
						result => {
							this.message = result;
							// this.router.navigate(['vp-admin/order/orders']);
						}
					);

					this.layoutUtilsService.showActionNotification(_deleteMessage2, MessageType.Delete);
				});

				break;
			case '6':
				const cancel = {
					// tslint:disable-next-line: object-literal-shorthand
					id_order: order.id_order,
					st: controls['status'].value,
					ad: this.user$.fullname
				};
				this.orderService.updatestatus(cancel).subscribe(
					result => {
						this.result = result;
						// this.router.navigate(['vp-admin/order/orders']);
					}
				);
			break;
		}

	}

	/**
	 * confirm Payment
	 *
	 * @param _item: ConfirmModel
	 */
	confirmPayment(id: number) {
		this.router.navigate(['vp-admin/order/confirm']);
	}

	/**
	 * Change Status
	 */
	/*
	changeStatus(id_order) {
		const controls = this.statusForm.controls;

		this.loading = true;

		if (controls['status'].value === '5') {
			const data = {
				// tslint:disable-next-line: object-literal-shorthand
				id_order: id_order,
				status: controls['status'].value,
			};
			// console.log(data);
			this.orderService.updatestatus(data).subscribe(
				result => {
					this.result = result;
					this.router.navigate(['admin/order/orders']);
				}
			);
		} else if (controls['status'].value === '1') {
			const date = this.datePipe.transform(this.orderHeaderA.create_at, 'yyyyMMdd');
			const create = this.datePipe.transform(this.orderHeaderA.create_at, 'yyyy-MM-dd');
			const data = {
				invoice: 'INV|' + date + '|' + this.orderHeaderA.payid + '|' + this.orderHeaderA.id_order,
				id_order: this.orderHeaderA.id_order,
				create_at: create
			};
			// console.log(data);
			return this.confirmService.confirmPayment(data).subscribe(
				res => {
					this.message = res;
					this.router.navigate(['admin/order/orders']);
				}
			);
		} else if (controls['status'].value === '2') {

		} else if (controls['status'].value === '3') {

		}

	}
	*/

	/**
	 * Checking control validation
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.statusForm.controls[controlName];
		if (!control) {
			return false;
		}

		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}

	backPage() {
		this.location.back();
	}

	/**
	 * Fetch selected deliverys
	 */
	/*
	fetchDeliverys() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.resi}`,
				id: elem.id,
			});
		});
		this.layoutUtilsService.fetchElements(messages);
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
		const numRows = this.deliverysResult.length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection
	 */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.deliverysResult.forEach(row => this.selection.select(row));
		}
	}

	/* UI */
	/**
	 * Cek Resi
	 */
	cekResi(order) {
		// console.log(order);
		const _title: string = 'Cek Nomor Resi';
		const _description: string = 'Cek Nomor Resi';
		const _waitDesciption: string = 'Cek Resi...';
		const _deleteMessage = `Cek Resi Selesai`;
		const data = {
			resi: order.resi,
			courier: order.kurir.toLowerCase(),
			param: 'cek'
		};

		return this.orderService.cekResi(data).subscribe(
			result => {
				console.log(result);
				if (result.rajaongkir.status.code === 400) {
					this.layoutUtilsService.showActionNotification('Cek Resi Fail', MessageType.Delete);
					return;
				}

				const data1 = {
					rajaongkir: result.rajaongkir,
					param: 'cek',
					order: order
				};

				const dialogRef = this.layoutUtilsService.CreteResiElement(_title, _description, _waitDesciption, data1);
				dialogRef.afterClosed().subscribe(res => {
					if (!res) {
						return;
					}

					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				});
			}
		);
	}

	/**
	 * Return Customer Name
	 */
	getCustomer(id) {
		this.orderService.getCustomerOrderByCustomer(id).subscribe(
			res => {
				this.customer = res;
				// this.getDistrict(this.customer.id_city, this.customer.id_district);
			}
		);
	}

	/**
	 * Return Shipping
	 */
	getShipping(id) {
		this.shippingService.getShippingByorder(id).subscribe(
			res => {
				if (!res) {
					return this.noResi = '';
				}
				this.noResi = res.resi;
				// console.log(this.noResi);
			}
		);
	}

	/**
	 * Return Delivery
	 */
	getDelivery(id) {
		this.orderService.getDetailOrderByOrder(id).subscribe(
			res => {
				this.deliveries = res;
				// console.log(this.delivery);
			}
		);
	}

	/**
	 * Return District
	 */
	getDistrict(city, district) {
		this.shippingService.getDistrict(city, district).subscribe(
			result => {
				this.district = result.result;
				// console.log(this.district);
			}
		);
	}

	/**
	 * Return ongkir
	 */
	/*
	getOngkir(id: number) {
		this.shippingService.getShippingById(id).subscribe(
			result => {
				this.ongkir = result;
				// console.log(this.ongkir[0]);
			}
		);
	}
	*/

	/**
	 * Return invoice
	 */
	getInvoice(id) {
		this.invoiceService.getInvoiceByOrder(id).subscribe(
			result => {
				if (result.text === 'Invoice doesnt exists') {
					return this.invoice = [];
				} else {
					// this.invoice = result[0].invoice;
					this.invoice = result;
					this.dateorder = result[0].date_order;
					this.payment = result[0].payment;
					this.invoiceid = result[0].invoice;
					this.weight = result[0].weight;
					this.total = result[0].total;
					this.courier = result[0].namaongkir;
					this.service = result[0].ongkirService;
					this.ongkir = result[0].ongkir;
					this.totalall = result[0].totalall;
					this.payid = result[0].payid;
					this.vid = result[0].voucherid;
					this.vname = result[0].vouchername;
					this.amountv = result[0].amountv;
					this.potongan = result[0].harga_disc;
					this.subtotal = result[0].subtotal;
					this.layanan = result[0].layanan;
				}
				// console.log(this.invoice);
			}
		);

	}

	getCompanyInfo() {
		this.companyService.getCompanyProfile().subscribe(
			result => {
			this.company = result;
			}
		);
	}

	/**
		* Returns status string
	 *
	 * @param status: number
	 */
	getItemStatusString(parent): string {
		switch (parent) {
		 case '0':
			 return 'No Payment Selected';
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
	 * get title
	 */
	getComponentTitle() {
		let result = 'View Order';
		if (!this.orderHeaderA || !this.orderHeaderA.id_order) {
			return result;
		}

		result = `${this.orderHeaderA.id_order} - ${this.orderHeaderA.customerName}`;
		return result;
	}
}
