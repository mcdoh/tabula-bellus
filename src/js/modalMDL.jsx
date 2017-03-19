/* global componentHandler:true */

import React from 'react';

class ModalMDL extends React.Component {
	constructor (props) {
		super(props);
	}

	render () {
// 		let submitButton = this.props.submitButton ? (
// 			<div className="mdl-dialog__actions">
// 				<button
// 					type="button"
// 					className="mdl-button mdl-js-button mdl-js-ripple-effect"
// 					onClick={this.props.onSubmit}>
// 					Close
// 				</button>
// 			</div>
// 		) : null;

		return (
			<dialog
				id={this.props.id}
				ref={dialog => dialog ? (componentHandler.upgradeElement(dialog)) : null}
				className="mdl-dialog settings-modal"
				open={this.props.show}>
				<h3 className="mdl-dialog__title">Settings</h3>
				<div className="mdl-dialog__content">
					{this.props.children}
				</div>
			</dialog>
		);
	}
}

ModalMDL.propTypes = {
	id:       React.PropTypes.string,
	children: React.PropTypes.arrayOf(React.PropTypes.element),
	onSubmit: React.PropTypes.func.isRequired,
	show:     React.PropTypes.bool.isRequired
};

export default ModalMDL;
