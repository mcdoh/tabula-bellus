import React from 'react';

import Puppy from './puppy.jsx';
import Runt from './runt.jsx';
import Next from './next.jsx';

const ONE_SECOND = 1000;
const TRANSITION_TIME = 2 * ONE_SECOND;
const UPDATE_INTERVAL = 30 * ONE_SECOND;

function urlTemplate (source) {
	return `https://www.reddit.com/r/${ source }.json`;
}

function rand (min, max) {
	if (max == null) {
		max = min;
		min = 0;
	}

	return min + Math.floor(Math.random() * (max - min + 1));
}

class WatchPuppies extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			backgroundSize: 'cover',
			showHUD: true
		};

		['increment', 'decrement', 'toggleBackgroundSize', 'toggleHUD', 'updateIndex', 'setUpdateTimeout']
		.map(method => this[method] = this[method].bind(this));
	}

	componentDidMount () {
		fetch(urlTemplate(this.props.source))
		.then(response => {
			let contentType = response.headers.get('content-type');
			if (contentType && contentType.indexOf('application/json') !== -1) {
				return response.json();
			}
		})
		.then(json => {
			this.parseData(json);
			this.updateTO = setTimeout(this.updateIndex, UPDATE_INTERVAL);
		})
		.catch(error => console.error);
	}

	parseData (data) {
		console.log(data);

		let puppies = data.data.children
		.map(child => child.data)
		.filter(child => (child.post_hint === 'link' || child.post_hint === 'image') && !(child.is_self || child.locked || child.stickied));

		let i = rand(0, puppies.length);
		let index = {
			left: i - 1,
			main: i,
			right: i + 1
		};
		index.left = index.left < 0 ? puppies.length - 1 : index.left;
		index.right = index.right >= puppies.length ? 0 : index.right;
		index.snoopy = index.main;

		console.log(puppies);
		this.setState({index, puppies});
	}

	getImageURL (item) {
		return item.preview.images[0].source.url.replace(/&amp;/g, '&');
	}

	getThumbnailURL (item) {
		return item.preview.images[0].resolutions[0].url.replace(/&amp;/g, '&')
	}

	increment (index) {
		return ++index === this.state.puppies.length ? 0 : index;
	}

	decrement (index) {
		return --index < 0 ? this.state.puppies.length - 1 : index;
	}

	toggleBackgroundSize () {
		this.setState({backgroundSize: this.state.backgroundSize === 'cover' ? 'contain' : 'cover'});
	}

	toggleHUD () {
		this.setState({showHUD: !this.state.showHUD});
	}

	preloadThumbnails () {
		let nextLeft = new Image();
		let nextRight = new Image();

		nextLeft.src = this.getThumbnailURL(this.state.puppies[this.decrement(this.state.index.left)]);
		nextRight.src = this.getThumbnailURL(this.state.puppies[this.increment(this.state.index.right)]);
	}

	updateIndex (increase = true) {
		clearTimeout(this.updateTO);
		let index = this.state.index;

		if (increase) {
			index.left = index.main;
			index.main = index.right;
			index.right = this.increment(index.right);
		}
		else {
			index.right = index.main;
			index.main = index.left;
			index.left = this.decrement(index.left);
		}

		this.setState({index});
	}

	setUpdateTimeout () {
		this.updateTO = setTimeout(this.updateIndex, UPDATE_INTERVAL);
		this.preloadThumbnails();
	}

	render () {
		if (this.state.puppies && this.state.index) {
			let puppy = <Puppy
				data={this.state.puppies[this.state.index.main]}
				backgroundSize={this.state.backgroundSize}
				transitionTime={TRANSITION_TIME}
				onImageLoaded={this.setUpdateTimeout}
				clickHandler={this.toggleHUD} />;

			if (this.state.showHUD) {
				let title = <h1 className="puppy-title">{this.state.puppies[this.state.index.main].title}</h1>;
				let runt = <Runt data={this.state.puppies[this.state.index.main]} clickHandler={this.toggleBackgroundSize} />;
				let prev = <Next data={this.state.puppies[this.state.index.left]} side="left" clickHandler={this.updateIndex.bind(this, false)} />;
				let next = <Next data={this.state.puppies[this.state.index.right]} side="right" clickHandler={this.updateIndex.bind(this, true)} />;

				return (
					<div>{puppy}{title}{prev}{next}{runt}</div>
				);
			}
			else {
				return (
					<div>{puppy}</div>
				);
			}
		}
		else {
			return <div />;
		}
	}
}

export default WatchPuppies;
