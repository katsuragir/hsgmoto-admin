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
import { ConfirmService } from '../_services';
// State
import { AppState } from '../../reducers';
// Actions
import {
    ConfirmActionTypes,
    ConfirmsPageRequested,
    ConfirmsPageLoaded,
    ManyConfirmsDeleted,
    OneConfirmDeleted,
    ConfirmsPageToggleLoading,
    ConfirmsParentUpdated,
    ConfirmUpdated,
    ConfirmCreated,
    ConfirmOnServerCreated
} from '../_actions/confirm.actions';
import { defer, Observable, of } from 'rxjs';

@Injectable()
export class ConfirmEffects {
    showPageLoadingDistpatcher = new ConfirmsPageToggleLoading({ isLoading: true });
    showLoadingDistpatcher = new ConfirmsPageToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new ConfirmsPageToggleLoading({ isLoading: false });

    @Effect()
    loadConfirmsPage$ = this.actions$
        .pipe(
            ofType<ConfirmsPageRequested>(ConfirmActionTypes.ConfirmsPageRequested),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showPageLoadingDistpatcher);
                const requestToServer = this.confirmsService.findConfirms(payload.page);
                const lastQuery = of(payload.page);
                return forkJoin(requestToServer, lastQuery);
            }),
            map(response => {
                const result: QueryResultsModel = response[0];
                const lastQuery: QueryParamsModel = response[1];
                return new ConfirmsPageLoaded({
                    confirms: result.items,
                    totalCount: result.totalCount,
                    page: lastQuery
                });
            }),
        );

    @Effect()
    deleteConfirm$ = this.actions$
        .pipe(
            ofType<OneConfirmDeleted>(ConfirmActionTypes.OneConfirmDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showLoadingDistpatcher);
                    return this.confirmsService.deleteConfirm(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    deleteConfirms$ = this.actions$
        .pipe(
            ofType<ManyConfirmsDeleted>(ConfirmActionTypes.ManyConfirmsDeleted),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.confirmsService.deleteCategories(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateConfirm$ = this.actions$
        .pipe(
            ofType<ConfirmUpdated>(ConfirmActionTypes.ConfirmUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.confirmsService.updateConfirm(payload.confirm);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    createConfirm$ = this.actions$
        .pipe(
            ofType<ConfirmOnServerCreated>(ConfirmActionTypes.ConfirmOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.confirmsService.createConfirm(payload.confirm).pipe(
                    tap(res => {
                        this.store.dispatch(new ConfirmCreated({ confirm: res }));
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

    constructor(private actions$: Actions, private confirmsService: ConfirmService, private store: Store<AppState>) { }
}
