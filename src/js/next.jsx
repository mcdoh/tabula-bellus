import React from 'react';

export default class Next extends React.Component {
	constructor (props) {
		super(props);

		['getImageURL']
		.map(method => this[method] = this[method].bind(this));
	}

	getImageURL (item) {
		return item.preview.images[0].resolutions[0].url.replace(/&amp;/g, '&');
	}

	render () {

		let style = {
			[this.props.side]: '1vh',
			backgroundImage: `url(${ this.getImageURL(this.props.data) })`
		};

		return (
			<div className="next" style={style} onClick={this.props.clickHandler} >
				<div className="next-overlay" />
			</div>
		);
	}
}
