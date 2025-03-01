import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, Button } from 'react-native';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';  // Certifique-se de importar o RootStackParamList corretamente

const db = getFirestore(app);
const auth = getAuth(app);

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

const MatchScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!currentUser) return;

      const querySnapshot = await getDocs(collection(db, 'users'));
      const users: Profile[] = querySnapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as Profile))
        .filter(user => user.id !== currentUser?.uid);
      
      setProfiles(users);
      if (users.length > 0) {
        setProfile(users[Math.floor(Math.random() * users.length)]);
      }
    };

    fetchProfiles();
  }, []);

  const getNextProfile = () => {
    if (profiles.length > 1) {
      const newProfiles = profiles.filter(p => p.id !== profile?.id);
      setProfile(newProfiles[Math.floor(Math.random() * newProfiles.length)]);
    } else {
      setProfile(null);
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

  const createChatRoom = async (user1: string, user2: string) => {
    const chatRoomId = `${user1}_${user2}`;

    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
    const chatRoomDoc = await getDoc(chatRoomRef);

    if (!chatRoomDoc.exists()) {
      await setDoc(chatRoomRef, {
        users: [user1, user2],
        messages: [],
        createdAt: new Date(),
      });

      console.log(`💬 Sala de chat criada: ${chatRoomId}`);
    }

    return chatRoomId;
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

        // Criar sala de chat permanente
        const chatRoomId = await createChatRoom(currentUser.uid, likedUserId);

        // Navegar para a tela de chat com o match
        navigation.navigate('MatchChats', { matchId: chatRoomId });

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
        likes: arrayRemove(profile.id),
        dislikes: arrayUnion(profile.id),
      });

      getNextProfile();
    } catch (error) {
      console.error('Erro ao dar dislike:', error);
    }
  };

  return (
    <View style={styles.container}>
      {profile ? (
        <>
          <Image source={{ uri: profile.profilePicture }} style={styles.image} />
          <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
          <View style={styles.buttonContainer}>
            <Button title="❌ Dislike" onPress={handleDislike} color="red" />
            <Button title="❤️ Like" onPress={handleLike} color="green" />
          </View>
          <Button title="Próximo" onPress={getNextProfile} />
          <Button
            title="Ver Meus Matches"
            onPress={() => navigation.navigate('MatchList')}
          />
        </>
      ) : (
        <Text>Nenhum perfil disponível no momento.</Text>
      )}
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
  },
});

export default MatchScreen;
