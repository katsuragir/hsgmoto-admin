
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { ReportActions, ReportActionTypes } from '../_actions/report.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ReportModel } from '../_models/report.model';

export interface ReportsState extends EntityState<ReportModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastQuery: QueryParamsModel;
    lastCreatedReportId: number;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ReportModel> = createEntityAdapter<ReportModel>();

export const initialReportsState: ReportsState = adapter.getInitialState({
    listLoading: true,
    actionsloading: false,
    totalCount: 0,
    lastQuery:  new QueryParamsModel({}),
    lastCreatedReportId: undefined,
    showInitWaitingMessage: true
});

export function reportsReducer(state = initialReportsState, action: ReportActions): ReportsState {
    switch  (action.type) {
        case ReportActionTypes.ReportsPageToggleLoading: return {
            ...state, listLoading: action.payload.isLoading, lastCreatedReportId: undefined
        };
        case ReportActionTypes.ReportsActionToggleLoading: return {
            ...state, actionsloading: action.payload.isLoading
        };
        case ReportActionTypes.ReportOnServerCreated: return {
            ...state
        };
        case ReportActionTypes.ReportCreated: return adapter.addOne(action.payload.report, {
             ...state, lastCreatedReportId: action.payload.report.id
        });
        case ReportActionTypes.ReportUpdated: return adapter.updateOne(action.payload.partialReport, state);
        case ReportActionTypes.ReportsParentUpdated: {
            const _partialReports: Update<ReportModel>[] = [];
            // tslint:disable-next-line:prefer-const

            return adapter.updateMany(_partialReports, state);
        }
        case ReportActionTypes.OneReportDeleted: return adapter.removeOne(action.payload.id, state);
        case ReportActionTypes.ManyReportsDeleted: return adapter.removeMany(action.payload.ids, state);
        case ReportActionTypes.ReportsPageCancelled: return {
            ...state, listLoading: false, lastQuery: new QueryParamsModel({})
        };
        case ReportActionTypes.ReportsPageLoaded:
            return adapter.addMany(action.payload.reports, {
                ...initialReportsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        default: return state;
    }
}

export const getReportState = createFeatureSelector<ReportModel>('reports');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
