import { forkJoin } from 'rxjs';
// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel, QueryParamsModel } from '../../_base/crud';
// Services
import { InvoiceService } from '../_services';
// State
import { AppState } from '../../reducers';
// Actions
import {
	InvoiceActionTypes,
	ImageActionTypes,
	InvoicesPageRequested,
	InvoicesPageLoaded,
	ManyInvoicesDeleted,
	OneInvoiceDeleted,
	OneImageDeleted,
	InvoicesPageToggleLoading,
	InvoicesParentUpdated,
	InvoiceUpdated,
	InvoiceCreated,
	InvoiceOnServerCreated
} from '../_actions/invoice.actions';
import { defer, Observable, of } from 'rxjs';

@Injectable()
export class InvoiceEffects {
	showPageLoadingDistpatcher = new InvoicesPageToggleLoading({ isLoading: true });
	showLoadingDistpatcher = new InvoicesPageToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new InvoicesPageToggleLoading({ isLoading: false });

	@Effect()
	loadInvoicesPage$ = this.actions$
		.pipe(
			ofType<InvoicesPageRequested>(InvoiceActionTypes.InvoicesPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.invoicesService.findInvoices(payload.page, payload.params);
				const lastQuery = of(payload.page);
				// tslint:disable-next-line: deprecation
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = response[0];
				const lastQuery: QueryParamsModel = response[1];
				return new InvoicesPageLoaded({
					Invoices: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteInvoice$ = this.actions$
		.pipe(
			ofType<OneInvoiceDeleted>(InvoiceActionTypes.OneInvoiceDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showLoadingDistpatcher);
					return this.invoicesService.deleteInvoice(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	deleteInvoices$ = this.actions$
		.pipe(
			ofType<ManyInvoicesDeleted>(InvoiceActionTypes.ManyInvoicesDeleted),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.invoicesService.deleteInvoices(payload.ids);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateInvoice$ = this.actions$
		.pipe(
			ofType<InvoiceUpdated>(InvoiceActionTypes.InvoiceUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.invoicesService.updateInvoice(payload.invoice);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createInvoice$ = this.actions$
		.pipe(
			ofType<InvoiceOnServerCreated>(InvoiceActionTypes.InvoiceOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.invoicesService.createInvoice(payload.invoice).pipe(
					tap(res => {
						this.store.dispatch(new InvoiceCreated({ invoice: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	// @Effect()
	// init$: Observable<Action> = defer(() => {
	// const queryParams = new QueryParamsModel({});
	// return of(new ProductsPageRequested({ page: queryParams }));
	// });

	constructor(private actions$: Actions, private invoicesService: InvoiceService, private store: Store<AppState>) { }
}
