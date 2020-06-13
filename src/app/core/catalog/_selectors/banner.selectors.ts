// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { BannersState } from '../_reducers/banner.reducers';
import { BannerModel } from '../_models/banner.model';

export const selectBannersState = createFeatureSelector<BannersState>('banners');

export const selectBannerById = (bannerId: number) => createSelector(
	selectBannersState,
	bannersState => bannersState.entities[bannerId]
);

export const selectBannersPageLoading = createSelector(
	selectBannersState,
	bannersState => bannersState.listLoading
);

export const selectBannersActionLoading = createSelector(
	selectBannersState,
	customersState => customersState.actionsloading
);

export const selectBannersPageLastQuery = createSelector(
	selectBannersState,
	bannersState => bannersState.lastQuery
);

export const selectLastCreatedBannerId = createSelector(
	selectBannersState,
	bannersState => bannersState.lastCreatedBannerId
);

export const selectBannersInitWaitingMessage = createSelector(
	selectBannersState,
	bannersState => bannersState.showInitWaitingMessage
);

export const selectBannersInStore = createSelector(
	selectBannersState,
	bannersState => {
		const items: BannerModel[] = [];
		each(bannersState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: BannerModel[] = httpExtension.sortArray(items, bannersState.lastQuery.sortField, bannersState.lastQuery.sortOrder);
		return new QueryResultsModel(result, bannersState.totalCount, '');
	}
);

export const selectHasBannersInStore = createSelector(
	selectBannersInStore,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
