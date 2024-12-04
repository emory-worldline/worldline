import { View, Text, StyleSheet, Alert } from "react-native";
import GradientButton from "@/components/GradientButton";
import GradientText from "@/components/GradientText";
import { useMediaProcessing } from "@/hooks/useMediaProcessing";

export default function SettingsScreen() {
  const { status, startProcessing } = useMediaProcessing();

  const reProcess = async () => {
    const permissionGranted = await startProcessing();
    if (!permissionGranted) {
      Alert.alert(
        "Please grant media library permissions to analyze your photos",
      );
      return;
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#212121",
      }}
    >
      <GradientText
        text={"Settings"}
        style={{
          textGradient: {
            fontWeight: "bold",
            fontSize: 64,
            textAlign: "center",
            justifyContent: "center",
            padding: 8,
          },
        }}
      />
      <View style={{ alignItems: "center" }}>
        <GradientButton
          text="Process Library"
          onPress={reProcess}
          style={buttonStyle}
        />
      </View>
      {status.isProcessing && (
        <View style={{ alignItems: "center", padding: 12 }}>
          <Text style={{ color: "white" }}>Progress: {status.progress}</Text>
        </View>
      )}
    </View>
  );
}

const buttonStyle = StyleSheet.create({
  buttonGradient: {
    width: 325,
    height: 75,
    borderRadius: 22.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
  },
  buttonContainer: {
    flex: 1,
    width: 325,
    height: 75,
    alignItems: "center",
    justifyContent: "center",
  },
});
