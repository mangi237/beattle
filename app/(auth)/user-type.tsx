import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserTypeScreen() {
  const selectUserType = (type: 'listener' | 'artist') => {
    router.push(`/(auth)/Onboarding?type=${type}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Role</Text>
      <Text style={styles.subtitle}>How do you want to use Beatlle?</Text>

      <View style={styles.cardsContainer}>
        {/* Listener Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => selectUserType('listener')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#4D79FF' }]}>
            <Ionicons name="headset" size={40} color="white" />
          </View>
          <Text style={styles.cardTitle}>Listener</Text>
          <Text style={styles.cardDescription}>
            Stream music, join battles, support artists, and earn coins
          </Text>
          <Text style={styles.cardFeatures}>
            • Join battle teams{"\n"}
            • Stream to earn points{"\n"}
            • Earn coins with Bot Program{"\n"}
            • Support favorite artists
          </Text>
        </TouchableOpacity>

        {/* Artist Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => selectUserType('artist')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FF4D8D' }]}>
            <Ionicons name="mic" size={40} color="white" />
          </View>
          <Text style={styles.cardTitle}>Artist</Text>
          <Text style={styles.cardDescription}>
            Upload music, create battles, engage fans, and earn revenue
          </Text>
          <Text style={styles.cardFeatures}>
            • Create music battles{"\n"}
            • Upload your songs{"\n"}
            • Earn from streams{"\n"}
            • Grow your fanbase
          </Text>
        </TouchableOpacity>
      </View>
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
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 50,
  },
  cardsContainer: {
    gap: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  cardFeatures: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
});