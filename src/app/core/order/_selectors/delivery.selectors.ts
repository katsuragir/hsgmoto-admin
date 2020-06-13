// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { DeliverysState } from '../_reducers/delivery.reducers';
import { DeliveryModel } from '../_models/delivery.model';

export const selectDeliverysState = createFeatureSelector<DeliverysState>('deliverys');

export const selectDeliveryById = (deliveryId: number) => createSelector(
	selectDeliverysState,
	deliverysState => deliverysState.entities[deliveryId]
);

export const selectDeliverysPageLoading = createSelector(
	selectDeliverysState,
	deliverysState => deliverysState.listLoading
);

export const selectDeliverysActionLoading = createSelector(
	selectDeliverysState,
	customersState => customersState.actionsloading
);

export const selectDeliverysPageLastQuery = createSelector(
	selectDeliverysState,
	deliverysState => deliverysState.lastQuery
);

export const selectLastCreatedDeliveryId = createSelector(
	selectDeliverysState,
	deliverysState => deliverysState.lastCreatedDeliveryId
);

export const selectDeliverysInitWaitingMessage = createSelector(
	selectDeliverysState,
	deliverysState => deliverysState.showInitWaitingMessage
);

export const selectDeliverysInStore = createSelector(
	selectDeliverysState,
	deliverysState => {
		const items: DeliveryModel[] = [];
		each(deliverysState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		// tslint:disable-next-line: max-line-length
		const result: DeliveryModel[] = httpExtension.sortArray(items, deliverysState.lastQuery.sortField, deliverysState.lastQuery.sortOrder);
		return new QueryResultsModel(result, deliverysState.totalCount, '');
	}
);

export const selectHasDeliverysInStore = createSelector(
	selectDeliverysInStore,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
