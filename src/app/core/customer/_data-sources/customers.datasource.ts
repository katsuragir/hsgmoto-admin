import { selectCustomersInitWaitingMessage } from '../_selectors/customer.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectCustomersInStore, selectCustomersPageLoading } from '../_selectors/customer.selectors';

export class CustomersDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectCustomersPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectCustomersInitWaitingMessage)
		);

		this.store.pipe(
			select(selectCustomersInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
