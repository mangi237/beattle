import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../src/services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../src/context/AuthContext';

interface OnboardingFormProps {
  userType: 'listener' | 'artist';
  onComplete: () => void;
}

export default function OnboardingForm({ userType, onComplete }: OnboardingFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Common fields
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');

  // Artist fields
  const [labelName, setLabelName] = useState('');
  const [fanBaseName, setFanBaseName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

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

  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `profile-${user?.uid}-${Date.now()}.jpg`;
    const storageRef = ref(storage, `profiles/${filename}`);
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const generateAvatarFromName = (name: string): string => {
    // Simple avatar generation - in production, use a proper SVG generation library
    const colors = ['#FF4D8D', '#4D79FF', '#FFB74D', '#4CAF50', '#9C27B0'];
    const color = colors[name.length % colors.length];
    
    // Return initials for now - we'll enhance this later
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="${color}"/><text x="100" y="120" font-family="Arial" font-size="80" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  };

  const handleSubmit = async () => {
    if (!displayName || !phoneNumber) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      let profileUrl = profileImage;
      
      // If no image selected, generate avatar from name
      if (!profileUrl && userType === 'artist') {
        profileUrl = generateAvatarFromName(displayName);
      }

      // Upload image if it's a real photo (not SVG)
      if (profileUrl && !profileUrl.startsWith('data:image/svg+xml')) {
        profileUrl = await uploadImage(profileUrl);
      }

      const userData = {
        uid: user?.uid,
        email: user?.email,
        userType,
        displayName,
        phoneNumber,
        location,
        profilePhoto: profileUrl,
        completedOnboarding: true,
        createdAt: new Date(),
        
        // Artist-specific data
        ...(userType === 'artist' && {
          labelName,
          fanBaseName,
          bio,
          songs: [], // Will be populated in song upload step
          totalEarnings: 0,
          totalStreams: 0,
        }),

        // Listener-specific data
        ...(userType === 'listener' && {
          coins: 100, // Starting bonus
          followedArtists: [],
          totalStreams: 0,
        })
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', user?.uid || ''), userData);

      onComplete();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save profile: ' + error.message);
    }
    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            
            <Text style={styles.label}>Display Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="How should we call you?"
              placeholderTextColor="#888"
              value={displayName}
              onChangeText={setDisplayName}
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="For mobile money payments"
              placeholderTextColor="#888"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Your city or region"
              placeholderTextColor="#888"
              value={location}
              onChangeText={setLocation}
            />

            {userType === 'artist' && (
              <>
                <Text style={styles.label}>Fan Base Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What do your fans call themselves?"
                  placeholderTextColor="#888"
                  value={fanBaseName}
                  onChangeText={setFanBaseName}
                />
              </>
            )}
          </View>
        );

      case 2:
        if (userType !== 'artist') return null;
        
        return (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Artist Profile</Text>
            
            <Text style={styles.label}>Label Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your music label (if any)"
              placeholderTextColor="#888"
              value={labelName}
              onChangeText={setLabelName}
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about your music..."
              placeholderTextColor="#888"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Profile Photo</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color="#666" />
                  <Text style={styles.imageText}>Tap to upload photo</Text>
                  <Text style={styles.imageSubtext}>Or we'll create a cool avatar for you</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  const nextStep = () => {
    if (step === 1 && userType === 'listener') {
      handleSubmit();
    } else if (step < (userType === 'artist' ? 2 : 1)) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return displayName.trim() && phoneNumber.trim();
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${(step / (userType === 'artist' ? 2 : 1)) * 100}%` 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Step {step} of {userType === 'artist' ? 2 : 1}
          </Text>
        </View>

        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextButton, !canProceed() && styles.disabledButton]}
          onPress={nextStep}
          disabled={!canProceed() || loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Saving...' : 
             step === (userType === 'artist' ? 2 : 1) ? 'Complete Setup' : 'Continue'}
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF4D8D',
    borderRadius: 3,
  },
  progressText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
  },
  step: {
    gap: 15,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
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
    height: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    height: 200,
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
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#FF4D8D',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});