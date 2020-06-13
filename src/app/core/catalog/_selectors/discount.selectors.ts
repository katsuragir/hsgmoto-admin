// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { DiscountsState } from '../_reducers/discount.reducers';
import { DiscountModel } from '../_models/discount.model';

export const selectDiscountsState = createFeatureSelector<DiscountsState>('discounts');

export const selectDiscountById = (discountId: number) => createSelector(
	selectDiscountsState,
	discountsState => discountsState.entities[discountId]
);

export const selectDiscountsPageLoading = createSelector(
	selectDiscountsState,
	discountsState => discountsState.listLoading
);

export const selectDiscountsActionLoading = createSelector(
	selectDiscountsState,
	customersState => customersState.actionsloading
);

export const selectDiscountsPageLastQuery = createSelector(
	selectDiscountsState,
	discountsState => discountsState.lastQuery
);

export const selectLastCreatedDiscountId = createSelector(
	selectDiscountsState,
	discountsState => discountsState.lastCreatedDiscountId
);

export const selectDiscountsInitWaitingMessage = createSelector(
	selectDiscountsState,
	discountsState => discountsState.showInitWaitingMessage
);

export const selectDiscountsInStore = createSelector(
	selectDiscountsState,
	discountsState => {
		const items: DiscountModel[] = [];
		each(discountsState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		// tslint:disable-next-line: max-line-length
		const result: DiscountModel[] = httpExtension.sortArray(items, discountsState.lastQuery.sortField, discountsState.lastQuery.sortOrder);
		return new QueryResultsModel(result, discountsState.totalCount, '');
	}
);

export const selectHasDiscountsInStore = createSelector(
	selectDiscountsInStore,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
