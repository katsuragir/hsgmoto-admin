

export class InvoiceModel {
	id: number;
	invoice: string;
	id_order: string;
	create_at: Date;
	custName: string;
	stat: number;


	clear() {
		this.id = undefined;
		this.invoice = '';
		this.id_order = '';
	}
}
