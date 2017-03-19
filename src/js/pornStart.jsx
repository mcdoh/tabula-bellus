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

const TRIM_TITLE = /\s*(\[.*\]|\(.*\))\s*/g;
const THE_DARKNESS = 0.25;

const DEFAULT_STATE = {
	backgroundSize: 'cover',
	showHUD: true,
	showThumbnail: true,
	showSettings: false,
	showTitle: true,
	source: 'earthporn',
	transitionTime: 2 * ONE_SECOND,
	trimTitle: true,
	updateInterval: 30 * ONE_SECOND
};

function urlTemplate (source) {
	return `https://www.reddit.com/r/${ source }.json`;
}

class PornStart extends React.Component {
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
			'toggleShowThumbnail',
			'toggleShowTitle',
			'toggleTrimTitle',

			'preloadThumbnails',
			'updateIndex',
			'setUpdateTimeout'
		].map(method => this[method] = this[method].bind(this));

		this.db = new LocalDB({
			db: 'pornStart',
			version: 7,
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

		let porn = data.data.children
		.map(child => child.data)
		.filter(child => child.post_hint && (child.post_hint === 'link' || child.post_hint === 'image') && !(child.is_self || child.locked || child.stickied));

		if (porn.length) {
			let i = rand(0, porn.length);
			let index = {
				main: i,
				left: decrement(i, porn),
				right: increment(i, porn)
			};

			this.setState({
				index,
				porn,
				source: this.state.newSource
			}, () => this.db.storeData('settings', {
				source: this.state.source
			}));
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

	updateSource (source) {
		if (source !== this.state.source) {
			this.fetchData(source);
		}
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
		let nextLeft = this.state.porn[decrement(this.state.index.left, this.state.porn)];
		let nextRight = this.state.porn[increment(this.state.index.right, this.state.porn)];

		loadImage(getThumbnailURL(nextLeft));
		loadImage(getThumbnailURL(nextRight));
	}

	updateIndex (increase = true) {
		clearTimeout(this.updateTO);
		let index = this.state.index;

		if (increase) {
			index.left = index.main;
			index.main = index.right;
			index.right = increment(index.right, this.state.porn);
		}
		else {
			index.right = index.main;
			index.main = index.left;
			index.left = decrement(index.left, this.state.porn);
		}

		this.setState({index});
	}

	setUpdateTimeout () {
		this.updateTO = setTimeout(this.updateIndex, this.state.updateInterval);
		this.preloadThumbnails();
	}

	render () {
		if (notEmpty(this.state)) {
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
				children={[sourceTextfield, thumbnailSwitch, titleSwitch, trimTitleSwitch]}
				onSubmit={this.toggleSettings}
			/>;

			if (this.state.porn && this.state.index) {

				let bufferImage = <BufferImage
					data={this.state.porn[this.state.index.main]}
					backgroundSize={this.state.backgroundSize}
					transitionTime={this.state.transitionTime}
					onImageLoaded={this.setUpdateTimeout}
					clickHandler={this.toggleHUD} />;

				if (this.state.showHUD) {
					let title = this.state.porn[this.state.index.main].title ? this.state.trimTitle ? this.state.porn[this.state.index.main].title.replace(TRIM_TITLE, '') :
						this.state.porn[this.state.index.main].title :
						'';

					title = this.state.showTitle ? <h2 className="porn-start-title">{title}</h2> : null;

					let bufferThumbnail = this.state.showThumbnail ? <BufferThumbnail
						data={this.state.porn[this.state.index.main]}
						theDarkness={THE_DARKNESS}
						transitionTime={this.state.transitionTime / 2}
						clickHandler={this.toggleBackgroundSize}
						/> : null;

					let prev = <BufferNext
						data={this.state.porn[this.state.index.left]}
						side="left"
						theDarkness={THE_DARKNESS}
						transitionTime={this.state.transitionTime}
						clickHandler={this.updateIndex.bind(this, false)}
						/>;

					let next = <BufferNext
						data={this.state.porn[this.state.index.right]}
						side="right"
						theDarkness={THE_DARKNESS}
						transitionTime={this.state.transitionTime}
						clickHandler={this.updateIndex.bind(this, true)}
						/>;

					return (
						<div>{bufferImage}{settingsToggle}{settings}{title}{prev}{next}{bufferThumbnail}</div>
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
						<div ref={spinner => spinner ? (componentHandler.upgradeElement(spinner)) : null} className="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>
					</div>
				);
			}
		}
		else {
			return <div ref={spinner => spinner ? (componentHandler.upgradeElement(spinner)) : null} className="mdl-spinner mdl-js-spinner is-active"></div>;
		}
	}
}

PornStart.propTypes = {
	source:         React.PropTypes.string,
	backgroundSize: React.PropTypes.string,
	showHUD:        React.PropTypes.bool,
	trimTitle:      React.PropTypes.bool
};

export default PornStart;
