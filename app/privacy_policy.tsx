import { StyleSheet, Text, View } from "react-native";
import React from "react";

export default function PrivacyPolicy() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Privacy Policy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#212121",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
  },
});
