// Angular
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'kt-add-discount-dialog',
	templateUrl: './add-discount-dialog.component.html'
})
export class AddDiscountDialogComponent implements OnInit {
	// Public properties
	viewLoading: boolean = false;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<AddDiscountDialogComponent>
	 * @param data: any
	 */
	constructor(
		public dialogRef: MatDialogRef<AddDiscountDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
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
		}, 2500);
	}
}
