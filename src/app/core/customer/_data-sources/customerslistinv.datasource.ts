import { selectsListInvInitWaitingMessage } from '../_selectors/customerlistinv.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectsListInvInStore, selectsListInvPageLoading } from '../_selectors/customerlistinv.selectors';

export class ListInvDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectsListInvPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectsListInvInitWaitingMessage)
		);

		this.store.pipe(
			select(selectsListInvInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
