

export class CategoryModel {
	id: number;
	name: string;
	id_parent: number;
	description: string;
	image: File;
	slug: string;
	create_at: Date;

	clear() {
		this.name = '';
		this.id_parent = 1;
		this.description = '';
		this.image = null;
		this.slug = '';
	}
}
