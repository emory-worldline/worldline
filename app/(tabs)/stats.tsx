import { View, ScrollView, SafeAreaView, Text } from "react-native";
import {
  MediaStats,
  getInitialMediaStats,
  STORAGE_KEYS,
} from "@/types/mediaTypes";
import { useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StatsCarousel from "@/components/StatCarousel";
import StatGraph from "@/components/StatGraph";
import StatPieChart from "@/components/StatPieChart";
import GradientText from "@/components/GradientText";

export default function StatsScreen() {
  const [stats, setStats] = useState<MediaStats>(getInitialMediaStats());
  const isFocused = useIsFocused();

  const loadStoredStats = async () => {
    try {
      const storedStats = await AsyncStorage.getItem(STORAGE_KEYS.mediaStats);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      } else {
        setStats(getInitialMediaStats());
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

  const hasData =
    Object.values(stats.creationYears).length > 0 ||
    Object.values(stats.cameraModels).length > 0 ||
    Object.values(stats.aspectRatios).length > 0 ||
    Object.values(stats.fileTypes).length > 0 ||
    Object.values(stats.timeOfDay).length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#212121" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <GradientText
          text={"Statistics"}
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
        {hasData ? (
          <>
            <View
              style={{
                margin: 12,
                marginBottom: 20,
                backgroundColor: "#111111",
                padding: 8,
                borderRadius: 8,
              }}
            >
              <StatGraph yearStats={stats.creationYears} />
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
                marginVertical: 20,
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
                marginTop: 0,
                marginBottom: 20,
                borderRadius: 8,
                backgroundColor: "#111111",
              }}
            >
              <StatPieChart data={stats.fileTypes} title="File Type" />
              <StatPieChart data={stats.timeOfDay} title="Time Of Day" />
            </View>
          </>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text style={{ color: "white", fontSize: 18 }}>
              No data available
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
