#!/usr/bin/env node
"use strict";
const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');
const arg = require('arg');
const {getElectronConfig} = require("./helper");

let cwd = process.cwd();
let execaOptions = {
    cwd,
    stdio: 'inherit',
};

let args = arg({
    '--all': Boolean,
    '--win': Boolean,
    '--mac': Boolean,
    '--linux': Boolean,
    '--x64': Boolean,
    '--ia32': Boolean,
    '--armv7l': Boolean,
    '--arm64': Boolean,
    '--universal': Boolean,
    '--config': String,
    '--publish': String,
    '--no-pack': Boolean,
    '-w': '--win',
    '-m': '--mac',
    '-l': '--linux',
    '-c': '--config',
    '-p': '--publish',
});

async function build() {
    const {buildDir} = getElectronConfig();
    // Ignore missing dependencies
    process.env.ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = 'true';

    const appDir = path.join(cwd, buildDir || 'out');
    const distDir = path.join(cwd, 'dist');

    try {
        console.log('Clearing previous builds');
        fs.removeSync(appDir);
        fs.removeSync(distDir);

        console.log('Building renderer process');
        await execa('env-cmd -f .env.electron-build next', ['build'], execaOptions);
        await execa('next', ['export', '-o', appDir], execaOptions);

        console.log('Building main process');
        await execa('node', [path.join(__dirname, 'webpack.config.js')], execaOptions);

        console.log('Packaging - please wait a moment');
        await execa('electron-builder', createBuilderArgs(), execaOptions);

        console.log('See `dist` directory');
    } catch (err) {
        console.error('Cannot build electron packages');
        console.error(`${err}`);
        process.exit(1);
    }
}

function createBuilderArgs() {
    let results = [];
    if (args['--config']) {
        results.push('--config');
        results.push(args['--config'] || 'electron-builder.yml');
    }
    if (args['--publish']) {
        results.push('--publish');
        results.push(args['--publish']);
    }
    if (args['--all']) {
        results.push('-wml');
        results.push(...createArchArgs());
    } else {
        args['--win'] && results.push('--win');
        args['--mac'] && results.push('--mac');
        args['--linux'] && results.push('--linux');
        results.push(...createArchArgs());
    }
    return results;
}

function createArchArgs() {
    let archArgs = [];
    args['--x64'] && archArgs.push('--x64');
    args['--ia32'] && archArgs.push('--ia32');
    args['--armv7l'] && archArgs.push('--armv7l');
    args['--arm64'] && archArgs.push('--arm64');
    args['--universal'] && archArgs.push('--universal');
    return archArgs;
}

build();
