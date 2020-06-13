// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, delay, take, first } from 'rxjs/operators';
import { fromEvent, merge, Subscription, of, Observable } from 'rxjs';
// Translate Module
import { TranslateService } from '@ngx-translate/core';
// NGRX
import { Store, ActionsSubject, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
// CRUD
import { LayoutUtilsService, MessageType, QueryParamsModel, HttpUtilsService } from '../../../../../../core/_base/crud';
// Services and Models
import { BannerModel, BannersDataSource, BannersPageRequested, OneBannerDeleted, ManyBannersDeleted} from '../../../../../../core/catalog';
import { currentUser, User, AuthService } from '../../../../../../core/auth';
// Components
import { BannerEditComponent } from '../banner-edit/banner-edit.component';

import { BannerService } from '../../../../../../core/catalog/_services';
import { async } from '@angular/core/testing';

// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/compgetItemCssClassByStatusonents/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-banners-list',
	templateUrl: './banner-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,

})
export class BannersListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: BannersDataSource;
	user$: User;
	displayedColumns = ['select', 'id', 'image', 'description', 'status', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	filterStatus: string = '';
	filterType: string = '';
	isAdmin: any = [];
	banners: BannerModel[] = [];
	// Selection
	selection = new SelectionModel<BannerModel>(true, []);
	bannersResult: BannerModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	private localURl: string;

	/**
	 * Component constructor
	 *
	 * @param dialog: MatDialog
	 * @param snackBar: MatSnackBar
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param translate: TranslateService
	 * @param store: Store<AppState>
	 */
	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private store: Store<AppState>,
		private bannerService: BannerService,
		private auth: AuthService,
		private domainLocal: HttpUtilsService
	) { this.localURl = this.domainLocal.domain; }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */
		banner: any = [];
		user: User;
	/**
	 * On init
	 */
	ngOnInit() {

		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadBannersList())
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadBannersList();
			})
		)
			.subscribe();
		this.subscriptions.push(searchSubscription);

		// Init DataSource
		this.dataSource = new BannersDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.bannersResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		// First load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadBannersList();
		}); // Remove this line, just loading imitation

		this.store.pipe(select(currentUser), first(res => {
			return res !== undefined;
		})
		).subscribe(result => {
			this.user$ = result;
			this.isAdmin = this.user$.roles;
		});


	}



	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Load Banners List from service through data-source
	 */
	loadBannersList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new BannersPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/**
	 * Returns object for filter
	 */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		if (!searchText) {
			return filter;
		}

		filter.description = searchText;
		return filter;
	}

	/** ACTIONS */
	/**
	 * Delete banner
	 *
	 * @param _item: BannerModel
	 */
	deleteBanner(_item: BannerModel) {
		const _title: string = this.translate.instant('DELETE BANNER');
		const _description: string = this.translate.instant(`ARE YOU SURE TO PERMANENTLY DELETE THIS BANNER?`);
		const _waitDesciption: string = this.translate.instant('BANNER ARE DELETING...');
		const _deleteMessage = this.translate.instant('BANNER HAVE BEEN DELETED');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneBannerDeleted({ id: _item.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	/**
	 * Delete selected banners
	 */
	deleteBanners() {
		const _title: string = this.translate.instant('DELETE BANNER');
		const _description: string = this.translate.instant('ARE YOU SURE TO PERMANENTLY DELETE SELECTED BANNER?');
		const _waitDesciption: string = this.translate.instant('BANNER ARE DELETING...');
		const _deleteMessage = this.translate.instant('BANNER HAVE BEEN DELETED');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const idsForDeletion: number[] = [];
			// tslint:disable-next-line: prefer-for-of
			for (let i = 0; i < this.selection.selected.length; i++) {
				idsForDeletion.push(this.selection.selected[i].id);
			}
			this.store.dispatch(new ManyBannersDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
		});
	}

	/**
	 * Show add banner dialog
	 */
	addBanner() {
		const newBanner = new BannerModel();
		newBanner.clear(); // Set all defaults fields
		this.editBanner(newBanner);
	}

	/**
	 * Show Edit banner dialog and save after success close result
	 * @param banner: BannerModel
	 */
	editBanner(banner: BannerModel) {
		let saveMessageTranslateParam = 'SUCCESS ';
		saveMessageTranslateParam += banner.id > 0 ? 'UPDATE BANNER' : 'ADD BANNER';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam);
		const _messageType = banner.id > 0 ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(BannerEditComponent, { data: { banner } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType);
			this.ngOnInit();
		});
	}

	/**
	 * Check all rows are selected
	 */
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.bannersResult.length;
		return numSelected === numRows;
	}

	/**
	 * Toggle all selections
	 */
	masterToggle() {
		if (this.selection.selected.length === this.bannersResult.length) {
			this.selection.clear();
		} else {
			this.bannersResult.forEach(row => this.selection.select(row));
		}
	}

	/** UI */
	/**
	 * Update Status
	 */
	onActive(id: string, status) {
		let active = 1;
		let deactive = 0;
		let stat: number;
		const _deleteMessage = this.translate.instant('Active Banner Must 1 Banner or More');
		// tslint:disable-next-line: new-parens

		if (status === 0) {
			stat = active;
		} else {
			stat = deactive;
		}
		const data = {
			id_bn: id,
			flag: stat,
		};

		this.bannerService.AllBanners().subscribe(
			result => {
				if (result.length <= 1 && stat === 0) {
					return this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Read);
				} else {
					this.bannerService.updateStat(data).subscribe();
					this.ngOnInit();
				}
			}
		);
	}

	/**
	 * Retursn CSS Class Name by status
	 *
	 * @param status: number
	 */
	getItemCssClassByStatus(status: number = 0): string {
		switch (status) {
			case 0:
				return 'danger';
			case 1:
				return 'success';
		}
		return '';
	}

	/**
	 * Returns Item Status in string
	 * @param status: number
	 */
	getItemStatusString(status: number = 0): string {
		switch (status) {
			case 0:
				return 'Deactive';
			case 1:
				return 'Active';
		}
		return '';
	}

	/**
	 * Returns CSS Class Name by type
	 * @param status: number
	 */
	getItemCssClassByType(status: number = 0): string {
		switch (status) {
			case 0:
				return 'accent';
			case 1:
				return 'primary';
			case 2:
				return '';
		}
		return '';
	}

	/**
	 * Returns Item Type in string
	 * @param status: number
	 */
	getItemTypeString(status: number = 0): string {
		switch (status) {
			case 0:
				return 'Business';
			case 1:
				return 'Individual';
		}
		return '';
	}
}
