import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const GradientBackground = (props: any) => (
  <LinearGradient
    colors={["#2B2672", "#212121"]}
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    locations={[0, 0.55]}
    style={styles.gradientBackground}
    {...props}
  />
);

export const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  globe: {
    position: "absolute",
    top: -100,
    width: 500,
    height: 620,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  // Gradient text styling
  textGradient: {
    fontWeight: "bold",
    fontSize: 75,
    lineHeight: 96,
    textAlign: "center",
    justifyContent: "center",
    marginTop: 200,
  },
  // Gradient button styling
  buttonLink: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 75,
    width: 240,
    padding: 0,
  },
  buttonGradient: {
    width: 240,
    height: 75,
    borderRadius: 22.5,
    marginTop: 80,
    padding: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    lineHeight: 0,
  },
  buttonContainer: {
    flex: 1,
    width: 240,
    height: 75,
    alignItems: "center",
    justifyContent: "center",
  },
});
