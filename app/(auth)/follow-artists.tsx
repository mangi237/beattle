import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { db } from '../../src/services/firebase';

interface Artist {
  id: string;
  displayName: string;
  fanBaseName?: string;
  profilePhoto?: string;
  genre?: string;
  followers: number;
  isFollowing: boolean;
}

export default function FollowArtistsScreen() {
  const { user } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock popular artists - in production, fetch from Firestore
  const mockArtists: Artist[] = [
    {
      id: '1',
      displayName: 'Star Boy',
      fanBaseName: 'Star Crew',
      profilePhoto: 'https://via.placeholder.com/100',
      genre: 'Afrobeats',
      followers: 12500,
      isFollowing: false
    },
    {
      id: '2', 
      displayName: 'Queen Bee',
      fanBaseName: 'Bee Hive',
      profilePhoto: 'https://via.placeholder.com/100',
      genre: 'Dancehall',
      followers: 8900,
      isFollowing: false
    },
    {
      id: '3',
      displayName: 'King Melody',
      fanBaseName: 'Melody Makers',
      profilePhoto: 'https://via.placeholder.com/100',
      genre: 'R&B',
      followers: 15600,
      isFollowing: false
    },
    {
      id: '4',
      displayName: 'DJ Pulse',
      fanBaseName: 'Pulse Nation',
      profilePhoto: 'https://via.placeholder.com/100',
      genre: 'Electronic',
      followers: 7200,
      isFollowing: false
    },
    {
      id: '5',
      displayName: 'Soul Singer',
      fanBaseName: 'Soul Family',
      profilePhoto: 'https://via.placeholder.com/100',
      genre: 'Soul',
      followers: 4300,
      isFollowing: false
    }
  ];

  useEffect(() => {
    // In production: fetch real artists from Firestore
    setArtists(mockArtists);
    setFilteredArtists(mockArtists);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = artists.filter(artist =>
        artist.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArtists(filtered);
    } else {
      setFilteredArtists(artists);
    }
  }, [searchQuery, artists]);

  const toggleFollow = (artistId: string) => {
    setSelectedArtists(prev => 
      prev.includes(artistId) 
        ? prev.filter(id => id !== artistId)
        : [...prev, artistId]
    );

    setArtists(prev => prev.map(artist =>
      artist.id === artistId 
        ? { ...artist, isFollowing: !artist.isFollowing }
        : artist
    ));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save followed artists to user profile
      if (selectedArtists.length > 0) {
        await updateDoc(doc(db, 'users', user?.uid || ''), {
          followedArtists: arrayUnion(...selectedArtists),
          listenerSetupComplete: true
        });
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error saving followed artists:', error);
      router.replace('/(tabs)'); // Continue anyway
    }
    setLoading(false);
  };

  const ArtistCard = ({ artist }: { artist: Artist }) => (
    <View style={styles.artistCard}>
      <Image 
        source={{ uri: artist.profilePhoto }} 
        style={styles.artistImage}
      />
      
      <View style={styles.artistInfo}>
        <Text style={styles.artistName}>{artist.displayName}</Text>
        <Text style={styles.artistDetails}>
          {artist.genre} • {artist.followers.toLocaleString()} followers
        </Text>
        {artist.fanBaseName && (
          <Text style={styles.fanBase}>Fan base: {artist.fanBaseName}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.followButton,
          artist.isFollowing && styles.followingButton
        ]}
        onPress={() => toggleFollow(artist.id)}
      >
        <Text style={[
          styles.followButtonText,
          artist.isFollowing && styles.followingButtonText
        ]}>
          {artist.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Follow Artists</Text>
        <Text style={styles.subtitle}>
          Follow your favorite artists to get notified about their battles
        </Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search artists or genres..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {selectedArtists.length} artists selected
        </Text>
        <Text style={styles.statsSubtext}>
          Follow at least 3 for better recommendations
        </Text>
      </View>

      <FlatList
        data={filteredArtists}
        renderItem={({ item }) => <ArtistCard artist={item} />}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.completeButton, 
            (selectedArtists.length < 3 || loading) && styles.disabledButton
          ]}
          onPress={handleComplete}
          disabled={selectedArtists.length < 3 || loading}
        >
          <Text style={styles.completeButtonText}>
            {loading ? 'Saving...' : `Follow ${selectedArtists.length} Artists & Continue`}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.skipText}>
          or{' '}
          <Text 
            style={styles.skipLink}
            onPress={() => router.replace('/(tabs)')}
          >
            skip for now
          </Text>
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
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  statsBar: {
    backgroundColor: '#2A1E2A',
    padding: 15,
    alignItems: 'center',
  },
  statsText: {
    color: '#FF4D8D',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statsSubtext: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  listContent: {
    padding: 20,
  },
  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
  },
  artistInfo: {
    flex: 1,
    marginLeft: 15,
  },
  artistName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artistDetails: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 2,
  },
  fanBase: {
    color: '#666',
    fontSize: 11,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF4D8D',
  },
  followingButton: {
    backgroundColor: '#FF4D8D',
  },
  followButtonText: {
    color: '#FF4D8D',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: 'white',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#FF4D8D',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipText: {
    color: '#666',
    fontSize: 14,
  },
  skipLink: {
    color: '#FF4D8D',
    fontWeight: '600',
  },
});