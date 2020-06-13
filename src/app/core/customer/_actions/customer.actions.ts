// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { CustomerModel } from '../_models/customer.model';
import { Update } from '@ngrx/entity';

export enum CustomerActionTypes {
    CustomerOnServerCreated = '[Edit Customer Component] Customer On Server Created',
    CustomerCreated = '[Edit Customer Component] Customer Created',
    CustomerUpdated = '[Edit Customer Component] Customer Updated',
    CustomersParentUpdated = '[Customers List Page] Customers Parent Updated',
    OneCustomerDeleted = '[Customers List Page] One Customer Deleted',
    ManyCustomersDeleted = '[Customers List Page] Many Selected Customers Deleted',
    CustomersPageRequested = '[Customers List Page] Customers Page Requested',
    CustomersPageLoaded = '[Customers API] Customers Page Loaded',
    CustomersPageCancelled = '[Customers API] Customers Page Cancelled',
    CustomersPageToggleLoading = '[Customers] Customers Page Toggle Loading',
    CustomersActionToggleLoading = '[Customers] Customers Action Toggle Loading'
}

export class CustomerOnServerCreated implements Action {
    readonly type = CustomerActionTypes.CustomerOnServerCreated;
    constructor(public payload: { customer: CustomerModel }) { }
}

export class CustomerCreated implements Action {
    readonly type = CustomerActionTypes.CustomerCreated;
    constructor(public payload: { customer: CustomerModel }) { }
}

export class CustomerUpdated implements Action {
    readonly type = CustomerActionTypes.CustomerUpdated;
    constructor(public payload: {
        partialCustomer: Update<CustomerModel>, // For State update
        customer: CustomerModel // For Server update (through service)
    }) { }
}

export class CustomersParentUpdated implements Action {
    readonly type = CustomerActionTypes.CustomersParentUpdated;
    constructor(public payload: {
        customers: CustomerModel[],
        id_parent: number
    }) { }
}

export class OneCustomerDeleted implements Action {
    readonly type = CustomerActionTypes.OneCustomerDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyCustomersDeleted implements Action {
    readonly type = CustomerActionTypes.ManyCustomersDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class CustomersPageRequested implements Action {
    readonly type = CustomerActionTypes.CustomersPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class CustomersPageLoaded implements Action {
    readonly type = CustomerActionTypes.CustomersPageLoaded;
    constructor(public payload: { customers: CustomerModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class CustomersPageCancelled implements Action {
    readonly type = CustomerActionTypes.CustomersPageCancelled;
}

export class CustomersPageToggleLoading implements Action {
    readonly type = CustomerActionTypes.CustomersPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class CustomersActionToggleLoading implements Action {
    readonly type = CustomerActionTypes.CustomersActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type CustomerActions = CustomerOnServerCreated
| CustomerCreated
| CustomerUpdated
| CustomersParentUpdated
| OneCustomerDeleted
| ManyCustomersDeleted
| CustomersPageRequested
| CustomersPageLoaded
| CustomersPageCancelled
| CustomersPageToggleLoading
| CustomersActionToggleLoading;
