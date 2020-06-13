import { selectBarangsInitWaitingMessage } from '../_selectors/barang.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectBarangsInStore, selectBarangsPageLoading } from '../_selectors/barang.selectors';

export class BarangsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectBarangsPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectBarangsInitWaitingMessage)
		);

		this.store.pipe(
			select(selectBarangsInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
