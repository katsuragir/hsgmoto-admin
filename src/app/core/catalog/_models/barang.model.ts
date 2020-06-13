import { BrandModel } from './brand.model';
import { CategoryModel } from './category.model';

export class BarangModel {
	id: number;
	barcode: string;
	name: string;
	id_category: number;
	id_brand: number;
	summary: string;
	description: string;
	stock: number;
	price: number;
	color: string;
	video: string;
	status: number;
	kondisi: string;
	image: File;
	width: number;
	height: number;
	depth: number;
	weight: string;
	Mimage: File;
	home: number;
	create_at: Date;
	slug: string;
	nic: string;
	kode_disc: string;
	slug_url: string;
	discountvalue: number;
	discounttype: string;
	discValue: string;
	setup: number;
	Bname: string;
	flagName: string;
	size: string;
	model: string;
	tags: string;

	_brand: BrandModel[];
	_category: CategoryModel[];

	clear() {
		this.barcode = '';
		this.name = '';
		this.id_category = 0;
		this.id_brand = 0;
		this.summary = '';
		this.description = '';
		this.stock = 0;
		this.price = 0;
		this.color = '';
		this.video = '';
		this.status = 1;
		this.kondisi = '2';
		this.width = 0;
		this.height = 0;
		this.depth = 0;
		this.weight = '';
		this.image = null;
		this.Mimage = null;
		this.home = 0;
		this.slug = '';
		this.nic = '';
		this.discountvalue = 0;
		this.discounttype = '';
		this.Bname = '';
		this.size = '';
		this.model = '';
		this.tags = '';
	}
}
