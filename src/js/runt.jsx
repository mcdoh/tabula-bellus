import React from 'react';
import Puppy from './puppy.jsx';

import {ONE_SECOND, getThumbnailURL, isLandscape, aspectRatio} from './tools.js';

class Runt extends Puppy {
	constructor (props) {
		super(props);
		this.getImageURL = getThumbnailURL;
	}

	render () {

		let style = {
			opacity: this.state.nextImage ? 0 : 1,
			[isLandscape(this.state.primary) ? 'width' : 'height']: '10vh',
			[isLandscape(this.state.primary) ? 'height' : 'width']: `${ aspectRatio(this.state.primary) * 10 }vh`,
			boxShadow: `0 0 9px 3px rgba(0,0,0, ${ this.props.theDarkness })`,
			backgroundImage: `linear-gradient( rgba(0,0,0, ${ this.props.theDarkness }), rgba(0,0,0, ${ this.props.theDarkness }) ), url(${ getThumbnailURL(this.state.primary) })`,
			transition: `opacity ${ this.props.transitionTime / ONE_SECOND }s ease`
		};

		let runt = <div className="runt" style={style} onClick={this.props.clickHandler} />;

		return (
			<div>{runt}</div>
		);
	}
}

export default Runt;
