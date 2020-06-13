// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// Translate Module
import { TranslateModule } from '@ngx-translate/core';
// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
// UI
import { PartialsModule } from '../../../partials/partials.module';
// Core
// import { FakeApiService } from '../../../../core/_base/layout';
// Auth
import { ModuleGuard } from '../../../../core/auth';
// Core => Services
import {
	customersReducer,
	ReducerListInv,
	CustomerEffects,
	ListInvEffects,
	CustomerService,
	ListInvService,
} from '../../../../core/customer';
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
import { CustomerComponent } from './customer.component';
import { CustomersListComponent } from './customer-list/customer-list.component';
import { CustomersListInvoiceComponent } from './customer-list-invoice/customer-list-invoice.component';
import { ListCartComponent } from './customer-list-invoice/list-cart/list-cart.component';
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


// tslint:disable-next-line:class-name
const routes: Routes = [
	{
		path: '',
		component: CustomerComponent,
		// canActivate: [ModuleGuard],
		// data: { moduleName: 'ecommerce' },
		children: [
			{
				path: '',
				redirectTo: 'customer',
				pathMatch: 'full'
			},
			{
				path: 'customer',
				component: CustomersListComponent
			},
			{
				path: 'customer?=success',
				component: CustomersListComponent
			},
			{
				path: 'customer/listInv/:id',
				component: CustomersListInvoiceComponent
			}
		]
	}
];

@NgModule({
	imports: [
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
		StoreModule.forFeature('customers', customersReducer),
		EffectsModule.forFeature([CustomerEffects]),
		StoreModule.forFeature('listinv', ReducerListInv),
		EffectsModule.forFeature([ListInvEffects]),
		StoreModule.forFeature('deliverys', deliverysReducer),
		EffectsModule.forFeature([DeliveryEffects]),
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
		CustomerService,
		ListInvService,
		TypesUtilsService,
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
		CustomerComponent,
		CustomersListComponent,
		CustomersListInvoiceComponent,
		ListCartComponent
	]
})
export class CustomerModule { }
