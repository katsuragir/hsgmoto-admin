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
import { DiscountService } from '../_services';
// State
import { AppState } from '../../reducers';
// Actions
import {
	DiscountActionTypes,
	DiscountsPageRequested,
	DiscountsPageLoaded,
	ManyDiscountsDeleted,
	OneDiscountDeleted,
	DiscountsPageToggleLoading,
	DiscountsParentUpdated,
	DiscountUpdated,
	DiscountCreated,
	DiscountOnServerCreated
} from '../_actions/discount.actions';
import { defer, Observable, of } from 'rxjs';

@Injectable()
export class DiscountEffects {
	showPageLoadingDistpatcher = new DiscountsPageToggleLoading({ isLoading: true });
	showLoadingDistpatcher = new DiscountsPageToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new DiscountsPageToggleLoading({ isLoading: false });

	@Effect()
	loadDiscountsPage$ = this.actions$
		.pipe(
			ofType<DiscountsPageRequested>(DiscountActionTypes.DiscountsPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.discountsService.findDiscounts(payload.page);
				const lastQuery = of(payload.page);
				// tslint:disable-next-line: deprecation
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = response[0];
				const lastQuery: QueryParamsModel = response[1];
				return new DiscountsPageLoaded({
					discounts: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteDiscount$ = this.actions$
		.pipe(
			ofType<OneDiscountDeleted>(DiscountActionTypes.OneDiscountDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showLoadingDistpatcher);
					return this.discountsService.deleteDiscount(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	deleteDiscounts$ = this.actions$
		.pipe(
			ofType<ManyDiscountsDeleted>(DiscountActionTypes.ManyDiscountsDeleted),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.discountsService.deleteDiscounts(payload.ids);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateDiscount$ = this.actions$
		.pipe(
			ofType<DiscountUpdated>(DiscountActionTypes.DiscountUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.discountsService.updateDiscount(payload.discount);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createDiscount$ = this.actions$
		.pipe(
			ofType<DiscountOnServerCreated>(DiscountActionTypes.DiscountOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.discountsService.createDiscount(payload.discount).pipe(
					tap(res => {
						this.store.dispatch(new DiscountCreated({ discount: res }));
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

	constructor(private actions$: Actions, private discountsService: DiscountService, private store: Store<AppState>) { }
}
