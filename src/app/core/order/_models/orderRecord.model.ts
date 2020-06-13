

export class OrderRecordModel {
	waiting: number;
	confirm: number;



	clear() {
		this.waiting = 0;
		this.confirm = 0;
	}
}
