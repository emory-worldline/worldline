import { PieChart } from "react-native-gifted-charts";
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
      <ScrollView style={styles.container}>
        <View style={{ margin: 20, overflow: "hidden" }}>
          <StatGraph yearStats={stats.creationYears} />
        </View>
        <StatsCarousel stats={stats} />
        <View
          style={{
            justifyContent: "center",
            flex: 1,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <PieChart
            data={[{ value: 15 }, { value: 30 }, { value: 26 }, { value: 40 }]}
            radius={100}
          />
          <PieChart
            data={[{ value: 15 }, { value: 30 }, { value: 26 }, { value: 40 }]}
            radius={100}
          />
        </View>
        <LibraryAnalyzer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#212121",
  },
});
