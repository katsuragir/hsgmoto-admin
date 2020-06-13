export class Biodata {
  id_customer: number;
  image: File;
  gender: string;
  phone: string;
  dob: string;
  address: string;
  id_province: number;
  id_city: number;
  id_district: number;
  postal: number;

  clear(): void {
    this.image = null;
    this.gender = '';
    this.phone = '';
    this.address = '';
    this.id_province = 0;
    this.id_city = 0;
    this.id_district = 0;
    this.postal = 0;
  }
}
