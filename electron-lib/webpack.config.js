"use strict";
const webpack = require('webpack');
const {webpackConfig} = require('./helper');

let env = process.env.WEBPACK_ENV || 'development';

webpack(webpackConfig(env)).run((err, stats) => {
    if (err) {
        console.error(err);
    }
    if (stats && stats.hasErrors()) {
        console.error(stats.toString());
    }
})
