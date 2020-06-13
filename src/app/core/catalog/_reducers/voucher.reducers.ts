
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { VoucherActions, VoucherActionTypes } from '../_actions/voucher.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { VoucherModel } from '../_models/voucher.model';

export interface VouchersState extends EntityState<VoucherModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastQuery: QueryParamsModel;
	lastCreatedVoucherId: number;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<VoucherModel> = createEntityAdapter<VoucherModel>();

export const initialVouchersState: VouchersState = adapter.getInitialState({
	listLoading: true,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParamsModel({}),
	lastCreatedVoucherId: undefined,
	showInitWaitingMessage: true
});

export function vouchersReducer(state = initialVouchersState, action: VoucherActions): VouchersState {
	switch  (action.type) {
		case VoucherActionTypes.VouchersPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedVoucherId: undefined
		};
		case VoucherActionTypes.VouchersActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case VoucherActionTypes.VoucherOnServerCreated: return {
			...state
		};
		case VoucherActionTypes.VoucherCreated: return adapter.addOne(action.payload.voucher, {
			 ...state, lastCreatedVoucherId: action.payload.voucher.id
		});
		case VoucherActionTypes.VoucherUpdated: return adapter.updateOne(action.payload.partialVoucher, state);
		case VoucherActionTypes.OneVoucherDeleted: return adapter.removeOne(action.payload.id, state);
		case VoucherActionTypes.ManyVouchersDeleted: return adapter.removeMany(action.payload.ids, state);
		case VoucherActionTypes.VouchersPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParamsModel({})
		};
		case VoucherActionTypes.VouchersPageLoaded:
			return adapter.addMany(action.payload.vouchers, {
				...initialVouchersState,
				totalCount: action.payload.totalCount,
				listLoading: false,
				lastQuery: action.payload.page,
				showInitWaitingMessage: false
			});
		default: return state;
	}
}

export const getVoucherState = createFeatureSelector<VoucherModel>('vouchers');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
