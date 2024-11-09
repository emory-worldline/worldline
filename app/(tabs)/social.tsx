import { View, Text, StyleSheet } from "react-native";

export default function SocialScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Social</Text>
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
