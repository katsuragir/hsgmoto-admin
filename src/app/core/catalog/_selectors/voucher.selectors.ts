// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { VouchersState } from '../_reducers/voucher.reducers';
import { VoucherModel } from '../_models/voucher.model';

export const selectVouchersState = createFeatureSelector<VouchersState>('vouchers');

export const selectVoucherById = (voucherId: number) => createSelector(
	selectVouchersState,
	vouchersState => vouchersState.entities[voucherId]
);

export const selectVouchersPageLoading = createSelector(
	selectVouchersState,
	vouchersState => vouchersState.listLoading
);

export const selectVouchersActionLoading = createSelector(
	selectVouchersState,
	customersState => customersState.actionsloading
);

export const selectVouchersPageLastQuery = createSelector(
	selectVouchersState,
	vouchersState => vouchersState.lastQuery
);

export const selectLastCreatedVoucherId = createSelector(
	selectVouchersState,
	vouchersState => vouchersState.lastCreatedVoucherId
);

export const selectVouchersInitWaitingMessage = createSelector(
	selectVouchersState,
	vouchersState => vouchersState.showInitWaitingMessage
);

export const selectVouchersInStore = createSelector(
	selectVouchersState,
	vouchersState => {
		const items: VoucherModel[] = [];
		each(vouchersState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		// tslint:disable-next-line: max-line-length
		const result: VoucherModel[] = httpExtension.sortArray(items, vouchersState.lastQuery.sortField, vouchersState.lastQuery.sortOrder);
		return new QueryResultsModel(result, vouchersState.totalCount, '');
	}
);

export const selectHasVouchersInStore = createSelector(
	selectVouchersInStore,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
