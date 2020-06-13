// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, delay } from 'rxjs/operators';
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
	InvoiceModel,
	InvoicesPageRequested,
	OneInvoiceDeleted,
	ManyInvoicesDeleted,
	InvoicesParentUpdated,
	invoicesReducer,
	InvoiceService,
	selectInvoicesPageLastQuery,
	InvoicesDataSource
} from '../../../../../core/order';
// import { element } from '@angular/core/src/render3';
import { TranslateService } from '@ngx-translate/core';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-invoice-list',
	templateUrl: './invoice-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
	})
export class InvoicesListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: InvoicesDataSource;
	displayedColumns = ['ID', 'Invoice ID', 'Order ID', 'name', 'Status', 'date'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	filterParent: string = '';
	filterName: string = '';
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<InvoiceModel>(true, []);
	invoicesResult: InvoiceModel[] = [];
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
	constructor(
		public dialog: MatDialog,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private invoiceService: InvoiceService,
		private translate: TranslateService
		) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {

		// If the user changes the sort invoice, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadInvoicesList())
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadInvoicesList();
			})
		)
		.subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Invoices');

		// Init DataSource
		this.dataSource = new InvoicesDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.invoicesResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectInvoicesPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadInvoicesList();
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
	 * Load Invoices List
	 */
	loadInvoicesList() {
		this.selection.clear();

		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new InvoicesPageRequested({ page: queryParams, params: 'invoice' }));
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

		filter.invoice = searchText;
		filter.id_order = searchText;
		// filter.price = searchText;
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
	viewOrder(inv: InvoiceModel) {
		this.router.navigate(['/vp-admin/order/orders/view', inv.id_order], { relativeTo: this.activatedRoute });
	}

	/**
	 * View Chart
	 */

	viewCart(inv: InvoiceModel) {
		let saveMessageTranslateParam = 'SUCCESS ';
		saveMessageTranslateParam = inv.id_order ? 'SELECT PRODUCT DISCOUNT' : '';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam);
		const _messageType = inv.id_order ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(InvoiceDetailComponent, { data: { inv }, width: '1000px' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType);
			this.loadInvoicesList();
		});
	}
	/**
	 * Delete invoice
	 *
	 * @param _item: InvoiceModel
	 */

	deleteInvoice(invoice: InvoiceModel) {
		const _title: string = 'Invoice Delete';
		const _description: string = 'Are you sure to permanently delete this invoice?';
		const _waitDesciption: string = 'Invoice is deleting...';
		const _deleteMessage = `Invoice has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneInvoiceDeleted({ id: invoice.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});

	}

	/**
	 * Delete invoices
	 */
	deleteInvoices() {
		const _title: string = 'Invoices Delete';
		const _description: string = 'Are you sure to permanently delete selected invoices?';
		const _waitDesciption: string = 'Invoices are deleting...';
		const _deleteMessage = 'Selected invoices have been deleted';

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
			this.store.dispatch(new ManyInvoicesDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
		});

	}

	/**
	 * Fetch selected invoices
	 */
	fetchInvoices() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.invoice}`,
				id: elem.id_order,
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	/**
	 * Redirect to edit page
	 *
	 * @param id: any
	 */
	editInvoice(id) {
		this.router.navigate(['../invoice/detail', id], { relativeTo: this.activatedRoute });
	}

	/**
	 * Check all rows are selected
	 */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.invoicesResult.length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection
	 */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.invoicesResult.forEach(row => this.selection.select(row));
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
