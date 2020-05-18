const withPlugins = require("next-compose-plugins");
const withTM = require("next-transpile-modules")(["hyperlog"]);
const withCSS = require("@zeit/next-css");

module.exports = withPlugins([withTM, withCSS], {
  webpack: (config, options) => {
    if (!options.isServer) {
      // use brfs browserify transform to inline a fs.readFileSync call that hyperlog performs
      const nodeModulesBabelRule =
        config.module.rules[config.module.rules.length - 1];
      nodeModulesBabelRule.use = [
        nodeModulesBabelRule.loader,
        "transform-loader?brfs",
      ];
      delete nodeModulesBabelRule.loader;
    }
    return config;
  },
});
