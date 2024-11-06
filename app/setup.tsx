import React from "react";
import LibraryAnalyzer from "@/components/LibraryStats";
import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function Setup() {
  return (
    <View>
      <View style={styles.buttonContainer}>
        <LibraryAnalyzer />
      </View>
      <Link href={"/(tabs)"} style={styles.link}>
        Next Page
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: 200,
    marginLeft: 165,
  },
  buttonContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 3,
    width: 200,
    marginLeft: 100,
  },
});
