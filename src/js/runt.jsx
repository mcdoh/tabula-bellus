import React from 'react';

export default class Runt extends React.Component {
	constructor (props) {
		super(props);

		['getImageURL']
		.map(method => this[method] = this[method].bind(this));
	}

	getImageURL (item) {
		return item.preview.images[0].resolutions[0].url.replace(/&amp;/g, '&');
	}

	render () {

		return (
			<div className="runt" onClick={this.props.clickHandler} >
				<img src={`${ this.getImageURL(this.props.data) }`} />
				<div className="runt-overlay" />
			</div>
		);
	}
}
