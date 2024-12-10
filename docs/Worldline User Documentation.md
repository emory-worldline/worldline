**Worldline User Documentation**

**Introduction**

Worldline is a mobile application that allows users to visualize their travels through global mapping of their camera rolls. It pulls metadata from the user’s photos and assigns a marker to each location visited by the user. This way, Worldline users have convenient and easily readable information about their travels, entirely dependent on their camera rolls.

**Getting Started**

The Worldline application can be installed by downloading the necessary files from the following Github repository:

[https://github.com/emory-worldline/worldline](https://github.com/emory-worldline/worldline)

How to install:

* Install Node.js or ensure that it is already installed  
* Clone the Github repository  
* Navigate to your Worldline directory  
* Run “npm install” to install dependencies (listed in package.json file)  
* Run “npx expo start” to start the expo server  
* Join the server by scanning the QR code with a smartphone with Expo Go installed, or run through an emulator on your device

Upon opening the app, Worldline will request user photos. While not required, the app will not function correctly without camera roll access. More details about data access can be found in Worldline’s privacy policy, which is on the startup page.  
	Clicking “Get Started” will direct the user to the app’s primary features.

**API Documentation: Methods and Features**

At the bottom of the screen should be a menu with four icons, each directing to its own page once clicked. These pages include (in order):

* Statistics  
* Clusters  
* Map View  
* Settings

The “Statistics” page contains data relating to the location, time and other metadata of a user’s photos. These include:

* The highest and lowest altitude of any photo in the user’s camera roll  
* The fastest speed travelled when taking a photo  
* The length of a user’s longest video  
* The total cumulative length of all videos in the user’s camera roll  
* The total number of photos and videos  
* Four pie charts which detail each photo’s camera model, aspect ratio, file type and time of day  
* A graph which shows the frequency of photos being taken over time

The “Clusters” page groups photos into distinct locations and shows frequently visited locations through a street view. Users can scroll through a list of locations, each with a corresponding map with one point representing each photo.

The “Map View” page provides a variety of photo data visualizations on the globe. Upon opening this page, users can select a visualization type through use of the sidebar. Visualization types include:

* Worldline \- traces a line between locations visited chronologically  
* Heat map \- uses different colors to represent different photo density  
* Scatter \- represents each photo with one point on the map  
* Clusters  
* Timeline mapping \- colors data points on a color spectrum, where old photos are blue and new ones are red  
* Users can also toggle whether buildings on the map will be 3-dimensional or not

“Settings” contains the following:

* Map themes \- allow users to customize their data visualization  
* Reprocess user data  
* Clear user data  
* Another link to the privacy policy

**Example Usage**

Below is a collection of screenshots which depict the application in use:

Statistics

![Statistics Page](docs/stats_page.png)  
The statistics page includes the following (top to bottom):

* A graph showing the frequency of photos taken over time  
* A carousel of photo statistics  
* Pie charts, which include more photo data

Clusters

![Clusters Page](docs/cluster_page.jpg)

* The bottom half of the screen provides a list of generated “clusters” each representing a location with many photos. The number of photos and time frame are listed, and other clusters can be selected by clicking them with the touch screen.  
* The top half of the screen shows the location represented by the cluster. Each data point on the map corresponds to a photo in the user’s camera roll.

Map View  
![Light Mode View](docs/light_mode.PNG)![Dark Mode View](docs/dark_mode.PNG)  
Above: map views of “standard” and “dark” map themes. These are both representations of the “scatter” function, where each red dot represents a photo in the user’s photo library.  
	Clicking the upper right menu icon will open a dropdown menu

![Visualizations Screen](docs/visualizations_screen.PNG)

Options in this dropdown menu include (from top to bottom):

* Scatter  
* Heat map  
* Clusters  
* Timeline mapping  
* Toggle 3D buildings  
* Worldline

Settings

Settings can be found on the far right menu button. All shown options can be selected using the touch screen

![Settings Page](docs/settings.PNG)
