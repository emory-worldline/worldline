import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import MapboxGL from "@rnmapbox/maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

MapboxGL.setAccessToken(Constants.expoConfig?.extra?.mapboxPublicKey || "");

interface PhotoLocation {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: string;
    timestamp: number;
  };
}

interface LayerVisibility {
  points: boolean;
  heatmap: boolean;
  clusters: boolean;
  timeline: boolean;
  buildings: boolean;
}

const STORAGE_KEYS = {
  photoLocations: "photoLocations",
} as const;

const LocationViewer: React.FC = () => {
  const [geoJSON, setGeoJSON] = useState<{
    type: "FeatureCollection";
    features: GeoJSONFeature[];
  }>({ type: "FeatureCollection", features: [] });

  const [center, setCenter] = useState<[number, number]>([-122.4324, 37.7882]);

  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    points: true,
    heatmap: false,
    clusters: false,
    timeline: false,
    buildings: true, // Default buildings to visible
  });

  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const animation = useRef(new Animated.Value(70)).current; // for collapsed controls bar

  const toggleControls = () => {
    // animate height of control bar
    setIsControlsVisible((prev) => !prev);
    Animated.timing(animation, {
      toValue: isControlsVisible ? 70 : 300,    // target height (collapsed: first value, expanded: second value)
      duration: 300,                            // animation duration in ms
      useNativeDriver: false
    }).start();
  };

  // Load locations from storage
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationsString = await AsyncStorage.getItem(
          STORAGE_KEYS.photoLocations,
        );
        if (locationsString) {
          const locations = JSON.parse(locationsString);
          const validLocations = locations.filter(
            (loc: any) => loc.latitude && loc.longitude,
          );

          // Convert to GeoJSON
          const features: GeoJSONFeature[] = validLocations.map(
            (loc: PhotoLocation) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [loc.longitude, loc.latitude],
              },
              properties: {
                id: loc.id,
                timestamp: loc.timestamp,
              },
            }),
          );

          setGeoJSON({
            type: "FeatureCollection",
            features,
          });

          if (features.length > 0) {
            const sum = features.reduce(
              (acc, feature) => ({
                lng: acc.lng + feature.geometry.coordinates[0],
                lat: acc.lat + feature.geometry.coordinates[1],
              }),
              { lng: 0, lat: 0 },
            );
            setCenter([sum.lng / features.length, sum.lat / features.length]);
          }
        }
      } catch (error) {
        console.error("Error loading locations:", error);
      }
    };
    loadLocations();
  }, []);

  const toggleLayer = (layerName: keyof LayerVisibility) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  };

  const getTimelineColor = () => {
    return [
      "interpolate",
      ["linear"],
      ["get", "timestamp"],
      Math.min(...geoJSON.features.map((f) => f.properties.timestamp)),
      "#0000ff",
      Math.max(...geoJSON.features.map((f) => f.properties.timestamp)),
      "#ff0000",
    ];
  };

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        projection="globe"
        rotateEnabled={true}
        pitchEnabled={true}
        compassEnabled={true}
      >
        <MapboxGL.Camera
          zoomLevel={1}
          centerCoordinate={center}
          pitch={0}
          animationMode="moveTo"
          animationDuration={0}
        />

        {/* 3D Buildings Layer */}
        {layerVisibility.buildings && (
          <MapboxGL.FillExtrusionLayer
            id="building-extrusions"
            sourceLayerID="building"
            minZoomLevel={10}
            maxZoomLevel={24}
            style={{
              fillExtrusionColor: "#aaa",
              fillExtrusionHeight: [
                "interpolate",
                ["linear"],
                ["zoom"],
                10,
                0,
                10.05,
                ["get", "height"],
              ],
              fillExtrusionBase: [
                "interpolate",
                ["linear"],
                ["zoom"],
                10,
                0,
                10.05,
                ["get", "min_height"],
              ],
              fillExtrusionOpacity: 0.6,
            }}
            filter={["==", ["get", "extrude"], "true"]}
          />
        )}

        {/* Basic Points Layer */}
        {layerVisibility.points && (
          <MapboxGL.ShapeSource id="photoLocations" shape={geoJSON}>
            <MapboxGL.CircleLayer
              id="photoPoints"
              style={{
                circleRadius: 8,
                circleColor: "red",
                circleStrokeWidth: 2,
                circleStrokeColor: "white",
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Heatmap Layer */}
        {layerVisibility.heatmap && (
          <MapboxGL.ShapeSource id="heatmapLocations" shape={geoJSON}>
            <MapboxGL.HeatmapLayer
              id="photoHeatmap"
              style={{
                heatmapWeight: 1,
                heatmapIntensity: 1,
                heatmapColor: [
                  "interpolate",
                  ["linear"],
                  ["heatmap-density"],
                  0,
                  "rgba(0,0,255,0)",
                  0.2,
                  "rgba(0,0,255,0.5)",
                  0.4,
                  "rgba(0,255,255,0.5)",
                  0.6,
                  "rgba(0,255,0,0.5)",
                  0.8,
                  "rgba(255,255,0,0.5)",
                  1,
                  "rgba(255,0,0,1)",
                ],
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Clustered Points Layer */}
        {layerVisibility.clusters && (
          <MapboxGL.ShapeSource
            id="clusterLocations"
            shape={geoJSON}
            cluster={true}
            clusterProperties={{
              // Optional: add cluster properties if needed
              sum: ["+", ["get", "point_count"]],
            }}
            maxZoomLevel={14}
            clusterRadius={50}
          >
            <MapboxGL.SymbolLayer
              id="clusterCount"
              style={{
                textField: ["get", "point_count"],
                textSize: 12,
                textColor: "#fff",
                textAllowOverlap: true,
              }}
            />
            <MapboxGL.CircleLayer
              id="clusters"
              belowLayerID="clusterCount"
              filter={["has", "point_count"]}
              style={{
                circleColor: [
                  "step",
                  ["get", "point_count"],
                  "#51bbd6", // Color for clusters with count < 100
                  100,
                  "#f1f075", // Color for clusters with count >= 100 and < 750
                  750,
                  "#f28cb1", // Color for clusters with count >= 750
                ],
                circleRadius: [
                  "step",
                  ["get", "point_count"],
                  20, // Size for clusters with count < 100
                  100,
                  30, // Size for clusters with count >= 100 and < 750
                  750,
                  40, // Size for clusters with count >= 750
                ],
                circleOpacity: 0.84,
                circleStrokeWidth: 2,
                circleStrokeColor: "#fff",
              }}
            />
            <MapboxGL.CircleLayer
              id="unclustered-points"
              filter={["!", ["has", "point_count"]]}
              style={{
                circleColor: "#11b4da",
                circleRadius: 8,
                circleStrokeWidth: 1,
                circleStrokeColor: "#fff",
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Timeline Layer */}
        {layerVisibility.timeline && (
          <MapboxGL.ShapeSource id="timelineLocations" shape={geoJSON}>
            <MapboxGL.CircleLayer
              id="photoTimeline"
              style={{
                circleRadius: 8,
                circleColor: getTimelineColor(),
                circleStrokeWidth: 2,
                circleStrokeColor: "white",
              }}
            />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>
      
      {/* Controls Bar */}
      <Animated.View style={[styles.controlsBar, { height: animation }]}>
        
        {/* Toggle Button */}
        <TouchableOpacity
          style={styles.controlsToggle}
          onPress={toggleControls}
        >
          <MaterialIcons
            name={isControlsVisible ? "keyboard-arrow-up" : "layers"}
            size={30}
            color="#FFF"
          />
        </TouchableOpacity>

        {/* Expanded Control Bar Buttons */}
        {isControlsVisible &&
          Object.entries(layerVisibility).map(([layer, isVisible]) => (
            <TouchableOpacity
              key={layer}
              style={styles.controlsButton}
              onPress={() => toggleLayer(layer as keyof LayerVisibility)}
            >
              {layer === "points" && (
                <FontAwesome
                  name="map-pin"
                  size={30}
                  color={isVisible ? "#FFD700" : "#FFF"}
                />
              )}
              {layer === "heatmap" && (
                <FontAwesome
                  name="dot-circle-o"
                  size={30}
                  color={isVisible ? "#FFD700" : "#FFF"}
                />
              )}
              {layer === "clusters" && (
                <MaterialIcons
                  name="group-work"
                  size={30}
                  color={isVisible ? "#FFD700" : "#FFF"}
                />
              )}
              {layer === "timeline" && (
                <FontAwesome
                  name="clock-o"
                  size={30}
                  color={isVisible ? "#FFD700" : "#FFF"}
                />
              )}
            </TouchableOpacity>
          ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  map: {
    flex: 1,
  },
  controlsBar: {
    position: "absolute",
    right: 25, // Adjust this value to move the bar away from the screen edge
    top: 140, // Position below the compass icon (adjust as needed)
    width: 70,
    backgroundColor: "rgba(62, 75, 90, 1.0)",
    borderRadius: 40,
    zIndex: 2,
    alignItems: "center",
    overflow: "hidden", // Prevent content from spilling out
    paddingVertical: 10
  },
  controlsBarCollapsed: {
    width: 70,
    height: 70,
    justifyContent: "center", // Center content vertically
    paddingVertical: 5,
  },
  controlsBarExpanded: {
    width: 70,
    height: "auto", // Let it grow dynamically when expanded
    paddingVertical: 10,
  },
  controlsToggle: {
    alignItems: "center", // Center horizontally
    justifyContent: "center", // Center vertically
    width: "100%",
    paddingVertical: 10,
  },
  controlsButton: {
    marginVertical: 6, // Reduce spacing between icons
    alignItems: "center",
    paddingVertical: 7,
    borderRadius: 10,
    width: "100%",
    backgroundColor: "transparent",
  },
});

export default LocationViewer;
