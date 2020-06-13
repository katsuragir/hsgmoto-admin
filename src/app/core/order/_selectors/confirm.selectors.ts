// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { ConfirmsState } from '../_reducers/confirm.reducers';
import { ConfirmModel } from '../_models/confirm.model';

export const selectConfirmsState = createFeatureSelector<ConfirmsState>('confirms');

export const selectConfirmById = (confirmId: number) => createSelector(
    selectConfirmsState,
    confirmsState => confirmsState.entities[confirmId]
);

export const selectConfirmsPageLoading = createSelector(
    selectConfirmsState,
    confirmsState => confirmsState.listLoading
);

export const selectConfirmsActionLoading = createSelector(
    selectConfirmsState,
    customersState => customersState.actionsloading
);

export const selectConfirmsPageLastQuery = createSelector(
    selectConfirmsState,
    confirmsState => confirmsState.lastQuery
);

export const selectLastCreatedConfirmId = createSelector(
    selectConfirmsState,
    confirmsState => confirmsState.lastCreatedConfirmId
);

export const selectConfirmsInitWaitingMessage = createSelector(
    selectConfirmsState,
    confirmsState => confirmsState.showInitWaitingMessage
);

export const selectConfirmsInStore = createSelector(
    selectConfirmsState,
    confirmsState => {
        const items: ConfirmModel[] = [];
        each(confirmsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: ConfirmModel[] = httpExtension.sortArray(items, confirmsState.lastQuery.sortField, confirmsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, confirmsState.totalCount, '');
    }
);

export const selectHasConfirmsInStore = createSelector(
    selectConfirmsInStore,
    queryResult => {
        if (!queryResult.totalCount) {
            return false;
        }

        return true;
    }
);
