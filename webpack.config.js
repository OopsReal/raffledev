const path = require('path');

module.exports = {
  entry: './public/js/leaderboard.js', // Path to your entry file
  output: {
    path: path.resolve(__dirname, 'public/js'), // Output directory for bundled files
    filename: 'bundle.js', // Name of the output bundle
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Transpile JavaScript using Babel
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.mp3$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/leaderboard',
          },
        },
      },
    ],
  },
};
