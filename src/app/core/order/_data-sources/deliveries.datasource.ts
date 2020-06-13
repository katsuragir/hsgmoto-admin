import { selectDeliverysInitWaitingMessage } from '../_selectors/delivery.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectDeliverysInStore, selectDeliverysPageLoading } from '../_selectors/delivery.selectors';

export class DeliverysDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectDeliverysPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectDeliverysInitWaitingMessage)
		);

		this.store.pipe(
			select(selectDeliverysInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
