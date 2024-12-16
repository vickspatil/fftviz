const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
//   mode: 'development',
//   devServer: {
//     static: {
//       directory: path.join(__dirname, 'src'),
//     },
//     compress: true,
//     port: 9000, // You can change the port if needed
//   },
};
