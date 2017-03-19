/* global componentHandler:true */

import {rand} from './tools.js';

import React from 'react';

class SwitchMDL extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			id: props.id || rand(1000000),
			checked: props.checked,
			label: props.label
		};
	}

// 	componentDidMount () {
// 		componentHandler.upgradeDom();
// 	}

	render () {
		let label = this.state.label ? <span className="mdl-switch__label">{this.state.label}</span> : null;

		return (
			<label
				ref={checkbox => checkbox ? (componentHandler.upgradeElement(checkbox)) : null}
				className="mdl-switch mdl-js-switch mdl-js-ripple-effect"
				htmlFor={this.state.id}>
				<input
					type="checkbox"
					id={this.state.id}
					className="mdl-switch__input"
					checked={this.props.checked}
					onChange={this.props.toggle}
				/>
				{label}
			</label>
		);
	}
}

SwitchMDL.propTypes = {
	id:      React.PropTypes.string,
	checked: React.PropTypes.bool.isRequired,
	label:   React.PropTypes.string,
	toggle: React.PropTypes.func.isRequired
};

export default SwitchMDL;
