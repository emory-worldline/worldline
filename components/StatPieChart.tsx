import React, { useState } from "react";
import { PieChart } from "react-native-gifted-charts";
import { View, Text } from "react-native";
import Colors from "@/constants/Colors";

interface StatPieChartProps {
  data: Record<string, number>;
  title?: string;
}

const StatPieChart = ({ data, title = "Distribution" }: StatPieChartProps) => {
  // Process and sort data, take top 5
  const processedEntries = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate total and percentages
  const total = processedEntries.reduce((sum, [, value]) => sum + value, 0);

  // Base gradient colors
  const endColor = { r: 6, g: 214, b: 160 }; // Colors.PRIMARY_GREEN
  const startColor = { r: 55, g: 132, b: 203 }; // Colors.SECONDARY_BLUE

  // interpolate between colors
  const interpolateColor = (
    start: typeof startColor,
    end: typeof startColor,
    factor: number,
  ) => {
    const r = Math.round(start.r + (end.r - start.r) * factor);
    const g = Math.round(start.g + (end.g - start.g) * factor);
    const b = Math.round(start.b + (end.b - start.b) * factor);
    return `rgba(${r},${g},${b},1)`;
  };

  // lighten for gradients
  const lightenColor = (color: typeof startColor, factor: number = 0.5) => {
    const r = Math.round(color.r + (255 - color.r) * factor);
    const g = Math.round(color.g + (255 - color.g) * factor);
    const b = Math.round(color.b + (255 - color.b) * factor);
    return `rgba(${r},${g},${b},1)`;
  };

  const [focusedIndex, setFocusedIndex] = useState(0);

  const pieData = processedEntries.map(([name, value], index) => {
    const percentage = Math.round((value / total) * 100);
    const factor = index / (processedEntries.length - 1);

    // color for the section
    const baseColor = {
      r: Math.round(startColor.r + (endColor.r - startColor.r) * factor),
      g: Math.round(startColor.g + (endColor.g - startColor.g) * factor),
      b: Math.round(startColor.b + (endColor.b - startColor.b) * factor),
    };

    return {
      value: percentage,
      color: interpolateColor(startColor, endColor, factor),
      gradientCenterColor: lightenColor(baseColor),
      focused: index === focusedIndex,
      onPress: () => setFocusedIndex(index),
    };
  });

  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
        {title}
      </Text>
      <View style={{ padding: 8, alignItems: "center" }}>
        <PieChart
          data={pieData}
          donut
          showGradient
          sectionAutoFocus
          focusOnPress
          radius={75}
          innerRadius={45}
          innerCircleColor={"#232B5D"}
          centerLabelComponent={() => {
            return (
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text
                  style={{ fontSize: 20, color: "white", fontWeight: "bold" }}
                >
                  {pieData[focusedIndex].value}%
                </Text>
                <Text style={{ fontSize: 11, color: "white" }}>
                  {processedEntries[focusedIndex][0]}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

export default StatPieChart;
