# 📱 Attendance App - Android APK Package

## 📦 What's Included

This package contains everything you need to build an Android APK for the Attendance Application:

1. **attendance-app.jsx** - Web version (React)
2. **App-Mobile.js** - Mobile version (React Native/Expo)
3. **APK_BUILD_GUIDE.md** - Comprehensive build instructions
4. **build-apk.sh** - Automated build script
5. **Configuration files** - package.json, app.json, eas.json

## 🚀 Quick Start (Recommended Method)

### Using Expo (Easiest)

```bash
# 1. Install Expo CLI
npm install -g expo-cli eas-cli

# 2. Create new project
npx create-expo-app AttendanceApp --template blank

# 3. Navigate to project
cd AttendanceApp

# 4. Replace App.js with App-Mobile.js
cp ../App-Mobile.js ./App.js

# 5. Update package.json
npm install expo-camera expo-location

# 6. Copy app.json and eas.json
cp ../app.json ./
cp ../eas.json ./

# 7. Login to Expo
eas login

# 8. Configure build
eas build:configure

# 9. Build APK
eas build --platform android --profile preview
```

The APK will be available for download from your Expo build dashboard at https://expo.dev/

## 🎯 Features

### Employee Features
- ✅ Photo capture with front camera
- ✅ GPS location tracking
- ✅ Check-in/Check-out functionality
- ✅ Personal attendance history
- ✅ Real-time clock display

### Admin Features
- ✅ Dashboard with statistics
- ✅ View all employee records
- ✅ Filter by department and date
- ✅ Search functionality
- ✅ Detailed record viewer
- ✅ Employee directory

## 📋 Prerequisites

### For Expo Build
- Node.js (v14+)
- npm or yarn
- Expo account (free at expo.dev)
- Internet connection

### For Local Build
- Node.js (v14+)
- Android Studio
- JDK 11 or higher
- Android SDK

## 🔧 Alternative Build Methods

### Method 1: Using Automated Script

```bash
chmod +x build-apk.sh
./build-apk.sh
```

Follow the interactive prompts to choose your build method.

### Method 2: Using React Native CLI

See `APK_BUILD_GUIDE.md` for detailed instructions.

### Method 3: Using Capacitor

See `APK_BUILD_GUIDE.md` for detailed instructions.

## 🔐 Demo Accounts

### Admin Account
- Username: `admin`
- Password: `admin123`

### Employee Accounts
- Username: `john`, Password: `john123` (Sales)
- Username: `jane`, Password: `jane123` (Marketing)
- Username: `bob`, Password: `bob123` (IT)
- Username: `alice`, Password: `alice123` (HR)

## 📱 App Permissions

The app requires the following permissions:

1. **Camera** - For photo capture during check-in/out
2. **Location** - For GPS tracking
3. **Storage** - For saving photos (optional)

These are automatically configured in the app.json file.

## 🎨 Customization

### Change App Name
Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### Change Package Name
Edit `app.json`:
```json
{
  "android": {
    "package": "com.yourcompany.yourapp"
  }
}
```

### Change Colors
Edit `App-Mobile.js` and update the colors in the StyleSheet.

## 📝 Building for Production

### 1. Update Version
Edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

### 2. Create Production Build
```bash
eas build --platform android --profile production
```

### 3. Sign the APK
The APK is automatically signed by Expo. Download from the build dashboard.

## 🐛 Troubleshooting

### Camera not working
- Grant camera permissions in Android settings
- Test on a physical device (emulators have limited camera support)

### Location not accurate
- Enable high accuracy GPS on device
- Grant location permissions
- Test outdoors for better GPS signal

### Build failed
- Check internet connection
- Ensure all dependencies are installed
- Clear cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### App crashes on startup
- Check Android version compatibility (minimum Android 5.0)
- Verify all permissions are granted
- Check logs: `adb logcat`

## 📊 File Structure

```
AttendanceApp/
├── App.js                 # Main mobile app file
├── app.json              # Expo configuration
├── eas.json              # Build configuration
├── package.json          # Dependencies
├── assets/
│   ├── icon.png         # App icon (1024x1024)
│   ├── splash.png       # Splash screen
│   └── adaptive-icon.png # Android adaptive icon
└── README.md            # This file
```

## 🔄 Update Strategy

To update the app after making changes:

1. Modify App.js with your changes
2. Increment version in app.json
3. Run build command again
4. Download and distribute new APK

## 📤 Distribution

### Option 1: Direct APK Distribution
- Download APK from Expo build dashboard
- Share APK file directly with users
- Users install by enabling "Unknown sources" in Android settings

### Option 2: Google Play Store
- Create Google Play Console account ($25 one-time fee)
- Build production app bundle: `eas build --platform android --profile production`
- Upload to Google Play Console
- Complete store listing
- Submit for review

### Option 3: Internal Testing
- Use Google Play Console Internal Testing
- Add testers by email
- They receive installation link

## 🆘 Support

### Resources
- Expo Documentation: https://docs.expo.dev/
- React Native Documentation: https://reactnative.dev/
- Android Developer Guide: https://developer.android.com/

### Common Issues
Check `APK_BUILD_GUIDE.md` for detailed troubleshooting steps.

## 📄 License

This attendance application is provided as-is for educational and commercial use.

## 🎉 Credits

Built with:
- React Native
- Expo
- expo-camera
- expo-location

---

**Version:** 1.0.0  
**Last Updated:** February 7, 2026  
**Package Name:** com.attendance.app

---

## 🚦 Quick Command Reference

```bash
# Start development server
npm start

# Run on Android device/emulator
npm run android

# Build APK
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production

# Check build status
eas build:list

# Download latest build
eas build:download
```

---

For detailed step-by-step instructions, please refer to **APK_BUILD_GUIDE.md**
