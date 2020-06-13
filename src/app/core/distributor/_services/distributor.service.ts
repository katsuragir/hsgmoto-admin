// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { DistributorModel } from '../_models/distributor.model';

const API_DISTRIBUTOR_URL = '/api/hm/dist/distributor';
// Real REST API
@Injectable()
export class DistributorService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	getDomain(): string {
		return this.httpUtils.domain + API_DISTRIBUTOR_URL;
	}

	// CREATE =>  POST: add a new product to the server
	createDistributor(distributor): Observable<DistributorModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<DistributorModel>(this.getDomain(), distributor, { headers: httpHeaders });
	}

	// READ
	getAllDistributors(): Observable<DistributorModel[]> {
		return this.http.get<DistributorModel[]>(this.getDomain());
	}

	getDistributorById(distributorId: number): Observable<DistributorModel> {
		return this.http.get<DistributorModel>(this.getDomain() + `/${distributorId}`);
	}

	// Server should return filtered/sorted result
	findDistributors(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			return this.getAllDistributors().pipe(
				mergeMap(res => {
					const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
					return of(result);
				})
			);
	}

	// UPDATE => PUT: update the product on the server
	updateDistributor(distributor): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = distributor.get('id');
		return this.http.put(this.getDomain() + `/${id}`, distributor, { headers: httpHeaders });
	}

	updateFlagStat(data): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = data.id_distr;
		return this.http.put(this.getDomain() + `/upFlag/${id}`, data, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteDistributor(distributorId: number): Observable<DistributorModel> {
		const url = `${this.getDomain()}/${distributorId}`;
		return this.http.delete<DistributorModel>(url);
	}

	deleteDistributors(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteDistributor(ids[i]));
		}
		return forkJoin(tasks$);
	}
}
