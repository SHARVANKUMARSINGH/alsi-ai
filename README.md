# ALSI Ai

**ALSI Ai** is a React Native and Expo mobile chat app with multimodal OpenRouter prompts, Appwrite email OTP authentication, a local conversation archive, a token economy, and configurable AI response controls.

## Features

- **Multimodal chat:** Attach a gallery image or send text-only prompts. Image requests use OpenRouter-compatible text and `image_url` content parts.
- **Tiered AI access:** ALSI Lite, ALSI Standard, and Alsi Pro have separate token costs, guest restrictions, and text/vision model routes.
- **Resilient AI requests:** Non-JSON upstream responses display a friendly overload message. Lite and Standard vision requests retry through the OpenRouter Free router when a primary free provider is unavailable.
- **Authentication and account balance:** Native Appwrite email-token OTP supports sign in and sign up while preserving existing user balances. Guest accounts receive local non-renewing tokens; verified accounts renew to 100 tokens every four hours.
- **Chat archive:** Conversations are persisted locally and can be created, opened, and deleted from the sidebar.
- **Developer-friendly messages:** Markdown responses support code blocks with language labels, dark code styling, horizontal scrolling, and optional one-tap copy buttons.
- **Mobile polish:** Android keyboard resizing, gallery attachment previews, adaptive Android icon assets, and safe-area-aware layouts are configured.

## Stack

| Area                             | Technology                                         |
| -------------------------------- | -------------------------------------------------- |
| Mobile client                    | React Native, Expo SDK 54, Expo Router, TypeScript |
| Styling                          | NativeWind and React Native StyleSheet             |
| AI proxy                         | tRPC server and OpenRouter Chat Completions API    |
| Authentication and token records | Appwrite and `react-native-appwrite`               |
| Persistence                      | AsyncStorage                                       |
| Native integrations              | Expo Image Picker and Expo Clipboard               |
| Tests                            | Vitest                                             |

## Local development

```bash
pnpm install
pnpm dev
```

Run validation with:

```bash
pnpm check
pnpm test
pnpm lint
npx expo export:embed --eager --platform android --dev false
```

## Required configuration

Create the required backend and AI environment values through your deployment or secret-management settings. **Never commit API keys, Expo access tokens, database URLs, or Appwrite credentials to this repository.**

## Publishing an Android build

Create a project checkpoint, then use the managed **Publish** control in the project UI to initialize the build workflow and generate the Android package.

## GitHub Actions cloud APK build

The repository includes a manual workflow at `.github/workflows/build-apk.yml`. It installs the project, authenticates to Expo through the encrypted `EXPO_TOKEN` repository secret, and triggers an EAS **preview** Android APK build.
Before the first GitHub Actions build, link ALSI Ai to a **new** EAS project owned by the intended Expo account. EAS requires a newly generated `extra.eas.projectId` for that account; do not restore an identifier from a previous Expo account. Once linked, open the repository’s **Actions** tab and run **Cloud Android APK**. The EAS build URL is shown in the workflow log.

## License

No license has been selected yet. Add one before distributing or accepting external contributions.
