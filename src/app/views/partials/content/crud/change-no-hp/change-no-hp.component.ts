// Angular
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DeliveryService } from '../../../../../core/order/_services';
import { Router } from '@angular/router';
import { CustomerService } from '../../../../../core/customer';

@Component({
	selector: 'kt-change-no-hp',
	templateUrl: './change-no-hp.component.html'
})
export class ChangeHPDialogComponent implements OnInit {
	// Public properties
	viewLoading: boolean = false;
	statusForm: FormGroup;
	result: any;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<ChangeHPDialogComponent>
	 * @param data: any
	 */
	constructor(
		public dialogRef: MatDialogRef<ChangeHPDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private statusFB: FormBuilder, private customerService: CustomerService,
		private router: Router
	) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.initStatus();
		// console.log(this.data.data);
	}

	initStatus() {
		// console.log(this.orderHeaderA.status);
		this.statusForm = this.statusFB.group({
			phone: [this.data.data.phone, Validators.required]
		});
	}

	/**
	 * Close dialog with false result
	 */
	onNoClick(): void {
		this.dialogRef.close();
	}

	/**
	 * Close dialog with true result
	 */
	onYesClick(): void {
		/* Server loading imitation. Remove this */
		this.viewLoading = true;
		const controls = this.statusForm.controls;

		setTimeout(() => {
			const change = {
				// tslint:disable-next-line: object-literal-shorthand
				id_customer: this.data.data.id_customer,
				phone: controls['phone'].value
			};
			// console.log(data);
			this.customerService.updateCustomerPhone(change).subscribe(
				result => {
					this.result = result;
					this.router.navigate(['admin/customers/customer?=success']);
				}
			);
			this.dialogRef.close(true); // Keep only this row
		}, 1000);
	}
}
