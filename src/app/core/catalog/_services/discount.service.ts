// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, forkJoin, Subject } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { DiscountModel } from '../_models/discount.model';
import { NumberModel } from '../_models/number.model';

const API_DISCOUNT_URL = '/api/hm/catalog/disct';
// Real REST API
@Injectable()
export class DiscountService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	// getDiscount$: Observable<any>; private getDiscountSubject = new Subject<any>()

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {
			// this.getDiscount$ = this.getDiscountSubject.asObservable();
		 }

	getDomain(): string {
		return this.httpUtils.domain + API_DISCOUNT_URL;
	}

	// tslint:disable-next-line: member-ordering
	private _refreshNeeded$ = new Subject<void>();
	get refreshNeeded$() {
		return this._refreshNeeded$;
	}

	// CREATE =>  POST: add a new product to the server
	createDiscount(discount: DiscountModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(this.getDomain(), discount, { headers: httpHeaders });
	}

	// Generate
	getGenerate(): Observable<any> {
		return this.http.get<any>(this.getDomain() + '/generateNo');
	}

	// READ
	getAllDiscounts(): Observable<DiscountModel[]> {
		return this.http.get<DiscountModel[]>(this.getDomain());
	}

	getDiscounts(): Observable<DiscountModel[]> {
		return this.http.get<DiscountModel[]>(this.getDomain() + '/discounts');
	}

	getDiscountById(discountId: number): Observable<DiscountModel> {
		return this.http.get<DiscountModel>(this.getDomain() + `/${discountId}`);
	}

	// Server should return filtered/sorted result
	findDiscounts(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			return this.getAllDiscounts().pipe(
				mergeMap(res => {
					const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
					return of(result);
				})
			);
	}

	// UPDATE => PUT: update the product on the server
	updateDiscount(discount): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = discount.id;
		const APi_URL = this.httpUtils.domain + '/api/hm/catalog/disct/';
		return this.http.put(APi_URL + id, discount, { headers: httpHeaders });
	}

	// UPDATE Status
	updateStat(data): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = data.kd_disc;
		return this.http.put(this.getDomain() + `/upStat/${id}`, data, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteDiscount(discountId: number): Observable<DiscountModel> {
		const url = `${this.getDomain()}/${discountId}`;
		return this.http.delete<DiscountModel>(url);
	}

	deleteDiscounts(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteDiscount(ids[i]));
		}
		return forkJoin(tasks$);
	}

	// DROP => drop the product from the discount
	dropProduct(discountId: number): Observable<DiscountModel> {
		const url = `${this.getDomain()}/dropProd/disc/${discountId}`;
		return this.http.delete<DiscountModel>(url);
	}

	dropProducts(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.dropProduct(ids[i]));
		}
		return forkJoin(tasks$);
	}

	// Add product discount
	addingBarang(data): Observable<any> {
		const url = `${this.getDomain()}/addDisc`;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(url, data, { headers: httpHeaders });
	}

	addingBarangs(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.addingBarang(ids[i]));
		}
		return forkJoin(tasks$);
	}
}
