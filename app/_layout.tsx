import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="setup"
        options={{ headerBackTitle: "Home", headerTitle: "Setup" }}
      />
    </Stack>
  );
}
