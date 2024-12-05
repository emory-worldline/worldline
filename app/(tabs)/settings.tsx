import { View, Text, StyleSheet, Alert, Switch, Pressable } from "react-native";
import { useMediaProcessing } from "@/hooks/useMediaProcessing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/types/mediaTypes";
import Constants from "expo-constants";
import { useContext } from "react";
import { DarkModeContext } from "@/components/context/DarkModeContext";

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
      console.log("Storage successfully cleared");

      Alert.alert("Success", "Data cleared successfully.");
    } catch (error) {
      console.error("Error clearing storage:", error);
      Alert.alert("Error", "Failed to clear data");
    }
  };

  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

  return (
    <View style={styles.container}>
      <View style={styles.settingContainer}>
        <Text style={styles.settingText}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>
      <View style={styles.mapThemeContainer}>
        <Text style={styles.settingText}>Map Themes</Text>
        <View style={styles.mapThemeOptionContainer}>
          <View style={[styles.mapThemeOption, { borderColor: "#3FBCF4" }]}>
            <Text style={styles.settingText}>Standard</Text>
          </View>
          <View style={styles.mapThemeOption}>
            <Text style={styles.settingText}>Street</Text>
          </View>
          <View style={styles.mapThemeOption}>
            <Text style={styles.settingText}>Satellite</Text>
          </View>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.settingContainer,
          { justifyContent: "center" },
          pressed ? { opacity: 0.9 } : {},
        ]}
        onPress={reProcess}
      >
        <Text style={styles.settingText}>Process User Data</Text>
      </Pressable>
      {status.isProcessing && (
        <View style={{ alignItems: "center", padding: 12 }}>
          <Text style={{ color: "white" }}>Progress: {status.progress}</Text>
        </View>
      )}
      <Pressable
        style={({ pressed }) => [
          styles.settingContainer,
          { justifyContent: "center" },
          pressed ? { opacity: 0.9 } : {},
        ]}
        onPress={clearData}
      >
        <Text style={styles.settingText}>Clear User Data</Text>
      </Pressable>
      <View
        style={[
          styles.settingContainer,
          { justifyContent: "center", marginBottom: 15 },
        ]}
      >
        <Text style={styles.settingText}>Privacy Policy</Text>
      </View>
      <Text style={{ color: "grey" }}>
        {Constants.expoConfig?.name} {Constants.expoConfig?.version}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
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
    borderRadius: 10,
    width: "100%",
  },
  mapThemeOptionContainer: {
    flexDirection: "column",
    padding: 10,
    justifyContent: "space-between",
    marginTop: 10,
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
