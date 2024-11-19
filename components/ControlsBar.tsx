import React from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { LayerVisibility } from "./LocationViewer";

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
  return (
    <Animated.View style={[styles.controlsBar, { height: animation }]}>
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

      {isControlsVisible &&
        (Object.entries(layerVisibility) as [keyof LayerVisibility, boolean][]).map(([layer, isVisible]) => (
          <TouchableOpacity
            key={layer}
            style={styles.controlsButton}
            onPress={() => toggleLayer(layer)}
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
  );
};

const styles = StyleSheet.create({
  controlsBar: {
    position: "absolute",
    right: 20,
    top: 140,
    width: 70,
    backgroundColor: "rgba(62, 75, 90, 1.0)",
    borderRadius: 40,
    zIndex: 2,
    alignItems: "center",
    overflow: "hidden",
    paddingVertical: 10
  },
  controlsToggle: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 10,
  },
  controlsButton: {
    marginVertical: 6,
    alignItems: "center",
    paddingVertical: 7,
    borderRadius: 10,
    width: "100%",
    backgroundColor: "transparent",
  },
});

export default ControlsBar;