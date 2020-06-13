// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { ListInvModel } from '../_models/customerlistinv.model';

const API_CUSTOMER_URL = '/api/hm/customer/invoice/list';
// Real REST API
@Injectable({
	providedIn: 'root'
})
export class ListInvService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'desc', '', 0, 10));

	public id_customer: number;

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	getDomain(): string {
		return this.httpUtils.domain + API_CUSTOMER_URL;
	}

	// CREATE =>  POST: add a new product to the server
	createCustomer(customer): Observable<ListInvModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ListInvModel>(this.getDomain(), customer, { headers: httpHeaders });
	}

	// READ
	getAllCustomerslistInv(): Observable<ListInvModel[]> {
		return this.http.get<ListInvModel[]>(this.getDomain() + `/${this.id_customer}`);
	}

	getCustomerById(customerId: number): Observable<ListInvModel> {
		return this.http.get<ListInvModel>(this.getDomain() + `/${customerId}`);
	}

	// Server should return filtered/sorted result
	findCustomers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			return this.getAllCustomerslistInv().pipe(
				mergeMap(res => {
					const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
					return of(result);
				})
			);
	}

	// UPDATE => PUT: update the product on the server
	updateCustomer(customer): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const id = customer.id_customer;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(this.getDomain() + `/${id}`, customer, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the product on the server
	updateCustomerPhone(customer): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const id = customer.id_customer;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(this.getDomain() + `/phone/${id}`, customer, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteCustomer(orderId: string): Observable<ListInvModel> {
		const url = `${this.getDomain()}/${orderId}`;
		return this.http.delete<ListInvModel>(url);
	}

	deleteCustomers(ids: string[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteCustomer(ids[i]));
		}
		return forkJoin(tasks$);
	}
}
