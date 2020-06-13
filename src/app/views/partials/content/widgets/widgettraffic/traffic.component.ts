// Angular
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
// Layout config
import { LayoutConfigService } from '../../../../../core/_base/layout';
import { OrderService } from '../../../../../core/order';
import { Observable } from 'rxjs';

/**
 * Sample components with sample data
 */
@Component({
	selector: 'kt-traffic',
	templateUrl: './traffic.component.html',
	styleUrls: ['./traffic.component.scss']
})
export class TrafficComponent implements OnInit {

	// Public properties
	@Input() data: { labels: string[], datasets: any[] };
	@Input() type: string = 'line';
	@ViewChild('chart', {static: true}) chart: ElementRef;
	totalAmount$: Observable<any>;
	interval: any;

	/**
	 * Component constructor
	 * @param layoutConfigService
	 */
	constructor(private layoutConfigService: LayoutConfigService, private orderService: OrderService) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {

		this.totalAmount$ = this.orderService.getTotalAmount();
		this.interval = setInterval(() => {
			this.totalAmount$ = this.orderService.getTotalAmount();
		}, 2000);
		// this.totalAmount$.subscribe(res => { console.log(res); });
		let date = new Date();
		let months = [];
		const montNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		for (let i = 0; i < 12; i++) {
			months.push(montNames[date.getMonth()] + '' + date.getFullYear());

			date.setMonth(date.getMonth() - 1);
		}
		console.log(months);
		if (!this.data) {
			const color = Chart.helpers.color;
			this.data = {
				labels: ['1 Jan', '2 Jan', '3 Jan', '4 Jan', '5 Jan', '6 Jan', '7 Jan'],
				datasets: [
					{
						fill: true,
						// borderWidth: 0,
						backgroundColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0.6).rgbString(),
						borderColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0).rgbString(),

						pointHoverRadius: 4,
						pointHoverBorderWidth: 12,
						pointBackgroundColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointHoverBackgroundColor: this.layoutConfigService.getConfig('colors.state.brand'),
						pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),

						data: [20, 40, 50, 25, 35, 60, 30]
					},
					{
						fill: true,
						// borderWidth: 0,
						backgroundColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0.2).rgbString(),
						borderColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0).rgbString(),

						pointHoverRadius: 4,
						pointHoverBorderWidth: 12,
						pointBackgroundColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointHoverBackgroundColor: this.layoutConfigService.getConfig('colors.state.brand'),
						pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),

						data: [25, 45, 55, 30, 100, 65, 35]
					}
				]
			};
		}
		this.initChart();
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
							max: 100,
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
