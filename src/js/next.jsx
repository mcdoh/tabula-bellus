import React from 'react';
import Puppy from './puppy.jsx';

import {ONE_SECOND, getThumbnailURL} from './tools.js';

const THE_DARKNESS = 0.25;

export default class Next extends Puppy {
	constructor (props) {
		super(props);
	}

	render () {

		let primaryStyle = {
			zIndex: 3,
			[this.props.side]: '1vh',
			opacity: this.state.nextImage ? 0 : 1,
			backgroundImage: `linear-gradient( rgba(0,0,0, ${ THE_DARKNESS }), rgba(0,0,0, ${ THE_DARKNESS }) ), url(${ getThumbnailURL(this.state.primary) })`,
			transition: `opacity ${this.props.transitionTime/ONE_SECOND}s ease-in-out`
		};

		let nextNextStyle = {
			zIndex: 2,
			[this.props.side]: '1vh',
			backgroundImage: `linear-gradient( rgba(0,0,0, ${ THE_DARKNESS }), rgba(0,0,0, ${ THE_DARKNESS }) ), url(${ getThumbnailURL(this.state.nextImage || this.state.primary) })`,
			transition: `opacity ${this.props.transitionTime/ONE_SECOND}s ease-in-out`
		};

		let primary = <div className="next" style={primaryStyle} onClick={this.props.clickHandler} />;
		let nextNext = <div className="next" style={nextNextStyle} onClick={this.props.clickHandler} />;

		// we render 'primary' twice if there is no 'nextImage'
		// otherwise when 'nextImage' becomes primary there's the css transition opacity rule
		// as primary goes from `opacity: 0` on the previous image to `opacity: 1` it causes a weird flash
		// this way the flash still happens, you just can't see it as you're seeing through to the same image
		return (
			<div>{primary}{nextNext}</div>
		);
	}
}
