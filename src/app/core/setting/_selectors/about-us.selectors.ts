// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { AboutUSsState } from '../_reducers/about-us.reducers';
import { AboutUSModel } from '../_models/about-us.model';

export const selectAboutUSsState = createFeatureSelector<AboutUSsState>('aboutuss');

export const selectAboutUSById = (aboutusId: number) => createSelector(
	selectAboutUSsState,
	aboutussState => aboutussState.entities[aboutusId]
);

export const selectAboutUSsPageLoading = createSelector(
	selectAboutUSsState,
	aboutussState => aboutussState.listLoading
);

export const selectAboutUSsActionLoading = createSelector(
	selectAboutUSsState,
	aboutussState => aboutussState.actionsloading
);

export const selectAboutUSsPageLastQuery = createSelector(
	selectAboutUSsState,
	aboutussState => aboutussState.lastQuery
);

export const selectLastCreatedAboutUSId = createSelector(
	selectAboutUSsState,
	aboutussState => aboutussState.lastCreatedAboutUSId
);

export const selectAboutUSsInitWaitingMessage = createSelector(
	selectAboutUSsState,
	aboutussState => aboutussState.showInitWaitingMessage
);

export const selectAboutUSsInStore = createSelector(
	selectAboutUSsState,
	aboutussState => {
		const items: AboutUSModel[] = [];
		each(aboutussState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		// tslint:disable-next-line: max-line-length
		const result: AboutUSModel[] = httpExtension.sortArray(items, aboutussState.lastQuery.sortField, aboutussState.lastQuery.sortOrder);
		return new QueryResultsModel(result, aboutussState.totalCount, '');
	}
);

export const selectHasAboutUSsInStore = createSelector(
	selectAboutUSsInStore,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
