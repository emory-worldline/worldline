import { LineChart } from "react-native-gifted-charts";
import { MediaStats } from "@/types/mediaTypes";
import { View } from "react-native";

interface StatGraphProps {
  yearStats: MediaStats["creationYears"];
}

function StatGraph({ yearStats }: StatGraphProps) {
  const chartData: Array<{
    value: number;
    dataPointText: string;
    label: string;
  }> = Object.entries(yearStats)
    .map(([year, count]) => ({
      value: count,
      dataPointText: count.toString(),
      label: year,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <View style={{ overflow: "hidden" }}>
      <LineChart
        areaChart
        curved
        adjustToWidth
        data={chartData}
        spacing={100}
        hideYAxisText
        hideRules
        textShiftY={-10}
        textColor="white"
        noOfSections={3}
        yAxisColor="rgba(53,203,169,1)"
        showVerticalLines
        verticalLinesColor="rgba(53,203,169,1)"
        xAxisColor="rgba(53,203,169,1)"
        lineGradient
        lineGradientStartColor="rgba(53,203,169,1)"
        lineGradientEndColor="rgba(109,53,183,1)"
        dataPointsColor="white"
        thickness={5}
        xAxisLabelTextStyle={{
          color: "rgba(53,203,169,1)",
          textAlign: "center",
          fontWeight: "bold",
        }}
        yAxisTextStyle={{ color: "rgba(53,203,169,1)", textAlign: "center" }}
        startFillColor="rgba(53,203,169,1)"
        endFillColor="rgba(109,53,183,1)"
        endOpacity={0.5}
      />
    </View>
  );
}

export default StatGraph;
