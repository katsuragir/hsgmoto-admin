// Angular
import { Component, OnInit, Injectable } from '@angular/core';
// Layout
import { LayoutConfigService } from '../../../../core/_base/layout';
// Object-Path
import * as objectPath from 'object-path';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'kt-about',
	templateUrl: './about.component.html',
})
export class AboutDialogComponent implements OnInit {
	// Public properties
	today: number = Date.now();
	fluid: boolean;

	/**
	 * Component constructor
	 *
	 * @param layoutConfigService: LayouConfigService
	 */
	constructor(private layoutConfigService: LayoutConfigService, public activeModal: NgbActiveModal) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		const config = this.layoutConfigService.getConfig();

		// footer width fluid
		this.fluid = objectPath.get(config, 'footer.self.width') === 'fluid';
	}
}
