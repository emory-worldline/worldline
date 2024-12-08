import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Animated, StyleSheet, Dimensions } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { LayerVisibility } from "./LocationViewer";
import * as ScreenOrientation from "expo-screen-orientation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";

interface ControlsBarProps {
  layerVisibility: LayerVisibility;
  toggleLayer: (layerName: keyof LayerVisibility) => void;
  isControlsVisible: boolean;
  toggleControls: () => void;
  animation: Animated.Value; // Animation state passed from parent
}

const ControlsBar: React.FC<ControlsBarProps> = ({
  layerVisibility,
  toggleLayer,
  isControlsVisible,
  toggleControls,
  animation,
}) => {
  const insets = useSafeAreaInsets();
  const [orientation, setOrientation] =
    useState<ScreenOrientation.Orientation | null>(null);

  useEffect(() => {
    (async () => {
      const currentOrientation = await ScreenOrientation.getOrientationAsync();
      setOrientation(currentOrientation);
    })();

    const subscription = ScreenOrientation.addOrientationChangeListener(
      (event) => {
        setOrientation(event.orientationInfo.orientation);
      }
    );

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  const isLandscape =
    orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
    orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

  const margin = 20;
  return (
    <Animated.View
      style={[
        styles.controlsBar,
        isLandscape
          ? {
            top: insets.top + 20,
            right: insets.right + 15,
            flexDirection: "row-reverse",
            height: 70,
            width: animation,
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 6,
            }
          : {
              top: insets.top + 70,
              right: insets.right + 15,
              flexDirection: "column",
              height: animation,
              width: 70,
            },
      ]}
    >
      <TouchableOpacity style={styles.controlsToggle} onPress={toggleControls}>
        <MaterialIcons
          name={isControlsVisible ? (isLandscape ? "keyboard-arrow-left" : "keyboard-arrow-up") : "layers"}
          size={30}
          color="#FFF"
        />
      </TouchableOpacity>

      {isControlsVisible &&
        (
          Object.entries(layerVisibility) as [keyof LayerVisibility, boolean][]
        ).map(([layer, isVisible]) => (
          <TouchableOpacity
            key={layer}
            style={styles.controlsButton}
            onPress={() => toggleLayer(layer)}
          >
            {layer === "points" && (
              <FontAwesome
                name="map-pin"
                size={30}
                color={isVisible ? Colors.GOLD : "#FFF"}
              />
            )}
            {layer === "heatmap" && (
              <FontAwesome
                name="dot-circle-o"
                size={30}
                color={isVisible ? Colors.GOLD : "#FFF"}
              />
            )}
            {layer === "clusters" && (
              <MaterialIcons
                name="group-work"
                size={30}
                color={isVisible ? Colors.GOLD : "#FFF"}
              />
            )}
            {layer === "timeline" && (
              <FontAwesome
                name="clock-o"
                size={30}
                color={isVisible ? Colors.GOLD : "#FFF"}
              />
            )}
            {layer === "buildings" && (
              <FontAwesome
                name="building"
                size={30}
                color={isVisible ? Colors.GOLD : "#FFF"}
              />
            )}
            {layer === "worldline" && (
              <FontAwesome
                name="search"
                size={30}
                color={isVisible ? "#FFD700" : "#FFF"}
              />
            )}
          </TouchableOpacity>
        ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  controlsBar: {
    position: "absolute",
    backgroundColor: "rgba(62, 75, 90, 1.0)",
    borderRadius: 40,
    zIndex: 2,
    overflow: "hidden",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  controlsToggle: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  controlsButton: {
    marginVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "transparent",
    paddingVertical: 8,
    paddingHorizontal: 6,
    //minWidth: 40,
    //minHeight: 40,
  },
});

export default ControlsBar;