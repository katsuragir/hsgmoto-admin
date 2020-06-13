// Angular
import { Component, OnInit } from '@angular/core';
// Lodash
import { shuffle } from 'lodash';
// Services
// Widgets model
import { LayoutConfigService, SparklineChartOptions } from '../../../core/_base/layout';
import { Widget4Data } from '../../partials/content/widgets/widget4/widget4.component';
import { OrderService } from '../../../core/order';
import { Observable } from 'rxjs';
import { SettingService } from '../../../core/auth';

@Component({
	selector: 'kt-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
	chartOptions1: SparklineChartOptions;
	chartOptions2: SparklineChartOptions;
	chartOptions3: SparklineChartOptions;
	chartOptions4: SparklineChartOptions;
	widget4_1: Widget4Data;
	widget4_2: Widget4Data;
	widget4_3: Widget4Data;
	widget4_4: Widget4Data;
	totalOrder$: Observable<any>;
	public totalallVisitor$: Observable<any>;
	public totalmacVisitor$: Observable<any>;
	public totalandroidVisitor$: Observable<any>;
	public totalwindowsVisitor$: Observable<any>;
	public totalanotherVisitor$: Observable<any>;
	public totaliosVisitor$: Observable<any>;
	totalSuccOrder: number;
	totalFailOrder: number;
	totalWaitOrder: number;
	interval: any;
	desc: string;
	public parameter = '';

	constructor(private layoutConfigService: LayoutConfigService, private orderService: OrderService, private settingService: SettingService) {
	}

	ngOnInit(): void {
		this.totalOrder$ = this.orderService.getTotalOrder();
		if (this.parameter === '') {
			this.parameter = 'today';
		}
		switch (this.parameter) {
			case 'today':
				this.desc = 'Today';
				this.totalallVisitor$ = this.settingService.allvisitorToday();
				this.totalmacVisitor$ = this.settingService.macvisitorToday();
				this.totalandroidVisitor$ = this.settingService.androidvisitorToday();
				this.totalwindowsVisitor$ = this.settingService.windowsvisitorToday();
				this.totaliosVisitor$ = this.settingService.iosvisitorToday();
				this.totalanotherVisitor$ = this.settingService.othervisitorToday();
				break;
			case 'week':
				this.desc = 'This Week';
				this.totalallVisitor$ = this.settingService.allvisitorToday();
				this.totalmacVisitor$ = this.settingService.macvisitorToday();
				this.totalandroidVisitor$ = this.settingService.androidvisitorToday();
				this.totalwindowsVisitor$ = this.settingService.windowsvisitorToday();
				this.totaliosVisitor$ = this.settingService.iosvisitorToday();
				this.totalanotherVisitor$ = this.settingService.othervisitorToday();
				break;
			case 'month':
				this.desc = 'This Month';
				this.totalallVisitor$ = this.settingService.allvisitorMonth();
				this.totalmacVisitor$ = this.settingService.macvisitorMonth();
				this.totalandroidVisitor$ = this.settingService.androidvisitorMonth();
				this.totalwindowsVisitor$ = this.settingService.windowsvisitorMonth();
				this.totaliosVisitor$ = this.settingService.iosvisitorMonth();
				this.totalanotherVisitor$ = this.settingService.othervisitorMonth();
				break;
			case 'lastmonth':
				this.desc = 'Last Month';
				this.totalallVisitor$ = this.settingService.allvisitorLastMonth();
				this.totalmacVisitor$ = this.settingService.macvisitorLastMonth();
				this.totalandroidVisitor$ = this.settingService.androidvisitorLastMonth();
				this.totalwindowsVisitor$ = this.settingService.windowsvisitorLastMonth();
				this.totaliosVisitor$ = this.settingService.iosvisitorLastMonth();
				this.totalanotherVisitor$ = this.settingService.othervisitorLastMonth();
				break;
			case 'custom':
				this.totalallVisitor$ = this.settingService.allvisitorToday();
				this.totalmacVisitor$ = this.settingService.macvisitorToday();
				this.totalandroidVisitor$ = this.settingService.androidvisitorToday();
				this.totalwindowsVisitor$ = this.settingService.windowsvisitorToday();
				this.totaliosVisitor$ = this.settingService.iosvisitorToday();
				this.totalanotherVisitor$ = this.settingService.othervisitorToday();
				break;
		}
		this.interval = setInterval(() => {
			// console.log(this.parameter);
			switch (this.parameter) {
				case 'today':
					this.desc = 'Today';
					this.totalallVisitor$ = this.settingService.allvisitorToday();
					this.totalmacVisitor$ = this.settingService.macvisitorToday();
					this.totalandroidVisitor$ = this.settingService.androidvisitorToday();
					this.totalwindowsVisitor$ = this.settingService.windowsvisitorToday();
					this.totaliosVisitor$ = this.settingService.iosvisitorToday();
					this.totalanotherVisitor$ = this.settingService.othervisitorToday();
					break;
				case 'week':
					this.desc = 'This Week';
					this.totalallVisitor$ = this.settingService.allvisitorToday();
					this.totalmacVisitor$ = this.settingService.macvisitorToday();
					this.totalandroidVisitor$ = this.settingService.androidvisitorToday();
					this.totalwindowsVisitor$ = this.settingService.windowsvisitorToday();
					this.totaliosVisitor$ = this.settingService.iosvisitorToday();
					this.totalanotherVisitor$ = this.settingService.othervisitorToday();
					break;
				case 'month':
					// console.log('Month');
					this.desc = 'This Month';
					this.totalallVisitor$ = this.settingService.allvisitorMonth();
					this.totalmacVisitor$ = this.settingService.macvisitorMonth();
					this.totalandroidVisitor$ = this.settingService.androidvisitorMonth();
					this.totalwindowsVisitor$ = this.settingService.windowsvisitorMonth();
					this.totaliosVisitor$ = this.settingService.iosvisitorMonth();
					this.totalanotherVisitor$ = this.settingService.othervisitorMonth();
					break;
				case 'lastmonth':
					this.desc = 'Last Month';
					this.totalallVisitor$ = this.settingService.allvisitorLastMonth();
					this.totalmacVisitor$ = this.settingService.macvisitorLastMonth();
					this.totalandroidVisitor$ = this.settingService.androidvisitorLastMonth();
					this.totalwindowsVisitor$ = this.settingService.windowsvisitorLastMonth();
					this.totaliosVisitor$ = this.settingService.iosvisitorLastMonth();
					this.totalanotherVisitor$ = this.settingService.othervisitorLastMonth();
					break;
				case 'custom':
					this.totalallVisitor$ = this.settingService.allvisitorToday();
					this.totalmacVisitor$ = this.settingService.macvisitorToday();
					this.totalandroidVisitor$ = this.settingService.androidvisitorToday();
					this.totalwindowsVisitor$ = this.settingService.windowsvisitorToday();
					this.totaliosVisitor$ = this.settingService.iosvisitorToday();
					this.totalanotherVisitor$ = this.settingService.othervisitorToday();
					break;
			}
			this.totalOrder$ = this.orderService.getTotalOrder();
		}, 2000);


		// this.totalOrder$.subscribe( res => { console.log(res); });

		this.chartOptions1 = {
			data: [10, 14, 18, 11, 9, 12, 14, 17, 18, 14, 10, 4, 5, 12 , 9],
			color: this.layoutConfigService.getConfig('colors.state.brand'),
			border: 3
		};
		this.chartOptions2 = {
			data: [11, 12, 18, 13, 11, 12, 15, 13, 19, 15],
			color: this.layoutConfigService.getConfig('colors.state.danger'),
			border: 3
		};
		this.chartOptions3 = {
			data: [12, 12, 18, 11, 15, 12, 13, 16, 11, 18],
			color: this.layoutConfigService.getConfig('colors.state.success'),
			border: 3
		};
		this.chartOptions4 = {
			data: [11, 9, 13, 18, 13, 15, 14, 13, 18, 15],
			color: this.layoutConfigService.getConfig('colors.state.primary'),
			border: 3
		};

		// @ts-ignore
		this.widget4_1 = shuffle([
			{
				pic: './assets/media/files/doc.svg',
				title: 'Metronic Documentation',
				url: 'https://keenthemes.com.my/metronic',
			}, {
				pic: './assets/media/files/jpg.svg',
				title: 'Project Launch Evgent',
				url: 'https://keenthemes.com.my/metronic',
			}, {
				pic: './assets/media/files/pdf.svg',
				title: 'Full Developer Manual For 4.7',
				url: 'https://keenthemes.com.my/metronic',
			}, {
				pic: './assets/media/files/javascript.svg',
				title: 'Make JS Great Again',
				url: 'https://keenthemes.com.my/metronic',
			}, {
				pic: './assets/media/files/zip.svg',
				title: 'Download Ziped version OF 5.0',
				url: 'https://keenthemes.com.my/metronic',
			}, {
				pic: './assets/media/files/pdf.svg',
				title: 'Finance Report 2016/2017',
				url: 'https://keenthemes.com.my/metronic',
			},
		]);
		// @ts-ignore
		this.widget4_2 = shuffle([
			{
				pic: './assets/media/users/100_4.jpg',
				username: 'Anna Strong',
				desc: 'Visual Designer,Google Inc.',
				url: 'https://keenthemes.com.my/metronic',
				buttonClass: 'btn-label-brand'
			}, {
				pic: './assets/media/users/100_14.jpg',
				username: 'Milano Esco',
				desc: 'Product Designer, Apple Inc.',
				url: 'https://keenthemes.com.my/metronic',
				buttonClass: 'btn-label-warning'
			}, {
				pic: './assets/media/users/100_11.jpg',
				username: 'Nick Bold',
				desc: 'Web Developer, Facebook Inc.',
				url: 'https://keenthemes.com.my/metronic',
				buttonClass: 'btn-label-danger'
			}, {
				pic: './assets/media/users/100_1.jpg',
				username: 'Wilter Delton',
				desc: 'Project Manager, Amazon Inc.',
				url: 'https://keenthemes.com.my/metronic',
				buttonClass: 'btn-label-success'
			}, {
				pic: './assets/media/users/100_5.jpg',
				username: 'Nick Stone',
				desc: 'Visual Designer, Github Inc.',
				url: 'https://keenthemes.com.my/metronic',
				buttonClass: 'btn-label-dark'
			},
		]);
		// @ts-ignore
		this.widget4_3 = shuffle([
			{
				icon: 'flaticon-pie-chart-1 kt-font-info',
				title: 'Metronic v6 has been arrived!',
				url: 'https://keenthemes.com.my/metronic',
				value: '+$500',
				valueColor: 'kt-font-info'
			}, {
				icon: 'flaticon-safe-shield-protection kt-font-success',
				title: 'Metronic community meet-up 2019 in Rome.',
				url: 'https://keenthemes.com.my/metronic',
				value: '+$1260',
				valueColor: 'kt-font-success'
			}, {
				icon: 'flaticon2-line-chart kt-font-danger',
				title: 'Metronic Angular 8 version will be landing soon..',
				url: 'https://keenthemes.com.my/metronic',
				value: '+$1080',
				valueColor: 'kt-font-danger'
			}, {
				icon: 'flaticon2-pie-chart-1 kt-font-primary',
				title: 'ale! Purchase Metronic at 70% off for limited time',
				url: 'https://keenthemes.com.my/metronic',
				value: '70% Off!',
				valueColor: 'kt-font-primary'
			}, {
				icon: 'flaticon2-rocket kt-font-brand',
				title: 'Metronic VueJS version is in progress. Stay tuned!',
				url: 'https://keenthemes.com.my/metronic',
				value: '+134',
				valueColor: 'kt-font-brand'
			}, {
				icon: 'flaticon2-notification kt-font-warning',
				title: 'Black Friday! Purchase Metronic at ever lowest 90% off for limited time',
				url: 'https://keenthemes.com.my/metronic',
				value: '70% Off!',
				valueColor: 'kt-font-warning'
			}, {
				icon: 'flaticon2-file kt-font-focus',
				title: 'Metronic React version is in progress.',
				url: 'https://keenthemes.com.my/metronic',
				value: '+13%',
				valueColor: 'kt-font-focus'
			},
		]);
		// @ts-ignore
		this.widget4_4 = shuffle([
			{
				pic: './assets/media/client-logos/logo5.png',
				title: 'Trump Themes',
				desc: 'Make Metronic Great Again',
				url: 'https://keenthemes.com.my/metronic',
				value: '+$2500',
				valueColor: 'kt-font-brand'
			}, {
				pic: './assets/media/client-logos/logo4.png',
				title: 'StarBucks',
				desc: 'Good Coffee & Snacks',
				url: 'https://keenthemes.com.my/metronic',
				value: '-$290',
				valueColor: 'kt-font-brand'
			}, {
				pic: './assets/media/client-logos/logo3.png',
				title: 'Phyton',
				desc: 'A Programming Language',
				url: 'https://keenthemes.com.my/metronic',
				value: '+$17',
				valueColor: 'kt-font-brand'
			}, {
				pic: './assets/media/client-logos/logo2.png',
				title: 'GreenMakers',
				desc: 'Make Green Great Again',
				url: 'https://keenthemes.com.my/metronic',
				value: '-$2.50',
				valueColor: 'kt-font-brand'
			}, {
				pic: './assets/media/client-logos/logo1.png',
				title: 'FlyThemes',
				desc: 'A Let\'s Fly Fast Again Language',
				url: 'https://keenthemes.com.my/metronic',
				value: '+200',
				valueColor: 'kt-font-brand'
			},
		]);
	}

	public getOption(option) {
		// console.log(option);
		this.parameter = option;
		clearInterval(this.interval);

		switch (this.parameter) {
			case 'today':
				this.desc = 'Today';
				this.totalallVisitor$ = this.settingService.allvisitorToday();
				this.totalmacVisitor$ = this.settingService.macvisitorToday();
				this.totalandroidVisitor$ = this.settingService.androidvisitorToday();
				this.totalwindowsVisitor$ = this.settingService.windowsvisitorToday();
				this.totaliosVisitor$ = this.settingService.iosvisitorToday();
				this.totalanotherVisitor$ = this.settingService.othervisitorToday();
				break;
			case 'week':
				this.desc = 'This Week';
				this.totalallVisitor$ = this.settingService.allvisitorToday();
				this.totalmacVisitor$ = this.settingService.macvisitorToday();
				this.totalandroidVisitor$ = this.settingService.androidvisitorToday();
				this.totalwindowsVisitor$ = this.settingService.windowsvisitorToday();
				this.totaliosVisitor$ = this.settingService.iosvisitorToday();
				this.totalanotherVisitor$ = this.settingService.othervisitorToday();
				break;
			case 'month':
				this.desc = 'This Month';
				this.totalallVisitor$ = this.settingService.allvisitorMonth();
				this.totalmacVisitor$ = this.settingService.macvisitorMonth();
				this.totalandroidVisitor$ = this.settingService.androidvisitorMonth();
				this.totalwindowsVisitor$ = this.settingService.windowsvisitorMonth();
				this.totaliosVisitor$ = this.settingService.iosvisitorMonth();
				this.totalanotherVisitor$ = this.settingService.othervisitorMonth();
				break;
			case 'lastmonth':
				this.desc = 'Last Month';
				this.totalallVisitor$ = this.settingService.allvisitorLastMonth();
				this.totalmacVisitor$ = this.settingService.macvisitorLastMonth();
				this.totalandroidVisitor$ = this.settingService.androidvisitorLastMonth();
				this.totalwindowsVisitor$ = this.settingService.windowsvisitorLastMonth();
				this.totaliosVisitor$ = this.settingService.iosvisitorLastMonth();
				this.totalanotherVisitor$ = this.settingService.othervisitorLastMonth();
				break;
			case 'custom':
				this.totalallVisitor$ = this.settingService.allvisitorToday();
				this.totalmacVisitor$ = this.settingService.macvisitorToday();
				this.totalandroidVisitor$ = this.settingService.androidvisitorToday();
				this.totalwindowsVisitor$ = this.settingService.windowsvisitorToday();
				this.totaliosVisitor$ = this.settingService.iosvisitorToday();
				this.totalanotherVisitor$ = this.settingService.othervisitorToday();
				break;
		}
		this.interval = setInterval(() => {
			// console.log(this.parameter);
			switch (this.parameter) {
				case 'today':
					this.desc = 'Today';
					this.totalallVisitor$ = this.settingService.allvisitorToday();
					this.totalmacVisitor$ = this.settingService.macvisitorToday();
					this.totalandroidVisitor$ = this.settingService.androidvisitorToday();
					this.totalwindowsVisitor$ = this.settingService.windowsvisitorToday();
					this.totaliosVisitor$ = this.settingService.iosvisitorToday();
					this.totalanotherVisitor$ = this.settingService.othervisitorToday();
					break;
				case 'week':
					this.desc = 'This Week';
					this.totalallVisitor$ = this.settingService.allvisitorToday();
					this.totalmacVisitor$ = this.settingService.macvisitorToday();
					this.totalandroidVisitor$ = this.settingService.androidvisitorToday();
					this.totalwindowsVisitor$ = this.settingService.windowsvisitorToday();
					this.totaliosVisitor$ = this.settingService.iosvisitorToday();
					this.totalanotherVisitor$ = this.settingService.othervisitorToday();
					break;
				case 'month':
					// console.log('Month');
					this.desc = 'This Month';
					this.totalallVisitor$ = this.settingService.allvisitorMonth();
					this.totalmacVisitor$ = this.settingService.macvisitorMonth();
					this.totalandroidVisitor$ = this.settingService.androidvisitorMonth();
					this.totalwindowsVisitor$ = this.settingService.windowsvisitorMonth();
					this.totaliosVisitor$ = this.settingService.iosvisitorMonth();
					this.totalanotherVisitor$ = this.settingService.othervisitorMonth();
					break;
				case 'lastmonth':
					this.desc = 'Last Month';
					this.totalallVisitor$ = this.settingService.allvisitorLastMonth();
					this.totalmacVisitor$ = this.settingService.macvisitorLastMonth();
					this.totalandroidVisitor$ = this.settingService.androidvisitorLastMonth();
					this.totalwindowsVisitor$ = this.settingService.windowsvisitorLastMonth();
					this.totaliosVisitor$ = this.settingService.iosvisitorLastMonth();
					this.totalanotherVisitor$ = this.settingService.othervisitorLastMonth();
					break;
				case 'custom':
					this.totalallVisitor$ = this.settingService.allvisitorToday();
					this.totalmacVisitor$ = this.settingService.macvisitorToday();
					this.totalandroidVisitor$ = this.settingService.androidvisitorToday();
					this.totalwindowsVisitor$ = this.settingService.windowsvisitorToday();
					this.totaliosVisitor$ = this.settingService.iosvisitorToday();
					this.totalanotherVisitor$ = this.settingService.othervisitorToday();
					break;
			}
			this.totalOrder$ = this.orderService.getTotalOrder();
		}, 2000);
		// console.log(this.parameter);
	}
}
