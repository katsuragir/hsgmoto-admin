
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { BarangActions, BarangActionTypes } from '../_actions/barang.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { BarangModel } from '../_models/barang.model';

export interface BarangsState extends EntityState<BarangModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastQuery: QueryParamsModel;
	lastCreatedBarangId: number;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<BarangModel> = createEntityAdapter<BarangModel>();

export const initialBarangsState: BarangsState = adapter.getInitialState({
	listLoading: true,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParamsModel({}),
	lastCreatedBarangId: undefined,
	showInitWaitingMessage: true
});

export function barangsReducer(state = initialBarangsState, action: BarangActions): BarangsState {
	switch  (action.type) {
		case BarangActionTypes.BarangsPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedBarangId: undefined
		};
		case BarangActionTypes.BarangsActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case BarangActionTypes.BarangOnServerCreated: return {
			...state
		};
		case BarangActionTypes.BarangCreated: return adapter.addOne(action.payload.barang, {
			 ...state, lastCreatedBarangId: action.payload.barang.id
		});
		case BarangActionTypes.BarangUpdated: return adapter.updateOne(action.payload.partialBarang, state);
		case BarangActionTypes.BarangsParentUpdated: {
			const _partialBarangs: Update<BarangModel>[] = [];
			// tslint:disable-next-line:prefer-const
			// tslint:disable-next-line: prefer-for-of
			for (let i = 0; i < action.payload.barangs.length; i++) {
				_partialBarangs.push({
					id: action.payload.barangs[i].id_category,
					changes: {
						id_category: action.payload.id_parent
					}
				});
			}
			return adapter.updateMany(_partialBarangs, state);
		}
		case BarangActionTypes.OneBarangDeleted: return adapter.removeOne(action.payload.id, state);
		case BarangActionTypes.ManyBarangsDeleted: return adapter.removeMany(action.payload.ids, state);
		case BarangActionTypes.BarangsPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParamsModel({})
		};
		case BarangActionTypes.BarangsPageLoaded:
			return adapter.addMany(action.payload.barangs, {
				...initialBarangsState,
				totalCount: action.payload.totalCount,
				listLoading: false,
				lastQuery: action.payload.page,
				showInitWaitingMessage: false
			});
		default: return state;
	}
}

export const getBarangState = createFeatureSelector<BarangModel>('barangs');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
