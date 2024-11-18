import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Button,
  SafeAreaView,
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
import LibraryAnalyzer from "@/components/LibraryStats";
import StatGraph from "@/components/StatGraph";
import StatPieChart from "@/components/StatPieChart";

export default function StatsScreen() {
  const [stats, setStats] = useState<MediaStats>(initialMediaStats);
  const isFocused = useIsFocused();

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

  return (
    <SafeAreaView style={{ backgroundColor: "#212121" }}>
      <ScrollView>
        <View style={{ margin: 12 }}>
          <View style={{ overflow: "hidden" }}>
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
          }}
        >
          <StatPieChart data={stats.cameraModels} title="Camera Model" />
          <StatPieChart data={stats.aspectRatios} title="Aspect Ratio" />
        </View>
        <LibraryAnalyzer />
      </ScrollView>
    </SafeAreaView>
  );
}
