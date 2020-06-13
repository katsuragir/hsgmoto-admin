
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { AboutUSActions, AboutUSActionTypes } from '../_actions/about-us.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { AboutUSModel } from '../_models/about-us.model';

export interface AboutUSsState extends EntityState<AboutUSModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastQuery: QueryParamsModel;
	lastCreatedAboutUSId: number;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AboutUSModel> = createEntityAdapter<AboutUSModel>();

export const initialAboutUSsState: AboutUSsState = adapter.getInitialState({
	listLoading: true,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParamsModel({}),
	lastCreatedAboutUSId: undefined,
	showInitWaitingMessage: true
});

export function aboutussReducer(state = initialAboutUSsState, action: AboutUSActions): AboutUSsState {
	switch  (action.type) {
		case AboutUSActionTypes.AboutUSsPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedAboutUSId: undefined
		};
		case AboutUSActionTypes.AboutUSsActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case AboutUSActionTypes.AboutUSOnServerCreated: return {
			...state
		};
		case AboutUSActionTypes.AboutUSCreated: return adapter.addOne(action.payload.aboutus, {
			 ...state, lastCreatedAboutUSId: action.payload.aboutus.id
		});
		case AboutUSActionTypes.AboutUSUpdated: return adapter.updateOne(action.payload.partialAboutUS, state);

		case AboutUSActionTypes.OneAboutUSDeleted: return adapter.removeOne(action.payload.id, state);
		case AboutUSActionTypes.ManyAboutUSsDeleted: return adapter.removeMany(action.payload.ids, state);
		case AboutUSActionTypes.AboutUSsPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParamsModel({})
		};
		case AboutUSActionTypes.AboutUSsPageLoaded:
			return adapter.addMany(action.payload.aboutuss, {
				...initialAboutUSsState,
				totalCount: action.payload.totalCount,
				listLoading: false,
				lastQuery: action.payload.page,
				showInitWaitingMessage: false
			});
		default: return state;
	}
}

export const getAboutUSState = createFeatureSelector<AboutUSModel>('aboutuss');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
