import { Text, View, Image, Button, StyleSheet } from "react-native";
import GradientText from "@/components/GradientText";
import GradientButton from "@/components/GradientButton";
import PrivacyPolicyButton from "@/components/PrivacyPolicyButton";

const Globe = require("../assets/images/animated_globe.gif");

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.globe}>
        <Image source={Globe} style={styles.globe}></Image>
      </View>

      <GradientText text="worldline" style={styles.title} />

      <GradientButton text="Get Started" />

      <PrivacyPolicyButton />
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
  title: {
    fontWeight: "bold",
    fontSize: 64,
    lineHeight: 96,
    textAlign: "center",
    justifyContent: "center",
    marginTop: 150,
  },
  globe: {
    position: "absolute",
    top: -130,
    width: 500,
    height: 620,
  },
  buttonContainer: {
    backgroundColor: "#FFFFFF",
  },
});
