import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useIsFocused } from "@react-navigation/native";
import { PhotoLocation, STORAGE_KEYS } from "@/types/mediaTypes";
import ControlsBar from "./ControlsBar";
import { useContext } from "react";
import { DarkModeContext } from "@/components/context/DarkModeContext";

MapboxGL.setAccessToken(Constants.expoConfig?.extra?.mapboxPublicKey || "");

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

export interface LayerVisibility {
  points: boolean;
  heatmap: boolean;
  clusters: boolean;
  timeline: boolean;
  buildings: boolean;
}

const LocationViewer: React.FC = () => {
  const isFocused = useIsFocused();
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

  // animate controls bar
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const animation = useRef(new Animated.Value(70)).current;
  const toggleControls = () => {
    setIsControlsVisible((prev) => !prev);
    Animated.timing(animation, {
      toValue: isControlsVisible ? 70 : 300, // target height (collapsed: first value, expanded: second value)
      duration: 300, // animation duration in ms
      useNativeDriver: false,
    }).start();
  };

  // Load locations from storage
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
      } else {
        setGeoJSON({ type: "FeatureCollection", features: [] });
      }
    } catch (error) {
      console.error("Error loading locations:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadLocations();
    }
  }, [isFocused]);

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

  const { isDarkMode } = useContext(DarkModeContext);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={isDarkMode ? "mapbox://styles/mapbox/dark-v11" : ""}
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
      <ControlsBar
        layerVisibility={layerVisibility}
        toggleLayer={toggleLayer}
        isControlsVisible={isControlsVisible}
        toggleControls={toggleControls}
        animation={animation} // Pass animation state
      />
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
});

export default LocationViewer;
