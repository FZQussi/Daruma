import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { getFirestore, collection, getDocs, query, where, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Svg, { Path } from 'react-native-svg';
import { Image,Platform } from 'react-native';
import { Appbar ,TextInput, Menu} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
const db = getFirestore();
const auth = getAuth();

interface Match {
  id: string;
  users: string[];
  status: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MatchList'>;

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';
const Navbar = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.navButtonActive} onPress={() => navigation.navigate('MatchList')}>
        <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.9973 8.53055C11.1975 7.62155 9.8639 7.37703 8.86188 8.2094C7.85986 9.04177 7.71879 10.4334 8.50568 11.4179C8.97361 12.0033 10.1197 13.053 10.9719 13.8079C11.3237 14.1195 11.4996 14.2753 11.7114 14.3385C11.8925 14.3925 12.102 14.3925 12.2832 14.3385C12.4949 14.2753 12.6708 14.1195 13.0226 13.8079C13.8748 13.053 15.0209 12.0033 15.4888 11.4179C16.2757 10.4334 16.1519 9.03301 15.1326 8.2094C14.1134 7.38579 12.797 7.62155 11.9973 8.53055Z"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <Path
            d="M3 7.2C3 6.07989 3 5.51984 3.21799 5.09202C3.40973 4.71569 3.71569 4.40973 4.09202 4.21799C4.51984 4 5.0799 4 6.2 4H17.8C18.9201 4 19.4802 4 19.908 4.21799C20.2843 4.40973 20.5903 4.71569 20.782 5.09202C21 5.51984 21 6.0799 21 7.2V20L17.6757 18.3378C17.4237 18.2118 17.2977 18.1488 17.1656 18.1044C17.0484 18.065 16.9277 18.0365 16.8052 18.0193C16.6672 18 16.5263 18 16.2446 18H6.2C5.07989 18 4.51984 18 4.09202 17.782C3.71569 17.5903 3.40973 17.2843 3.21799 16.908C3 16.4802 3 15.9201 3 14.8V7.2Z"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
    
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ChatQueue')}>
        <Svg viewBox="0 0 16 16" fill="none" width={30} height={30}>
          <Path
            d="M5 4a1 1 0 000 2h.01a1 1 0 000-2H5zM7 8a1 1 0 011-1h.01a1 1 0 010 2H8a1 1 0 01-1-1zM11.01 10a1 1 0 100 2h.01a1 1 0 100-2h-.01z"
            fill="#696969"
          />
          <Path
            fillRule="evenodd"
            d="M3.25 1A2.25 2.25 0 001 3.25v9.5A2.25 2.25 0 003.25 15h9.5A2.25 2.25 0 0015 12.75v-9.5A2.25 2.25 0 0012.75 1h-9.5zM2.5 3.25a.75.75 0 01.75-.75h9.5a.75.75 0 01.75.75v9.5a.75.75 0 01-.75.75h-9.5a.75.75 0 01-.75-.75v-9.5z"
            clipRule="evenodd"
            fill="#696969"
          />
        </Svg>
      </TouchableOpacity>
    
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('MatchScreen')}>
        <Svg fill="#696969" viewBox="0 0 24 24" width={30} height={30}>
          <Path
            d="M20.466,1.967,14.78.221a5.011,5.011,0,0,0-6.224,3.24L8.368,4H5A5.006,5.006,0,0,0,0,9V19a5.006,5.006,0,0,0,5,5h6a4.975,4.975,0,0,0,3.92-1.934,5.029,5.029,0,0,0,.689.052,4.976,4.976,0,0,0,4.775-3.563L23.8,8.156A5.021,5.021,0,0,0,20.466,1.967ZM11,22H5a3,3,0,0,1-3-3V9A3,3,0,0,1,5,6h6a3,3,0,0,1,3,3V19A3,3,0,0,1,11,22ZM21.887,7.563l-3.412,10.4a2.992,2.992,0,0,1-2.6,2.134A4.992,4.992,0,0,0,16,19V9a5.006,5.006,0,0,0-5-5h-.507a3,3,0,0,1,3.7-1.867l5.686,1.746A3.006,3.006,0,0,1,21.887,7.563ZM12,13c0,1.45-1.544,3.391-2.714,4.378a1.991,1.991,0,0,1-2.572,0C5.544,16.391,4,14.45,4,13a2,2,0,0,1,4,0,2,2,0,0,1,4,0Z"
          />
        </Svg>
      </TouchableOpacity>
    
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('LikeScreen')}>
        <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
            stroke="#696969"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
    
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
      <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
        <Path 
          d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
          stroke="#696969" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </Svg>
    </TouchableOpacity>
    </View>
  );
};

const MatchListScreen: React.FC<{ navigation: NavigationProp }> = ({ navigation }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [usernames, setUsernames] = useState<{ [uid: string]: string }>({});
  const [userProfilePics, setUserProfilePics] = useState<{ [uid: string]: string }>({});
  const currentUser = auth.currentUser;
  const [lastMessages, setLastMessages] = useState<{
    [matchId: string]: { text: string; senderId: string; read: boolean }
  }>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const filteredMatches = matches.filter((match) => {
    const otherUserId = match.users.find((user) => user !== currentUser?.uid);
    const otherUsername = otherUserId ? usernames[otherUserId] || '' : ''; // Garante que sempre será uma string
    return otherUsername.toLowerCase().includes(searchQuery?.toLowerCase() || '');
  });
  
  

  const fetchLastMessage = async (matchId: string) => {
    const messagesRef = collection(db, 'chatRooms', matchId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
  
    if (!querySnapshot.empty) {
      const msg = querySnapshot.docs[0].data();
      setLastMessages(prev => ({
        ...prev,
        [matchId]: {
          text: msg.text 
                ? msg.text 
                : msg.imageUrl 
                  ? 'Foto' 
                  : 'Mensagem não disponível',
          senderId: msg.senderId || '',
          read: msg.read || false,
        }
      }));
    }
  };
  
  
  
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
  
      matchesList.forEach(match => {
        fetchLastMessage(match.id);
      });
  
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
  
    // 🔄 Fetch initially
    fetchMatches();
  
    // ⏱ Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchMatches();
    }, 2000);
  
    return () => clearInterval(interval); // 🛑 Cleanup interval on unmount
  }, [currentUser]);
  

  const openChat = (matchId: string) => {
    navigation.navigate('MatchChats', { matchId });
  };

  const openProfile = (userId: string) => {
    navigation.navigate('MatchProfile', { userId });
  };

  return (
    
    <SafeAreaView style={styles.safeContainer}>
    <Appbar.Header mode="small" style={{ backgroundColor: '#FFF' }}>
      {isSearching ? (
        <TextInput
          style={{ flex: 1, fontSize: 18, padding: 8, backgroundColor: 'white' }}
          placeholder="Pesquisar usuário..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      ) : (
        <Appbar.Content title="Conversas" titleStyle={{ fontSize: 24, fontWeight: 'bold' }} />
      )}

      <Appbar.Action
        icon={isSearching ? 'close' : 'magnify'}
        onPress={() => {
          if (isSearching) {
            setSearchQuery('');
            setIsSearching(false);
          } else {
            setIsSearching(true);
          }
        }}
      />

      {/* Menu Dropdown */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Appbar.Action
            icon="dots-vertical"
            onPress={() => setMenuVisible(true)}
          />
        }
      >
        <Menu.Item onPress={() => console.log('Abrir definições')} title="Definições" />
        <Menu.Item onPress={() => console.log('Abrir notificações')} title="Notificações" />
        <Menu.Item onPress={() => console.log('Ordenar conversas')} title="Ordenar por" />
      </Menu>
    </Appbar.Header>



      <View style={styles.container}>
        {matches.length === 0 ? (
          <Text>Você ainda não tem matchs.</Text>
        ) : (
          <FlatList
          data={filteredMatches}
            
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const otherUserId = item.users.find((user) => user !== currentUser?.uid);
              const otherUsername = otherUserId ? usernames[otherUserId] : 'Usuário';
              const profilePicture = otherUserId ? userProfilePics[otherUserId] : '';
              const lastMessage = lastMessages[item.id];
              const lastMessageText = lastMessage ? lastMessage.text : 'Carregando...';
            
              const isUnreadFromOtherUser =
                    lastMessage &&
                    lastMessage.senderId !== currentUser?.uid &&
                    !lastMessage.read;
            
              return (
                <TouchableOpacity
                style={[
                  styles.matchItem,
                  isUnreadFromOtherUser && { backgroundColor: '#e6f7ff' }, // Mantido!
                ]}
                  onPress={() => openChat(item.id)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, position: 'relative' }}>
                    <TouchableOpacity onPress={() => openProfile(otherUserId!)}>
                      <Image
                        source={{ uri: profilePicture || 'https://i.imgur.com/placeholder.png' }}
                        style={styles.profilePic}
                      />
                    </TouchableOpacity>
            
                    <View style={styles.matchDetails}>
                      <Text style={styles.matchName}>{otherUsername}</Text>
                      <Text
                        style={[
                          styles.lastMessage,
                          isUnreadFromOtherUser && { fontWeight: 'bold', color: '#000' },
                        ]}
                      >
                        {lastMessageText}
                      </Text>
                    </View>
            
                    {isUnreadFromOtherUser && (
                      <View style={styles.unreadDot} />
                    )}
                  </View>
                </TouchableOpacity>
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
  matchDetails: {
    flex: 1, // Allows text to take up space
    flexDirection: 'column', // Stack username and last message vertically
  },
  lastMessage: {
    fontSize: 14,
    color: '#777',
    marginLeft: 10,
  },
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
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007aff',
  },
  
  
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 60,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',  // Para garantir que os ícones ocupem o mesmo espaço
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
    width: '18%',  // Definindo a largura de cada botão para ser a mesma
    alignItems: 'center',  // Centraliza os ícones
    justifyContent: 'center',  // Centraliza os ícones verticalmente
  },
  navText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  navButtonActive: {
    width: '18%',  // Definindo a largura de cada botão para ser a mesma
    alignItems: 'center',  // Centraliza os ícones
    justifyContent: 'center',
    backgroundColor: '#A7C7E7',
    borderRadius: 30, // Transforma em um círculo
    padding: 5,   // Centraliza os ícones verticalmente
  },
});

export default MatchListScreen;

