// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, Subject, forkJoin, Subscriber } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { OrderModel } from '../_models/order.model';

const API_NOTIF_URL = '/api/hm/order/notif/';
// Real REST API
@Injectable({
	providedIn: 'root'
})
export class NotifService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'desc', '', 0, 10));
	// Array
	public cartItems: BehaviorSubject<any[]> = new BehaviorSubject([]);
	public observer: Subscriber<{}>;

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	private _refreshNeed$ = new Subject<void>();

	get refreshNeed() {
		return this._refreshNeed$;
	}

	getDomain(): string {
		return this.httpUtils.domain + API_NOTIF_URL;
	}

	// READ
	getAllCheckoutNotif() {
		return this.http.get(this.getDomain());
	}

	// READ
	getAllConfirmNotif(): Observable<any> {
		return this.http.get<any>(this.getDomain() + 'confirm').pipe(
			tap(() => {
				this._refreshNeed$.next();
			})
		);
	}

}
