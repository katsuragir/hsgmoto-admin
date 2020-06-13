
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { CustomerActions, CustomerActionTypes } from '../_actions/customer.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { CustomerModel } from '../_models/customer.model';

export interface CustomersState extends EntityState<CustomerModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastQuery: QueryParamsModel;
    lastCreatedCustomerId: number;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<CustomerModel> = createEntityAdapter<CustomerModel>();

export const initialCustomersState: CustomersState = adapter.getInitialState({
    listLoading: true,
    actionsloading: false,
    totalCount: 0,
    lastQuery:  new QueryParamsModel({}),
    lastCreatedCustomerId: undefined,
    showInitWaitingMessage: true
});

export function customersReducer(state = initialCustomersState, action: CustomerActions): CustomersState {
    switch  (action.type) {
        case CustomerActionTypes.CustomersPageToggleLoading: return {
            ...state, listLoading: action.payload.isLoading, lastCreatedCustomerId: undefined
        };
        case CustomerActionTypes.CustomersActionToggleLoading: return {
            ...state, actionsloading: action.payload.isLoading
        };
        case CustomerActionTypes.CustomerOnServerCreated: return {
            ...state
        };
        case CustomerActionTypes.CustomerCreated: return adapter.addOne(action.payload.customer, {
             ...state, lastCreatedCustomerId: action.payload.customer.id
        });
		case CustomerActionTypes.CustomerUpdated: return adapter.updateOne(action.payload.partialCustomer, state);

        case CustomerActionTypes.OneCustomerDeleted: return adapter.removeOne(action.payload.id, state);
        case CustomerActionTypes.ManyCustomersDeleted: return adapter.removeMany(action.payload.ids, state);
        case CustomerActionTypes.CustomersPageCancelled: return {
            ...state, listLoading: false, lastQuery: new QueryParamsModel({})
        };
        case CustomerActionTypes.CustomersPageLoaded:
            return adapter.addMany(action.payload.customers, {
                ...initialCustomersState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        default: return state;
    }
}

export const getCustomerState = createFeatureSelector<CustomerModel>('customers');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
