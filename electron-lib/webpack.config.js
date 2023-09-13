"use strict";
const webpack = require('webpack');
const {webpackConfig} = require('./helper');

webpack(webpackConfig('production')).run((err, stats) => {
    if (err) {
        console.error(err);
    }
    if (stats && stats.hasErrors()) {
        console.error(stats.toString());
    }
})
