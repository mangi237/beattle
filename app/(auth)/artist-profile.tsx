import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { db, storage } from '../../src/services/firebase';

export default function ArtistProfileScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  
  const [formData, setFormData] = useState({
    displayName: '',
    stageName: '',
    phoneNumber: '',
    location: '',
    labelName: '',
    fanBaseName: '',
    bio: '',
    genre: '',
    yearsActive: '',
  });
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const generateAvatarFromName = (name: string): string => {
    const colors = ['#FF4D8D', '#4D79FF', '#FFB74D', '#4CAF50', '#9C27B0'];
    const color = colors[name.length % colors.length];
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="${color}"/><text x="100" y="120" font-family="Arial" font-size="80" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `profile-${user?.uid}-${Date.now()}.jpg`;
    const storageRef = ref(storage, `profiles/${filename}`);
    
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.displayName.trim()) {
      Alert.alert('Error', 'Please enter your display name');
      return false;
    }
    if (!formData.stageName.trim()) {
      Alert.alert('Error', 'Please enter your stage name');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please enter your location');
      return false;
    }
    if (!formData.genre.trim()) {
      Alert.alert('Error', 'Please enter your music genre');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let profileUrl = profileImage;
      
      // Generate avatar if no image selected
      if (!profileUrl) {
        profileUrl = generateAvatarFromName(formData.stageName || formData.displayName);
      } else if (!profileUrl.startsWith('data:image/svg+xml')) {
        // Upload real photo
        profileUrl = await uploadImage(profileUrl);
      }

      const userData = {
        uid: user?.uid,
        email: user?.email,
        userType: 'artist',
        ...formData,
        profilePhoto: profileUrl,
        profileSetupComplete: true,
        createdAt: new Date(),
        totalEarnings: 0,
        totalStreams: 0,
        followers: 0,
        battlesWon: 0,
        battlesLost: 0,
      };

      await setDoc(doc(db, 'users', user?.uid || ''), userData);
      router.push('/(auth)/upload-songs');

    } catch (error: any) {
      Alert.alert('Error', 'Failed to save profile: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Artist Profile</Text>
        <Text style={styles.subtitle}>Set up your artist profile to get started</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={40} color="#666" />
                <Text style={styles.imageText}>Upload Profile Photo</Text>
                <Text style={styles.imageSubtext}>Or we'll create a cool avatar for you</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Text style={styles.label}>Legal Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full legal name"
            placeholderTextColor="#888"
            value={formData.displayName}
            onChangeText={(value) => updateField('displayName', value)}
          />

          <Text style={styles.label}>Stage Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your artist name"
            placeholderTextColor="#888"
            value={formData.stageName}
            onChangeText={(value) => updateField('stageName', value)}
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="For payments and verification"
            placeholderTextColor="#888"
            value={formData.phoneNumber}
            onChangeText={(value) => updateField('phoneNumber', value)}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="City, Country"
            placeholderTextColor="#888"
            value={formData.location}
            onChangeText={(value) => updateField('location', value)}
          />
        </View>

        {/* Music Career */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Music Career</Text>
          
          <Text style={styles.label}>Primary Genre *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Afrobeats, Hip-Hop, R&B"
            placeholderTextColor="#888"
            value={formData.genre}
            onChangeText={(value) => updateField('genre', value)}
          />

          <Text style={styles.label}>Years Active</Text>
          <TextInput
            style={styles.input}
            placeholder="How long have you been making music?"
            placeholderTextColor="#888"
            value={formData.yearsActive}
            onChangeText={(value) => updateField('yearsActive', value)}
          />

          <Text style={styles.label}>Record Label</Text>
          <TextInput
            style={styles.input}
            placeholder="Your label name (if any)"
            placeholderTextColor="#888"
            value={formData.labelName}
            onChangeText={(value) => updateField('labelName', value)}
          />

          <Text style={styles.label}>Fan Base Name</Text>
          <TextInput
            style={styles.input}
            placeholder="What do your fans call themselves?"
            placeholderTextColor="#888"
            value={formData.fanBaseName}
            onChangeText={(value) => updateField('fanBaseName', value)}
          />
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artist Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell your story... What inspires your music? What makes you unique?"
            placeholderTextColor="#888"
            value={formData.bio}
            onChangeText={(value) => updateField('bio', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Saving...' : 'Continue to Upload Songs'}
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
  imagePicker: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    padding: 20,
  },
  imageText: {
    color: '#CCCCCC',
    fontSize: 16,
    marginTop: 10,
  },
  imageSubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  continueButton: {
    backgroundColor: '#FF4D8D',
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