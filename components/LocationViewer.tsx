import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
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

const STORAGE_KEYS = {
  photoLocations: "photoLocations",
} as const;

const LocationViewer: React.FC = () => {
  const [geoJSON, setGeoJSON] = useState<{
    type: "FeatureCollection";
    features: GeoJSONFeature[];
  }>({ type: "FeatureCollection", features: [] });
  const [center, setCenter] = useState<[number, number]>([-122.4324, 37.7882]);

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

          // Calculate center if we have locations
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

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <MapboxGL.MapView
        style={{ width: `100%`, height: `100%` }}
        projection="globe"
      >
        <MapboxGL.Camera
          zoomLevel={1}
          centerCoordinate={center}
          pitch={0}
          animationMode="moveTo"
          animationDuration={0}
        />

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
      </MapboxGL.MapView>

      <View
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          backgroundColor: "rgba(255,255,255,0.8)",
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text>Photo Locations: {geoJSON.features.length}</Text>
      </View>
    </View>
  );
};

export default LocationViewer;
