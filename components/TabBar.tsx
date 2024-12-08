import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ScreenOrientation from 'expo-screen-orientation'

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation | null>(null);
  
  useEffect(() => {
    (async () => {
      const currentOrientation = await ScreenOrientation.getOrientationAsync();
      setOrientation(currentOrientation);
    })();

    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      setOrientation(event.orientationInfo.orientation);
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  const icon = {
    stats: (props: any) => <Ionicons name="stats-chart" size={30} {...props} />,
    views: (props: any) => <Ionicons name="grid" size={30} {...props} />,
    index: (props: any) => <Entypo name="globe" size={30} {...props} />,
    settings: (props: any) => <FontAwesome name="gear" size={30} {...props} />,
  };

  type RouteName = keyof typeof icon;

  // determine if we should go vertical or horizontal
  const isLandscape =
    orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
    orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

  return (
    <View style={isLandscape ? styles.landscapeTabBar : styles.portraitTabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarIcon}
          >
            {icon[route.name as RouteName]({
              color: isFocused ? "#3FBCF4" : "#91A0B1",
            })}
            {/* <Text style={{ color: isFocused ? "#3FBCF4" : "#91A0B1" }}>
              {options.title}
            </Text> */}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  portraitTabBar: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3E4B5A",
    marginHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  landscapeTabBar: {
    position: "absolute",
    left: 40,
    top: 65,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3E4B5A",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 10, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    width: 70,
    height: "70%"
  },
  tabBarIcon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
});
