import { OnInit, OnDestroy, Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { SubheaderService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, HttpUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { AppState } from '../../../../../../core/reducers';
import { Store, select } from '@ngrx/store';
import { BarangModel, selectBarangsActionLoading, BrandUpdated, BarangUpdated, BarangService } from '../../../../../../core/catalog';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Update } from '@ngrx/entity';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-products-condition',
	templateUrl: './product-condition.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ProductsConditionComponent implements OnInit, OnDestroy {
	viewLoading: boolean = false;
	product: BarangModel;
	ProductForm: FormGroup;
	DiscountForm: FormGroup;
	chartForm: FormGroup;
	hasFormErrors: boolean = false;
	massage: any;

	constructor(public dialogRef: MatDialogRef<ProductsConditionComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private store: Store<AppState>,
		private typesUtilsService: TypesUtilsService,
		private cdr: ChangeDetectorRef,
		private barangService: BarangService) {  }


	ngOnInit() {
		// console.log(this.data);
		this.store.pipe(select(selectBarangsActionLoading)).subscribe(res => this.viewLoading = res);
		if (this.data.product) {
			this.product = this.data.product;
		} else {
			this.product = null;
		}
		this.createForm();
	}

	ngOnDestroy() {

	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.product.id > 0) {
			return `Change Condition '${this.product.name}' From '${this.product.kondisi}'`;
		}

		return 'Change Condition';
	}

	createForm() {
		this.ProductForm = this.fb.group({
			kondisi: [this.product.kondisi, Validators.required],
		});

		this.DiscountForm = this.fb.group({
			discount: [this.product.discountvalue, Validators.required],
			flag: [this.product.discounttype, Validators.required],
		});

		this.chartForm = this.fb.group({
			stat: [this.data.stat, Validators.required]
		});
	}

	/**
	 * On Submit
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.ProductForm.controls;
		/** check form */
		if (this.ProductForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		// const controls = this.brandForm.controls;
		const kondisi: string = controls['kondisi'].value;
		// console.log(kondisi);
		const _barang = new BarangModel();
		_barang.model = this.product.model;
		if (kondisi === 'Regular') {
			_barang.kondisi = '1';
		} else if (kondisi === 'BestSeller') {
			_barang.kondisi = '2';
		} else {
			_barang.kondisi = '3';
		}
		return this.barangService.updateBarangCondition(_barang, this.product.model).subscribe(
			result => {
				// console.log(result);
				this.detectChanges();
				this.dialogRef.close({ _barang, isEdit: true });
			}
		);
	}

	/**
	 * On Discount
	 */
	onDiscount() {
		this.hasFormErrors = false;
		const controls = this.DiscountForm.controls;
		/** check form */
		if (this.DiscountForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		// const controls = this.brandForm.controls;
		let flag: number;
		if (controls['flag'].value === 'Amount') {
			flag = 1;
		} else {
			flag = 2;
		}
		const _barang = {
			id: this.product.id,
			dv: controls['discount'].value,
			flg: flag
		};
		return this.barangService.updateBarangDiscount(_barang).subscribe(
			result => {
				// console.log(result);
				this.detectChanges();
				this.dialogRef.close({ _barang, isEdit: true });
			}
		);
	}

	/**
	 * On Chart
	 */
	onChart() {
		this.hasFormErrors = false;
		const controls = this.chartForm.controls;
		/** check form */
		if (this.chartForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		// const controls = this.brandForm.controls;
		const _barang = {
			stat: this.data.stat
		};
		// console.log(_barang);
		return this.barangService.updateCart(_barang).subscribe(
			result => {
				// console.log(result);
				this.detectChanges();
				this.dialogRef.close({ _barang, isEdit: true });
			}
		);
	}

	/**
	 * On Abort
	 */
	onAbort() {
		const _barang = {
			id: this.product.id,
			dv: 0,
			flg: ''
		};
		return this.barangService.updateBarangDiscount(_barang).subscribe(
			result => {
				// console.log(result);
				this.detectChanges();
				this.dialogRef.close({ _barang, isEdit: true });
			}
		);
	}

	detectChanges() {
		this.cdr.markForCheck();
	}


}
