import { QueryParamsModel } from './../../_base/crud/models/query-models/query-params.model';
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
import { BrandService } from '../_services/';
// State
import { AppState } from '../../../core/reducers';
// Actions
import {
	BrandActionTypes,
	BrandsPageRequested,
	BrandsPageLoaded,
	ManyBrandsDeleted,
	OneBrandDeleted,
	BrandsActionToggleLoading,
	BrandsPageToggleLoading,
	BrandUpdated,
	BrandCreated,
	BrandOnServerCreated
} from '../_actions/brand.actions';
import { of } from 'rxjs';

@Injectable()
export class BrandEffects {
	showPageLoadingDistpatcher = new BrandsPageToggleLoading({ isLoading: true });
	showActionLoadingDistpatcher = new BrandsActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new BrandsActionToggleLoading({ isLoading: false });

	@Effect()
	loadBrandsPage$ = this.actions$.pipe(
		ofType<BrandsPageRequested>(BrandActionTypes.BrandsPageRequested),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showPageLoadingDistpatcher);
			const requestToServer = this.brandsService.findBrands(payload.page);
			const lastQuery = of(payload.page);
			// tslint:disable-next-line: deprecation
			return forkJoin(requestToServer, lastQuery);
		}),
		map(response => {
			const result: QueryResultsModel = response[0];
			const lastQuery: QueryParamsModel = response[1];
			const pageLoadedDispatch = new BrandsPageLoaded({
				brands: result.items,
				totalCount: result.totalCount,
				page: lastQuery
			});
			return pageLoadedDispatch;
		})
	);

	@Effect()
	deleteBrand$ = this.actions$
		.pipe(
			ofType<OneBrandDeleted>(BrandActionTypes.OneBrandDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.brandsService.deleteBrand(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	deleteBrands$ = this.actions$
		.pipe(
			ofType<ManyBrandsDeleted>(BrandActionTypes.ManyBrandsDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.brandsService.deleteBrands(payload.ids);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateBrand$ = this.actions$
		.pipe(
			ofType<BrandUpdated>(BrandActionTypes.BrandUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.brandsService.updateBrand(payload.brand);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			})
		);

	@Effect()
	createBrand$ = this.actions$
		.pipe(
			ofType<BrandOnServerCreated>(BrandActionTypes.BrandOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.brandsService.createBrand(payload.brand).pipe(
					tap(res => {
						this.store.dispatch(new BrandCreated({ brand: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private brandsService: BrandService, private store: Store<AppState>) { }
}
