import { selectAboutUSsInitWaitingMessage } from '../_selectors/about-us.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectAboutUSsInStore, selectAboutUSsPageLoading } from '../_selectors/about-us.selectors';

export class AboutUSsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectAboutUSsPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAboutUSsInitWaitingMessage)
		);

		this.store.pipe(
			select(selectAboutUSsInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
