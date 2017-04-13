var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: { run: './src/test/run.ts' },
    output: {
        path: path.join(__dirname, 'build-test'),
        filename: "[name].js",
    },
    resolve: { extensions: ['', '.ts', '.js'] },
    module: {
        loaders: [ { test: /\.ts$/, loader: 'ts-loader' } ]
    },
    devtool: 'inline-sourcemap'
}
