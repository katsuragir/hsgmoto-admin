import { selectConfirmsInitWaitingMessage } from '../_selectors/confirm.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectConfirmsInStore, selectConfirmsPageLoading } from '../_selectors/confirm.selectors';

export class ConfirmsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectConfirmsPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectConfirmsInitWaitingMessage)
		);

		this.store.pipe(
			select(selectConfirmsInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
