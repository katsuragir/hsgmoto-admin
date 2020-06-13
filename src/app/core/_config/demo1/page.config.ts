export class PageConfig {
	public defaults: any = {
		dashboard: {
			page: {
				'title': 'Dashboard',
				'desc': 'Latest updates and statistic charts'
			},
		},
		catalog: {
			product: {
				edit: {
					page: { title: 'Edit product', desc: '' }
				},
				add: {
					page: { title: 'Add product', desc: '' }
				}
			},
			categories: {
				edit: {
					page: { title: 'Edit category', desc: '' }
				},
				add: {
					page: { title: 'Create category', desc: '' }
				}
			},
			Banners: {
				edit: {
					page: { title: 'Edit Brands', desc: '' }
				},
				add: {
					page: { title: 'Create brands',  desc: '' }
				}
			},
			banners: {
				edit: {
					page: { title: 'Edit Banners', desc: '' }
				},
				add: {
					page: { title: 'Create Banners',  desc: '' }
				}
			}
		},
		order: {
			orders: {
				edit: {
					page: { title: 'Edit order', desc: '' }
				},
				add: {
					page: { title: 'Add order', desc: '' }
				}
			},
			/*
			confirm: {
				edit: {
					page: { title: 'Edit Confirm', desc: '' }
				},
				add: {
					page: { title: 'Add Confirm', desc: '' }
				}
			},
			invoice: {
				edit: {
					page: { title: 'Detail Invoice', desc: '' }
				},
				// add: {
					// page: { title: 'Add Invoice', desc: '' }
				// }
			}
			*/
		},
		customers: {
			customer: {
				edit: {
					page: { title: 'Edit customer', desc: '' }
				},
				add: {
					page: { title: 'Add customer', desc: '' }
				}
			},
		},
		forms: {
			page: {title: 'Forms', desc: ''}
		},
		mail: {
			page: {title: 'Mail', desc: 'Mail'}
		},
		ecommerce: {
			customers: {
				page: {title: 'Customers', desc: ''}
			},
			products: {
				edit: {
					page: {title: 'Edit product', desc: ''}
				},
				add: {
					page: {title: 'Create product', desc: ''}
				}
			},
			orders: {
				page: {title: 'Orders', desc: ''}
			}
		},
		'user-management': {
			users: {
				page: {title: 'Users', desc: ''}
			},
			roles: {
				page: {title: 'Roles', desc: ''}
			}
		},
		setting: {
			'about-us': {
				edit: { title: 'Edit about us', desc: '' }
			}
		},
		distributors: {
			distributors: {
				add: {
					page: { title: 'Create Distributors', desc: '' }
				}
			}
		},
		builder: {
			page: {title: 'Layout Builder', desc: ''}
		},
		header: {
			actions: {
				page: {title: 'Actions', desc: 'Actions example page'}
			}
		},
		profile: {
			page: {title: 'User Profile', desc: ''}
		},
		error: {
			404: {
				page: {title: '404 Not Found', desc: '', subheader: false}
			},
			403: {
				page: {title: '403 Access Forbidden', desc: '', subheader: false}
			}
		},
		wizard: {
			'wizard-1': {page: {title: 'Wizard 1', desc: ''}},
			'wizard-2': {page: {title: 'Wizard 2', desc: ''}},
			'wizard-3': {page: {title: 'Wizard 3', desc: ''}},
			'wizard-4': {page: {title: 'Wizard 4', desc: ''}},
		},
	};

	public get configs(): any {
		return this.defaults;
	}
}
