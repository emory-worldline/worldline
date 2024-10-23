import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Href } from "expo-router";

type GradientButtonProps = {
  text: string;
  href: Href<string | object>;
  style: {
    buttonLink?: object;
    buttonGradient?: object;
    buttonText?: object;
    buttonContainer?: object;
  };
};

export default function GradientButton(props: GradientButtonProps) {
  const { style } = props;
  return (
    <LinearGradient
      colors={["rgba(53,203,169,1)", "rgba(109,53,183,1)"]}
      style={style.buttonGradient}
    >
      <Link href={props.href} style={style.buttonLink}>
        <View style={style.buttonContainer}>
          <Text style={style.buttonText}>{props.text}</Text>
        </View>
      </Link>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  link: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 75,
    width: 240,
    padding: 0,
  },
  gradient: {
    width: 240,
    height: 75,
    borderRadius: 22.5,
    marginTop: 80,
    padding: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    lineHeight: 80,
  },
  buttonContainer: {
    flex: 1,
    width: 240,
    height: 75,
    alignItems: "center",
    justifyContent: "center",
  },
});
