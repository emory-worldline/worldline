import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapboxGL from "@rnmapbox/maps";
import { STORAGE_KEYS } from "@/types/mediaTypes";
import type { PhotoLocation } from "@/types/mediaTypes";
import { useIsFocused } from "@react-navigation/native";
import Colors from "@/constants/Colors";

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
  const [zoomLevel, setZoomLevel] = useState(13);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadClusters();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isFocused]);

  useEffect(() => {
    if (clusters.length > 0 && selectedCluster === null) {
      handleClusterSelect(0);
    }
  }, [clusters]);

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
      } else {
        setClusters([]);
        setSelectedCluster(null);
      }
    } catch (error) {
      console.error("Error loading clusters:", error);
    }
  };

  const handleClusterSelect = (index: number) => {
    setSelectedCluster(index);
    if (clusters[index]) {
      const { boundingBox } = clusters[index];

      // Calculate center of bounding box
      const centerLat = (boundingBox.minLat + boundingBox.maxLat) / 2;
      const centerLng = (boundingBox.minLong + boundingBox.maxLong) / 2;

      // Calculate appropriate zoom level based on bounding box size
      const latDiff = Math.abs(boundingBox.maxLat - boundingBox.minLat);
      const lngDiff = Math.abs(boundingBox.maxLong - boundingBox.minLong);
      const maxDiff = Math.max(latDiff, lngDiff);

      let zoomLevel;
      if (maxDiff > 0.1)
        zoomLevel = 12; // Very large cluster
      else if (maxDiff > 0.01)
        zoomLevel = 13; // Large cluster
      else if (maxDiff > 0.001)
        zoomLevel = 15; // Medium cluster
      else if (maxDiff > 0.0001)
        zoomLevel = 17; // Small cluster
      else zoomLevel = 18;
      setZoomLevel(zoomLevel);

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

      setMapCenter([centerLng, centerLat]);
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
              zoomLevel={zoomLevel}
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
                  circleColor: Colors.PRIMARY_BLUE,
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
        showsVerticalScrollIndicator={false}
      >
        {clusters.length > 0 ? (
          clusters.map((cluster, index) => {
            const startDate = new Date(cluster.locations[0].timestamp);
            const endDate = new Date(
              cluster.locations[cluster.locations.length - 1].timestamp,
            );
            const isSameDay =
              startDate.toDateString() === endDate.toDateString();

            return (
              <Pressable
                key={index}
                onPress={() => handleClusterSelect(index)}
                style={({ pressed }) => [
                  styles.clusterCard,
                  selectedCluster === index && styles.selectedCard,
                  pressed && styles.pressedCard,
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.photoCount}>
                    {cluster.locations.length}
                  </Text>
                  <Text style={styles.photoText}>photos</Text>
                </View>
                <Text style={styles.dateText}>
                  {isSameDay
                    ? startDate.toLocaleDateString()
                    : `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No clusters found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Map related styles
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

  // Point annotation styles
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

  // Scroll/list styles
  scrollContainer: {
    flex: 1,
    marginBottom: 130,
  },
  scrollContent: {
    padding: 16,
  },
  clusterCard: {
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedCard: {
    backgroundColor: "#1E3A5F",
    borderColor: "#3FBCF4",
    borderWidth: 1,
  },
  pressedCard: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  photoCount: {
    fontSize: 24,
    fontWeight: "600",
    color: "white",
  },
  photoText: {
    fontSize: 16,
    color: "#999",
  },
  dateText: {
    color: "#999",
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});
