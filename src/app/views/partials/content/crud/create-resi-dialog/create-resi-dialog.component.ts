// Angular
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DeliveryService } from '../../../../../core/order/_services';
import { Router } from '@angular/router';

@Component({
	selector: 'kt-create-resi-dialog',
	templateUrl: './create-resi-dialog.component.html'
})
export class CreateResiDialogComponent implements OnInit {
	// Public properties
	viewLoading: boolean = false;
	statusForm: FormGroup;
	result: any;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<CreateResiDialogComponent>
	 * @param data: any
	 */
	constructor(
		public dialogRef: MatDialogRef<CreateResiDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
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
		this.initStatus();
		// tslint:disable-next-line: max-line-length
		if (this.data.data.rajaongkir && this.data.data.rajaongkir.result.delivered === true || this.data.data.rajaongkir && this.data.data.rajaongkir.result.delivery_status.status === 'DELIVERED') {
			const done = {
				id: this.data.data.order.id_order,
				order: 3,
				shipping: 1,
				delivery_at: this.data.data.rajaongkir.result.delivery_status
			};
			this.deliveryService.updateDelivery(done).subscribe(
				hasil => {
					console.log(hasil);
					// this.router.navigate(['vp-admin/order/orders']);
				}
			);
		}
		// console.log(this.data.data);
	}

	initStatus() {
		// console.log(this.orderHeaderA.status);
		this.statusForm = this.statusFB.group({
			rest: ['']
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
			const delivery = {
				// tslint:disable-next-line: object-literal-shorthand
				id_order: this.data.data.id_order,
				status: this.data.data.status,
				rest: controls['rest'].value,
				id_invoice: this.data.data.id_invoice,
			};
			// console.log(delivery);

			this.deliveryService.createDelivery(delivery).subscribe(
				result => {
					this.result = result;
					this.router.navigate(['vp-admin/order/orders']);
				}
			);

			this.dialogRef.close(true); // Keep only this row
		}, 1000);
	}
}
