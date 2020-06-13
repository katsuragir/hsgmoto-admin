

export class AboutUSModel {
	id: number;
	firstname: string;
	lastname: string;
	email: string;
	verification: number;
	password: string;
	accessToken: string;
	status: number;
	id_province: number;
	id_city: number;
	id_district: number;
	dob: string;
	gender: string;
	phone: string;
	id_customer: number;
	address: string;
	postal: number;

	clear(): void {
		this.id = undefined;
		this.firstname = '';
		this.lastname = '';
		this.email = '';
		this.verification = 0;
		this.password = '';
		this.accessToken = 'access-member-' + Math.random();
		this.status = 0;
	}
}
