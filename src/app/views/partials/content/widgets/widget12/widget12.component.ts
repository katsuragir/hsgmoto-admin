// Angular
import { Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
// Layout config
import { LayoutConfigService } from '../../../../../core/_base/layout';
import { OrderService } from '../../../../../core/order';
import { Observable } from 'rxjs';
// Lodash
import { shuffle } from 'lodash';
import { SettingService } from '../../../../../core/auth';
import { DatePipe } from '@angular/common';

export interface Widget1Data {
	title: string;
	desc: string;
	value: string;
	valueClass?: string;
}

/**
 * Sample components with sample data
 */
@Component({
	selector: 'kt-widget12',
	templateUrl: './widget12.component.html',
	styleUrls: ['./widget12.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})
export class Widget12Component implements OnInit {

	// Public properties
	// @Input() data: { labels: string[], datasets: any[] };
	@Input() type: string = 'line';
	@ViewChild('chart', {static: true}) chart: ElementRef;
	totalAmount$: Observable<any>;
	totalAmountlastmonth$: Observable<any>;
	@Input() totalallVisitor$: any;
	@Input() totalmacVisitor$: any;
	@Input() totalandroidVisitor$: any;
	@Input() totalwindowsVisitor$: any;
	@Input() totalanotherVisitor$: any;
	@Input() totaliosVisitor$: any;
	interval: any;
	@Input() data: Widget1Data[];
	@Input() desc: any;
	date = new Date();
	month = new Date();
	lastmonst = this.date.setMonth(this.date.getMonth() - 1);

	/**
	 * Component constructor
	 * @param layoutConfigService
	 */
	constructor(
		private layoutConfigService: LayoutConfigService,
		private orderService: OrderService,
		private settingService: SettingService,
		private datePipe: DatePipe) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {

		this.totalAmount$ = this.orderService.getTotalAmount();
		this.totalAmountlastmonth$ = this.orderService.getTotalAmountLastMonth();
		this.interval = setInterval(() => {
			this.totalAmount$ = this.orderService.getTotalAmount();
			this.totalAmountlastmonth$ = this.orderService.getTotalAmountLastMonth();
		}, 2000);
		// this.totalAmount$.subscribe(res => { console.log(res); });
		if (!this.data) {
			this.data = shuffle([
				{
					title: 'Total Visitor',
					desc: 'Visitor of today',
					value: '+$17,800',
					valueClass: 'kt-font-brand'
				}, {
					title: 'Widows Visitor',
					desc: 'Visitor of today',
					value: '+$1,800',
					valueClass: 'kt-font-danger'
				}, {
					title: 'Android Visitor',
					desc: 'Visitor of today',
					value: '-27,49%',
					valueClass: 'kt-font-success'
				}, {
					title: 'iOS Visitor',
					desc: 'Visitor of today',
					value: '-27,49%',
					valueClass: 'kt-font-yellow'
				}, {
					title: 'Mac Visitor',
					desc: 'Visitor of today',
					value: '-27,49%',
					valueClass: 'kt-font-purple'
				}
			]);
		}
		// this.initChart();
	}
	/*
	getTotalAmount() {
		this.orderService.getTotalAmount().subscribe(
			result => {
				this.totalAmount = result.pendapatan;
				// console.log(this.totalAmount);
			}
		);
	}
	*/
	private initChart() {
		// For more information about the chartjs, visit this link
		// https://www.chartjs.org/docs/latest/getting-started/usage.html

		const chart = new Chart(this.chart.nativeElement, {
			type: this.type,
			data: this.data,
			options: {
				responsive: true,
				maintainAspectRatio: false,
				legend: false,
				scales: {
					xAxes: [{
						categoryPercentage: 0.35,
						barPercentage: 0.70,
						display: true,
						scaleLabel: {
							display: false,
							labelString: 'Month'
						},
						gridLines: false,
						ticks: {
							display: true,
							beginAtZero: true,
							fontColor: this.layoutConfigService.getConfig('colors.base.shape.3'),
							fontSize: 13,
							padding: 10
						}
					}],
					yAxes: [{
						categoryPercentage: 0.35,
						barPercentage: 0.70,
						display: true,
						scaleLabel: {
							display: false,
							labelString: 'Value'
						},
						gridLines: {
							color: this.layoutConfigService.getConfig('colors.base.shape.2'),
							drawBorder: false,
							offsetGridLines: false,
							drawTicks: false,
							borderDash: [3, 4],
							zeroLineWidth: 1,
							zeroLineColor: this.layoutConfigService.getConfig('colors.base.shape.2'),
							zeroLineBorderDash: [3, 4]
						},
						ticks: {
							max: 70,
							stepSize: 10,
							display: true,
							beginAtZero: true,
							fontColor: this.layoutConfigService.getConfig('colors.base.shape.3'),
							fontSize: 13,
							padding: 10
						}
					}]
				},
				title: {
					display: false
				},
				hover: {
					mode: 'index'
				},
				tooltips: {
					enabled: true,
					intersect: false,
					mode: 'nearest',
					bodySpacing: 5,
					yPadding: 10,
					xPadding: 10,
					caretPadding: 0,
					displayColors: false,
					backgroundColor: this.layoutConfigService.getConfig('colors.state.brand'),
					titleFontColor: '#ffffff',
					cornerRadius: 4,
					footerSpacing: 0,
					titleSpacing: 0
				},
				layout: {
					padding: {
						left: 0,
						right: 0,
						top: 5,
						bottom: 5
					}
				}
			}
		});
	}
}
