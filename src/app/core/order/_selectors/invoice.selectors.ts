// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { InvoicesState } from '../_reducers/invoice.reducers';
import { InvoiceModel } from '../_models/invoice.model';

export const selectInvoicesState = createFeatureSelector<InvoicesState>('invoices');

export const selectInvoiceById = (invoiceId: number) => createSelector(
    selectInvoicesState,
    invoicesState => invoicesState.entities[invoiceId]
);

export const selectInvoicesPageLoading = createSelector(
    selectInvoicesState,
    invoicesState => invoicesState.listLoading
);

export const selectInvoicesActionLoading = createSelector(
    selectInvoicesState,
    customersState => customersState.actionsloading
);

export const selectInvoicesPageLastQuery = createSelector(
    selectInvoicesState,
    invoicesState => invoicesState.lastQuery
);

export const selectLastCreatedInvoiceId = createSelector(
    selectInvoicesState,
    invoicesState => invoicesState.lastCreatedInvoiceId
);

export const selectInvoicesInitWaitingMessage = createSelector(
    selectInvoicesState,
    invoicesState => invoicesState.showInitWaitingMessage
);

export const selectInvoicesInStore = createSelector(
    selectInvoicesState,
    invoicesState => {
        const items: InvoiceModel[] = [];
        each(invoicesState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: InvoiceModel[] = httpExtension.sortArray(items, invoicesState.lastQuery.sortField, invoicesState.lastQuery.sortOrder);
        return new QueryResultsModel(result, invoicesState.totalCount, '');
    }
);

export const selectHasInvoicesInStore = createSelector(
    selectInvoicesInStore,
    queryResult => {
        if (!queryResult.totalCount) {
            return false;
        }

        return true;
    }
);
