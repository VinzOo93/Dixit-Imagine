## Dixit Imagine - React Native (Expo)

This app starts with a game board shell and a stylized cloud header inspired by the Dixit resources page.

### Image generation service

An image generation service has been updated to use fal.ai via the official `@fal-ai/client`. The HTTP client is abstracted behind an interface so you can easily swap it for any other provider.

- Interfaces: src/interfaces/ImageGenerationClientInterface.ts and src/interfaces/GeneratedImageResultInterface.ts
- Default client: src/services/FalAIImageClient.ts (calls `fal-ai/flux/schnell` and returns the image URL)
- Service: src/services/ImagineImageService.ts (downloads the image and saves it to app storage, returning an ImagineImage with a file URI in path)

Environment variables:
- Preferred: `FAL_KEY`
- Fallback supported: `API_KEY`

Expo app config (app.config.js) loads `.env.dev.local` and exposes these keys via `Constants.expoConfig.extra`.

If no key is set or the request fails, the app falls back to the local placeholder image.

#### Where generated images are stored
- When an image is generated successfully, it is saved to the app sandbox under:
  `${FileSystem.documentDirectory}assets/generated/` (Expo FileSystem)
- Each image is written as a PNG file and the app references it via a `file://` URI.
- To clear saved images during development, delete that folder via code or uninstall the app.

### Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run ios
   # or
   npm run android
   # or
   npm run web
   ```

### Notes

- Header ignores logos and inscriptions; only layered clouds are implemented for now.
- Cloud motion uses `react-native-reanimated` which Expo includes by default. If you eject or change config, ensure Reanimated is configured per Expo docs.


