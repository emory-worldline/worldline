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
  formatValue: (value: number) => string;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

const STAT_CONFIGS: StatConfig[] = [
  {
    key: "highest",
    title: "Highest Photo",
    emoji: "🏔️",
    formatValue: (value) => `${value.toFixed(0)}m`,
  },
  {
    key: "lowest",
    title: "Lowest Photo",
    emoji: "↓",
    formatValue: (value) => `${value.toFixed(0)}m`,
  },
  {
    key: "fastest",
    title: "Fastest Photo",
    emoji: "⚡️",
    formatValue: (value) => `${value.toFixed(1)}km/h`,
  },
  {
    key: "localPhotos",
    title: "Local Photos",
    emoji: "📷",
    formatValue: (value) => value.toString(),
  },
  {
    key: "localVideos",
    title: "Local Videos",
    emoji: "📹",
    formatValue: (value) => value.toString(),
  },
  {
    key: "longestVideo",
    title: "Longest Video",
    emoji: "📼",
    formatValue: formatTime,
  },
  {
    key: "totalVideoDuration",
    title: "Recording Time",
    emoji: "🎥",
    formatValue: formatTime,
  },
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
          value={statConfig.formatValue(stats[statConfig.key])}
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
