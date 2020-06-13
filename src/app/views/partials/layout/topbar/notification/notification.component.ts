// Angular
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NotifService } from '../../../../../core/order';
import { Router } from '@angular/router';
import { ThrowStmt } from '@angular/compiler';
import { interval, Observable } from 'rxjs';

@Component({
	selector: 'kt-notification',
	templateUrl: './notification.component.html',
	styleUrls: ['notification.component.scss']
})
export class NotificationComponent implements OnInit {

	newcheckoutNotif$: Observable<any>;
	newconfirmNotif$: Observable<number>;
	totalNotif: number;
	interval: any;

	// Show dot on top of the icon
	@Input() dot: string;

	// Show pulse on icon
	@Input() pulse: boolean;

	@Input() pulseLight: boolean;

	// Set icon class name
	@Input() icon: string = 'flaticon2-bell-alarm-symbol';
	@Input() iconType: '' | 'success';

	// Set true to icon as SVG or false as icon class
	@Input() useSVG: boolean;

	// Set bg image path
	@Input() bgImage: string;

	// Set skin color, default to light
	@Input() skin: 'light' | 'dark' = 'light';

	@Input() type: 'brand' | 'success' = 'success';
	loadData = false;

	/**
	 * Component constructor
	 *
	 * @param sanitizer: DomSanitizer
	 */
	constructor(
		private sanitizer: DomSanitizer,
		private notifService: NotifService,
		private router: Router) {	}

	ngOnInit() {
		this.newcheckoutNotif$ = this.notifService.getAllCheckoutNotif();
		this.interval = setInterval(() => {
			this.newcheckoutNotif$ = this.notifService.getAllCheckoutNotif();
		}, 2000);
		// this.newcheckoutNotif$.subscribe( res => { console.log(res); });
	}

	refreshorderNotif() {
		this.notifService.getAllCheckoutNotif().subscribe(
			result => {
				// this.newcheckoutNotif$ = result;
				// console.log(this.newcheckoutNotif);
			}
		);
	}

	refreshconfirmNotif() {
		this.notifService.getAllConfirmNotif().subscribe(
			result => {
				this.newconfirmNotif$ = result;
				// console.log(this.newcheckoutNotif);
			}
		);
	}

	orderlist() {
		// console.log('hellow');
		this.router.navigate(['/vp-admin/order/orders']);

	}

	confirmlist() {
		// console.log('hellow');
		this.router.navigate(['/vp-admin/order/orders']);
	}

	backGroundStyle(): string {
		if (!this.bgImage) {
			return 'none';
		}

		return 'url(' + this.bgImage + ')';
	}
}
