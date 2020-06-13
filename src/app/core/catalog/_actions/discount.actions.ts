// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { DiscountModel } from '../_models/discount.model';
import { Update } from '@ngrx/entity';

export enum DiscountActionTypes {
	DiscountOnServerCreated = '[Edit Discount Component] Discount On Server Created',
	DiscountCreated = '[Edit Discount Component] Discount Created',
	DiscountUpdated = '[Edit Discount Component] Discount Updated',
	DiscountsParentUpdated = '[Discounts List Page] Discounts Parent Updated',
	OneDiscountDeleted = '[Discounts List Page] One Discount Deleted',
	ManyDiscountsDeleted = '[Discounts List Page] Many Selected Discounts Deleted',
	DiscountsPageRequested = '[Discounts List Page] Discounts Page Requested',
	DiscountsPageLoaded = '[Discounts API] Discounts Page Loaded',
	DiscountsPageCancelled = '[Discounts API] Discounts Page Cancelled',
	DiscountsPageToggleLoading = '[Discounts] Discounts Page Toggle Loading',
	DiscountsActionToggleLoading = '[Discounts] Discounts Action Toggle Loading'
}

export class DiscountOnServerCreated implements Action {
	readonly type = DiscountActionTypes.DiscountOnServerCreated;
	constructor(public payload: { discount: DiscountModel }) { }
}

export class DiscountCreated implements Action {
	readonly type = DiscountActionTypes.DiscountCreated;
	constructor(public payload: { discount: DiscountModel }) { }
}

export class DiscountUpdated implements Action {
	readonly type = DiscountActionTypes.DiscountUpdated;
	constructor(public payload: {
		partialDiscount: Update<DiscountModel>, // For State update
		discount: DiscountModel // For Server update (through service)
	}) { }
}

export class DiscountsParentUpdated implements Action {
	readonly type = DiscountActionTypes.DiscountsParentUpdated;
	constructor(public payload: {
		discounts: DiscountModel[],
		id_parent: number
	}) { }
}

export class OneDiscountDeleted implements Action {
	readonly type = DiscountActionTypes.OneDiscountDeleted;
	constructor(public payload: { id: number }) {}
}

export class ManyDiscountsDeleted implements Action {
	readonly type = DiscountActionTypes.ManyDiscountsDeleted;
	constructor(public payload: { ids: number[] }) {}
}

export class DiscountsPageRequested implements Action {
	readonly type = DiscountActionTypes.DiscountsPageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class DiscountsPageLoaded implements Action {
	readonly type = DiscountActionTypes.DiscountsPageLoaded;
	constructor(public payload: { discounts: DiscountModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class DiscountsPageCancelled implements Action {
	readonly type = DiscountActionTypes.DiscountsPageCancelled;
}

export class DiscountsPageToggleLoading implements Action {
	readonly type = DiscountActionTypes.DiscountsPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class DiscountsActionToggleLoading implements Action {
	readonly type = DiscountActionTypes.DiscountsActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type DiscountActions = DiscountOnServerCreated
| DiscountCreated
| DiscountUpdated
| DiscountsParentUpdated
| OneDiscountDeleted
| ManyDiscountsDeleted
| DiscountsPageRequested
| DiscountsPageLoaded
| DiscountsPageCancelled
| DiscountsPageToggleLoading
| DiscountsActionToggleLoading;
