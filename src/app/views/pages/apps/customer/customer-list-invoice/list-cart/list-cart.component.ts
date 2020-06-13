// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, Injectable, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { LayoutUtilsService, MessageType, QueryParamsModel, HttpUtilsService } from '../../../../../../core/_base/crud';
// Services and Models
import {
	ConfirmModel,
	ConfirmService,
	OrderService,
	ShippingService,
	DeliverysDataSource,
	DeliverysPageRequested,
	DeliveryModel,
	selectDeliverysPageLastQuery,
} from '../../../../../../core/order';
import {
	CustomerService,
} from '../../../../../../core/customer';
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
	selector: 'kt-list-cart',
	templateUrl: './list-cart.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	})
export class ListCartComponent implements OnInit, OnDestroy {
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
	@Input() dataSource: DeliverysDataSource;
	dataSourceCart: DeliveryModel[] = [];
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
	test: any;
	statusForm: FormGroup;
	district: any;
	inputResi: boolean;
	cekConfirm: boolean;
	invoice: any;
	result: any;
	ongkos: any;
	selected: any;
	private localURl: string;
	noResi: any;

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
		private store: Store<AppState>,
		private domainLocal: HttpUtilsService,
		private deliveryService: DeliveryService,

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

	refreshData() {
		// Init DataSource
		this.dataSource = new DeliverysDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.deliverysResult = res;
			// console.log(this.deliverysResult);
		});
		this.loadDeliverysList();
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
	 * CLose List
	 */
	closeList() {

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
}
