// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, Subject, forkJoin } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { BarangModel } from '../_models/barang.model';

const API_BARANG_URL = '/api/hm/catalog/product';
// Real REST API
@Injectable()
export class BarangService {
	public idDisc: string;
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	public products: BarangModel[];

	private itemsSubject$: BehaviorSubject<BarangModel[]> = new BehaviorSubject(this.products);
	readonly items$: Observable<BarangModel[]> = this.itemsSubject$.asObservable();

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {
		this.AllBarangs();
	}

	private _refreshNeed$ = new Subject<void>();

	getDomain(): string {
		return this.httpUtils.domain + API_BARANG_URL;
	}

	/**
	* Get All Setting
	*/
	setting() {
		return this.http.get(this.httpUtils.domain + '/api/hm/setting');
	}

	/**
	* Update Cart
	*/
	updateCart(setting) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(this.httpUtils.domain + '/api/hm/setting/cart', setting, { headers: httpHeaders });
	}

	/**
	* Update Product
	*/
	upallProd() {
		return this.http.get(this.getDomain() + '/update/all/prod');
	}

	get refreshNeed() {
		return this._refreshNeed$;
	}

	// CREATE =>  POST: add a new barang to the server
	createBarang(barang): Observable<BarangModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		// console.log(barang);
		return this.http.post<BarangModel>(this.getDomain(), barang, { headers: httpHeaders });
	}

	// READ
	getAllBarangs(): Observable<BarangModel[]> {
		return this.http.get<BarangModel[]>(this.getDomain());
	}

	// READ
	AllBarangs(): void {
		this.getAllBarangs().subscribe(
			result => {
				if (result) {
					this.products = result;

					this.itemsSubject$.next(this.products);
				} else {
					this.products = [];

					this.itemsSubject$.next(this.products);
				}
			}
		);
	}

	// READ
	getAllProducts(): Observable<BarangModel[]> {
		return this.http.get<BarangModel[]>(this.getDomain() + '/prodcs');
	}

	// READ
	getAllProductsdisc(): Observable<BarangModel[]> {
		return this.http.get<BarangModel[]>(this.getDomain() + `/prodcs/disc/${this.idDisc}`);
	}

	// READ
	getAllImagesByID(id): Observable<any[]> {
		return this.http.get<any[]>(this.getDomain() + `/detailpro/variantImage/${id}`);
	}

	getBarangById(barangId: number): Observable<BarangModel> {
		return this.http.get<BarangModel>(this.getDomain() + `/${barangId}`);
	}

	getLastIDproduct(): Observable<any> {
		return this.http.get<any>(this.getDomain() + '/getLastId/product');
	}

	// Generate
	getGenerate(): Observable<any> {
		return this.http.get<any>(this.getDomain() + '/generatebarcode');
	}

	// =========================================== Set Cover
	setCover(item, id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(this.getDomain() + '/setcover/' + id, item, { headers: httpHeaders });
	}

	setUPCover(item, id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put<any>(this.getDomain() + '/setcover/' + id, item, { headers: httpHeaders });
	}

	setCoverDB(item, id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(this.getDomain() + '/setcoverdb/' + id, item, { headers: httpHeaders });
	}

	setUPCoverDB(item, id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put<any>(this.getDomain() + '/setcoverdb/' + id, item, { headers: httpHeaders });
	}

	coverParams(id): Observable<any> {
		return this.http.get<any>(this.getDomain() + '/setcover/' + id);
	}

	delCover(id): Observable<any> {
		return this.http.delete<any>(this.getDomain() + '/setcover/' + id);
	}

	// ========================================== set image DB
	delImageDB(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(this.getDomain() + '/delImageDB/', item, { headers: httpHeaders });
	}

	// Server should return filtered/sorted result
	findBarangs(queryParams: QueryParamsModel, params: string): Observable<QueryResultsModel> {
		switch (params) {
			case 'disc':
				return this.getAllProducts().pipe(
					mergeMap(res => {
						const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'kondisi']);
						return of(result);
					})
				);
				break;
			case 'all':
				return this.getAllBarangs().pipe(
					mergeMap(res => {
						const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'kondisi']);
						return of(result);
					})
				);
			break;
			case 'prod':
				return this.getAllProductsdisc().pipe(
					mergeMap(res => {
						const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'kondisi']);
						return of(result);
					})
				);
			break;
		}
	}

	// UPDATE => PUT: update the barang on the server
	updateBarang(barang): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = barang.model;
		const APi_URL = this.httpUtils.domain + '/api/hm/catalog/product/';
		return this.http.put(APi_URL + id, barang, { headers: httpHeaders }).pipe(
			tap(() => {
				this.AllBarangs();
			})
		);
	}

	// UPDATE => PUT: update the barang on the server
	updateBarangstatus(barang): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = barang.md;
		const APi_URL = this.httpUtils.domain + '/api/hm/catalog/product/upstat/';
		return this.http.put(APi_URL + id, barang, { headers: httpHeaders }).pipe(
			tap(() => {
				this.AllBarangs();
			})
		);
	}

	// UPDATE => PUT: update the barang on the server
	updateBaranghome(barang): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = barang.id;
		const APi_URL = this.httpUtils.domain + '/api/hm/catalog/product/uphome/';
		return this.http.put(APi_URL + id, barang, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the barang on the server
	updateBarangCondition(barang, model): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = model;
		// console.log(barang, id);
		const APi_URL = this.httpUtils.domain + '/api/hm/catalog/product/condition/';
		return this.http.put(APi_URL + id, barang, { headers: httpHeaders }).pipe(
			tap(() => {
				this.AllBarangs();
			})
		);
	}

	// UPDATE => PUT: update the barang on the server
	updateBarangDiscount(barang): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = barang.id;
		const APi_URL = this.httpUtils.domain + '/api/hm/catalog/product/discount/';
		return this.http.put(APi_URL + id, barang, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the barang on the server
	updateBarangChart(barang): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		// console.log(barang);
		const APi_URL = this.httpUtils.domain + '/api/hm/catalog/product/update/chart';
		return this.http.put(APi_URL, barang, { headers: httpHeaders });
	}

	// UPDATE Status
	// Comment this when you start work with real server
	// This code imitates server calls
	updateParentForBarang(barangs: BarangModel[], id_parent: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			barangsForUpdate: barangs,
			newParent: id_parent
		};
		const url = this.getDomain() + '/updateParent';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the barang from the server
	deleteBarang(barangId: number): Observable<BarangModel> {
		const url = `${this.getDomain()}/${barangId}`;
		return this.http.delete<BarangModel>(url);
	}

	deleteBarangs(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteBarang(ids[i]));
		}
		return forkJoin(tasks$);
	}

	getAllImages(item): Observable<any[]> {
		const params: {[param: string]: string} = {};

		if (item.model) {
			params.md = item.model;
		}

		if (item.barcode) {
			params.bc = item.barcode;
		}

		const url = this.httpUtils.domain + '/api/hm/catalog/product/images';
		return this.http.get<any[]>(url, {params});
	}

	deleteImage(imageId: number) {
		const url = `${this.getDomain()}/image/${imageId}`;
		return this.http.delete(url);
	}

	uploadImage(data, id) {
		const url = this.httpUtils.domain + '/api/hm/catalog/product/image/';
		return this.http.put(url + id, data);
	}
}
