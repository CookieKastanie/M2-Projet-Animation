const path = require('path');

const config = {
    mode: 'development',
    entry: {
        bundle: path.resolve(__dirname, 'src/main.js'),
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public'),
    }
};

module.exports = config;
