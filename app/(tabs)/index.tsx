import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  FlatList,
  RefreshControl 
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { useAuth } from '../../src/context/AuthContext';
import { Battle } from '../../src/types';

export default function HomeScreen() {
  const { user } = useAuth();
  const [liveBattles, setLiveBattles] = useState<Battle[]>([]);
  const [upcomingBattles, setUpcomingBattles] = useState<Battle[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch user data
    const userUnsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    });

    // Fetch live battles
    const liveQuery = query(
      collection(db, 'battles'),
      where('status', '==', 'live'),
      orderBy('createdAt', 'desc')
    );

    const liveUnsubscribe = onSnapshot(liveQuery, (snapshot) => {
      const battles = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Battle));
      setLiveBattles(battles);
    });

    // Fetch upcoming battles
    const upcomingQuery = query(
      collection(db, 'battles'),
      where('status', '==', 'scheduled'),
      orderBy('scheduledAt', 'asc')
    );

    const upcomingUnsubscribe = onSnapshot(upcomingQuery, (snapshot) => {
      const battles = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Battle));
      setUpcomingBattles(battles);
    });

    return () => {
      userUnsubscribe();
      liveUnsubscribe();
      upcomingUnsubscribe();
    };
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Data will refresh automatically via Firestore listeners
    setTimeout(() => setRefreshing(false), 1000);
  };

  const BattleCard = ({ battle, isLive = false }: { battle: Battle; isLive?: boolean }) => (
    <TouchableOpacity 
      style={styles.battleCard}
      onPress={() => router.push(`/battle/live?id=${battle.id}`)}
    >
      <View style={styles.battleHeader}>
        <Text style={styles.battleName}>{battle.name}</Text>
        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.livePulse} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.battleInfo}>
        by {battle.creatorEmail} • {battle.entryFee > 0 ? `${battle.entryFee} FCFA` : 'Free'}
      </Text>
      
      {isLive && battle.teamA && battle.teamB && (
        <View style={styles.scoreContainer}>
          <View style={styles.teamScore}>
            <Text style={styles.teamName}>{battle.teamA.name}</Text>
            <Text style={styles.score}>{battle.teamA.score.toLocaleString()}</Text>
            <Text style={styles.supporters}>{battle.teamA.supporters} supporters</Text>
          </View>
          
          <Text style={styles.vsText}>VS</Text>
          
          <View style={styles.teamScore}>
            <Text style={styles.teamName}>{battle.teamB.name}</Text>
            <Text style={styles.score}>{battle.teamB.score.toLocaleString()}</Text>
            <Text style={styles.supporters}>{battle.teamB.supporters} supporters</Text>
          </View>
        </View>
      )}
      
      {!isLive && battle.scheduledAt && (
        <View style={styles.upcomingInfo}>
          <Ionicons name="time-outline" size={16} color="#FF4D8D" />
          <Text style={styles.upcomingText}>
            Starts in {getTimeUntil(new Date(battle.scheduledAt.toDate()))}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const getTimeUntil = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with User Info */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={styles.userName}>
            {userData?.displayName || userData?.stageName || user?.email}
          </Text>
          {userData?.userType === 'listener' && (
            <Text style={styles.coins}>🎯 {userData?.coins || 0} coins</Text>
          )}
          {userData?.userType === 'artist' && (
            <Text style={styles.stats}>
              ⚡ {userData?.totalStreams || 0} streams • 💰 {userData?.totalEarnings || 0} FCFA
            </Text>
          )}
        </View>
        
        {userData?.userType === 'artist' && (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/battle/create')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4D8D" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="trending-up" size={24} color="#FF4D8D" />
            <Text style={styles.quickActionText}>Trending</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="people" size={24} color="#4D79FF" />
            <Text style={styles.quickActionText}>My Artists</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="trophy" size={24} color="#FFB74D" />
            <Text style={styles.quickActionText}>Rankings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/bot/program')}
          >
            <Ionicons name="robot" size={24} color="#4CAF50" />
            <Text style={styles.quickActionText}>Earn Coins</Text>
          </TouchableOpacity>
        </View>

        {/* Live Battles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Live Battles</Text>
            <Text style={styles.sectionSubtitle}>Join now and support your team</Text>
          </View>
          
          {liveBattles.length > 0 ? (
            <FlatList
              data={liveBattles}
              renderItem={({ item }) => <BattleCard battle={item} isLive />}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.battleList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>No live battles right now</Text>
              <Text style={styles.emptySubtext}>
                {userData?.userType === 'artist' 
                  ? 'Be the first to create one!' 
                  : 'Check back later for new battles'
                }
              </Text>
            </View>
          )}
        </View>

        {/* Upcoming Battles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⏰ Upcoming Battles</Text>
            <Text style={styles.sectionSubtitle}>Get ready for these epic clashes</Text>
          </View>
          
          {upcomingBattles.length > 0 ? (
            <FlatList
              data={upcomingBattles}
              renderItem={({ item }) => <BattleCard battle={item} />}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.battleList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>No upcoming battles</Text>
              <Text style={styles.emptySubtext}>New battles will appear here</Text>
            </View>
          )}
        </View>

        {/* For Artists: Quick Create Battle */}
        {userData?.userType === 'artist' && (
          <TouchableOpacity 
            style={styles.createBattleCard}
            onPress={() => router.push('/battle/create')}
          >
            <View style={styles.createBattleContent}>
              <Ionicons name="add-circle" size={40} color="#FF4D8D" />
              <View style={styles.createBattleText}>
                <Text style={styles.createBattleTitle}>Create a Battle</Text>
                <Text style={styles.createBattleSubtitle}>Start a new music battle and engage your fans</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </View>
          </TouchableOpacity>
        )}

        {/* For Listeners: Bot Program Promo */}
        {userData?.userType === 'listener' && (
          <TouchableOpacity 
            style={styles.botPromoCard}
            onPress={() => router.push('/bot/program')}
          >
            <View style={styles.botPromoContent}>
              <Ionicons name="robot" size={40} color="#4CAF50" />
              <View style={styles.botPromoText}>
                <Text style={styles.botPromoTitle}>Earn Coins Now</Text>
                <Text style={styles.botPromoSubtitle}>Listen to music and earn real money</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1E1E1E',
  },
  welcome: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  coins: {
    fontSize: 16,
    color: '#FFB74D',
    fontWeight: '600',
  },
  stats: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  createButton: {
    backgroundColor: '#FF4D8D',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  battleList: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  battleCard: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginRight: 15,
    width: 280,
  },
  battleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  battleName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4D8D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    position: 'relative',
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  battleInfo: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 15,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamScore: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 5,
  },
  score: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  supporters: {
    color: '#666',
    fontSize: 10,
  },
  vsText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  upcomingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  upcomingText: {
    color: '#FF4D8D',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  emptySubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  createBattleCard: {
    backgroundColor: '#2A1E2A',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  createBattleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createBattleText: {
    flex: 1,
    marginLeft: 15,
  },
  createBattleTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  createBattleSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  botPromoCard: {
    backgroundColor: '#1E2A2A',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  botPromoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botPromoText: {
    flex: 1,
    marginLeft: 15,
  },
  botPromoTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  botPromoSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
  },
});