import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Ensure 'auth' is exported from '../../src/services/firebase'
// import auth from '../../src/services/firebase';z
import { auth } from '../../src/services/firebase';
// If 'auth' is a default export, use the above line.
// If it's a named export, make sure '../../src/services/firebase' exports 'auth' like:
// export const auth = getAuth(app);

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.signupButton, loading && styles.disabledButton]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.signupButtonText}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.linkText}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
    color: 'white',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  signupButton: {
    backgroundColor: '#FF4D8D',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    color: '#FF4D8D',
    textAlign: 'center',
    marginTop: 20,
  },
});