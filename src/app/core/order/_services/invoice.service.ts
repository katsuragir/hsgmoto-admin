// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, Subject, forkJoin } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { InvoiceModel } from '../_models/invoice.model';

const API_INVOICE_URL = '/api/hm/order/invoice/';
// Real REST API
@Injectable({
	providedIn: 'root'
})
export class InvoiceService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	public voucherid: string;

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	getDomain(): string {
		return this.httpUtils.domain + API_INVOICE_URL;
	}


	// CREATE =>  POST: add a new invoice to the server
	createInvoice(invoice): Observable<InvoiceModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<InvoiceModel>(this.getDomain(), invoice, { headers: httpHeaders });
	}

	// READ
	getAllInvoices(): Observable<InvoiceModel[]> {
		return this.http.get<InvoiceModel[]>(this.getDomain());
	}

	getAllInvoicesvouch(): Observable<InvoiceModel[]> {
		return this.http.get<InvoiceModel[]>(this.getDomain() + `vouch/${this.voucherid}`);
	}

	getInvoiceById(invoiceId: string): Observable<InvoiceModel> {
		return this.http.get<InvoiceModel>(this.getDomain() + `/${invoiceId}`);
	}

	getInvoiceByOrder(orderId: number): Observable<any> {
		return this.http.get<any>(this.getDomain() + `order/${orderId}`);
	}

	// Server should return filtered/sorted result
	findInvoices(queryParams: QueryParamsModel, params: string): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			switch (params) {
				case 'vouch':
						return this.getAllInvoicesvouch().pipe(
							mergeMap(res => {
								const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
								// console.log(result);
								return of(result);
							})
						);
					break;
				case 'invoice':
						return this.getAllInvoices().pipe(
							mergeMap(res => {
								const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
								return of(result);
							})
						);
				break;
			}
	}

	// UPDATE => PUT: update the invoice on the server
	updateInvoice(invoice: InvoiceModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = invoice.id;
		const APi_URL = this.httpUtils.domain + '/api/hm/catalog/product/';
		return this.http.put(APi_URL + id, invoice, { headers: httpHeaders });
	}

	// DELETE => delete the invoice from the server
	deleteInvoice(invoiceId: number): Observable<InvoiceModel> {
		return this.http.delete<InvoiceModel>(this.getDomain() + invoiceId);
	}

	deleteInvoices(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteInvoice(ids[i]));
		}
		return forkJoin(tasks$);
	}
}
