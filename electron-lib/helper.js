const path = require("path");
const fs = require("fs");
const {merge} = require("webpack-merge");
const webpack = require('webpack');

const cwd = process.cwd();
const externals = require(path.join(cwd, 'package.json')).dependencies;
const ext = fs.existsSync(path.join(cwd, '../tsconfig.json')) ? '.ts' : '.js';

// ENV = 'development' | 'production'
const configure = (env) => {
    env = env.trim();
    const {buildDir} = getElectronConfig();
    const config = {
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
                            extends: path.join(cwd, 'babel.js')
                        },
                    },
                    exclude: [
                        /node_modules/
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
    if (env === "production") {
        config.optimization = {
            minimize: true,
        };
    }
    return config;
};

const getElectronConfig = () => {
    const electronConfigPath = path.join(cwd, 'electron.config.js');
    if (fs.existsSync(electronConfigPath)) {
        return require(electronConfigPath);
    } else {
        return {};
    }
}

module.exports = {
    getElectronConfig,
    webpackConfig: env => {
        const {mainSrcDir, webpack, buildDir} = getElectronConfig();

        const userConfig = merge(configure(env), {
            entry: {
                background: path.join(cwd, mainSrcDir || 'main', `background${ext}`),
                preload: path.join(cwd, mainSrcDir || 'main', `preload${ext}`),
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
}
