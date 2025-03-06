import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'react-native';

const db = getFirestore();
const auth = getAuth();

interface Match {
  id: string;
  users: string[];
  status: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MatchList'>;

const Navbar = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('MatchList')}>
        <Text style={styles.navText}>Conversas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ChatQueue')}>
        <Text style={styles.navText}>RandChat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('MatchScreen')}>
        <Text style={styles.navText}>Swipe</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Likes')}>
        <Text style={styles.navText}>Likes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.navText}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const MatchListScreen: React.FC<{ navigation: NavigationProp }> = ({ navigation }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [usernames, setUsernames] = useState<{ [uid: string]: string }>({});
  const [userProfilePics, setUserProfilePics] = useState<{ [uid: string]: string }>({});
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentUser) return;

      const matchesRef = collection(db, 'chatRooms');
      const q = query(matchesRef, where('users', 'array-contains', currentUser.uid));
      const querySnapshot = await getDocs(q);

      const matchesList: Match[] = querySnapshot.docs
        .map(doc => ({ id: doc.id, users: doc.data().users, status: doc.data().status }))
        .filter(match => match.status === 'ativo');

      setMatches(matchesList);

      const usersToFetch = new Set<string>();
      matchesList.forEach(match => {
        match.users.forEach(userId => {
          if (userId !== currentUser.uid) {
            usersToFetch.add(userId);
          }
        });
      });

      const usersNames: { [uid: string]: string } = {};
      const usersProfilePics: { [uid: string]: string } = {};
      for (let userId of usersToFetch) {
        const userDoc = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          usersNames[userId] = userSnapshot.data()?.username || 'Usuário';
          usersProfilePics[userId] = userSnapshot.data()?.profilePicture || '';
        }
      }

      setUsernames(usersNames);
      setUserProfilePics(usersProfilePics);
    };

    fetchMatches();
  }, [currentUser]);

  const openChat = (matchId: string) => {
    navigation.navigate('MatchChats', { matchId });
  };

  const openProfile = (userId: string) => {
    navigation.navigate('MatchProfile', { userId });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Meus Matches</Text>
        {matches.length === 0 ? (
          <Text>Você ainda não tem matchs.</Text>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const otherUserId = item.users.find((user) => user !== currentUser?.uid);
              const otherUsername = otherUserId ? usernames[otherUserId] : 'Usuário';
              const profilePicture = otherUserId ? userProfilePics[otherUserId] : '';

              return (
                <View style={styles.matchItem}>
                  <TouchableOpacity
                    style={styles.matchInfo}
                    onPress={() => openProfile(otherUserId!)}
                  >
                    {profilePicture ? (
                      <Image source={{ uri: profilePicture }} style={styles.profilePic} />
                    ) : null}
                    <Text style={styles.matchName}>{otherUsername}</Text>
                  </TouchableOpacity>
                  <View style={styles.buttonsContainer}>
                    <Button title="Abrir Chat" onPress={() => openChat(item.id)} />
                    <Button title="Ver Perfil" onPress={() => openProfile(otherUserId!)} />
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
      <Navbar navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 60, // Adiciona espaço para não cobrir o conteúdo
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  matchItem: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navButton: {
    padding: 10,
  },
  navText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default MatchListScreen;

