# Android APK Build Guide - Attendance Application

This guide will help you convert the web-based attendance application into an Android APK.

## Option 1: Using Capacitor (Recommended - Easiest)

Capacitor allows you to wrap your React web app into a native Android app.

### Prerequisites
- Node.js (v14 or higher)
- Android Studio
- JDK 11 or higher

### Step-by-Step Instructions

#### 1. Install Capacitor
```bash
npm install -g @capacitor/cli
```

#### 2. Create a new React project and add the attendance app
```bash
npx create-react-app attendance-mobile
cd attendance-mobile
```

#### 3. Copy the attendance-app.jsx file
Copy `attendance-app.jsx` to `src/App.jsx` in your React project.

#### 4. Install required dependencies
```bash
npm install lucide-react
npm install @capacitor/core @capacitor/cli
npm install @capacitor/camera @capacitor/geolocation
```

#### 5. Initialize Capacitor
```bash
npx cap init
```
- App name: Attendance System
- App ID: com.attendance.app

#### 6. Build the React app
```bash
npm run build
```

#### 7. Add Android platform
```bash
npx cap add android
```

#### 8. Update AndroidManifest.xml permissions
Edit `android/app/src/main/AndroidManifest.xml` and add:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-feature android:name="android.hardware.camera" />
```

#### 9. Sync and open in Android Studio
```bash
npx cap sync
npx cap open android
```

#### 10. Build APK in Android Studio
- Go to Build → Build Bundle(s) / APK(s) → Build APK(s)
- APK will be generated in: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Option 2: Using Expo (Easier for beginners)

### Prerequisites
- Node.js
- Expo CLI

### Step-by-Step Instructions

#### 1. Install Expo CLI
```bash
npm install -g expo-cli eas-cli
```

#### 2. Create Expo project
```bash
npx create-expo-app AttendanceApp
cd AttendanceApp
```

#### 3. Install dependencies
```bash
npm install expo-camera expo-location lucide-react-native
```

#### 4. Update App.js with mobile-optimized code
Use the provided `App-Expo.js` file (see below)

#### 5. Build APK using EAS
```bash
eas login
eas build:configure
eas build --platform android --profile preview
```

The APK will be available for download from the Expo build dashboard.

---

## Option 3: Using React Native CLI (Advanced)

### Prerequisites
- Node.js
- React Native CLI
- Android Studio
- JDK 11

### Step-by-Step Instructions

#### 1. Create React Native project
```bash
npx react-native@latest init AttendanceApp
cd AttendanceApp
```

#### 2. Install dependencies
```bash
npm install @react-navigation/native
npm install react-native-camera
npm install @react-native-community/geolocation
npm install react-native-vector-icons
```

#### 3. Link native dependencies
```bash
npx react-native link
```

#### 4. Update AndroidManifest.xml
Add camera and location permissions (see Option 1, Step 8)

#### 5. Build APK
```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

---

## Quick APK Build (Using online services)

If you want to quickly test without setting up the development environment:

### Using Ionic Appflow
1. Sign up at https://ionic.io/appflow
2. Upload your React web app
3. Configure build settings
4. Download APK

### Using PhoneGap Build (Deprecated but alternatives exist)
1. Use services like AppGyver, Thunkable, or Appy Pie
2. Upload web assets
3. Generate APK

---

## Important Configuration Files

### capacitor.config.json
```json
{
  "appId": "com.attendance.app",
  "appName": "Attendance System",
  "webDir": "build",
  "bundledWebRuntime": false,
  "plugins": {
    "Camera": {
      "permissions": ["camera"]
    },
    "Geolocation": {
      "permissions": ["location"]
    }
  }
}
```

### app.json (for Expo)
```json
{
  "expo": {
    "name": "Attendance System",
    "slug": "attendance-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4F46E5"
    },
    "android": {
      "package": "com.attendance.app",
      "permissions": [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4F46E5"
      }
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Attendance App to access your camera for photo verification."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Attendance App to use your location for attendance tracking."
        }
      ]
    ]
  }
}
```

---

## Signing the APK (For Production)

### Generate Keystore
```bash
keytool -genkey -v -keystore attendance-app.keystore -alias attendance -keyalg RSA -keysize 2048 -validity 10000
```

### Sign APK
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore attendance-app.keystore app-release-unsigned.apk attendance
```

### Align APK
```bash
zipalign -v 4 app-release-unsigned.apk attendance-app.apk
```

---

## Testing the APK

1. Enable "Developer Options" on Android device
2. Enable "USB Debugging"
3. Connect device via USB
4. Install APK:
   ```bash
   adb install app-debug.apk
   ```

Or simply transfer the APK to your phone and install directly.

---

## Troubleshooting

### Camera not working
- Check AndroidManifest.xml has camera permissions
- Request runtime permissions in code
- Test on physical device (emulator cameras are limited)

### Location not working
- Enable location services on device
- Grant location permissions
- Use physical device for accurate GPS

### Build failures
- Clear gradle cache: `cd android && ./gradlew clean`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Java version: `java -version` (should be JDK 11+)

---

## Recommended Approach

**For quickest results: Use Capacitor (Option 1)**

It allows you to use your existing React code with minimal changes, and the build process is straightforward.

**For production apps: Use React Native CLI (Option 3)**

Better performance and more native control, but requires more setup and native code adjustments.

**For rapid prototyping: Use Expo (Option 2)**

Easiest to get started, but has some limitations with native modules.

---

## Next Steps After Building APK

1. Test thoroughly on multiple Android devices
2. Add app icon and splash screen
3. Sign APK for production
4. Upload to Google Play Console
5. Add crash reporting (Firebase Crashlytics)
6. Implement analytics (Google Analytics)
7. Add push notifications for attendance reminders

---

## Support & Resources

- Capacitor Docs: https://capacitorjs.com/docs
- Expo Docs: https://docs.expo.dev
- React Native Docs: https://reactnative.dev/docs
- Android Studio: https://developer.android.com/studio

---

**Build Date:** February 7, 2026
**App Version:** 1.0.0
**Package Name:** com.attendance.app
