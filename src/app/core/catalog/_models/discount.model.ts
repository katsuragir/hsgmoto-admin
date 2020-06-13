import { Time } from '@angular/common';


export class DiscountModel {
	id: number;
	kode_disc: string;
	description: string;
	from_date: string;
	to_date: string;
	discount: number;
	flag_discount: string;
	status: number;
	create_by: string;
	date_create: string;
	time_create: Time;
	no: number;
	value: string;

	clear() {
		this.id = undefined;
		this.kode_disc = '';
		this.description = '';
		this.discount = 0;
		this.flag_discount = '';
		this.status = 0;
		this.create_by = '';
	}
}
