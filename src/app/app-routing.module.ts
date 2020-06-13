// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{path: 'auth', loadChildren: () => import('./views/pages/auth/auth.module').then(m => m.AuthModule)},

	// enable this router to set which demo theme to load,
	// leave the path value empty to enter into nested router in ThemeModule
	// {path: '', loadChildren: 'app/views/themes/demo1/theme.module#ThemeModule'},

	/** START: remove this themes list on production */
	{path: '', redirectTo: 'vp-admin', pathMatch: 'full'},
	// list of routers specified by demos, for demo purpose only!
	{path: 'vp-admin', loadChildren: () => import('./views/themes/demo1/theme.module').then(m => m.ThemeModule)},
	/** END: themes list end */

	{path: '**', redirectTo: 'vp-admin/error/403', pathMatch: 'full'},
	{path: 'assets', redirectTo: 'vp-admin/error/403', pathMatch: 'full'},
	// {path: '**', redirectTo: 'error/403', pathMatch: 'full'},
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes)
	],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
