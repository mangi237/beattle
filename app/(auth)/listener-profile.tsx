import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { db } from '../../src/services/firebase';

const COUNTRIES = [
  'Cameroon', 'Nigeria', 'Ghana', 'Kenya', 'South Africa', 
  'Ivory Coast', 'Senegal', 'Tanzania', 'Uganda', 'Other'
];

const CITIES = {
  Cameroon: ['Douala', 'Yaoundé', 'Bamenda', 'Buea', 'Limbe', 'Bafoussam', 'Other'],
  Nigeria: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Benin City', 'Other'],
  Ghana: ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast', 'Other'],
  Kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Other'],
  'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Other'],
  'Ivory Coast': ['Abidjan', 'Bouaké', 'Daloa', 'Korhogo', 'San-Pédro', 'Other'],
  Senegal: ['Dakar', 'Touba', 'Thiès', 'Kaolack', 'Ziguinchor', 'Other'],
  Tanzania: ['Dar es Salaam', 'Dodoma', 'Mwanza', 'Arusha', 'Mbeya', 'Other'],
  Uganda: ['Kampala', 'Gulu', 'Lira', 'Mbarara', 'Jinja', 'Other'],
  Other: ['Other']
};

export default function ListenerProfileScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    country: 'Cameroon',
    city: 'Douala',
    age: '',
    favoriteGenres: '',
  });

  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset city when country changes
    if (field === 'country') {
      setFormData(prev => ({ 
        ...prev, 
        country: value, 
        city: CITIES[value as keyof typeof CITIES]?.[0] || 'Other' 
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.displayName.trim()) {
      Alert.alert('Error', 'Please enter your display name');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!formData.age.trim() || parseInt(formData.age) < 13) {
      Alert.alert('Error', 'Please enter a valid age (13+)');
      return false;
    }
    return true;
  };

  const generateAvatarFromName = (name: string): string => {
    const colors = ['#4D79FF', '#FF4D8D', '#FFB74D', '#4CAF50', '#9C27B0'];
    const color = colors[name.length % colors.length];
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="${color}"/><text x="100" y="120" font-family="Arial" font-size="80" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const profileUrl = generateAvatarFromName(formData.displayName);

      const userData = {
        uid: user?.uid,
        email: user?.email,
        userType: 'listener',
        ...formData,
        profilePhoto: profileUrl,
        profileSetupComplete: true,
        createdAt: new Date(),
        coins: 100, // Starting bonus
        totalStreams: 0,
        battlesParticipated: 0,
        artistsSupported: 0,
        favoriteArtists: [],
        listeningHistory: [],
      };

      await setDoc(doc(db, 'users', user?.uid || ''), userData);
      router.push('/(auth)/follow-artists');

    } catch (error: any) {
      Alert.alert('Error', 'Failed to save profile: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Listener Profile</Text>
        <Text style={styles.subtitle}>Set up your profile to start streaming</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Text style={styles.label}>Display Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="How should we call you?"
            placeholderTextColor="#888"
            value={formData.displayName}
            onChangeText={(value) => updateField('displayName', value)}
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="For mobile money rewards"
            placeholderTextColor="#888"
            value={formData.phoneNumber}
            onChangeText={(value) => updateField('phoneNumber', value)}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Age *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your age"
            placeholderTextColor="#888"
            value={formData.age}
            onChangeText={(value) => updateField('age', value)}
            keyboardType="number-pad"
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <Text style={styles.label}>Country</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.country}
              onValueChange={(value) => updateField('country', value)}
              style={styles.picker}
              dropdownIconColor="#666"
            >
              {COUNTRIES.map(country => (
                <Picker.Item key={country} label={country} value={country} color="white" />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>City</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.city}
              onValueChange={(value) => updateField('city', value)}
              style={styles.picker}
              dropdownIconColor="#666"
            >
              {CITIES[formData.country as keyof typeof CITIES]?.map(city => (
                <Picker.Item key={city} label={city} value={city} color="white" />
              ))}
            </Picker>
          </View>
        </View>

        {/* Music Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Music Preferences</Text>
          
          <Text style={styles.label}>Favorite Genres</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Afrobeats, Hip-Hop, R&B, Dancehall"
            placeholderTextColor="#888"
            value={formData.favoriteGenres}
            onChangeText={(value) => updateField('favoriteGenres', value)}
          />

          <View style={styles.genreTags}>
            {['Afrobeats', 'Hip-Hop', 'R&B', 'Dancehall', 'Gospel', 'Reggae', 'Pop'].map(genre => (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.genreTag,
                  formData.favoriteGenres.includes(genre) && styles.genreTagSelected
                ]}
                onPress={() => {
                  const currentGenres = formData.favoriteGenres.split(',').map(g => g.trim()).filter(g => g);
                  if (currentGenres.includes(genre)) {
                    updateField('favoriteGenres', currentGenres.filter(g => g !== genre).join(', '));
                  } else {
                    updateField('favoriteGenres', [...currentGenres, genre].join(', '));
                  }
                }}
              >
                <Text style={[
                  styles.genreTagText,
                  formData.favoriteGenres.includes(genre) && styles.genreTagTextSelected
                ]}>
                  {genre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>🎧 What you get as a Listener:</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="trophy" size={20} color="#FF4D8D" />
            <Text style={styles.benefitText}>Join battles and support artists</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="cash" size={20} color="#FF4D8D" />
            <Text style={styles.benefitText}>Earn coins with our Bot Program</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="musical-notes" size={20} color="#FF4D8D" />
            <Text style={styles.benefitText}>Discover new music and artists</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="phone-portrait" size={20} color="#FF4D8D" />
            <Text style={styles.benefitText}>Withdraw earnings to mobile money</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Saving...' : 'Continue to Follow Artists'}
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
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1E1E1E',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
    color: 'white',
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
  },
  picker: {
    color: 'white',
  },
  genreTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  genreTag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#333',
  },
  genreTagSelected: {
    backgroundColor: '#FF4D8D',
    borderColor: '#FF4D8D',
  },
  genreTagText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '600',
  },
  genreTagTextSelected: {
    color: 'white',
  },
  benefitsSection: {
    backgroundColor: '#2A1E2A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  benefitsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  benefitText: {
    color: '#CCCCCC',
    fontSize: 14,
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  continueButton: {
    backgroundColor: '#4D79FF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});