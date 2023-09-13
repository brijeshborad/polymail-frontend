const path = require("path");
const fs = require("fs");

const cwd = process.cwd();
module.exports = {
    getElectronConfig: () => {
        const electronConfigPath = path.join(cwd, 'electron-lib/electron.config.js');
        if (fs.existsSync(electronConfigPath)) {
            return require(electronConfigPath);
        } else {
            return {};
        }
    }
}
