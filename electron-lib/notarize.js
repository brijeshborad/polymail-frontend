const { notarize } = require('@electron/notarize');
require('dotenv').config({path: __dirname + '.env'});
exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== 'darwin') {
        return;
    }

    const appName = context.packager.appInfo.productFilename;

    return await notarize({
        // tool: 'legacy',
        // ascProvider: 'X226XTV2F5',
        // appPath: `${appOutDir}/${appName}.app`,
        // appleId: process.env.APPLE_ID,
        // appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
        // appBundleId: 'com.polymail.teams'
        tool: 'notarytool',
        teamId: 'X226XTV2F5',
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
        appBundleId: 'com.polymail.teams'
    });
};
