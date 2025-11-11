import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF4D8D',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#333',
        },
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTintColor: 'white',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Battles',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="music"
        options={{
          title: 'Music',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="musical-notes" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}