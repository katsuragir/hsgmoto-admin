import { selectBannersInitWaitingMessage } from '../_selectors/banner.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectBannersInStore, selectBannersPageLoading } from '../_selectors/banner.selectors';

export class BannersDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectBannersPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectBannersInitWaitingMessage)
		);

		this.store.pipe(
			select(selectBannersInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
