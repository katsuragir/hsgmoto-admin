
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { BrandActions, BrandActionTypes } from '../_actions/brand.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { BrandModel } from '../_models/brand.model';

export interface BrandsState extends EntityState<BrandModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastQuery: QueryParamsModel;
    lastCreatedBrandId: number;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<BrandModel> = createEntityAdapter<BrandModel>();

export const initialBrandsState: BrandsState = adapter.getInitialState({
    listLoading: true,
    actionsloading: false,
    totalCount: 0,
    lastQuery:  new QueryParamsModel({}),
    lastCreatedBrandId: undefined,
    showInitWaitingMessage: true
});

export function brandsReducer(state = initialBrandsState, action: BrandActions): BrandsState {
    switch  (action.type) {
        case BrandActionTypes.BrandsPageToggleLoading: return {
            ...state, listLoading: action.payload.isLoading, lastCreatedBrandId: undefined
        };
        case BrandActionTypes.BrandsActionToggleLoading: return {
            ...state, actionsloading: action.payload.isLoading
        };
        case BrandActionTypes.BrandOnServerCreated: return {
            ...state
        };
        case BrandActionTypes.BrandCreated: return adapter.addOne(action.payload.brand, {
             ...state, lastCreatedBrandId: action.payload.brand.id
        });
		case BrandActionTypes.BrandUpdated: return adapter.updateOne(action.payload.partialBrand, state);

        case BrandActionTypes.OneBrandDeleted: return adapter.removeOne(action.payload.id, state);
        case BrandActionTypes.ManyBrandsDeleted: return adapter.removeMany(action.payload.ids, state);
        case BrandActionTypes.BrandsPageCancelled: return {
            ...state, listLoading: false, lastQuery: new QueryParamsModel({})
        };
        case BrandActionTypes.BrandsPageLoaded:
            return adapter.addMany(action.payload.brands, {
                ...initialBrandsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        default: return state;
    }
}

export const getBrandState = createFeatureSelector<BrandModel>('brands');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
