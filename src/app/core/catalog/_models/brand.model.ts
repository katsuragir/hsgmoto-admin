

export class BrandModel {
	id: number;
	image: File;
	name: string;
	description: string;
	create_at: Date;

	clear() {
		this.image = null;
		this.name = '';
		this.description = '';
	}
}
