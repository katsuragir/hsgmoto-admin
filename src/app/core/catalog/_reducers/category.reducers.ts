
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { CategoryActions, CategoryActionTypes } from '../_actions/category.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { CategoryModel } from '../_models/category.model';

export interface CategorysState extends EntityState<CategoryModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastQuery: QueryParamsModel;
    lastCreatedCategoryId: number;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<CategoryModel> = createEntityAdapter<CategoryModel>();

export const initialCategorysState: CategorysState = adapter.getInitialState({
    listLoading: true,
    actionsloading: false,
    totalCount: 0,
    lastQuery:  new QueryParamsModel({}),
    lastCreatedCategoryId: undefined,
    showInitWaitingMessage: true
});

export function categorysReducer(state = initialCategorysState, action: CategoryActions): CategorysState {
    switch  (action.type) {
        case CategoryActionTypes.CategorysPageToggleLoading: return {
            ...state, listLoading: action.payload.isLoading, lastCreatedCategoryId: undefined
        };
        case CategoryActionTypes.CategorysActionToggleLoading: return {
            ...state, actionsloading: action.payload.isLoading
        };
        case CategoryActionTypes.CategoryOnServerCreated: return {
            ...state
        };
        case CategoryActionTypes.CategoryCreated: return adapter.addOne(action.payload.category, {
             ...state, lastCreatedCategoryId: action.payload.category.id
        });
        case CategoryActionTypes.CategoryUpdated: return adapter.updateOne(action.payload.partialCategory, state);
        case CategoryActionTypes.CategorysParentUpdated: {
            const _partialCategorys: Update<CategoryModel>[] = [];
            // tslint:disable-next-line:prefer-const
            for (let i = 0; i < action.payload.categorys.length; i++) {
                _partialCategorys.push({
				    id: action.payload.categorys[i].id_parent,
				    changes: {
                        id_parent: action.payload.id_parent
                    }
			    });
            }
            return adapter.updateMany(_partialCategorys, state);
        }
        case CategoryActionTypes.OneCategoryDeleted: return adapter.removeOne(action.payload.id, state);
        case CategoryActionTypes.ManyCategorysDeleted: return adapter.removeMany(action.payload.ids, state);
        case CategoryActionTypes.CategorysPageCancelled: return {
            ...state, listLoading: false, lastQuery: new QueryParamsModel({})
        };
        case CategoryActionTypes.CategorysPageLoaded:
            return adapter.addMany(action.payload.categorys, {
                ...initialCategorysState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        default: return state;
    }
}

export const getCategoryState = createFeatureSelector<CategoryModel>('categorys');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
