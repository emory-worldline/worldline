import React, { useEffect, useState } from "react";
import { View, Text, Switch, ScrollView, StyleSheet } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

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
  buildings: boolean; // Added buildings toggle
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
      <MapboxGL.MapView style={styles.map} projection="globe">
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
            minZoomLevel={12}
            maxZoomLevel={24}
            style={{
              fillExtrusionColor: "#aaa",
              fillExtrusionHeight: [
                "interpolate",
                ["linear"],
                ["zoom"],
                12,
                0,
                12.05,
                ["get", "height"],
              ],
              fillExtrusionBase: [
                "interpolate",
                ["linear"],
                ["zoom"],
                12,
                0,
                12.05,
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

      {/* Controls Panel */}
      <View style={styles.controlPanel}>
        <Text style={styles.title}>
          Photo Locations: {geoJSON.features.length}
        </Text>
        <ScrollView>
          {Object.entries(layerVisibility).map(([layer, isVisible]) => (
            <View key={layer} style={styles.toggleRow}>
              <Text style={styles.toggleText}>
                {layer.charAt(0).toUpperCase() + layer.slice(1)}
              </Text>
              <Switch
                value={isVisible}
                onValueChange={() =>
                  toggleLayer(layer as keyof LayerVisibility)
                }
              />
            </View>
          ))}
        </ScrollView>
      </View>
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
  controlPanel: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 10,
    borderRadius: 5,
    maxHeight: 300,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  toggleText: {
    marginRight: 10,
  },
});

export default LocationViewer;
