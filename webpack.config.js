const path = require("path");

module.exports = {
  mode: "production",
  watch: true,
  entry: path.join(__dirname, "webpack", "double-buffer"),
  output: {
    filename: "[name]-bundle.js",
    path: path.resolve(__dirname, "assets/js"),
  },
  module: {
    rules: [
      {
        test: /.js$/,
        exclude: [
          path.resolve(__dirname, "node_modules"),
          path.resolve(__dirname, "bower_components"),
        ],
        loader: "babel-loader",
        query: {
          presets: ["@babel/preset-env"],
        },
      },
    ],
  },
  resolve: {
    extensions: [".json", ".js", ".jsx"],
  },
};
