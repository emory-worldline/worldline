import { View, Text, StyleSheet } from "react-native";

const StatHighlight = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={{ fontSize: 30, padding: 8 }}>{icon}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: "rgba(109,53,183,1)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  value: {
    fontSize: 20,
    fontWeight: "600",
    color: "rgba(53,203,169,1)",
  },
});

export default StatHighlight;
