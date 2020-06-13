// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { OrdersState } from '../_reducers/order.reducers';
import { OrderModel } from '../_models/order.model';

export const selectOrdersState = createFeatureSelector<OrdersState>('orders');

export const selectOrderById = (orderId: number) => createSelector(
    selectOrdersState,
    ordersState => ordersState.entities[orderId]
);

export const selectOrdersPageLoading = createSelector(
    selectOrdersState,
    ordersState => ordersState.listLoading
);

export const selectOrdersActionLoading = createSelector(
    selectOrdersState,
    customersState => customersState.actionsloading
);

export const selectOrdersPageLastQuery = createSelector(
    selectOrdersState,
    ordersState => ordersState.lastQuery
);

export const selectLastCreatedOrderId = createSelector(
    selectOrdersState,
    ordersState => ordersState.lastCreatedOrderId
);

export const selectOrdersInitWaitingMessage = createSelector(
    selectOrdersState,
    ordersState => ordersState.showInitWaitingMessage
);

export const selectOrdersInStore = createSelector(
    selectOrdersState,
    ordersState => {
        const items: OrderModel[] = [];
        each(ordersState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: OrderModel[] = httpExtension.sortArray(items, ordersState.lastQuery.sortField, ordersState.lastQuery.sortOrder);
        return new QueryResultsModel(result, ordersState.totalCount, '');
    }
);

export const selectHasOrdersInStore = createSelector(
    selectOrdersInStore,
    queryResult => {
        if (!queryResult.totalCount) {
            return false;
        }

        return true;
    }
);
