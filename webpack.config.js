require("dotenv").config();
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const ENVIRONMENT = process.env.ENVIRONMENT;
const COMMIT_ID = process.env.COMMIT_ID || "commitId";

module.exports = (env) => {
  return {
    entry: "./src/cp.js",
    mode: "production",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "cp.js",
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: !DEBUG,
            },
          },
        }),
      ],
    },
    target: "web",
    plugins: [
      new webpack.DefinePlugin({
        "process.env.CLIENT_DATA_URL": JSON.stringify(
          process.env.CLIENT_DATA_URL
        ),
        "process.env.ENVIRONMENT": JSON.stringify(ENVIRONMENT || ""),
        "process.env.VERSION": JSON.stringify(process.env.VERSION || ""),
        "process.env.COMMIT_ID": JSON.stringify(COMMIT_ID),
        "process.env.POPUP_URL": JSON.stringify(process.env.POPUP_URL || ""),
        "process.env.BASE_CDN_URL": JSON.stringify(process.env.BASE_CDN_URL || ""),
      }),
    ],
  };
};
