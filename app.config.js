// Expo app config that loads environment variables from .env.dev.local
// and (optionally) exposes them via `extra` so they can be read with `expo-constants` in-app.

import dotenv from 'dotenv';

// Load variables specifically from .env.dev.local
dotenv.config({ path: '.env.dev.local' });

// Keep the existing app.json config intact. Do NOT override the `expo` object here,
// otherwise fields like ios, android, plugins, etc. may be lost leading to errors
// like "Cannot read properties of undefined (reading 'package')" during prebuild.
export default ({ config }) => ({
  ...config,
  // Merge extra so envs are available via Constants.expoConfig.extra if needed.
  extra: {
    ...(config?.extra || {}),
    EXPO_PUBLIC_STABILITY_API_KEY: process.env.EXPO_PUBLIC_STABILITY_API_KEY,
    EXPO_PUBLIC_FAL_KEY: process.env.EXPO_PUBLIC_FAL_KEY,
  },
});
