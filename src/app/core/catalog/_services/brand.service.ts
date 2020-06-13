// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { BrandModel } from '../_models/brand.model';

const API_BRAND_URL = '/api/hm/catalog/brand';
// Real REST API
@Injectable()
export class BrandService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	getDomain(): string {
		return this.httpUtils.domain + API_BRAND_URL;
	}

	// CREATE =>  POST: add a new product to the server
	createBrand(brand): Observable<BrandModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<BrandModel>(this.getDomain(), brand, { headers: httpHeaders });
	}

	// CREATE =>  POST: add a new product to the server
	BrandAuto(brand): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(this.getDomain() + '/autoIns', brand, { headers: httpHeaders });
	}

	// READ
	getAllBrands(): Observable<BrandModel[]> {
		return this.http.get<BrandModel[]>(this.getDomain());
	}

	// READ
	AllBrands() {
		return this.http.get(this.getDomain());
	}

	getBrandById(brandId: number): Observable<BrandModel> {
		return this.http.get<BrandModel>(this.getDomain() + `/${brandId}`);
	}

	// Server should return filtered/sorted result
	findBrands(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			return this.getAllBrands().pipe(
				mergeMap(res => {
					const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
					return of(result);
				})
			);
	}

	// UPDATE => PUT: update the product on the server
	updateBrand(brand): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = brand.get('id');
		return this.http.put(this.getDomain() + `/${id}`, brand, { headers: httpHeaders });
	}

	// UPDATE Status
	// Comment this when you start work with real server
	// This code imitates server calls
	updateParentForBrand(brands: BrandModel[], id_parent: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			brandsForUpdate: brands,
			newParent: id_parent
		};
		const url = this.getDomain() + '/updateParent';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteBrand(brandId: number): Observable<BrandModel> {
		const url = `${this.getDomain()}/${brandId}`;
		return this.http.delete<BrandModel>(url);
	}

	deleteBrands(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteBrand(ids[i]));
		}
		return forkJoin(tasks$);
	}
}
