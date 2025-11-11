import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BEATLLE</Text>
      <Text style={styles.slogan}>Your Stream, Their Score.</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryButtonText}>I have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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

export default WelcomeScreen;