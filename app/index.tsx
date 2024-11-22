import { View, Image, Alert } from "react-native";
import { styles } from "./styles/IndexStyles";
import GradientText from "@/components/GradientText";
import GradientButton from "@/components/GradientButton";
import PrivacyPolicyButton from "@/components/PrivacyPolicyButton";
import { useMediaProcessing } from "@/hooks/useMediaProcessing";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/types/mediaTypes";

const Globe = require("../assets/images/animated_globe.gif");

export default function Index() {
  const { status, startProcessing } = useMediaProcessing();
  const router = useRouter();

  const handleStart = async () => {
    const storedStats = await AsyncStorage.getItem(STORAGE_KEYS.mediaStats);
    if (storedStats) {
      router.push("/(tabs)");
    } else {
      const permissionGranted = await startProcessing();
      if (!permissionGranted) {
        Alert.alert(
          "Please grant media library permissions to analyze your photos",
        );
        return;
      }
      router.push("/(tabs)");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.globe}>
        <Image source={Globe} style={styles.globe}></Image>
      </View>

      <GradientText text="worldline" style={styles} />

      <GradientButton text="Get Started" onPress={handleStart} style={styles} />

      <PrivacyPolicyButton />
    </View>
  );
}
