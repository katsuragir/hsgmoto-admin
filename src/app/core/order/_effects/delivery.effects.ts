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
import { DeliveryService } from '../_services';
// State
import { AppState } from '../../reducers';
// Actions
import {
	DeliveryActionTypes,
	ImageActionTypes,
    DeliverysPageRequested,
    DeliverysPageLoaded,
    ManyDeliverysDeleted,
	OneDeliveryDeleted,
	OneImageDeleted,
    DeliverysPageToggleLoading,
    DeliverysParentUpdated,
    DeliveryUpdated,
    DeliveryCreated,
    DeliveryOnServerCreated
} from '../_actions/delivery.actions';
import { defer, Observable, of } from 'rxjs';

@Injectable()
export class DeliveryEffects {
    showPageLoadingDistpatcher = new DeliverysPageToggleLoading({ isLoading: true });
    showLoadingDistpatcher = new DeliverysPageToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new DeliverysPageToggleLoading({ isLoading: false });

    @Effect()
    loadDeliverysPage$ = this.actions$
        .pipe(
            ofType<DeliverysPageRequested>(DeliveryActionTypes.DeliverysPageRequested),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showPageLoadingDistpatcher);
                const requestToServer = this.deliverysService.findDeliverys(payload.page);
                const lastQuery = of(payload.page);
                return forkJoin(requestToServer, lastQuery);
            }),
            map(response => {
                const result: QueryResultsModel = response[0];
                const lastQuery: QueryParamsModel = response[1];
                return new DeliverysPageLoaded({
                    deliveries: result.items,
                    totalCount: result.totalCount,
                    page: lastQuery
                });
            }),
        );

    @Effect()
    deleteDelivery$ = this.actions$
        .pipe(
            ofType<OneDeliveryDeleted>(DeliveryActionTypes.OneDeliveryDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showLoadingDistpatcher);
                    return this.deliverysService.deleteDelivery(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
		);

    @Effect()
    deleteDeliverys$ = this.actions$
        .pipe(
            ofType<ManyDeliverysDeleted>(DeliveryActionTypes.ManyDeliverysDeleted),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.deliverysService.deleteDeliverys(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateDelivery$ = this.actions$
        .pipe(
            ofType<DeliveryUpdated>(DeliveryActionTypes.DeliveryUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.deliverysService.updateDelivery(payload.delivery);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    createDelivery$ = this.actions$
        .pipe(
            ofType<DeliveryOnServerCreated>(DeliveryActionTypes.DeliveryOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.deliverysService.createDelivery(payload.delivery).pipe(
                    tap(res => {
                        this.store.dispatch(new DeliveryCreated({ delivery: res }));
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

    constructor(private actions$: Actions, private deliverysService: DeliveryService, private store: Store<AppState>) { }
}
