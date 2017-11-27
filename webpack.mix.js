const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    // 'bundle.min.css': [
    //   path.resolve(__dirname, 'src/index.css')
    // ],
    'bundle.js': [
      path.resolve(__dirname, 'src/index.js')
    ]
  },
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'public')
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js' // 'vue/dist/vue.common.js' for webpack 1
    }
  },
  module: {
    loaders: [
        { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
        { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
        { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
        { test: /\.css$/, loader: 'style-loader!css-loader' }
    ],
  },
  plugins: [
    new ExtractTextPlugin("bundle.min.css"),
  ]
};
