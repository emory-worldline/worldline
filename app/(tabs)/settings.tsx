import { View, Text, StyleSheet, Alert, Switch, Pressable } from "react-native";
import GradientButton from "@/components/GradientButton";
import GradientText from "@/components/GradientText";
import { useMediaProcessing } from "@/hooks/useMediaProcessing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/types/mediaTypes";
import Constants from "expo-constants";
import { useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import PrivacyPolicyButton from "@/components/PrivacyPolicyButton";
import { MapThemeContext } from "@/components/context/MapThemeContext";

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

  const clearData = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.mediaStats);
      await AsyncStorage.removeItem(STORAGE_KEYS.photoLocations);
      await AsyncStorage.removeItem(STORAGE_KEYS.worldLineLocations);
      await AsyncStorage.removeItem(STORAGE_KEYS.denseClusters);
      console.log("Storage successfully cleared");

      Alert.alert("Success", "Data cleared successfully.");
    } catch (error) {
      console.error("Error clearing storage:", error);
      Alert.alert("Error", "Failed to clear data");
    }
  };

  const { mapTheme, setMapTheme } = useContext(MapThemeContext);
  const themes = [
    { display: "Standard", value: "standard" },
    { display: "Dark", value: "dark" },
    { display: "Satellite", value: "satellite" },
  ];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 24,
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
            marginTop: 20,
          },
        }}
      />
      <View style={styles.mapThemeContainer}>
        <Text style={styles.settingText}>Map Themes</Text>
        <View style={styles.mapThemeOptionContainer}>
          {themes.map(({ display, value }) => (
            <Pressable
              key={value}
              onPress={() =>
                setMapTheme(value as "standard" | "dark" | "satellite")
              }
              style={[
                styles.mapThemeOption,
                { borderColor: mapTheme === value ? "#3FBCF4" : "grey" },
              ]}
            >
              <Text
                style={[
                  styles.settingText,
                  { fontWeight: mapTheme === value ? "bold" : "normal" },
                ]}
              >
                {display}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Pressable
        onPress={reProcess}
        style={[styles.settingContainer, { justifyContent: "center" }]}
        disabled={status.isProcessing}
      >
        {status.isProcessing ? (
          <View style={{ alignItems: "center", padding: 4 }}>
            <Text style={{ color: "white" }}>Progress: {status.progress}</Text>
          </View>
        ) : (
          <Text style={styles.settingText}>Reprocess User Data</Text>
        )}
      </Pressable>
      <Pressable
        disabled={status.isProcessing}
        onPress={clearData}
        style={[styles.settingContainer, { justifyContent: "center" }]}
      >
        <Text style={styles.settingText}>Clear User Data</Text>
      </Pressable>
      <View style={{ paddingVertical: 12 }}>
        <PrivacyPolicyButton />
      </View>

      <Text style={{ color: "grey" }}>
        {Constants.expoConfig?.name} {Constants.expoConfig?.version}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 325,
    height: 75,
    alignItems: "center",
    backgroundColor: "#212121",
    paddingHorizontal: 50,
  },
  settingText: {
    fontSize: 20,
    color: "white",
  },
  settingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 10,
    backgroundColor: "#3E4B5A",
    // borderWidth: 1,
    // borderColor: "#91A0B1",
    borderRadius: 10,
    width: "100%",
  },
  buttonText: {
    fontSize: 20,
    color: "white",
  },
  dropdownButton: {
    marginTop: 2,
  },
  mapThemeContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 10,
    backgroundColor: "#3E4B5A",
    marginTop: 40,
    borderRadius: 10,
    width: "100%",
  },
  mapThemeOptionContainer: {
    flexDirection: "column",
    padding: 10,
    justifyContent: "space-between",
    marginTop: 10,
    // borderWidth: 2,
  },
  mapThemeOption: {
    borderWidth: 2,
    borderColor: "grey",
    borderRadius: 10,
    paddingHorizontal: 70,
    paddingVertical: 10,
    marginVertical: 3,
    alignItems: "center",
  },
});
