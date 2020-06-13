// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { DistributorModel } from '../_models/distributor.model';
import { Update } from '@ngrx/entity';

export enum DistributorActionTypes {
	DistributorOnServerCreated = '[Edit Distributor Component] Distributor On Server Created',
	DistributorCreated = '[Edit Distributor Component] Distributor Created',
	DistributorUpdated = '[Edit Distributor Component] Distributor Updated',
	DistributorsParentUpdated = '[Distributors List Page] Distributors Parent Updated',
	OneDistributorDeleted = '[Distributors List Page] One Distributor Deleted',
	ManyDistributorsDeleted = '[Distributors List Page] Many Selected Distributors Deleted',
	DistributorsPageRequested = '[Distributors List Page] Distributors Page Requested',
	DistributorsPageLoaded = '[Distributors API] Distributors Page Loaded',
	DistributorsPageCancelled = '[Distributors API] Distributors Page Cancelled',
	DistributorsPageToggleLoading = '[Distributors] Distributors Page Toggle Loading',
	DistributorsActionToggleLoading = '[Distributors] Distributors Action Toggle Loading'
}

export class DistributorOnServerCreated implements Action {
	readonly type = DistributorActionTypes.DistributorOnServerCreated;
	constructor(public payload: { distributor: FormData }) { }
}

export class DistributorCreated implements Action {
	readonly type = DistributorActionTypes.DistributorCreated;
	constructor(public payload: { distributor: DistributorModel }) { }
}

export class DistributorUpdated implements Action {
	readonly type = DistributorActionTypes.DistributorUpdated;
	constructor(public payload: {
		partialDistributor: Update<DistributorModel>, // For State update
		distributor: FormData // For Server update (through service)
	}) { }
}

export class DistributorsParentUpdated implements Action {
	readonly type = DistributorActionTypes.DistributorsParentUpdated;
	constructor(public payload: {
		distributors: DistributorModel[],
		id_parent: number
	}) { }
}

export class OneDistributorDeleted implements Action {
	readonly type = DistributorActionTypes.OneDistributorDeleted;
	constructor(public payload: { id: number }) {}
}

export class ManyDistributorsDeleted implements Action {
	readonly type = DistributorActionTypes.ManyDistributorsDeleted;
	constructor(public payload: { ids: number[] }) {}
}

export class DistributorsPageRequested implements Action {
	readonly type = DistributorActionTypes.DistributorsPageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class DistributorsPageLoaded implements Action {
	readonly type = DistributorActionTypes.DistributorsPageLoaded;
	constructor(public payload: { distributors: DistributorModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class DistributorsPageCancelled implements Action {
	readonly type = DistributorActionTypes.DistributorsPageCancelled;
}

export class DistributorsPageToggleLoading implements Action {
	readonly type = DistributorActionTypes.DistributorsPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class DistributorsActionToggleLoading implements Action {
	readonly type = DistributorActionTypes.DistributorsActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type DistributorActions = DistributorOnServerCreated
| DistributorCreated
| DistributorUpdated
| DistributorsParentUpdated
| OneDistributorDeleted
| ManyDistributorsDeleted
| DistributorsPageRequested
| DistributorsPageLoaded
| DistributorsPageCancelled
| DistributorsPageToggleLoading
| DistributorsActionToggleLoading;
