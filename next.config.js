const withTM = require("next-transpile-modules")(["hyperlog"]);
module.exports = withTM({
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
