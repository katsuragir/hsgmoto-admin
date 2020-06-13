// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { InvoiceModel } from '../_models/invoice.model';
import { Update } from '@ngrx/entity';

export enum InvoiceActionTypes {
	InvoiceOnServerCreated = '[Edit Invoice Component] Invoice On Server Created',
	InvoiceCreated = '[Edit Invoice Component] Invoice Created',
	InvoiceUpdated = '[Edit Invoice Component] Invoice Updated',
	InvoicesParentUpdated = '[Invoices List Page] Invoices Parent Updated',
	OneInvoiceDeleted = '[Invoices List Page] One Invoice Deleted',
	ManyInvoicesDeleted = '[Invoices List Page] Many Selected Invoices Deleted',
	InvoicesPageRequested = '[Invoices List Page] Invoices Page Requested',
	InvoicesPageLoaded = '[Invoices API] Invoices Page Loaded',
	InvoicesPageCancelled = '[Invoices API] Invoices Page Cancelled',
	InvoicesPageToggleLoading = '[Invoices] Invoices Page Toggle Loading',
	InvoicesActionToggleLoading = '[Invoices] Invoices Action Toggle Loading'
}

export enum ImageActionTypes {
	ImageOnServerCreated = '[Edit Image Component] Image On Server Created',
	ImageCreated = '[Edit Image Component] Image Created',
	ImageUpdated = '[Edit Image Component] Image Updated',
	ImagesParentUpdated = '[Images List Page] Images Parent Updated',
	OneImageDeleted = '[Images List Page] One Image Deleted',
	ManyImagesDeleted = '[Images List Page] Many Selected Images Deleted',
	ImagesPageRequested = '[Images List Page] Images Page Requested',
	ImagesPageLoaded = '[Images API] Images Page Loaded',
	ImagesPageCancelled = '[Images API] Images Page Cancelled',
	ImagesPageToggleLoading = '[Images] Images Page Toggle Loading',
	ImagesActionToggleLoading = '[Images] Images Action Toggle Loading'
}

export class InvoiceOnServerCreated implements Action {
	readonly type = InvoiceActionTypes.InvoiceOnServerCreated;
	constructor(public payload: { invoice: FormData}) { }
}

export class InvoiceCreated implements Action {
	readonly type = InvoiceActionTypes.InvoiceCreated;
	constructor(public payload: { invoice: InvoiceModel }) { }
}

export class InvoiceUpdated implements Action {
	readonly type = InvoiceActionTypes.InvoiceUpdated;
	constructor(public payload: {
		partialInvoice: Update<InvoiceModel>, // For State update
		invoice: InvoiceModel // For Server update (through service)
	}) { }
}

export class InvoicesParentUpdated implements Action {
	readonly type = InvoiceActionTypes.InvoicesParentUpdated;
	constructor(public payload: {
		Invoices: InvoiceModel[],
		id_parent: number
	}) { }
}

export class OneInvoiceDeleted implements Action {
	readonly type = InvoiceActionTypes.OneInvoiceDeleted;
	constructor(public payload: { id: number }) {}
}

export class OneImageDeleted implements Action {
	readonly type = ImageActionTypes.OneImageDeleted;
	constructor(public payload: { id: number }) {}
}

export class ManyInvoicesDeleted implements Action {
	readonly type = InvoiceActionTypes.ManyInvoicesDeleted;
	constructor(public payload: { ids: number[] }) {}
}

export class InvoicesPageRequested implements Action {
	readonly type = InvoiceActionTypes.InvoicesPageRequested;
	constructor(public payload: { page: QueryParamsModel, params: string }) { }
}

export class InvoicesPageLoaded implements Action {
	readonly type = InvoiceActionTypes.InvoicesPageLoaded;
	constructor(public payload: { Invoices: InvoiceModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class InvoicesPageCancelled implements Action {
	readonly type = InvoiceActionTypes.InvoicesPageCancelled;
}

export class InvoicesPageToggleLoading implements Action {
	readonly type = InvoiceActionTypes.InvoicesPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class InvoicesActionToggleLoading implements Action {
	readonly type = InvoiceActionTypes.InvoicesActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type InvoiceActions = InvoiceOnServerCreated
| InvoiceCreated
| InvoiceUpdated
| InvoicesParentUpdated
| OneInvoiceDeleted
| ManyInvoicesDeleted
| InvoicesPageRequested
| InvoicesPageLoaded
| InvoicesPageCancelled
| InvoicesPageToggleLoading
| InvoicesActionToggleLoading;
