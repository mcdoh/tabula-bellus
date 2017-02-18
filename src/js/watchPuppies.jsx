import React from 'react';

import Puppy from './puppy.jsx';
import Runt from './runt.jsx';
import Next from './next.jsx';

const ONE_SECOND = 1000;
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

		this.nextImage = new Image();

		['toggleBackgroundSize', 'toggleHUD', 'loadNext', 'updateIndex']
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
			this.timeout = setTimeout(this.updateIndex, UPDATE_INTERVAL);
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

	loadNext (index) {
		let updateIndex = event => {
			this.setState({index, transitioning: false});
			this.nextImage.removeEventListener('load', updateIndex);
		};

		this.nextImage.addEventListener('load', updateIndex);

		this.nextImage.src = this.getImageURL(this.state.puppies[index.main]);
	}

	updateIndex (increase = true) {
		clearTimeout(this.timeout);

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

		this.loadNext(index);
		this.setState({
			nextIndex: index.main,
			transitioning: true
		});

		this.timeout = setTimeout(this.updateIndex, UPDATE_INTERVAL);
	}

	render () {
		if (this.state.puppies && this.state.index) {
			let puppy =  <Puppy data={this.state.puppies[this.state.index.main]} backgroundSize={this.state.backgroundSize} transitioning={this.state.transitioning} clickHandler={this.toggleHUD} />;
			let onDeck = this.state.transitioning ? <Puppy data={this.state.puppies[this.state.nextIndex]} backgroundSize={this.state.backgroundSize} /> : null;

			if (this.state.showHUD) {
				let title = <h1 className="puppy-title">{this.state.puppies[this.state.index.main].title}</h1>;
				let runt = <Runt data={this.state.puppies[this.state.index.main]} clickHandler={this.toggleBackgroundSize} />;
				let prev = <Next data={this.state.puppies[this.state.index.left]} side="left" clickHandler={this.updateIndex.bind(this, false)} />;
				let next = <Next data={this.state.puppies[this.state.index.right]} side="right" clickHandler={this.updateIndex.bind(this, true)} />;

				return (
					<div>{puppy}{onDeck}{title}{prev}{next}{runt}</div>
				);
			}
			else {
				return (
					<div>{puppy}{onDeck}</div>
				);
			}
		}
		else {
			return <div />;
		}
	}
}

export default WatchPuppies;
