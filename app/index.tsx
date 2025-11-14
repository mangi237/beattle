import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}