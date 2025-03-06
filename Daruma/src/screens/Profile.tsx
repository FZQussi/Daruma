import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Animated, TouchableOpacity, Modal, Alert } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs, arrayRemove, arrayUnion, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Swiper from 'react-native-swiper';
import { RootStackParamList } from './types';
import { StackNavigationProp } from '@react-navigation/stack';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

const db = getFirestore();
const auth = getAuth();

interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  additionalPictures: string[];
  birthDate: string;
  UserBio: string;
}

const Profile: React.FC<{ route: any; navigation: ProfileScreenNavigationProp }> = ({ route, navigation }) => {
  const { userId } = route.params;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userDoc = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const profileData: UserProfile = {
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profilePicture: userData.profilePicture,
          additionalPictures: userData.additionalPictures || [],
          birthDate: userData.birthDate,
          UserBio: userData.UserBio,
        };
        setUserProfile(profileData);
      }
    };
    fetchUserProfile();
  }, [userId]);

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (userProfile?.additionalPictures?.length) {
      const totalPictures = userProfile.additionalPictures.length;
      let initialProgress = 1 / totalPictures;
      Animated.timing(progress, {
        toValue: initialProgress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [userProfile]);

  const handleIndexChanged = (index: number) => {
    const totalPictures = userProfile?.additionalPictures?.length ?? 1;
    const progressValue = (index + 1) / totalPictures;
    Animated.timing(progress, {
      toValue: progressValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

// Interface para representar um match
interface Match {
  id: string;
  users: string[]; // Array de usuários (UIDs)
}





const handleUnmatch = async () => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log('Usuário não logado.');
      return; // Se não houver um usuário logado
    }

    // 1. Buscar o match na coleção "Matches"
    const match = await findMatch(currentUser.uid);

    if (!match) {
      console.log('Nenhum match encontrado');
      return;
    }

    // 2. Buscar o chatRoom correspondente
    const chatRoom = await findChatRoom(match.id);

    if (!chatRoom) {
      console.log('Nenhum chatRoom encontrado');
      return;
    }

    console.log('Match encontrado:', match);
    console.log('Chat Room encontrado:', chatRoom);
    Alert.alert('Match Desfeito com Sucesso!');
    // Agora você pode proceder com a lógica de desfazer o match
    // Remover os usuários dos likes e adicionar nos dislikes
    await removeMatchAndUpdateUsers(match, chatRoom);

  } catch (error) {
    console.error('Erro ao desfazer match:', error);
    Alert.alert('Erro ao Desfazer o Match!');
  }
};



// Função para buscar o Match
const findMatch = async (userId: string): Promise<Match | null> => {
  const matchesQuery = query(
    collection(db, 'Matches'),
    where('users', 'array-contains', userId) // Verifica se o usuário logado está no array 'users'
  );

  const matchSnapshot = await getDocs(matchesQuery);

  if (matchSnapshot.empty) {
    return null; // Nenhum match encontrado
  }

  let match: Match | null = null;

  matchSnapshot.forEach(doc => {
    const matchId = doc.id; // Match ID
    const users = doc.data().users; // Array de usuários

    // Verifica se a propriedade 'users' existe e se há exatamente dois usuários
    if (users && users.length === 2) {
      match = { id: matchId, users }; // Retorna o match encontrado
    }
  });

  return match;
};

// Função para buscar o ChatRoom
const findChatRoom = async (matchId: string) => {
  const chatRoomRef = doc(db, 'chatRooms', matchId); // Ref do chatRoom com o matchId
  const chatRoomSnapshot = await getDoc(chatRoomRef);

  if (!chatRoomSnapshot.exists()) {
    return null; // Nenhum chatRoom encontrado
  }

  const chatRoomData = chatRoomSnapshot.data();
  const chatUsers = chatRoomData?.users || []; // Acessar usuários no chatRoom

  return { id: matchId, users: chatUsers };
};

// Função para remover o match e atualizar os usuários
const removeMatchAndUpdateUsers = async (match: Match, chatRoom: any) => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log('Usuário não logado.');
      return; // Se não houver um usuário logado
    }

    // 1. Remover o match da coleção "Matches"
    const matchRef = doc(db, 'Matches', match.id);
    await deleteDoc(matchRef); // Apaga o match

    // 2. Desativar o chatRoom
    const chatRoomRef = doc(db, 'chatRooms', chatRoom.id);
    await updateDoc(chatRoomRef, {
      status: 'desativado', // Marca o chatRoom como desativado
    });

    // 3. Remover o 'uid' dos likes e adicionar no array de dislikes para o usuário logado
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      likes: arrayRemove(match.users[1]), // Remove o outro usuário dos likes
      dislikes: arrayUnion(match.users[1]), // Adiciona no dislikes
    });

    // 4. Fazer o mesmo para o outro usuário
    const otherUserRef = doc(db, 'users', match.users[1]);
    await updateDoc(otherUserRef, {
      likes: arrayRemove(currentUser.uid), // Remove o usuário logado dos likes
      dislikes: arrayUnion(currentUser.uid), // Adiciona no dislikes
    });

    console.log('Match desfeito e usuários atualizados com sucesso.');
  } catch (error) {
    console.error('Erro ao remover match e atualizar usuários:', error);
  }
};

  
  
  

  












  
  

  if (!userProfile) {
    return <Text>Carregando perfil...</Text>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image source={{ uri: userProfile.profilePicture }} style={styles.profileImage} />
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.userName}>{userProfile.firstName} {userProfile.lastName}, {calculateAge(userProfile.birthDate)}</Text>
          <Text style={styles.userBio}>{userProfile.UserBio}</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
        </View>

        {userProfile.additionalPictures.length > 0 ? (
          <Swiper style={styles.wrapper} showsPagination={false} loop={false} autoplay={false} onIndexChanged={handleIndexChanged}>
            {userProfile.additionalPictures.map((image, index) => (
              <View key={index} style={styles.slide}>
                <Image source={{ uri: image }} style={styles.additionalPhoto} />
              </View>
            ))}
          </Swiper>
        ) : (
          <Text style={styles.noImagesText}>Nenhuma foto adicional disponível.</Text>
        )}

        {/* Botão de Unmatch visível */}
        <TouchableOpacity style={styles.unmatchButton} onPress={handleUnmatch}>
          <Text style={styles.unmatchText}>Desfazer Match</Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeArea} onPress={() => setModalVisible(false)} />
          <Image source={{ uri: userProfile.profilePicture }} style={styles.fullImage} />
        </View>
      </Modal>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { paddingTop: 20, paddingBottom: 20 },
  profileImage: { width: 150, height: 150, borderRadius: 75, alignSelf: 'center', marginBottom: 15, marginTop: 50 },
  infoCard: { backgroundColor: '#f8f8f8', padding: 15, borderRadius: 10, marginHorizontal: 20, alignItems: 'center' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  userBio: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 5 },
  progressBarContainer: { height: 5, backgroundColor: '#e0e0e0', borderRadius: 2, overflow: 'hidden', marginVertical: 15, marginHorizontal: 20 },
  progressBar: { height: '100%', backgroundColor: '#3b5998' },
  wrapper: { height: 400 },
  slide: { justifyContent: 'center', alignItems: 'center' },
  additionalPhoto: { width: 350, height: 450, borderRadius: 10 },
  noImagesText: { fontStyle: 'italic', textAlign: 'center', color: 'gray' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '90%', height: '70%', resizeMode: 'contain' },
  closeArea: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  unmatchButton: {
    backgroundColor: '#ff4d4d', // Cor vermelha para destacar
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  unmatchText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
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
  },
});

export default Profile;
