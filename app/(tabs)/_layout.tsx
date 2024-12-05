import { Tabs } from "expo-router";
import { TabBar } from "@/components/TabBar";
import { DarkModeProvider } from "@/components/context/DarkModeContext";

export default function TabsLayout() {
  return (
    <DarkModeProvider>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen
          name="stats"
          options={{
            title: "Stats",
          }}
        />
        <Tabs.Screen
          name="views"
          options={{
            title: "Views",
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Maps",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
          }}
        />
      </Tabs>
    </DarkModeProvider>
  );
}
