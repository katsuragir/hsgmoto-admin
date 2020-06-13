import { selectDistributorsInitWaitingMessage } from '../_selectors/distributor.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectDistributorsInStore, selectDistributorsPageLoading } from '../_selectors/distributor.selectors';

export class DistributorsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectDistributorsPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectDistributorsInitWaitingMessage)
		);

		this.store.pipe(
			select(selectDistributorsInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
