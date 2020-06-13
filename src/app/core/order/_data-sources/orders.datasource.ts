import { selectOrdersInitWaitingMessage } from '../_selectors/order.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectOrdersInStore, selectOrdersPageLoading } from '../_selectors/order.selectors';

export class OrdersDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectOrdersPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectOrdersInitWaitingMessage)
		);

		this.store.pipe(
			select(selectOrdersInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
