// Angular
import { Component, Output, EventEmitter, OnInit } from '@angular/core';

/**
 * Sample context menu dropdown
 */
@Component({
	selector: 'kt-traffic-menu',
	templateUrl: './traffic-menu.component.html',
	styleUrls: ['./traffic-menu.component.scss']
})
export class TrafficMenuComponent {

	@Output() option = new EventEmitter();

	options(event) {
		// console.log(event);
		this.option.emit(event);
	}
}
