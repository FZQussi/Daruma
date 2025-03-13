import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, Button, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { query, where } from 'firebase/firestore';
import Svg, { Path } from 'react-native-svg';
import Swiper from 'react-native-swiper';

const db = getFirestore(app);
const auth = getAuth(app);

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  additionalPictures: string[];
  gender: string;
}

interface Match {
  users: string[];
  status: string;
  createdAt: any;
}


const MatchScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const currentUser = auth.currentUser;

    const handleSwipeLeft = async () => {
    if (!profile || !currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid), { dislikes: arrayUnion(profile.id) });
    getNextProfile();
  };

  const handleSwipeRight = async () => {
    if (!profile || !currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid), { likes: arrayUnion(profile.id) });
    getNextProfile();
  };


  const fetchProfiles = async () => {
    if (!currentUser) return;

    setLoading(true);

    const userRef = doc(db, 'users', currentUser.uid);
    const currentUserDoc = await getDoc(userRef);
    const currentUserData = currentUserDoc.data();

    if (!currentUserData) return;

    const genderPreference = currentUserData.preferences;
    
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users: Profile[] = querySnapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id } as Profile))
      .filter(user => user.id !== currentUser?.uid);

    const filteredProfiles = users.filter(user => {
      if (genderPreference === 'Female' && user.gender === 'Female') return true;
      if (genderPreference === 'Male' && user.gender === 'Male') return true;
      if (genderPreference === 'Both') return true;
      return false;
    });

    const currentUserRef = doc(db, 'users', currentUser.uid);
    const currentUserDataSnapshot = await getDoc(currentUserRef);
    const currentUserLikes = currentUserDataSnapshot.data()?.likes || [];
    
    const matchesQuery = query(collection(db, 'Matches'), where('users', 'array-contains', currentUser.uid));
    const matchSnapshot = await getDocs(matchesQuery);
    const matchedUserIds = new Set<string>();
    
    matchSnapshot.forEach((doc) => {
      const matchData = doc.data() as Match;
      if (matchData.users) {
        matchData.users.forEach((userId: string) => {
          if (userId !== currentUser.uid) matchedUserIds.add(userId);
        });
      }
    });

    const availableProfiles = filteredProfiles.filter(user => {
      return !currentUserLikes.includes(user.id) && !matchedUserIds.has(user.id);
    });

    setProfiles(availableProfiles);

    if (availableProfiles.length > 0) {
      setProfile(availableProfiles[Math.floor(Math.random() * availableProfiles.length)]);
    } else {
      setProfile(null); // No profiles available
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();  // Chama a função para carregar os perfis ao iniciar
  }, [currentUser]);

  const getNextProfile = () => {
    if (profiles.length > 1 && profile) {
      const newProfiles = profiles.filter(p => p.id !== profile.id);
      setProfiles(newProfiles);

      if (newProfiles.length > 0) {
        setProfile(newProfiles[Math.floor(Math.random() * newProfiles.length)]);
      } else {
        // Caso contrário, mostramos um estado indicando que não há mais perfis
        setProfile(null);
      }
    } else {
      // Se não houver perfis, recarregar a lista
      fetchProfiles();  // Chama novamente para carregar os perfis
    }
  };

  const checkMatch = async (likedUserId: string) => {
    if (!currentUser) return false;

    const likedUserRef = doc(db, 'users', likedUserId);
    const likedUserDoc = await getDoc(likedUserRef);

    if (likedUserDoc.exists()) {
      const likedUserData = likedUserDoc.data();
      return likedUserData.likes?.includes(currentUser.uid);
    }

    return false;
  };

  const handleLike = async () => {
    if (!currentUser || !profile) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const likedUserId = profile.id;

    try {
      await updateDoc(userRef, {
        likes: arrayUnion(likedUserId),
        dislikes: arrayRemove(likedUserId),
      });

      const isMatch = await checkMatch(likedUserId);

      if (isMatch) {
        console.log('🎉 Match encontrado!');
        
        const matchRef = await addDoc(collection(db, 'Matches'), {
          users: [currentUser.uid, likedUserId],
          status: 'ativo',
          createdAt: new Date(),
        });

        const matchId = matchRef.id;

        const chatRoomRef = doc(db, 'chatRooms', matchId);
        await setDoc(chatRoomRef, {
          users: [currentUser.uid, likedUserId],
          messages: [],
          status: 'ativo',
          createdAt: new Date(),
        });

        console.log(`💬 Sala de chat criada: ${matchId}`);

        navigation.navigate('MatchChats', { matchId });
      }

      getNextProfile();
    } catch (error) {
      console.error('Erro ao dar like:', error);
    }
  };

  const handleDislike = async () => {
    if (!currentUser || !profile) return;

    const userRef = doc(db, 'users', currentUser.uid);

    try {
      await updateDoc(userRef, {
        dislikes: arrayUnion(profile.id),
      });

      getNextProfile();
    } catch (error) {
      console.error('Erro ao dar dislike:', error);
    }
  };

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
  
  return (
    <ImageBackground 
      source={{ uri: 'https://res.cloudinary.com/dped93q3y/image/upload/v1741791078/profile_pics/yhahsqll16casizjoaqi.jpg' }} 
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Barra no topo (fixa) */}
        <View style={styles.headerBar}>
          <Text style={styles.headerText}>Match Screen</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={() => console.log('Botão 1 clicado')}>
              <Text style={styles.buttonText}>Opção 1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => console.log('Botão 2 clicado')}>
              <Text style={styles.buttonText}>Opção 2</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ScrollView para tornar o perfil rolável */}
        <ScrollView contentContainerStyle={styles.profileCardContainer}>
          {loading ? (
            <Text style={styles.loadingText}>A carregar perfis...</Text>
          ) : profiles.length === 0 ? (
            <Text style={styles.loadingText}>Não existem perfis disponíveis.</Text>
          ) : profile === null ? (
            <Text style={styles.loadingText}>Não há mais perfis disponíveis.</Text>
          ) : (
            <View style={styles.profileCard}>
              
              <Image source={{ uri: profile.profilePicture }} style={styles.profileImage} />
              <Text style={styles.profileName}>
                {profile.firstName} {profile.lastName}, {calculateAge(profile.birthDate)}
              </Text>
              <Text style={styles.profileBio}>{profile.UserBio}</Text>

              {/* Exibir imagens adicionais se existirem */}
              {profile.additionalPictures.length > 0 && (
                <View style={styles.profileCard}>
                  <Image
                    key={0}
                    source={{ uri: profile.additionalPictures[0] }}
                    style={styles.additionalImage}
                  />
                </View>
              )}
              {profile.additionalPictures.length > 1 && (
                <View style={styles.additionalImagesContainer}>
                  <Image
                    key={1}
                    source={{ uri: profile.additionalPictures[1] }}
                    style={styles.additionalImage}
                  />
                </View>
              )}
              {profile.additionalPictures.length > 2 && (
                <View style={styles.additionalImagesContainer}>
                  <Image
                    key={2}
                    source={{ uri: profile.additionalPictures[2] }}
                    style={styles.additionalImage}
                  />
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Botões Like e Dislike */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.dislikeButton]} onPress={handleDislike}>
            <Text style={styles.buttonText}>❌</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={handleLike}>
            <Text style={styles.buttonText}>❤️</Text>
          </TouchableOpacity>
        </View>

        {/* Navbar fixa no fundo */}
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
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('LikeScreen')}>
            <Text style={styles.navText}>Likes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.navText}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerBar: {
    position: 'absolute',
  
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingVertical: 20,
    paddingHorizontal: 20,
    zIndex: 1000,
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  profileCardContainer: {
    paddingTop: 100, 
    paddingBottom: 150, // Padding extra para a navbar fixa
    alignItems: 'center',
  },
  profileCard: {
    width: '95%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 0,
    alignItems: 'center',
    elevation: 5,  // Sombra externa
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginTop: 50,
  },
  profileCardInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 15,  // Espaço interno
    backgroundColor: 'rgba(255, 255, 255, 0.9)',  // A cor interna
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,  // Sombra interna mais forte
    shadowRadius: 8,  // Maior raio para um efeito mais forte
    borderColor: '#ccc',
    borderWidth: 1,  // Para simular uma borda
    overflow: 'hidden',  // Esconde qualquer coisa fora do contêiner
  },
  profileImage: {
    width: '100%',
    height: 500,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  profileBio: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 15,
  },
  additionalImagesContainer: {
    marginTop: 100,
    marginBottom: 100,
  },
  additionalImage: {
    width: 391,
    height: 500,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 170,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dislikeButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 50,
    elevation: 5,
  },
  likeButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 50,
    elevation: 5,
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  navButton: {
    padding: 10,
  },
  navText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MatchScreen;
