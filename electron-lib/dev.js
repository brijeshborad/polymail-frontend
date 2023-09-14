#!/usr/bin/env node
"use strict";
const arg = require('arg');
const execa = require('execa');
const webpack = require('webpack');
const {
    getElectronConfig, webpackConfig
} = require('./helper');


const args = arg({
    '--port': Number,
    '--remote-debugging-port': Number,
    '--inspect': Number,
    '--run-only': Boolean,
    '--startup-delay': Number,
    '-p': '--port',
    '-r': '--run-only',
    '-d': '--startup-delay',
});

const electronConfig = getElectronConfig();
const rendererPort = args['--port'] || 3000;
const remoteDebuggingPort = args['--remote-debugging-port'] || 5858;
const inspectPort = args['--inspect'] || 9292;
const startupDelay = electronConfig.startupDelay || args['--startup-delay'] || 0;

const execaOptions = {
    cwd: process.cwd(),
    stdio: 'inherit',
};

(async () => {
    let firstCompile = true;
    let watching;
    let mainProcess;
    let rendererProcess;

    const startMainProcess = () => {
        mainProcess = execa(
            'electron',
            ['.', `${rendererPort}`, `--remote-debugging-port=${remoteDebuggingPort}`, `--inspect=${inspectPort}`],
            {detached: true, ...execaOptions}
        );
        mainProcess.unref();
    };

    const startRendererProcess = () => {
        const child = execa('next', ['-p', rendererPort], execaOptions);
        child.on('close', () => {
            process.exit(0);
        });
        return child;
    };

    const killWholeProcess = () => {
        if (watching) {
            watching.close(() => {
            });
        }
        if (mainProcess) {
            mainProcess.kill();
        }
        if (rendererProcess) {
            rendererProcess.kill();
        }
    };

    const webpackCallback = async (err) => {
        if (err) {
            console.error(err.stack || err);
            if (err.stack) {
                console.error(err.stack);
            }
        }

        if (firstCompile) {
            firstCompile = false;
        }

        if (!err) {
            if (!firstCompile && mainProcess) {
                mainProcess.kill();
            }
            startMainProcess();
        }
    }

    process.on('SIGINT', killWholeProcess);
    process.on('SIGTERM', killWholeProcess);
    process.on('exit', killWholeProcess);

    rendererProcess = startRendererProcess();

    // wait until renderer process is ready
    await new Promise(resolve => setTimeout(() => resolve(), startupDelay));

    const compiler = webpack(webpackConfig('development'));
    if (args['--run-only']) {
        compiler.run(webpackCallback);
    } else {
        watching = compiler.watch({}, webpackCallback);
    }
})();
