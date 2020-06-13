// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { BarangModel } from '../_models/barang.model';
import { Update } from '@ngrx/entity';

export enum BarangActionTypes {
	BarangOnServerCreated = '[Edit Barang Component] Barang On Server Created',
	BarangCreated = '[Edit Barang Component] Barang Created',
	BarangUpdated = '[Edit Barang Component] Barang Updated',
	BarangsParentUpdated = '[Barangs List Page] Barangs Parent Updated',
	OneBarangDeleted = '[Barangs List Page] One Barang Deleted',
	ManyBarangsDeleted = '[Barangs List Page] Many Selected Barangs Deleted',
	BarangsPageRequested = '[Barangs List Page] Barangs Page Requested',
	BarangsPageLoaded = '[Barangs API] Barangs Page Loaded',
	BarangsPageCancelled = '[Barangs API] Barangs Page Cancelled',
	BarangsPageToggleLoading = '[Barangs] Barangs Page Toggle Loading',
	BarangsActionToggleLoading = '[Barangs] Barangs Action Toggle Loading'
}

export enum ImageActionTypes {
	ImageOnServerCreated = '[Edit Image Component] Image On Server Created',
	ImageCreated = '[Edit Image Component] Image Created',
	ImageUpdated = '[Edit Image Component] Image Updated',
	ImagesParentUpdated = '[Images List Page] Images Parent Updated',
	OneImageDeleted = '[Images List Page] One Image Deleted',
	ManyImagesDeleted = '[Images List Page] Many Selected Images Deleted',
	ImagesPageRequested = '[Images List Page] Images Page Requested',
	ImagesPageLoaded = '[Images API] Images Page Loaded',
	ImagesPageCancelled = '[Images API] Images Page Cancelled',
	ImagesPageToggleLoading = '[Images] Images Page Toggle Loading',
	ImagesActionToggleLoading = '[Images] Images Action Toggle Loading'
}

export class BarangOnServerCreated implements Action {
	readonly type = BarangActionTypes.BarangOnServerCreated;
	constructor(public payload: { barang: FormData}) { }
}

export class BarangCreated implements Action {
	readonly type = BarangActionTypes.BarangCreated;
	constructor(public payload: { barang: BarangModel }) { }
}

export class BarangUpdated implements Action {
	readonly type = BarangActionTypes.BarangUpdated;
	constructor(public payload: {
		partialBarang: Update<BarangModel>, // For State update
		barang: FormData // For Server update (through service)
	}) { }
}

export class BarangsParentUpdated implements Action {
	readonly type = BarangActionTypes.BarangsParentUpdated;
	constructor(public payload: {
		barangs: BarangModel[],
		id_parent: number
	}) { }
}

export class OneBarangDeleted implements Action {
	readonly type = BarangActionTypes.OneBarangDeleted;
	constructor(public payload: { id: number }) {}
}

export class OneImageDeleted implements Action {
	readonly type = ImageActionTypes.OneImageDeleted;
	constructor(public payload: { id: number }) {}
}

export class ManyBarangsDeleted implements Action {
	readonly type = BarangActionTypes.ManyBarangsDeleted;
	constructor(public payload: { ids: number[] }) {}
}

export class BarangsPageRequested implements Action {
	readonly type = BarangActionTypes.BarangsPageRequested;
	constructor(public payload: { page: QueryParamsModel, params: string }) { }
}

export class BarangsPageLoaded implements Action {
	readonly type = BarangActionTypes.BarangsPageLoaded;
	constructor(public payload: { barangs: BarangModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class BarangsPageCancelled implements Action {
	readonly type = BarangActionTypes.BarangsPageCancelled;
}

export class BarangsPageToggleLoading implements Action {
	readonly type = BarangActionTypes.BarangsPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class BarangsActionToggleLoading implements Action {
	readonly type = BarangActionTypes.BarangsActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type BarangActions = BarangOnServerCreated
| BarangCreated
| BarangUpdated
| BarangsParentUpdated
| OneBarangDeleted
| ManyBarangsDeleted
| BarangsPageRequested
| BarangsPageLoaded
| BarangsPageCancelled
| BarangsPageToggleLoading
| BarangsActionToggleLoading;
