// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ReportModel } from '../_models/report.model';
import { Update } from '@ngrx/entity';

export enum ReportActionTypes {
	ReportOnServerCreated = '[Edit Report Component] Report On Server Created',
	ReportCreated = '[Edit Report Component] Report Created',
	ReportUpdated = '[Edit Report Component] Report Updated',
	ReportsParentUpdated = '[Reports List Page] Reports Parent Updated',
	OneReportDeleted = '[Reports List Page] One Report Deleted',
	ManyReportsDeleted = '[Reports List Page] Many Selected Reports Deleted',
	ReportsPageRequested = '[Reports List Page] Reports Page Requested',
	ReportsPageLoaded = '[Reports API] Reports Page Loaded',
	ReportsPageCancelled = '[Reports API] Reports Page Cancelled',
	ReportsPageToggleLoading = '[Reports] Reports Page Toggle Loading',
	ReportsActionToggleLoading = '[Reports] Reports Action Toggle Loading'
}

export class ReportOnServerCreated implements Action {
	readonly type = ReportActionTypes.ReportOnServerCreated;
	constructor(public payload: { report: FormData}) { }
}

export class ReportCreated implements Action {
	readonly type = ReportActionTypes.ReportCreated;
	constructor(public payload: { report: ReportModel }) { }
}

export class ReportUpdated implements Action {
	readonly type = ReportActionTypes.ReportUpdated;
	constructor(public payload: {
		partialReport: Update<ReportModel>, // For State update
		report: ReportModel // For Server update (through service)
	}) { }
}

export class ReportsParentUpdated implements Action {
	readonly type = ReportActionTypes.ReportsParentUpdated;
	constructor(public payload: {
		reports: ReportModel[],
		id_parent: number
	}) { }
}

export class OneReportDeleted implements Action {
	readonly type = ReportActionTypes.OneReportDeleted;
	constructor(public payload: { id: string }) {}
}

export class ManyReportsDeleted implements Action {
	readonly type = ReportActionTypes.ManyReportsDeleted;
	constructor(public payload: { ids: string[] }) {}
}

export class ReportsPageRequested implements Action {
	readonly type = ReportActionTypes.ReportsPageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class ReportsPageLoaded implements Action {
	readonly type = ReportActionTypes.ReportsPageLoaded;
	constructor(public payload: { reports: ReportModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class ReportsPageCancelled implements Action {
	readonly type = ReportActionTypes.ReportsPageCancelled;
}

export class ReportsPageToggleLoading implements Action {
	readonly type = ReportActionTypes.ReportsPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class ReportsActionToggleLoading implements Action {
	readonly type = ReportActionTypes.ReportsActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type ReportActions = ReportOnServerCreated
| ReportCreated
| ReportUpdated
| ReportsParentUpdated
| OneReportDeleted
| ManyReportsDeleted
| ReportsPageRequested
| ReportsPageLoaded
| ReportsPageCancelled
| ReportsPageToggleLoading
| ReportsActionToggleLoading;
