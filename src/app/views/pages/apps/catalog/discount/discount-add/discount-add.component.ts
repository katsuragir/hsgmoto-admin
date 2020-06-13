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
	selectDiscountById,
	DiscountModel,
	DiscountOnServerCreated,
	DiscountService
} from '../../../../../../core/catalog';
import { find } from 'lodash';
import { DatePipe } from '@angular/common';
import { currentUser, User } from '../../../../../../core/auth';
import { NumberModel } from '../../../../../../core/catalog/_models/number.model';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-discount-add',
	templateUrl: './discount-add.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})
export class DiscountAddComponent implements OnInit, OnDestroy {
	// Public properties
	discount: DiscountModel;
	discountId$: Observable<number>;
	oldDiscount: DiscountModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	discountForm: FormGroup;
	hasFormErrors: boolean = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	fileToUpload: File = null;
	imageUrl: string = '';
	hasSlugErrors: boolean = false;
	// Private password
	private componentSubscriptions: Subscription;
	// sticky portlet header margin
	private headerMargin: number;
	public unique = '';
	private user$: User;
	private date = new Date();
	public numb: DiscountModel;
	public number: number;
	/**
	 * Component constructor
	 *
	 * @param store: Store<AppState>
	 * @param activatedRoute: ActivatedRoute
	 * @param router: Router
	 * @param typesUtilsService: TypesUtilsService
	 * @param discountFB: FormBuilder
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
		private discountFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private discountService: DiscountService,
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
		const unique = '1234567890';
		const lengthOfUnique = 6;
		this.makeUnique(lengthOfUnique, unique);
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {
				this.store.pipe(
					select(selectDiscountById(id)),
					first(res => {
						return res !== undefined;
					})
				).subscribe(result => {
					this.discount = result;
					this.discountId$ = of(result.id);
					this.oldDiscount = Object.assign({}, result);
					this.initDiscount();
					this.generate();
				});
			} else {
					const newDiscount = new DiscountModel();
					newDiscount.clear();
					this.discountId$ = of(newDiscount.id);
					this.discount = newDiscount;
					this.oldDiscount = Object.assign({}, newDiscount);
					this.initDiscount();
					this.generate();
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
	 * Init discount
	 */
	initDiscount() {
		this.createForm();
		const prefix = this.layoutConfigService.getCurrentMainRoute();
		this.loadingSubject.next(false);
		if (!this.discount.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'Catalog', page: `../${prefix}/catalog` },
				{ title: 'Discounts',  page: `../${prefix}/catalog/discounts` },
				{ title: 'Create discount', page: `../${prefix}/catalog/discounts/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Edit discount');
		this.subheaderService.setBreadcrumbs([
			{ title: 'Catalog', page: `../${prefix}/catalog` },
			{ title: 'Discounts',  page: `../${prefix}/catalog/discounts` },
			{ title: 'Edit discount', page: `../${prefix}/catalog/discounts/edit`, queryParams: { id: this.discount.id } }
		]);
	}

	generate() {
		return this.discountService.getGenerate().subscribe(
			result => {
				this.number = result.no + 1;
				const year = this.datePipe.transform(this.date, 'yyyy');
				let numb: string;
				numb = this.number.toString();

				// console.log(numb.padStart(6, '0'));
				this.discountForm.controls['kode_disc'].setValue( 'DR.' + year + '.' + numb.padStart(6, '0'));
			}
		);
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
		this.discountForm = this.discountFB.group({
			kode_disc: [{value: ''  , disabled: true}, Validators.required],
			description: [this.discount.description],
			from: ['', Validators.required],
			to: ['', Validators.required],
			discount: [this.discount.discount, Validators.required],
			flag: [this.discount.flag_discount, Validators.required],
			status: [this.discount.status.toString(), Validators.required],
			by: [{value: this.user$.fullname, disabled: true}, Validators.required],
		});
	}

	/**
	 * Go back to the list
	 *
	 * @param id: any
	 */
	goBack(id) {
		this.loadingSubject.next(false);
		const url = `${this.layoutConfigService.getCurrentMainRoute()}/catalog/discounts?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Refresh discount
	 *
	 * @param isNew: boolean
	 * @param id: number
	 */
	refreshDiscount(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `${this.layoutConfigService.getCurrentMainRoute()}/catalog/discounts/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Reset
	 */
	reset() {
		this.discount = Object.assign({}, this.oldDiscount);
		this.createForm();
		this.hasFormErrors = false;
		this.discountForm.markAsPristine();
		this.discountForm.markAsUntouched();
		this.discountForm.updateValueAndValidity();
	}

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.discountForm.controls;
		/** check form */
		if (this.discountForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedDiscount = this.prepareDiscount();
		let dataForm = this.makeFormData(editedDiscount);

		this.addDiscount(editedDiscount, withBack);

	}

	onSave(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.discountForm.controls;
		/** check form */
		if (this.discountForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedDiscount1 = this.prepareDiscount1();
		let dataForm1 = this.makeFormData1(editedDiscount1);

		this.addDiscount1(editedDiscount1, withBack);

	}

	/**
	 * Returns object for saving
	 */
	prepareDiscount(): DiscountModel {
		const controls = this.discountForm.controls;
		const fromdate = this.datePipe.transform(controls['from'].value, 'yyyy-MM-dd');
		const todate = this.datePipe.transform(controls['to'].value, 'yyyy-MM-dd');
		const _discount = new DiscountModel();
		_discount.id = this.discount.id;
		_discount.kode_disc = controls['kode_disc'].value;
		_discount.description = controls['description'].value;
		_discount.from_date = fromdate;
		_discount.to_date = todate;
		_discount.discount = controls['discount'].value;
		_discount.flag_discount = controls['flag'].value;
		_discount.status = controls['status'].value;
		_discount.create_by = controls['by'].value;
		return _discount;
	}

	makeFormData(_discount) {
		// console.log(_discount);
		const formData: FormData = new FormData();
		formData.append('id', _discount.id);
		formData.append('kode_disc', _discount.kode_disc);
		formData.append('description', _discount.description);
		formData.append('from_date', _discount.from_date);
		formData.append('to_date', _discount.to_date);
		formData.append('discount', _discount.discount);
		formData.append('flag_discount', _discount.flag_discount);
		formData.append('status', _discount.status);
		formData.append('create_by', _discount.create_by);
		return formData;
	}

	prepareDiscount1(): DiscountModel {
		const controls = this.discountForm.controls;
		const fromdate = this.datePipe.transform(controls['from'].value, 'yyyy-MM-dd');
		const todate = this.datePipe.transform(controls['to'].value, 'yyyy-MM-dd');
		const _discount = new DiscountModel();
		_discount.id = this.discount.id;
		_discount.kode_disc = controls['kode_disc'].value;
		_discount.description = controls['description'].value;
		_discount.from_date = fromdate;
		_discount.to_date = todate;
		_discount.discount = controls['discount'].value;
		_discount.flag_discount = controls['flag'].value;
		_discount.status = controls['status'].value;
		_discount.create_by = controls['by'].value;
		return _discount;
	}

	makeFormData1(_discount) {
		const formData: FormData = new FormData();
		formData.append('k_dsc', _discount.kode_disc);
		formData.append('descp', _discount.description);
		formData.append('fr', _discount.from_date);
		formData.append('td', _discount.to_date);
		formData.append('dis', _discount.discount);
		formData.append('flg', _discount.flag_discount);
		formData.append('st', _discount.status);
		formData.append('cby', _discount.create_by);
		return formData;
	}

	/**
	 * Add discount
	 *
	 * @param _discount: DiscountModel
	 * @param withBack: boolean
	 */
	addDiscount(discount: DiscountModel, withBack: boolean = false) {
		// this.store.dispatch(new DiscountOnServerCreated({ discount: discount }));
		return this.discountService.createDiscount(discount).subscribe(
			res => {
				let test: any;
				test = res;
				if (test.text === 'failed') {
					this.router.navigate(['vp-admin/catalog/discounts']);
					const message = `Discount already exist.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
					this.reset();
				} else {
					this.router.navigate(['vp-admin/catalog/discounts']);
					const message = `New discount successfully has been added.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
					this.reset();
				}
			}
		);
	}

	addDiscount1(discount: DiscountModel, withBack: boolean = false) {
		// this.store.dispatch(new DiscountOnServerCreated({ discount: discount }));
			// this.router.navigate(['vp-admin/catalog/product']);
			return this.discountService.createDiscount(discount).subscribe(
				res => {
					let test: any;
					test = res;
					if (test.text === 'failed') {
						// this.router.navigate(['vp-admin/catalog/discounts']);
						const message = `Discount already exist.`;
						this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
						this.reset();
					} else {
						// this.router.navigate(['vp-admin/catalog/discounts']);
						const message = `New discount successfully has been added.`;
						this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
						this.reset();
					}
				}
			);
	}

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create discount';
		if (!this.discount || !this.discount.id) {
			return result;
		}

		result = `Edit discount`;
		return result;
	}

	/**
	 * Close alert
	 *
	 * @param $event
	 */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
