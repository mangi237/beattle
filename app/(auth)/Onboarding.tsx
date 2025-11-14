import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function OnboardingScreen() {
  const params = useLocalSearchParams();
  const userType = params.type as 'listener' | 'artist';

  React.useEffect(() => {
    if (userType === 'artist') {
      router.push('/(auth)/artist-profile');
    } else if (userType === 'listener') {
      router.push('/(auth)/listener-profile');
      
    }
  }, [userType]);

  return (
    <View style={styles.container}>
      {/* This screen just redirects, so show loading or nothing */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});