

export class ReportModel {
	id: number;
	date: Date;
	status: number;
	total: number;
	count: number;


	clear() {
		this.total = 0;
		this.status = 0;
		this.count = 0;
	}
}
