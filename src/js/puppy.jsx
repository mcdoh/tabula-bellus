import React from 'react';

export default class Puppy extends React.Component {
	constructor (props) {
		super(props);

		['getImageURL', 'loadImage', 'loadThumbnail']
		.map(method => this[method] = this[method].bind(this));

		this.state = {};
		this.state.image = new Image();
		this.state.imageLoaded = false;
		this.state.thumbnail = new Image();
		this.state.thumbnailLoaded = false;

		this.loadImage();
	}

	getImageURL () {
		return this.props.data.post_hint === 'image' ? this.props.data.url :
			this.props.data.preview.images[0].source.url;
	}

	loadImage () {
		this.state.image.addEventListener('load', event => {
			this.state.imageLoaded = true;
			this.forceUpdate();
		});

		let imageURL = this.getImageURL();

		this.state.image.src = imageURL;
	}

	loadThumbnail () {
		this.state.thumbnail.addEventListener('load', () => {
			this.state.thumbnailLoaded = true;
			this.forceUpdate();
		});

		this.state.thumbnail.src = this.props.data.thumbnail;
	}

	render () {

		let style = {
			width: '100%',
			height: '100vh',
			backgroundSize: 'cover',
			backgroundImage: `url(${ this.props.data.preview.images[0].source.url || this.state.image.src })`
		};

		console.log(this.props.data.title);
		return (
			<div className="puppy" style={style}>
				<h1 className="puppy-title">{this.props.data.title}</h1>
			</div>
		);
	}
}
