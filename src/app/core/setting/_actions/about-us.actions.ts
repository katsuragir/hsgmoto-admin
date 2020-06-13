// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { AboutUSModel } from '../_models/about-us.model';
import { Update } from '@ngrx/entity';

export enum AboutUSActionTypes {
	AboutUSOnServerCreated = '[Edit AboutUS Component] AboutUS On Server Created',
	AboutUSCreated = '[Edit AboutUS Component] AboutUS Created',
	AboutUSUpdated = '[Edit AboutUS Component] AboutUS Updated',
	AboutUSsParentUpdated = '[AboutUSs List Page] AboutUSs Parent Updated',
	OneAboutUSDeleted = '[AboutUSs List Page] One AboutUS Deleted',
	ManyAboutUSsDeleted = '[AboutUSs List Page] Many Selected AboutUSs Deleted',
	AboutUSsPageRequested = '[AboutUSs List Page] AboutUSs Page Requested',
	AboutUSsPageLoaded = '[AboutUSs API] AboutUSs Page Loaded',
	AboutUSsPageCancelled = '[AboutUSs API] AboutUSs Page Cancelled',
	AboutUSsPageToggleLoading = '[AboutUSs] AboutUSs Page Toggle Loading',
	AboutUSsActionToggleLoading = '[AboutUSs] AboutUSs Action Toggle Loading'
}

export class AboutUSOnServerCreated implements Action {
	readonly type = AboutUSActionTypes.AboutUSOnServerCreated;
	constructor(public payload: { aboutus: AboutUSModel }) { }
}

export class AboutUSCreated implements Action {
	readonly type = AboutUSActionTypes.AboutUSCreated;
	constructor(public payload: { aboutus: AboutUSModel }) { }
}

export class AboutUSUpdated implements Action {
	readonly type = AboutUSActionTypes.AboutUSUpdated;
	constructor(public payload: {
		partialAboutUS: Update<AboutUSModel>, // For State update
		aboutus: AboutUSModel // For Server update (through service)
	}) { }
}

export class AboutUSsParentUpdated implements Action {
	readonly type = AboutUSActionTypes.AboutUSsParentUpdated;
	constructor(public payload: {
		aboutuss: AboutUSModel[],
		id_parent: number
	}) { }
}

export class OneAboutUSDeleted implements Action {
	readonly type = AboutUSActionTypes.OneAboutUSDeleted;
	constructor(public payload: { id: number }) {}
}

export class ManyAboutUSsDeleted implements Action {
	readonly type = AboutUSActionTypes.ManyAboutUSsDeleted;
	constructor(public payload: { ids: number[] }) {}
}

export class AboutUSsPageRequested implements Action {
	readonly type = AboutUSActionTypes.AboutUSsPageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class AboutUSsPageLoaded implements Action {
	readonly type = AboutUSActionTypes.AboutUSsPageLoaded;
	constructor(public payload: { aboutuss: AboutUSModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class AboutUSsPageCancelled implements Action {
	readonly type = AboutUSActionTypes.AboutUSsPageCancelled;
}

export class AboutUSsPageToggleLoading implements Action {
	readonly type = AboutUSActionTypes.AboutUSsPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class AboutUSsActionToggleLoading implements Action {
	readonly type = AboutUSActionTypes.AboutUSsActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type AboutUSActions = AboutUSOnServerCreated
| AboutUSCreated
| AboutUSUpdated
| AboutUSsParentUpdated
| OneAboutUSDeleted
| ManyAboutUSsDeleted
| AboutUSsPageRequested
| AboutUSsPageLoaded
| AboutUSsPageCancelled
| AboutUSsPageToggleLoading
| AboutUSsActionToggleLoading;
