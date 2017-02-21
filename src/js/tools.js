export const ONE_SECOND = 1000;

export function noop () {}

export function getImageURL (item) {
	try {
		return item.preview.images[0].source.url.replace(/&amp;/g, '&');
	}
	catch (error) {
		return ''
	}
}

export function getThumbnailURL (item) {
	try {
		return item.preview.images[0].resolutions[0].url.replace(/&amp;/g, '&')
	}
	catch (error) {
		return ''
	}
}

export function increment (index, list = []) {
	return ++index === list.length ? 0 : index;
}

export function decrement (index, list = []) {
	return --index < 0 ? list.length - 1 : index;
}

export function rand (min, max) {
	if (max == null) {
		max = min;
		min = 0;
	}

	return min + Math.floor(Math.random() * (max - min + 1));
}

export function loadImage (imageURL) {
	return new Promise((resolve, reject) => {
		let imageLoader = new Image();

		imageLoader.onload = () => {
			resolve(imageURL)
		};

		imageLoader.onerror = () => {
			reject(imageURL)
		};

		imageLoader.src = imageURL;
	});
}

