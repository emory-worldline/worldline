import { Text, StyleSheet, View } from "react-native";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map View</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    color: "white",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#212121",
  },
});
