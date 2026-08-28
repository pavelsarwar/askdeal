# Ask Deal Mobile Build Guide

## App identity
- App name: Ask Deal
- Android application ID / iOS bundle ID: `my.com.askdeal.app`
- Production URL: `https://askdeal.com.my`

## One-time local setup
Install Node.js LTS, Android Studio and (for iOS) Xcode on a Mac.

```bash
npm install
npm run cap:add:android
npm run cap:add:ios
npm run cap:sync
```

The generated `android/` and `ios/` directories are native projects. Do not commit signing passwords, keystores, provisioning profiles, Google service account JSON files, APNs private keys, or other secrets.

## Android
1. Run `npm run android`.
2. In Android Studio, confirm application ID `my.com.askdeal.app`.
3. Configure release signing locally or in a protected CI secret store.
4. Build a signed Android App Bundle (`.aab`) for Google Play.
5. Add Firebase configuration only when native push notifications are enabled.

## iOS
1. Run `npm run ios` on macOS.
2. In Xcode, select the correct Apple Developer Team.
3. Confirm bundle ID `my.com.askdeal.app`.
4. Configure Signing & Capabilities.
5. Archive and upload through Xcode / App Store Connect.
6. Add Push Notifications capability only when APNs is configured.

## Native features included in the dependency plan
- App lifecycle / deep-link handling
- Browser
- Geolocation
- Preferences
- Share
- Splash screen
- Status bar
- Push notifications

## Store-readiness checklist
- Final square app icon and adaptive/maskable artwork
- Privacy Policy on `askdeal.com.my`
- Support URL and contact email
- Android Data Safety declaration
- Apple App Privacy declaration
- Screenshots for required device sizes
- Store short/full descriptions
- Content rating and age-rating questionnaire
- Location permission purpose text
- Notification permission purpose / opt-in UX
- Deep links / universal links verification
- Release signing kept outside the public repository

## Important architecture note
The Capacitor app currently loads the production Ask Deal web app from `https://askdeal.com.my`. Before App Store submission, keep meaningful native value in the app (for example native share, location permission UX, deep links, saved preferences and push notifications) so the iOS app is more than a thin web wrapper.
