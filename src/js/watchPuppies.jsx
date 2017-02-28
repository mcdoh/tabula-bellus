import React from 'react';

import Puppy from './puppy.jsx';
import Runt from './runt.jsx';
import Next from './next.jsx';

import Modal from './modal.jsx';

import {ONE_SECOND, loadImage, getThumbnailURL, increment, decrement, rand} from './tools.js';

const TRIM_TITLE = /\s*\[.*\]\s*/g;
const THE_DARKNESS = 0.25;
const TRANSITION_TIME = 2 * ONE_SECOND;
const UPDATE_INTERVAL = 30 * ONE_SECOND;

function urlTemplate (source) {
	return `https://www.reddit.com/r/${ source }.json`;
}

class WatchPuppies extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			backgroundSize: props.backgroundSize,
			showHUD: props.showHUD,
			trimTitle: props.trimTitle,
			showSettings: false
		};

		['toggleBackgroundSize', 'toggleHUD', 'toggleSettings', 'updateIndex', 'setUpdateTimeout']
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

		let puppies = data.data.children
		.map(child => child.data)
		.filter(child => (child.post_hint === 'link' || child.post_hint === 'image') && !(child.is_self || child.locked || child.stickied));

		let i = rand(0, puppies.length);
		let index = {
			main: i,
			left: decrement(i, puppies),
			right: increment(i, puppies)
		};

		this.setState({index, puppies});
	}

	toggleBackgroundSize () {
		this.setState({backgroundSize: this.state.backgroundSize === 'cover' ? 'contain' : 'cover'});
	}

	toggleHUD () {
		this.setState({showHUD: !this.state.showHUD});
	}

	toggleSettings () {
		this.setState({showSettings: !this.state.showSettings});
	}

	preloadThumbnails () {
		let nextLeft = this.state.puppies[decrement(this.state.index.left, this.state.puppies)];
		let nextRight = this.state.puppies[increment(this.state.index.right, this.state.puppies)];

		loadImage(getThumbnailURL(nextLeft));
		loadImage(getThumbnailURL(nextRight));
	}

	updateIndex (increase = true) {
		clearTimeout(this.updateTO);
		let index = this.state.index;

		if (increase) {
			index.left = index.main;
			index.main = index.right;
			index.right = increment(index.right, this.state.puppies);
		}
		else {
			index.right = index.main;
			index.main = index.left;
			index.left = decrement(index.left, this.state.puppies);
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
				let title = this.props.trimTitle ? this.state.puppies[this.state.index.main].title.replace(TRIM_TITLE, '') : this.state.puppies[this.state.index.main].title;
				title = <h1 className="puppy-title">{title}</h1>;

				let settingsToggle = <button
					className="mdl-button mdl-js-button mdl-button--icon settings-toggle"
					onClick={this.toggleSettings} >
					<i className="material-icons">more_vert</i>
				</button>;

				let settings = this.state.showSettings ? <Modal onClick={this.toggleSettings} /> : null;

				let runt = <Runt
					data={this.state.puppies[this.state.index.main]}
					theDarkness={THE_DARKNESS}
					transitionTime={TRANSITION_TIME / 2}
					clickHandler={this.toggleBackgroundSize} />;

				let prev = <Next
					data={this.state.puppies[this.state.index.left]}
					side="left"
					theDarkness={THE_DARKNESS}
					transitionTime={TRANSITION_TIME}
					clickHandler={this.updateIndex.bind(this, false)} />;

				let next = <Next
					data={this.state.puppies[this.state.index.right]}
					side="right"
					theDarkness={THE_DARKNESS}
					transitionTime={TRANSITION_TIME}
					clickHandler={this.updateIndex.bind(this, true)} />;

				return (
					<div>{puppy}{settingsToggle}{settings}{title}{prev}{next}{runt}</div>
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

WatchPuppies.propTypes = {
	source:         React.PropTypes.string.isRequired,
	backgroundSize: React.PropTypes.string,
	showHUD:        React.PropTypes.bool,
	trimTitle:      React.PropTypes.bool
};

export default WatchPuppies;
