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
import { AppState } from '../../../../../core/reducers';
// CRUD
import { TypesUtilsService, HttpUtilsService } from '../../../../../core/_base/crud';
// Services and Models
import {
	DistributorModel,
	DistributorUpdated,
	DistributorOnServerCreated,
	selectLastCreatedDistributorId,
	selectDistributorsPageLoading,
	selectDistributorsActionLoading } from '../../../../../core/distributor';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-distributor-edit',
	templateUrl: './distributor-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class DistributorEditComponent implements OnInit, OnDestroy {
	// Public properties
	distributor: DistributorModel;
	distributorForm: FormGroup;
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
	 * @param dialogRef: MatDialogRef<DistributorEditDialogComponent>
	 * @param data: any
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(public dialogRef: MatDialogRef<DistributorEditComponent>,
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
		this.store.pipe(select(selectDistributorsActionLoading)).subscribe(res => this.viewLoading = res);
		this.distributor = this.data.distributor;
		if (this.data.distributor.image) {
			this.imageUrl = this.localURl + '/images/distributors/' + this.data.distributor.image;
		}
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
		this.distributorForm = this.fb.group({
			name: [this.distributor.name_dist, Validators.required],
			flag: [this.distributor.flag_stat.toString(), Validators.required],
			description: [this.distributor.description, Validators.required]
		});
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.distributor.id > 0) {
			return `Edit distributor '${this.distributor.name_dist}'`;
		}

		return 'New distributor';
	}

	/**
	 * Check control is invalid
	 * @param controlName: string
	 */
	isControlInvalid(controlName: string): boolean {
		const control = this.distributorForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	/** ACTIONS */

	/**
	 * Returns prepared distributor
	 */
	prepareDistributor(): DistributorModel {
		const controls = this.distributorForm.controls;
		const _distributor = new DistributorModel();
		_distributor.id = this.distributor.id;
		_distributor.name_dist = controls['name'].value;
		_distributor.description = controls['description'].value;
		_distributor.flag_stat = controls['flag'].value;
		return _distributor;
	}

	/**
	 * makeFormData
	 */
	makeFormData(_distributor) {
		const formData: FormData = new FormData();
		if (this.fileToUpload === null) {
			formData.append('image', '');
		} else {
			formData.append('image', this.fileToUpload, this.fileToUpload.name);
		}
		formData.append('name', _distributor.name_dist);
		formData.append('description', _distributor.description);
		formData.append('flag', _distributor.flag_stat);
		return formData;
	}

	/**
	 * makeFormData
	 */
	makeFormDataUpdate(_distributor) {
		const formData: FormData = new FormData();
		formData.append('id', _distributor.id);
		if (this.fileToUpload === null) {
			formData.append('image', '');
		} else {
			formData.append('image', this.fileToUpload, this.fileToUpload.name);
		}
		formData.append('name', _distributor.name_dist);
		formData.append('description', _distributor.description);
		formData.append('flag', _distributor.flag_stat);
		return formData;
	}

	/**
	 * On Submit
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.distributorForm.controls;
		/** check form */
		if (this.distributorForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}

		const editedDistributor = this.prepareDistributor();
		if (editedDistributor.id > 0) {
			let dataForm = this.makeFormDataUpdate(editedDistributor);
			this.updateDistributor(dataForm);
		} else {
			let dataForm = this.makeFormData(editedDistributor);
			this.createDistributor(dataForm);
		}
	}

	/**
	 * Update distributor
	 *
	 * @param _distributor: DistributorModel
	 */
	updateDistributor(formData) {
		this.cdr.markForCheck();
		const updateDistributor: Update<DistributorModel> = {
			id: formData.get('id'),
			changes: formData
		};
		this.store.dispatch(new DistributorUpdated({
			partialDistributor: updateDistributor,
			distributor: formData
		}));
		this.detectChanges();
		// Remove this line
		// of(undefined).pipe(delay(1000)).subscribe(() => this.dialogRef.close({ formData, isEdit: true }));
		// Uncomment this line
		this.dialogRef.close({ formData, isEdit: true });
	}

	/**
	 * Create distributor
	 *
	 * @param _distributor: DistributorModel
	 */
	createDistributor(formData) {
		this.cdr.markForCheck();
		this.store.dispatch(new DistributorOnServerCreated({ distributor: formData }));
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
