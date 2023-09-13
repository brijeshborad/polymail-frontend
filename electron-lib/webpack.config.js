// var e = require("webpack"), n = require("fs"), r = require("path"), o = require("webpack-merge");
// const s = process.cwd(), i = require(r.join(s, "package.json")).dependencies;
// var t = o => ({
//     mode: o,
//     target: "electron-main",
//     node: {__dirname: !1, __filename: !1},
//     externals: [...Object.keys(i || {})],
//     devtool: "source-map",
//     resolve: {extensions: [".js", ".jsx", ".json", ".ts", ".tsx"], modules: [r.join(s, "out"), "node_modules"]},
//     output: {libraryTarget: "commonjs2"},
//     module: {
//         rules: [{
//             test: /\.(js|ts)x?$/,
//             use: {
//                 // loader: require.resolve("babel-loader"),
//                 options: {
//                     cacheDirectory: !0,
//                     // extends: n.existsSync(r.join(s, ".babelrc")) ? r.join(s, ".babelrc") : n.existsSync(r.join(s, ".babelrc.js")) ? r.join(s, ".babelrc.js") : n.existsSync(r.join(s, "babel.config.js")) ? r.join(s, "babel.config.js") : r.join(__dirname, "../babel.js")
//                 }
//             },
//             exclude: [/node_modules/, r.join(s, "src"), r.join(s, "public")]
//         }]
//     },
//     plugins: [new e.EnvironmentPlugin({NODE_ENV: o})]
// });
// const c = process.cwd(), a = n.existsSync(r.join(c, "tsconfig.json")) ? ".ts" : ".js";
// e((e => {
//     const {mainSrcDir: s, webpack: i} = (() => {
//         const e = r.join(c, "electron-lib/electron.config.js");
//         return n.existsSync(e) ? require(e) : {}
//     })(), j = o.merge(t(e), {
//         entry: {background: r.join(c, s || "main", `electron${a}`)},
//         output: {filename: "[name].js", path: r.join(c, "out")}
//     }), u = i || {};
//     return "function" == typeof u ? u(j, e) : o.merge(j, u)
// })("production")).run(((e, n) => {
//     e && console.error(e.stack || e), n && n.hasErrors() && console.error(n.toString())
// }));

"use strict";
const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const {merge} = require('webpack-merge');
const {getElectronConfig} = require('./helper');

const cwd = process.cwd();
const externals = require(path.join(cwd, 'package.json')).dependencies;

// ENV = 'development' | 'production'
const configure = (env) => {
    return {
        mode: env,
        target: 'electron-main',
        node: {
            __dirname: false,
            __filename: false,
        },
        externals: [...Object.keys(externals || {})],
        devtool: 'source-map',
        resolve: {
            extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
            modules: [path.join(cwd, 'out'), 'node_modules'],
        },
        output: {
            libraryTarget: 'commonjs2',
        },
        module: {
            rules: [
                {
                    test: /\.(js|ts)x?$/,
                    use: {
                        loader: require.resolve("babel-loader"),
                        options: {
                            cacheDirectory: false,
                            extends: path.join(cwd, 'electron-lib/.babelrc')
                        },
                    },
                    exclude: [
                        /node_modules/,
                        path.join(cwd, 'src'),
                        path.join(cwd, 'public'),
                    ],
                },
            ],
        },
        plugins: [
            new webpack.EnvironmentPlugin({
                NODE_ENV: env,
            }),
        ],
    }
};

const ext = fs.existsSync(path.join(cwd, 'tsconfig.json')) ? '.ts' : '.js';

const webpackConfig = env => {
    const {mainSrcDir, webpack} = getElectronConfig();

    const userConfig = merge(configure(env), {
        entry: {
            electron: path.join(cwd, mainSrcDir || 'main', `electron${ext}`),
        },
        output: {
            filename: '[name].js',
            path: path.join(cwd, 'out'),
        },
    })

    const userWebpack = webpack || {};
    if (typeof userWebpack === 'function') {
        return userWebpack(userConfig, env);
    } else {
        return merge(userConfig, userWebpack);
    }
}

webpack(webpackConfig('production')).run((err, stats) => {
    if (err) {
        console.error(err);
    }
    if (stats && stats.hasErrors()) {
        console.error(stats.toString());
    }
})
