

export class DistributorModel {
	id: number;
	image: File;
	name_dist: string;
	description: string;
	flag_stat: number;
	create_at: Date;

	clear() {
		this.image = null;
		this.name_dist = '';
		this.description = '';
		this.flag_stat = 0;
	}
}
