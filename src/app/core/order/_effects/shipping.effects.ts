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
import { ShippingService } from '../_services';
// State
import { AppState } from '../../reducers';
// Actions
import {
	ShippingActionTypes,
	ImageActionTypes,
    ShippingsPageRequested,
    ShippingsPageLoaded,
    ManyShippingsDeleted,
	OneShippingDeleted,
	OneImageDeleted,
    ShippingsPageToggleLoading,
    ShippingsParentUpdated,
    ShippingUpdated,
    ShippingCreated,
    ShippingOnServerCreated
} from '../_actions/shipping.actions';
import { defer, Observable, of } from 'rxjs';

@Injectable()
export class ShippingEffects {
    showPageLoadingDistpatcher = new ShippingsPageToggleLoading({ isLoading: true });
    showLoadingDistpatcher = new ShippingsPageToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new ShippingsPageToggleLoading({ isLoading: false });

    @Effect()
    loadShippingsPage$ = this.actions$
        .pipe(
            ofType<ShippingsPageRequested>(ShippingActionTypes.ShippingsPageRequested),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showPageLoadingDistpatcher);
                const requestToServer = this.shippingsService.findShippings(payload.page);
                const lastQuery = of(payload.page);
                return forkJoin(requestToServer, lastQuery);
            }),
            map(response => {
                const result: QueryResultsModel = response[0];
                const lastQuery: QueryParamsModel = response[1];
                return new ShippingsPageLoaded({
                    shippings: result.items,
                    totalCount: result.totalCount,
                    page: lastQuery
                });
            }),
        );

    @Effect()
    deleteShipping$ = this.actions$
        .pipe(
            ofType<OneShippingDeleted>(ShippingActionTypes.OneShippingDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showLoadingDistpatcher);
                    return this.shippingsService.deleteShipping(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
		);

    @Effect()
    deleteShippings$ = this.actions$
        .pipe(
            ofType<ManyShippingsDeleted>(ShippingActionTypes.ManyShippingsDeleted),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.shippingsService.deleteShippings(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
		);

    @Effect()
    updateShipping$ = this.actions$
        .pipe(
            ofType<ShippingUpdated>(ShippingActionTypes.ShippingUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.shippingsService.updateShipping(payload.shipping);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    createShipping$ = this.actions$
        .pipe(
            ofType<ShippingOnServerCreated>(ShippingActionTypes.ShippingOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.shippingsService.createShipping(payload.shipping).pipe(
                    tap(res => {
                        this.store.dispatch(new ShippingCreated({ shipping: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    // @Effect()
    // init$: Observable<Action> = defer(() => {
    //     const queryParams = new QueryParamsModel({});
    //     return of(new ProductsPageRequested({ page: queryParams }));
    // });

    constructor(private actions$: Actions, private shippingsService: ShippingService, private store: Store<AppState>) { }
}
