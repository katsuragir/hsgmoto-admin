

export class OrderModel {
	id: number;
	no: number;
	id_order: string;
	id_customer: number;
	id_ongkir: number;
	total: number;
	payment: number;
	amountv: number;
	status: number;
	exp_date: Date;
	create_at: Date;


	clear() {
		this.id_order = '';
		this.id_customer = 0;
		this.id_ongkir = 0;
		this.total = 0;
		this.payment = 0;
		this.status = 0;
	}
}
