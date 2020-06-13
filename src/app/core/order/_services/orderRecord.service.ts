// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, Subject, forkJoin } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { OrderModel } from '../_models/order.model';
import { OrderRecordModel } from '../_models/orderRecord.model';

const API_ORDER_URL = '/api/hm/data/dashboard';
// Real REST API
@Injectable({
	providedIn: 'root'
})
export class OrderRecordService {

	public idOrder: string;

	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {}

	getDomain(): string {
		return this.httpUtils.domain + API_ORDER_URL;
	}


	// READ
	getAllOrdersWaiting(): Observable<OrderRecordModel> {
		return this.http.get<OrderRecordModel>(this.getDomain() + '/countsales');
	}



}
