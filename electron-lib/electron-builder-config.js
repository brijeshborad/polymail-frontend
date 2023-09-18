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
    // forceCodeSigning: true,
    removePackageScripts: true,
    remoteBuild: false,
    publish: null,
    win: {
        target: ['nsis']
    },
    nsis: {
        "oneClick": true,
        "perMachine": true,
        "deleteAppDataOnUninstall": true
    }
}
