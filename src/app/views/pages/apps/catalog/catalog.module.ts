// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// Fake API Angular-in-memory
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
// Translate Module
import { TranslateModule } from '@ngx-translate/core';
// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NgxTrimDirectiveModule } from 'ngx-trim-directive';
// UI
import { PartialsModule } from '../../../partials/partials.module';
// Core
import { FakeApiService } from '../../../../core/_base/layout';
// Auth
import { ModuleGuard } from '../../../../core/auth';
// Core => Services
import {
	barangsReducer,
	BarangEffects,
	BarangService,
	categorysReducer,
	CategoryEffects,
	CategoryService,
	discountsReducer,
	DiscountEffects,
	DiscountService,
	vouchersReducer,
	VoucherEffects,
	VoucherService,
	brandsReducer,
	BrandService,
	BrandEffects,
	bannersReducer,
	BannerService,
	BannerEffects,
} from '../../../../core/catalog';
// Core => Utils
import { HttpUtilsService,
	TypesUtilsService,
	InterceptService,
	LayoutUtilsService
} from '../../../../core/_base/crud';
// Shared
import {
	ActionNotificationComponent,
	DeleteEntityDialogComponent,
	FetchEntityDialogComponent,
	UpdateStatusDialogComponent
} from '../../../partials/content/crud';
// Components
import { CatalogComponent } from './catalog.component';
// Products
import { ProductsListComponent } from './product/product-list/product-list.component';
import { ProductsConditionComponent } from './product/product-list/product-condition.component';
import { ProductAddComponent } from './product/product-add/product-add.component';
import { ProductEditComponent } from './product/product-edit/product-edit.component';
import { ProductImageEditDialogComponent } from './product/product-edit/productImage-edit.dialog.component';
import { DialogCategoryAdd } from './product/product-add/product-add.component';
// Categories
import { CategorysListComponent } from './category/category-list/category-list.component';
import { CategoryAddComponent } from './category/category-add/category-add.component';
import { CategoryEditComponent } from './category/category-edit/category-edit.component';
// Discounts
import { DiscountsListComponent } from './discount/discount-list/discount-list.component';
import { DiscountAddComponent } from './discount/discount-add/discount-add.component';
import { ProductListComponent } from './discount/discount-list/products-list.component';
import { DiscountEditComponent } from './discount/discount-edit/discount-edit.component';
// Voucher
import { VouchersListComponent } from './voucher/voucher-list/voucher-list.component';
import { VoucherAddComponent } from './voucher/voucher-add/voucher-add.component';
import { VoucherEditComponent } from './voucher/voucher-edit/voucher-edit.component';
// Brands
import { BrandsListComponent } from './brand/brand-list/brand-list.component';
import { BrandAddComponent } from './brand/brand-add/brand-add.component';
import { BrandEditComponent } from './brand/brand-edit/brand-edit.component';
// Banners
import { BannersListComponent } from './banner/banner-list/banner-list.component';
import { BannerAddComponent } from './banner/banner-add/banner-add.component';
import { BannerEditComponent } from './banner/banner-edit/banner-edit.component';
// Invoice
import { VInvoicesListComponent } from '../order/invoice/invoice-list-vouch/invoice-list.component';
import { OrderModule } from '../order/order.module';
// Material
import {
	MatInputModule,
	MatPaginatorModule,
	MatProgressSpinnerModule,
	MatSortModule,
	MatTableModule,
	MatSelectModule,
	MatMenuModule,
	MatProgressBarModule,
	MatButtonModule,
	MatCheckboxModule,
	MatDialogModule,
	MatTabsModule,
	MatNativeDateModule,
	MatCardModule,
	MatRadioModule,
	MatIconModule,
	MatDatepickerModule,
	MatAutocompleteModule,
	MAT_DIALOG_DEFAULT_OPTIONS,
	MatSnackBarModule,
	MatTooltipModule,
	MatListModule
} from '@angular/material';
import {DragDropModule} from '@angular/cdk/drag-drop';
// import { MatFileUploadModule } from 'angular-material-fileupload';
import { ngfModule } from 'angular-file';
import { environment } from '../../../../../environments/environment';
import { CoreModule } from '../../../../core/core.module';
import { NgbProgressbarModule, NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsModule } from 'ngx-permissions';
import { MycurrencyPipe } from '../../../../core/catalog/pipe/mycurrency.pipe';
import { MycurrencyDirective } from '../../../../core/catalog/directive/mycurrency.directive';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { DragScrollModule } from 'ngx-drag-scroll';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { DndModule } from 'ngx-drag-drop';
import { DndDirective } from '../../../../core/catalog/directive/dnd.directive';

// tslint:disable-next-line:class-name
const routes: Routes = [
	{
		path: '',
		component: CatalogComponent,
		// canActivate: [ModuleGuard],
		// data: { moduleName: 'ecommerce' },
		children: [
			{
				path: '',
				redirectTo: 'products',
				pathMatch: 'full'
			},
			{
				path: 'product',
				component: ProductsListComponent,
			},

			{
				path: 'product/add',
				component: ProductAddComponent
			},
			{
				path: 'product/edit/:id',
				component: ProductEditComponent
			},
			{
				path: 'categories',
				component: CategorysListComponent,
			},
			{
				path: 'categories/add',
				component: CategoryAddComponent
			},
			{
				path: 'category/edit/:id',
				component: CategoryEditComponent
			},
			{
				path: 'brands',
				component: BrandsListComponent
			},
			{
				path: 'brands/add',
				component: BrandAddComponent
			},
			{
				path: 'brands/edit',
				component: BrandEditComponent
			},
			{
				path: 'banners',
				component: BannersListComponent
			},
			{
				path: 'banners/add',
				component: BannerAddComponent
			},
			{
				path: 'banners/edit',
				component: BannerEditComponent
			},
			{
				path: 'discounts',
				component: DiscountsListComponent
			},
			{
				path: 'discounts/add',
				component: DiscountAddComponent
			},
			{
				path: 'discounts/edit/:id',
				component: DiscountEditComponent
			},
			{
				path: 'vouchers',
				component: VouchersListComponent
			},
			{
				path: 'vouchers/add',
				component: VoucherAddComponent
			},
			{
				path: 'vouchers/edit/:id',
				component: VoucherEditComponent
			}
		]
	}
];

@NgModule({
	imports: [
		DndModule,
		AngularEditorModule,
		DragScrollModule,
		SlickCarouselModule,
		MatDialogModule,
		OrderModule,
		NgxTrimDirectiveModule,
		CommonModule,
		HttpClientModule,
		PartialsModule,
		NgxPermissionsModule.forChild(),
		RouterModule.forChild(routes),
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		MatButtonModule,
		MatMenuModule,
		MatSelectModule,
		MatInputModule,
		MatTableModule,
		MatAutocompleteModule,
		MatRadioModule,
		MatIconModule,
		MatNativeDateModule,
		MatProgressBarModule,
		MatDatepickerModule,
		MatCardModule,
		MatPaginatorModule,
		MatSortModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatTabsModule,
		MatTooltipModule,
		NgbProgressbarModule,
	// MatFileUploadModule,
		ngfModule,
		MatListModule,
		environment.isMockEnabled ? HttpClientInMemoryWebApiModule.forFeature(FakeApiService, {
			passThruUnknownUrl: true,
			dataEncapsulation: false
		}) : [],
		StoreModule.forFeature('barangs', barangsReducer),
		StoreModule.forFeature('categorys', categorysReducer),
		StoreModule.forFeature('brands', brandsReducer),
		StoreModule.forFeature('banners', bannersReducer),
		StoreModule.forFeature('discounts', discountsReducer),
		StoreModule.forFeature('vouchers', vouchersReducer),
		EffectsModule.forFeature([BarangEffects]),
		EffectsModule.forFeature([CategoryEffects]),
		EffectsModule.forFeature([BrandEffects]),
		EffectsModule.forFeature([BannerEffects]),
		EffectsModule.forFeature([DiscountEffects]),
		EffectsModule.forFeature([VoucherEffects]),
		DragDropModule
	],
	providers: [
		ModuleGuard,
		InterceptService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: InterceptService,
			multi: true
		},
		{
			provide: MAT_DIALOG_DEFAULT_OPTIONS,
			useValue: {
				hasBackdrop: true,
				panelClass: 'kt-mat-dialog-container__wrapper',
				height: 'auto',
				width: '900px'
			}
		},
		TypesUtilsService,
		LayoutUtilsService,
		HttpUtilsService,
		CategoryService,
		DiscountService,
		VoucherService,
		BarangService,
		BrandService,
		BannerService,
		TypesUtilsService,
		LayoutUtilsService,
		MycurrencyPipe
	],
	entryComponents: [
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		ProductImageEditDialogComponent,
		FetchEntityDialogComponent,
		UpdateStatusDialogComponent,
		DialogCategoryAdd,
		ProductsConditionComponent,
		ProductListComponent,
		VInvoicesListComponent
	],
	declarations: [
		CatalogComponent,
		// Products
		ProductsListComponent,
		ProductAddComponent,
		ProductEditComponent,
		ProductImageEditDialogComponent,
		DialogCategoryAdd,
		// Categories
		CategorysListComponent,
		CategoryAddComponent,
		CategoryEditComponent,
		// Brands
		BrandsListComponent,
		BrandAddComponent,
		BrandEditComponent,
		// Banners
		BannersListComponent,
		BannerAddComponent,
		BannerEditComponent,
		// Discount
		DiscountsListComponent,
		DiscountAddComponent,
		DiscountEditComponent,
		ProductListComponent,
		// Voucher
		VouchersListComponent,
		VoucherAddComponent,
		VoucherEditComponent,
		ProductsConditionComponent,
		MycurrencyPipe,
		MycurrencyDirective,
		DndDirective
	]
})
export class CatalogModule { }
