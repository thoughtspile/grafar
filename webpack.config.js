var path = require('path');

module.exports = {
    entry: { grafar: './src-nightly/grafar.ts' },
    output: {
        path: path.join(__dirname, 'compiled'),
        filename: "[name].js"
    },
    resolve: { extensions: ['', '.ts', '.js'] },
    module: {
        loaders: [ { test: /\.ts$/, loader: 'ts-loader' } ]
    },
    devtool: 'inline-sourcemap'
}
