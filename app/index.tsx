import { StyleSheet, Text, View } from "react-native";
import PhotoMetadata from "@/components/PhotoMetadata";
import MapComponent from "@/components/MapComponent"

const App = () => {
  return (
    <View style={styles.container}>
      <MapComponent />
      <PhotoMetadata />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1
  },
});

export default App;

// export default function Index() {
//   return <PhotoMetadata />;
// }
