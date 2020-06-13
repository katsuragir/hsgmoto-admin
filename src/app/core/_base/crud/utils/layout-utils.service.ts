// Angular
import { Injectable } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
// Partials for CRUD
import { ActionNotificationComponent,
	DeleteEntityDialogComponent,
	FetchEntityDialogComponent,
	UpdateStatusDialogComponent,
	MessageEntityDialogComponent,
	CreateResiDialogComponent,
	ApproveOrderDialogComponent,
	AlertComponent,
	ChangeHPDialogComponent,
	AddDiscountDialogComponent,
	CancelEntityDialogComponent
} from '../../../../views/partials/content/crud';

export enum MessageType {
	Create,
	Read,
	Update,
	Delete
}

@Injectable()
export class LayoutUtilsService {
	/**
	 * Service constructor
	 *
	 * @param snackBar: MatSnackBar
	 * @param dialog: MatDialog
	 */
	constructor(private snackBar: MatSnackBar,
		private dialog: MatDialog) { }

	/**
	 * Showing (Mat-Snackbar) Notification
	 *
	 * @param message: string
	 * @param type: MessageType
	 * @param duration: number
	 * @param showCloseButton: boolean
	 * @param showUndoButton: boolean
	 * @param undoButtonDuration: number
	 * @param verticalPosition: 'top' | 'bottom' = 'top'
	 */
	showActionNotification(
		_message: string,
		_type: MessageType = MessageType.Create,
		_duration: number = 10000,
		_showCloseButton: boolean = true,
		_showUndoButton: boolean = false,
		// _undoButtonDuration: number = 3000,
		_verticalPosition: 'top' | 'bottom' = 'bottom'
	) {
		const _data = {
			message: _message,
			snackBar: this.snackBar,
			showCloseButton: _showCloseButton,
			// showUndoButton: _showUndoButton,
			// undoButtonDuration: _undoButtonDuration,
			verticalPosition: _verticalPosition,
			type: _type,
		};
		return this.snackBar.openFromComponent(ActionNotificationComponent, {
			duration: _duration,
			data: _data,
			verticalPosition: _verticalPosition
		});
	}

	/**
	 * Showing Confirmation (Mat-Dialog) before Entity Removing
	 *
	 * @param title: stirng
	 * @param description: stirng
	 * @param waitDesciption: string
	 */
	deleteElement(title: string = '', description: string = '', waitDesciption: string = '') {
		return this.dialog.open(DeleteEntityDialogComponent, {
			data: { title, description, waitDesciption },
			width: '440px'
		});
	}

	/**
	 * Showing Cancel (Mat-Dialog) before Entity Removing
	 *
	 * @param title: stirng
	 * @param description: stirng
	 * @param waitDesciption: string
	 */
	cancelElement(title: string = '', description: string = '', waitDesciption: string = '') {
		return this.dialog.open(CancelEntityDialogComponent, {
			data: { title, description, waitDesciption },
			width: '440px'
		});
	}

	/**
	 * Showing Add Discount Product (Mat-Dialog) before Entity Add
	 *
	 * @param title: stirng
	 * @param description: stirng
	 * @param waitDesciption: string
	 */
	addingElement(title: string = '', description: string = '', waitDesciption: string = '') {
		return this.dialog.open(AddDiscountDialogComponent, {
			data: { title, description, waitDesciption },
			width: '440px'
		});
	}

	/**
	 * Showing Confirmation (Mat-Dialog) before Entity Create
	 *
	 * @param title: stirng
	 * @param description: stirng
	 * @param waitDesciption: string
	 */
	CreteResiElement(title: string = '', description: string = '', waitDesciption: string = '', data) {
		return this.dialog.open(CreateResiDialogComponent, {
			data: { title, description, waitDesciption, data },
			width: '440px'
		});
	}

	/**
	 * Showing Confirmation (Mat-Dialog) before Entity Create
	 *
	 * @param title: stirng
	 * @param description: stirng
	 * @param waitDesciption: string
	 */
	ApproveorderElement(title: string = '', description: string = '', waitDesciption: string = '', update, flag) {
		return this.dialog.open(ApproveOrderDialogComponent, {
			data: { title, description, waitDesciption, update, flag },
			width: '440px'
		});
	}

	/**
	 * Showing Message (Mat-Dialog)
	 *
	 * @param title: stirng
	 * @param description: stirng
	 * @param waitDesciption: string
	 */
	MessageElement(title: string = '', description: string = '', waitDesciption: string = '') {
		return this.dialog.open(MessageEntityDialogComponent, {
			data: { title, description, waitDesciption },
			width: '440px'
		});
	}

	/**
	 * Change No HP (Mat-Dialog)
	 *
	 * @param title: stirng
	 * @param description: stirng
	 * @param waitDesciption: string
	 */
	ChangeElement(title: string = '', description: string = '', waitDesciption: string = '', data) {
		return this.dialog.open(ChangeHPDialogComponent, {
			data: { title, description, waitDesciption, data },
			width: '440px'
		});
	}
	/**
	 * Showing Fetching Window(Mat-Dialog)
	 *
	 * @param _data: any
	 */
	fetchElements(_data) {
		return this.dialog.open(FetchEntityDialogComponent, {
			data: _data,
			width: '400px'
		});
	}

	/**
	 * Showing Update Status for Entites Window
	 *
	 * @param title: string
	 * @param statuses: string[]
	 * @param messages: string[]
	 */
	updateStatusForEntities(title, statuses, messages) {
		return this.dialog.open(UpdateStatusDialogComponent, {
			data: { title, statuses, messages },
			width: '480px'
		});
	}
}
