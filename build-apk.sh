#!/bin/bash

# Attendance App - APK Build Script
# This script automates the process of building an Android APK

echo "========================================="
echo "   Attendance App - APK Builder"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Node.js
echo "📋 Step 1: Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
else
    echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
fi

# Step 2: Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
fi

echo ""
echo "========================================="
echo "   Choose Build Method"
echo "========================================="
echo "1) Expo (Easiest - Recommended)"
echo "2) React Native CLI (Advanced)"
echo "3) Capacitor (For existing React app)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}Building with Expo...${NC}"
        echo ""
        
        # Install Expo CLI
        echo "📦 Installing Expo CLI..."
        npm install -g expo-cli eas-cli
        
        # Create project directory
        echo "📁 Setting up project..."
        mkdir -p AttendanceApp
        cd AttendanceApp
        
        # Copy files
        echo "📋 Copying project files..."
        cp ../App-Mobile.js ./App.js
        cp ../package.json ./
        cp ../app.json ./
        cp ../eas.json ./
        
        # Install dependencies
        echo "📦 Installing dependencies..."
        npm install
        
        # Login to Expo
        echo ""
        echo -e "${YELLOW}⚠️  You need to login to Expo account${NC}"
        echo "If you don't have one, create at: https://expo.dev/"
        read -p "Press Enter to login..."
        eas login
        
        # Configure EAS
        echo "⚙️  Configuring EAS build..."
        eas build:configure
        
        # Build APK
        echo ""
        echo -e "${GREEN}🚀 Starting APK build...${NC}"
        echo "This will take several minutes..."
        eas build --platform android --profile preview
        
        echo ""
        echo -e "${GREEN}✅ Build complete!${NC}"
        echo "Download your APK from the Expo build dashboard"
        ;;
        
    2)
        echo ""
        echo -e "${GREEN}Building with React Native CLI...${NC}"
        echo ""
        
        # Check Java
        if ! command -v java &> /dev/null; then
            echo -e "${RED}❌ Java JDK is not installed!${NC}"
            echo "Please install JDK 11 or higher"
            exit 1
        fi
        
        # Create React Native project
        echo "📁 Creating React Native project..."
        npx react-native@latest init AttendanceAppRN
        cd AttendanceAppRN
        
        # Install dependencies
        echo "📦 Installing dependencies..."
        npm install react-native-camera @react-native-community/geolocation
        npm install react-native-vector-icons
        
        # Link dependencies
        echo "🔗 Linking native modules..."
        npx react-native link
        
        echo ""
        echo -e "${YELLOW}⚠️  Manual steps required:${NC}"
        echo "1. Copy App-Mobile.js to App.tsx"
        echo "2. Update AndroidManifest.xml with permissions"
        echo "3. Run: cd android && ./gradlew assembleRelease"
        echo "4. APK will be in: android/app/build/outputs/apk/release/"
        ;;
        
    3)
        echo ""
        echo -e "${GREEN}Building with Capacitor...${NC}"
        echo ""
        
        # Create React app
        echo "📁 Creating React project..."
        npx create-react-app attendance-capacitor
        cd attendance-capacitor
        
        # Install Capacitor
        echo "📦 Installing Capacitor..."
        npm install @capacitor/core @capacitor/cli
        npm install @capacitor/camera @capacitor/geolocation
        npm install lucide-react
        
        # Initialize Capacitor
        echo "⚙️  Initializing Capacitor..."
        npx cap init "Attendance System" "com.attendance.app"
        
        # Build React app
        echo "🏗️  Building React app..."
        npm run build
        
        # Add Android platform
        echo "📱 Adding Android platform..."
        npx cap add android
        
        echo ""
        echo -e "${YELLOW}⚠️  Manual steps required:${NC}"
        echo "1. Copy attendance-app.jsx to src/App.jsx"
        echo "2. Update AndroidManifest.xml with permissions"
        echo "3. Run: npx cap sync"
        echo "4. Run: npx cap open android"
        echo "5. Build APK in Android Studio: Build → Build APK(s)"
        ;;
        
    *)
        echo -e "${RED}Invalid choice!${NC}"
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo -e "${GREEN}   Setup Complete!${NC}"
echo "========================================="
echo ""
echo "📝 Next steps:"
echo "1. Test the app thoroughly"
echo "2. Sign the APK for production"
echo "3. Upload to Google Play Store"
echo ""
echo "For support, refer to APK_BUILD_GUIDE.md"
