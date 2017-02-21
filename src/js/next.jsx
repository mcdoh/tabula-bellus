import React from 'react';
import Puppy from './puppy.jsx';

import {ONE_SECOND, getThumbnailURL} from './tools.js';

export default class Next extends Puppy {
	constructor (props) {
		super(props);
		this.getImageURL = getThumbnailURL;
	}

	render () {

		let primaryStyle = {
			zIndex: 3,
			[this.props.side]: '1vh',
			opacity: this.state.nextImage ? 0 : 1,
			boxShadow: `0 0 9px 3px rgba(0,0,0, ${ this.props.theDarkness })`,
			backgroundImage: `linear-gradient( rgba(0,0,0, ${ this.props.theDarkness }), rgba(0,0,0, ${ this.props.theDarkness }) ), url(${ getThumbnailURL(this.state.primary) })`,
			transition: `opacity ${ this.props.transitionTime / ONE_SECOND }s ease-in-out`
		};

		let nextNextStyle = {
			zIndex: 2,
			[this.props.side]: '1vh',
			boxShadow: `0 0 9px 3px rgba(0,0,0, ${ this.props.theDarkness })`,
			backgroundImage: `linear-gradient( rgba(0,0,0, ${ this.props.theDarkness }), rgba(0,0,0, ${ this.props.theDarkness }) ), url(${ getThumbnailURL(this.state.nextImage || this.state.primary) })`,
			transition: `opacity ${ this.props.transitionTime / ONE_SECOND }s ease-in-out`
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
