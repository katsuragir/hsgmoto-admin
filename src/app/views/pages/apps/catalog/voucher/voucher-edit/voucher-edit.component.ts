// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location, DatePipe } from '@angular/common';
// Material
import { MatDialog } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { map, startWith, delay, first} from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
import { Dictionary, Update } from '@ngrx/entity';
import { AppState } from '../../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, TypesUtilsService, MessageType } from '../../../../../../core/_base/crud';
// Services and Models
import {
	selectLastCreatedVoucherId,
	selectVoucherById,
	VoucherModel,
	VoucherOnServerCreated,
	VoucherUpdated,
	VoucherService
} from '../../../../../../core/catalog';
import { currentUser, User } from '../../../../../../core/auth';
import { find } from 'lodash';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-voucher-edit',
	templateUrl: './voucher-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})
export class VoucherEditComponent implements OnInit, OnDestroy {
	// Public properties
	voucher: VoucherModel;
	voucherId$: Observable<number>;
	voucherlist: VoucherModel[] = [];
	oldVoucher: VoucherModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	voucherForm: FormGroup;
	hasFormErrors: boolean = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	// Private password
	private componentSubscriptions: Subscription;
	// sticky portlet header margin
	private headerMargin: number;
	hasIDErrors: boolean = false;
	user$: User;
	isAdmin: any = [];

	/**
	 * Component constructor
	 *
	 * @param store: Store<AppState>
	 * @param activatedRoute: ActivatedRoute
	 * @param router: Router
	 * @param typesUtilsService: TypesUtilsService
	 * @param voucherFB: FormBuilder
	 * @param dialog: MatDialog
	 * @param subheaderService: SubheaderService
	 * @param layoutUtilsService: SubheaderService
	 * @param layoutConfigService: LayoutConfigService
	 */
	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		private voucherFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private voucherService: VoucherService,
		private location: Location,
		private datePipe: DatePipe) {
		}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
		parent: any = [];

	ngOnInit() {
		this.store.pipe(select(currentUser), first(res => {
			return res !== undefined;
		})
		).subscribe(result => {
			this.user$ = result;
			this.isAdmin = this.user$.roles;
		});
		this.voucherService.getAllVouchers().subscribe(
			vouch => {
				this.voucherlist = vouch;
			}
		);
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
				this.store.pipe(
					select(selectVoucherById(id)),
					first(res => {
						return res !== undefined;
					})
				).subscribe(result => {
					this.voucher = result;
					this.voucherId$ = of(result.id);
					this.oldVoucher = Object.assign({}, result);
					this.initVoucher();
				});
			});

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	/**
	 * Init voucher
	 */
	initVoucher() {
		this.createForm();
		const prefix = this.layoutConfigService.getCurrentMainRoute();
		this.loadingSubject.next(false);
		if (!this.voucher.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'Catalog', page: `../${prefix}/catalog` },
				{ title: 'Vouchers',  page: `../${prefix}/catalog/vouchers` },
				{ title: 'Create voucher', page: `../${prefix}/catalog/vouchers/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Edit voucher');
		this.subheaderService.setBreadcrumbs([
			{ title: 'Catalog', page: `../${prefix}/catalog` },
			{ title: 'Vouchers',  page: `../${prefix}/catalog/vouchers` },
			{ title: 'Edit voucher', page: `../${prefix}/catalog/vouchers/edit`, queryParams: { id: this.voucher.id } }
		]);
	}

	/**
	 * Create form
	 */
	createForm() {
		this.voucherForm = this.voucherFB.group({
			vid: [this.voucher.voucherid, [ Validators.required, Validators.pattern('^[a-zA-Z0-9 ]*$')]],
			vname: [this.voucher.vouchername, Validators.required],
			from: [this.voucher.fromdate, Validators.required],
			to: [this.voucher.todate, Validators.required],
			value: [this.voucher.vouchervalue, Validators.required],
			type: [this.voucher.vouchertab, Validators.required],
			status: [this.voucher.status.toString(), Validators.required],
			quota: [this.voucher.kouta],
			limit: [this.voucher.limit_pay],
			// member: [this.voucher.member.toString(), Validators.required],
			dtype: [this.voucher.type.toString(), Validators.required]
		});
	}

	/**
	 * Go back to the list
	 *
	 * @param id: any
	 */
	goBack(id) {
		this.loadingSubject.next(false);
		const url = `${this.layoutConfigService.getCurrentMainRoute()}/catalog/vouchers?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Refresh voucher
	 *
	 * @param isNew: boolean
	 * @param id: number
	 */
	refreshVoucher(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `${this.layoutConfigService.getCurrentMainRoute()}/catalog/vouchers/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Reset
	 */
	reset() {
		this.voucher = Object.assign({}, this.oldVoucher);
		this.createForm();
		this.hasFormErrors = false;
		this.hasIDErrors = false;
		this.voucherForm.markAsPristine();
		this.voucherForm.markAsUntouched();
		this.voucherForm.updateValueAndValidity();
	}

	backPage() {
		this.location.back();
	}

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.hasIDErrors = false;
		const controls = this.voucherForm.controls;
		/** check form */
		if (this.voucherForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const vouch = find(this.voucherlist, function(item: VoucherModel) {
			return (item.voucherid === controls['vid'].value);
		});

		if (vouch && vouch.id !== this.voucher.id) {
			this.hasIDErrors = true;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedVoucher = this.prepareVoucher();
		let dataForm = this.makeFormData(editedVoucher);
		this.updateVoucher(editedVoucher, withBack);
		return;


	}

	/**
	 * Returns object for saving
	 */
	prepareVoucher(): VoucherModel {
		const controls = this.voucherForm.controls;
		const fromdate = this.datePipe.transform(controls['from'].value, 'yyyy-MM-dd');
		const todate = this.datePipe.transform(controls['to'].value, 'yyyy-MM-dd');
		const _voucher = new VoucherModel();
		_voucher.id = this.voucher.id;
		_voucher.voucherid = controls['vid'].value;
		_voucher.vouchername = controls['vname'].value;
		_voucher.fromdate = fromdate;
		_voucher.todate = todate;
		_voucher.vouchervalue = controls['value'].value;
		_voucher.vouchertab = controls['type'].value;
		_voucher.status = controls['status'].value;
		_voucher.kouta = controls['quota'].value;
		// _voucher.member = controls['member'].value;
		_voucher.limit_pay = controls['limit'].value;
		_voucher.type = controls['dtype'].value;
		return _voucher;
	}

	makeFormData(_voucher) {
		// console.log(_voucher);
		const formData: FormData = new FormData();
		formData.append('id', _voucher.id);
		formData.append('vi', _voucher.voucherid);
		formData.append('vn', _voucher.vouchername);
		formData.append('fr', _voucher.fromdate);
		formData.append('to', _voucher.todate);
		formData.append('st', _voucher.status);
		return formData;
	}

	/**
	 * Update voucher
	 *
	 * @param _voucher: VoucherModel
	 * @param withBack: boolean
	 */
	updateVoucher(_voucher: VoucherModel, withBack: boolean = false) {
		this.loadingSubject.next(true);

		const updateVoucher: Update<VoucherModel> = {
			id: _voucher.id,
			changes: _voucher
		};
		// console.log(_voucher);
		this.store.dispatch(new VoucherUpdated({
			partialVoucher: updateVoucher,
			voucher: _voucher
		}));
		const message = `Voucher successfully has been saved.`;
		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
		this.refreshVoucher(false);
		return this.router.navigate(['vp-admin/catalog/vouchers']);
	}

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create voucher';
		if (!this.voucher || !this.voucher.id) {
			return result;
		}

		result = `Edit voucher ${this.voucher.voucherid} - ${this.voucher.vouchername}`;
		return result;
	}

	/**
	 * Close alert
	 *
	 * @param $event
	 */
	onAlertClose($event) {
		this.hasFormErrors = false;
		this.hasIDErrors = false;
	}
}
