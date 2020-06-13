import { selectBrandsInitWaitingMessage } from '../_selectors/brand.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectBrandsInStore, selectBrandsPageLoading } from '../_selectors/brand.selectors';

export class BrandsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectBrandsPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectBrandsInitWaitingMessage)
		);

		this.store.pipe(
			select(selectBrandsInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
