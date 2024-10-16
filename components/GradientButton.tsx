import React from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type GradientButtonProps = {
  text: string;
};

export default function GradientButton(props: GradientButtonProps) {
  return (
    <LinearGradient
      colors={["rgba(53,203,169,1)", "rgba(109,53,183,1)"]}
      style={styles.gradient}
    >
      <Pressable style={styles.buttonContainer}>
        <Text style={styles.buttonText}>{props.text}</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: 240,
    height: 75,
    borderRadius: 22.5,
    marginTop: 60,
    padding: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    position: "relative",
    fontSize: 30,
    fontWeight: "bold",
    lineHeight: 45,
  },
  buttonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
