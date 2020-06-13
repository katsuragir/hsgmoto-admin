import { selectVouchersInitWaitingMessage } from '../_selectors/voucher.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectVouchersInStore, selectVouchersPageLoading } from '../_selectors/voucher.selectors';

export class VouchersDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectVouchersPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectVouchersInitWaitingMessage)
		);

		this.store.pipe(
			select(selectVouchersInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
