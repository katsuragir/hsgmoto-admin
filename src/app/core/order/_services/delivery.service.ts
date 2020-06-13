// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, Subject, forkJoin } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { DeliveryModel } from '../_models/delivery.model';

const API_DELIVERY_URL = '/api/hm/order/delivery/';
// Real REST API
@Injectable({
	providedIn: 'root'
})
export class DeliveryService {

	public idOrder: string;

	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'desc', '', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	getDomain(): string {
		return this.httpUtils.domain + API_DELIVERY_URL;
	}

	// CREATE =>  POST: add a new delivery to the server
	createDelivery(delivery): Observable<DeliveryModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		// console.log(delivery);
		return this.http.post<DeliveryModel>(this.getDomain(), delivery, { headers: httpHeaders });
	}

	// READ
	getAllDeliverys(): Observable<DeliveryModel[]> {
		// console.log(this.idOrder);
		return this.http.get<DeliveryModel[]>(this.httpUtils.domain + `/api/hm/order/orders/detailOrder/${this.idOrder}`);
	}

	getDeliveryById(deliveryId: number): Observable<DeliveryModel> {
		return this.http.get<DeliveryModel>(this.getDomain() + `${deliveryId}`);
	}

	getDeliveryByOrder(orderId: number): Observable<DeliveryModel> {
		return this.http.get<DeliveryModel>(this.getDomain() + `order/${orderId}`);
	}

	// Server should return filtered/sorted result
	findDeliverys(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			return this.getAllDeliverys().pipe(
				mergeMap(res => {
					const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
					return of(result);
				})
			);
	}

	// UPDATE => PUT: update the delivery on the server
	updateDelivery(delivery): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = delivery.id;
		return this.http.put(this.getDomain() + `done/${id}`, delivery, { headers: httpHeaders });
	}

	// DELETE => delete the delivery from the server
	deleteDelivery(deliveryId: number): Observable<DeliveryModel> {
		return this.http.delete<DeliveryModel>(this.getDomain() + deliveryId);
	}

	deleteDeliverys(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteDelivery(ids[i]));
		}
		return forkJoin(tasks$);
	}

}
