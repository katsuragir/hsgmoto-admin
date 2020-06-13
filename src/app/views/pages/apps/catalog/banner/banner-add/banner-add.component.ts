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
import {
	BannerModel,
	BannerUpdated,
	BannerOnServerCreated,
	selectLastCreatedBannerId,
	selectBannersPageLoading,
	selectBannersActionLoading } from '../../../../../../core/catalog';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-banner-add',
	templateUrl: './banner-add.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class BannerAddComponent implements OnInit, OnDestroy {
	// Public properties
	banner: BannerModel;
	bannerForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
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
	constructor(public dialogRef: MatDialogRef<BannerAddComponent>,
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
		this.store.pipe(select(selectBannersActionLoading)).subscribe(res => this.viewLoading = res);
		this.banner = this.data.banner;
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
		this.bannerForm = this.fb.group({
			description: [this.banner.description]
		});
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
		return _banner;
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
		this.createBanner(editedBanner);
		return;
	}

	/**
	 * Update banner
	 *
	 * @param _banner: BannerModel
	 */
	updateBanner(_banner) {
		const updateBanner: Update<BannerModel> = {
			id: _banner.id,
			changes: _banner
		};
		this.store.dispatch(new BannerUpdated({
			partialBanner: updateBanner,
			banner: _banner
		}));

		// Remove this line
		of(undefined).pipe(delay(1000)).subscribe(() => this.dialogRef.close({ _banner, isEdit: true }));
		// Uncomment this line
		// this.dialogRef.close({ _banner, isEdit: true }
	}

	/**
	 * Create banner
	 *
	 * @param _banner: BrandModel
	 */
	createBanner(_banner) {
		this.store.dispatch(new BannerOnServerCreated({ banner: _banner }));

		this.dialogRef.close({ _banner, isEdit: false });
	}

	/** Alect Close event */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
