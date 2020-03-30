const { override } = require("customize-cra");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const path = require("path");

module.exports = override(function(config, env) {
    // include lib
    config.module.rules.forEach(rule => {
        if (!Reflect.has(rule, 'oneOf')) {
            return false;
        }

        rule.oneOf.forEach(loader => {
            if (loader.test && loader.test.toString().includes('tsx')) {
                loader.include = [
                    path.resolve(__dirname, './src'),
                    path.resolve(__dirname, '../react-hooks/src'),
                    path.resolve(__dirname, '../api-deriver/src')
                ]
            }
        });
    })
    // remove ModuleScoplePlugin
    config.resolve.plugins = config.resolve.plugins.filter(
        plugin => !(plugin instanceof ModuleScopePlugin)
    );
    config.resolve.alias = {
        "@honzon-platform/apps": path.resolve(__dirname, "src"),
        "@honzon-platform/hooks": path.resolve(__dirname, "../react-hooks/src"),
        "@honzon-platform/api-deriver": path.resolve(__dirname, "../api-deriver/src")
    };
    return config;
});
