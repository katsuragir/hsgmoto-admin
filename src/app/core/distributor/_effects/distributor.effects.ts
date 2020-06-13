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
import { DistributorService } from '../_services/';
// State
import { AppState } from '../../../core/reducers';
// Actions
import {
	DistributorActionTypes,
	DistributorsPageRequested,
	DistributorsPageLoaded,
	ManyDistributorsDeleted,
	OneDistributorDeleted,
	DistributorsActionToggleLoading,
	DistributorsPageToggleLoading,
	DistributorUpdated,
	DistributorCreated,
	DistributorOnServerCreated
} from '../_actions/distributors.actions';
import { of } from 'rxjs';

@Injectable()
export class DistributorEffects {
	showPageLoadingDistpatcher = new DistributorsPageToggleLoading({ isLoading: true });
	showActionLoadingDistpatcher = new DistributorsActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new DistributorsActionToggleLoading({ isLoading: false });

	@Effect()
	loadDistributorsPage$ = this.actions$.pipe(
		ofType<DistributorsPageRequested>(DistributorActionTypes.DistributorsPageRequested),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showPageLoadingDistpatcher);
			const requestToServer = this.distributorsService.findDistributors(payload.page);
			const lastQuery = of(payload.page);
			// tslint:disable-next-line: deprecation
			return forkJoin(requestToServer, lastQuery);
		}),
		map(response => {
			const result: QueryResultsModel = response[0];
			const lastQuery: QueryParamsModel = response[1];
			const pageLoadedDispatch = new DistributorsPageLoaded({
				distributors: result.items,
				totalCount: result.totalCount,
				page: lastQuery
			});
			return pageLoadedDispatch;
		})
	);

	@Effect()
	deleteDistributor$ = this.actions$
		.pipe(
			ofType<OneDistributorDeleted>(DistributorActionTypes.OneDistributorDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.distributorsService.deleteDistributor(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	deleteDistributors$ = this.actions$
		.pipe(
			ofType<ManyDistributorsDeleted>(DistributorActionTypes.ManyDistributorsDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.distributorsService.deleteDistributors(payload.ids);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateDistributor$ = this.actions$
		.pipe(
			ofType<DistributorUpdated>(DistributorActionTypes.DistributorUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.distributorsService.updateDistributor(payload.distributor);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			})
		);

	@Effect()
	createDistributor$ = this.actions$
		.pipe(
			ofType<DistributorOnServerCreated>(DistributorActionTypes.DistributorOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.distributorsService.createDistributor(payload.distributor).pipe(
					tap(res => {
						this.store.dispatch(new DistributorCreated({ distributor: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private distributorsService: DistributorService, private store: Store<AppState>) { }
}
