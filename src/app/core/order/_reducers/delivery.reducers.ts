
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { DeliveryActions, DeliveryActionTypes } from '../_actions/delivery.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { DeliveryModel } from '../_models/delivery.model';

export interface DeliverysState extends EntityState<DeliveryModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastQuery: QueryParamsModel;
	lastCreatedDeliveryId: number;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<DeliveryModel> = createEntityAdapter<DeliveryModel>();

export const initialDeliverysState: DeliverysState = adapter.getInitialState({
	listLoading: true,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParamsModel({}),
	lastCreatedDeliveryId: undefined,
	showInitWaitingMessage: true
});

export function deliverysReducer(state = initialDeliverysState, action: DeliveryActions): DeliverysState {
	switch  (action.type) {
		case DeliveryActionTypes.DeliverysPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedDeliveryId: undefined
		};
		case DeliveryActionTypes.DeliverysActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case DeliveryActionTypes.DeliveryOnServerCreated: return {
			...state
		};
		case DeliveryActionTypes.DeliveryCreated: return adapter.addOne(action.payload.delivery, {
			 ...state, lastCreatedDeliveryId: action.payload.delivery.id
		});
		case DeliveryActionTypes.DeliveryUpdated: return adapter.updateOne(action.payload.partialDelivery, state);
		case DeliveryActionTypes.DeliverysParentUpdated: {
			const _partialDeliverys: Update<DeliveryModel>[] = [];
			// tslint:disable-next-line:prefer-const

			return adapter.updateMany(_partialDeliverys, state);
		}
		case DeliveryActionTypes.OneDeliveryDeleted: return adapter.removeOne(action.payload.id, state);
		case DeliveryActionTypes.ManyDeliverysDeleted: return adapter.removeMany(action.payload.ids, state);
		case DeliveryActionTypes.DeliverysPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParamsModel({})
		};
		case DeliveryActionTypes.DeliverysPageLoaded:
			return adapter.addMany(action.payload.deliveries, {
				...initialDeliverysState,
				totalCount: action.payload.totalCount,
				listLoading: false,
				lastQuery: action.payload.page,
				showInitWaitingMessage: false
			});
		default: return state;
	}
}

export const getDeliveryState = createFeatureSelector<DeliveryModel>('deliverys');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
