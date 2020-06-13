
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { ConfirmActions, ConfirmActionTypes } from '../_actions/confirm.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ConfirmModel } from '../_models/confirm.model';

export interface ConfirmsState extends EntityState<ConfirmModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastQuery: QueryParamsModel;
    lastCreatedConfirmId: number;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ConfirmModel> = createEntityAdapter<ConfirmModel>();

export const initialConfirmsState: ConfirmsState = adapter.getInitialState({
    listLoading: true,
    actionsloading: false,
    totalCount: 0,
    lastQuery:  new QueryParamsModel({}),
    lastCreatedConfirmId: undefined,
    showInitWaitingMessage: true
});

export function confirmsReducer(state = initialConfirmsState, action: ConfirmActions): ConfirmsState {
    switch  (action.type) {
        case ConfirmActionTypes.ConfirmsPageToggleLoading: return {
            ...state, listLoading: action.payload.isLoading, lastCreatedConfirmId: undefined
        };
        case ConfirmActionTypes.ConfirmsActionToggleLoading: return {
            ...state, actionsloading: action.payload.isLoading
        };
        case ConfirmActionTypes.ConfirmOnServerCreated: return {
            ...state
        };
        case ConfirmActionTypes.ConfirmCreated: return adapter.addOne(action.payload.confirm, {
             ...state, lastCreatedConfirmId: action.payload.confirm.id
        });
        case ConfirmActionTypes.ConfirmUpdated: return adapter.updateOne(action.payload.partialConfirm, state);
        case ConfirmActionTypes.OneConfirmDeleted: return adapter.removeOne(action.payload.id, state);
        case ConfirmActionTypes.ManyConfirmsDeleted: return adapter.removeMany(action.payload.ids, state);
        case ConfirmActionTypes.ConfirmsPageCancelled: return {
            ...state, listLoading: false, lastQuery: new QueryParamsModel({})
        };
        case ConfirmActionTypes.ConfirmsPageLoaded:
            return adapter.addMany(action.payload.confirms, {
                ...initialConfirmsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        default: return state;
    }
}

export const getConfirmState = createFeatureSelector<ConfirmModel>('confirms');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
