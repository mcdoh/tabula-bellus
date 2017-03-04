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

		['sourceOnChange', 'sourceSubmit', 'sourceKeyPress']
		.map(method => this[method] = this[method].bind(this));
	}

	componentDidMount () {
		componentHandler.upgradeDom();
	}

	componentWillReceiveProps (props) {
		if (props.source !== this.state.source) {
			this.setState({source: props.source});
		}
	}

	sourceOnChange (event) {
		this.setState({source: event.target.value});
	}

	sourceSubmit (event) {
		this.props.updateSource(event.target.value);
	}

	sourceKeyPress (event) {
		if (event.key === 'Enter') {
			this.sourceSubmit(event);
			this.props.onSubmit();
		}
	}

	render () {
		return (
			<dialog id="dialog" className="mdl-dialog settings-modal" open={this.props.show}>
				<h3 className="mdl-dialog__title">Settings</h3>
				<div className="mdl-dialog__content">
					<div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
						<input
							type="text"
							id="settings-source"
							className="mdl-textfield__input"
							value={this.state.source}
							onChange={this.sourceOnChange}
							onKeyPress={this.sourceKeyPress}
							onBlur={this.sourceSubmit}
						/>
						<label className="mdl-textfield__label" htmlFor="settings-source">Source...</label>
					</div>
					<label className="mdl-switch mdl-js-switch mdl-js-ripple-effect" htmlFor="settings-show-title">
						<input
							type="checkbox"
							id="settings-show-title"
							className="mdl-switch__input"
							checked={this.state.showTitle}
							onChange={this.props.toggleShowTitle}
						/>
						<span className="mdl-switch__label">Show Title</span>
					</label>
				</div>
				<div className="mdl-dialog__actions">
					<button
						type="button"
						className="mdl-button mdl-js-button mdl-js-ripple-effect"
						onClick={this.props.onSubmit}>
						Close
					</button>
				</div>
			</dialog>
		);
	}
}

Modal.propTypes = {
	onSubmit:         React.PropTypes.func.isRequired,
	show:             React.PropTypes.bool.isRequired,
	source:           React.PropTypes.string.isRequired,
	updateSource:     React.PropTypes.func.isRequired,
	toggleShowTitle:  React.PropTypes.func.isRequired
};

export default Modal;
