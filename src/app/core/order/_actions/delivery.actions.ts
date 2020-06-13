// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { DeliveryModel } from '../_models/delivery.model';
import { Update } from '@ngrx/entity';

export enum DeliveryActionTypes {
	DeliveryOnServerCreated = '[Edit Delivery Component] Delivery On Server Created',
	DeliveryCreated = '[Edit Delivery Component] Delivery Created',
	DeliveryUpdated = '[Edit Delivery Component] Delivery Updated',
	DeliverysParentUpdated = '[Deliverys List Page] Deliverys Parent Updated',
	OneDeliveryDeleted = '[Deliverys List Page] One Delivery Deleted',
	ManyDeliverysDeleted = '[Deliverys List Page] Many Selected Deliverys Deleted',
	DeliverysPageRequested = '[Deliverys List Page] Deliverys Page Requested',
	DeliverysPageLoaded = '[Deliverys API] Deliverys Page Loaded',
	DeliverysPageCancelled = '[Deliverys API] Deliverys Page Cancelled',
	DeliverysPageToggleLoading = '[Deliverys] Deliverys Page Toggle Loading',
	DeliverysActionToggleLoading = '[Deliverys] Deliverys Action Toggle Loading'
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

export class DeliveryOnServerCreated implements Action {
	readonly type = DeliveryActionTypes.DeliveryOnServerCreated;
	constructor(public payload: { delivery: FormData}) { }
}

export class DeliveryCreated implements Action {
	readonly type = DeliveryActionTypes.DeliveryCreated;
	constructor(public payload: { delivery: DeliveryModel }) { }
}

export class DeliveryUpdated implements Action {
	readonly type = DeliveryActionTypes.DeliveryUpdated;
	constructor(public payload: {
		partialDelivery: Update<DeliveryModel>, // For State update
		delivery: DeliveryModel // For Server update (through service)
	}) { }
}

export class DeliverysParentUpdated implements Action {
	readonly type = DeliveryActionTypes.DeliverysParentUpdated;
	constructor(public payload: {
		deliveries: DeliveryModel[],
		id_parent: number
	}) { }
}

export class OneDeliveryDeleted implements Action {
	readonly type = DeliveryActionTypes.OneDeliveryDeleted;
	constructor(public payload: { id: number }) {}
}

export class OneImageDeleted implements Action {
	readonly type = ImageActionTypes.OneImageDeleted;
	constructor(public payload: { id: number }) {}
}

export class ManyDeliverysDeleted implements Action {
	readonly type = DeliveryActionTypes.ManyDeliverysDeleted;
	constructor(public payload: { ids: number[] }) {}
}

export class DeliverysPageRequested implements Action {
	readonly type = DeliveryActionTypes.DeliverysPageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class DeliverysPageLoaded implements Action {
	readonly type = DeliveryActionTypes.DeliverysPageLoaded;
	constructor(public payload: { deliveries: DeliveryModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class DeliverysPageCancelled implements Action {
	readonly type = DeliveryActionTypes.DeliverysPageCancelled;
}

export class DeliverysPageToggleLoading implements Action {
	readonly type = DeliveryActionTypes.DeliverysPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class DeliverysActionToggleLoading implements Action {
	readonly type = DeliveryActionTypes.DeliverysActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type DeliveryActions = DeliveryOnServerCreated
| DeliveryCreated
| DeliveryUpdated
| DeliverysParentUpdated
| OneDeliveryDeleted
| ManyDeliverysDeleted
| DeliverysPageRequested
| DeliverysPageLoaded
| DeliverysPageCancelled
| DeliverysPageToggleLoading
| DeliverysActionToggleLoading;
