
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { OrderActions, OrderActionTypes } from '../_actions/order.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { OrderModel } from '../_models/order.model';

export interface OrdersState extends EntityState<OrderModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastQuery: QueryParamsModel;
    lastCreatedOrderId: number;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<OrderModel> = createEntityAdapter<OrderModel>();

export const initialOrdersState: OrdersState = adapter.getInitialState({
    listLoading: true,
    actionsloading: false,
    totalCount: 0,
    lastQuery:  new QueryParamsModel({}),
    lastCreatedOrderId: undefined,
    showInitWaitingMessage: true
});

export function ordersReducer(state = initialOrdersState, action: OrderActions): OrdersState {
    switch  (action.type) {
        case OrderActionTypes.OrdersPageToggleLoading: return {
            ...state, listLoading: action.payload.isLoading, lastCreatedOrderId: undefined
        };
        case OrderActionTypes.OrdersActionToggleLoading: return {
            ...state, actionsloading: action.payload.isLoading
        };
        case OrderActionTypes.OrderOnServerCreated: return {
            ...state
        };
        case OrderActionTypes.OrderCreated: return adapter.addOne(action.payload.order, {
             ...state, lastCreatedOrderId: action.payload.order.id
        });
        case OrderActionTypes.OrderUpdated: return adapter.updateOne(action.payload.partialOrder, state);
        case OrderActionTypes.OrdersParentUpdated: {
            const _partialOrders: Update<OrderModel>[] = [];
            // tslint:disable-next-line:prefer-const

            return adapter.updateMany(_partialOrders, state);
        }
        case OrderActionTypes.OneOrderDeleted: return adapter.removeOne(action.payload.id, state);
        case OrderActionTypes.ManyOrdersDeleted: return adapter.removeMany(action.payload.ids, state);
        case OrderActionTypes.OrdersPageCancelled: return {
            ...state, listLoading: false, lastQuery: new QueryParamsModel({})
        };
        case OrderActionTypes.OrdersPageLoaded:
            return adapter.addMany(action.payload.orders, {
                ...initialOrdersState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        default: return state;
    }
}

export const getOrderState = createFeatureSelector<OrderModel>('orders');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
