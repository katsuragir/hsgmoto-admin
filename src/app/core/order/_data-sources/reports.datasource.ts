import { selectReportsInitWaitingMessage } from '../_selectors/report.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectReportsInStore, selectReportsPageLoading } from '../_selectors/report.selectors';

export class ReportsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectReportsPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectReportsInitWaitingMessage)
		);

		this.store.pipe(
			select(selectReportsInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
