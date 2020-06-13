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
import { AboutUSService } from '../_services';
// State
import { AppState } from '../../reducers';
// Actions
import {
	AboutUSActionTypes,
	AboutUSsPageRequested,
	AboutUSsPageLoaded,
	ManyAboutUSsDeleted,
	OneAboutUSDeleted,
	AboutUSsActionToggleLoading,
	AboutUSsPageToggleLoading,
	AboutUSUpdated,
	AboutUSCreated,
	AboutUSOnServerCreated
} from '../_actions/about-us.actions';
import { of } from 'rxjs';

@Injectable()
export class AboutUSEffects {
	showPageLoadingDistpatcher = new AboutUSsPageToggleLoading({ isLoading: true });
	showActionLoadingDistpatcher = new AboutUSsActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new AboutUSsActionToggleLoading({ isLoading: false });

	@Effect()
	loadAboutUSsPage$ = this.actions$.pipe(
		ofType<AboutUSsPageRequested>(AboutUSActionTypes.AboutUSsPageRequested),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showPageLoadingDistpatcher);
			const requestToServer = this.aboutussService.findAboutUSs(payload.page);
			const lastQuery = of(payload.page);
			// tslint:disable-next-line: deprecation
			return forkJoin(requestToServer, lastQuery);
		}),
		map(response => {
			const result: QueryResultsModel = response[0];
			const lastQuery: QueryParamsModel = response[1];
			const pageLoadedDispatch = new AboutUSsPageLoaded({
				aboutuss: result.items,
				totalCount: result.totalCount,
				page: lastQuery
			});
			return pageLoadedDispatch;
		})
	);

	@Effect()
	deleteAboutUS$ = this.actions$
		.pipe(
			ofType<OneAboutUSDeleted>(AboutUSActionTypes.OneAboutUSDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.aboutussService.deleteAboutUS(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	deleteAboutUSs$ = this.actions$
		.pipe(
			ofType<ManyAboutUSsDeleted>(AboutUSActionTypes.ManyAboutUSsDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.aboutussService.deleteAboutUSs(payload.ids);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateAboutUS$ = this.actions$
		.pipe(
			ofType<AboutUSUpdated>(AboutUSActionTypes.AboutUSUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.aboutussService.updateAboutUS(payload.aboutus);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			})
		);

	@Effect()
	createAboutUS$ = this.actions$
		.pipe(
			ofType<AboutUSOnServerCreated>(AboutUSActionTypes.AboutUSOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.aboutussService.createAboutUS(payload.aboutus).pipe(
					tap(res => {
						this.store.dispatch(new AboutUSCreated({ aboutus: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private aboutussService: AboutUSService, private store: Store<AppState>) { }
}
