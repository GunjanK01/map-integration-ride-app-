import { Stack } from 'expo-router';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="role-selection" />
        <Stack.Screen name="user" />
        <Stack.Screen name="rider" />
      </Stack>
    </ConvexProvider>
  );
}