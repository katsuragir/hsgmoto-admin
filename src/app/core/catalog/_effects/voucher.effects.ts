import { forkJoin } from 'rxjs';
// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel, QueryParamsModel } from '../../_base/crud';
// Services
import { VoucherService } from '../_services';
// State
import { AppState } from '../../reducers';
// Actions
import {
	VoucherActionTypes,
	VouchersPageRequested,
	VouchersPageLoaded,
	ManyVouchersDeleted,
	OneVoucherDeleted,
	VouchersPageToggleLoading,
	VouchersParentUpdated,
	VoucherUpdated,
	VoucherCreated,
	VoucherOnServerCreated
} from '../_actions/voucher.actions';
import { defer, Observable, of } from 'rxjs';

@Injectable()
export class VoucherEffects {
	showPageLoadingDistpatcher = new VouchersPageToggleLoading({ isLoading: true });
	showLoadingDistpatcher = new VouchersPageToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new VouchersPageToggleLoading({ isLoading: false });

	@Effect()
	loadVouchersPage$ = this.actions$
		.pipe(
			ofType<VouchersPageRequested>(VoucherActionTypes.VouchersPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.vouchersService.findVouchers(payload.page);
				const lastQuery = of(payload.page);
				// tslint:disable-next-line: deprecation
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = response[0];
				const lastQuery: QueryParamsModel = response[1];
				return new VouchersPageLoaded({
					vouchers: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteVoucher$ = this.actions$
		.pipe(
			ofType<OneVoucherDeleted>(VoucherActionTypes.OneVoucherDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showLoadingDistpatcher);
					return this.vouchersService.deleteVoucher(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	deleteVouchers$ = this.actions$
		.pipe(
			ofType<ManyVouchersDeleted>(VoucherActionTypes.ManyVouchersDeleted),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.vouchersService.deleteVouchers(payload.ids);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateVoucher$ = this.actions$
		.pipe(
			ofType<VoucherUpdated>(VoucherActionTypes.VoucherUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.vouchersService.updateVoucher(payload.voucher);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createVoucher$ = this.actions$
		.pipe(
			ofType<VoucherOnServerCreated>(VoucherActionTypes.VoucherOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showLoadingDistpatcher);
				return this.vouchersService.createVoucher(payload.voucher).pipe(
					tap(res => {
						this.store.dispatch(new VoucherCreated({ voucher: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	// @Effect()
	// init$: Observable<Action> = defer(() => {
	// const queryParams = new QueryParamsModel({});
	// return of(new ProductsPageRequested({ page: queryParams }));
	// });

	constructor(private actions$: Actions, private vouchersService: VoucherService, private store: Store<AppState>) { }
}
