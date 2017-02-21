import React from 'react';
import {ONE_SECOND, loadImage, getImageURL} from './tools.js';

export default class Puppy extends React.Component {
	constructor (props) {
		super(props);

		['setPrimary', 'loadNext']
		.map(method => this[method] = this[method].bind(this));

		this.getImageURL = getImageURL;

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

	setPrimary () {
		this.setState({
			primary: this.state.nextImage,
			nextImage: null
		});
	}

	loadNext (imageJSON) {
		// use 'this.getImageURL' so extended classes can specify different function i.e. 'getThumbnailURL'
		loadImage(this.getImageURL(imageJSON))
		.then(imageURL => {
			if (this.props.onImageLoaded) this.props.onImageLoaded();
			this.transitionTO = setTimeout(this.setPrimary, this.props.transitionTime);

			this.setState({nextImage: imageJSON});
		})
		.catch(error => {
			// report that this image should be removed from list and next image loaded
			console.error(error);
		});
	}

	render () {

		let primaryStyle = {
			zIndex: 1,
			opacity: this.state.nextImage ? 0 : 1,
			backgroundSize: this.props.backgroundSize,
			backgroundImage: `url(${ getImageURL(this.state.primary) })`,
			transition: `opacity ${this.props.transitionTime/ONE_SECOND}s ease-in-out`
		};

		let nextImageStyle = {
			zIndex: 0,
			backgroundSize: this.props.backgroundSize,
			backgroundImage: `url(${ getImageURL(this.state.nextImage || this.state.primary) })`,
			transition: `opacity ${this.props.transitionTime/ONE_SECOND}s ease-in-out`
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
