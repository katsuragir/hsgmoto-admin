// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { ListInvState } from '../_reducers/customerlistinv.reducers';
import { ListInvModel } from '../_models/customerlistinv.model';

export const selectsListInvState = createFeatureSelector<ListInvState>('listinv');

export const selectListInvById = (orderId: number) => createSelector(
	selectsListInvState,
	sListInvState => sListInvState.entities[orderId]
);

export const selectsListInvPageLoading = createSelector(
	selectsListInvState,
	sListInvState => sListInvState.listLoading
);

export const selectsListInvActionLoading = createSelector(
	selectsListInvState,
	sListInvState => sListInvState.actionsloading
);

export const selectsListInvPageLastQuery = createSelector(
	selectsListInvState,
	sListInvState => sListInvState.lastQuery
);

export const selectLastCreatedIdorder = createSelector(
	selectsListInvState,
	sListInvState => sListInvState.lastCreatedId
);

export const selectsListInvInitWaitingMessage = createSelector(
	selectsListInvState,
	sListInvState => sListInvState.showInitWaitingMessage
);

export const selectsListInvInStore = createSelector(
	selectsListInvState,
	sListInvState => {
		const items: ListInvModel[] = [];
		each(sListInvState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		// tslint:disable-next-line: max-line-length
		const result: ListInvModel[] = httpExtension.sortArray(items, sListInvState.lastQuery.sortField, sListInvState.lastQuery.sortOrder);
		return new QueryResultsModel(result, sListInvState.totalCount, '');
	}
);

export const selectHassListInvInStore = createSelector(
	selectsListInvInStore,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
