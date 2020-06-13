// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
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
import { LayoutUtilsService, MessageType, QueryParamsModel, HttpUtilsService } from '../../../../../../core/_base/crud';
// Services and Models
import {
	BarangModel,
	BarangsPageRequested,
	OneBarangDeleted,
	ManyBarangsDeleted,
	BarangsParentUpdated,
	barangsReducer,
	BarangService,
	DiscountModel,
	DiscountService
} from '../../../../../../core/catalog';
import { selectBarangsPageLastQuery } from '../../../../../../core/catalog/_selectors/barang.selectors';
import { BarangsDataSource } from '../../../../../../core/catalog/_data-sources/barangs.datasource';
// import { element } from '@angular/core/src/render3';
import { CategoryService } from '../../../../../../core/catalog/_services/category.service';
import { CategoryModel } from '../../../../../../core/catalog/_models/category.model';
import { TranslateService } from '@ngx-translate/core';
// import { ProductImageEditDialogComponent } from '../product-edit/productImage-edit.dialog.component';
// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-product-list',
	templateUrl: './products-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: BarangsDataSource;
	displayedColumns = ['select', 'ID', 'barcode', 'name', 'stock', 'price'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	filterParent: string = '';
	filterName: string = '';
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<BarangModel>(true, []);
	selectionC = new SelectionModel<CategoryModel>(true, []);
	productsResult: BarangModel[] = [];
	private subscriptions: Subscription[] = [];
	private localURl: string;
	filterStatus: string = '';
	discount: DiscountModel;

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
		public dialogRef: MatDialogRef<ProductListComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private catagoryService: CategoryService,
		private barangService: BarangService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef,
		private domainLocal: HttpUtilsService,
		private disccountService: DiscountService) { this.cdr.markForCheck(); this.localURl = this.domainLocal.domain; }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */
		category: any = [];
		product: any = [];
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
		this.cdr.markForCheck();
		this.discount = this.data.discount;
		/*
		this.catagoryService.getCategoryById(this.product.id_category).subscribe(
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
			tap(() => this.loadProductsList())
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadProductsList();
			})
		)
		.subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Products');

		// Init DataSource
		this.dataSource = new BarangsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.productsResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectBarangsPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadProductsList();
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
	 * Load Products List
	 */
	loadProductsList() {
		const params = this.data.params;
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.barangService.idDisc = this.data.discount.kode_disc;
		this.store.dispatch(new BarangsPageRequested({ page: queryParams, params: params }));
		this.selection.clear();
	}

	/**
	 * Returns object for filter
	 */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.kondisi = this.filterStatus;
		}

		if (this.filterParent && this.filterParent.length > 0) {
			filter.parent = +this.filterParent;
		}

		filter.name = searchText;
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

		if ('kondisi' in queryParams.filter) {
			this.filterStatus = queryParams.filter.kondisi.toString();
		}

		if (queryParams.filter.name) {
			this.searchInput.nativeElement.value = queryParams.filter.name;
		}
	}

	/** ACTIONS */

	/**
	 * Delete products
	 */
	deleteProducts() {
		const _title: string = 'Drop Products From This Discount';
		const _description: string = 'Are you sure to drop selected products?';
		const _waitDesciption: string = 'Products are dropping...';
		const _deleteMessage = 'Selected products have been dropped';

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
			this.disccountService.dropProducts(idsForDeletion).subscribe();
			// this.store.dispatch(new ManyBarangsDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.ngOnInit();
			this.selection.clear();
		});

	}

	/**
	 * Add products
	 */
	addProducts(discount) {
		const _title: string = 'Product Adding';
		const _description: string = `Are you want to give a discount for this products?`;
		const _waitDesciption: string = `Add discount for this products...`;
		const _deleteMessage = `Success add discount for this products`;

		const dialogRef = this.layoutUtilsService.addingElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const idsForDeletion: number[] = [];
			const data = {
				kd_dsc: discount.kode_disc,
				i_p: idsForDeletion,
				value: discount.discount,
				flg: discount.flag_discount
			};
			// tslint:disable-next-line:prefer-for-of
			for (let i = 0; i < this.selection.selected.length; i++) {
				// console.log(this.selection.selected);
				// data.push(this.selection.selected);
				idsForDeletion.push(this.selection.selected[i].id);
			}
			// console.log(data);
			// console.log(discount);
			this.disccountService.addingBarang(data).subscribe();
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
			this.dialogRef.close(true);
		});
	}

	/**
	 * Fetch selected products
	 */
	fetchProducts() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.name}`,
				id: elem.barcode,
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	showCategory(id_category) {
		this.catagoryService.getCategoryById(id_category).subscribe(
			res => {this.category = res; }
		);
		let messages = [];
		this.selectionC.selected.forEach(elem => {
			messages.push({
				text: `${elem.name} ${elem.description}`,
				id: elem.id
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	/**
	 * Redirect to edit page
	 *
	 * @param id: any
	 */
	editProduct(id) {
		this.router.navigate(['../product/edit', id], { relativeTo: this.activatedRoute });
	}

	/**
	 * Check all rows are selected
	 */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.productsResult.length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection
	 */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productsResult.forEach(row => this.selection.select(row));
		}
	}

	/* UI */
	/**
	 * Returns status string
	 *
	 * @param status: number
	 */
	getItemStatusString(parent: number = 0): string {
		switch (parent) {
			case 0:
				return 'Disable';
			case 1:
				return 'Enable';
		}
		return '';
	}
	/**
	 * Returns CSS Class by status
	 *
	 * @param status: number
	 */
	getItemCssClassByStatus(status: number = 0): string {
		switch (status) {
			case 0:
				return 'metal';
			case 1:
				return 'success';
		}
		return '';
	}

	/**
	 * Returns CSS Class by condition
	 *
	 * @param condition: number
	 */
	getItemCssClassByCondition(kondisi: string): string {
		switch (kondisi) {
			case 'New':
				return 'accent';
			case 'Regular':
				return 'accent';
			case 'BestSeller':
				return 'primary';
			case 'Feature':
				return 'success';
		}
		return '';
	}

	/**
	 * Rerurns condition string
	 *
	 * @param condition: number
	 */
	getItemConditionString(kondisi: string): string {
		// console.log(kondisi);
		switch (kondisi) {
			case 'New':
				return 'New';
			case 'Regular':
				return 'Regular';
			case 'BestSeller':
				return 'Best';
			case 'Feature':
				return 'Feature';
		}
		return '';
	}

	/**
	 * Rerurns condition string
	 *
	 * @param condition: number
	 */
	getSetConditionString(kondisi: string): string {
		switch (kondisi) {
			case 'New':
				return 'Off';
			case 'Best':
				return 'Set';
		}
		return '';
	}

	/**
	 * Returns CSS Class by condition
	 *
	 * @param condition: number
	 */
	getSetCssClassByCondition(kondisi: number = 0): string {
		switch (kondisi) {
			case 0:
				return 'accent';
			case 1:
				return 'home';
		}
		return '';
	}

	/**
	 * Rerurns condition string
	 *
	 * @param condition: number
	 */
	getSetCssClassCondition(kondisi: number = 0): string {
		switch (kondisi) {
			case 0:
				return 'Off';
			case 1:
				return 'On';
		}
		return '';
	}
}
