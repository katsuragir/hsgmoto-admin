
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { DiscountActions, DiscountActionTypes } from '../_actions/discount.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { DiscountModel } from '../_models/discount.model';

export interface DiscountsState extends EntityState<DiscountModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastQuery: QueryParamsModel;
	lastCreatedDiscountId: number;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<DiscountModel> = createEntityAdapter<DiscountModel>();

export const initialDiscountsState: DiscountsState = adapter.getInitialState({
	listLoading: true,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParamsModel({}),
	lastCreatedDiscountId: undefined,
	showInitWaitingMessage: true
});

export function discountsReducer(state = initialDiscountsState, action: DiscountActions): DiscountsState {
	switch  (action.type) {
		case DiscountActionTypes.DiscountsPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedDiscountId: undefined
		};
		case DiscountActionTypes.DiscountsActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case DiscountActionTypes.DiscountOnServerCreated: return {
			...state
		};
		case DiscountActionTypes.DiscountCreated: return adapter.addOne(action.payload.discount, {
			 ...state, lastCreatedDiscountId: action.payload.discount.id
		});
		case DiscountActionTypes.DiscountUpdated: return adapter.updateOne(action.payload.partialDiscount, state);
		case DiscountActionTypes.OneDiscountDeleted: return adapter.removeOne(action.payload.id, state);
		case DiscountActionTypes.ManyDiscountsDeleted: return adapter.removeMany(action.payload.ids, state);
		case DiscountActionTypes.DiscountsPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParamsModel({})
		};
		case DiscountActionTypes.DiscountsPageLoaded:
			return adapter.addMany(action.payload.discounts, {
				...initialDiscountsState,
				totalCount: action.payload.totalCount,
				listLoading: false,
				lastQuery: action.payload.page,
				showInitWaitingMessage: false
			});
		default: return state;
	}
}

export const getDiscountState = createFeatureSelector<DiscountModel>('discounts');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
