import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { QueryParamsModel, QueryResultsModel, HttpUtilsService } from '../../_base/crud';

const API_SETTING = '/api/hm/setting';

@Injectable({
	providedIn: 'root'
})
export class SettingService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {}

	getDomain(): string {
		return this.httpUtils.domain + API_SETTING;
	}

	/**
	* Get All Setting
	*/
	setting() {
 		return this.http.get(this.getDomain());
	}

	/**
	 * Update Cart
	 */
	updateCart(setting) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post(this.getDomain() + '/cart', setting, { headers: httpHeaders });
	}

	/**
	 * Get all visitor today
	 */
	allvisitorToday() {
		return this.http.get(this.getDomain() + '/get/allvisitor/today');
	}

	/**
	 * Get Mac visitor today
	 */
	macvisitorToday() {
		return this.http.get(this.getDomain() + '/get/macvisitor/today');
	}

	/**
	 * Get Android visitor today
	 */
	androidvisitorToday() {
		return this.http.get(this.getDomain() + '/get/androidvisitor/today');
	}

	/**
	 * Get Windows visitor today
	 */
	windowsvisitorToday() {
		return this.http.get(this.getDomain() + '/get/windowvisitor/today');
	}

	/**
	 * Get iOs visitor today
	 */
	iosvisitorToday() {
		return this.http.get(this.getDomain() + '/get/iosvisitor/today');
	}

	/**
	 * Get Other visitor today
	 */
	othervisitorToday() {
		return this.http.get(this.getDomain() + '/get/othervisitor/today');
	}

	// ======================== visitor month =====================
	/**
	 * Get all visitor Month
	 */
	allvisitorMonth() {
		return this.http.get(this.getDomain() + '/get/allvisitor/month');
	}

	/**
	 * Get Mac visitor Month
	 */
	macvisitorMonth() {
		return this.http.get(this.getDomain() + '/get/macvisitor/month');
	}

	/**
	 * Get Android visitor Month
	 */
	androidvisitorMonth() {
		return this.http.get(this.getDomain() + '/get/androidvisitor/month');
	}

	/**
	 * Get Windows visitor Month
	 */
	windowsvisitorMonth() {
		return this.http.get(this.getDomain() + '/get/windowvisitor/month');
	}

	/**
	 * Get iOs visitor Month
	 */
	iosvisitorMonth() {
		return this.http.get(this.getDomain() + '/get/iosvisitor/Month');
	}

	/**
	 * Get Other visitor Month
	 */
	othervisitorMonth() {
		return this.http.get(this.getDomain() + '/get/othervisitor/Month');
	}

	// ======================== visitor last month =====================
	/**
	 * Get all visitor LastMonth
	 */
	allvisitorLastMonth() {
		return this.http.get(this.getDomain() + '/get/allvisitor/lastmonth');
	}

	/**
	 * Get Mac visitor LastMonth
	 */
	macvisitorLastMonth() {
		return this.http.get(this.getDomain() + '/get/macvisitor/lastmonth');
	}

	/**
	 * Get Android visitor LastMonth
	 */
	androidvisitorLastMonth() {
		return this.http.get(this.getDomain() + '/get/androidvisitor/lastmonth');
	}

	/**
	 * Get Windows visitor LastMonth
	 */
	windowsvisitorLastMonth() {
		return this.http.get(this.getDomain() + '/get/windowvisitor/lastmonth');
	}

	/**
	 * Get iOs visitor LastMonth
	 */
	iosvisitorLastMonth() {
		return this.http.get(this.getDomain() + '/get/iosvisitor/lastMonth');
	}

	/**
	 * Get Other visitor LastMonth
	 */
	othervisitorLastMonth() {
		return this.http.get(this.getDomain() + '/get/othervisitor/lastMonth');
	}

}
