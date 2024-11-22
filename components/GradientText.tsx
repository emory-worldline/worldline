import React from "react";
import { Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

type GradientTextProps = {
  text: string;
  style: {
    textGradient?: object;
  };
};

export default function GradientText(props: GradientTextProps) {
  const { style } = props;
  return (
    <MaskedView
      maskElement={
        <Text style={[style.textGradient, { backgroundColor: "transparent" }]}>
          {props.text}
        </Text>
      }
    >
      <LinearGradient
        colors={["rgba(53,85,165,1)", "rgba(6,214,160,1)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[style.textGradient, { opacity: 0 }]}>{props.text}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
