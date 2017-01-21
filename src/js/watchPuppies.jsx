import React from 'react';

import Puppy from './puppy.jsx';

const SECOND = 1000;

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
			index: rand(0,10)
		};

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
			this.startInterval();
// 			if (json) {
// 				let index = 0;
// 				let updateImage = function() {
// 					if (index >= json.data.children.length) index = 0;
//
// 					let child = json.data.children[index]
//
// 					if (child.data.is_self) {
// 						index++;
// 						updateImage();
// 					}
// 					else {
// 						let imageURL = child.data.preview.images[0].source.url;
// 						body.style['backgroundImage'] = `url(${ imageURL })`;
//
// 						index++;
// 					}
// 				};
//
// 				updateImage();
// 				setInterval(updateImage, 10000);
// 			}
		})
		.catch(error => console.error);
	}

	parseData (data) {
		console.log(data);

		let puppies = data.data.children
		.map(child => child.data)
		.filter(child => child.post_hint === 'link' || child.post_hint === 'image');

		console.log(puppies);
		puppies = puppies.map(puppy => <Puppy data={puppy} />);
		this.setState({puppies});
	}

	startInterval () {
		this.interval = setInterval(() => {
			let index = this.state.index;

			index++;
			if (index >= this.state.puppies.length) index = 0;

			this.setState({index});
		}, 60*SECOND);
	}

	render () {
		console.log(this.state.index);
		let puppy = this.state.puppies ? this.state.puppies[this.state.index] : null;

		return (
			<div>{puppy}</div>
		);

// 		return (
// 			this.state.puppies ? <Puppy data={this.state.puppies[this.state.index]} /> : null
// 		);
	}
}

export default WatchPuppies;
