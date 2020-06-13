// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { LayoutUtilsService, MessageType, QueryParamsModel, HttpUtilsService } from '../../../../../../core/_base/crud';
// Services and Models
import {
	BarangModel,
	BarangsPageRequested,
	OneBarangDeleted,
	ManyBarangsDeleted,
	BarangsParentUpdated,
	barangsReducer,
	BarangService
} from '../../../../../../core/catalog';
import { selectBarangsPageLastQuery } from '../../../../../../core/catalog/_selectors/barang.selectors';
import { BarangsDataSource } from '../../../../../../core/catalog/_data-sources/barangs.datasource';
// import { element } from '@angular/core/src/render3';
import { CategoryService } from '../../../../../../core/catalog/_services/category.service';
import { CategoryModel } from '../../../../../../core/catalog/_models/category.model';
import { TranslateService } from '@ngx-translate/core';
import { ProductImageEditDialogComponent } from '../product-edit/productImage-edit.dialog.component';
import { ProductModel } from '../../../../../../core/e-commerce';
import { ProductsConditionComponent } from './product-condition.component';
import { currentUser, User } from '../../../../../../core/auth';
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
	selector: 'kt-products-list',
	templateUrl: './product-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: BarangsDataSource;
	displayedColumns = ['select', 'image', 'ID',  'name', 'color', 'size', 'stock', 'price', 'status', 'kondisi', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	filterParent: string = '';
	filterName: string = '';
	filterStatus: string = '';
	filterKondisi: string = '';
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<BarangModel>(true, []);
	selectionC = new SelectionModel<CategoryModel>(true, []);
	productsResult: BarangModel[] = [];
	show = false;
	private subscriptions: Subscription[] = [];
	private localURl: string;
	images: any = [];
	paramter: boolean = false;
	public product: any = [];
	isAdmin: any = [];
	user$: User;
	clear = false;
	setting$: Observable<any>;
	setting: any;

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
		private catagoryService: CategoryService,
		private barangService: BarangService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef,
		private domainLocal: HttpUtilsService) {
			this.setting$ = this.barangService.setting();
			this.setting$.subscribe( res => {this.setting = res; /* console.log(this.setting); */ } );
			this.cdr.markForCheck(); this.localURl = this.domainLocal.domain;
		}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */
		category: any = [];

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
		this.setting$ = this.barangService.setting();
		this.store.pipe(select(currentUser), first(res => {
			return res !== undefined;
		})
		).subscribe(result => {
			this.user$ = result;
			this.isAdmin = this.user$.roles;
		});
		this.cdr.markForCheck();
		this.barangService.getAllBarangs().subscribe(
			res => {
				this.product = res;
				if (this.product[0].setup === 1) {
					this.show = true;
				} else {
					this.show = false;
				}
			},
			err => console.error(err)
		);
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
			// console.log(this.productsResult);
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
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new BarangsPageRequested({ page: queryParams, params: 'all' }));
		this.selection.clear();
	}

	/**
	 * clear search
	 */
	reset() {
		this.searchInput.nativeElement.value = '';
		return this.clear = true;
	}

	/**
	 * Returns object for filter
	 */
	filterConfiguration(): any {
		const filter: any = {};
		let searchText: string;
		if (!this.clear) {
			searchText = this.searchInput.nativeElement.value;
		} else {
			searchText = '';
		}

		this.clear = false;

		if (this.filterKondisi && this.filterKondisi.length > 0) {
			filter.kondisi = this.filterKondisi;
		}

		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}

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

		if ('kondisi' in queryParams.filter) {
			this.filterKondisi = queryParams.filter.kondisi.toString();
		}

		if ('status' in queryParams.filter) {
			this.filterStatus = queryParams.filter.status.toString();
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
	 * Update All Product
	 */
	updateProduct() {
		return this.barangService.upallProd().subscribe();
	}

	/**
	 * Delete product
	 *
	 * @param _item: ProductModel
	 */

	showImage(product) {
		this.editProductImage(product);
	}

	editProductImage(product) {
		this.paramter = true;
		this.barangService.getAllImages(product.id).subscribe(
			result => {
				let images: any = [];
				images = result;
				let saveMessageTranslateParam = 'CATALOG.PRODUCTIMAGE.EDIT.';
				saveMessageTranslateParam += product.id > 0 ? 'UPDATE_MASSAGE' : 'ADD_MESSAGE';
				const _saveMessage = this.translate.instant(saveMessageTranslateParam);
				const _messageType = product.id > 0 ? MessageType.Update : MessageType.Create;
				const dialogRef = this.dialog.open(ProductImageEditDialogComponent, {data: {product, images}});
				dialogRef.afterClosed().subscribe(res => {
					if (!res) {
						return;
					}
					this.paramter = false;
					this.layoutUtilsService.showActionNotification(_saveMessage, _messageType);
					this.loadProductsList();
				});
			},
			err => console.error(err)
		);

	}

	deleteProduct(product: BarangModel) {
		const _title: string = 'Product Delete';
		const _description: string = 'Are you sure to permanently delete this product?';
		const _waitDesciption: string = 'Product is deleting...';
		const _deleteMessage = `Product has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneBarangDeleted({ id: product.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.ngOnInit();
		});

	}

	/**
	 * Delete products
	 */
	deleteProducts() {
		const _title: string = 'Products Delete';
		const _description: string = 'Are you sure to permanently delete selected products?';
		const _waitDesciption: string = 'Products are deleting...';
		const _deleteMessage = 'Selected products have been deleted';

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
			this.store.dispatch(new ManyBarangsDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.ngOnInit();
			this.selection.clear();
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
	 * Update status dialog
	 */
	updateParentForProducts(product: BarangModel) {
		const _title = 'Update Parent for selected categories';
		const _updateMessage = 'Parent has been updated for selected categories';
		const id = product.id;
		const name = product.name;
		// tampil di list
		const _statuses = [{ value: `${id}`, text: `${name}` }];
		const _messages = [];

		this.selection.selected.forEach(elem => {
			_messages.push({
				text: `${elem.name}`,
				id: elem.id,
				id_parent: elem.id_category,
				parentTitle: elem.id_category,
				parentCssClass: elem.id_category
			});
		});

		const dialogRef = this.layoutUtilsService.updateStatusForEntities(_title, _statuses, _messages);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.selection.clear();
				return;
			}

			this.store.dispatch(new BarangsParentUpdated({
				id_parent: +res,
				barangs: this.selection.selected
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

	onActive(product) {
		let barang: BarangModel;
		let active = 1;
		let deactive = 0;
		let status: number;
		if (product.status === 0) {
			status = active;
		} else {
			status = deactive;
		}
		const data = {
			md: product.model,
			st: status
		};
		this.barangService.updateBarangstatus(data).subscribe(
			result => {
				status = result;
				console.log(status);
			}
		);
		this.ngOnInit();
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

	onChange(product: BarangModel) {
		const params = 'kon';
		// console.log(params);
		let saveMessageTranslateParam = 'SUCCESS ';
		saveMessageTranslateParam += product.id > 0 ? 'UPDATE PRODUCT CONDITION' : '';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam);
		const _messageType = product.id > 0 ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(ProductsConditionComponent, { data: { product, params } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType);
			this.loadProductsList();
		});
	}

	changechartStat(product: BarangModel, stat: number) {
		const params = 'chart';
		// console.log(params);
		let saveMessageTranslateParam = 'SUCCESS ';
		saveMessageTranslateParam += this.product.id > 0 ? 'UPDATE CHART CONDITION' : '';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam);
		const _messageType = this.product.id > 0 ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(ProductsConditionComponent, { data: { product, stat, params } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType);
			this.ngOnInit();
		});
	}

	onDiscount(product: BarangModel) {
		const params = 'disc';
		// console.log(params);
		let saveMessageTranslateParam = 'SUCCESS ';
		saveMessageTranslateParam += product.id > 0 ? 'UPDATE PRODUCT DISCOUNT' : '';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam);
		const _messageType = product.id > 0 ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(ProductsConditionComponent, { data: { product, params }, width: '600px' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType);
			this.loadProductsList();
		});
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

	onSet(product) {
		let barang: BarangModel;
		let Yes = 1;
		let No = 0;
		let home: number;
		if (product.home === 0) {
			home = Yes;
		} else {
			home = No;
		}
		const data = {
			id: product.id,
			hm: home
		};
		this.barangService.updateBaranghome(data).subscribe(
			result => {
				home = result;
				console.log(home);
			}
		);
		this.ngOnInit();
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
