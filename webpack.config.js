let path = require('path');
let webpack = require('webpack');

let PROD = JSON.parse(process.env.PROD_ENV || 0);

module.exports = {
	entry: path.join(__dirname, 'src', 'js', 'pornStart.js'),
	output: {
		path: path.join(__dirname, 'build'),
		filename: 'pornStart.js'
	},
	plugins: PROD ? [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	] : [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	],
	devtool: PROD ? '' : 'inline-source-map',
	module: {
		preLoaders: [{
			test: path.join(__dirname, 'src', 'js'),
			loader: 'eslint'
	}],
		loaders: [{
			test: path.join(__dirname, 'src', 'js'),
			loader: 'babel-loader',
			query: {presets: ['react', 'es2015']}
		}]
	}
};
