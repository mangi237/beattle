import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
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

interface Song {
  id: string;
  title: string;
  duration: string;
  genre: string;
  fileUrl?: string;
  uploadProgress?: number;
}

export default function UploadSongsScreen() {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([
    { id: '1', title: '', duration: '', genre: '' }
  ]);
  const [uploading, setUploading] = useState(false);

  const addSongField = () => {
    if (songs.length < 15) {
      setSongs([...songs, { 
        id: Date.now().toString(), 
        title: '', 
        duration: '', 
        genre: '' 
      }]);
    }
  };

  const removeSong = (id: string) => {
    if (songs.length > 1) {
      setSongs(songs.filter(song => song.id !== id));
    }
  };

  const updateSong = (id: string, field: keyof Song, value: string) => {
    setSongs(songs.map(song => 
      song.id === id ? { ...song, [field]: value } : song
    ));
  };

  const simulateFileUpload = async (song: Song): Promise<string> => {
    // Simulate upload - in real app, use actual file picker and upload
    return `https://example.com/songs/${song.title.replace(/\s+/g, '-').toLowerCase()}.mp3`;
  };

  const handleUpload = async () => {
    // Validate songs
    const invalidSongs = songs.filter(song => !song.title.trim() || !song.duration.trim());
    if (invalidSongs.length > 0) {
      Alert.alert('Error', 'Please fill all song fields');
      return;
    }

    if (songs.length < 5) {
      Alert.alert('Minimum Songs', 'Please add at least 5 songs to get started');
      return;
    }

    setUploading(true);

    try {
      const songsWithUrls = await Promise.all(
        songs.map(async (song) => {
          const fileUrl = await simulateFileUpload(song);
          return {
            id: song.id,
            title: song.title,
            duration: song.duration,
            genre: song.genre,
            fileUrl,
            uploadDate: new Date(),
            streams: 0,
            earnings: 0
          };
        })
      );

      // Update user document with songs
      await updateDoc(doc(db, 'users', user?.uid || ''), {
        songs: songsWithUrls,
        artistSetupComplete: true
      });

      Alert.alert(
        'Success!', 
        `You've uploaded ${songs.length} songs! You're ready to start battling.`,
        [{ text: 'Start Battling', onPress: () => router.replace('/(tabs)') }]
      );

    } catch (error: any) {
      Alert.alert('Upload Failed', error.message);
    }
    setUploading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Your Music</Text>
        <Text style={styles.subtitle}>
          Add at least 5 songs to start creating battles
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.songCounter}>
          <Text style={styles.counterText}>
            {songs.length} / 15 songs ({Math.max(0, 5 - songs.length)} more needed)
          </Text>
          {songs.length < 15 && (
            <TouchableOpacity style={styles.addButton} onPress={addSongField}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Song</Text>
            </TouchableOpacity>
          )}
        </View>

        {songs.map((song, index) => (
          <View key={song.id} style={styles.songCard}>
            <View style={styles.songHeader}>
              <Text style={styles.songNumber}>Song #{index + 1}</Text>
              {songs.length > 1 && (
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeSong(song.id)}
                >
                  <Ionicons name="close" size={20} color="#FF4D8D" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Song Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Summer Vibes"
              placeholderTextColor="#888"
              value={song.title}
              onChangeText={(value) => updateSong(song.id, 'title', value)}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Duration *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3:45"
                  placeholderTextColor="#888"
                  value={song.duration}
                  onChangeText={(value) => updateSong(song.id, 'duration', value)}
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Genre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Afrobeats, Hip-hop..."
                  placeholderTextColor="#888"
                  value={song.genre}
                  onChangeText={(value) => updateSong(song.id, 'genre', value)}
                />
              </View>
            </View>

            {/* File upload would go here in production */}
            <TouchableOpacity style={styles.uploadPlaceholder}>
              <Ionicons name="musical-notes" size={30} color="#666" />
              <Text style={styles.uploadText}>Song file (simulated for demo)</Text>
              <Text style={styles.uploadSubtext}>In production: actual file upload</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.uploadButton, uploading && styles.disabledButton]}
          onPress={handleUpload}
          disabled={uploading || songs.length < 5}
        >
          <Text style={styles.uploadButtonText}>
            {uploading ? 'Uploading...' : `Upload ${songs.length} Songs & Continue`}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.note}>
          💡 You can add more songs later from your profile
        </Text>
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
  songCounter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  counterText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4D8D',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  songCard: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  songHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  songNumber: {
    color: '#FF4D8D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
    color: 'white',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  uploadPlaceholder: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 10,
  },
  uploadSubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  uploadButton: {
    backgroundColor: '#FF4D8D',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  note: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});