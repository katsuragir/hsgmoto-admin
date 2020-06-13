import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { User } from '../_models/user.model';
import { Permission } from '../_models/permission.model';
import { Role } from '../_models/role.model';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { QueryParamsModel, QueryResultsModel, HttpUtilsService } from '../../_base/crud';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { find, filter, each, some } from 'lodash';
import { Md5 } from 'ts-md5';

const API_USERS_URL = '/api/hm/auth/user/';
const API_PERMISSION_URL = '/api/hm/auth/permission/';
const API_ROLES_URL = '/api/hm/auth/roles/';

@Injectable()
export class AuthService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {}

	getDomainUser(): string {
		return this.httpUtils.domain + API_USERS_URL;
	}

	getDomainPerm(): string {
		return this.httpUtils.domain + API_PERMISSION_URL;
	}

	getDomainRole(): string {
		return this.httpUtils.domain + API_ROLES_URL;
	}

	// Authentication/Authorization
	login(email: string, password: string): Observable<User> {
		if (!email || !password) {
			return of(null);
		}

		return  this.getAllUsers().pipe(
			map((result: User[]) => {
				if (result.length <= 0) {
					return null;
				}
				const _password = Md5.hashStr(password);
				const user = find(result, function(item: User) {
					return (item.email.toLowerCase() === email.toLowerCase() && item.password === _password);
				});

				if (!user) {
					return null;
				}

				if (user.status === 0) {
					return null;
				}

				user.password = undefined;
				return user;
			})
		);
	}

	/**
	 * Update status login
	 */
	updateStat(user): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.put<any>(this.getDomainUser() + `upStatLog/${user.id}`, user, { headers: httpHeaders });
	}

	getUserByToken(): Observable<User> {
		const userToken = localStorage.getItem(environment.authTokenKey);
		if (!userToken) {
			return of(null);
		}

		return this.getAllUsers().pipe(
			map((result: User[]) => {
				if (result.length <= 0) {
					return null;
				}

				const user = find(result, function(item: User) {
					return (item.accessToken === userToken.toString());
				});

				if (!user) {
					return null;
				}

				user.password = undefined;
				return user;
			})
		);
	}

	register(user: User): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<User>(this.getDomainUser(), user, { headers: httpHeaders })
			.pipe(
				map((res: User) => {
					return res;
				}),
				catchError(err => {
					return null;
				})
			);
	}

	/*
	 * Submit forgot password request
	 *
	 * @param {string} email
	 * @returns {Observable<any>}
	 */
	public requestPassword(email: string): Observable<any> {
		return this.http.get(this.getDomainUser() + '/forgot?=' + email)
			.pipe(catchError(this.handleError('forgot-password', []))
		);
	}


	getAllUsers(): Observable<User[]> {
		return this.http.get<User[]>(this.getDomainUser());
	}

	getUserById(userId: number): Observable<User> {
		return this.http.get<User>(this.getDomainUser() + `${userId}`);
	}


	// DELETE => delete the user from the server
	deleteUser(userId: number) {
		const url = `${this.getDomainUser()}/${userId}`;
		return this.http.delete(url);
	}

	// UPDATE => PUT: update the user on the server
	updateUser(_user: User): Observable<any> {
		const httpHeaders = new HttpHeaders();
		const id = _user.id;
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.put(this.getDomainUser() + id, _user, { headers: httpHeaders });
	}

	updateUserPassword(_user: User): Observable<any> {
		const httpHeaders = new HttpHeaders();
		const id = _user.id;
		const url = this.httpUtils.domain + '/api/hm/auth/user/password/';
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.put(url + id, _user, { headers: httpHeaders });
	}

	updateUserStatus(_user: User): Observable<any> {
		const httpHeaders = new HttpHeaders();
		const id = _user.id;
		const url = this.httpUtils.domain + '/api/hm/auth/user/status/';
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.put(url + id, _user, { headers: httpHeaders });
	}

	// CREATE =>  POST: add a new user to the server
	createUser(user: User): Observable<User> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<User>(this.getDomainUser(), user, { headers: httpHeaders});
	}

	// Method from server should return QueryResultsModel(items: any[], totalsCount: number)
	// items => filtered/sorted result
	findUsers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		return this.getAllUsers().pipe(
			mergeMap((response: User[]) => {
				const result = this.httpUtils.baseFilter(response, queryParams, []);
				return of(result);
			})
		);
	}

	// Permission
	getAllPermissions(): Observable<Permission[]> {
		return this.http.get<Permission[]>(this.getDomainPerm());
	}

	getRolePermissions(roleId: number): Observable<Permission[]> {
		const allRolesRequest = this.http.get<Permission[]>(this.getDomainPerm());
		const roleRequest = roleId ? this.getRoleId(roleId) : of(null);
		// tslint:disable-next-line: deprecation
		return forkJoin(allRolesRequest, roleRequest).pipe(
			map(res => {
				const _allPermissions: Permission[] = res[0];
				const _role: Role = res[1];
				if (!_allPermissions || _allPermissions.length === 0) {
					return [];
				}

				const _rolePermission = _role ? _role.permissions : [];
				const result: Permission[] = this.getRolePermissionsTree(_allPermissions, _rolePermission);
				return result;
			})
		);
	}

	private getRolePermissionsTree(_allPermission: Permission[] = [], _rolePermissionIds: number[] = []): Permission[] {
		const result: Permission[] = [];
		const _root: Permission[] = filter(_allPermission, (item: Permission) => !item.parentId);
		each(_root, (_rootItem: Permission) => {
			_rootItem._children = [];
			_rootItem._children = this.collectChildrenPermission(_allPermission, _rootItem.id, _rolePermissionIds);
			_rootItem.isSelected = (some(_rolePermissionIds, (id: number) => id === _rootItem.id));
			result.push(_rootItem);
		});
		return result;
	}

	private collectChildrenPermission(_allPermission: Permission[] = [],
		_parentId: number, _rolePermissionIds: number[]  = []): Permission[] {
		const result: Permission[] = [];
		const _children: Permission[] = filter(_allPermission, (item: Permission) => item.parentId === _parentId);
		if (_children.length === 0) {
			return result;
		}

		each(_children, (_childItem: Permission) => {
			_childItem._children = [];
			_childItem._children = this.collectChildrenPermission(_allPermission, _childItem.id, _rolePermissionIds);
			_childItem.isSelected = (some(_rolePermissionIds, (id: number) => id === _childItem.id));
			result.push(_childItem);
		});
		return result;
	}

	// Roles
	getAllRoles(): Observable<Role[]> {
		return this.http.get<Role[]>(this.getDomainRole());
	}

	getRoles(): Observable<Role[]> {
		return this.http.get<Role[]>(this.getDomainRole() + '/roles');
	}

	getTitleRoles(): Observable<Role[]> {
		const url = this.httpUtils.domain + '/api/hm/auth/roles/title';
		return this.http.get<Role[]>(url);
	}

	getAllRoleswithPermission(): Observable<Role[]> {
		return this.http.get<Role[]>(this.getDomainRole() + '/permission');
	}

	getRoleId(roleId: number): Observable<Role> {
		const url = this.httpUtils.domain + '/api/auth/roles/getId';
		return this.http.get<Role>(url + `/${roleId}`);
	}

	getRoleById(roleId: number): Observable<Role> {
		return this.http.get<Role>(this.getDomainRole() + `/${roleId}`);
	}

	// CREATE =>  POST: add a new role to the server
	createRole(role: Role): Observable<Role> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<Role>(this.getDomainRole(), role, { headers: httpHeaders});
	}

	// UPDATE => PUT: update the role on the server
	updateRole(role: Role): Observable<any> {
		const httpHeaders = new HttpHeaders();
		const id = role.id;
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.put(this.getDomainRole() + id, role, { headers: httpHeaders });
	}

	// DELETE => delete the role from the server
	deleteRole(roleId: number): Observable<Role> {
		const url = `${this.getDomainRole()}${roleId}`;
		return this.http.delete<Role>(url);
	}

	// Check Role Before deletion
	isRoleAssignedToUsers(roleId: number): Observable<boolean> {
		return this.http.get<boolean>(this.getDomainRole() + '/checkIsRollAssignedToUser?roleId=' + roleId);
	}

	findRoles(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// This code imitates server calls
		// This code imitates server calls
		return this.http.get<Role[]>(this.getDomainRole()).pipe(
			mergeMap(res => {
				const result = this.httpUtils.baseFilter(res, queryParams, []);
				return of(result);
			})
		);
	}

 	/*
 	 * Handle Http operation that failed.
 	 * Let the app continue.
	 *
	 * @param operation - name of the operation that failed
 	 * @param result - optional value to return as the observable result
 	 */
	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead

			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}
}
