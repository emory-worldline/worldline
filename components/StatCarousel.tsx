import * as React from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import StatHighlight from "./StatHighlight";

interface MediaStats {
  highest: number;
  lowest: number;
  fastest: number;
  localPhotos: number;
  localVideos: number;
  longestVideo: number;
  totalVideoDuration: number;
}

const window = Dimensions.get("window");
const PAGE_WIDTH = window.width;
const COUNT = 3;

interface StatConfig {
  key: keyof MediaStats;
  title: string;
  emoji: string;
}

const STAT_CONFIGS: StatConfig[] = [
  { key: "highest", title: "Highest Photo", emoji: "🏔️" },
  { key: "lowest", title: "Lowest Photo", emoji: "↓" },
  { key: "fastest", title: "Fastest Photo", emoji: "⚡️" },
  { key: "localPhotos", title: "Local Photos", emoji: "📷" },
  { key: "localVideos", title: "Local Videos", emoji: "🎥" },
  { key: "longestVideo", title: "Longest Video", emoji: "📼" },
  { key: "totalVideoDuration", title: "Total Video Duration", emoji: "📀" },
];

interface StatsCarouselProps {
  stats: MediaStats;
}

function StatsCarousel({ stats }: StatsCarouselProps) {
  const baseOptions = {
    vertical: false,
    width: PAGE_WIDTH / COUNT,
    height: PAGE_WIDTH / COUNT,
    style: {
      width: PAGE_WIDTH,
    },
  };

  const renderItem = ({ index }: { index: number }) => {
    const statConfig = STAT_CONFIGS[index];
    return (
      <View style={styles.itemContainer}>
        <StatHighlight
          title={statConfig.title}
          value={stats[statConfig.key]}
          icon={statConfig.emoji}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Carousel
        {...baseOptions}
        loop
        autoPlay={true}
        autoPlayInterval={6000}
        data={STAT_CONFIGS}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
});

export default StatsCarousel;
