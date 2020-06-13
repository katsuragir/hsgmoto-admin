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
	BannerModel,
	BannerUpdated,
	BannerOnServerCreated,
	selectLastCreatedBannerId,
	selectBannersPageLoading,
	selectBannersActionLoading } from '../../../../../../core/catalog';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-banner-edit',
	templateUrl: './banner-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class BannerEditComponent implements OnInit, OnDestroy {
	// Public properties
	banner: BannerModel;
	bannerForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	imageUrl: string = '/assets/img/default-image.png';
	fileToUpload: File = null;
	private localURl: string;
	// Private properties
	private componentSubscriptions: Subscription;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<BannerEditDialogComponent>
	 * @param data: any
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(public dialogRef: MatDialogRef<BannerEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private store: Store<AppState>,
		private typesUtilsService: TypesUtilsService,
		private cdr: ChangeDetectorRef,
		private domainLocal: HttpUtilsService
		) { this.localURl = this.domainLocal.domain;
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.store.pipe(select(selectBannersActionLoading)).subscribe(res => this.viewLoading = res);
		this.banner = this.data.banner;
		if (this.banner.image) {
			this.imageUrl = this.banner.image.toString();
		}
		// console.log(this.banner);
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
		this.bannerForm = this.fb.group({
			status: [this.banner.status.toString(), Validators.required],
			hyperlink: [this.banner.hyperlink, Validators.required],
			description: [this.banner.description]
		});
		// console.log(this.bannerForm.controls['hyperlink'].value);
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.banner.id > 0) {
			return `Edit banner`;
		}

		return 'New banner';
	}

	/**
	 * Check control is invalid
	 * @param controlName: string
	 */
	isControlInvalid(controlName: string): boolean {
		const control = this.bannerForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	/** ACTIONS */

	/**
	 * Returns prepared banner
	 */
	prepareBanner(): BannerModel {
		const controls = this.bannerForm.controls;
		const _banner = new BannerModel();
		_banner.id = this.banner.id;
		_banner.description = controls['description'].value;
		_banner.hyperlink = controls['hyperlink'].value;
		_banner.status = controls['status'].value;
		return _banner;
	}

	/**
	 * makeFormData
	 */
	makeFormData(_banner) {
		const formData: FormData = new FormData();
		if (this.fileToUpload === null) {
			formData.append('image', '');
		} else {
			formData.append('image', this.fileToUpload, this.fileToUpload.name);
		}
		formData.append('hyperlink', _banner.hyperlink);
		formData.append('description', _banner.description);
		formData.append('status', _banner.status);
		return formData;
	}

	/**
	 * makeFormData
	 */
	makeFormDataUpdate(_banner) {
		const formData: FormData = new FormData();
		formData.append('id', _banner.id);
		if (this.fileToUpload === null) {
			formData.append('image', '');
		} else {
			formData.append('image', this.fileToUpload, this.fileToUpload.name);
		}
		formData.append('hyperlink', _banner.hyperlink);
		formData.append('description', _banner.description);
		formData.append('status', _banner.status);
		return formData;
	}

	/**
	 * On Submit
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.bannerForm.controls;
		/** check form */
		if (this.bannerForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}

		const editedBanner = this.prepareBanner();
		if (editedBanner.id > 0) {
			let dataForm = this.makeFormDataUpdate(editedBanner);
			this.updateBanner(dataForm);
		} else {
			let dataForm = this.makeFormData(editedBanner);
			this.createBanner(dataForm);
		}
	}

	/**
	 * Update banner
	 *
	 * @param _banner: BannerModel
	 */
	updateBanner(formData) {
		this.cdr.markForCheck();
		const updateBanner: Update<BannerModel> = {
			id: formData.get('id'),
			changes: formData
		};
		this.store.dispatch(new BannerUpdated({
			partialBanner: updateBanner,
			banner: formData
		}));
		this.detectChanges();
		// Remove this line
		// of(undefined).pipe(delay(1000)).subscribe(() => this.dialogRef.close({ formData, isEdit: true }));
		// Uncomment this line
		this.dialogRef.close({ formData, isEdit: true });
	}

	/**
	 * Create banner
	 *
	 * @param _banner: BannerModel
	 */
	createBanner(formData) {
		this.cdr.markForCheck();
		this.store.dispatch(new BannerOnServerCreated({ banner: formData }));
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
