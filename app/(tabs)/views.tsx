import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function ViewsScreen() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.buttonGroup}>
        {[...Array(4)].map((_, index) => (
          <Pressable key={index} onPress={() => setSelectedIndex(index)}>
            <View
              style={[
                styles.buttonContainer,
                selectedIndex === index && styles.selectedButton,
              ]}
            >
              <Text style={styles.buttonText}>{`View ${index + 1}`}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonGroup: {
    marginTop: -40,
  },
  buttonContainer: {
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    width: 286,
    height: 127,
    marginVertical: 18,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "white",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#212121",
  },
  selectedButton: {
    borderColor: "#3FBCF4",
  },
});