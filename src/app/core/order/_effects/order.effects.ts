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
import { OrderService } from '../_services';
// State
import { AppState } from '../../reducers';
// Actions
import {
	OrderActionTypes,
	ImageActionTypes,
	OrdersPageRequested,
	OrdersPageLoaded,
	ManyOrdersDeleted,
	OneOrderDeleted,
	OneImageDeleted,
	OrdersPageToggleLoading,
	OrdersParentUpdated,
	OrderUpdated,
	OrderCreated,
	OrderOnServerCreated
} from '../_actions/order.actions';
import { defer, Observable, of } from 'rxjs';

@Injectable()
export class OrderEffects {
	showPageLoadingDistpatcher = new OrdersPageToggleLoading({ isLoading: true });
	showLoadingDistpatcher = new OrdersPageToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new OrdersPageToggleLoading({ isLoading: false });

	@Effect()
	loadOrdersPage$ = this.actions$
		.pipe(
			ofType<OrdersPageRequested>(OrderActionTypes.OrdersPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ordersService.findOrders(payload.page);
				const lastQuery = of(payload.page);
				// tslint:disable-next-line: deprecation
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = response[0];
				const lastQuery: QueryParamsModel = response[1];
				return new OrdersPageLoaded({
					orders: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteOrder$ = this.actions$
		.pipe(
			ofType<OneOrderDeleted>(OrderActionTypes.OneOrderDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showLoadingDistpatcher);
					return this.ordersService.deleteOrder(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	deleteOrders$ = this.actions$
		.pipe(
			ofType<ManyOrdersDeleted>(OrderActionTypes.ManyOrdersDeleted),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.ordersService.deleteOrders(payload.ids);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateOrder$ = this.actions$
		.pipe(
			ofType<OrderUpdated>(OrderActionTypes.OrderUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.ordersService.updateOrder(payload.order);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createOrder$ = this.actions$
		.pipe(
			ofType<OrderOnServerCreated>(OrderActionTypes.OrderOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.ordersService.createOrder(payload.order).pipe(
					tap(res => {
						this.store.dispatch(new OrderCreated({ order: res }));
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

	constructor(private actions$: Actions, private ordersService: OrderService, private store: Store<AppState>) { }
}
