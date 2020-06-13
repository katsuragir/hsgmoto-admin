// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, forkJoin, Subject } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { ConfirmModel } from '../_models/confirm.model';

const API_CONFIRM_URL = '/api/hm/order/confirm';
// Real REST API
@Injectable({
	providedIn: 'root'
})
export class ConfirmService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'desc', '', 0, 10));
	// getConfirm$: Observable<any>; private getConfirmSubject = new Subject<any>()

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {
			// this.getConfirm$ = this.getConfirmSubject.asObservable();
		 }

	getDomain(): string {
		return this.httpUtils.domain + API_CONFIRM_URL;
	}

	// tslint:disable-next-line: member-ordering
	private _refreshNeeded$ = new Subject<void>();
	get refreshNeeded$() {
		return this._refreshNeeded$;
	}
		 /*
	getConfirm(data) {
		console.log(data);
		this.getConfirmSubject.next(data);
	}
	*/
	// CREATE =>  POST: add a new product to the server
	createConfirm(confirm): Observable<ConfirmModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ConfirmModel>(this.getDomain(), confirm, { headers: httpHeaders }).pipe(
			tap(() => {
				this._refreshNeeded$.next();
			})
		);
	}

	// READ
	getAllConfirms(): Observable<ConfirmModel[]> {
		return this.http.get<ConfirmModel[]>(this.getDomain());
	}

	getConfirmById(confirmId: string): Observable<ConfirmModel> {
		return this.http.get<ConfirmModel>(this.getDomain() + `/${confirmId}`);
	}

	// Server should return filtered/sorted result
	findConfirms(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			return this.getAllConfirms().pipe(
				mergeMap(res => {
					const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
					return of(result);
				})
			);
	}

	// UPDATE => PUT: update the product on the server
	updateConfirm(confirm): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = confirm.get('id');
		const APi_URL = this.httpUtils.domain + '/api/hm/catalog/confirm/';
		return this.http.put(APi_URL + id, confirm, { headers: httpHeaders });
	}

	// UPDATE
	confirmPayment(data, address): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = data.id_order;
		const status = {
			invoice: data.invoice,
			id_order: data.id_order,
			create_at: data.create_at,
			status: 3,
			address: address
		};
		// console.log(status);
		return this.http.put(this.getDomain() + `/confirmPay/${id}`, status, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteConfirm(confirmId: number): Observable<ConfirmModel> {
		const url = `${this.getDomain()}/${confirmId}`;
		return this.http.delete<ConfirmModel>(url);
	}

	deleteCategories(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteConfirm(ids[i]));
		}
		return forkJoin(tasks$);
	}
}
