'use strict';

var onReady = function(callback) {
	if (document.readyState !== 'loading') callback();
	else document.addEventListener('DOMContentLoaded', callback);
};

onReady(() => {
	let url = 'https://www.reddit.com/r/earthporn.json';
	let body = document.querySelectorAll('body')[0];

	fetch(url)
	.then(response => {
		let contentType = response.headers.get('content-type');
		if (contentType && contentType.indexOf('application/json') !== -1) {
			return response.json();
		}
	})
	.then(json => {
		if (json) {
			let index = 0;
			let updateImage = function() {
				if (index >= json.data.children.length) index = 0;

				let child = json.data.children[index]

				if (child.data.is_self) {
					index++;
					updateImage();
				}
				else {
					let imageURL = child.data.preview.images[0].source.url;
					body.style['backgroundImage'] = `url(${ imageURL })`;

					index++;
				}
			};

			updateImage();
			setInterval(updateImage, 10000);
		}
		else {
			console.log('Jason?');
		}
	});
});
