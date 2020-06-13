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
import { BarangService } from '../_services';
// State
import { AppState } from '../../reducers';
// Actions
import {
	BarangActionTypes,
	ImageActionTypes,
	BarangsPageRequested,
	BarangsPageLoaded,
	ManyBarangsDeleted,
	OneBarangDeleted,
	OneImageDeleted,
	BarangsPageToggleLoading,
	BarangsParentUpdated,
	BarangUpdated,
	BarangCreated,
	BarangOnServerCreated
} from '../_actions/barang.actions';
import { defer, Observable, of } from 'rxjs';

@Injectable()
export class BarangEffects {
	showPageLoadingDistpatcher = new BarangsPageToggleLoading({ isLoading: true });
	showLoadingDistpatcher = new BarangsPageToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new BarangsPageToggleLoading({ isLoading: false });

	@Effect()
	loadBarangsPage$ = this.actions$
		.pipe(
			ofType<BarangsPageRequested>(BarangActionTypes.BarangsPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.barangsService.findBarangs(payload.page, payload.params);
				const lastQuery = of(payload.page);
				// tslint:disable-next-line: deprecation
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = response[0];
				const lastQuery: QueryParamsModel = response[1];
				return new BarangsPageLoaded({
					barangs: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteBarang$ = this.actions$
		.pipe(
			ofType<OneBarangDeleted>(BarangActionTypes.OneBarangDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showLoadingDistpatcher);
					return this.barangsService.deleteBarang(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	deleteImage$ = this.actions$
		.pipe(
			ofType<OneImageDeleted>(ImageActionTypes.OneImageDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showLoadingDistpatcher);
					return this.barangsService.deleteImage(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	deleteBarangs$ = this.actions$
		.pipe(
			ofType<ManyBarangsDeleted>(BarangActionTypes.ManyBarangsDeleted),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.barangsService.deleteBarangs(payload.ids);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateBarangsStatus$ = this.actions$
		.pipe(
			ofType<BarangsParentUpdated>(BarangActionTypes.BarangsParentUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.barangsService.updateParentForBarang(payload.barangs, payload.id_parent);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateBarang$ = this.actions$
		.pipe(
			ofType<BarangUpdated>(BarangActionTypes.BarangUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.barangsService.updateBarang(payload.barang);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBarang$ = this.actions$
		.pipe(
			ofType<BarangOnServerCreated>(BarangActionTypes.BarangOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.barangsService.createBarang(payload.barang).pipe(
					tap(res => {
						this.store.dispatch(new BarangCreated({ barang: res }));
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

	constructor(private actions$: Actions, private barangsService: BarangService, private store: Store<AppState>) { }
}
