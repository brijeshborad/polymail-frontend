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
    const {buildDir} = getElectronConfig();
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
            modules: [path.join(cwd, buildDir || 'out'), 'node_modules'],
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
                        path.join(cwd, 'src')
                    ],
                },
            ],
        },
        plugins: [
            new webpack.EnvironmentPlugin({
                NODE_ENV: env,
                BUILD_DIR: buildDir
            }),
        ],
    }
};

const ext = fs.existsSync(path.join(cwd, 'tsconfig.json')) ? '.ts' : '.js';

const webpackConfig = env => {
    const {mainSrcDir, webpack, buildDir} = getElectronConfig();

    const userConfig = merge(configure(env), {
        entry: {
            electron: path.join(cwd, mainSrcDir || 'main', `electron${ext}`),
        },
        output: {
            filename: '[name].js',
            path: path.join(cwd, buildDir || 'out'),
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
