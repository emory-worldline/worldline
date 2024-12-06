import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapboxGL from "@rnmapbox/maps";
import { STORAGE_KEYS } from "@/types/mediaTypes";
import type { PhotoLocation } from "@/types/mediaTypes";

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

interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

type StoredCluster = {
  locations: PhotoLocation[];
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLong: number;
    maxLong: number;
  };
};

export default function ClusterViewScreen() {
  const [clusters, setClusters] = useState<StoredCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-84.32, 33.79]);
  const [heading, setHeading] = useState(0);
  const animationRef = useRef<number>();
  const [geoJSON, setGeoJSON] = useState<GeoJSONCollection>({
    type: "FeatureCollection",
    features: [],
  });

  useEffect(() => {
    loadClusters();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      setHeading((prev) => (prev + 0.1) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    if (selectedCluster !== null) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedCluster]);

  const loadClusters = async () => {
    try {
      const clustersData = await AsyncStorage.getItem(
        STORAGE_KEYS.denseClusters,
      );
      if (clustersData) {
        setClusters(JSON.parse(clustersData));
      }
    } catch (error) {
      console.error("Error loading clusters:", error);
    }
  };

  const handleClusterSelect = (index: number) => {
    setSelectedCluster(index);
    if (clusters[index] && clusters[index].locations.length > 0) {
      // Convert cluster points to GeoJSON
      const features: GeoJSONFeature[] = clusters[index].locations.map(
        (loc) => ({
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

      setMapCenter([
        clusters[index].locations[0].longitude,
        clusters[index].locations[0].latitude,
      ]);
      setHeading(0);
    }
  };

  return (
    <View style={styles.container}>
      {selectedCluster !== null && (
        <View style={styles.mapContainer}>
          <MapboxGL.MapView
            style={styles.map}
            styleURL="mapbox://styles/mapbox/satellite-streets-v12"
            rotateEnabled={true}
            pitchEnabled={true}
            compassEnabled={true}
          >
            <MapboxGL.Camera
              zoomLevel={13}
              centerCoordinate={mapCenter}
              pitch={45}
              heading={heading}
              animationMode="moveTo"
              animationDuration={0}
            />

            {/* 3D Buildings Layer */}
            <MapboxGL.FillExtrusionLayer
              id="building-extrusions"
              sourceLayerID="building"
              minZoomLevel={14}
              maxZoomLevel={24}
              style={{
                fillExtrusionColor: "#aaa",
                fillExtrusionHeight: [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  14,
                  0,
                  14.05,
                  ["get", "height"],
                ],
                fillExtrusionBase: [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  14,
                  0,
                  14.05,
                  ["get", "min_height"],
                ],
                fillExtrusionOpacity: 0.6,
              }}
              filter={["==", ["get", "extrude"], "true"]}
            />

            {/* Points Layer */}
            <MapboxGL.ShapeSource id="clusterPoints" shape={geoJSON}>
              <MapboxGL.CircleLayer
                id="pointLayer"
                style={{
                  circleRadius: 6,
                  circleColor: "#3FBCF4",
                  circleStrokeWidth: 2,
                  circleStrokeColor: "white",
                }}
              />
            </MapboxGL.ShapeSource>
          </MapboxGL.MapView>
        </View>
      )}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {clusters.length >= 0 ? (
          clusters.map((cluster, index) => (
            <Pressable key={index} onPress={() => handleClusterSelect(index)}>
              <View
                style={[
                  styles.buttonContainer,
                  selectedCluster === index && styles.selectedButton,
                ]}
              >
                <Text style={styles.buttonText}>
                  Cluster {index + 1} ({cluster.locations.length} photos)
                </Text>
                <Text style={styles.detailText}>
                  {new Date(
                    cluster.locations[0].timestamp,
                  ).toLocaleDateString()}
                  {" - "}
                  {new Date(
                    cluster.locations[cluster.locations.length - 1].timestamp,
                  ).toLocaleDateString()}
                </Text>
              </View>
            </Pressable>
          ))
        ) : (
          <Text>No Data</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
  },
  mapContainer: {
    height: "50%",
    width: "100%",
  },
  map: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    alignItems: "center",
  },
  buttonContainer: {
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    width: 286,
    height: 127,
    marginVertical: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#999",
  },
  selectedButton: {
    borderColor: "#3FBCF4",
  },
  annotationContainer: {
    width: 12,
    height: 12,
  },
  annotationPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3FBCF4",
    borderColor: "white",
    borderWidth: 2,
  },
});
