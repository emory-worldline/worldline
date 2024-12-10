**Technical Documentation**

**Introduction**

Worldline is a mobile application designed to use photo location data to visualize a user’s travels over time. It was built in React Native and coded primarily in Typescript. For a developer, there are a number of features which should be thoroughly understood in order to modify and update Worldline’s code. The purpose of this documentation is to describe the architecture, dependencies and features of the application, allowing developers to understand and contribute to its code with ease.

**Code Architecture**

All Worldline code can be found in the following Github repository:

[https://github.com/emory-worldline/worldline](https://github.com/emory-worldline/worldline)

Worldline’s code consists of the following:

* App \- contains main app pages. Includes:  
  * (tabs) \- Each of the four main pages, and a “\_layout.tsx” file used to organize them with the tab bar  
  * styles  
  * \_layout.tsx \- organizes the setup screen and the secondary screen with the tab bar, mentioned above  
  * index.tsx \- the setup screen itself, including the process of obtaining photo data  
* assets \- contains fonts and images to be used in the app  
* Components \- other elements to be used in the app, including:  
  * Map themes  
  * Pie charts  
  * Tab bars  
  * Buttons  
  * Graphs  
* constants \- colors used throughout the app  
* hooks \- collection of user metadata  
* types \- contains clustering algorithm and collection of photo statistics  
* utils \- more collection of photo data, including file types, aspect ratios and time of day  
* .env.example \- developers should have a copy of this file called .env, filling in appropriate values for each item in the example file  
* package.json \- contains project dependencies

**Library Dependencies**

Worldline dependencies and their versions can be viewed or modified in the repository’s “package.json” file. Key dependencies consist of the following:

* “react-native” \- Worldline is built with the React Native framework  
* “@rnmapbox/maps” \- Mapbox, a visualization library that specializes in interactive maps  
* “@expo/vector-icons” and “react-native-vector-icons” \- menu and in-app icons  
* “@react-navigation/native” and “expo-router” \- app navigation between screens  
* “expo-constants” \- handles constants related to the device the app is running on  
* “expo-font” \- text fonts used in the app  
* “expo-linear-gradient” \- color gradients  
* “expo-media-library” \- provides camera roll access  
* “expo-screen-orientation” \- manages screen orientation  
* “react-native-reanimated” \- animations in react native apps  
* “react-native-safe-area-context” \- ensures UI consistency across devices

**Methods and Functionality**

The primary methods in the code of this project relate to how data is collected by the app, and how this data is used to create visualizations. 

The Worldline animation is calculated by the processWorldline method in hooks/useMediaProcessing.ts

* On load, create a set of interrelated points  
* Define an intermediate point  
* Define a new intermediate point for a new set of interrelated points  
* Draw a line between the intermediate points  
  * Zoom is calculated by the distance between two points  
* Repeat the previous two steps

The cluster layer is defined in components/LocationViewer.tsx

* Group together points within a specified radius (in pixels) of each other  
  * Since the cluster radius is measured in pixels and not meters, there will be more clusters as the user zooms in  
* Adjust the size and color of clusters according to the number of photos they contain  
  * Large, blue clusters represent many photos, while small, purple clusters represent few photos

The heat map is defined in components/LocationViewer.tsx

* Using the heatmap layer feature of MapboxGL, assign a different color and transparency to levels of photo density  
  * low photo density is represented by a translucent blue, high photo density is represented by an opaque red

Timeline mapping depends on the getTimelineColor method in components/LocationViewer.tsx

* Find the earliest and latest timestamps in the user’s camera roll  
* Map the timeline to a color spectrum, ranging from Colors.TERTIARY\_BLUE (‘\#3555A5’) to Colors.PRIMARY\_GREEN (‘\#06D6A0’)  
* For each photo, assign a color that appropriately represents when the photo was taken

The cluster view is calculated by the findDenseClusters method in worldline/types/LocationCluster.ts

* Iterate through data points  
* For each data point that has not been visited, create a new cluster and add all nearby points within a specified radius (default \= 200 meters)  
* Present all clusters through the page’s list view