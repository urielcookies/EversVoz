export default {
  "expo": {
    "name": "EversVoz",
    "slug": "EversVoz",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/logo.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-screen.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "extra": {
      "eas": {
        "projectId": "f15f605b-b950-45e9-9dae-c04cf4a9a774"
      }
    },
    "ios": {
      "buildNumber": '5',
      "supportsTablet": true,
      "bundleIdentifier": "com.everscode.eversvoz",
      "entitlements": {
        "aps-environment": "production"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
