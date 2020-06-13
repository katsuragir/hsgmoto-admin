import { selectShippingsInitWaitingMessage } from '../_selectors/shipping.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectShippingsInStore, selectShippingsPageLoading } from '../_selectors/shipping.selectors';

export class ShippingsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectShippingsPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectShippingsInitWaitingMessage)
		);

		this.store.pipe(
			select(selectShippingsInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
