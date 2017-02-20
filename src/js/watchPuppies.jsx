import React from 'react';

import Puppy from './puppy.jsx';
import Runt from './runt.jsx';
import Next from './next.jsx';

const ONE_SECOND = 1000;
const TRANSITION_TIME = 2 * ONE_SECOND;
const UPDATE_INTERVAL = 30 * ONE_SECOND;

const SNOOPY = 'snoopy';
const SCOOBY = 'scooby';

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
			primary: SNOOPY,
			onDeck: SCOOBY,
			showHUD: true
		};

		this.nextImage = new Image();

		['toggleBackgroundSize', 'toggleHUD', 'swapPrimary', 'loadNext', 'updateIndex']
		.map(method => this[method] = this[method].bind(this));

		console.log('state', this.state);
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

	toggleBackgroundSize () {
		this.setState({backgroundSize: this.state.backgroundSize === 'cover' ? 'contain' : 'cover'});
	}

	toggleHUD () {
		this.setState({showHUD: !this.state.showHUD});
	}

	swapPrimary () {
		this.setState({
			onDeck: this.state.primary,
			primary: this.state.onDeck,
			transitioning: false
		});
	}

	loadNext (index) {
		let nextImageLoaded = event => {
			this.setState({index, transitioning: true});
			this.nextImage.removeEventListener('load', nextImageLoaded);

			this.updateTO = setTimeout(this.updateIndex, UPDATE_INTERVAL);
			this.transitionTO = setTimeout(this.swapPrimary, TRANSITION_TIME);
		};

		this.nextImage.addEventListener('load', nextImageLoaded);

		this.nextImage.src = this.getImageURL(this.state.puppies[index.main]);
	}

	updateIndex (increase = true) {
		clearTimeout(this.updateTO);
		clearTimeout(this.transitionTO);

		let index = this.state.index;

		if (increase) {
			index.left = index.main;
			index.main = index.right;
			index.right++;
			index.right = index.right >= this.state.puppies.length ? 0 : index.right;
		}
		else {
			index.right = index.main;
			index.main = index.left;
			index.left--;
			index.left = index.left < 0 ? this.state.puppies.length - 1 : index.left;
		}

		index[this.state.onDeck] = index.main;

		this.loadNext(index);
	}

	render () {
		if (this.state.puppies && this.state.index) {
			let snoopy = this.state.index.snoopy !== undefined ? <Puppy
				data={this.state.puppies[this.state.index.snoopy]}
				backgroundSize={this.state.backgroundSize}
				primary={this.state.primary === SNOOPY}
				transitioning={this.state.transitioning}
				clickHandler={this.toggleHUD} /> : null;

			let scooby = this.state.index.scooby !== undefined ? <Puppy
				data={this.state.puppies[this.state.index.scooby]}
				backgroundSize={this.state.backgroundSize}
				primary={this.state.primary === SCOOBY}
				transitioning={this.state.transitioning}
				clickHandler={this.toggleHUD} /> : null;

			if (this.state.showHUD) {
				let title = <h1 className="puppy-title">{this.state.puppies[this.state.index.main].title}</h1>;
				let runt = <Runt data={this.state.puppies[this.state.index.main]} clickHandler={this.toggleBackgroundSize} />;
				let prev = <Next data={this.state.puppies[this.state.index.left]} side="left" clickHandler={this.updateIndex.bind(this, false)} />;
				let next = <Next data={this.state.puppies[this.state.index.right]} side="right" clickHandler={this.updateIndex.bind(this, true)} />;

				return (
					<div>{snoopy}{scooby}{title}{prev}{next}{runt}</div>
				);
			}
			else {
				return (
					<div>{snoopy}{scooby}</div>
				);
			}
		}
		else {
			return <div />;
		}
	}
}

export default WatchPuppies;
