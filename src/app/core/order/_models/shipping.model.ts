

export class ShippingModel {
	id: number;
	dest_code: string;
	id_courier: number;
	jenis: string;
	ongkir: number;
	etd: string;


	clear() {
		this.id = undefined;
		this.dest_code = '';
		this.id_courier = 0;
		this.jenis = '';
		this.ongkir = 0;
		this.etd = '';
	}
}
