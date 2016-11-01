var path = require('path');
var webpack = require('webpack');

var config = require('./webpack.config');
config.output.path = path.join(__dirname, 'dist');
config.plugins = (config.plugins || []).concat([
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        comments: false,
        compress: {
            warnings: false
        }
    })
]);

module.exports = config;
