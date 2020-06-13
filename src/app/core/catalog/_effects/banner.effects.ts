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
import { BannerService } from '../_services';
// State
import { AppState } from '../../reducers';
// Actions
import {
	BannerActionTypes,
	BannersPageRequested,
	BannersPageLoaded,
	ManyBannersDeleted,
	OneBannerDeleted,
	BannersPageToggleLoading,
	BannerUpdated,
	BannerCreated,
	BannerOnServerCreated
} from '../_actions/banner.actions';
import { defer, Observable, of } from 'rxjs';

@Injectable()
export class BannerEffects {
	showPageLoadingDistpatcher = new BannersPageToggleLoading({ isLoading: true });
	showLoadingDistpatcher = new BannersPageToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new BannersPageToggleLoading({ isLoading: false });

	@Effect()
	loadBannersPage$ = this.actions$
		.pipe(
			ofType<BannersPageRequested>(BannerActionTypes.BannersPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.bannersService.findBanners(payload.page);
				const lastQuery = of(payload.page);
				// tslint:disable-next-line: deprecation
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = response[0];
				const lastQuery: QueryParamsModel = response[1];
				return new BannersPageLoaded({
					banners: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteBanner$ = this.actions$
		.pipe(
			ofType<OneBannerDeleted>(BannerActionTypes.OneBannerDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showLoadingDistpatcher);
					return this.bannersService.deleteBanner(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	deleteBanners$ = this.actions$
		.pipe(
			ofType<ManyBannersDeleted>(BannerActionTypes.ManyBannersDeleted),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.bannersService.deleteBanners(payload.ids);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateBanner$ = this.actions$
		.pipe(
			ofType<BannerUpdated>(BannerActionTypes.BannerUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.bannersService.updateBanner(payload.banner);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBanner$ = this.actions$
		.pipe(
			ofType<BannerOnServerCreated>(BannerActionTypes.BannerOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.bannersService.createBanner(payload.banner).pipe(
					tap(res => {
						this.store.dispatch(new BannerCreated({ banner: res }));
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

	constructor(private actions$: Actions, private bannersService: BannerService, private store: Store<AppState>) { }
}
