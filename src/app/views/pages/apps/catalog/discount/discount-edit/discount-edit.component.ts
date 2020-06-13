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
	selectLastCreatedDiscountId,
	selectDiscountById,
	DiscountModel,
	DiscountOnServerCreated,
	DiscountUpdated,
	DiscountService
} from '../../../../../../core/catalog';
import { find } from 'lodash';
/*
const AVAILABLE_COLORS: string[] =
	['Red', 'CadetBlue', 'Gold', 'LightSlateGrey', 'RoyalBlue', 'Crimson', 'Blue', 'Sienna', 'Indigo', 'Green', 'Violet',
	'GoldenRod', 'OrangeRed', 'Khaki', 'Teal', 'Purple', 'Orange', 'Pink', 'Black', 'DarkTurquoise'];

const AVAILABLE_MANUFACTURES: string[] =
	['Pontiac', 'Subaru', 'Mitsubishi', 'Oldsmobile', 'Chevrolet', 'Chrysler', 'Suzuki', 'GMC', 'Cadillac', 'Mercury', 'Dodge',
	'Ram', 'Lexus', 'Lamborghini', 'Honda', 'Nissan', 'Ford', 'Hyundai', 'Saab', 'Toyota'];
*/
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-discount-edit',
	templateUrl: './discount-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})
export class DiscountEditComponent implements OnInit, OnDestroy {
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
	imageUrl: string = '/assets/img/default-image.png';
	fileToUpload: File = null;
	isImageDiscount = false;
	// Private password
	private componentSubscriptions: Subscription;
	// sticky portlet header margin
	private headerMargin: number;
	hasSlugErrors: boolean = false;

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
				});
			} else {
					const newDiscount = new DiscountModel();
					newDiscount.clear();
					this.discountId$ = of(newDiscount.id);
					this.discount = newDiscount;
					this.oldDiscount = Object.assign({}, newDiscount);
					this.initDiscount();
				}
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

	/**
	 * Create form
	 */
	createForm() {
		this.discountForm = this.discountFB.group({
			kode_disc: [{value: this.discount.kode_disc, disabled: true}, Validators.required],
			description: [this.discount.description],
			from: [this.discount.from_date, Validators.required],
			to: [this.discount.to_date, Validators.required],
			discount: [this.discount.discount, Validators.required],
			flag: [this.discount.flag_discount.toString(), Validators.required],
			status: [this.discount.status.toString(), Validators.required],
			by: [{value: this.discount.create_by, disabled: true}, Validators.required],
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
		this.updateDiscount(editedDiscount, withBack);
		return;


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
		// console.log(_discount);
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

	/**
	 * Update discount
	 *
	 * @param _discount: DiscountModel
	 * @param withBack: boolean
	 */
	updateDiscount(_discount: DiscountModel, withBack: boolean = false) {
		this.loadingSubject.next(true);

		const updateDiscount: Update<DiscountModel> = {
			id: _discount.id,
			changes: _discount
		};
		// console.log(_discount);
		this.store.dispatch(new DiscountUpdated({
			partialDiscount: updateDiscount,
			discount: _discount
		}));
		const message = `Discount successfully has been saved.`;
		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
		this.refreshDiscount(false);
		return this.router.navigate(['vp-admin/catalog/discounts']);
	}

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create discount';
		if (!this.discount || !this.discount.id) {
			return result;
		}

		result = `Edit discount ${this.discount.kode_disc} Create By ${this.discount.create_by}`;
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
