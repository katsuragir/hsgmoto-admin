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
import { SettingComponent } from './setting.component';
import { AboutUSComponent } from './about-us/about-us.component';

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
// import { MatFileUploadModule } from 'angular-material-fileupload';
import { ngfModule } from 'angular-file';
import { environment } from '../../../../../environments/environment';
import { CoreModule } from '../../../../core/core.module';
import { NgbProgressbarModule, NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsModule } from 'ngx-permissions';
import { deliverysReducer, DeliveryEffects } from '../../../../core/order/';
// import { MycurrencyPipe } from '../../../../core/catalog/pipe/mycurrency.pipe';
// import { MycurrencyDirective } from '../../../../core/catalog/directive/mycurrency.directive';
import { AngularEditorModule } from '@kolkov/angular-editor';


// tslint:disable-next-line:class-name
const routes: Routes = [
	{
		path: '',
		component: SettingComponent,
		// canActivate: [ModuleGuard],
		// data: { moduleName: 'ecommerce' },
		children: [
			{
				path: '',
				redirectTo: 'about-us',
				pathMatch: 'full'
			},
			{
				path: 'about-us',
				component: AboutUSComponent
			}

		]
	}
];

@NgModule({
	imports: [
		AngularEditorModule,
		MatDialogModule,
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
		EffectsModule.forFeature([VoucherEffects])
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
		TypesUtilsService,
		CategoryService,
		DiscountService,
		VoucherService,
		BarangService,
		BrandService,
		BannerService,
		LayoutUtilsService,
		// MycurrencyPipe
	],
	entryComponents: [
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		FetchEntityDialogComponent,
		UpdateStatusDialogComponent,
	],
	declarations: [
		SettingComponent,
		AboutUSComponent
	]
})
export class SettingModule { }
