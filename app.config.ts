import 'dotenv/config'; // This imports the .env variables
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "worldline",
  slug: "worldline",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.anonymous.worldline",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.anonymous.worldline",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: "34.0.0",
        },
        ios: {
          deploymentTarget: "18.0",
        },
      },
    ],
    [
      "@rnmapbox/maps",
      {
        RNMAPboxMapsDownloadToken: process.env.MAPBOX_PRIVATE_API_KEY
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    mapboxPrivateApiKey: process.env.MAPBOX_PRIVATE_API_KEY, // You can access this in your app
  },
});