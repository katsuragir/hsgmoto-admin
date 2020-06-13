// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialog } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of, Subject } from 'rxjs';
import { map, startWith, delay, first} from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, TypesUtilsService, MessageType } from '../../../../../../core/_base/crud';
// Services and Models
import {
	selectVoucherById,
	VoucherModel,
	VoucherOnServerCreated,
	VoucherService
} from '../../../../../../core/catalog';
import { find } from 'lodash';
import { DatePipe } from '@angular/common';
import { currentUser, User } from '../../../../../../core/auth';
import { NumberModel } from '../../../../../../core/catalog/_models/number.model';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-voucher-add',
	templateUrl: './voucher-add.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})
export class VoucherAddComponent implements OnInit, OnDestroy {
	// Public properties
	voucher: VoucherModel;
	voucherlist: VoucherModel[] = [];
	voucherId$: Observable<number>;
	oldVoucher: VoucherModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	voucherForm: FormGroup;
	hasFormErrors: boolean = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	fileToUpload: File = null;
	imageUrl: string = '';
	hasIDErrors: boolean = false;
	// Private password
	private componentSubscriptions: Subscription;
	// sticky portlet header margin
	private headerMargin: number;
	public unique = '';
	user$: User;
	private date = new Date();
	public numb: VoucherModel;
	public number: number;
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
				this.voucherlist = vouch
			}
		);
		const unique = '1234567890';
		const lengthOfUnique = 6;
		this.makeUnique(lengthOfUnique, unique);
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {
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
			} else {
					const newVoucher = new VoucherModel();
					newVoucher.clear();
					this.voucherId$ = of(newVoucher.id);
					this.voucher = newVoucher;
					this.oldVoucher = Object.assign({}, newVoucher);
					this.initVoucher();
				}
			});

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	makeUnique(lengthOfUnique: number, unique: string) {
		for (let i = 0; i < lengthOfUnique; i++) {
			this.unique += unique.charAt(Math.floor(Math.random() * unique.length));
		}
		// console.log(this.unique);
		return this.unique;
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
		this.store.pipe(select(currentUser), first(res => {
			return res !== undefined;
		})
		).subscribe(result => {
			this.user$ = result;
		});
		const unique = +this.number + 1;
		this.voucherForm = this.voucherFB.group({
			vid: [this.voucher.voucherid, [ Validators.required, Validators.pattern('^[a-zA-Z0-9 ]*$')]],
			vname: [this.voucher.vouchername, Validators.required],
			from: ['', Validators.required],
			to: ['', Validators.required],
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
			return (item.voucherid = controls['vid'].value);
		});

		if (vouch) {
			this.hasIDErrors = true;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedVoucher = this.prepareVoucher();
		let dataForm = this.makeFormData(editedVoucher);

		this.addVoucher(editedVoucher, withBack);

	}

	onSave(withBack: boolean = false) {
		this.hasFormErrors = false;
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
			return (item.voucherid.toLowerCase === controls['vid'].value.toLowerCase());
		});

		if (vouch) {
			console.log(vouch);
			this.hasIDErrors = true;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedVoucher1 = this.prepareVoucher1();
		let dataForm1 = this.makeFormData1(editedVoucher1);

		this.addVoucher1(editedVoucher1, withBack);

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

	prepareVoucher1(): VoucherModel {
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

	makeFormData1(_voucher) {
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
	 * Add voucher
	 *
	 * @param _voucher: VoucherModel
	 * @param withBack: boolean
	 */
	addVoucher(voucher: VoucherModel, withBack: boolean = false) {
		// this.store.dispatch(new VoucherOnServerCreated({ voucher: voucher }));
		return this.voucherService.createVoucher(voucher).subscribe(
			res => {
				let test: any;
				test = res;
				if (test.text === 'failed') {
					this.router.navigate(['vp-admin/catalog/vouchers']);
					const message = `Voucher already exist`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
					this.reset();
				} else {
					this.router.navigate(['vp-admin/catalog/vouchers']);
					const message = `New voucher successfully has been added.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
					this.reset();
				}
			}
		);
	}

	addVoucher1(voucher, withBack: boolean = false) {
		// this.store.dispatch(new VoucherOnServerCreated({ voucher: voucher }));
			// this.router.navigate(['vp-admin/catalog/product']);
			return this.voucherService.createVoucher(voucher).subscribe(
				res => {
					let test: any;
					test = res;
					if (test.text === 'failed') {
						// this.router.navigate(['vp-admin/catalog/vouchers']);
						const message = `Voucher already exist`;
						this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
						this.reset();
					} else {
						// this.router.navigate(['vp-admin/catalog/vouchers']);
						const message = `New voucher successfully has been added.`;
						this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
						this.reset();
					}
				}
			);
			// const message = `New voucher successfully has been added.`;
			// this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
			// this.reset();
	}

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create voucher';
		if (!this.voucher || !this.voucher.id) {
			return result;
		}

		result = `Edit voucher`;
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
