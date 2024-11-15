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

      <GradientButton text="Get Started" href="/(tabs)" style={styles} />

      <PrivacyPolicyButton />
    </View>
  );
}
