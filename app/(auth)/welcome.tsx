import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  console.log('🎯 Welcome screen is rendering!'); // Check console for this
     {console.log('🎯 Inside the main container of WelcomeScreen');}
  return (
    <View style={styles.container}>
   
      <Text style={styles.title}>BEATLLE</Text>
      <Text style={styles.slogan}>Your Stream, Their Score.</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.primaryButtonText}>Continue Streaming</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.secondaryButtonText}>I have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF4D8D',
    marginBottom: 10,
  },
  slogan: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 100,
  },
  buttonContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 100,
  },
  primaryButton: {
    backgroundColor: '#FF4D8D',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF4D8D',
  },
  secondaryButtonText: {
    color: '#FF4D8D',
    fontWeight: 'bold',
    fontSize: 16,
  },
});