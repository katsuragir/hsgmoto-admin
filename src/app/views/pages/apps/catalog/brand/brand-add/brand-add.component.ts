// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Subscription, of } from 'rxjs';
import { delay } from 'rxjs/operators';
// NGRX
import { Update } from '@ngrx/entity';
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../../core/reducers';
// CRUD
import { TypesUtilsService } from '../../../../../../core/_base/crud';
// Services and Models
import { BrandModel, BrandUpdated, BrandOnServerCreated, selectLastCreatedBrandId, selectBrandsPageLoading, selectBrandsActionLoading } from '../../../../../../core/catalog';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-brand-add',
	templateUrl: './brand-add.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class BrandAddComponent implements OnInit, OnDestroy {
	// Public properties
	brand: BrandModel;
	brandForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	// Private properties
	private componentSubscriptions: Subscription;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<BrandEditDialogComponent>
	 * @param data: any
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(public dialogRef: MatDialogRef<BrandAddComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private store: Store<AppState>,
		private typesUtilsService: TypesUtilsService) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.store.pipe(select(selectBrandsActionLoading)).subscribe(res => this.viewLoading = res);
		this.brand = this.data.brand;
		this.createForm();
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	createForm() {
		this.brandForm = this.fb.group({
			name: [this.brand.name, Validators.required],
			description: [this.brand.description]
		});
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.brand.id > 0) {
			return `Edit brand '${this.brand.name} ${
				this.brand.description
				}'`;
		}

		return 'New brand';
	}

	/**
	 * Check control is invalid
	 * @param controlName: string
	 */
	isControlInvalid(controlName: string): boolean {
		const control = this.brandForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	/** ACTIONS */

	/**
	 * Returns prepared brand
	 */
	prepareBrand(): BrandModel {
		const controls = this.brandForm.controls;
		const _brand = new BrandModel();
		_brand.id = this.brand.id;
		_brand.name = controls['name'].value;
		_brand.description = controls['description'].value;
		return _brand;
	}

	/**
	 * On Submit
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.brandForm.controls;
		/** check form */
		if (this.brandForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}

		const editedBrand = this.prepareBrand();
		this.createBrand(editedBrand);
		return;
	}

	/**
	 * Update brand
	 *
	 * @param _brand: BrandModel
	 */
	updateBrand(_brand) {
		const updateBrand: Update<BrandModel> = {
			id: _brand.id,
			changes: _brand
		};
		this.store.dispatch(new BrandUpdated({
			partialBrand: updateBrand,
			brand: _brand
		}));

		// Remove this line
		of(undefined).pipe(delay(1000)).subscribe(() => this.dialogRef.close({ _brand, isEdit: true }));
		// Uncomment this line
		// this.dialogRef.close({ _brand, isEdit: true }
	}

	/**
	 * Create brand
	 *
	 * @param _brand: BrandModel
	 */
	createBrand(_brand) {
		this.store.dispatch(new BrandOnServerCreated({ brand: _brand }));

		this.dialogRef.close({ _brand, isEdit: false });
	}

	/** Alect Close event */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
