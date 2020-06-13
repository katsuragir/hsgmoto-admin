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

const API_ORDER_URL = '/api/hm/order/orders/';
// Real REST API
@Injectable({
	providedIn: 'root'
})
export class OrderService {

	public idOrder: string;

	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {}

	getDomain(): string {
		return this.httpUtils.domain + API_ORDER_URL;
	}

	// CREATE =>  POST: add a new order to the server
	createOrder(order): Observable<OrderModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<OrderModel>(this.getDomain(), order, { headers: httpHeaders });
	}

	// READ
	getAllOrders(): Observable<OrderModel[]> {
		// console.log('test');
		return this.http.get<OrderModel[]>(this.getDomain());
	}

	// READ
	getOrderById(orderId: number): Observable<OrderModel> {
		return this.http.get<OrderModel>(this.getDomain() + `/${orderId}`);
	}

	// READ
	getOrderByOrder(orderId: string): Observable<any> {
		this.idOrder = orderId;
		// console.log(this.getDomain());
		return this.http.get<any>(this.getDomain() + `orderHeaderA/${orderId}`);
	}

	// READ
	getCustomerOrderByCustomer(orderId: string): Observable<any> {
		this.idOrder = orderId;
		return this.http.get<any>(this.getDomain() + `orderHeaderB/${orderId}`);
	}

	// READ
	getDetailOrderByOrder(orderId: string): Observable<any> {
		this.idOrder = orderId;
		return this.http.get<any>(this.getDomain() + `detailOrder/${orderId}`);
	}

	// cek resi
	cekResi(data): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<OrderModel>(this.httpUtils.ongkir + '/ongkir/cekresi' , data, { headers: httpHeaders });
	}

	// ========================== Dashboard
	getTotalOrder() {
		return this.http.get(this.getDomain() + 'getTotalOrder');
	}
	/*
	getTotalSuccessOrder(): Observable<any> {
		return this.http.get<any>(this.getDomain() + '/getTotalSuccessOrder');
	}

	getTotalFailOrder(): Observable<any> {
		return this.http.get<any>(this.getDomain() + '/getTotalFailOrder');
	}

	getTotalWaitingOrder(): Observable<any> {
		return this.http.get<any>(this.getDomain() + '/getTotalWaitingOrder');
	}
	*/
	getTotalAmount() {
		return this.http.get(this.getDomain() + `TotalAmount`);
	}

	getTotalAmountLastMonth() {
		return this.http.get(this.getDomain() + `TotalAmountlastmonth`);
	}

	// ================================

	// call back end server to load order detail by : id Order
	/*
	getOrderDetail(orderId: string): Observable<OrderDetailModels[]> {
		return this.http.get<OrderDetailModels[]>(this.getDomain()+`detailOrder/${orderId}`);
	}


	//find getorderdetail() to load table view in web
	findOrderDetail(queryParams: QueryParamsModel, id: string): Observable<QueryResultsModel> {
		return this.getOrderDetail(id).pipe(
			mergeMap(res => {
				const result = this.httpUtils.baseFilter(res, queryParams, ['id_order', 'id_order']);
				return of(result);
			})
		);
	}
	*/

	// Server should return filtered/sorted result
	findOrders(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			return this.getAllOrders().pipe(
				mergeMap(res => {
					const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
					return of(result);
				})
			);
	}

	// UPDATE => PUT: update the order on the server
	updateOrder(order: OrderModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = order.id;
		const APi_URL = this.getDomain() + '/api/hm/catalog/product/';
		return this.http.put(APi_URL + id, order, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the order on the server
	updatestatus(order): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = order.id_order;
		const APi_URL = this.getDomain() + 'status/';
		return this.http.put(APi_URL + id, order, { headers: httpHeaders });
	}

	updateorderconfirm(order): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = order.id_order;
		const APi_URL = this.getDomain() + 'status/confirm/';
		return this.http.put(APi_URL + id, order, { headers: httpHeaders });
	}

	accPayment(order): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = order.id_order;
		const APi_URL = this.getDomain() + 'status/accPay/';
		return this.http.put(APi_URL + id, order, { headers: httpHeaders });
	}

	// DELETE => delete the order from the server
	deleteOrder(orderId: string): Observable<OrderModel> {
		return this.http.delete<OrderModel>(this.getDomain() + orderId);
	}

	deleteOrders(ids: string[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteOrder(ids[i]));
		}
		return forkJoin(tasks$);
	}


}
