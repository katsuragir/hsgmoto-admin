// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
	selectLastCreatedCategoryId,
	selectCategoryById,
	CategoryModel,
	CategoryOnServerCreated,
	CategoryUpdated,
	CategoryService
} from '../../../../../../core/catalog';
import { find } from 'lodash';
/*
const AVAILABLE_COLORS: string[] =
	['Red', 'CadetBlue', 'Gold', 'LightSlateGrey', 'RoyalBlue', 'Crimson', 'Blue', 'Sienna', 'Indigo', 'Green', 'Violet',
	'GoldenRod', 'OrangeRed', 'Khaki', 'Teal', 'Purple', 'Orange', 'Pink', 'Black', 'DarkTurquoise'];

const AVAILABLE_MANUFACTURES: string[] =
	['Pontiac', 'Subaru', 'Mitsubishi', 'Oldsmobile', 'Chevrolet', 'Chrysler', 'Suzuki', 'GMC', 'Cadillac', 'Mercury', 'Dodge',
	'Ram', 'Lexus', 'Lamborghini', 'Honda', 'Nissan', 'Ford', 'Hyundai', 'Saab', 'Toyota'];
*/
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-category-add',
	templateUrl: './category-add.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryAddComponent implements OnInit, OnDestroy {
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
	imageUrl: string = '/images/categories/no_banner.jpg';
	hasSlugErrors: boolean = false;
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
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private categoryService: CategoryService,
		private domainURL: HttpUtilsService) {
			this.imageUrl = this.domainURL.domain + this.imageUrl;
		}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
		parent: any = [];

	ngOnInit() {

		this.categoryService.getParentCategories().subscribe(
			res => {this.parent = res; },
			err => console.error(err)
		);
		/*
		for (let i = 2019; i > 1945; i--) {
			this.availableYears.push(i);
		}
		*/
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

		/*
		this.filteredManufactures = this.productForm.controls.manufacture.valueChanges
			.pipe(
				startWith(''),
				map(val => this.filterManufacture(val.toString()))
			);
		this.filteredColors = this.productForm.controls.color.valueChanges
			.pipe(
				startWith(''),
				map(val => this.filterColor(val.toString()))
		);
		*/
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
	/*
	filterColor(val: string): string[] {
		return AVAILABLE_COLORS.filter(option =>
			option.toLowerCase().includes(val.toLowerCase()));
	}
	*/
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

		const category = find(this.parent, function(item: CategoryModel) {
			return (item.name.toLowerCase() === controls['name'].value.toLowerCase());
		});

		if (category) {
			// console.log('hellow');
			return this.hasSlugErrors = true;
		}

		// tslint:disable-next-line:prefer-const
		let editedCategory = this.prepareCategory();
		let dataForm = this.makeFormData(editedCategory);

		this.addCategory(dataForm, withBack);

	}

	onSave(withBack: boolean = false) {
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

		const category = find(this.parent, function(item: CategoryModel) {
			return (item.name.toLowerCase() === controls['name'].value.toLowerCase());
		});

		if (category) {
			// console.log('hellow');
			return this.hasSlugErrors = true;
		}

		// tslint:disable-next-line:prefer-const
		let editedCategory1 = this.prepareCategory1();
		let dataForm1 = this.makeFormData(editedCategory1);

		this.addCategory1(dataForm1, withBack);

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
		_category.slug = controls['name'].value.toLowerCase();
		return _category;
	}

	makeFormData(_category) {
		const formData: FormData = new FormData();
		formData.append('name', _category.name);
		formData.append('id_parent', _category.id_parent);
		formData.append('description', _category.description);
		if (this.fileToUpload == null) {
			formData.append('image', '');
		} else {
		formData.append('image', this.fileToUpload, this.fileToUpload.name);
		}
		formData.append('slug', _category.slug);
		return formData;
	}

	prepareCategory1(): CategoryModel {
		const controls = this.categoryForm.controls;
		const _category = new CategoryModel();
		_category.id = this.category.id;
		_category.name = controls['name'].value;
		_category.id_parent = +controls['id_parent'].value;
		_category.description = controls['description'].value;
		_category.slug = controls['name'].value.toLowerCase();
		return _category;
	}

	makeFormData1(_category) {
		const formData: FormData = new FormData();
		formData.append('name', _category.name);
		formData.append('id_parent', _category.id_parent);
		formData.append('description', _category.description);
		if (this.fileToUpload == null) {
			formData.append('image', '');
		} else {
		formData.append('image', this.fileToUpload, this.fileToUpload.name);
		}
		formData.append('slug', _category.slug);
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
			this.router.navigate(['vp-admin/catalog/categories']);
			const message = `New category successfully has been added.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
			this.reset();
	}

	addCategory1(formData, withBack: boolean = false) {
		this.store.dispatch(new CategoryOnServerCreated({ category: formData }));
			// this.router.navigate(['vp-admin/catalog/product']);
			const message = `New category successfully has been added.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
			this.reset();
	}

	/**
	 * Update category
	 *
	 * @param _category: CategoryModel
	 * @param withBack: boolean
	 */
	/*
	updateCategory(_category: CategoryModel, withBack: boolean = false) {
		this.loadingSubject.next(true);

		const updateCategory: Update<CategoryModel> = {
			id: _category.id,
			changes: _category
		};

		this.store.dispatch(new CategoryUpdated({
			partialCategory: updateCategory,
			category: _category
		}));

		of(undefined).pipe(delay(3000)).subscribe(() => { // Remove this line
			if (withBack) {
		 		this.goBack(_category.id);
			} else {
				const message = `Category successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
		 		this.refreshCategory(false);
			}
		}); // Remove this line
	}
	*/
	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create category';
		if (!this.category || !this.category.id) {
			return result;
		}

		result = `Edit category - ${this.category.name} ${this.category.id_parent}, ${this.category.description}`;
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
