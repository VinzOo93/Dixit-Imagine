// Minimal Metro config for Expo SDK 54 / React Native 0.76.x
// This file is required by some tooling (e.g., install-expo-modules) that expects it to exist.
// If you need to customize Metro later, you can extend this.

// Prefer Expo's helper which includes sensible defaults for Expo projects
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
