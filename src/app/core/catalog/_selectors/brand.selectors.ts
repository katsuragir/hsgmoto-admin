// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { BrandsState } from '../_reducers/brand.reducers';
import { BrandModel } from '../_models/brand.model';

export const selectBrandsState = createFeatureSelector<BrandsState>('brands');

export const selectBrandById = (brandId: number) => createSelector(
    selectBrandsState,
    brandsState => brandsState.entities[brandId]
);

export const selectBrandsPageLoading = createSelector(
    selectBrandsState,
    brandsState => brandsState.listLoading
);

export const selectBrandsActionLoading = createSelector(
    selectBrandsState,
    customersState => customersState.actionsloading
);

export const selectBrandsPageLastQuery = createSelector(
    selectBrandsState,
    brandsState => brandsState.lastQuery
);

export const selectLastCreatedBrandId = createSelector(
    selectBrandsState,
    brandsState => brandsState.lastCreatedBrandId
);

export const selectBrandsInitWaitingMessage = createSelector(
    selectBrandsState,
    brandsState => brandsState.showInitWaitingMessage
);

export const selectBrandsInStore = createSelector(
    selectBrandsState,
    brandsState => {
        const items: BrandModel[] = [];
        each(brandsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: BrandModel[] = httpExtension.sortArray(items, brandsState.lastQuery.sortField, brandsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, brandsState.totalCount, '');
    }
);

export const selectHasBrandsInStore = createSelector(
    selectBrandsInStore,
    queryResult => {
        if (!queryResult.totalCount) {
            return false;
        }

        return true;
    }
);
