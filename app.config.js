// Expo app config that loads environment variables from .env.dev.local
// and exposes them via `extra` so they can be read with `expo-constants` in-app.

import dotenv from 'dotenv';

// Load variables specifically from .env.dev.local
dotenv.config({ path: '.env.dev.local' });

export default ({ config }) => ({
  ...config,
  expo: {
      "name": "dixit-imagine",
      "icon": "./assets/icon.png"
  },
  extra: {
    ...config?.extra,
      EXPO_PUBLIC_STABILITY_API_KEY: process.env.EXPO_PUBLIC_STABILITY_API_KEY,
      EXPO_PUBLIC_FAL_KEY: process.env.EXPO_PUBLIC_FAL_KEY
  },
});
