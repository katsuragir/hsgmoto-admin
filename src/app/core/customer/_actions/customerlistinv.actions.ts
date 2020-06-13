// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ListInvModel } from '../_models/customerlistinv.model';
import { Update } from '@ngrx/entity';

export enum ListInvActionTypes {
	ListInvOnServerCreated = '[Edit Invoice Component] Invoice On Server Created',
	ListInvCreated = '[Edit Invoice Component] Invoice Created',
	ListInvUpdated = '[Edit Invoice Component] Invoice Updated',
	sListInvParentUpdated = '[Invoices List Page] Invoices Parent Updated',
	OneListInvDeleted = '[Invoices List Page] One Invoice Deleted',
	ManysListInvDeleted = '[Invoices List Page] Many Selected Invoices Deleted',
	sListInvPageRequested = '[Invoices List Page] Invoices Page Requested',
	sListInvPageLoaded = '[Invoices API] Invoices Page Loaded',
	sListInvPageCancelled = '[Invoices API] Invoices Page Cancelled',
	sListInvPageToggleLoading = '[Invoices] Invoices Page Toggle Loading',
	sListInvActionToggleLoading = '[Invoices] Invoices Action Toggle Loading'
}

export class ListInvOnServerCreated implements Action {
	readonly type = ListInvActionTypes.ListInvOnServerCreated;
	constructor(public payload: { invoice: ListInvModel }) { }
}

export class ListInvCreated implements Action {
	readonly type = ListInvActionTypes.ListInvCreated;
	constructor(public payload: { invoice: ListInvModel }) { }
}

export class ListInvUpdated implements Action {
	readonly type = ListInvActionTypes.ListInvUpdated;
	constructor(public payload: {
		partial: Update<ListInvModel>, // For State update
		invoice: ListInvModel // For Server update (through service)
	}) { }
}

export class ListInvParentUpdated implements Action {
	readonly type = ListInvActionTypes.sListInvParentUpdated;
	constructor(public payload: {
		invoices: ListInvModel[],
		id_parent: number
	}) { }
}

export class OneListInvDeleted implements Action {
	readonly type = ListInvActionTypes.OneListInvDeleted;
	constructor(public payload: { id: string }) {}
}

export class ManysListInvDeleted implements Action {
	readonly type = ListInvActionTypes.ManysListInvDeleted;
	constructor(public payload: { ids: string[] }) {}
}

export class ListInvPageRequested implements Action {
	readonly type = ListInvActionTypes.sListInvPageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class ListInvPageLoaded implements Action {
	readonly type = ListInvActionTypes.sListInvPageLoaded;
	constructor(public payload: { invoices: ListInvModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class ListInvPageCancelled implements Action {
	readonly type = ListInvActionTypes.sListInvPageCancelled;
}

export class ListInvPageToggleLoading implements Action {
	readonly type = ListInvActionTypes.sListInvPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class ListInvActionToggleLoading implements Action {
	readonly type = ListInvActionTypes.sListInvActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type ListInvActions = ListInvOnServerCreated
| ListInvCreated
| ListInvUpdated
| ListInvParentUpdated
| OneListInvDeleted
| ManysListInvDeleted
| ListInvPageRequested
| ListInvPageLoaded
| ListInvPageCancelled
| ListInvPageToggleLoading
| ListInvActionToggleLoading;
