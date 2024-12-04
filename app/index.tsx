import { View, Button, Image, Alert } from "react-native";
import { styles } from "./styles/IndexStyles";
import GradientText from "@/components/GradientText";
import GradientButton from "@/components/GradientButton";
import PrivacyPolicyButton from "@/components/PrivacyPolicyButton";
import { useMediaProcessing } from "@/hooks/useMediaProcessing";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/types/mediaTypes";

const Globe = require("../assets/images/animated_globe.gif");

const showPrivacyPolicy = () => {
    Alert.alert(
        'Privacy Policy',
        `Worldline values the privacy of its users. As such, we are committed to informing our users about what data is accessed by the application and how it is used.
        The purpose of Worldline is to serve as an easy, legible, and interactive visualization of location data associated with the user’s photos. To achieve this, Worldline requires access to the following data:
        - Photos saved on the user’s device
         - The date, time, and location of the user’s photos
         - Other photo metadata, including aspect ratios, device used to take photo, and file type
        Upon opening the application for the first time, Worldline will request access to your photos.
        While this request can be denied, granting Worldline camera roll access is strongly recommended, as the application will not function correctly without it.
        Once access is granted, Worldline will not request it again on subsequent uses but will instead automatically begin fetching data.
        Please note that you can enable or disable Worldline’s camera roll access at any time through your device’s settings app.
        In order to keep our users’ data safe and private, we do not store any user data.
        Photos and their metadata will not leave the device they started on, and only the individual user will have access to their personal data.
        Upon each startup, the application will fetch photo metadata that is used only locally on the user’s own device.
        Upon closing the application, it will no longer retain access to photos or photo metadata.`,
        [ { text: 'OK' } ],

    );

};

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

      <Button title="Privacy Policy" onPress={showPrivacyPolicy}/>
    </View>
  );
}
