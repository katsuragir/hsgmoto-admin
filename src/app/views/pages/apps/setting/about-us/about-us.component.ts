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
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, TypesUtilsService, MessageType, HttpUtilsService } from '../../../../../core/_base/crud';
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
} from '../../../../../core/catalog';
import { HttpEvent } from '@angular/common/http';
import { find } from 'lodash';
import { DecimalPipe } from '@angular/common';
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
	selector: 'kt-about-us',
	templateUrl: './about-us.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DecimalPipe]
})
export class AboutUSComponent implements OnInit, OnDestroy {
	// Public properties
	barang: BarangModel;
	barangId$: Observable<number>;
	oldBarang: BarangModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	barangForm: FormGroup;
	hasFormErrors: boolean = false;
	hasErrors: boolean = false;
	hasSlugErrors: boolean = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	imageUrl: string = '/images/product/default-image.png';
	fileToUpload: File = null;
	lastFileAt: Date;
	files: File[] = [];
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
		 enableToolbar: false,
		 showToolbar: false,
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
		private _decimalPipe: DecimalPipe) {
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
			});

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	getAllCategories() {
		this.categoryService.AllCategories().subscribe(
			res => { this.category = res; },
			err => console.error(err)
		);

	}

	/**
	 * On destroy
	 */
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
			id_brand: [this.barang.id_brand.toString()],
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
		this.filteredColors = this.barangForm.controls.color.valueChanges
			.pipe(
				startWith(''),
				map(val => this.filterColor(val.toString()))
		);

	}

	/**
	 * Filter manufacture
	 *
	 * @param val: string
	 */
	/*
	filterManufacture(val: string): string[] {
		return AVAILABLE_MANUFACTURES.filter(option =>
			option.toLowerCase().includes(val.toLowerCase()));
	}

	/**
	 * Filter color
	 *
	 * @param val: string
	 */

	filterColor(val: string): string[] {
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
		this.hasErrors = false;
		const controls = this.barangForm.controls;
		const slash = '/';
		const titik = ':';
		const barcode = controls['barcode'].value.toLowerCase();
		const filterName = controls['name'].value.toLowerCase()
		.replace(/\s+/g, '-')
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

		this.addBarang(dataForm1, withBack);
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
		_barang.id_brand = +controls['id_brand'].value;
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
		if (this.files === null) {
			formData.append('image', '');
		}
		if (this.files.length < 0) {
			formData.append('image', this.files[0], _barang.id.toString() + '.jpg');
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
		_barang.id_brand = +controls['id_brand'].value;
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
		if (this.files === null) {
			formData.append('image', '');
		}
		if (this.files.length < 0) {
			formData.append('image', this.files[0], _barang.id.toString() + '.jpg');
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
		// console.log(this.sendableFormData);
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
		// this.router.navigate(['catalog/product']);
	}

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create barang';
		if (!this.barang || !this.barang.id) {
			return result;
		}

		result = `Edit barang - ${this.barang.name} ${this.barang.id_category}, ${this.barang.description}`;
		return result;
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
		this.hasErrors = false;
		this.hasSlugErrors = false;
	}

}
