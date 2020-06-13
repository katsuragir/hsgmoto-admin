// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, Subject, forkJoin } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { BannerModel } from '../_models/banner.model';

const API_BANNER_URL = '/api/hm/catalog/banner';
// Real REST API
@Injectable()
export class BannerService {
	public idDisc: string;
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	private _refreshNeed$ = new Subject<void>();

	getDomain(): string {
		return this.httpUtils.domain + API_BANNER_URL;
	}

	get refreshNeed() {
		return this._refreshNeed$;
	}

	// CREATE =>  POST: add a new banner to the server
	createBanner(banner): Observable<BannerModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		// console.log(banner);
		return this.http.post<BannerModel>(this.getDomain(), banner, { headers: httpHeaders });
	}

	// READ
	getAllBanners(): Observable<BannerModel[]> {
		return this.http.get<BannerModel[]>(this.getDomain());
	}

	// READ
	AllBanners(): Observable<BannerModel[]> {
		return this.http.get<BannerModel[]>(this.getDomain() + '/banner');
	}

	getBannerById(bannerId: number): Observable<BannerModel> {
		return this.http.get<BannerModel>(this.getDomain() + `/${bannerId}`);
	}

	// Server should return filtered/sorted result
	findBanners(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		return this.getAllBanners().pipe(
			mergeMap(res => {
				const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'kondisi']);
				return of(result);
			})
		);
	}

	// UPDATE => PUT: update the barang on the server
	updateBanner(banner): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = banner.get('id');
		const APi_URL = this.httpUtils.domain + '/api/hm/catalog/banner/';
		return this.http.put(APi_URL + id, banner, { headers: httpHeaders });
	}

	// UPDATE Status
	updateStat(data): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = data.id_bn;
		// console.log(data);
		return this.http.put(this.getDomain() + `/upstat/${id}`, data, { headers: httpHeaders });
	}

	// DELETE => delete the banner from the server
	deleteBanner(bannerId: number): Observable<BannerModel> {
		const url = `${this.getDomain()}/${bannerId}`;
		return this.http.delete<BannerModel>(url);
	}

	deleteBanners(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteBanner(ids[i]));
		}
		return forkJoin(tasks$);
	}

}
