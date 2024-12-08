import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from '@/constants/Colors'

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
        colors={[Colors.PRIMARY_GREEN, Colors.TERTIARY_BLUE]}
        style={style.buttonGradient}
      >
        <View style={style.buttonContainer}>
          <Text style={style.buttonText}>{text}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
