// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { DistributorsState } from '../_reducers/distributor.reducers';
import { DistributorModel } from '../_models/distributor.model';

export const selectDistributorsState = createFeatureSelector<DistributorsState>('distributors');

export const selectDistributorById = (distributorId: number) => createSelector(
	selectDistributorsState,
	distributorsState => distributorsState.entities[distributorId]
);

export const selectDistributorsPageLoading = createSelector(
	selectDistributorsState,
	distributorsState => distributorsState.listLoading
);

export const selectDistributorsActionLoading = createSelector(
	selectDistributorsState,
	customersState => customersState.actionsloading
);

export const selectDistributorsPageLastQuery = createSelector(
	selectDistributorsState,
	distributorsState => distributorsState.lastQuery
);

export const selectLastCreatedDistributorId = createSelector(
	selectDistributorsState,
	distributorsState => distributorsState.lastCreatedDistributorId
);

export const selectDistributorsInitWaitingMessage = createSelector(
	selectDistributorsState,
	distributorsState => distributorsState.showInitWaitingMessage
);

export const selectDistributorsInStore = createSelector(
	selectDistributorsState,
	distributorsState => {
		const items: DistributorModel[] = [];
		each(distributorsState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		// tslint:disable-next-line: max-line-length
		const result: DistributorModel[] = httpExtension.sortArray(items, distributorsState.lastQuery.sortField, distributorsState.lastQuery.sortOrder);
		return new QueryResultsModel(result, distributorsState.totalCount, '');
	}
);

export const selectHasDistributorsInStore = createSelector(
	selectDistributorsInStore,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
