import { View, Text, StyleSheet } from "react-native";
import Colors from '@/constants/Colors'
import { LinearGradient } from "expo-linear-gradient";

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
    <LinearGradient
      style={styles.container}
      colors={[Colors.SECONDARY_PURPLE, Colors.PRIMARY_BLUE]} // choose desired gradient colors
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={{ fontSize: 30, padding: 8 }}>{icon}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: Colors.SECONDARY_PURPLE,
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
    color: Colors.WHITE,
    textAlign: "center",
  },
  value: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.WHITE,
  },
});

export default StatHighlight;
