// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { VoucherModel } from '../_models/voucher.model';
import { Update } from '@ngrx/entity';

export enum VoucherActionTypes {
	VoucherOnServerCreated = '[Edit Voucher Component] Voucher On Server Created',
	VoucherCreated = '[Edit Voucher Component] Voucher Created',
	VoucherUpdated = '[Edit Voucher Component] Voucher Updated',
	VouchersParentUpdated = '[Vouchers List Page] Vouchers Parent Updated',
	OneVoucherDeleted = '[Vouchers List Page] One Voucher Deleted',
	ManyVouchersDeleted = '[Vouchers List Page] Many Selected Vouchers Deleted',
	VouchersPageRequested = '[Vouchers List Page] Vouchers Page Requested',
	VouchersPageLoaded = '[Vouchers API] Vouchers Page Loaded',
	VouchersPageCancelled = '[Vouchers API] Vouchers Page Cancelled',
	VouchersPageToggleLoading = '[Vouchers] Vouchers Page Toggle Loading',
	VouchersActionToggleLoading = '[Vouchers] Vouchers Action Toggle Loading'
}

export class VoucherOnServerCreated implements Action {
	readonly type = VoucherActionTypes.VoucherOnServerCreated;
	constructor(public payload: { voucher: VoucherModel }) { }
}

export class VoucherCreated implements Action {
	readonly type = VoucherActionTypes.VoucherCreated;
	constructor(public payload: { voucher: VoucherModel }) { }
}

export class VoucherUpdated implements Action {
	readonly type = VoucherActionTypes.VoucherUpdated;
	constructor(public payload: {
		partialVoucher: Update<VoucherModel>, // For State update
		voucher: VoucherModel // For Server update (through service)
	}) { }
}

export class VouchersParentUpdated implements Action {
	readonly type = VoucherActionTypes.VouchersParentUpdated;
	constructor(public payload: {
		vouchers: VoucherModel[],
		id_parent: number
	}) { }
}

export class OneVoucherDeleted implements Action {
	readonly type = VoucherActionTypes.OneVoucherDeleted;
	constructor(public payload: { id: number }) {}
}

export class ManyVouchersDeleted implements Action {
	readonly type = VoucherActionTypes.ManyVouchersDeleted;
	constructor(public payload: { ids: number[] }) {}
}

export class VouchersPageRequested implements Action {
	readonly type = VoucherActionTypes.VouchersPageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class VouchersPageLoaded implements Action {
	readonly type = VoucherActionTypes.VouchersPageLoaded;
	constructor(public payload: { vouchers: VoucherModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class VouchersPageCancelled implements Action {
	readonly type = VoucherActionTypes.VouchersPageCancelled;
}

export class VouchersPageToggleLoading implements Action {
	readonly type = VoucherActionTypes.VouchersPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class VouchersActionToggleLoading implements Action {
	readonly type = VoucherActionTypes.VouchersActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type VoucherActions = VoucherOnServerCreated
| VoucherCreated
| VoucherUpdated
| VouchersParentUpdated
| OneVoucherDeleted
| ManyVouchersDeleted
| VouchersPageRequested
| VouchersPageLoaded
| VouchersPageCancelled
| VouchersPageToggleLoading
| VouchersActionToggleLoading;
