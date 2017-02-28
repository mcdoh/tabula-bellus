import React from 'react';

class Modal extends React.Component {
	constructor (props) {
		super(props);
	}

	render () {
		return (
			<dialog id="dialog" className="mdl-dialog settings-modal" open>
				<h3 className="mdl-dialog__title">MDL Dialog</h3>
				<div className="mdl-dialog__content">
					<p>
						This is an example of the Material Design Lite dialog component.
						Please use responsibly.
					</p>
				</div>
				<div className="mdl-dialog__actions">
					<button type="button" className="mdl-button" onClick={this.props.onClick}>Close</button>
					<button type="button" className="mdl-button" onClick={this.props.onClick} disabled>Disabled action</button>
				</div>
			</dialog>
		);
	}
}

Modal.propTypes = {
	onClick: React.PropTypes.func.isRequired
};

export default Modal;
