// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ShippingModel } from '../_models/shipping.model';
import { Update } from '@ngrx/entity';

export enum ShippingActionTypes {
    ShippingOnServerCreated = '[Edit Shipping Component] Shipping On Server Created',
    ShippingCreated = '[Edit Shipping Component] Shipping Created',
    ShippingUpdated = '[Edit Shipping Component] Shipping Updated',
    ShippingsParentUpdated = '[Shippings List Page] Shippings Parent Updated',
    OneShippingDeleted = '[Shippings List Page] One Shipping Deleted',
    ManyShippingsDeleted = '[Shippings List Page] Many Selected Shippings Deleted',
    ShippingsPageRequested = '[Shippings List Page] Shippings Page Requested',
    ShippingsPageLoaded = '[Shippings API] Shippings Page Loaded',
    ShippingsPageCancelled = '[Shippings API] Shippings Page Cancelled',
    ShippingsPageToggleLoading = '[Shippings] Shippings Page Toggle Loading',
    ShippingsActionToggleLoading = '[Shippings] Shippings Action Toggle Loading'
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

export class ShippingOnServerCreated implements Action {
    readonly type = ShippingActionTypes.ShippingOnServerCreated;
    constructor(public payload: { shipping: FormData}) { }
}

export class ShippingCreated implements Action {
    readonly type = ShippingActionTypes.ShippingCreated;
    constructor(public payload: { shipping: ShippingModel }) { }
}

export class ShippingUpdated implements Action {
    readonly type = ShippingActionTypes.ShippingUpdated;
    constructor(public payload: {
        partialShipping: Update<ShippingModel>, // For State update
        shipping: ShippingModel // For Server update (through service)
    }) { }
}

export class ShippingsParentUpdated implements Action {
    readonly type = ShippingActionTypes.ShippingsParentUpdated;
    constructor(public payload: {
        shippings: ShippingModel[],
        id_parent: number
    }) { }
}

export class OneShippingDeleted implements Action {
    readonly type = ShippingActionTypes.OneShippingDeleted;
    constructor(public payload: { id: number }) {}
}

export class OneImageDeleted implements Action {
    readonly type = ImageActionTypes.OneImageDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyShippingsDeleted implements Action {
    readonly type = ShippingActionTypes.ManyShippingsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class ShippingsPageRequested implements Action {
    readonly type = ShippingActionTypes.ShippingsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class ShippingsPageLoaded implements Action {
    readonly type = ShippingActionTypes.ShippingsPageLoaded;
    constructor(public payload: { shippings: ShippingModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class ShippingsPageCancelled implements Action {
    readonly type = ShippingActionTypes.ShippingsPageCancelled;
}

export class ShippingsPageToggleLoading implements Action {
    readonly type = ShippingActionTypes.ShippingsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class ShippingsActionToggleLoading implements Action {
    readonly type = ShippingActionTypes.ShippingsActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type ShippingActions = ShippingOnServerCreated
| ShippingCreated
| ShippingUpdated
| ShippingsParentUpdated
| OneShippingDeleted
| ManyShippingsDeleted
| ShippingsPageRequested
| ShippingsPageLoaded
| ShippingsPageCancelled
| ShippingsPageToggleLoading
| ShippingsActionToggleLoading;
