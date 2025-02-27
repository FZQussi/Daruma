import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

const db = getFirestore();
const auth = getAuth();

interface Match {
  id: string;
  users: string[];
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MatchList'>;

const MatchListScreen: React.FC<{ navigation: NavigationProp }> = ({ navigation }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [usernames, setUsernames] = useState<{ [uid: string]: string }>({});
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentUser) return;

      const matchesRef = collection(db, 'chatRooms');
      const q = query(matchesRef, where('users', 'array-contains', currentUser.uid));
      const querySnapshot = await getDocs(q);

      const matchesList: Match[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        users: doc.data().users,
      }));

      setMatches(matchesList);

      // Buscar o nome de usuário de todos os usuários envolvidos nos matches
      const usersToFetch = new Set<string>();
      matchesList.forEach(match => {
        match.users.forEach(userId => {
          if (userId !== currentUser.uid) {
            usersToFetch.add(userId);
          }
        });
      });

      const usersNames: { [uid: string]: string } = {};
      for (let userId of usersToFetch) {
        const userDoc = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          usersNames[userId] = userSnapshot.data()?.username || 'Usuário';
        }
      }

      setUsernames(usersNames);
    };

    fetchMatches();
  }, [currentUser]);

  const openChat = (matchId: string) => {
    navigation.navigate('MatchChats', { matchId });
  };

  return (
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

            return (
              <TouchableOpacity
                style={styles.matchItem}
                onPress={() => openChat(item.id)}
              >
                <Text style={styles.matchName}>{otherUsername}</Text> {/* Exibir o nome do usuário */}
                <Button title="Abrir Chat" onPress={() => openChat(item.id)} />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MatchListScreen;

