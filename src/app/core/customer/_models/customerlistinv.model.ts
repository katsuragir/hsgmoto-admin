

export class ListInvModel {
	id: number;
	Cusname: string;
	crate_at: Date;
	id_order: string;
	invoice: string;
	resi: string;
	status: number;

	clear(): void {
		this.id = undefined;
		this.Cusname = '';
		this.id_order = '';
		this.invoice = '';
		this.resi = '';
		this.status = 0;
	}
}
