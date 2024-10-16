import React from "react";
import { Text, Pressable, StyleSheet } from "react-native";

export default function PrivacyPolicyButton() {
  return (
    <Pressable style={styles.buttonContainer}>
      <Text style={styles.buttonText}>Privacy Policy</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 95,
  },
  buttonText: {
    color: "#91A0B1",
    fontSize: 20,
  },
});
