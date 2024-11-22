import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type GradientButtonProps = {
  text: string;
  onPress: () => void;
  style: {
    buttonGradient?: object;
    buttonText?: object;
    buttonContainer?: object;
  };
};

export default function GradientButton(props: GradientButtonProps) {
  const { style, text, onPress } = props;

  return (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={["rgba(6,214,160,1)", "rgba(62,53,165,1)"]}
        style={style.buttonGradient}
      >
        <View style={style.buttonContainer}>
          <Text style={style.buttonText}>{text}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
