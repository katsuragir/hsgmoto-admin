// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, Subject, forkJoin } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { ShippingModel } from '../_models/shipping.model';

const API_SHIPPING_URL = '/api/hm/shipping/ongkir';
// Real REST API
@Injectable({
	providedIn: 'root'
})
export class ShippingService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'desc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	getDomain(): string {
		return this.httpUtils.domain + API_SHIPPING_URL;
	}

	// CREATE =>  POST: add a new shipping to the server
	createShipping(shipping): Observable<ShippingModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ShippingModel>(this.getDomain(), shipping, { headers: httpHeaders });
	}

	// READ
	getAllShippings(): Observable<ShippingModel[]> {
		return this.http.get<ShippingModel[]>(this.getDomain());
	}

	getShippingById(shippingId: number): Observable<ShippingModel> {
		return this.http.get<ShippingModel>(this.getDomain() + `/${shippingId}`);
	}

	getShippingByorder(shippingId: number): Observable<any> {
		return this.http.get<any>(this.getDomain() + `/order/${shippingId}`);
	}

	getDistrict(city, district): Observable<any> {
		const url = 'http://api.shipping.esoftplay.com/subdistrict/';
		return this.http.get<any>(url + `${city}/${district}`);
	}

	// Server should return filtered/sorted result
	findShippings(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			return this.getAllShippings().pipe(
				mergeMap(res => {
					const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
					return of(result);
				})
			);
	}

	// UPDATE => PUT: update the shipping on the server
	updateShipping(shipping: ShippingModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = shipping.id;
		const APi_URL = this.getDomain() + '/api/hm/catalog/product/';
		return this.http.put(APi_URL + id, shipping, { headers: httpHeaders });
	}

	// DELETE => delete the shipping from the server
	deleteShipping(shippingId: number): Observable<ShippingModel> {
		return this.http.delete<ShippingModel>(this.getDomain() + shippingId);
	}

	deleteShippings(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteShipping(ids[i]));
		}
		return forkJoin(tasks$);
	}
}
