// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, Subject, forkJoin } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { ReportModel } from '../_models/report.model';

const API_REPORT_URL = '/api/hm/order/orders/';
// Real REST API
@Injectable({
	providedIn: 'root'
})
export class ReportService {

	public report: any;

	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {}

	getDomain(): string {
		return this.httpUtils.domain + API_REPORT_URL;
	}

	// CREATE =>  POST: add a new report to the server
	createReport(report): Observable<ReportModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ReportModel>(this.getDomain(), report, { headers: httpHeaders });
	}

	// READ
	getAllReports(): Observable<ReportModel[]> {
		// console.log('test');
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ReportModel[]>(this.getDomain() + 'report/list', this.report, { headers: httpHeaders });
	}

	// READ
	getReportById(reportId: number): Observable<ReportModel> {
		return this.http.get<ReportModel>(this.getDomain() + `/${reportId}`);
	}

	// READ
	getReportByDate(report): Observable<any> {
		return this.http.get<any>(this.getDomain());
	}

	// READ
	getReportByMonth(report): Observable<any> {
		// this.idReport = reportId;
		return this.http.get<any>(this.getDomain());
	}

	// Server should return filtered/sorted result
	findReports(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			return this.getAllReports().pipe(
				mergeMap(res => {
					const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
					return of(result);
				})
			);
	}

}
