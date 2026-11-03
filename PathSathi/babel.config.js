module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // babel-preset-expo already handles the Reanimated/Worklets Babel plugin
    // automatically in SDK 54 + Reanimated v4. No manual plugin entry needed.
  };
};
