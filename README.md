# Worldline 🌎⏳
A cross-platform data visualizer that extends your photo library to show you where you have been in space and time.

### Videos
[Worldine Demo](https://youtu.be/mvTwVRXcJ_Q)  
[Worldline Codebase Overview](https://youtu.be/UIzN5dq0STs)

### Environment Setup
Cross platform development is supported through react native and expo, however only ios development has been thoroughly tested. Running it yourself is possible but requires a couple setup steps. 

First clone the repo `git clone https://github.com/emory-worldline/worldline` and install all dependencies with `npm install`.

Next create a `.env` file with the variables from `.env.example`. Each of the variables is required for the app to run. The map box public `EXPO_PUBLIC_MAPBOX_PUBLIC_KEY` and private `MAPBOX_PRIVATE_KEY` keys can be acquired from [mapbox](https://console.mapbox.com/account/access-tokens/) by creating an account and requesting an access token with all default permissions as well as DOWNLOADS:READ permissions included. The `IDENTIFIER` can be set to any unique string and the `IOS` corresponds to the version you want to build for.

Based on how you want to run worldline determines what extra development steps you need. Here is a [guide from expo](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&platform=ios&device=simulated&buildEnv=local) when it comes to setting up for both real device and simulator based environments (Not using EAS).

This app does not work with Expo Go as it requires libraries that do not support Go, so a development build is required. It is recommended to use ios simulator or an ios device in developer mode to run this app. It is easier to run on the simulator, but if you want to run on your device it requires that you have developer mode setup and you trust the app after building.

After setting your environment up with the expo guide it is time to run it. If you have chosen simulator or device make sure that the ios version in the env file matches your phone or simulator version.

Run `npx expo prebuild --clean` to prebuild the native app directories. Then you can build it to a device with `npx expo run:ios --device` which builds to an ios device and lets you select from all simulators or an actual device if it is plugged in. This should build the app directly to the device and it may take a while to do so.

Keep in mind that this is a development build and requires the development server to be running for the app to run. So after it has been build if you want to run it again you can just use `npx expo start` to start the server and then either use the commands in the terminal to open a specific simulator or scan the QR code with a device that already has the native parts of the app built on it.

Further codebase specific documentation is provided here:  
[Docs User](docs/Worldline%20User%20Documentation.md)  
[Docs Technical](docs/Worldline%20Technical%20Documentation.md)