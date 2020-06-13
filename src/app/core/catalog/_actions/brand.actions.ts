// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { BrandModel } from '../_models/brand.model';
import { Update } from '@ngrx/entity';

export enum BrandActionTypes {
    BrandOnServerCreated = '[Edit Brand Component] Brand On Server Created',
    BrandCreated = '[Edit Brand Component] Brand Created',
    BrandUpdated = '[Edit Brand Component] Brand Updated',
    BrandsParentUpdated = '[Brands List Page] Brands Parent Updated',
    OneBrandDeleted = '[Brands List Page] One Brand Deleted',
    ManyBrandsDeleted = '[Brands List Page] Many Selected Brands Deleted',
    BrandsPageRequested = '[Brands List Page] Brands Page Requested',
    BrandsPageLoaded = '[Brands API] Brands Page Loaded',
    BrandsPageCancelled = '[Brands API] Brands Page Cancelled',
    BrandsPageToggleLoading = '[Brands] Brands Page Toggle Loading',
    BrandsActionToggleLoading = '[Brands] Brands Action Toggle Loading'
}

export class BrandOnServerCreated implements Action {
    readonly type = BrandActionTypes.BrandOnServerCreated;
    constructor(public payload: { brand: FormData }) { }
}

export class BrandCreated implements Action {
    readonly type = BrandActionTypes.BrandCreated;
    constructor(public payload: { brand: BrandModel }) { }
}

export class BrandUpdated implements Action {
    readonly type = BrandActionTypes.BrandUpdated;
    constructor(public payload: {
        partialBrand: Update<BrandModel>, // For State update
        brand: FormData // For Server update (through service)
    }) { }
}

export class BrandsParentUpdated implements Action {
    readonly type = BrandActionTypes.BrandsParentUpdated;
    constructor(public payload: {
        brands: BrandModel[],
        id_parent: number
    }) { }
}

export class OneBrandDeleted implements Action {
    readonly type = BrandActionTypes.OneBrandDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyBrandsDeleted implements Action {
    readonly type = BrandActionTypes.ManyBrandsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class BrandsPageRequested implements Action {
    readonly type = BrandActionTypes.BrandsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class BrandsPageLoaded implements Action {
    readonly type = BrandActionTypes.BrandsPageLoaded;
    constructor(public payload: { brands: BrandModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class BrandsPageCancelled implements Action {
    readonly type = BrandActionTypes.BrandsPageCancelled;
}

export class BrandsPageToggleLoading implements Action {
    readonly type = BrandActionTypes.BrandsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class BrandsActionToggleLoading implements Action {
    readonly type = BrandActionTypes.BrandsActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type BrandActions = BrandOnServerCreated
| BrandCreated
| BrandUpdated
| BrandsParentUpdated
| OneBrandDeleted
| ManyBrandsDeleted
| BrandsPageRequested
| BrandsPageLoaded
| BrandsPageCancelled
| BrandsPageToggleLoading
| BrandsActionToggleLoading;
