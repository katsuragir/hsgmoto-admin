// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
// RxJS
import { Subscription, of, Observable, BehaviorSubject } from 'rxjs';
import { delay, first } from 'rxjs/operators';
// NGRX
import { Update } from '@ngrx/entity';
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../../core/reducers';
// CRUD
import { TypesUtilsService, LayoutUtilsService, MessageType, HttpUtilsService } from '../../../../../../core/_base/crud';
// Services and Models
import {
	selectLastCreatedBarangId,
	selectBarangById,
	BarangModel,
	BarangOnServerCreated,
	BarangUpdated,
	BarangService,
	CategoryService,
	BrandService,
	barangsReducer,
	OneImageDeleted,
	selectBarangsActionLoading
} from '../../../../../../core/catalog';
import { HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-productImage-edit-dialog',
	templateUrl: './productImage-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ProductImageEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	barang: BarangModel;
	barangForm: FormGroup;
	barangId$: Observable<number>;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	oldBarang: BarangModel;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	imageUrl: string = '';
	fileToUpload: File = null;
	public isEditMode: boolean = true;
	lastFileAt: Date;
	files: File[] = [];
	progress: number;
	hasBaseDropZoneOver: boolean = false;
	httpEmitter: Subscription;
	httpEvent: HttpEvent<{}>;
	sendableFormData: FormData;
	uploadResponse = { status: '', message: '', filePath: '' };
	error: string;
	message: any;
	private localURl: string;
	// Private properties
	private componentSubscriptions: Subscription;
	hideScrollbar;
	disabled;
	xDisabled;
	yDisabled;
	leftNavDisabled = false;
	rightNavDisabled = false;
	index = 0;
	imgvar: number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<ProductImageEditDialogComponent>
	 * @param data: any
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(public dialogRef: MatDialogRef<ProductImageEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private store: Store<AppState>,
		public dialog: MatDialog,
		private typesUtilsService: TypesUtilsService,
		private activatedRoute: ActivatedRoute,
		private barangService: BarangService,
		private layoutUtilsService: LayoutUtilsService,
		private http: HttpClient,
		private cdr: ChangeDetectorRef,
		private domainURL: HttpUtilsService) {
			this.cdr.markForCheck();
			this.localURl = this.domainURL.domain;
	}


	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */
	images: any = [];
	/**
	 * On init
	 */
	ngOnInit() {
		this.imageUrl = this.localURl + '/images/product/default-image.png';
		this.cdr.markForCheck();
		this.store.pipe(select(selectBarangsActionLoading)).subscribe(res => this.viewLoading = res);
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = this.data.product.id;
			if (id && id > 0) {
				this.store.pipe(
					select(selectBarangById(id)),
					first(res => {
						return res !== undefined;
					})
				).subscribe(result => {
					this.barang = result;
					this.barangId$ = of(result.id);
					this.oldBarang = Object.assign({}, result);
					if (result.image) {
						this.imageUrl = this.localURl + '/images/product/' + (result.image);
					} else {
						this.imageUrl = this.localURl + '/images/product/default-image.png';
					}
				});
			}
			});
			this.barangService.getAllImages(this.barang.id).subscribe(
				res => {
					this.data.image = res;
					this.images = res;
					if (res.length > 0) {
						this.show();
						this.imgvar = Object.keys(res).length + 1;
						console.log(this.imgvar);
					} else {
						this.hide();
						this.imgvar = 1;
						console.log(this.imgvar);
					}
					// console.log(this.images, this.imgvar);
				},
				err => console.error(err)
			);
			// console.log(this.barang.id);
	}


	show() {
		this.isEditMode = true;
	}

	hide() {
		this.isEditMode = false;
	}

	handleFileInput(files: FileList) {
		this.fileToUpload = files.item(0);

		// Show image preview
		let reader = new FileReader();
		reader.onload = (event: any) => {
			this.imageUrl = event.target.result;
		};
		reader.readAsDataURL(this.fileToUpload);
	}

	getDate() {
		return new Date();
	}

	uploadImage() {
		const id = this.barang.id;
		const url = this.domainURL.domain + '/api/catalog/product/image/';
		const formData = new FormData();
		formData.append('image', this.fileToUpload, this.fileToUpload.name);
		this.cdr.markForCheck();
		return this.http.put(url + id, formData);

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
		this.barangForm = this.fb.group({
			image: ['']
		});
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.data.id > 0) {
			return `Edit product '${this.barang.name}'`;
		}

		return 'New product';
	}

	/**
	 * Check control is invalid
	 * @param controlName: string
	 */
	isControlInvalid(controlName: string): boolean {
		const control = this.barangForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	/** ACTIONS */

	/**
	 * Returns prepared barang
	 */
	prepareProduct(): BarangModel {
		const controls = this.barangForm.controls;
		const _barang = new BarangModel();
		_barang.id = this.barang.id;
		const _date = controls['dob'].value;

		_barang.status = this.barang.status;
		return _barang;
	}

	/**
	 * On Submit
	 */
	onSubmit() {
		if ( !this.fileToUpload || this.fileToUpload === null) {
			const _deleteMessage = `Please input file first!!!`;
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			return;
		}
		const product = this.barang;
		const url = this.domainURL.domain + '/api/catalog/product/image/';
		this.cdr.markForCheck();
		const formData = new FormData();
		console.log(this.barang);
		formData.append('image', this.fileToUpload, this.barang.flagName + '.jpg');
		this.loadingSubject.next(true);
		this.barangService.uploadImage(formData, this.barang.id).subscribe(
			res => {
				this.message = res;
				this.detectChanges();
			}
		);
		this.detectChanges();
		this.dialogRef.close({product, isEdit: false});
	}

	detectChanges() {
		this.loadingSubject.next(true);
	}

	onSave(files: File[]): Subscription {
		if (files.length === 0 || !files || files === null) {
			const _deleteMessage = `Please input files first!!!`;
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			return;
		} else if (files.length > 5) {
			const _deleteMessage = `Max 5 file image for 1 upload image`;
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			return;
		}
		const url = this.domainURL.domain + '/api/catalog/product/images/';
		const id: any = this.barang.id;
		const formData: FormData = new FormData();
		this.cdr.markForCheck();
		formData.append('id', id);
		formData.append('barcode', this.barang.barcode);
		files = this.files || [];
		for (let i = 0; i < files.length; i++) {
			// console.log(files[i], this.imgvar + i);
			formData.append('file', files[i], this.barang.flagName + '-' + `(${this.imgvar + i})` + '.jpg');
			formData.append('imgvar', `${this.imgvar + i}`);
		}

		const req = new HttpRequest<FormData>('POST', url, formData, {
			reportProgress: true// , responseType: 'text'
		});
			return this.httpEmitter = this.http.request(req)
				.subscribe(
			event => {
				this.httpEvent = event;

				if (event instanceof HttpResponse) {
				delete this.httpEmitter;
				console.log('request done', event);
				this.dialogRef.close();
			}
			this.dialogRef.close();
			},
			error => console.log('Error Uploading', error)
		);

	}

	/**
	 * Update product
	 *
	 * @param _barang: BarangModel
	 */
	updateProduct(_barang) {
		const updateProduct: Update<BarangModel> = {
			id: _barang.id,
			changes: _barang
		};
		this.store.dispatch(new BarangUpdated({
			partialBarang: updateProduct,
			barang: _barang
		}));

		// Remove this line
		of(undefined).pipe(delay(1000)).subscribe(() => this.dialogRef.close({ _barang, isEdit: true }));
		// Uncomment this line
		// this.dialogRef.close({ _barang, isEdit: true }
	}

	/**
	 * Create barang
	 *
	 * @param _barang: BarangModel
	 */
	/*
	createCustomer(_customer: BarangModel) {
		this.store.dispatch(new CustomerOnServerCreated({ customer: _customer }));
		this.componentSubscriptions = this.store.pipe(
			select(selectLastCreatedCustomerId),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}

			this.dialogRef.close({ _customer, isEdit: false });
		});
	}
	*/
	/** Alect Close event */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	deleteImage(id: number) {
		const _title: string = 'Product Image Delete';
		const _description: string = 'Are you sure to permanently delete this product image?';
		const _waitDesciption: string = 'Product Image is deleting...';
		const _deleteMessage = `Product Image has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneImageDeleted({ id: id }));
			this.dialogRef.close();
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	/**
	 * Delete Image item
	 */
	delete(item: File) {
		const index = this.files.indexOf(item);
		this.files.splice(index, 1);
	}


	leftBoundStat(reachesLeftBound: boolean) {
		this.leftNavDisabled = reachesLeftBound;
	}

	rightBoundStat(reachesRightBound: boolean) {
		this.rightNavDisabled = reachesRightBound;
	}

	onSnapAnimationFinished() {
		// console.log('snap animation finished');
	}

	onIndexChanged(idx) {
		this.index = idx;
		// console.log('current index: ' + idx);
	}

	onDragScrollInitialized() {
		// console.log('first demo drag scroll has been initialized.');
	}

	onDragStart() {
		// console.log('drag start');
	}

	onDragEnd() {
		// console.log('drag end');
	}
}
