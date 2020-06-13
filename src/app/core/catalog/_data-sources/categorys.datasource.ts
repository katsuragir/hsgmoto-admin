import { selectCategorysInitWaitingMessage } from '../_selectors/category.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectCategorysInStore, selectCategorysPageLoading } from '../_selectors/category.selectors';

export class CategorysDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectCategorysPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectCategorysInitWaitingMessage)
		);

		this.store.pipe(
			select(selectCategorysInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
