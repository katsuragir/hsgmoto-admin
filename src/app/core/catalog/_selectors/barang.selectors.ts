// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { BarangsState } from '../_reducers/barang.reducers';
import { BarangModel } from '../_models/barang.model';

export const selectBarangsState = createFeatureSelector<BarangsState>('barangs');

export const selectBarangById = (barangId: any) => createSelector(
	selectBarangsState,
	barangsState => barangsState.entities[barangId]
);

export const selectBarangsPageLoading = createSelector(
	selectBarangsState,
	barangsState => barangsState.listLoading
);

export const selectBarangsActionLoading = createSelector(
	selectBarangsState,
	customersState => customersState.actionsloading
);

export const selectBarangsPageLastQuery = createSelector(
	selectBarangsState,
	barangsState => barangsState.lastQuery
);

export const selectLastCreatedBarangId = createSelector(
	selectBarangsState,
	barangsState => barangsState.lastCreatedBarangId
);

export const selectBarangsInitWaitingMessage = createSelector(
	selectBarangsState,
	barangsState => barangsState.showInitWaitingMessage
);

export const selectBarangsInStore = createSelector(
	selectBarangsState,
	barangsState => {
		const items: BarangModel[] = [];
		each(barangsState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: BarangModel[] = httpExtension.sortArray(items, barangsState.lastQuery.sortField, barangsState.lastQuery.sortOrder);
		return new QueryResultsModel(result, barangsState.totalCount, '');
	}
);

export const selectHasBarangsInStore = createSelector(
	selectBarangsInStore,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
