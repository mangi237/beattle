import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { db } from '../../src/services/firebase';
import { Song } from '../../src/types';

export default function CreateBattleScreen() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [battleName, setBattleName] = useState('');
  const [duration, setDuration] = useState('30');
  const [entryFee, setEntryFee] = useState('0');
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    };

    fetchUserData();
  }, [user]);

  const createBattle = async () => {
    if (!battleName.trim()) {
      Alert.alert('Error', 'Please enter a battle name');
      return;
    }

    if (selectedSongs.length === 0) {
      Alert.alert('Error', 'Please select at least one song');
      return;
    }

    if (selectedSongs.length > 5) {
      Alert.alert('Error', 'You can select maximum 5 songs');
      return;
    }

    setLoading(true);
    try {
      const battleData = {
        name: battleName,
        duration: parseInt(duration),
        entryFee: parseInt(entryFee),
        creatorId: user?.uid,
        creatorEmail: user?.email,
        creatorName: userData?.stageName || userData?.displayName,
        creatorPhoto: userData?.profilePhoto,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        scheduledAt: serverTimestamp(), // In real app, set future time
        participants: [],
        songs: selectedSongs,
        teamA: {
          name: userData?.fanBaseName || `${userData?.stageName}'s Team`,
          score: 0,
          supporters: 0,
          artist: user?.uid
        },
        teamB: {
          name: 'Challenger Team',
          score: 0,
          supporters: 0,
          artist: null
        },
        totalPot: parseInt(entryFee) * 2, // Entry fee from both artists
        streamRevenue: 0,
      };

      const docRef = await addDoc(collection(db, 'battles'), battleData);
      
      Alert.alert(
        'Battle Created! 🎉',
        `Your battle "${battleName}" is ready! Share the battle code with your opponent.`,
        [
          {
            text: 'Share Battle',
            onPress: () => {
              // TODO: Implement share functionality
              console.log('Battle ID:', docRef.id);
              router.back();
            }
          },
          {
            text: 'View Battle',
            onPress: () => router.push(`/battle/live?id=${docRef.id}`)
          }
        ]
      );

    } catch (error: any) {
      Alert.alert('Error', 'Failed to create battle: ' + error.message);
    }
    setLoading(false);
  };

  const toggleSongSelection = (song: Song) => {
    if (selectedSongs.find(s => s.id === song.id)) {
      setSelectedSongs(selectedSongs.filter(s => s.id !== song.id));
    } else {
      if (selectedSongs.length < 5) {
        setSelectedSongs([...selectedSongs, song]);
      } else {
        Alert.alert('Limit Reached', 'You can select maximum 5 songs per battle');
      }
    }
  };

  const DurationButton = ({ minutes, label }: { minutes: string; label: string }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        duration === minutes && styles.optionButtonSelected
      ]}
      onPress={() => setDuration(minutes)}
    >
      <Text style={[
        styles.optionButtonText,
        duration === minutes && styles.optionButtonTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const FeeButton = ({ fee, label }: { fee: string; label: string }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        entryFee === fee && styles.optionButtonSelected
      ]}
      onPress={() => setEntryFee(fee)}
    >
      <Text style={[
        styles.optionButtonText,
        entryFee === fee && styles.optionButtonTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (!userData) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Battle</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Battle Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Battle Information</Text>
          
          <Text style={styles.label}>Battle Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., King of Afrobeats Showdown"
            placeholderTextColor="#888"
            value={battleName}
            onChangeText={setBattleName}
          />

          <Text style={styles.label}>Duration</Text>
          <View style={styles.optionsRow}>
            <DurationButton minutes="15" label="15 min" />
            <DurationButton minutes="30" label="30 min" />
            <DurationButton minutes="45" label="45 min" />
            <DurationButton minutes="60" label="60 min" />
          </View>

          <Text style={styles.label}>Entry Fee</Text>
          <Text style={styles.subLabel}>
            Both artists pay this amount. Winner takes 70%, platform takes 30%
          </Text>
          <View style={styles.optionsRow}>
            <FeeButton fee="0" label="Free" />
            <FeeButton fee="1000" label="1,000" />
            <FeeButton fee="5000" label="5,000" />
            <FeeButton fee="10000" label="10,000" />
          </View>
        </View>

        {/* Song Selection Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Battle Songs</Text>
            <Text style={styles.songCounter}>
              {selectedSongs.length} / 5 selected
            </Text>
          </View>
          
          <Text style={styles.subLabel}>
            Choose up to 5 songs that will be streamed during the battle
          </Text>

          {userData.songs && userData.songs.length > 0 ? (
            <FlatList
              data={userData.songs}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.songItem,
                    selectedSongs.find(s => s.id === item.id) && styles.songItemSelected
                  ]}
                  onPress={() => toggleSongSelection(item)}
                >
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle}>{item.title}</Text>
                    <Text style={styles.songDetails}>
                      {item.duration} • {item.genre} • {item.streams || 0} streams
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.checkbox,
                    selectedSongs.find(s => s.id === item.id) && styles.checkboxSelected
                  ]}>
                    {selectedSongs.find(s => s.id === item.id) && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noSongs}>
              <Ionicons name="musical-notes" size={48} color="#666" />
              <Text style={styles.noSongsText}>No songs uploaded yet</Text>
              <Text style={styles.noSongsSubtext}>
                Upload songs in your profile to create battles
              </Text>
              <TouchableOpacity 
                style={styles.uploadSongsButton}
                onPress={() => router.push('/(auth)/upload-songs')}
              >
                <Text style={styles.uploadSongsText}>Upload Songs</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Battle Rules */}
        <View style={styles.rulesSection}>
          <Text style={styles.rulesTitle}>🎯 Battle Rules</Text>
          <View style={styles.ruleItem}>
            <Ionicons name="people" size={16} color="#FF4D8D" />
            <Text style={styles.ruleText}>Fans stream songs to earn points for their team</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="trophy" size={16} color="#FF4D8D" />
            <Text style={styles.ruleText}>Team with most points at the end wins</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="cash" size={16} color="#FF4D8D" />
            <Text style={styles.ruleText}>Winner gets 70% of the prize pool</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="musical-notes" size={16} color="#FF4D8D" />
            <Text style={styles.ruleText}>All streams count toward your total stats</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.createButton, 
            (!battleName || selectedSongs.length === 0 || loading) && styles.createButtonDisabled
          ]}
          onPress={createBattle}
          disabled={!battleName || selectedSongs.length === 0 || loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating Battle...' : 'Create Battle'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
    marginTop: 20,
  },
  subLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 15,
    lineHeight: 18,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  optionButtonSelected: {
    backgroundColor: '#FF4D8D',
    borderColor: '#FF4D8D',
  },
  optionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  optionButtonTextSelected: {
    color: 'white',
  },
  songCounter: {
    color: '#FF4D8D',
    fontSize: 14,
    fontWeight: '600',
  },
  songItem: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
  },
  songItemSelected: {
    borderColor: '#FF4D8D',
    backgroundColor: '#2A1E2A',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  songDetails: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FF4D8D',
    borderColor: '#FF4D8D',
  },
  noSongs: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  noSongsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
  },
  noSongsSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  uploadSongsButton: {
    backgroundColor: '#FF4D8D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  uploadSongsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  rulesSection: {
    backgroundColor: '#2A1E2A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  rulesTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  ruleText: {
    color: '#CCCCCC',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#FF4D8D',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});