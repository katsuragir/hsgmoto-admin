// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { CustomerModel } from '../_models/customer.model';

const API_CUSTOMER_URL = '/api/hm/customer/register';
// Real REST API
@Injectable({
	providedIn: 'root'
})
export class CustomerService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'desc', '', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	getDomain(): string {
		return this.httpUtils.domain + API_CUSTOMER_URL;
	}

	// CREATE =>  POST: add a new product to the server
	createCustomer(customer): Observable<CustomerModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<CustomerModel>(this.getDomain(), customer, { headers: httpHeaders });
	}

	// READ
	getAllCustomers(): Observable<CustomerModel[]> {
		return this.http.get<CustomerModel[]>(this.getDomain());
	}

	getCustomerById(customerId: number): Observable<CustomerModel> {
		return this.http.get<CustomerModel>(this.getDomain() + `/${customerId}`);
	}

	// Server should return filtered/sorted result
	findCustomers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			return this.getAllCustomers().pipe(
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
	deleteCustomer(customerId: number): Observable<CustomerModel> {
		const url = `${this.getDomain()}/${customerId}`;
		return this.http.delete<CustomerModel>(url);
	}

	deleteCustomers(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteCustomer(ids[i]));
		}
		return forkJoin(tasks$);
	}
}
