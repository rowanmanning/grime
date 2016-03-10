'use strict';

module.exports = tryRequire;

function tryRequire (moduleName, cleanCache) {
    try {
        if (cleanCache) {
            const resolvedModuleName = require.resolve(moduleName);
            delete require.cache[resolvedModuleName];
        }
        return require(moduleName);
    } catch (error) {}
}
