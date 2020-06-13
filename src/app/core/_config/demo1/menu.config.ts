export class MenuConfig {
	public defaults: any = {
		header: {
			self: {},
			items: [
				{
					title: 'Dashboards',
					root: true,
					alignment: 'left',
					page: 'dashboard',
					translate: 'MENU.DASHBOARD',
				},
				{
					title: 'Applications',
					root: true,
					alignment: 'left',
					toggle: 'click',
					submenu: [
						{
							title: 'Product Management',
							bullet: 'dot',
							icon: 'flaticon-business',
							root: true,
							// permission: 'accessToECommerceModule',
							submenu: [
								{
									title: 'Products',
									page: 'catalog/product'
								},
								{
									title: 'Categories',
									page: 'catalog/categories'
								},
								{
									title: 'Brands',
									page: 'catalog/brands'
								},
								{
									title: 'Home Banner',
									page: 'catalog/banners'
								}
							]
						},

						{
							title: 'Promotion',
							bullet: 'dot',
							icon: 'flaticon-star',
							root: true,
							submenu: [
								/*
								{
									title: 'Discount Of The Month',
									page: 'catalog/discounts'
								},
								*/
								{
									title: 'Voucher',
									page: 'catalog/vouchers'
								}
							]
						},

						{
							title: 'Orders',
							bullet: 'dot',
							icon: 'flaticon2-supermarket',
							page: 'order/orders'
							/*
							submenu: [
								{
									title: 'Orders',
									page: 'order/orders'
								},
							]
							*/
						},
						{
							title: 'User Management',
							bullet: 'dot',
							icon: 'flaticon-avatar',
							submenu: [
								{
									title: 'Users',
									page: 'user-management/users'
								},
								{
									title: 'Roles',
									page: 'user-management/roles'
								}
							]
						},
						{
							title: 'Customer Management',
							bullet: 'dot',
							icon: 'flaticon-customer',
							submenu: [
								{
									title: 'Customer',
									page: 'customers/customer'
								},
							]
						},
						{
							title: 'Official Distributor',
							bullet: 'dot',
							icon: 'flaticon-users',
							page: 'distributors/distributor-list'
						}
					]
				},
				/*
				{
					title: 'Setting',
					root: true,
					alignment: 'left',
					toggle: 'click',
					submenu: [
						{
							title: 'About us',
							bullet: 'dot',
							icon: 'flaticon-presentation',
							root: true,
							page: 'setting/about-us',
						},
						{
							title: 'FAQ',
							bullet: 'dot',
							icon: 'flaticon-speech-bubble',
							root: true,
							page: 'setting/faq',
						},
						{
							title: 'How To Order',
							bullet: 'dot',
							icon: 'flaticon2-shopping-cart-1',
							root: true,
							page: 'setting/how-to-order',
						},
						{
							title: 'Privacy Policy',
							bullet: 'dot',
							icon: 'flaticon-security',
							root: true,
							page: 'setting/privacy-policy',
						},
						{
							title: 'Term & Condition',
							bullet: 'dot',
							icon: 'flaticon2-paper',
							root: true,
							page: 'setting/tnc',
						},
					]
				},
				*/
				{
					title: 'Custom',
					root: true,
					alignment: 'left',
					toggle: 'click',
					submenu: [
						{
							title: 'Error Pages',
							bullet: 'dot',
							icon: 'flaticon2-attention',
							submenu: [
								{
									title: 'Error 1',
									page: 'error/error-v1'
								},
								{
									title: 'Error 2',
									page: 'error/error-v2'
								},
								{
									title: 'Error 3',
									page: 'error/error-v3'
								},
								{
									title: 'Error 4',
									page: 'error/error-v4'
								},
								{
									title: 'Error 5',
									page: 'error/error-v5'
								},
								{
									title: 'Error 6',
									page: 'error/error-v6'
								},
							]
						},
					]
				},
			]
		},
		aside: {
			self: {},
			items: [
				{
					title: 'Dashboard',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: 'dashboard',
					translate: 'MENU.DASHBOARD',
					bullet: 'dot',
				},
				{section: 'Applications'},
				{
					title: 'Product Management',
					bullet: 'dot',
					icon: 'flaticon2-list-2',
					root: true,

					submenu: [
						{
							title: 'Products',
							page: 'catalog/product',
						},
						{
							title: 'Categories',
							page: 'catalog/categories'
						},
						{
							title: 'Brands',
							page: 'catalog/brands'
						},
						{
							title: 'Home Banner',
							page: 'catalog/banners'
						}
					]
				},

				{
					title: 'Promotion',
					bullet: 'dot',
					icon: 'flaticon-star',
					root: true,

					submenu: [
						/*
						{
							title: 'Discount Of The Month',
							page: 'catalog/discounts'
						},
						*/
						{
							title: 'Voucher',
							page: 'catalog/vouchers'
						}
					]
				},

				{
					title: 'Order',
					bullet: 'dot',
					icon: 'flaticon2-supermarket',
					root: true,
					page: 'order/orders'
					/*
					submenu: [
						{
							title: 'Orders',

						},

						{
							title: 'Confirm Payment',
							page: 'order/confirm'
						},
						{
							title: 'Invoice',
							page: 'order/invoice'
						}

					]
					*/
				},
				{
					title: 'User Management',
					root: true,
					bullet: 'dot',
					icon: 'flaticon2-user',
					submenu: [
						{
							title: 'Users',
							page: 'user-management/users'
						},
						{
							title: 'Roles',
							page: 'user-management/roles'
						}
					]
				},
				{
					title: 'Customer Management',
					root: true,
					bullet: 'dot',
					icon: 'flaticon2-avatar',
					submenu: [
						{
							title: 'Customers',
							page: 'customers/customer'
						},
						{
							title: 'Invoice List',
							page: 'order/invoice'
						}
					]
				},
				{
					title: 'Official Distributor',
					root: true,
					bullet: 'dot',
					icon: 'flaticon2-group',
					page: 'distributors/distributors-list'
				},
				/*
				{section: 'Setting'},
				{
					title: 'Setting',
					root: true,
					bullet: 'dot',
					icon: 'flaticon2-settings',
					submenu: [
						{
							title: 'About us',
							page: 'setting/about-us',
						},
						{
							title: 'FAQ',
							page: 'setting/faq',
						},
						{
							title: 'How To Order',
							page: 'setting/how-to-order',
						},
						{
							title: 'Privacy Policy',
							page: 'setting/privacy-policy',
						},
						{
							title: 'Term & Condition',
							page: 'setting/tnc',
						},
					]
				},
				*/
				{
					// title: 'Error Pages',
					root: true,
					bullet: 'dot',
					icon: 'flaticon2-attention',
					submenu: [
						{
							title: 'Error 1',
							page: 'error/error-v1'
						},
						{
							title: 'Error 2',
							page: 'error/error-v2'
						},
						{
							title: 'Error 3',
							page: 'error/error-v3'
						},
						{
							title: 'Error 4',
							page: 'error/error-v4'
						},
						{
							title: 'Error 5',
							page: 'error/error-v5'
						},
						{
							title: 'Error 6',
							page: 'error/error-v6'
						},
					]
				},


			]
		},
	};

	public get configs(): any {
		return this.defaults;
	}
}
