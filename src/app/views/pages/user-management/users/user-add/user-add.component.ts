// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
// Services and Models
import {
	User,
	UserUpdated,
	Address,
	SocialNetworks,
	selectHasUsersInStore,
	selectUserById,
	UserOnServerCreated,
	selectLastCreatedUserId,
	selectUsersActionLoading,
	Role,
	selectAllRoles
} from '../../../../../core/auth';
import { each } from 'lodash';

export class PasswordValidation {
	/**
	 * MatchPassword
	 *
	 * @param AC: AbstractControl
	 */
		static MatchPassword(AC: AbstractControl) {
				const password = AC.get('password').value; // to get value in input tag
				const confirmPassword = AC.get('confirmPassword').value; // to get value in input tag
				if (password !== confirmPassword) {
			AC.get('confirmPassword').setErrors( {MatchPassword: true} );
				} else {
						return null;
				}
		}
}

@Component({
	selector: 'kt-user-add',
	templateUrl: './user-add.component.html',
})
export class UserAddComponent implements OnInit, OnDestroy {
	// Public properties
	user: User;
	userId$: Observable<number>;
	oldUser: User;
	selectedTab: number = 0;
	loading$: Observable<boolean>;
	rolesSubject = new BehaviorSubject<number[]>([]);
	addressSubject = new BehaviorSubject<Address>(new Address());
	soicialNetworksSubject = new BehaviorSubject<SocialNetworks>(new SocialNetworks());
	registerForm: FormGroup;
	hasFormErrors: boolean = false;
	hasMatchErrors: boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];
	unassignedRoles: Role[] = [];
	allUserRoles$: Observable<Role[]>;

	/**
	 * Component constructor
	 *
	 * @param activatedRoute: ActivatedRoute
	 * @param router: Router
	 * @param userFB: FormBuilder
	 * @param subheaderService: SubheaderService
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param store: Store<AppState>
	 * @param layoutConfigService: LayoutConfigService
	 */
	constructor(private activatedRoute: ActivatedRoute,
		private router: Router,
		private userFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectUsersActionLoading));
		this.allUserRoles$ = this.store.pipe(select(selectAllRoles));
		this.allUserRoles$.subscribe((res: Role[]) => {
			each(res, (_role: Role) => {
				this.unassignedRoles.push(_role);
			});
		});

		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {
				this.store.pipe(select(selectUserById(id))).subscribe(res => {
					if (res) {
						this.user = res;
						this.rolesSubject.next(this.user.roles);
						this.addressSubject.next(this.user.address);
						// this.soicialNetworksSubject.next(this.user.socialNetworks);
						this.oldUser = Object.assign({}, this.user);
						this.initUser();
					}
				});
			} else {
				this.user = new User();
				this.user.clear();
				this.rolesSubject.next(this.user.roles);
				this.addressSubject.next(this.user.address);
				// this.soicialNetworksSubject.next(this.user.socialNetworks);
				this.oldUser = Object.assign({}, this.user);
				this.initUser();
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	/**
	 * Init user
	 */
	initUser() {
		this.createForm();
		if (!this.user.id) {
			this.subheaderService.setTitle('Create user');
			this.subheaderService.setBreadcrumbs([
				{ title: 'User Management', page: `user-management` },
				{ title: 'Users',  page: `user-management/users` },
				{ title: 'Create user', page: `user-management/users/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Edit user');
		this.subheaderService.setBreadcrumbs([
			{ title: 'User Management', page: `user-management` },
			{ title: 'Users',  page: `user-management/users` },
			{ title: 'Edit user', page: `user-management/users/edit`, queryParams: { id: this.user.id } }
		]);
	}

	/**
	 * Create form
	 */
	createForm() {
		if (!this.user.occupation) {
			this.user.occupation = 'Sales';
		}
		if (!this.user.companyName) {
			this.user.companyName = 'Vapehan';
		}
		this.registerForm = this.userFB.group({
			username: ['', Validators.required],
			fullname: ['', Validators.required],
			email: ['', Validators.email, Validators.required],
			companyName: [this.user.companyName],
			occupation: [this.user.occupation],
			role: ['', Validators.required],
			password: ['', Validators.required],
			confirmPassword: ['', Validators.required]
		});
	}

	/**
	 * Redirect to list
	 *
	 */
	goBackWithId() {
		const url = `${this.layoutConfigService.getCurrentMainRoute()}/user-management/users`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Reset
	 */
	reset() {
		this.user = Object.assign({}, this.oldUser);
		this.createForm();
		this.hasFormErrors = false;
		this.hasMatchErrors = false;
		this.registerForm.markAsPristine();
		this.registerForm.markAsUntouched();
		this.registerForm.updateValueAndValidity();
	}

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.hasMatchErrors = false;
		const controls = this.registerForm.controls;
		if (controls['password'].value !== controls['confirmPassword'].value) {
			this.hasMatchErrors = true;
			return;
		}
		/** check form */
		if (this.registerForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedUser = this.prepareUser();

		this.addUser(editedUser, withBack);
	}

	/**
	 * Returns prepared data for save
	 */
	prepareUser(): User {
		const controls = this.registerForm.controls;
		const _user = new User();
		_user.clear();
		_user.roles = controls['role'].value;
		_user.address = this.addressSubject.value;
		// _user.socialNetworks = this.soicialNetworksSubject.value;
		_user.accessToken = this.user.accessToken;
		_user.refreshToken = this.user.refreshToken;
		_user.pic = this.user.pic;
		_user.id = this.user.id;
		_user.username = controls['username'].value;
		_user.email = controls['email'].value;
		_user.fullname = controls['fullname'].value;
		_user.occupation = controls['occupation'].value;
		_user.phone = this.user.phone;
		_user.companyName = controls['companyName'].value;
		_user.password = controls['password'].value;
		return _user;
	}

	/**
	 * Add User
	 *
	 * @param _user: User
	 * @param withBack: boolean
	 */
	addUser(_user: User, withBack: boolean = false) {
		this.store.dispatch(new UserOnServerCreated({ user: _user }));
		this.router.navigate(['vp-admin/user-management/users']);
		const addSubscription = this.store.pipe(select(selectLastCreatedUserId)).subscribe(newId => {
			const message = `New user successfully has been added.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
		});
		this.subscriptions.push(addSubscription);
	}

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create user';
		if (!this.user || !this.user.id) {
			return result;
		}

		return result;
	}

	/**
	 * Close Alert
	 *
	 * @param $event: Event
	 */
	onAlertClose($event) {
		this.hasFormErrors = false;
		this.hasMatchErrors = false;
	}
}
