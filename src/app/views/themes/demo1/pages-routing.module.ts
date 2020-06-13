// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Components
import { BaseComponent } from './base/base.component';
import { ErrorPageComponent } from './content/error-page/error-page.component';
// Auth
import { AuthGuard } from '../../../core/auth';

const routes: Routes = [
	{
		path: '',
		component: BaseComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: 'dashboard',
				loadChildren: () => import('../../pages/dashboard/dashboard.module').then(m => m.DashboardModule)
			},
			/*
			{
				path: 'mail',
				loadChildren: () => import('../../pages/apps/mail/mail.module').then(m => m.MailModule)
			},
			*/
			{
				path: 'catalog',
				loadChildren: () => import('../../pages/apps/catalog/catalog.module').then(m => m.CatalogModule),
			},
			{
				path: 'order',
				loadChildren: () => import('../../pages/apps/order/order.module').then(m => m.OrderModule),
			},
			{
				path: 'distributors',
				loadChildren: () => import('../../pages/apps/distributors/distributor.module').then(m => m.CatalogModule),
			},
			{
				path: 'user-management',
				loadChildren: () => import('../../pages/user-management/user-management.module').then(m => m.UserManagementModule)
			},
			{
				path: 'customers',
				loadChildren: () => import('../../pages/apps/customer/customer.module').then(m => m.CustomerModule)
			},
			{
				path: 'setting',
				loadChildren: () => import('../../pages/apps/setting/setting.module').then(m => m.SettingModule)
			},
			/*
			{
				path: 'wizard',
				loadChildren: () => import('../../pages/wizard/wizard.module').then(m => m.WizardModule)
			},
			{
				path: 'builder',
				loadChildren: () => import('../../themes/demo1/content/builder/builder.module').then(m => m.BuilderModule)
			},
			*/
			{
				path: 'error/403',
				component: ErrorPageComponent,
				data: {
					'type': 'error-v6',
					'code': 403,
					'title': '403... Access forbidden',
					'desc': 'Looks like you don\'t have permission to access for requested page.<br> Please, contact administrator'
				}
			},
			{path: 'error/:type', component: ErrorPageComponent},
			{path: '', redirectTo: 'dashboard', pathMatch: 'full'},
			{path: '**', redirectTo: 'dashboard', pathMatch: 'full'}
		]
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PagesRoutingModule {
}
