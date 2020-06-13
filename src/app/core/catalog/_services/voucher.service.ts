// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, forkJoin, Subject } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { VoucherModel } from '../_models/voucher.model';
import { NumberModel } from '../_models/number.model';

const API_VOUCHER_URL = '/api/hm/catalog/voch';
// Real REST API
@Injectable()
export class VoucherService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	// getVoucher$: Observable<any>; private getVoucherSubject = new Subject<any>()

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {
			// this.getVoucher$ = this.getVoucherSubject.asObservable();
		 }

	getDomain(): string {
		return this.httpUtils.domain + API_VOUCHER_URL;
	}

	// tslint:disable-next-line: member-ordering
	private _refreshNeeded$ = new Subject<void>();
	get refreshNeeded$() {
		return this._refreshNeeded$;
	}

	// CREATE =>  POST: add a new product to the server
	createVoucher(voucher: VoucherModel): Observable<any> {
		// console.log(voucher);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(this.getDomain(), voucher, { headers: httpHeaders });
	}

	// Generate
	getGenerate(): Observable<any> {
		return this.http.get<any>(this.getDomain() + '/generateNo');
	}

	// READ
	getAllVouchers(): Observable<VoucherModel[]> {
		return this.http.get<VoucherModel[]>(this.getDomain());
	}

	getAll(): Observable<VoucherModel[]> {
		return this.http.get<VoucherModel[]>(this.getDomain() + '/all');
	}

	getVouchers(): Observable<VoucherModel[]> {
		return this.http.get<VoucherModel[]>(this.getDomain() + '/vouchers');
	}

	getVoucherById(voucherId: number): Observable<VoucherModel> {
		return this.http.get<VoucherModel>(this.getDomain() + `/det/${voucherId}`);
	}

	// Server should return filtered/sorted result
	findVouchers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			return this.getAllVouchers().pipe(
				mergeMap(res => {
					const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
					return of(result);
				})
			);
	}

	// UPDATE => PUT: update the product on the server
	updateVoucher(voucher): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = voucher.id;
		const APi_URL = this.httpUtils.domain + '/api/hm/catalog/voch/';
		return this.http.put(APi_URL + id, voucher, { headers: httpHeaders });
	}

	// UPDATE Status
	updateStat(data): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = data.vid;
		return this.http.put(this.getDomain() + `/upStat/${id}`, data, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteVoucher(voucherId: number): Observable<VoucherModel> {
		const url = `${this.getDomain()}/${voucherId}`;
		return this.http.delete<VoucherModel>(url);
	}

	deleteVouchers(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteVoucher(ids[i]));
		}
		return forkJoin(tasks$);
	}
}
