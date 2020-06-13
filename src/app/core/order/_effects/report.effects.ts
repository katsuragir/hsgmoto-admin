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
import { ReportService } from '../_services';
// State
import { AppState } from '../../reducers';
// Actions
import {
	ReportActionTypes,
	ReportsPageRequested,
	ReportsPageLoaded,
	ManyReportsDeleted,
	OneReportDeleted,
	ReportsPageToggleLoading,
	ReportsParentUpdated,
	ReportUpdated,
	ReportCreated,
	ReportOnServerCreated
} from '../_actions/report.actions';
import { defer, Observable, of } from 'rxjs';

@Injectable()
export class ReportEffects {
	showPageLoadingDistpatcher = new ReportsPageToggleLoading({ isLoading: true });
	showLoadingDistpatcher = new ReportsPageToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ReportsPageToggleLoading({ isLoading: false });

	@Effect()
	loadReportsPage$ = this.actions$
		.pipe(
			ofType<ReportsPageRequested>(ReportActionTypes.ReportsPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.reportsService.findReports(payload.page);
				const lastQuery = of(payload.page);
				// tslint:disable-next-line: deprecation
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = response[0];
				const lastQuery: QueryParamsModel = response[1];
				return new ReportsPageLoaded({
					reports: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	createReport$ = this.actions$
		.pipe(
			ofType<ReportOnServerCreated>(ReportActionTypes.ReportOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.reportsService.createReport(payload.report).pipe(
					tap(res => {
						this.store.dispatch(new ReportCreated({ report: res }));
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

	constructor(private actions$: Actions, private reportsService: ReportService, private store: Store<AppState>) { }
}
