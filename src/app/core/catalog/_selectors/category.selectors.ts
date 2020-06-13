// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { CategorysState } from '../_reducers/category.reducers';
import { CategoryModel } from '../_models/category.model';

export const selectCategorysState = createFeatureSelector<CategorysState>('categorys');

export const selectCategoryById = (categoryId: number) => createSelector(
    selectCategorysState,
    categorysState => categorysState.entities[categoryId]
);

export const selectCategorysPageLoading = createSelector(
    selectCategorysState,
    categorysState => categorysState.listLoading
);

export const selectCategorysActionLoading = createSelector(
    selectCategorysState,
    customersState => customersState.actionsloading
);

export const selectCategorysPageLastQuery = createSelector(
    selectCategorysState,
    categorysState => categorysState.lastQuery
);

export const selectLastCreatedCategoryId = createSelector(
    selectCategorysState,
    categorysState => categorysState.lastCreatedCategoryId
);

export const selectCategorysInitWaitingMessage = createSelector(
    selectCategorysState,
    categorysState => categorysState.showInitWaitingMessage
);

export const selectCategorysInStore = createSelector(
    selectCategorysState,
    categorysState => {
        const items: CategoryModel[] = [];
        each(categorysState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: CategoryModel[] = httpExtension.sortArray(items, categorysState.lastQuery.sortField, categorysState.lastQuery.sortOrder);
        return new QueryResultsModel(result, categorysState.totalCount, '');
    }
);

export const selectHasCategorysInStore = createSelector(
    selectCategorysInStore,
    queryResult => {
        if (!queryResult.totalCount) {
            return false;
        }

        return true;
    }
);
