let path = require('path');

module.exports = {
	entry: path.join(__dirname, 'src', 'js', 'pornStart.js'),
	output: {
		path: path.join(__dirname, 'build'),
		filename: 'pornStart.js'
	},
	devtool: 'inline-source-map',
	module: {
		loaders: [{
			test: path.join(__dirname, 'src', 'js'),
			loader: 'babel-loader',
			query: {presets: ['react', 'es2015']}
		}]
	}
};
