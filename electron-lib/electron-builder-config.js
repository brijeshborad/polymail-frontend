const path = require('path');
module.exports = {
    appId: 'com.polymail.teams',
    artifactName: 'Polymail-v${version}.${ext}',
    productName: 'Polymail',
    copyright: 'Copyright © 2023 Polymail',
    directories: {
        output: 'dist',
        buildResources: 'resources'
    },
    files: [
        {
            from: '.',
            filter: ['package.json', 'electron-build'],
        }
    ],
    buildNumber: '1.0.0',
    buildVersion: 1,
    forceCodeSigning: !!process.env.FORCE_CODE_SIGNING,
    removePackageScripts: true,
    remoteBuild: false,
    publish: null,
    win: {
        target: ['nsis'],
        icon: './resources/icon.png'
    },
    nsis: {
        oneClick: true,
        perMachine: true,
        deleteAppDataOnUninstall: true
    },
    mac: {
        icon: './resources/icon.png',
        darkModeSupport: true,
        hardenedRuntime: true,
        entitlements: path.join(__dirname, 'entitlements.mac.plist'),
        entitlementsInherit: path.join(__dirname, 'entitlements.mac.plist')
    },
    afterSign: path.join(__dirname, 'notarize.js')
}
