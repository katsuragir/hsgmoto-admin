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
	ordersReducer,
	OrderEffects,
	OrderService,
	confirmsReducer,
	ConfirmEffects,
	invoicesReducer,
	InvoiceEffects,
	reportsReducer,
	ReportEffects,
	ReportService
} from '../../../../core/order';
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
import { OrderComponent } from './order.component';
// Order
import { OrdersListComponent } from './orders/orders-list/orders-list.component';
import { TransactionReportComponent } from './orders/orders-list/transaction-report/transaction-report.component';
import { ConfirmListComponent } from './orders/confirm-payment/confirm-list.component';
import { CheckConfirmComponent } from './orders/check-confirm/check-confirm.component';
import { ViewOrderComponent } from './orders/view-order/view-order.component';
import { InvoicesListComponent } from './invoice/invoice-list.component';
import { VInvoicesListComponent } from './invoice/invoice-list-vouch/invoice-list.component';
import { InvoiceDetailComponent } from './invoice/invoice-detail/invoice-detail.component';
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
		component: OrderComponent,
		// canActivate: [ModuleGuard],
		// data: { moduleName: 'ecommerce' },
		children: [
			{
				path: '',
				redirectTo: 'orders',
				pathMatch: 'full'
			},
			{
				path: 'orders',
				component: OrdersListComponent
			},
			{
				path: 'orders/view/:id',
				component: ViewOrderComponent
			},
			/*
			{
				path: 'confirm',
				component: ConfirmListComponent
			},
			{
				path: 'confirm/check/:id',
				component: CheckConfirmComponent
			},
			*/
			{
				path: 'invoice',
				component: InvoicesListComponent
			},
			{
				path: 'invoice/detail/:id',
				component: InvoiceDetailComponent
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
		environment.isMockEnabled ? HttpClientInMemoryWebApiModule.forFeature(FakeApiService, {
			passThruUnknownUrl: true,
			dataEncapsulation: false
		}) : [],
		StoreModule.forFeature('orders', ordersReducer),
		EffectsModule.forFeature([OrderEffects]),
		StoreModule.forFeature('reports', reportsReducer),
		EffectsModule.forFeature([ReportEffects]),
		StoreModule.forFeature('confirms', confirmsReducer),
		EffectsModule.forFeature([ConfirmEffects]),
		StoreModule.forFeature('deliverys', deliverysReducer),
		EffectsModule.forFeature([DeliveryEffects]),
		StoreModule.forFeature('invoices', invoicesReducer),
		EffectsModule.forFeature([InvoiceEffects]),
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
		OrderService,
		ReportService,
		TypesUtilsService,
		LayoutUtilsService,
		// MycurrencyPipe
	],
	entryComponents: [
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		FetchEntityDialogComponent,
		UpdateStatusDialogComponent,
		TransactionReportComponent
	],
	declarations: [
		OrderComponent,
		// MycurrencyPipe,
		// MycurrencyDirective,
		OrdersListComponent,
		TransactionReportComponent,
		ConfirmListComponent,
		CheckConfirmComponent,
		ViewOrderComponent,
		InvoicesListComponent,
		VInvoicesListComponent,
		InvoiceDetailComponent
	]
})
export class OrderModule { }
