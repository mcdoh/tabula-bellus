export const ONE_SECOND = 1000;
export const THUMBNAIL_INDEX = 0;

export function noop () {}

export function isLandscape (item) {
	try {
		return item.preview.images[0].source.width > item.preview.images[0].source.height;
	}
	catch (error) {
		return null;
	}
}

export function aspectRatio (item, index) {
	try {
		let width = index === undefined ? item.preview.images[0].source.width :
			item.preview.images[0].resolutions[index].width;
		let height = index === undefined ? item.preview.images[0].source.height :
			item.preview.images[0].resolutions[index].height;

		return (width > height ? height/width : width/height).toFixed(3);
	}
	catch (error) {
		return null;
	}
}

export function getImageURL (item) {
	try {
		return item.preview.images[0].source.url.replace(/&amp;/g, '&');
	}
	catch (error) {
		return '';
	}
}

export function getThumbnailURL (item) {
	try {
		return item.preview.images[0].resolutions[THUMBNAIL_INDEX].url.replace(/&amp;/g, '&');
	}
	catch (error) {
		return '';
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
			resolve(imageURL);
		};

		imageLoader.onerror = () => {
			reject(imageURL);
		};

		imageLoader.src = imageURL;
	});
}

