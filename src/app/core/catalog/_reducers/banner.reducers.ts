
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { BannerActions, BannerActionTypes } from '../_actions/banner.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { BannerModel } from '../_models/banner.model';

export interface BannersState extends EntityState<BannerModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastQuery: QueryParamsModel;
	lastCreatedBannerId: number;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<BannerModel> = createEntityAdapter<BannerModel>();

export const initialBannersState: BannersState = adapter.getInitialState({
	listLoading: true,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParamsModel({}),
	lastCreatedBannerId: undefined,
	showInitWaitingMessage: true
});

export function bannersReducer(state = initialBannersState, action: BannerActions): BannersState {
	switch  (action.type) {
		case BannerActionTypes.BannersPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedBannerId: undefined
		};
		case BannerActionTypes.BannersActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case BannerActionTypes.BannerOnServerCreated: return {
			...state
		};
		case BannerActionTypes.BannerCreated: return adapter.addOne(action.payload.banner, {
			 ...state, lastCreatedBannerId: action.payload.banner.id
		});
		case BannerActionTypes.BannerUpdated: return adapter.updateOne(action.payload.partialBanner, state);
		case BannerActionTypes.OneBannerDeleted: return adapter.removeOne(action.payload.id, state);
		case BannerActionTypes.ManyBannersDeleted: return adapter.removeMany(action.payload.ids, state);
		case BannerActionTypes.BannersPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParamsModel({})
		};
		case BannerActionTypes.BannersPageLoaded:
			return adapter.addMany(action.payload.banners, {
				...initialBannersState,
				totalCount: action.payload.totalCount,
				listLoading: false,
				lastQuery: action.payload.page,
				showInitWaitingMessage: false
			});
		default: return state;
	}
}

export const getBannerState = createFeatureSelector<BannerModel>('banners');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
