import React from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function PrivacyPolicyButton() {
  return (
    <Link href={"/privacy_policy"} style={styles.buttonContainer}>
      <Text style={styles.buttonText}>Privacy Policy</Text>
    </Link>
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
