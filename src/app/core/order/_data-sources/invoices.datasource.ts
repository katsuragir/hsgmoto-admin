import { selectInvoicesInitWaitingMessage } from '../_selectors/invoice.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectInvoicesInStore, selectInvoicesPageLoading } from '../_selectors/invoice.selectors';

export class InvoicesDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectInvoicesPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectInvoicesInitWaitingMessage)
		);

		this.store.pipe(
			select(selectInvoicesInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
