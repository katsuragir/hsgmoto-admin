// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { ReportsState } from '../_reducers/report.reducers';
import { ReportModel } from '../_models/report.model';

export const selectReportsState = createFeatureSelector<ReportsState>('reports');

export const selectReportById = (reportId: number) => createSelector(
    selectReportsState,
    reportsState => reportsState.entities[reportId]
);

export const selectReportsPageLoading = createSelector(
    selectReportsState,
    reportsState => reportsState.listLoading
);

export const selectReportsActionLoading = createSelector(
    selectReportsState,
    customersState => customersState.actionsloading
);

export const selectReportsPageLastQuery = createSelector(
    selectReportsState,
    reportsState => reportsState.lastQuery
);

export const selectLastCreatedReportId = createSelector(
    selectReportsState,
    reportsState => reportsState.lastCreatedReportId
);

export const selectReportsInitWaitingMessage = createSelector(
    selectReportsState,
    reportsState => reportsState.showInitWaitingMessage
);

export const selectReportsInStore = createSelector(
    selectReportsState,
    reportsState => {
        const items: ReportModel[] = [];
        each(reportsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: ReportModel[] = httpExtension.sortArray(items, reportsState.lastQuery.sortField, reportsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, reportsState.totalCount, '');
    }
);

export const selectHasReportsInStore = createSelector(
    selectReportsInStore,
    queryResult => {
        if (!queryResult.totalCount) {
            return false;
        }

        return true;
    }
);
