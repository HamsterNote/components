const { getDefaultConfig } = require('expo/metro-config');
const fs = require('node:fs');
const path = require('node:path');
const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, '../../fixtures')];
const serialize = config.serializer.customSerializer;
config.serializer.customSerializer = async (entry, preModules, graph, options) => {
  if (process.env.MODULE_REPORT_DIR) {
    const out = path.resolve(process.env.MODULE_REPORT_DIR);
    fs.mkdirSync(out, { recursive: true });
    const relative = (name) => path.relative(__dirname, name).split(path.sep).join('/');
    const modules = [...graph.dependencies.values()].map((m) => ({
      path: relative(m.path),
      dependencies: [...m.dependencies.values()].map((d) => relative(d.absolutePath)),
    }));
    fs.writeFileSync(
      path.join(out, `metro-${graph.transformOptions.platform}.json`),
      JSON.stringify(
        { platform: graph.transformOptions.platform, entry: relative(entry), modules },
        null,
        2,
      ),
    );
  }
  return serialize(entry, preModules, graph, options);
};
module.exports = config;
