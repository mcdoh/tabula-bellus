import React from 'react';

export default class Puppy extends React.Component {
	constructor (props) {
		super(props);

		['getImageURL', 'setPrimary', 'loadNext']
		.map(method => this[method] = this[method].bind(this));

		this.imageLoader = new Image();

		this.state = {
			primary: this.props.data
		};
	}

	componentWillReceiveProps (newProps) {
		if (newProps.data.id !== this.props.data.id) {
			clearTimeout(this.transitionTO);
			this.loadNext(newProps.data);
		}
	}

	getImageURL (imageJSON) {
		return imageJSON.preview.images[0].source.url.replace(/&amp;/g, '&');
	}

	setPrimary () {
		this.setState({
			primary: this.state.nextImage,
			nextImage: null
		});
	}

	loadNext (imageJSON) {
		let nextImageLoaded = event => {
			this.imageLoader.removeEventListener('load', nextImageLoaded);

			this.props.onImageLoaded();
			this.transitionTO = setTimeout(this.setPrimary, this.props.transitionTime);

			this.setState({nextImage: imageJSON});
		};

		this.imageLoader.addEventListener('load', nextImageLoaded);
		this.imageLoader.src = this.getImageURL(imageJSON);
	}

	render () {

		let primaryStyle = {
			zIndex: 1,
			opacity: this.state.nextImage ? 0 : 1,
			backgroundSize: this.props.backgroundSize,
			backgroundImage: `url(${ this.getImageURL(this.state.primary) })`
		};

		let nextImageStyle = {
			zIndex: 0,
			backgroundSize: this.props.backgroundSize,
			backgroundImage: `url(${ this.getImageURL(this.state.nextImage || this.state.primary) })`
		};

		let primary = <div className="puppy" style={primaryStyle} onClick={this.props.clickHandler} />;
		let next = <div className="puppy" style={nextImageStyle} onClick={this.props.clickHandler} />;

		// we render 'primary' twice if there is no 'nextImage'
		// otherwise when 'nextImage' becomes primary there's the css transition opacity rule
		// as primary goes from `opacity: 0` on the previous image to `opacity: 1` it causes a weird flash
		// this way the flash still happens, you just can't see it as you're seeing through to the same image
		return (
			<div>{primary}{next}</div>
		);
	}
}
