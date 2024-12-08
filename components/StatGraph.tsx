import { LineChart } from "react-native-gifted-charts";
import { MediaStats } from "@/types/mediaTypes";
import { View } from "react-native";
import Colors from '@/constants/Colors'

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
        yAxisColor={Colors.PRIMARY_BLUE}
        showVerticalLines
        verticalLinesColor={Colors.PRIMARY_BLUE}
        xAxisColor={Colors.PRIMARY_BLUE}
        lineGradient
        lineGradientStartColor={Colors.PRIMARY_GREEN}
        lineGradientEndColor={Colors.PRIMARY_BLUE}
        dataPointsColor="white"
        thickness={5}
        xAxisLabelTextStyle={{
          color: Colors.PRIMARY_BLUE,
          textAlign: "center",
          fontWeight: "bold",
        }}
        yAxisTextStyle={{ color: "rgba(53,203,169,1)", textAlign: "center" }}
        startFillColor={Colors.PRIMARY_GREEN}
        endFillColor={Colors.SECONDARY_BLUE}
        endOpacity={0.5}
      />
    </View>
  );
}

export default StatGraph;
