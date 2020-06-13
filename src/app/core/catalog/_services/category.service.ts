// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject, of, forkJoin, Subject } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { CategoryModel } from '../_models/category.model';

const API_CATEGORY_URL = '/api/hm/catalog/category';
// Real REST API
@Injectable()
export class CategoryService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	// getCategory$: Observable<any>; private getCategorySubject = new Subject<any>()

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {
			// this.getCategory$ = this.getCategorySubject.asObservable();
		 }

	getDomain(): string {
		return this.httpUtils.domain + API_CATEGORY_URL;
	}

	// tslint:disable-next-line: member-ordering
	private _refreshNeeded$ = new Subject<void>();
	get refreshNeeded$() {
		return this._refreshNeeded$;
	}
		 /*
	getCategory(data) {
		console.log(data);
		this.getCategorySubject.next(data);
	}
	*/
	// CREATE =>  POST: add a new product to the server
	createCategory(category): Observable<CategoryModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<CategoryModel>(this.getDomain(), category, { headers: httpHeaders }).pipe(
			tap(() => {
				this._refreshNeeded$.next();
			})
		);
	}

	// READ
	getAllCategories(): Observable<CategoryModel[]> {
		return this.http.get<CategoryModel[]>(this.getDomain());
	}

	// READ
	getParentCategories(): Observable<CategoryModel[]> {
		return this.http.get<CategoryModel[]>(this.getDomain() + '/cat');
	}

	// READ
	AllCategories(): Observable<CategoryModel[]> {
		return this.http.get<CategoryModel[]>(this.getDomain() + '/catchild');
	}

	getCategories(): Observable<CategoryModel[]> {
		return this.http.get<CategoryModel[]>(this.getDomain() + '/categories');
	}

	getCategoryById(categoryId: number): Observable<CategoryModel> {
		return this.http.get<CategoryModel>(this.getDomain() + `/${categoryId}`);
	}

	// Server should return filtered/sorted result
	findCategorys(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			return this.getAllCategories().pipe(
				mergeMap(res => {
					const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
					return of(result);
				})
			);
	}

	// UPDATE => PUT: update the product on the server
	updateCategory(category): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = category.get('id');
		const APi_URL = this.httpUtils.domain + '/api/hm/catalog/category/';
		return this.http.put(APi_URL + id, category, { headers: httpHeaders });
	}

	// UPDATE Status
	// Comment this when you start work with real server
	// This code imitates server calls
	updateParentForCategory(categorys: CategoryModel[], id_parent: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			categorysForUpdate: categorys,
			newParent: id_parent
		};
		const url = this.getDomain() + '/updateParent';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteCategory(categoryId: number): Observable<CategoryModel> {
		const url = `${this.getDomain()}/${categoryId}`;
		return this.http.delete<CategoryModel>(url);
	}

	deleteCategories(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteCategory(ids[i]));
		}
		return forkJoin(tasks$);
	}
}
