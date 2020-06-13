// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
// Material
import { MatPaginator, MatSort, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
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
	selectDeliverysPageLastQuery
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

// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-invoice-detail',
	templateUrl: './invoice-detail.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
	})
export class InvoiceDetailComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: DeliverysDataSource;
	displayedColumns = [ 'ID', 'Image', 'Product', 'Weight', 'Price', 'Quantity', 'Sub Total', 'Total'];
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
	private localURl: string;

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
	constructor(public dialogRef: MatDialogRef<InvoiceDetailComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
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
		private domainLocal: HttpUtilsService
		) { this.localURl = this.domainLocal.domain; }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
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
		this.subheaderService.setTitle('Detail Invoice');

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

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
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
		this.deliveryService.idOrder = this.data.inv.id_order;
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

	backPage() {
		this.location.back();
	}

	/**
	 * Fetch selected deliverys
	 */
	fetchDeliverys() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.prodName}`,
				id: elem.id_product,
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

}
