/* global componentHandler:true */

import {rand} from './tools.js';

import React from 'react';

class TextfieldMDL extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			id: props.id || rand(1000000),
			value: props.value
		};

		['onChange', 'update', 'keyPress']
		.map(method => this[method] = this[method].bind(this));
	}

	componentWillReceiveProps (props) {
		if (props.value !== this.state.value) {
			this.setState({value: props.value});
		}
	}

// 	componentDidMount () {
// 		componentHandler.upgradeDom();
// 	}

	onChange (event) {
		this.setState({value: event.target.value});
	}

	update (event, submit = false) {
		this.props.update(event.target.value, submit);
	}

	keyPress (event) {
		if (event.key === 'Enter') {
			this.update(event, true);
		}
	}

	render () {
		let label = this.props.label ? <label className="mdl-textfield__label" htmlFor={this.state.id}>{this.props.label}</label> : null;
		let error = this.props.error ? <span className="mdl-textfield__error">{this.props.error}</span> : null;

		return (
			<div
				ref={textfield => textfield ? (componentHandler.upgradeElement(textfield)) : null}
				className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
				<input
					type="text"
					id={this.state.id}
					className="mdl-textfield__input"
					value={this.state.value}
					pattern={this.props.pattern}
					onChange={this.onChange}
					onKeyPress={this.keyPress}
					onBlur={this.update}
				/>
				{label}
				{error}
			</div>
		);
	}
}

TextfieldMDL.propTypes = {
	id:      React.PropTypes.string,
	error:   React.PropTypes.string,
	label:   React.PropTypes.string,
	pattern: React.PropTypes.string,
	update:  React.PropTypes.func.isRequired,
	value:   React.PropTypes.string
};

export default TextfieldMDL;

