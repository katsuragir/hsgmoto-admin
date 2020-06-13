// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject, KeyValueDiffer, KeyValueDiffers } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location, DecimalPipe, DOCUMENT } from '@angular/common';
// Material
import { MatDialog } from '@angular/material';
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
	barangsReducer,
	OneImageDeleted
} from '../../../../../../core/catalog';
import { HttpEvent } from '@angular/common/http';
import { find } from 'lodash';
import { AngularEditorConfig } from '@kolkov/angular-editor';

import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

import * as $ from 'jquery';

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
	selector: 'kt-product-edit',
	templateUrl: './product-edit.component.html',
	providers: [DecimalPipe]
})
export class ProductEditComponent implements OnInit, OnDestroy {
	// Public properties
	barang: BarangModel;
	barangSubject$: BehaviorSubject<BarangModel> = new BehaviorSubject(this.barang);
	barang$: Observable<BarangModel> = this.barangSubject$.asObservable();
	barangId$: Observable<number>;
	oldBarang: BarangModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	barangForm: FormGroup;
	hasFormErrors: boolean = false;
	hasBrandErrors: boolean = false;
	hasNameErrors: boolean = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	imageUrl: any = '/assets/img/default-image.png';
	fileToUpload: File = null;
	public isEditMode: boolean = true;
	lastFileAt: Date;
	files = [];
	gambars$: BehaviorSubject<any[]> = new BehaviorSubject(this.files);
	view: Observable<any[]> = this.gambars$.asObservable();
	file: File[] = [];
	variant: any[] = [];
	interval: any;
	cover: any;
	brand: any = [];
	public brandFil: any = [];
	brandAll: Observable<any>;
	brand$: Observable<any[]>;
	brandHasil: any;
	brandName = '';
	progress: number;
	hasBaseDropZoneOver: boolean = false;
	httpEmitter: Subscription;
	httpEvent: HttpEvent<{}>;
	sendableFormData: FormData;
	// Private password
	private componentSubscriptions: Subscription;
	// sticky portlet header margin
	private headerMargin: number;
	products: BarangModel[] = [];
	imageOver: boolean = false;
	editorConfig: AngularEditorConfig = {
		editable: true,
		spellcheck: true,
		 height: '200px',
		 minHeight: '0',
		 maxHeight: '200px',
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

	hover: boolean;
	private elementDiffer: KeyValueDiffer<string, any>;

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
		private location: Location,
		private _decimalPipe: DecimalPipe,
		private domainLocal: HttpUtilsService,
		private cdk: ChangeDetectorRef,
		private differs: KeyValueDiffers,
		@Inject(DOCUMENT) private document: Document) {
			this.localURl = this.domainLocal.domain;
			this.elementDiffer = differs.find([]).create();
			this.category$ = this.categoryService.AllCategories();
			/*
			this.categoryService.AllCategories().subscribe(
				res => {this.category = res; },
				err => console.error(err)
			);
			*/
			// this.brandAll = this.brandService.AllBrands();

			this.brandService.getAllBrands().subscribe(
				res => {this.brand = res; },
				err => console.error(err)
			);

		}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */

	category$: Observable<any[]>;

	sum: any = [];

	images: any = [];

	calculate(width: number, height: number, depth: number) {
		this.sum = ((+width / 10) * (+height / 10) * (+depth / 10) / 6000) * 1000;
		this.barangForm.controls['weight'].setValue(this._decimalPipe.transform(this.sum, '1.0-0'));
	}

	ngOnInit() {
		this.cdk.markForCheck();
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id) {
				this.barangService.items$.subscribe(
					result => {
						if (result) {
							let barang = result.filter(x => x.id.toString() === id.toString());
							this.barang = barang[0];
							this.barangSubject$.next(this.barang);
							this.barangId$ = of(barang[0].id);
							this.imageUrl = barang[0].image;
							this.barangService.getAllImages(this.barang).subscribe(
								res => {
									this.files = [];
									res.forEach((item) => {
										if (this.files.length > 5) {
											return;
										} else {
											this.files.push(item);
										}
									});

									this.gambars$.next(this.files);

									if (this.images > 0) {
										this.show();
									}
									if (this.images < 0 ) {
										this.hide();
									}

									this.changeImageBox(this.files.length);

									// console.log(this.images);
								},
								err => console.error(err)
							);
							this.initBarang();

							// tslint:disable-next-line: no-unused-expression
							this.barangForm.controls['barcode'].disable();
							this.barangForm.controls['model'].disable();
						}
					}
				);
				// console.log(this.barang.id);
			}
		});
		this.hover = false;
		// console.log(this.brandHasil);
		this.barangService.getAllBarangs().subscribe(
			result => {
				this.products = result;
			}
		);

		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};

	}

	changeImageBox(length: number, emit: boolean = false) {
		if (!emit) {
			const floorElements = Array.from(document.getElementsByClassName('product-image') as HTMLCollectionOf<HTMLElement>);;
			if (floorElements.length > 0) {
				// tslint:disable-next-line: prefer-for-of
				for (let i = 0; i < length; i++) {
					floorElements[i].outerHTML = '<div class="dom-prod"></div>';
				}

				const floorElements2 = Array.from(document.getElementsByClassName('product-image') as HTMLCollectionOf<HTMLElement>);

				if (floorElements2.length > 1 && floorElements2.length > length) {
					// tslint:disable-next-line: max-line-length
					const first = floorElements[length].getElementsByClassName('product-image__placeholder') as HTMLCollectionOf<HTMLElement>;
					first[0].classList.add('main');
				} else {
					const first = floorElements[0].getElementsByClassName('product-image__placeholder') as HTMLCollectionOf<HTMLElement>;
					first[0].classList.add('main');
				}
			}
		} else {
			const domElements = Array.from(document.getElementsByClassName('dom-prod') as HTMLCollectionOf<HTMLElement>);

			if (domElements.length > 1 && domElements.length === 5) {
				domElements[length].outerHTML =
				`<div class="product-image" >
					<div class="product-image__square product-image__placeholder">
						<div class="product-image__icon-container main">
							<span class="product-image__icon"></span>
							<span class="product-image__icon-text">Variant</span>
						</div>
					</div>
				</div>`;
				const floorElements = Array.from(document.getElementsByClassName('product-image') as HTMLCollectionOf<HTMLElement>);
				const addmain = floorElements[0].getElementsByClassName('product-image__placeholder') as HTMLCollectionOf<HTMLElement>;
				addmain[0].classList.add('main');
			} if (domElements.length > 1) {
				domElements[length].outerHTML =
				`<div class="product-image" >
					<div class="product-image__square product-image__placeholder">
						<div class="product-image__icon-container main">
							<span class="product-image__icon"></span>
							<span class="product-image__icon-text">Variant</span>
						</div>
					</div>
				</div>`;
				const floorElements = Array.from(document.getElementsByClassName('product-image') as HTMLCollectionOf<HTMLElement>);
				// tslint:disable-next-line: max-line-length
				const removemain = floorElements[1].getElementsByClassName('product-image__placeholder') as HTMLCollectionOf<HTMLElement>;
				removemain[0].classList.remove('main');
				const addmain = floorElements[0].getElementsByClassName('product-image__placeholder') as HTMLCollectionOf<HTMLElement>;
				addmain[0].classList.add('main');
			} else {
				const floorElements = Array.from(document.getElementsByClassName('product-image') as HTMLCollectionOf<HTMLElement>);
				const removemain = floorElements[length].getElementsByClassName('product-image__placeholder') as HTMLCollectionOf<HTMLElement>;
				removemain[0].classList.remove('main');
				domElements[0].outerHTML =
				`<div class="product-image" >
					<div class="product-image__square product-image__placeholder main">
						<div class="product-image__icon-container main">
							<span class="product-image__icon"></span>
							<span class="product-image__icon-text">Cover</span>
						</div>
					</div>
				</div>`;

			}
		}
	}

	drop(event: CdkDragDrop<string[]>) {
		moveItemInArray(this.files, event.previousIndex, event.currentIndex);
	}

	over() {
		this.hover = true;
	}

	out() {
		this.hover = false;
	}

	/**
	 * on file drop handler
	 */
	onFileDropped($event) {
		if (this.files.length > 5 || ($event.length + this.files.length) > 5 ) {
			this.imageOver = true;
			return;
		} else {
			this.prepareFilesList($event);
		}
	}

	/**
	 * handle file from browsing
	 */
	fileBrowseHandler(files) {
		if (this.files.length >= 5) {
			this.imageOver = true;
			return;
		} else {
			this.prepareFilesList(files);
		}
	}

	/**
	 * Convert Files list to normal array list
	 * @param files (Files List)
	 */
	prepareFilesList(files) {
		for (const item of files) {

			let reader = new FileReader();

			reader.onload = (event: any) => {
				const data = {
					images: event.target.result
				};

				this.files.push(data);
				this.ngDoCheck();
				this.changeImageBox(1);
			};

			reader.readAsDataURL(item);

		}

		this.cdk.markForCheck();

		// this.uploadFilesSimulator(0);
	}

	ngDoCheck() {
		const changes = this.elementDiffer.diff(this.files);
		if (changes) {
			this.gambars$.next(this.files);
		}
	}

	/**
	 * Delete Image
	 */
	deleteImage(item) {
		const index = this.files.indexOf(item);
		this.files.splice(index, 1);
		this.ngDoCheck();
		this.changeImageBox(this.files.length, true);
	}

	variantImage(id) {
		this.barangService.coverParams(id).subscribe(
			result => {
				this.cover = result;
				// console.log(this.cover);
			}
		);
		// this.variant$ = this.barangService.getAllImagesByID(id);
		// this.interval = setInterval(() => {
			// this.variant$ = this.barangService.getAllImagesByID(id);
		// }, 2000);
		// console.log(this.variant$);

		this.barangService.getAllImagesByID(id).subscribe(
			result => {
				this.variant = result;
				// console.log(this.variant);
			}
		);

	}

	show() {
		this.isEditMode = true;
	}

	hide() {
		this.isEditMode = false;
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
		this.hover = false;
		localStorage.removeItem('edit');
	}

	handleFileInput(files: FileList) {
		this.fileToUpload = files.item(0);

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
				{ title: 'Product',  page: `../${prefix}/catalog/product` },
				{ title: 'Create product', page: `../${prefix}/catalog/product/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Edit product');
		this.subheaderService.setBreadcrumbs([
			{ title: 'Catalog', page: `../${prefix}/catalog` },
			{ title: 'Product',  page: `../${prefix}/catalog/product` },
			{ title: 'Edit product', page: `../${prefix}/catalog/product/edit`, queryParams: { id: this.barang.id } }
		]);
	}

	/**
	 * Create form
	 */
	createForm() {
		this.barangForm = this.barangFB.group({
			image: [this.barang.image],
			barcode: [this.barang.barcode],
			model: [this.barang.model],
			name: [this.barang.name, Validators.required],
			id_category: [this.barang.id_category.toString(), Validators.required],
			id_brand: [this.barang.id_brand.toString(), Validators.required],
			description: [this.barang.description],
			stock: [this.barang.stock, [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
			price: [this.barang.price, [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
			color: [this.barang.color],
			youtube: [this.barang.video],
			size: [this.barang.size],
			status: [this.barang.status.toString(), [Validators.required, Validators.min(0), Validators.max(1)]],
			kondisi: [this.barang.kondisi.toString(), [Validators.required]],
			weight: [this.barang.weight, Validators.required],
			tags: [this.barang.tags]
		});

		this.brand$ = this.barangForm.controls.id_brand.valueChanges
			.pipe(
				startWith(''),
				map(val => this.filterBrand(val))
			);

		this.filteredColors = this.barangForm.controls.color.valueChanges
			.pipe(
				startWith(''),
				map(val => this.filterColor(val.toString()))
		);

	}

	/**
	 * Filter Brand
	 *
	 * @param val: string
	 */

	filterBrand(val: string): string[] {
		const filterValue = val.toLowerCase();
		const filBrand = this.brand.filter(option => option.name.toLowerCase().includes(filterValue));
		if (filBrand.length > 0) {
			this.brandHasil = filBrand;
		} else {
			this.brandName = val.toUpperCase();
		}
		return this.brand.filter(option => option.name.toLowerCase().includes(filterValue));
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

		url = `${this.layoutConfigService.getCurrentMainRoute()}/catalog/product/edit/${id}`;
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
		this.hasNameErrors = false;
		this.imageOver = false;
		this.barangForm.markAsPristine();
		this.barangForm.markAsUntouched();
		this.barangForm.updateValueAndValidity();
	}

	backPage() {
		this.location.back();
	}

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.hasBrandErrors = false;
		this.hasNameErrors = false;
		const controls = this.barangForm.controls;

		/** check form */
		if (this.barangForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		if (this.files.length === 0) {
			this.imageOver = true;
			return;
		}

		// tslint:disable-next-line: max-line-length
		if (controls['id_brand'].value === null || controls['id_brand'].value === 'null') {
			this.hasBrandErrors = true;
			return;
		}

		if (this.brandName !== '') {
			this.insertNewbrandA();

			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedBarang = this.prepareBarang();
		let dataForm = this.makeFormData(editedBarang);
		this.updateBarang(dataForm);
		return;

	}

	onSave(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.hasBrandErrors = false;
		this.hasNameErrors = false;
		const controls = this.barangForm.controls;

		/** check form */
		if (this.barangForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		if (this.files.length === 0) {
			this.imageOver = true;
			return;
		}

		// tslint:disable-next-line: max-line-length
		if (controls['id_brand'].value === null || controls['id_brand'].value === 'null') {
			this.hasBrandErrors = true;
			return;
		}

		if (this.brandName !== '') {
			this.insertNewbrandA();

			return;
		}

		let editedBarang1 = this.prepareBarang1();
		let dataForm1 = this.makeFormData1(editedBarang1);
		this.updateBarang1(dataForm1);
		return;


	}

	/**
	 * Insert New Brand
	 */
	insertNewbrandA() {

		const newBrand = {
			image: 'no_brand.png',
			name: this.brandName,
			description: ''
		};
		this.brandService.BrandAuto(newBrand).subscribe(
			res => {
				this.brandHasil = res;
				let editedBarang = this.prepareBarang();
				let dataForm = this.makeFormData(editedBarang);
				this.updateBarang(dataForm);
				return;
			}
		);
	}

	insertNewbrandB() {

		const newBrand = {
			image: 'no_brand.png',
			name: this.brandName,
			description: ''
		};
		this.brandService.BrandAuto(newBrand).subscribe(
			res => {
				this.brandHasil = res;
				let editedBarang1 = this.prepareBarang1();
				let dataForm1 = this.makeFormData1(editedBarang1);
				this.updateBarang1(dataForm1);
				return;
			}
		);
	}

	/**
	 * Returns object for saving
	 */
	prepareBarang(): BarangModel {
		const controls = this.barangForm.controls;
		const _barang = new BarangModel();
		const kondisi: string = controls['kondisi'].value;
		_barang.id = this.barang.id;
		_barang.barcode = controls['barcode'].value;
		_barang.model = controls['model'].value;
		_barang.name = controls['name'].value;
		_barang.id_category = +controls['id_category'].value;
		// tslint:disable-next-line: max-line-length
		if (controls['id_brand'].value) {
			_barang.id_brand = controls['id_brand'].value;
		} else if (this.brandHasil) {
			_barang.id_brand = this.barang.id_brand;
		} else {
			_barang.id_brand = +this.brandHasil[0].id;
		}
		_barang.description = controls['description'].value;
		_barang.stock = controls['stock'].value;
		_barang.price = controls['price'].value;
		_barang.color = controls['color'].value;
		_barang.video = controls['youtube'].value;
		_barang.status = +controls['status'].value;
		_barang.size = controls['size'].value;
		if (kondisi === 'Regular') {
			_barang.kondisi = '1';
		} else if (kondisi === 'BestSeller') {
			_barang.kondisi = '2';
		} else {
			_barang.kondisi = '3';
		}
		_barang.weight = controls['weight'].value;
		_barang.tags = controls['tags'].value;
		return _barang;
	}

	makeFormData(_barang) {
		const changes = this.elementDiffer.diff(this.files);
		let images = [];
		if (changes) {
			images = this.files;
		} else {
			images = [];
		}

		const barang = {
			id: _barang.id,
			barcode: _barang.barcode,
			model: _barang.model,
			name: _barang.name,
			id_category: _barang.id_category,
			id_brand: _barang.id_brand,
			description: _barang.description,
			stock: _barang.stock,
			price: _barang.price,
			color: _barang.color,
			size: _barang.size,
			status: _barang.status,
			kondisi: _barang.kondisi,
			video: _barang.video,
			weight: _barang.weight,
			tags: _barang.tags,
			cover: this.files[0],
			mImage: [],
			slug: this.barang.slug_url
		};

		let files = this.files || [];

		files.forEach(function(file) {
			return barang.mImage.push(file);
		});

		return barang;
	}

	prepareBarang1(): BarangModel {
		const controls = this.barangForm.controls;
		const _barang = new BarangModel();
		const kondisi: string = controls['kondisi'].value;
		_barang.id = this.barang.id;
		_barang.barcode = controls['barcode'].value;
		_barang.model = controls['model'].value;
		_barang.name = controls['name'].value;
		_barang.id_category = +controls['id_category'].value;
		// tslint:disable-next-line: max-line-length
		if (controls['id_brand'].value) {
			_barang.id_brand = controls['id_brand'].value;
		} else if (this.brandHasil) {
			_barang.id_brand = this.barang.id_brand;
		} else {
			_barang.id_brand = +this.brandHasil[0].id;
		}
		_barang.description = controls['description'].value;
		_barang.stock = controls['stock'].value;
		_barang.price = controls['price'].value;
		_barang.color = controls['color'].value;
		_barang.video = controls['youtube'].value;
		_barang.status = +controls['status'].value;
		_barang.size = controls['size'].value;
		if (kondisi === 'Regular') {
			_barang.kondisi = '1';
		} else if (kondisi === 'BestSeller') {
			_barang.kondisi = '2';
		} else {
			_barang.kondisi = '3';
		}
		_barang.weight = controls['weight'].value;
		_barang.tags = controls['tags'].value;
		return _barang;
	}

	makeFormData1(_barang) {
		const changes = this.elementDiffer.diff(this.files);
		let images = [];
		if (changes) {
			images = this.files;
		} else {
			images = [];
		}

		const barang = {
			id: _barang.id,
			barcode: _barang.barcode,
			model: _barang.model,
			name: _barang.name,
			id_category: _barang.id_category,
			id_brand: _barang.id_brand,
			description: _barang.description,
			stock: _barang.stock,
			price: _barang.price,
			color: _barang.color,
			size: _barang.size,
			status: _barang.status,
			kondisi: _barang.kondisi,
			video: _barang.video,
			weight: _barang.weight,
			tags: _barang.tags,
			cover: this.files[0],
			mImage: [],
			slug: this.barang.slug_url
		};

		let files = this.files || [];

		files.forEach(function(file) {
			return barang.mImage.push(file);
		});

		return barang;
	}

	/**
	 * Update barang
	 *
	 * @param _barang: BarangModel
	 * @param withBack: boolean
	 */
	updateBarang(barang) {
		this.loadingSubject.next(true);

		const updateBarang: Update<BarangModel> = {
			id: barang.id,
			changes: barang
		};
		// console.log(_barang);

		this.store.dispatch(new BarangUpdated({
			partialBarang: updateBarang,
			barang: barang
		}));

			const message = `Barang successfully has been saved.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			 this.refreshBarang(false);
			 this.router.navigate(['/vp-admin/catalog/product/']);
	}

	updateBarang1(_barang) {
		this.loadingSubject.next(true);

		const updateBarang: Update<BarangModel> = {
			id: _barang.id,
			changes: _barang
		};
		// console.log(_barang);

		this.store.dispatch(new BarangUpdated({
			partialBarang: updateBarang,
			barang: _barang
		}));

		const message = `Barang successfully has been saved.`;
		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
		this.refreshBarang(false);
		location.reload();
	}

	/** ACTIONS */
	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Edit product';
		if (!this.barang || !this.barang.id) {
			return result;
		}

		result = `Edit product - ${this.barang.name}`;
		return result;
	}

	/**
	 * Close alert
	 *
	 * @param $event
	 */
	onAlertClose($event) {
		this.hasFormErrors = false;
		this.hasBrandErrors = false;
		this.imageOver = false;
		this.hasNameErrors = false;
	}
}
