/* global componentHandler:true */

import React from 'react';

import BufferImage from './bufferImage.jsx';
import BufferThumbnail from './bufferThumbnail.jsx';
import BufferNext from './bufferNext.jsx';

import ModalMDL from './modalMDL.jsx';
import SwitchMDL from './switchMDL.jsx';
import TextfieldMDL from './textfieldMDL.jsx';

import LocalDB from './localDB.js';

import {ONE_SECOND, decrement, getThumbnailURL, increment, loadImage, notEmpty, rand} from './tools.js';

const TRIM_TITLE = /\s*(\[.*?\]|\(.*?\))\s*/g;
const THE_DARKNESS = 0.25;

const DEFAULT_STATE = {
	backgroundSize: 'cover',
	showHUD: true,
	showPrevNext: true,
	showThumbnail: true,
	showSettings: false,
	showTitle: true,
	source: 'earthporn',
	transitionTime: 2,
	trimTitle: true,
	imageTime: 30
};

function urlTemplate (source) {
	return `https://www.reddit.com/r/${ source }.json`;
}

class TabulaBellus extends React.Component {
	constructor (props) {
		super(props);

		this.state = {};

		[
			'fetchData',
			'parseData',

			'toggleHUD',
			'toggleSettings',
			'toggleBackgroundSize',
			'updateSource',
			'updateImageTime',
			'toggleShowPrevNext',
			'toggleShowThumbnail',
			'toggleShowTitle',
			'toggleTrimTitle',

			'preloadThumbnails',
			'updateIndex',
			'setUpdateTimeout'
		].map(method => this[method] = this[method].bind(this));

		this.db = new LocalDB({
			db: 'tabulaBellus',
			version: 1,
			stores: [{
				name: 'settings',
				key: {autoIncrement: true},
				upgrade: data => {
					return Object.assign({}, DEFAULT_STATE, data);
				}
			}],
			ready: () => {
				this.db.getData('settings', settings => {
					this.setState(settings, this.fetchData);
				});
			}
		});
	}

	fetchData (source = this.state.source) {
		fetch(urlTemplate(source))
		.then(response => {
			let contentType = response.headers.get('content-type');
			if (contentType && contentType.indexOf('application/json') !== -1) {
				this.setState({newSource: source});
				return response.json();
			}
		})
		.then(this.parseData)
		.catch(console.error);
	}

	parseData (data) {

		let posts = data.data.children
		.map(child => child.data)
		.filter(child => child.post_hint && (child.post_hint === 'link' || child.post_hint === 'image') && !(child.is_self || child.locked || child.stickied));

		if (posts.length) {
			let i = rand(0, posts.length);
			let index = {
				main: i,
				left: decrement(i, posts),
				right: increment(i, posts)
			};

			this.setState({
				index,
				posts,
				source: this.state.newSource
			}, () => {
				this.db.storeData('settings', {source: this.state.source});
				this.setUpdateTimeout();
			});
		}
	}

	toggleBackgroundSize () {
		this.setState({
			backgroundSize: this.state.backgroundSize === 'cover' ? 'contain' : 'cover'
		}, () => this.db.storeData('settings', {
			backgroundSize: this.state.backgroundSize
		}));
	}

	toggleHUD () {
		if (this.state.showSettings) {
			this.toggleSettings();
		}
		else {
			this.setState({
				showHUD: !this.state.showHUD
			}, () => this.db.storeData('settings', {
				showHUD: this.state.showHUD
			}));
		}
	}

	toggleSettings () {
		this.setState({showSettings: !this.state.showSettings});
	}

	updateSource (source, submit) {
		if (source !== this.state.source) {
			this.fetchData(source);
		}

		if (submit) this.toggleSettings();
	}

	updateImageTime (imageTime, submit) {
		imageTime = parseInt(imageTime);
		if (imageTime) {
			this.setState({imageTime}, () => {
				this.db.storeData('settings', {imageTime: this.state.imageTime});
				this.setUpdateTimeout();
			});
		}

		if (submit) this.toggleSettings();
	}

	toggleShowPrevNext () {
		this.setState({
			showPrevNext: !this.state.showPrevNext
		}, () => this.db.storeData('settings', {
			showPrevNext: this.state.showPrevNext
		}));
	}

	toggleShowThumbnail () {
		this.setState({
			showThumbnail: !this.state.showThumbnail
		}, () => this.db.storeData('settings', {
			showThumbnail: this.state.showThumbnail
		}));
	}

	toggleShowTitle () {
		this.setState({
			showTitle: !this.state.showTitle
		}, () => this.db.storeData('settings', {
			showTitle: this.state.showTitle
		}));
	}

	toggleTrimTitle () {
		this.setState({
			trimTitle: !this.state.trimTitle
		}, () => this.db.storeData('settings', {
			trimTitle: this.state.trimTitle
		}));
	}

	preloadThumbnails () {
		let nextLeft = this.state.posts[decrement(this.state.index.left, this.state.posts)];
		let nextRight = this.state.posts[increment(this.state.index.right, this.state.posts)];

		loadImage(getThumbnailURL(nextLeft));
		loadImage(getThumbnailURL(nextRight));
	}

	updateIndex (increase = true) {
		clearTimeout(this.updateTO);
		let index = this.state.index;

		if (increase) {
			index.left = index.main;
			index.main = index.right;
			index.right = increment(index.right, this.state.posts);
		}
		else {
			index.right = index.main;
			index.main = index.left;
			index.left = decrement(index.left, this.state.posts);
		}

		this.setState({index});
	}

	setUpdateTimeout () {
		clearTimeout(this.updateTO);
		this.updateTO = setTimeout(this.updateIndex, this.state.imageTime * ONE_SECOND);
		this.preloadThumbnails();
	}

	render () {
		if (this.state && notEmpty(this.state.posts)) {
			let settingsToggle = <button
				ref={button => button ? (componentHandler.upgradeElement(button)) : null}
				className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon settings-toggle"
				onClick={this.toggleSettings} >
				<i className="material-icons">more_vert</i>
				</button>;

			let sourceTextfield = <TextfieldMDL
				key="textfield-source"
				id="textfield-source"
				label="Source..."
				value={this.state.source}
				update={this.updateSource}
			/>;

			let imageTimeTextfield = <TextfieldMDL
				key="textfield-image-time"
				id="textfield-image-time"
				label="Image Time..."
				pattern="\d+"
				error="Please enter a number in seconds"
				value={String(this.state.imageTime)}
				update={this.updateImageTime}
			/>;

			let prevNextSwitch = <SwitchMDL
				key="switch-prev-next"
				id="switch-prev-next"
				label="Show Prev/Next"
				checked={this.state.showPrevNext}
				toggle={this.toggleShowPrevNext}
			/>;

			let thumbnailSwitch = <SwitchMDL
				key="switch-thumbnail"
				id="switch-thumbnail"
				label="Show Thumbnail"
				checked={this.state.showThumbnail}
				toggle={this.toggleShowThumbnail}
			/>;

			let titleSwitch = <SwitchMDL
				key="switch-title"
				id="switch-title"
				label="Show Title"
				checked={this.state.showTitle}
				toggle={this.toggleShowTitle}
			/>;

			let trimTitleSwitch = <SwitchMDL
				key="switch-trim-title"
				id="switch-trim-title"
				label="Trim Title"
				checked={this.state.trimTitle}
				toggle={this.toggleTrimTitle}
			/>;

			let settings = <ModalMDL
				id="dialog"
				show={this.state.showSettings}
				children={[sourceTextfield, imageTimeTextfield, prevNextSwitch, thumbnailSwitch, titleSwitch, trimTitleSwitch]}
				onSubmit={this.toggleSettings}
			/>;

			if (this.state.posts && this.state.index && this.state.posts[this.state.index.main]) {

				let bufferImage = <BufferImage
					data={this.state.posts[this.state.index.main]}
					backgroundSize={this.state.backgroundSize}
					transitionTime={this.state.transitionTime * ONE_SECOND}
					onImageLoaded={this.setUpdateTimeout}
					clickHandler={this.toggleHUD} />;

				if (this.state.showHUD) {
					let title = this.state.posts[this.state.index.main].title ? this.state.trimTitle ? this.state.posts[this.state.index.main].title.replace(TRIM_TITLE, '') :
						this.state.posts[this.state.index.main].title :
						'';

					title = this.state.showTitle ? <h2 className="tabula-bellus-title">{title}</h2> : null;

					let bufferThumbnail = this.state.showThumbnail ? <BufferThumbnail
						data={this.state.posts[this.state.index.main]}
						theDarkness={THE_DARKNESS}
						transitionTime={this.state.transitionTime * ONE_SECOND / 2}
						clickHandler={this.toggleBackgroundSize}
						/> : null;

					let prev = this.state.showPrevNext ? <BufferNext
						data={this.state.posts[this.state.index.left]}
						side="left"
						theDarkness={THE_DARKNESS}
						transitionTime={this.state.transitionTime * ONE_SECOND}
						clickHandler={this.updateIndex.bind(this, false)}
						/> : null;

					let next = this.state.showPrevNext ? <BufferNext
						data={this.state.posts[this.state.index.right]}
						side="right"
						theDarkness={THE_DARKNESS}
						transitionTime={this.state.transitionTime * ONE_SECOND}
						clickHandler={this.updateIndex.bind(this, true)}
						/> : null;

					let hud = <div className="hud">{settingsToggle}{settings}{title}{prev}{next}{bufferThumbnail}</div>;

					return (
						<div>{bufferImage}{hud}</div>
					);
				}
				else {
					return (
						<div>{bufferImage}</div>
					);
				}
			}
			else {
				return (
					<div>
						{settingsToggle}
						{settings}
					</div>
				);
// 						<div ref={spinner => spinner ? (componentHandler.upgradeElement(spinner)) : null} className="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>
			}
		}
		else {
			return <div/>;
		}
// 			return <div ref={spinner => spinner ? (componentHandler.upgradeElement(spinner)) : null} className="mdl-spinner mdl-js-spinner is-active"></div>;
	}
}

TabulaBellus.propTypes = {
	source:         React.PropTypes.string,
	backgroundSize: React.PropTypes.string,
	showHUD:        React.PropTypes.bool,
	trimTitle:      React.PropTypes.bool
};

export default TabulaBellus;
