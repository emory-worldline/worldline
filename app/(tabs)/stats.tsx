import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Button,
  SafeAreaView,
  Alert,
} from "react-native";
import {
  MediaStats,
  initialMediaStats,
  STORAGE_KEYS,
} from "@/types/mediaTypes";
import { useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StatsCarousel from "@/components/StatCarousel";
import { useMediaProcessing } from "@/hooks/useMediaProcessing";
import StatGraph from "@/components/StatGraph";
import StatPieChart from "@/components/StatPieChart";
import GradientButton from "@/components/GradientButton";
import { styles } from "../styles/IndexStyles";

export default function StatsScreen() {
  const [stats, setStats] = useState<MediaStats>(initialMediaStats);
  const isFocused = useIsFocused();
  const { status, startProcessing } = useMediaProcessing();

  const loadStoredStats = async () => {
    try {
      const storedStats = await AsyncStorage.getItem(STORAGE_KEYS.mediaStats);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.error("Error loading stored stats:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadStoredStats();
    }
  }, [isFocused]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#212121" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ margin: 12, marginBottom: 24, overflow: "hidden" }}>
          <View style={{}}>
            <StatGraph yearStats={stats.creationYears} />
          </View>
        </View>
        <StatsCarousel stats={stats} />
        <View
          style={{
            justifyContent: "center",
            flex: 1,
            flexDirection: "row",
            padding: 12,
            margin: 12,
            borderRadius: 8,
            backgroundColor: "#111111",
            marginTop: 24,
          }}
        >
          <StatPieChart data={stats.cameraModels} title="Camera Model" />
          <StatPieChart data={stats.aspectRatios} title="Aspect Ratio" />
        </View>
        <View
          style={{
            justifyContent: "center",
            flex: 1,
            flexDirection: "row",
            padding: 12,
            margin: 12,
            marginBottom: 24,
            borderRadius: 8,
            backgroundColor: "#111111",
          }}
        >
          <StatPieChart data={stats.orientations} title="Orientation" />
          <StatPieChart data={stats.timeOfDay} title="Time Of Day" />
        </View>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const buttonStyle = StyleSheet.create({
  buttonGradient: {
    width: 240,
    height: 75,
    borderRadius: 22.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 26,
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
