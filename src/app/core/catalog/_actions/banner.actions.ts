// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { BannerModel } from '../_models/banner.model';
import { Update } from '@ngrx/entity';

export enum BannerActionTypes {
	BannerOnServerCreated = '[Edit Banner Component] Banner On Server Created',
	BannerCreated = '[Edit Banner Component] Banner Created',
	BannerUpdated = '[Edit Banner Component] Banner Updated',
	OneBannerDeleted = '[Banners List Page] One Banner Deleted',
	ManyBannersDeleted = '[Banners List Page] Many Selected Banners Deleted',
	BannersPageRequested = '[Banners List Page] Banners Page Requested',
	BannersPageLoaded = '[Banners API] Banners Page Loaded',
	BannersPageCancelled = '[Banners API] Banners Page Cancelled',
	BannersPageToggleLoading = '[Banners] Banners Page Toggle Loading',
	BannersActionToggleLoading = '[Banners] Banners Action Toggle Loading'
}

export class BannerOnServerCreated implements Action {
	readonly type = BannerActionTypes.BannerOnServerCreated;
	constructor(public payload: { banner: FormData}) { }
}

export class BannerCreated implements Action {
	readonly type = BannerActionTypes.BannerCreated;
	constructor(public payload: { banner: BannerModel }) { }
}

export class BannerUpdated implements Action {
	readonly type = BannerActionTypes.BannerUpdated;
	constructor(public payload: {
		partialBanner: Update<BannerModel>, // For State update
		banner: FormData // For Server update (through service)
	}) { }
}

export class OneBannerDeleted implements Action {
	readonly type = BannerActionTypes.OneBannerDeleted;
	constructor(public payload: { id: number }) {}
}

export class ManyBannersDeleted implements Action {
	readonly type = BannerActionTypes.ManyBannersDeleted;
	constructor(public payload: { ids: number[] }) {}
}

export class BannersPageRequested implements Action {
	readonly type = BannerActionTypes.BannersPageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class BannersPageLoaded implements Action {
	readonly type = BannerActionTypes.BannersPageLoaded;
	constructor(public payload: { banners: BannerModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class BannersPageCancelled implements Action {
	readonly type = BannerActionTypes.BannersPageCancelled;
}

export class BannersPageToggleLoading implements Action {
	readonly type = BannerActionTypes.BannersPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class BannersActionToggleLoading implements Action {
	readonly type = BannerActionTypes.BannersActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type BannerActions = BannerOnServerCreated
| BannerCreated
| BannerUpdated
| OneBannerDeleted
| ManyBannersDeleted
| BannersPageRequested
| BannersPageLoaded
| BannersPageCancelled
| BannersPageToggleLoading
| BannersActionToggleLoading;
