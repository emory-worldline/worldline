import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import ControlsBar from "./ControlsBar";
import { useContext } from "react";
import { STORAGE_KEYS } from "@/types/mediaTypes";
import { MapThemeContext } from "@/components/context/MapThemeContext";

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

export interface LayerVisibility {
  points: boolean;
  heatmap: boolean;
  clusters: boolean;
  timeline: boolean;
  buildings: boolean;
  worldline: boolean;
}

const LocationViewer: React.FC = () => {
  const [geoJSON, setGeoJSON] = useState<{
    type: "FeatureCollection";
    features: GeoJSONFeature[];
  }>({ type: "FeatureCollection", features: [] });
  const [geoJSONLine, setGeoJSONLine] = useState<
    GeoJSON.FeatureCollection<GeoJSON.LineString>
  >({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [],
        },
        properties: {},
      },
    ],
  });
  const [worldlineCoordinates, setWorldlineCoordinates] = useState<
    [number, number][]
  >([]);

  const [interpolatedCoords, setInterpolatedCoords] = useState<
    [number, number][]
  >([]);

  // Camera States
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const previousZoomLevelRef = useRef<number>(14); // To prevent sharp zoom changes

  // Worldline Animation States
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalPointsRef = useRef<number>(0);
  const animationDurationRef = useRef<number>(0);
  const timePerPointRef = useRef<number>(0);
  const indexRef = useRef<number>(0);

  const [center, setCenter] = useState<[number, number]>([-122.4324, 37.7882]);

  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    points: true,
    heatmap: false,
    clusters: false,
    timeline: false,
    buildings: true, // Default buildings to visible
    worldline: false,
  });

  // animate controls bar
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const interpolateLine = (
    coordinates: [number, number][],
    numPointsBetween: number,
  ): [number, number][] => {
    const interpolatedCoordinates: [number, number][] = [];

    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];

      interpolatedCoordinates.push(start);

      for (let j = 1; j <= numPointsBetween; j++) {
        const t = j / (numPointsBetween + 1);
        const interpolatedPoint: [number, number] = [
          start[0] + (end[0] - start[0]) * t,
          start[1] + (end[1] - start[1]) * t,
        ];
        interpolatedCoordinates.push(interpolatedPoint);
      }
    }

    interpolatedCoordinates.push(coordinates[coordinates.length - 1]);

    return interpolatedCoordinates;
  };

  const animation = useRef(new Animated.Value(70)).current;
  const toggleControls = () => {
    setIsControlsVisible((prev) => !prev);
    Animated.timing(animation, {
      toValue: isControlsVisible ? 70 : 410, // target height (collapsed: first value, expanded: second value)
      duration: 300, // animation duration in ms
      useNativeDriver: false,
    }).start();
  };

  // Load locations from storage
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationsString = await AsyncStorage.getItem(
          STORAGE_KEYS.photoLocations,
        );
        const worldlineString = await AsyncStorage.getItem(
          STORAGE_KEYS.worldLineLocations,
        );
        if (locationsString && worldlineString) {
          const locations = JSON.parse(locationsString);
          const validLocations = locations.filter(
            (loc: any) => loc.latitude && loc.longitude,
          );

          const worldlineLocations = JSON.parse(worldlineString);
          const validWorldlineLocations = worldlineLocations.filter(
            (loc: any) => loc.latitude && loc.longitude,
          );

          // console.log("validWorldlineLocations:", validWorldlineLocations);

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

          const worldlineFeatures: GeoJSONFeature[] =
            validWorldlineLocations.map((loc: PhotoLocation) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [loc.longitude, loc.latitude],
              },
              properties: {
                id: loc.id,
                timestamp: loc.timestamp,
              },
            }));

          // console.log("worldlineFeatures:", worldlineFeatures);

          setGeoJSON({
            type: "FeatureCollection",
            features,
          });

          const worldlineCoordinates: [number, number][] =
            worldlineFeatures.map((feature) => feature.geometry.coordinates);

          setWorldlineCoordinates(worldlineCoordinates);

          const numPointsBetween = 75;
          const interpolatedCoords = interpolateLine(
            worldlineCoordinates,
            numPointsBetween,
          );

          setInterpolatedCoords(interpolatedCoords);

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

  // Initialize camera position
  useEffect(() => {
    if (interpolatedCoords.length > 0 && !isCameraInitialized) {
      const initialCoordinate = interpolatedCoords[0];
      cameraRef.current?.setCamera({
        centerCoordinate: initialCoordinate,
        zoomLevel: 1, // Adjust zoom level as needed
        pitch: 55, // Adjust pitch as needed
        animationDuration: 0,
      });
      setIsCameraInitialized(true);
    }
  }, [interpolatedCoords, isCameraInitialized]);

  // Convert degrees to radians
  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  // Haversine Formula courtesy of ChatGPT
  const getDistanceInKm = (
    coord1: [number, number],
    coord2: [number, number],
  ) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d; // Distance in km
  };

  const getZoomLevelForDistance = (distanceInKm: number) => {
    if (distanceInKm < 0.1) {
      // Less than 100 meters
      return 16;
    } else if (distanceInKm < 0.5) {
      // Less than 500 meters
      return 12;
    } else {
      return 2;
    }
  };

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

  const { mapTheme } = useContext(MapThemeContext);

  const mapStyles = {
    standard: "mapbox://styles/mapbox/streets-v11",
    dark: "mapbox://styles/mapbox/dark-v11",
    satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  };

  let styleURL = mapStyles[mapTheme] || mapStyles.standard;

  let redrawCounter = 1;
  const animateLine = (timestamp: number) => {
    // console.log("Animation frame called");
    // console.log(`Progress: ${timestamp - startTimeRef.current}`);
    // console.log(`Current index: ${indexRef.current}`);
    // console.log(`Total interpolated coords: ${interpolatedCoords.length}`);
    // console.log("timeperPointRef.current:", timePerPointRef.current);

    redrawCounter = redrawCounter + 1;
    const progress = timestamp - startTimeRef.current;
    // console.log("progress:", progress);
    const pointsToAdd = Math.max(
      Math.floor(progress / timePerPointRef.current),
      indexRef.current + 1,
    );

    const newIndex = Math.min(pointsToAdd, interpolatedCoords.length - 1);
    const newCoords = interpolatedCoords.slice(0, newIndex + 1);

    const currentCoordinates = worldlineCoordinates.slice(
      0,
      Math.floor(
        newIndex / (interpolatedCoords.length / worldlineCoordinates.length),
      ) + 1,
    );

    if (
      pointsToAdd > indexRef.current &&
      indexRef.current < interpolatedCoords.length
    ) {
      if (redrawCounter % 75 === 0) {
        // console.log("redraw counter if statement entered");
        setGeoJSONLine((prev) => ({
          ...prev,
          features: [
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: currentCoordinates,
              },
              properties: {},
            },
          ],
        }));
        // console.log("line reset");
      }

      setGeoJSONLine((prev) => ({
        ...prev,
        features: [
          {
            ...prev.features[0],
            geometry: {
              ...prev.features[0].geometry,
              coordinates: newCoords,
            },
          },
        ],
      }));
      indexRef.current = newIndex;

      const coordinate = interpolatedCoords[newIndex];

      let targetZoomLevel = 1; // Default to most zoomed out
      if (newIndex > 0) {
        if (newIndex < interpolatedCoords.length - 1) {
          const nextCoord = interpolatedCoords[newIndex + 1];
          const distance = getDistanceInKm(nextCoord, coordinate);

          targetZoomLevel = getZoomLevelForDistance(distance);

          // Smooth zoom interpolation
          const zoomTransitionFactor = 0.95; // Adjust between 0 (no change) and 1 (immediate change)
          const smoothZoomLevel =
            previousZoomLevelRef.current +
            (targetZoomLevel - previousZoomLevelRef.current) *
              zoomTransitionFactor;

          previousZoomLevelRef.current = smoothZoomLevel;
          targetZoomLevel = smoothZoomLevel;
        } else {
          targetZoomLevel = 3;
        }

        cameraRef.current?.setCamera({
          centerCoordinate: coordinate,
          zoomLevel: targetZoomLevel,
          pitch: 45,
          animationDuration: timePerPointRef.current,
          animationMode: "flyTo",
        });
      }

      if (
        progress < animationDurationRef.current &&
        indexRef.current < interpolatedCoords.length
      ) {
        animationRef.current = requestAnimationFrame(animateLine);
      }
    } else {
      console.log("Animation conditions not met");
      console.log(`pointsToAdd: ${pointsToAdd}`);
      console.log(`indexRef.current: ${indexRef.current}`);
      console.log(`interpolatedCoords.length: ${interpolatedCoords.length}`);
    }
  };
  useEffect(() => {
    if (layerVisibility.worldline && interpolatedCoords.length > 0) {
      // Reset Camera
      setIsCameraInitialized(false);

      // Start the animation
      startTimeRef.current = performance.now();
      totalPointsRef.current = interpolatedCoords.length;
      animationDurationRef.current = worldlineCoordinates.length * 2500; // 1000 = 1 second
      timePerPointRef.current =
        animationDurationRef.current / totalPointsRef.current;

      indexRef.current = 0;
      setGeoJSONLine((prev) => ({
        ...prev,
        features: [
          {
            ...prev.features[0],
            geometry: {
              type: "LineString",
              coordinates: [],
            },
          },
        ],
      }));
      // console.log("useEffect requestAnimationFrame");
      animationRef.current = requestAnimationFrame(animateLine);

      // Add a cleanup to set final line after animation completes
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }

        // Set final line using original coordinates
        setGeoJSONLine((prev) => ({
          ...prev,
          features: [
            {
              ...prev.features[0],
              geometry: {
                type: "LineString",
                coordinates: worldlineCoordinates, // Use original coordinates
              },
            },
          ],
        }));
      };
    } else {
      // Stop the animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clear the line
      // console.log("clearing line");
      setGeoJSONLine((prev) => ({
        ...prev,
        features: [
          {
            ...prev.features[0],
            geometry: {
              type: "LineString",
              coordinates: [],
            },
          },
        ],
      }));
    }
  }, [layerVisibility.worldline, interpolatedCoords]);
  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={styleURL}
        projection="globe"
        rotateEnabled={true}
        pitchEnabled={true}
        compassEnabled={true}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={1}
          centerCoordinate={center}
          pitch={0}
          animationMode="easeTo"
          animationDuration={1000}
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

        {/* Worldline Layer */}
        {layerVisibility.worldline && (
          <MapboxGL.ShapeSource id="worldline" shape={geoJSONLine}>
            <MapboxGL.LineLayer
              id="line-layer"
              style={{
                lineColor: "#ed6498",
                lineWidth: 4,
                lineOpacity: 0.7,
                lineCap: "round",
                lineJoin: "round",
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
