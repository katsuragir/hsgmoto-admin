// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { TypesUtilsService, HttpUtilsService } from '../../../../../../core/_base/crud';
// Services and Models
import {
	BrandModel,
	BrandUpdated,
	BrandOnServerCreated,
	selectLastCreatedBrandId,
	selectBrandsPageLoading,
	selectBrandsActionLoading } from '../../../../../../core/catalog';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-brand-edit',
	templateUrl: './brand-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class BrandEditComponent implements OnInit, OnDestroy {
	// Public properties
	brand: BrandModel;
	brandForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	imageUrl: string = '/assets/img/default-image.png';
	fileToUpload: File = null;
	// Private properties
	private componentSubscriptions: Subscription;
	private localURl: string;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<BrandEditDialogComponent>
	 * @param data: any
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(public dialogRef: MatDialogRef<BrandEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private store: Store<AppState>,
		private typesUtilsService: TypesUtilsService,
		private cdr: ChangeDetectorRef,
		private domainLocal: HttpUtilsService) {
			this.localURl = this.domainLocal.domain;
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

	handleFileInput(file: FileList) {
		this.fileToUpload = file.item(0);

		// Show image preview
		let reader = new FileReader();
		reader.onload = (event: any) => {
			this.imageUrl = event.target.result;
		};
		reader.readAsDataURL(this.fileToUpload);
	}

	createForm() {
		this.brandForm = this.fb.group({
			name: [this.brand.name, Validators.required],
			description: [this.brand.description]
		});
		if (this.brand.image) {
			this.imageUrl = this.brand.image.toString();
		}
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.brand.id > 0) {
			return `Edit brand '${this.brand.name}'`;
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
	 * makeFormData
	 */
	makeFormData(_brand) {
		const formData: FormData = new FormData();
		if (this.fileToUpload === null) {
			formData.append('image', '');
		} else {
			formData.append('image', this.fileToUpload, this.fileToUpload.name);
		}
		formData.append('name', _brand.name);
		formData.append('description', _brand.description);
		return formData;
	}

	/**
	 * makeFormData
	 */
	makeFormDataUpdate(_brand) {
		const formData: FormData = new FormData();
		formData.append('id', _brand.id);
		if (this.fileToUpload === null) {
			formData.append('image', '');
		} else {
			formData.append('image', this.fileToUpload, this.fileToUpload.name);
		}
		formData.append('name', _brand.name);
		formData.append('description', _brand.description);
		return formData;
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
		if (editedBrand.id > 0) {
			let dataForm = this.makeFormDataUpdate(editedBrand);
			this.updateBrand(dataForm);
		} else {
			let dataForm = this.makeFormData(editedBrand);
			this.createBrand(dataForm);
		}
	}

	/**
	 * Update brand
	 *
	 * @param _brand: BrandModel
	 */
	updateBrand(formData) {
		this.cdr.markForCheck();
		const updateBrand: Update<BrandModel> = {
			id: formData.get('id'),
			changes: formData
		};
		this.store.dispatch(new BrandUpdated({
			partialBrand: updateBrand,
			brand: formData
		}));
		this.detectChanges();
		// Remove this line
		// of(undefined).pipe(delay(1000)).subscribe(() => this.dialogRef.close({ formData, isEdit: true }));
		// Uncomment this line
		this.dialogRef.close({ formData, isEdit: true });
	}

	/**
	 * Create brand
	 *
	 * @param _brand: BrandModel
	 */
	createBrand(formData) {
		this.cdr.markForCheck();
		this.store.dispatch(new BrandOnServerCreated({ brand: formData }));
		this.detectChanges();
		this.dialogRef.close({ formData, isEdit: false });
	}

	detectChanges() {
		this.cdr.markForCheck();
	}

	/** Alect Close event */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
