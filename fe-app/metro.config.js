const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Optimized for NativeWind
config.resolver.platforms = [...config.resolver.platforms, 'native', 'android', 'ios'];

module.exports = withNativeWind(config, { 
  input: './global.css',
  inlineRem: 16 
});
