// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { AboutUSModel } from '../_models/about-us.model';

const API_ABOUT_US_URL = '/api/setting/about-us';
// Real REST API
@Injectable({
	providedIn: 'root'
})
export class AboutUSService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'desc', '', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	getDomain(): string {
		return this.httpUtils.domain + API_ABOUT_US_URL;
	}

	// CREATE =>  POST: add a new product to the server
	createAboutUS(aboutus): Observable<AboutUSModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<AboutUSModel>(this.getDomain(), aboutus, { headers: httpHeaders });
	}

	// READ
	getAllAboutUSs(): Observable<AboutUSModel[]> {
		return this.http.get<AboutUSModel[]>(this.getDomain());
	}

	getAboutUSById(aboutusId: number): Observable<AboutUSModel> {
		return this.http.get<AboutUSModel>(this.getDomain() + `/${aboutusId}`);
	}

	// Server should return filtered/sorted result
	findAboutUSs(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			return this.getAllAboutUSs().pipe(
				mergeMap(res => {
					const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
					return of(result);
				})
			);
	}

	// UPDATE => PUT: update the product on the server
	updateAboutUS(aboutus): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const id = aboutus.id_aboutus;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(this.getDomain() + `/${id}`, aboutus, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the product on the server
	updateAboutUSPhone(aboutus): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const id = aboutus.id_aboutus;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(this.getDomain() + `/phone/${id}`, aboutus, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteAboutUS(aboutusId: number): Observable<AboutUSModel> {
		const url = `${this.getDomain()}/${aboutusId}`;
		return this.http.delete<AboutUSModel>(url);
	}

	deleteAboutUSs(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteAboutUS(ids[i]));
		}
		return forkJoin(tasks$);
	}
}
