// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { map, startWith, delay, first} from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
import { Dictionary, Update } from '@ngrx/entity';
import { AppState } from '../../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, TypesUtilsService, MessageType, HttpUtilsService } from '../../../../../../core/_base/crud';
// Services and Models
import {
selectLastCreatedBarangId,
selectBarangById,
BarangModel,
BarangOnServerCreated,
BarangUpdated,
BarangService,
CategoryService,
BrandService,
CategoryModel,
selectCategoryById,
CategoryOnServerCreated
} from '../../../../../../core/catalog';
import { HttpEvent } from '@angular/common/http';
import { find } from 'lodash';
import { DecimalPipe, DatePipe } from '@angular/common';
import { AngularEditorConfig } from '@kolkov/angular-editor';


const AVAILABLE_COLORS: string[] =
	['Red', 'CadetBlue', 'Gold', 'LightSlateGrey', 'RoyalBlue', 'Crimson', 'Blue', 'Sienna', 'Indigo', 'Green', 'Violet',
	'GoldenRod', 'OrangeRed', 'Khaki', 'Teal', 'Purple', 'Orange', 'Pink', 'Black', 'DarkTurquoise'];
/*
const AVAILABLE_MANUFACTURES: string[] =
	['Pontiac', 'Subaru', 'Mitsubishi', 'Oldsmobile', 'Chevrolet', 'Chrysler', 'Suzuki', 'GMC', 'Cadillac', 'Mercury', 'Dodge',
	'Ram', 'Lexus', 'Lamborghini', 'Honda', 'Nissan', 'Ford', 'Hyundai', 'Saab', 'Toyota'];
*/
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-product-add',
	templateUrl: './product-add.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DecimalPipe, DatePipe]
})
export class ProductAddComponent implements OnInit, OnDestroy {
	// Public properties
	barang: BarangModel;
	barangId$: Observable<number>;
	oldBarang: BarangModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	barangForm: FormGroup;
	hasFormErrors: boolean = false;
	hasBrandErrors: boolean = false;
	hasErrors: boolean = false;
	hasSlugErrors: boolean = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	brand$: Observable<any[]>;
	brandHasil: any;
	filteredManufactures: Observable<string[]>;
	imageUrl: string = '/images/product/default-image.png';
	fileToUpload: File = null;
	lastFileAt: Date;
	files: File[] = [];
	file: File[] = [];
	progress: number;
	hasBaseDropZoneOver: boolean = false;
	httpEmitter: Subscription;
	httpEvent: HttpEvent<{}>;
	sendableFormData: FormData;
	public nCat: any = [];
	products: BarangModel[] = [];
	// Private password
	private componentSubscriptions: Subscription;
	// sticky portlet header margin
	private headerMargin: number;
	lastID: any;
	editorConfig: AngularEditorConfig = {
		editable: true,
		spellcheck: true,
		 height: '120px',
		 minHeight: '0',
		 maxHeight: '120px',
		 width: 'auto',
		 minWidth: '0',
		 translate: 'yes',
		 enableToolbar: true,
		 showToolbar: true,
		 placeholder: 'Enter text here...',
		 defaultParagraphSeparator: '',
		 defaultFontName: '',
		 defaultFontSize: '',
		 fonts: [
			{class: 'arial', name: 'Arial'},
			{class: 'times-new-roman', name: 'Times New Roman'},
			{class: 'calibri', name: 'Calibri'},
			{class: 'comic-sans-ms', name: 'Comic Sans MS'}
		 ],
		 customClasses: [
		 {
			name: 'quote',
			class: 'quote',
		 },
		 {
			name: 'redText',
			class: 'redText'
		 },
		 {
			name: 'titleText',
			class: 'titleText',
			tag: 'h1',
		 },
		],
		uploadUrl: 'v1/image',
		sanitize: true,
		toolbarPosition: 'top',
	};
	localURl: string;
	public number: number;
	private date = new Date();
	barcode: string;
	cover: any;
	interval: any;
	/**
	 * Component constructor
	 *
	 * @param store: Store<AppState>
	 * @param activatedRoute: ActivatedRoute
	 * @param router: Router
	 * @param typesUtilsService: TypesUtilsService
	 * @param barangFB: FormBuilder
	 * @param dialog: MatDialog
	 * @param subheaderService: SubheaderService
	 * @param layoutUtilsService: SubheaderService
	 * @param layoutConfigService: LayoutConfigService
	 */
	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		private barangFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private barangService: BarangService,
		private categoryService: CategoryService,
		private brandService: BrandService,
		private cdr: ChangeDetectorRef,
		private domainURL: HttpUtilsService,
		private _decimalPipe: DecimalPipe,
		private datePipe: DatePipe) {
			this.imageUrl = this.domainURL.domain + this.imageUrl;
			this.localURl = this.domainURL.domain;
		}

	/**
	 * @ Life cycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
		category: any[] = [];
		brand: any = [];
		sum: any = [];
		animal: string;
		name: string;


	calculate(width: number, height: number, depth: number) {
		this.sum = ((+width / 10) * (+height / 10) * (+depth / 10) / 6000) * 1000;
		this.barangForm.controls['weight'].setValue(this._decimalPipe.transform(this.sum, '1.0-0'));
	}

	ngOnInit() {

		this.file = [];
		this.files = [];
		this.cover = null;

		this.getCover();

		this.barangService.getLastIDproduct().subscribe(
			result => {
				this.lastID = result;
				// console.log(this.lastID);
			}
		);
		this.categoryService.refreshNeeded$.subscribe(() => {
			this.getAllCategories();
		});
		this.getAllCategories();
		this.brandService.getAllBrands().subscribe(
			res => {this.brand = res; },
			err => console.error(err)
		);
		this.barangService.getAllBarangs().subscribe(
			result => {
				// console.log(result);
				this.products = result;
			}
		);

		/*
		for (let i = 2019; i > 1945; i--) {
			this.availableYears.push(i);
		}
		*/
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
					const newBarang = new BarangModel();
					newBarang.clear();
					this.barangId$ = of(newBarang.id);
					this.barang = newBarang;
					this.oldBarang = Object.assign({}, newBarang);
					this.initBarang();
					this.generate();
			});

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	getCover() {
		this.interval = setInterval(() => {
			// console.log(this.file.length.toString(), this.cover.length.toString());
			if (this.files.length > 0) {
				if (this.file.length === 0 || !this.file || this.file === null) {
					this.file[0] = this.files[0];
					this.ngOnDestroy();
				}
				if (!this.cover || this.cover === null) {
					this.cover = this.files[0].name;
					this.ngOnDestroy();
				}

			}
		}, 2000);
	}

	getAllCategories() {
		this.categoryService.AllCategories().subscribe(
			res => { this.category = res; },
			err => console.error(err)
		);

	}

	generate() {
		return this.barangService.getGenerate().subscribe(
			result => {
				this.number = result.no + 1;
				const year = this.datePipe.transform(this.date, 'yyyy');
				let numb: string;
				numb = this.number.toString();

				// console.log(numb.padStart(6, '0'));
				this.barcode = 'VP' + numb.padStart(6, '0');
				// console.log(this.barcode);
			}
		);
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.interval) {
			clearInterval(this.interval);
		 }
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	handleFileInput(file: FileList) {
		this.fileToUpload = file.item(0);

		// Show image preview
		let reader = new FileReader();
		reader.onload = (event: any) => {
			this.imageUrl = event.target.result;
		};
		reader.readAsDataURL(this.fileToUpload);
	}

	getDate() {
		return new Date();
	}
	/**
	 * Init barang
	 */
	initBarang() {
		this.createForm();
		const prefix = this.layoutConfigService.getCurrentMainRoute();
		this.loadingSubject.next(false);
		if (!this.barang.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'Catalog', page: `../${prefix}/catalog` },
				{ title: 'Barang',  page: `../${prefix}/catalog/product` },
				{ title: 'Create barang', page: `../${prefix}/catalog/product/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Edit barang');
		this.subheaderService.setBreadcrumbs([
			{ title: 'Catalog', page: `../${prefix}/catalog` },
			{ title: 'Barang',  page: `../${prefix}/catalog/product` },
			{ title: 'Edit barang', page: `../${prefix}/catalog/barang/edit`, queryParams: { id: this.barang.id } }
		]);
	}

	/**
	 * Create form
	 */
	createForm() {
		this.barangForm = this.barangFB.group({
			// image: ['', [Validators.required]],
			barcode: [this.barang.barcode, Validators.required],
			name: [this.barang.name, Validators.required],
			id_category: [this.barang.id_category.toString(), Validators.required],
			slug: [this.barang.slug_url],
			id_brand: [''],
			summary: [this.barang.summary],
			description: [this.barang.description],
			stock: [this.barang.stock, [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
			price: [this.barang.price, [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
			color: [this.barang.color],
			youtube: [this.barang.video],
			nic: [this.barang.nic],
			status: [this.barang.status.toString(), [Validators.required, Validators.min(0), Validators.max(1)]],
			kondisi: [this.barang.kondisi.toString(), [Validators.required, Validators.min(1), Validators.max(4)]],
			home: ['1', [Validators.required, Validators.min(0), Validators.max(1)]],
			width: [this.barang.width, Validators.pattern(/^-?(0|[1-9]\d*)?$/)],
			height: [this.barang.height, Validators.pattern(/^-?(0|[1-9]\d*)?$/)],
			depth: [this.barang.depth, Validators.pattern(/^-?(0|[1-9]\d*)?$/)],
			weight: [this.barang.weight, Validators.required],
			// setup: [this.products[0].setup]
		});

		/*
		this.filteredManufactures = this.barangForm.controls.manufacture.valueChanges
			.pipe(
				startWith(''),
				map(val => this.filterManufacture(val.toString()))
			);
					*/
		this.brand$ = this.barangForm.controls.id_brand.valueChanges
			.pipe(
				startWith(''),
				map(val => this.filterBrand(val))
			);

		this.filteredColors = this.barangForm.controls.color.valueChanges
			.pipe(
				startWith(''),
				map(val =>
					this.filterColor(val.toString()
					))
		);

	}

	/**
	 * Filter Brand
	 *
	 * @param val: string
	 */

	filterBrand(val: string): string[] {
		const filterValue = val.toLowerCase();
		this.brandHasil = this.brand.filter(option => option.name.toLowerCase().includes(filterValue));
		// console.log(this.brandHasil);
		return this.brand.filter(option => option.name.toLowerCase().includes(filterValue));
	}

	/**
	 * Filter color
	 *
	 * @param val: string
	 */

	filterColor(val: string): string[] {
		// console.log(val);
		return AVAILABLE_COLORS.filter(option =>
			option.toLowerCase().includes(val.toLowerCase()));
	}

	/**
	 * Go back to the list
	 *
	 * @param id: any
	 */
	goBack(id) {
		this.loadingSubject.next(false);
		const url = `${this.layoutConfigService.getCurrentMainRoute()}/catalog/categories?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Refresh barang
	 *
	 * @param isNew: boolean
	 * @param id: number
	 */
	refreshBarang(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `${this.layoutConfigService.getCurrentMainRoute()}/catalog/categories/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Reset
	 */
	reset() {
		this.barang = Object.assign({}, this.oldBarang);
		this.createForm();
		this.hasFormErrors = false;
		this.hasBrandErrors = false;
		this.hasErrors = false;
		this.barangForm.markAsPristine();
		this.barangForm.markAsUntouched();
		this.barangForm.updateValueAndValidity();
	}

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.hasBrandErrors = false;
		this.hasErrors = false;
		const controls = this.barangForm.controls;
		const slash = '/';
		const titik = ':';
		const barcode = controls['barcode'].value.toLowerCase();
		const filterName = controls['name'].value.toLowerCase()
		.replace(/ /g, '-')
		.replace(new RegExp(slash, 'g'), '')
		.replace(new RegExp(titik, 'g'), '')
		.replace(/\-\-+/g, '-');
		const filterColor = controls['color'].value.replace(/\s+/g, '-').toLowerCase();
		const filterNic = controls['nic'].value.replace(/\s+/g, '-').toLowerCase();
		if (controls['nic'].value === '') {
			controls['slug'].setValue(filterName + '-' + filterColor);
		} else if (controls['color'].value === '') {
			controls['slug'].setValue(filterName + '-' + filterNic);
		} else if (controls['color'].value === '' && controls['nic'].value === '') {
			controls['slug'].setValue(filterName);
		} else if (controls['color'].value !== '' && controls['nic'].value !== '') {
			controls['slug'].setValue(filterName + '-' + filterColor + '-' + filterNic);
		} else {
			controls['slug'].setValue(filterName);
		}

		if (controls['weight'].value === '0' && this.sum === '') {
			this.hasErrors = true;
			return;
		}
		/** check form */
		if (this.barangForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		/** check brand */
		if (this.brandHasil.length === 0) {
			this.hasBrandErrors = true;
			return;
		}
		// console.log(controls['slug'].value);
		const barang = find(this.products, function(item: BarangModel) {
			// tslint:disable-next-line: max-line-length
			return (item.slug_url === controls['slug'].value);
		});

		if (barang) {
			// console.log('hellow');
			controls['slug'].setValue(controls['slug'].value + '-' + barcode);
			const check = find(this.products, function(item: BarangModel) {
				// tslint:disable-next-line: max-line-length
				return (item.slug_url === controls['slug'].value);
			});

			if (check) {
				return this.hasSlugErrors = true;
			}
		}

		// tslint:disable-next-line:prefer-const
		let editedBarang = this.prepareBarang();
		let dataForm = this.makeFormData(editedBarang);

		this.addBarang(dataForm, withBack);

	}

	onSave(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.hasBrandErrors = false;
		this.hasErrors = false;
		const controls = this.barangForm.controls;
		const slash = '/';
		const titik = ':';
		const barcode = controls['barcode'].value.toLowerCase();
		const filterName = controls['name'].value.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(new RegExp(slash, 'g'), '')
		.replace(new RegExp(titik, 'g'), '')
		.replace(/\-\-\-+/g, '-')
		.replace(/\-\-+/g, '-');
		const filterColor = controls['color'].value.replace(/\s+/g, '-').toLowerCase();
		const filterNic = controls['nic'].value.replace(/\s+/g, '-').toLowerCase();
		if (controls['nic'].value === '') {
			controls['slug'].setValue(filterName + '-' + filterColor);
		} else if (controls['color'].value === '') {
			controls['slug'].setValue(filterName + '-' + filterNic);
		} else if (controls['color'].value === '' && controls['nic'].value === '') {
			controls['slug'].setValue(filterName);
		} else if (controls['color'].value !== '' && controls['nic'].value !== '') {
			controls['slug'].setValue(filterName + '-' + filterColor + '-' + filterNic);
		} else {
			controls['slug'].setValue(filterName);
		}

		if (controls['weight'].value === '0' && this.sum === '') {
			this.hasErrors = true;
			return;
		}
		/** check form */
		if (this.barangForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		/** check brand */
		if (this.brandHasil.length === 0) {
			this.hasBrandErrors = true;
			return;
		}
		const barang = find(this.products, function(item: BarangModel) {
			// tslint:disable-next-line: max-line-length
			return (item.slug_url === controls['slug'].value);
		});

		if (barang) {
			// console.log('hellow');
			controls['slug'].setValue(controls['slug'].value + '-' + barcode);
			const check = find(this.products, function(item: BarangModel) {
				// tslint:disable-next-line: max-line-length
				return (item.slug_url === controls['slug'].value);
			});

			if (check) {
				return this.hasSlugErrors = true;
			}
		}

		// tslint:disable-next-line:prefer-const
		let editedBarang1 = this.prepareBarang1();
		let dataForm1 = this.makeFormData1(editedBarang1);

		this.addBarang1(dataForm1, withBack);
	}

	/**
	 * Returns object for saving
	 */
	prepareBarang(): BarangModel {
		const controls = this.barangForm.controls;
		const _barang = new BarangModel();
		_barang.id = this.lastID.id + 1;
		// console.log(_barang.id);
		_barang.barcode = controls['barcode'].value;
		_barang.name = controls['name'].value;
		_barang.id_category = +controls['id_category'].value;
		_barang.id_brand = +this.brandHasil[0].id;
		_barang.summary = controls['summary'].value;
		_barang.description = controls['description'].value;
		_barang.stock = controls['stock'].value;
		_barang.price = controls['price'].value;
		_barang.color = controls['color'].value;
		_barang.video = controls['youtube'].value;
		_barang.status = +controls['status'].value;
		_barang.kondisi = controls['kondisi'].value;
		_barang.home = +controls['home'].value;
		_barang.width = controls['width'].value;
		_barang.height = controls['height'].value;
		_barang.depth = controls['depth'].value;
		_barang.nic = controls['nic'].value;
		_barang.slug = controls['slug'].value;
		if ( this.barangForm.controls['weight'].value === '0') {
			_barang.weight = this.sum;
		} else {
			_barang.weight = controls['weight'].value;
		}
		// _barang.setup = controls['setup'].value;
		// _barang.image = this.fileToUpload;
		// console.log(_barang);
		return _barang;
	}

	makeFormData(_barang) {
		// console.log(_barang);
		// console.log(this.files);
		const formData: FormData = new FormData();
		formData.append('id', _barang.id);
		formData.append('barcode', _barang.barcode);
		formData.append('name', _barang.name);
		formData.append('id_category', _barang.id_category);
		formData.append('id_brand', _barang.id_brand);
		formData.append('summary', _barang.summary);
		formData.append('description', _barang.description);
		formData.append('stock', _barang.stock);
		formData.append('price', _barang.price);
		formData.append('color', _barang.color);
		formData.append('video', _barang.video);
		formData.append('status', _barang.status);
		formData.append('kondisi', _barang.kondisi);
		formData.append('home', _barang.home);
		formData.append('slug', _barang.slug);
		formData.append('nic', _barang.nic);
		if (this.file === null && this.files === null || !this.file && !this.files || this.file.length === 0 && this.files.length === 0) {
			formData.append('image', '');
		// tslint:disable-next-line: max-line-length
		} else if (this.file.length === 0 && this.files.length > 0 || !this.file && this.files.length > 0 || this.file === null && this.files.length > 0) {
			// console.log(this.files[0], this.files[0].name);
			formData.append('image', this.files[0], this.files[0].name);
		} else {
			// console.log(this.file[0], this.file[0].name);
			formData.append('image', this.file[0], this.file[0].name);
		}
		formData.append('width', _barang.width);
		formData.append('height', _barang.height);
		formData.append('depth', _barang.depth);
		formData.append('weight', _barang.weight);
		formData.append('setup', this.products[0].setup.toString());
		let files = this.files || [];
		files.forEach(function(file) {

			return formData.append('mImage', file, file.name);

		});
		return formData;

	}

	prepareBarang1(): BarangModel {
		const controls = this.barangForm.controls;
		const _barang = new BarangModel();
		_barang.id = this.lastID.id + 1;
		// console.log(_barang.id);
		_barang.barcode = controls['barcode'].value;
		_barang.name = controls['name'].value;
		_barang.id_category = +controls['id_category'].value;
		_barang.id_brand = +this.brandHasil[0].id;
		_barang.summary = controls['summary'].value;
		_barang.description = controls['description'].value;
		_barang.stock = controls['stock'].value;
		_barang.price = controls['price'].value;
		_barang.color = controls['color'].value;
		_barang.video = controls['youtube'].value;
		_barang.status = +controls['status'].value;
		_barang.kondisi = controls['kondisi'].value;
		_barang.home = +controls['home'].value;
		_barang.width = controls['width'].value;
		_barang.height = controls['height'].value;
		_barang.depth = controls['depth'].value;
		_barang.nic = controls['nic'].value;
		_barang.slug = controls['slug'].value;
		if ( this.barangForm.controls['weight'].value === '0') {
			_barang.weight = this.sum;
		} else {
			_barang.weight = controls['weight'].value;
		}
		// _barang.setup = controls['setup'].value;
		// _barang.image = this.fileToUpload;
		// console.log(_barang);
		return _barang;
	}

	makeFormData1(_barang) {
		const formData: FormData = new FormData();
		formData.append('id', _barang.id);
		formData.append('barcode', _barang.barcode);
		formData.append('name', _barang.name);
		formData.append('id_category', _barang.id_category);
		formData.append('id_brand', _barang.id_brand);
		formData.append('summary', _barang.summary);
		formData.append('description', _barang.description);
		formData.append('stock', _barang.stock);
		formData.append('price', _barang.price);
		formData.append('color', _barang.color);
		formData.append('video', _barang.video);
		formData.append('status', _barang.status);
		formData.append('kondisi', _barang.kondisi);
		formData.append('home', _barang.home);
		formData.append('slug', _barang.slug);
		formData.append('nic', _barang.nic);
		if (this.file.length === 0 && this.files === null) {
			formData.append('image', '');
		} else if (this.file.length === 0 && this.files.length > 0) {
			// console.log(this.files[0], this.files[0].name);
			formData.append('image', this.files[0], this.files[0].name);
		} else {
			// console.log(this.file[0], this.file[0].name);
			formData.append('image', this.file[0], this.file[0].name);
		}
		formData.append('width', _barang.width);
		formData.append('height', _barang.height);
		formData.append('depth', _barang.depth);
		formData.append('weight', _barang.weight);
		formData.append('setup', this.products[0].setup.toString());
		let files = this.files || [];
		files.forEach(function(File) {

				return formData.append('mImage', File, File.name);

		});
		return formData;
	}

	/**
	 * Add barang
	 *
	 * @param _barang: BarangModel
	 * @param withBack: boolean
	 */
	addBarang(formData, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.cdr.markForCheck();
		this.store.dispatch(new BarangOnServerCreated({ barang: formData }));
		this.router.navigate(['vp-admin/catalog/product']);
		// console.log(formData);
		// console.log(formData);
		const message = `New barang successfully has been added.`;
		this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		this.reset();
	}

	addBarang1(formData, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.cdr.markForCheck();
		this.store.dispatch(new BarangOnServerCreated({ barang: formData}));
		// console.log(formData);
		const message = `New barang successfully has been added.`;
		this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		this.reset();
		this.file = [];
		this.files = [];
		this.cover = null;
		// this.router.navigate(['catalog/product']);
	}

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create product';
		if (!this.barang || !this.barang.id) {
			return result;
		}

		result = `Edit product - ${this.barang.name} ${this.barang.id_category}, ${this.barang.description}`;
		return result;
	}

	/**
	 * Cover Image
	 */
	setCover(item: File) {
		// console.log(item);
		if (!this.cover) {
			const data = {
				id: this.lastID.id + 1,
				image: item
			};
			const formData: FormData = new FormData();
			formData.append('image', item, item.name);
			this.barangService.setCover(formData, data.id).subscribe(
				res => {
					this.file[0] = item;
					// console.log(res);
					if (res.message === 'success') {
					this.barangService.coverParams(data.id).subscribe(
						result => {
							this.cover = result;
							// console.log(result);
						}
					);
					}
				}
			);
		} else {
			const data = {
				id: this.lastID.id + 1,
				image: item
			};
			const formData: FormData = new FormData();
			formData.append('image', item, item.name);
			this.barangService.setUPCover(formData, data.id).subscribe(
				res => {
					// console.log(res);
					this.file[0] = item;
					if (res.message === 'success') {
					this.barangService.coverParams(data.id).subscribe(
						result => {
							this.cover = result;
							// console.log(result);
						}
					);
					}
				}
			);
		}
	}

	/**
	 * Delete cover
	 */
	deleteCover() {
		// console.log('test');
		if (this.cover || this.cover !== '') {
			this.barangService.delCover(this.cover.id_product).subscribe();
		}
	}

	/**
	 * Delete Image
	 */
	deleteImage(item: File) {
		const index = this.files.indexOf(item);
		this.files.splice(index, 1);
	}

	/**
	 * Close alert
	 *
	 * @param $event
	 */
	onAlertClose($event) {
		this.hasFormErrors = false;
		this.hasBrandErrors = false;
		this.hasErrors = false;
		this.hasSlugErrors = false;
	}
	/**
	 * Open Dialog
	 */
	openDialog() {
// tslint:disable-next-line: no-use-before-declare
		const dialogRef = this.dialog.open(DialogCategoryAdd, {
			height: '500px',
			data: { name: this.name, animal: this.animal }
		});

		dialogRef.afterClosed().subscribe(result => {
			console.log('The Dialog Was Close');
			this.animal = result;
		});
	}
}


@Component({
	selector: 'kt-dialog-category-add',
	templateUrl: 'category-add.component.html',
})
// tslint:disable-next-line: component-class-suffix
export class DialogCategoryAdd {
	// Public properties
	category: CategoryModel;
	categoryId$: Observable<number>;
	oldCategory: CategoryModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	categoryForm: FormGroup;
	hasFormErrors: boolean = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	fileToUpload: File = null;
	imageUrl: string = '';
	// Private password
	private componentSubscriptions: Subscription;
	// sticky portlet header margin
	private headerMargin: number;

	/**
	 * Component constructor
	 *
	 * @param store: Store<AppState>
	 * @param activatedRoute: ActivatedRoute
	 * @param router: Router
	 * @param typesUtilsService: TypesUtilsService
	 * @param categoryFB: FormBuilder
	 * @param dialog: MatDialog
	 * @param subheaderService: SubheaderService
	 * @param layoutUtilsService: SubheaderService
	 * @param layoutConfigService: LayoutConfigService
	 */
	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		private categoryFB: FormBuilder,
		public dialogRef: MatDialogRef<DialogCategoryAdd>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private categoryService: CategoryService) {
		}

		/**
		 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 	*/

	/**
	 * On init
	 */
	parent: any = [];

	onNoClick(): void {
		this.dialogRef.close();
	}

// tslint:disable-next-line: use-life-cycle-interface
	ngOnInit() {

		this.categoryService.getParentCategories().subscribe(
			res => {this.parent = res; },
			err => console.error(err)
		);
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {
				this.store.pipe(
					select(selectCategoryById(id)),
					first(res => {
						return res !== undefined;
					})
				).subscribe(result => {
					this.category = result;
					this.categoryId$ = of(result.id);
					this.oldCategory = Object.assign({}, result);
					this.initCategory();
				});
			} else {
					const newCategory = new CategoryModel();
					newCategory.clear();
					this.categoryId$ = of(newCategory.id);
					this.category = newCategory;
					this.oldCategory = Object.assign({}, newCategory);
					this.initCategory();
				}
			});

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	/**
	 * On destroy
	 */
// tslint:disable-next-line: use-life-cycle-interface
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	handleFileInput(file: FileList) {
		this.fileToUpload = file.item(0);

		// Show image preview
		let reader = new FileReader();
		reader.onload = (event: any) => {
			this.imageUrl = event.target.result;
		};
		reader.readAsDataURL(this.fileToUpload);
	}

	/**
	 * Init category
	 */
	initCategory() {
		this.createForm();
		const prefix = this.layoutConfigService.getCurrentMainRoute();
		this.loadingSubject.next(false);
		if (!this.category.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'Catalog', page: `../${prefix}/catalog` },
				{ title: 'Categories',  page: `../${prefix}/catalog/categories` },
				{ title: 'Create category', page: `../${prefix}/catalog/categories/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Edit category');
		this.subheaderService.setBreadcrumbs([
			{ title: 'Catalog', page: `../${prefix}/catalog` },
			{ title: 'Categories',  page: `../${prefix}/catalog/categories` },
			{ title: 'Edit category', page: `../${prefix}/catalog/categories/edit`, queryParams: { id: this.category.id } }
		]);
	}

	/**
	 * Create form
	 */
	createForm() {
		this.categoryForm = this.categoryFB.group({
			name: [this.category.name, Validators.required],
			id_parent: [this.category.id_parent.toString(), Validators.required],
			description: [this.category.description]
		});
	}
	/**
	 * Go back to the list
	 *
	 * @param id: any
	 */
	goBack(id) {
		this.loadingSubject.next(false);
		const url = `${this.layoutConfigService.getCurrentMainRoute()}/catalog/categories?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Refresh category
	 *
	 * @param isNew: boolean
	 * @param id: number
	 */
	refreshCategory(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `${this.layoutConfigService.getCurrentMainRoute()}/catalog/categories/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Reset
	 */
	reset() {
		this.category = Object.assign({}, this.oldCategory);
		this.createForm();
		this.hasFormErrors = false;
		this.categoryForm.markAsPristine();
		this.categoryForm.markAsUntouched();
 		this.categoryForm.updateValueAndValidity();
	}

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.categoryForm.controls;
		/** check form */
		if (this.categoryForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedCategory = this.prepareCategory();
		let dataForm = this.makeFormData(editedCategory);

		this.addCategory(dataForm, withBack);

	}

	/**
	 * Returns object for saving
	 */
	prepareCategory(): CategoryModel {
		const controls = this.categoryForm.controls;
		const _category = new CategoryModel();
		_category.id = this.category.id;
		_category.name = controls['name'].value;
		_category.id_parent = +controls['id_parent'].value;
		_category.description = controls['description'].value;
		return _category;
	}

	makeFormData(_category) {
		const formData: FormData = new FormData();
		formData.append('name', _category.name);
		formData.append('id_parent', _category.id_parent);
		formData.append('description', _category.description);
		formData.append('image', '');
		return formData;
	}

	/**
	 * Add category
	 *
	 * @param _category: CategoryModel
	 * @param withBack: boolean
	 */
	addCategory(formData, withBack: boolean = false) {
		this.store.dispatch(new CategoryOnServerCreated({ category: formData }));
		const message = `New category successfully has been added.`;
		this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		this.reset();
		this.close();
	}

	close() {
		this.dialogRef.close();
	}

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create category';
		return result;
	}

	/**
	 * Close alert
	 *
	 * @param $event
	 */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
