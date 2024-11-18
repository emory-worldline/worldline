import { View, Text, StyleSheet } from "react-native";

const StatHighlight = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text>{icon}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value.toString()}
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
    fontSize: 16,
    padding: 4,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
    textAlign: "center",
  },
  value: {
    fontSize: 20,
    padding: 4,
    fontWeight: "600",
    color: "rgba(53,203,169,1)",
  },
});

export default StatHighlight;
