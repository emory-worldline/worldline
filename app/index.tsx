import { View, Image, StyleSheet } from "react-native";
import { styles } from "./styles/IndexStyles";
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

      <GradientText text="worldline" style={styles} />

      <GradientButton text="Get Started" href="/setup" style={styles} />

      <PrivacyPolicyButton />
    </View>
  );
}

const test = StyleSheet.create({
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
    marginTop: 200,
  },
  globe: {
    position: "absolute",
    top: -100,
    width: 500,
    height: 620,
  },
});
