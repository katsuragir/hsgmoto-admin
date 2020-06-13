// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ConfirmModel } from '../_models/confirm.model';
import { Update } from '@ngrx/entity';

export enum ConfirmActionTypes {
    ConfirmOnServerCreated = '[Edit Confirm Component] Confirm On Server Created',
    ConfirmCreated = '[Edit Confirm Component] Confirm Created',
    ConfirmUpdated = '[Edit Confirm Component] Confirm Updated',
    ConfirmsParentUpdated = '[Confirms List Page] Confirms Parent Updated',
    OneConfirmDeleted = '[Confirms List Page] One Confirm Deleted',
    ManyConfirmsDeleted = '[Confirms List Page] Many Selected Confirms Deleted',
    ConfirmsPageRequested = '[Confirms List Page] Confirms Page Requested',
    ConfirmsPageLoaded = '[Confirms API] Confirms Page Loaded',
    ConfirmsPageCancelled = '[Confirms API] Confirms Page Cancelled',
    ConfirmsPageToggleLoading = '[Confirms] Confirms Page Toggle Loading',
    ConfirmsActionToggleLoading = '[Confirms] Confirms Action Toggle Loading'
}

export class ConfirmOnServerCreated implements Action {
    readonly type = ConfirmActionTypes.ConfirmOnServerCreated;
    constructor(public payload: { confirm: FormData }) { }
}

export class ConfirmCreated implements Action {
    readonly type = ConfirmActionTypes.ConfirmCreated;
    constructor(public payload: { confirm: ConfirmModel }) { }
}

export class ConfirmUpdated implements Action {
    readonly type = ConfirmActionTypes.ConfirmUpdated;
    constructor(public payload: {
        partialConfirm: Update<ConfirmModel>, // For State update
        confirm: FormData // For Server update (through service)
    }) { }
}

export class ConfirmsParentUpdated implements Action {
    readonly type = ConfirmActionTypes.ConfirmsParentUpdated;
    constructor(public payload: {
        confirms: ConfirmModel[],
        id_parent: number
    }) { }
}

export class OneConfirmDeleted implements Action {
    readonly type = ConfirmActionTypes.OneConfirmDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyConfirmsDeleted implements Action {
    readonly type = ConfirmActionTypes.ManyConfirmsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class ConfirmsPageRequested implements Action {
    readonly type = ConfirmActionTypes.ConfirmsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class ConfirmsPageLoaded implements Action {
    readonly type = ConfirmActionTypes.ConfirmsPageLoaded;
    constructor(public payload: { confirms: ConfirmModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class ConfirmsPageCancelled implements Action {
    readonly type = ConfirmActionTypes.ConfirmsPageCancelled;
}

export class ConfirmsPageToggleLoading implements Action {
    readonly type = ConfirmActionTypes.ConfirmsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class ConfirmsActionToggleLoading implements Action {
    readonly type = ConfirmActionTypes.ConfirmsActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type ConfirmActions = ConfirmOnServerCreated
| ConfirmCreated
| ConfirmUpdated
| ConfirmsParentUpdated
| OneConfirmDeleted
| ManyConfirmsDeleted
| ConfirmsPageRequested
| ConfirmsPageLoaded
| ConfirmsPageCancelled
| ConfirmsPageToggleLoading
| ConfirmsActionToggleLoading;
