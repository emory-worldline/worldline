import { View, StyleSheet } from "react-native";
import MapBoxGL from "@rnmapbox/maps";
import Constants from "expo-constants";

MapBoxGL.setAccessToken(Constants.expoConfig?.extra?.mapboxPublicKey || "");

const MapComponent = () => {
  return (
    <View style={styles.container}>
      <MapBoxGL.MapView
        style={styles.map}
        zoomEnabled={true}
        styleURL="mapbox://styles/mapbox/navigation-night-v1"
        rotateEnabled={true}
      >
        <MapBoxGL.Camera
          zoomLevel={15}
          centerCoordinate={[-84.32318, 33.7908]}
          pitch={5}
          animationMode={"flyTo"}
          animationDuration={3000}
        />
        <MapBoxGL.PointAnnotation
          id="marker"
          coordinate={[-84.3231833, 33.7908]}
        >
          <View style={styles.marker} />
        </MapBoxGL.PointAnnotation>
      </MapBoxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 10,
    height: 10,
    backgroundColor: "red",
    borderRadius: 5,
  },
});

export default MapComponent;
