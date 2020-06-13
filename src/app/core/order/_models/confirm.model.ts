

export class ConfirmModel {
	id: number;
	transaction_id: string;
	total_amount: number;
	first_name: string;
	last_name: string;
	date_payment: Date;
	payment: number;
	virtual_account: number;
	note: string;

	clear() {
		this.id = undefined;
		this.transaction_id = '';
		this.total_amount = 0;
		this.first_name = '';
		this.last_name = '';
		this.payment = 0;
		this.virtual_account = 0;
		this.note = '';

	}
}
