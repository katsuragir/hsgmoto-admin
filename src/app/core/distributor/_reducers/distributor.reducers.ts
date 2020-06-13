
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { DistributorActions, DistributorActionTypes } from '../_actions/distributors.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { DistributorModel } from '../_models/distributor.model';

export interface DistributorsState extends EntityState<DistributorModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastQuery: QueryParamsModel;
	lastCreatedDistributorId: number;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<DistributorModel> = createEntityAdapter<DistributorModel>();

export const initialDistributorsState: DistributorsState = adapter.getInitialState({
	listLoading: true,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParamsModel({}),
	lastCreatedDistributorId: undefined,
	showInitWaitingMessage: true
});

export function distributorsReducer(state = initialDistributorsState, action: DistributorActions): DistributorsState {
	switch  (action.type) {
		case DistributorActionTypes.DistributorsPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedDistributorId: undefined
		};
		case DistributorActionTypes.DistributorsActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case DistributorActionTypes.DistributorOnServerCreated: return {
			...state
		};
		case DistributorActionTypes.DistributorCreated: return adapter.addOne(action.payload.distributor, {
			 ...state, lastCreatedDistributorId: action.payload.distributor.id
		});
		case DistributorActionTypes.DistributorUpdated: return adapter.updateOne(action.payload.partialDistributor, state);

		case DistributorActionTypes.OneDistributorDeleted: return adapter.removeOne(action.payload.id, state);
		case DistributorActionTypes.ManyDistributorsDeleted: return adapter.removeMany(action.payload.ids, state);
		case DistributorActionTypes.DistributorsPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParamsModel({})
		};
		case DistributorActionTypes.DistributorsPageLoaded:
			return adapter.addMany(action.payload.distributors, {
				...initialDistributorsState,
				totalCount: action.payload.totalCount,
				listLoading: false,
				lastQuery: action.payload.page,
				showInitWaitingMessage: false
			});
		default: return state;
	}
}

export const getDistributorState = createFeatureSelector<DistributorModel>('distributors');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
