

export class DeliveryModel {
	id: number;
	id_order: string;
	id_product: number;
	prodName: string;
	image: File;
	quantity: number;
	weight: number;
	price: number;
	total: number;
	color: string;
	nic: string;
	slug_url: string;
	stock: number;


	clear() {
		this.id_order = '';
		this.id_product = undefined;
		this.prodName = '';
		this.image = null;
		this.quantity = 0;
		this.weight = 0;
		this.price = 0;
		this.total = 0;
		this.color = '';
		this.nic = '';
		this.slug_url = '';
		this.stock = 0;
	}
}
