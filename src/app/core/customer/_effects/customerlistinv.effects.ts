import { QueryParamsModel } from '../../_base/crud/models/query-models/query-params.model';
import { forkJoin } from 'rxjs';
// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, delay } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { ListInvService } from '../_services';
// State
import { AppState } from '../../reducers';
// Actions
import {
	ListInvActionTypes,
	ListInvPageRequested,
	ListInvPageLoaded,
	ManysListInvDeleted,
	OneListInvDeleted,
	ListInvActionToggleLoading,
	ListInvPageToggleLoading,
	ListInvUpdated,
	ListInvCreated,
	ListInvOnServerCreated
} from '../_actions/customerlistinv.actions';
import { of } from 'rxjs';

@Injectable()
export class ListInvEffects {
	showPageLoadingDistpatcher = new ListInvPageToggleLoading({ isLoading: true });
	showActionLoadingDistpatcher = new ListInvActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ListInvActionToggleLoading({ isLoading: false });

	@Effect()
	loadInvoicesPage$ = this.actions$.pipe(
		ofType<ListInvPageRequested>(ListInvActionTypes.sListInvPageRequested),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showPageLoadingDistpatcher);
			const requestToServer = this.invoicesService.findCustomers(payload.page);
			const lastQuery = of(payload.page);
			// tslint:disable-next-line: deprecation
			return forkJoin(requestToServer, lastQuery);
		}),
		map(response => {
			const result: QueryResultsModel = response[0];
			const lastQuery: QueryParamsModel = response[1];
			const pageLoadedDispatch = new ListInvPageLoaded({
				invoices: result.items,
				totalCount: result.totalCount,
				page: lastQuery
			});
			return pageLoadedDispatch;
		})
	);

	@Effect()
	deleteInvoice$ = this.actions$
		.pipe(
			ofType<OneListInvDeleted>(ListInvActionTypes.OneListInvDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.invoicesService.deleteCustomer(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	deleteInvoices$ = this.actions$
		.pipe(
			ofType<ManysListInvDeleted>(ListInvActionTypes.ManysListInvDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.invoicesService.deleteCustomers(payload.ids);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateInvoice$ = this.actions$
		.pipe(
			ofType<ListInvUpdated>(ListInvActionTypes.ListInvUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.invoicesService.updateCustomer(payload.invoice);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			})
		);

	@Effect()
	createInvoice$ = this.actions$
		.pipe(
			ofType<ListInvOnServerCreated>(ListInvActionTypes.ListInvOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.invoicesService.createCustomer(payload.invoice).pipe(
					tap(res => {
						this.store.dispatch(new ListInvCreated({ invoice: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private invoicesService: ListInvService, private store: Store<AppState>) { }
}
