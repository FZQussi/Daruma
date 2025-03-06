import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, Button, ScrollView, TouchableOpacity } from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { query, where } from 'firebase/firestore';
import Svg, { Path } from 'react-native-svg';

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

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>A carregar perfis...</Text>
      ) : profiles.length === 0 ? (
        <Text>Não existem perfis disponíveis. Atualizando...</Text>  // Se estiver vazio, vamos atualizar
      ) : profile === null ? (
        <Text>Não há mais perfis disponíveis. Atualizando...</Text>  // Recarrega os perfis
      ) : (
        <ScrollView contentContainerStyle={styles.profileContainer}>
          {profile && (
            <>
              <Image source={{ uri: profile.profilePicture }} style={styles.image} />
              <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
              {profile.additionalPictures.length > 0 && (
                <View style={styles.additionalImagesContainer}>
                  {profile.additionalPictures.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.additionalImage} />
                  ))}
                </View>
              )}
              <View style={styles.buttonContainer}>
                <Button title="❌ Dislike" onPress={handleDislike} color="red" />
                <Button title="❤️ Like" onPress={handleLike} color="green" />
              </View>
              <Button title="Próximo" onPress={getNextProfile} />
              <Button title="Ver Meus Matches" onPress={() => navigation.navigate('MatchList')} />
            </>
          )}
        </ScrollView>
      )}
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  additionalImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  additionalImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    margin: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
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

export default MatchScreen;


