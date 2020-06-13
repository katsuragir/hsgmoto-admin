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
	CustomerModel,
	CustomersPageRequested,
	OneCustomerDeleted,
	ManyCustomersDeleted,
	CustomersParentUpdated,
	customersReducer,
	CustomerService,
	ListInvService,
} from '../../../../../core/customer';
import { selectCustomersPageLastQuery } from '../../../../../core/customer/_selectors/customer.selectors';
import { CustomersDataSource } from '../../../../../core/customer/_data-sources/customers.datasource';
// import { element } from '@angular/core/src/render3';
import { TranslateService } from '@ngx-translate/core';
import { currentUser } from '../../../../../core/auth';
// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-customer-list',
	templateUrl: './customer-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
	})
export class CustomersListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: CustomersDataSource;
	displayedColumns = ['select', 'Customer ID', 'fullname', 'email', 'phone', 'status', 'veri', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	filterParent: string = '';
	filterName: string = '';
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<CustomerModel>(true, []);
	customersResult: CustomerModel[] = [];
	private subscriptions: Subscription[] = [];
	test: any;
	isAdmin: any = [];
	isButtonVisible = false;

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
		private customerlistInv: ListInvService) { }

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
		this.catagoryService.getCategoryById(this.customer.id_category).subscribe(
			res => {
				this.categoryName = res;
			},
			err => console.log(err)
		);
		*/
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
		this.subheaderService.setTitle('Customers');

		// Init DataSource
		this.dataSource = new CustomersDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.customersResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectCustomersPageLastQuery)).subscribe(res => this.lastQuery = res);
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
		this.store.dispatch(new CustomersPageRequested({ page: queryParams }));
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

		filter.firstname = searchText;
		filter.lastname = searchText;
		filter.email = searchText;
		filter.phone = searchText;

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

		if (queryParams.filter.fullname) {
			this.searchInput.nativeElement.value = queryParams.filter.fullname;
		}
	}

	/** ACTIONS */
	/**
	 * Delete customer
	 *
	 * @param _item: CustomerModel
	 */

	deleteCustomer(customer: CustomerModel) {
		const _title: string = 'Customer Delete';
		const _description: string = 'Are you sure to permanently delete this customer?';
		const _waitDesciption: string = 'Customer is deleting...';
		const _deleteMessage = `Customer has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneCustomerDeleted({ id: customer.id_customer }));
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

			const idsForDeletion: number[] = [];
			// tslint:disable-next-line:prefer-for-of
			for (let i = 0; i < this.selection.selected.length; i++) {
				idsForDeletion.push(this.selection.selected[i].id_customer);
			}
			this.store.dispatch(new ManyCustomersDeleted({ ids: idsForDeletion }));
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
				text: `${elem.firstname + elem.lastname}`,
				id: elem.id_customer,
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	/**
	 * Update status dialog
	 */
	updateParentForCustomers(customer: CustomerModel) {
		const _title = 'Update Parent for selected categories';
		const _updateMessage = 'Parent has been updated for selected categories';
		const id = customer.id;
		const name = customer.id_customer;
		// tampil di list
		const _statuses = [{ value: `${id}`, text: `${name}` }];
		const _messages = [];

		this.selection.selected.forEach(elem => {
			_messages.push({
				text: `${elem.id_customer}`,
				id: elem.id,
			});
		});

		const dialogRef = this.layoutUtilsService.updateStatusForEntities(_title, _statuses, _messages);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.selection.clear();
				return;
			}

			this.store.dispatch(new CustomersParentUpdated({
				id_parent: +res,
				customers: this.selection.selected
			}));

			this.layoutUtilsService.showActionNotification(_updateMessage, MessageType.Update);
			this.selection.clear();
		});
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
	 * List Invoice
	 * @param customer
	 */
	listInv(customer) {
		this.customerlistInv.id_customer = customer.id_customer;
		this.router.navigate(['../customer/listInv', customer.id_customer], { relativeTo: this.activatedRoute });
	}

	/**
	 * status action
	 */
	gantiHp(customer: CustomerModel) {
		this.router.navigate(['vp-admin/customers/customer']);
		const _title: string = `Customer Name : ${customer.firstname} ${customer.lastname}`;
		const _description: string = `Change Phone Number`;
		const _waitDesciption: string = 'Change Phone Number...';
		const _Message = `Change Phone Number Success`;
		const data = {
			// tslint:disable-next-line: object-literal-shorthand
			id_customer: customer.id_customer,
			phone: customer.phone
		};

		const dialogRef = this.layoutUtilsService.ChangeElement(_title, _description, _waitDesciption, data);
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					return;
				}

				this.layoutUtilsService.showActionNotification(_Message, MessageType.Delete);
			});
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
	getItemVerString(ver: number = 1): string {
		switch (ver) {
			case 1:
				return 'Verification';
			case 0:
				return 'Non Verification';
		}
		return '';
	}

	/**
	 * Returns CSS Class by status
	 *
	 * @param status: number
	 */
	getItemCssClassByVer(ver: number = 1): string {
		switch (ver) {
			case 1:
				return 'success';
			case 0:
				return 'accent';
		}
		return '';
	}

	/**
	 * Returns status string
	 *
	 * @param status: number
	 */
	getItemStatusString(status: number = 1): string {
		switch (status) {
			case 1:
				return 'Aktif';
			case 0:
				return 'Non Aktif';
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
			case 0:
				return 'accent';
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
