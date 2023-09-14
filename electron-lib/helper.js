const path = require("path");
const fs = require("fs");
const {merge} = require("webpack-merge");
const webpack = require('webpack');

const cwd = process.cwd();
const externals = require(path.join(cwd, 'package.json')).dependencies;
const ext = fs.existsSync(path.join(cwd, 'tsconfig.json')) ? '.ts' : '.js';

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
                            extends: path.join(cwd, 'electron-lib/babel.js')
                        },
                    },
                    exclude: [
                        /node_modules/,
                        path.join(cwd, 'src'),
                        path.join(cwd, 'next.config.js'),
                        path.join(cwd, 'next-env.d.ts'),
                        path.join(cwd, '.env.local'),
                        path.join(cwd, '.env.example'),
                        path.join(cwd, '.eslintrc.json'),
                        path.join(cwd, '.gitignore'),
                        path.join(cwd, '.gitlab-ci.yml')
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

const getElectronConfig = () => {
    const electronConfigPath = path.join(cwd, 'electron-lib/electron.config.js');
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
