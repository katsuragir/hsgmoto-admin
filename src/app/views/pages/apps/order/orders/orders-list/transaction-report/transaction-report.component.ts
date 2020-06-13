
// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog, MatDialogRef } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, delay, first } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../../core/reducers';
// UI
import { SubheaderService } from '../../../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../../../core/_base/crud';
// Services and Models
import {
	ReportModel,
	ReportsPageRequested,
	OneReportDeleted,
	ManyReportsDeleted,
	ReportsParentUpdated,
	reportsReducer
} from '../../../../../../../core/order';
import {
	CustomerService
} from '../../../../../../../core/customer';
import { selectReportsPageLastQuery } from '../../../../../../../core/order/_selectors/report.selectors';
import { ReportsDataSource } from '../../../../../../../core/order/_data-sources/reports.datasource';
// import { element } from '@angular/core/src/render3';
import { TranslateService } from '@ngx-translate/core';
import { DeliveryService, NotifService, ReportService } from '../../../../../../../core/order/_services';
import { currentUser, User } from '../../../../../../../core/auth';
import { DOCUMENT, DatePipe } from '@angular/common';
// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-transaction-report',
	templateUrl: './transaction-report.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
	})
export class TransactionReportComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: ReportsDataSource;
	displayedColumns = [ 'date', 'status', 'total', 'count' ];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	filterParent: string = '';
	filterName: string = '';
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<ReportModel>(true, []);
	reportsResult: ReportModel[] = [];
	private subscriptions: Subscription[] = [];
	test: any;
	isAdmin: any;
	user$: User;
	filterStatus: string = '';
	filterDate: string = '';
	result: any;
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
		private translate: TranslateService,
		private customerService: CustomerService,
		private deliveryService: DeliveryService,
		private notifService: NotifService,
		private datePipe: DatePipe,
		private reportService: ReportService,
		public dialogRef: MatDialogRef<TransactionReportComponent>,
		@Inject(DOCUMENT) private document: Document) { }

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
			tap(() => this.loadReportsList())
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadReportsList();
			})
		)
		.subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Reports');

		// Init DataSource
		this.dataSource = new ReportsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.reportsResult = res;
			if (res.length > 0) {
				this.found = true;
			} else {
				this.found = false;
			}
		});
		// console.log(this.dataSource);
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectReportsPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadReportsList();
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
	 * Load Reports List
	 */
	loadReportsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new ReportsPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/**
	 * Load Reports Month List
	 */
	loadReportsMonthList() {
		if (!this.filterStatus || this.filterStatus === '' || this.filterStatus === null || this.filterStatus === undefined) {
			const reportAll = {
				month: null,
				date: null
			};

			this.reportService.report = reportAll;
			this.loadReportsList();
		} else {
			this.selection.clear();
			const queryParams = new QueryParamsModel(
				this.filterConfiguration(),
				this.sort.direction,
				this.sort.active,
				this.paginator.pageIndex,
				this.paginator.pageSize
			);
			// Call request from server
			const report = {
				month: this.filterStatus,
				date: null
			};

			this.reportService.report = report;
			this.store.dispatch(new ReportsPageRequested({ page: queryParams }));
			this.selection.clear();
		}

	}

	/**
	 * Load Reports Date List
	 */
	loadReportsDateList() {
		console.log('test');
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		const report = {
			month: null,
			date: this.searchInput.nativeElement.value
		};

		this.reportService.report = report;
		this.store.dispatch(new ReportsPageRequested({ page: queryParams }));
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

		filter.id_report = searchText;
		filter.customerName = searchText;
		filter.total = searchText;
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



		if (queryParams.filter.name) {
			this.searchInput.nativeElement.value = queryParams.filter.name;
		}
	}

	/** ACTIONS */

	/**
	 * Fetch selected reports
	 */
	fetchReports() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.status}`,
				id: elem.id,
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	/**
	 * Check all rows are selected
	 */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.reportsResult.length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection
	 */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.reportsResult.forEach(row => this.selection.select(row));
		}
	}

	/* UI */
	close() {
		this.dialogRef.close();
	}
	/**
	 * Returns CSS Class by condition
	 *
	 * @param condition: number
	 */
	getItemCssClassByCondition(condition): string {
		switch (condition) {
			case 'Waiting Payment':
				return 'accent';
			case 'On Process':
				return 'drakblue';
			case 'Sending':
				return 'abuabu';
			case 'Order Received on Customer':
				return 'success';
			case 'Verification Payment':
				return 'orange';
			case 'Accepted Payment':
				return 'green';
			case 'Cancel Payment':
				return 'red';
		}
		return '';
	}
}
