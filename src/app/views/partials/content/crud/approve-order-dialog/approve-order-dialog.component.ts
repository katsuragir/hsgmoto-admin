// Angular
import { Component, Inject, OnInit, ɵConsole } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DeliveryService } from '../../../../../core/order/_services';
import { Router } from '@angular/router';

@Component({
	selector: 'kt-approve-order-dialog',
	templateUrl: './approve-order-dialog.component.html'
})
export class ApproveOrderDialogComponent implements OnInit {
	// Public properties
	viewLoading: boolean = false;
	statusForm: FormGroup;
	result: any;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<ApproveOrderDialogComponent>
	 * @param data: any
	 */
	constructor(
		public dialogRef: MatDialogRef<ApproveOrderDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public update: any,
		private statusFB: FormBuilder, private deliveryService: DeliveryService,
		private router: Router
	) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		// console.log(this.update);
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

		setTimeout(() => {
			this.dialogRef.close(true); // Keep only this row
		}, 1000);
	}
}
