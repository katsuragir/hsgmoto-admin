import { Biodata } from './biodata.model';

export class CustomerModel {
	id: number;
	firstname: string;
	lastname: string;
	email: string;
	verification: number;
	password: string;
	accessToken: string;
	biodata: Biodata;
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
		this.biodata = new Biodata();
		this.biodata.clear();
		this.status = 0;
	}
}
