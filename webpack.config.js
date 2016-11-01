var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: { grafar: './src/grafar.ts' },
    output: {
        path: path.join(__dirname, 'build'),
        filename: "[name].js",
        library: "grafar",
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    resolve: { extensions: ['', '.ts', '.js'] },
    module: {
        loaders: [ { test: /\.ts$/, loader: 'ts-loader' } ]
    },
    devtool: 'inline-sourcemap'
}
