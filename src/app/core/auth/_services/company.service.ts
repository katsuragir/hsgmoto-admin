import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { QueryParamsModel, QueryResultsModel, HttpUtilsService } from '../../_base/crud';


const API_Company_URL = '/api/hm/auth/company';

@Injectable({
	providedIn: 'root'
})
export class CompanyService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {}

	getDomain(): string {
		return this.httpUtils.domain + API_Company_URL;
	}

	// Observable Company Array
	private company(): Observable<any> {
		return this.http.get<any>(this.getDomain());
	 }

	 // Get Categories
	 public getCompanyProfile(): Observable<any> {
		return this.http.get<any>(this.getDomain());
	}
}
