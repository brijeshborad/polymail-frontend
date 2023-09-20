#!/usr/bin/env node
"use strict";
const path = require('path');
const execa = require('execa');

let cwd = process.cwd();
let execaOptions = {
    cwd,
    stdio: 'inherit'
};

async function build() {
    try {
        console.log('Starting main building process');
        let buildParams = [
            '-r',
            'dotenv/config',
            path.join(cwd, 'electron-lib/build.js'),
            '--config',
            path.join(cwd, 'electron-lib/electron-builder-config.js'),
            '--mac',
            `dotenv_config_path=${path.join(cwd, 'electron-lib/.env')}`
        ];
        await execa('node', buildParams, execaOptions);
    } catch (err) {
        console.error('Cannot build electron packages');
        console.error(`${err}`);
        process.exit(1);
    }
}

build();
