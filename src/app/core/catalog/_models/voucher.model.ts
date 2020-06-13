

export class VoucherModel {
	id: number;
	voucherid: string;
	vouchername: string;
	description: string;
	fromdate: string;
	todate: string;
	vouchervalue: number;
	vouchertab: string;
	value: string;
	status: number;
	createdate: string;
	updatedate: string;
	kouta: number;
	inuse: number;
	member: number;
	stat: number;
	limit_pay: number;
	type: number;

	clear() {
		this.id = undefined;
		this.voucherid = '';
		this.vouchername = '';
		this.description = '1';
		this.vouchervalue = 0;
		this.vouchertab = '';
		this.status = 0;
		this.kouta = 0;
		this.inuse = 0;
		this.member = 1;
		this.stat = 1;
		this.limit_pay = 0;
		this.type = 1;
	}
}
