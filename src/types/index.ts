export interface User {
  uid: string;
  email: string | null;
  displayName?: string;
  isArtist?: boolean;
}

export interface Battle {
  id: string;
  name: string;
  duration: number;
  entryFee: number;
  creatorId: string;
  creatorEmail: string;
  status: 'scheduled' | 'live' | 'completed';
  createdAt: any;
  scheduledAt: any;
  participants: BattleParticipant[];
  songs: Song[];
  teamA?: Team;
  teamB?: Team;
}

export interface BattleParticipant {
  userId: string;
  userEmail: string;
  team: 'A' | 'B';
  joinedAt: any;
}

export interface Team {
  name: string;
  score: number;
  supporters: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  cover?: any;
  fileUrl?: string;
}

export interface BotTask {
  id: string;
  song: Song;
  coins: number;
  completed: boolean;
}