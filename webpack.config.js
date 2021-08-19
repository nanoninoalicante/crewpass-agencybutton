require("dotenv").config();
const webpack = require("webpack");
const path = require("path");

module.exports = (env) => {
    return {
        entry: "./src/cp.js",
        mode: "production",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "cp.js",
        },
        target: "web",
        plugins: [
            new webpack.DefinePlugin({
                'process.env.CLIENT_DATA_URL': JSON.stringify(process.env.CLIENT_DATA_URL),
                'process.env.VERSION': JSON.stringify(process.env.VERSION || ""),
                'process.env.COMMIT_ID': JSON.stringify(process.env.COMMIT_ID || ""),
                'process.env.POPUP_URL': JSON.stringify(process.env.POPUP_URL || "")
            }),
        ],
    };
};
