import { Stack } from "expo-router";
import { Pressable, Text } from "react-native";
import { Link } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="setup"
        options={{
          headerBackTitle: "Home",
          headerTitle: "Setup",
          headerRight: () => (
            <Link href="/test" asChild>
              <Pressable style={{ marginRight: 10 }}>
                <Text style={{ color: "#007AFF" }}>Map</Text>
              </Pressable>
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="test"
        options={{
          headerTitle: "Map",
          headerBackTitle: "Setup",
        }}
      />
    </Stack>
  );
}
