import { selectDiscountsInitWaitingMessage } from '../_selectors/discount.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectDiscountsInStore, selectDiscountsPageLoading } from '../_selectors/discount.selectors';

export class DiscountsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectDiscountsPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectDiscountsInitWaitingMessage)
		);

		this.store.pipe(
			select(selectDiscountsInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
