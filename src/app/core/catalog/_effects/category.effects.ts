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
import { CategoryService } from '../_services';
// State
import { AppState } from '../../reducers';
// Actions
import {
    CategoryActionTypes,
    CategorysPageRequested,
    CategorysPageLoaded,
    ManyCategorysDeleted,
    OneCategoryDeleted,
    CategorysPageToggleLoading,
    CategorysParentUpdated,
    CategoryUpdated,
    CategoryCreated,
    CategoryOnServerCreated
} from '../_actions/category.actions';
import { defer, Observable, of } from 'rxjs';

@Injectable()
export class CategoryEffects {
    showPageLoadingDistpatcher = new CategorysPageToggleLoading({ isLoading: true });
    showLoadingDistpatcher = new CategorysPageToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new CategorysPageToggleLoading({ isLoading: false });

    @Effect()
    loadCategorysPage$ = this.actions$
        .pipe(
            ofType<CategorysPageRequested>(CategoryActionTypes.CategorysPageRequested),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showPageLoadingDistpatcher);
                const requestToServer = this.categorysService.findCategorys(payload.page);
                const lastQuery = of(payload.page);
                return forkJoin(requestToServer, lastQuery);
            }),
            map(response => {
                const result: QueryResultsModel = response[0];
                const lastQuery: QueryParamsModel = response[1];
                return new CategorysPageLoaded({
                    categorys: result.items,
                    totalCount: result.totalCount,
                    page: lastQuery
                });
            }),
        );

    @Effect()
    deleteCategory$ = this.actions$
        .pipe(
            ofType<OneCategoryDeleted>(CategoryActionTypes.OneCategoryDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showLoadingDistpatcher);
                    return this.categorysService.deleteCategory(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    deleteCategorys$ = this.actions$
        .pipe(
            ofType<ManyCategorysDeleted>(CategoryActionTypes.ManyCategorysDeleted),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.categorysService.deleteCategories(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateCategorysStatus$ = this.actions$
        .pipe(
            ofType<CategorysParentUpdated>(CategoryActionTypes.CategorysParentUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.categorysService.updateParentForCategory(payload.categorys, payload.id_parent);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateCategory$ = this.actions$
        .pipe(
            ofType<CategoryUpdated>(CategoryActionTypes.CategoryUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.categorysService.updateCategory(payload.category);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    createCategory$ = this.actions$
        .pipe(
            ofType<CategoryOnServerCreated>(CategoryActionTypes.CategoryOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.categorysService.createCategory(payload.category).pipe(
                    tap(res => {
                        this.store.dispatch(new CategoryCreated({ category: res }));
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

    constructor(private actions$: Actions, private categorysService: CategoryService, private store: Store<AppState>) { }
}
