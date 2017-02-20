import React from 'react';

export default class Puppy extends React.Component {
	constructor (props) {
		super(props);

		['getImageURL']
		.map(method => this[method] = this[method].bind(this));
	}

	getImageURL (item) {
		return item.preview.images[0].source.url.replace(/&amp;/g, '&');
	}

	render () {

		let style = {
			zIndex: this.props.primary ? 1 : 0,
			opacity: this.props.primary && this.props.transitioning ? 0 : 1,
			backgroundSize: this.props.backgroundSize,
			backgroundImage: `url(${ this.getImageURL(this.props.data) })`
		};

		return (
			<div className="puppy" style={style} onClick={this.props.clickHandler} />
		);
	}
}
