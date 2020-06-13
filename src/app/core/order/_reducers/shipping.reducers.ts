
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { ShippingActions, ShippingActionTypes } from '../_actions/shipping.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ShippingModel } from '../_models/shipping.model';

export interface ShippingsState extends EntityState<ShippingModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastQuery: QueryParamsModel;
    lastCreatedShippingId: number;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ShippingModel> = createEntityAdapter<ShippingModel>();

export const initialShippingsState: ShippingsState = adapter.getInitialState({
    listLoading: true,
    actionsloading: false,
    totalCount: 0,
    lastQuery:  new QueryParamsModel({}),
    lastCreatedShippingId: undefined,
    showInitWaitingMessage: true
});

export function shippingsReducer(state = initialShippingsState, action: ShippingActions): ShippingsState {
    switch  (action.type) {
        case ShippingActionTypes.ShippingsPageToggleLoading: return {
            ...state, listLoading: action.payload.isLoading, lastCreatedShippingId: undefined
        };
        case ShippingActionTypes.ShippingsActionToggleLoading: return {
            ...state, actionsloading: action.payload.isLoading
        };
        case ShippingActionTypes.ShippingOnServerCreated: return {
            ...state
        };
        case ShippingActionTypes.ShippingCreated: return adapter.addOne(action.payload.shipping, {
             ...state, lastCreatedShippingId: action.payload.shipping.id
        });
        case ShippingActionTypes.ShippingUpdated: return adapter.updateOne(action.payload.partialShipping, state);
        case ShippingActionTypes.ShippingsParentUpdated: {
            const _partialShippings: Update<ShippingModel>[] = [];
            // tslint:disable-next-line:prefer-const

            return adapter.updateMany(_partialShippings, state);
        }
        case ShippingActionTypes.OneShippingDeleted: return adapter.removeOne(action.payload.id, state);
        case ShippingActionTypes.ManyShippingsDeleted: return adapter.removeMany(action.payload.ids, state);
        case ShippingActionTypes.ShippingsPageCancelled: return {
            ...state, listLoading: false, lastQuery: new QueryParamsModel({})
        };
        case ShippingActionTypes.ShippingsPageLoaded:
            return adapter.addMany(action.payload.shippings, {
                ...initialShippingsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        default: return state;
    }
}

export const getShippingState = createFeatureSelector<ShippingModel>('shippings');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
