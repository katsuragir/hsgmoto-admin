
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { ListInvActions, ListInvActionTypes } from '../_actions/customerlistinv.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ListInvModel } from '../_models/customerlistinv.model';

export interface ListInvState extends EntityState<ListInvModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastQuery: QueryParamsModel;
	lastCreatedId: number;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ListInvModel> = createEntityAdapter<ListInvModel>();

export const initialsListInvState: ListInvState = adapter.getInitialState({
	listLoading: true,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParamsModel({}),
	lastCreatedId: undefined,
	showInitWaitingMessage: true
});

export function ReducerListInv(state = initialsListInvState, action: ListInvActions): ListInvState {
	switch  (action.type) {
		case ListInvActionTypes.sListInvPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedId: undefined
		};
		case ListInvActionTypes.sListInvActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ListInvActionTypes.ListInvOnServerCreated: return {
			...state
		};
		case ListInvActionTypes.ListInvCreated: return adapter.addOne(action.payload.invoice, {
			 ...state, lastCreatedId: action.payload.invoice.id
		});
		case ListInvActionTypes.ListInvUpdated: return adapter.updateOne(action.payload.partial, state);

		case ListInvActionTypes.OneListInvDeleted: return adapter.removeOne(action.payload.id, state);
		case ListInvActionTypes.ManysListInvDeleted: return adapter.removeMany(action.payload.ids, state);
		case ListInvActionTypes.sListInvPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParamsModel({})
		};
		case ListInvActionTypes.sListInvPageLoaded:
			return adapter.addMany(action.payload.invoices, {
				...initialsListInvState,
				totalCount: action.payload.totalCount,
				listLoading: false,
				lastQuery: action.payload.page,
				showInitWaitingMessage: false
			});
		default: return state;
	}
}

export const getInvoiceState = createFeatureSelector<ListInvModel>('listinv');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
