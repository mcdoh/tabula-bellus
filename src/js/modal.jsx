/* global componentHandler:true */

import React from 'react';

class Modal extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			show: props.show,
			source: props.source,
			value: ''
		};

		['onSourceChange', 'handleChange', 'handleSubmit']
		.map(method => this[method] = this[method].bind(this));
	}

	componentDidMount () {
		componentHandler.upgradeDom();
	}

	onSourceChange (event) {
		this.setState({source: event.target.value});
	}

	handleChange (event) {
		this.setState({value: event.target.value});
	}

	handleSubmit (event) {
		event.preventDefault();
	}

	render () {
		return (
			<dialog id="dialog" className="mdl-dialog settings-modal" open={this.props.show}>
				<h3 className="mdl-dialog__title">Settings</h3>
				<div className="mdl-dialog__content">
					<p>
						This is an example of the Material Design Lite dialog component.
						Please use responsibly.
					</p>
					<form action="#">
						<div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
							<input
								type="text"
								id="settings-source"
								className="mdl-textfield__input"
								value={this.state.source}
								onChange={this.onSourceChange}
								onBlur={this.handleSubmit}
							/>
							<label className="mdl-textfield__label" htmlFor="settings-source">Source...</label>
						</div>
					</form>
				</div>
				<div className="mdl-dialog__actions">
					<button
						type="button"
						className="mdl-button mdl-js-button mdl-js-ripple-effect"
						onClick={this.props.onClick}>
						Close
					</button>
				</div>
			</dialog>
		);
	}
}

Modal.propTypes = {
	onClick: React.PropTypes.func.isRequired,
	show: React.PropTypes.bool.isRequired,
	source: React.PropTypes.string.isRequired
};

export default Modal;
