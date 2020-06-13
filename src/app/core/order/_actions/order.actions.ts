// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { OrderModel } from '../_models/order.model';
import { Update } from '@ngrx/entity';

export enum OrderActionTypes {
	OrderOnServerCreated = '[Edit Order Component] Order On Server Created',
	OrderCreated = '[Edit Order Component] Order Created',
	OrderUpdated = '[Edit Order Component] Order Updated',
	OrdersParentUpdated = '[Orders List Page] Orders Parent Updated',
	OneOrderDeleted = '[Orders List Page] One Order Deleted',
	ManyOrdersDeleted = '[Orders List Page] Many Selected Orders Deleted',
	OrdersPageRequested = '[Orders List Page] Orders Page Requested',
	OrdersPageLoaded = '[Orders API] Orders Page Loaded',
	OrdersPageCancelled = '[Orders API] Orders Page Cancelled',
	OrdersPageToggleLoading = '[Orders] Orders Page Toggle Loading',
	OrdersActionToggleLoading = '[Orders] Orders Action Toggle Loading'
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

export class OrderOnServerCreated implements Action {
	readonly type = OrderActionTypes.OrderOnServerCreated;
	constructor(public payload: { order: FormData}) { }
}

export class OrderCreated implements Action {
	readonly type = OrderActionTypes.OrderCreated;
	constructor(public payload: { order: OrderModel }) { }
}

export class OrderUpdated implements Action {
	readonly type = OrderActionTypes.OrderUpdated;
	constructor(public payload: {
		partialOrder: Update<OrderModel>, // For State update
		order: OrderModel // For Server update (through service)
	}) { }
}

export class OrdersParentUpdated implements Action {
	readonly type = OrderActionTypes.OrdersParentUpdated;
	constructor(public payload: {
		orders: OrderModel[],
		id_parent: number
	}) { }
}

export class OneOrderDeleted implements Action {
	readonly type = OrderActionTypes.OneOrderDeleted;
	constructor(public payload: { id: string }) {}
}

export class OneImageDeleted implements Action {
	readonly type = ImageActionTypes.OneImageDeleted;
	constructor(public payload: { id: number }) {}
}

export class ManyOrdersDeleted implements Action {
	readonly type = OrderActionTypes.ManyOrdersDeleted;
	constructor(public payload: { ids: string[] }) {}
}

export class OrdersPageRequested implements Action {
	readonly type = OrderActionTypes.OrdersPageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class OrdersPageLoaded implements Action {
	readonly type = OrderActionTypes.OrdersPageLoaded;
	constructor(public payload: { orders: OrderModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class OrdersPageCancelled implements Action {
	readonly type = OrderActionTypes.OrdersPageCancelled;
}

export class OrdersPageToggleLoading implements Action {
	readonly type = OrderActionTypes.OrdersPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class OrdersActionToggleLoading implements Action {
	readonly type = OrderActionTypes.OrdersActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type OrderActions = OrderOnServerCreated
| OrderCreated
| OrderUpdated
| OrdersParentUpdated
| OneOrderDeleted
| ManyOrdersDeleted
| OrdersPageRequested
| OrdersPageLoaded
| OrdersPageCancelled
| OrdersPageToggleLoading
| OrdersActionToggleLoading;
