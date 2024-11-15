import LibraryAnalyzer from "@/components/LibraryStats";
import { View, StyleSheet } from "react-native";

export default function StatsScreen() {
  return (
    <View style={styles.container}>
      <LibraryAnalyzer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    paddingTop: 40,
    padding: 10,
  },
});
