import { View, Text, Switch, StyleSheet } from "react-native";
import { useContext } from "react";
import { DarkModeContext } from "@/components/context/DarkModeContext";

export default function SettingsScreen() {
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
      <View style={[styles.settingContainer, { justifyContent: "center" }]}>
        <Text style={styles.settingText}>Reprocess User Data</Text>
      </View>
      <View style={[styles.settingContainer, { justifyContent: "center" }]}>
        <Text style={styles.settingText}>Clear User Data</Text>
      </View>
      <View style={[styles.settingContainer, { justifyContent: "center" }]}>
        <Text style={styles.settingText}>Privacy Policy</Text>
      </View>
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
    // borderWidth: 1,
    // borderColor: "#91A0B1",
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
