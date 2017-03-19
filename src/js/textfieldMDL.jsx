/* global componentHandler:true */

import {rand} from './tools.js';

import React from 'react';

class TextfieldMDL extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			id: props.id || rand(1000000),
			value: props.value,
			label: props.label
		};

		['onChange', 'submit', 'keyPress']
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

	submit (event) {
		this.props.update(event.target.value);
	}

	keyPress (event) {
		if (event.key === 'Enter') {
			this.submit(event);
		}
	}

	render () {
		let label = this.state.label ? <label className="mdl-textfield__label" htmlFor={this.state.id}>{this.state.label}</label> : null;

		return (
			<div
				ref={textfield => textfield ? (componentHandler.upgradeElement(textfield)) : null}
				className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
				<input
					type="text"
					id={this.state.id}
					className="mdl-textfield__input"
					value={this.state.value}
					onChange={this.onChange}
					onKeyPress={this.keyPress}
					onBlur={this.submit}
				/>
				{label}
			</div>
		);
	}
}

TextfieldMDL.propTypes = {
	id:      React.PropTypes.string,
	label:   React.PropTypes.string,
	update:  React.PropTypes.func.isRequired,
	value:   React.PropTypes.string
};

export default TextfieldMDL;

