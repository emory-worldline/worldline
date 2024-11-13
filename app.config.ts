import "dotenv/config";

export default {
  expo: {
    name: "worldline",
    slug: "worldline",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/images/worldline_logo.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.IDENTIFIER,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: process.env.IDENTIFIER,
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
            deploymentTarget: process.env.IOS,
          },
        },
      ],
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsDownloadToken: process.env.MAPBOX_PRIVATE_KEY,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      mapboxPublicKey: process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_KEY,
    },
  },
};
