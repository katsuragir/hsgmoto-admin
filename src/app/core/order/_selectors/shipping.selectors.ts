// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { ShippingsState } from '../_reducers/shipping.reducers';
import { ShippingModel } from '../_models/shipping.model';

export const selectShippingsState = createFeatureSelector<ShippingsState>('shippings');

export const selectShippingById = (shippingId: number) => createSelector(
    selectShippingsState,
    shippingsState => shippingsState.entities[shippingId]
);

export const selectShippingsPageLoading = createSelector(
    selectShippingsState,
    shippingsState => shippingsState.listLoading
);

export const selectShippingsActionLoading = createSelector(
    selectShippingsState,
    customersState => customersState.actionsloading
);

export const selectShippingsPageLastQuery = createSelector(
    selectShippingsState,
    shippingsState => shippingsState.lastQuery
);

export const selectLastCreatedShippingId = createSelector(
    selectShippingsState,
    shippingsState => shippingsState.lastCreatedShippingId
);

export const selectShippingsInitWaitingMessage = createSelector(
    selectShippingsState,
    shippingsState => shippingsState.showInitWaitingMessage
);

export const selectShippingsInStore = createSelector(
    selectShippingsState,
    shippingsState => {
        const items: ShippingModel[] = [];
        each(shippingsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        // tslint:disable-next-line: max-line-length
        const result: ShippingModel[] = httpExtension.sortArray(items, shippingsState.lastQuery.sortField, shippingsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, shippingsState.totalCount, '');
    }
);

export const selectHasShippingsInStore = createSelector(
    selectShippingsInStore,
    queryResult => {
        if (!queryResult.totalCount) {
            return false;
        }

        return true;
    }
);
