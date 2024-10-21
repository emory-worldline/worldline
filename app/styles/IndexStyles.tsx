import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#212121",
  },
  globe: {
    position: "absolute",
    top: -100,
    width: 500,
    height: 620,
  },
  // Gradient text styling
  textGradient: {
    fontWeight: "bold",
    fontSize: 64,
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
    lineHeight: 80,
  },
  buttonContainer: {
    flex: 1,
    width: 240,
    height: 75,
    alignItems: "center",
    justifyContent: "center",
  },
});
