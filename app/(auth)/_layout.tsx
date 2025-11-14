import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="user-type" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="artist-profile" />
      <Stack.Screen name="listener-profile" />
      <Stack.Screen name="upload-songs" />
      
      <Stack.Screen name="follow-artists" />
    </Stack>
  );
}