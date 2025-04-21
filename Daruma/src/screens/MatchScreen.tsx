import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Dimensions , Modal} from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { query, where } from 'firebase/firestore';
import Svg, { Path } from 'react-native-svg';
import Swiper from 'react-native-swiper';
import {  Appbar, Dialog, Portal, RadioButton, TextInput, Button, FAB} from 'react-native-paper';
const db = getFirestore(app);
const auth = getAuth(app);
const { width, height } = Dimensions.get('window');


interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  additionalPictures: string[];
  gender: string;
  birthDate: string,
  UserBio: string,

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
  const [visible, setVisible] = useState(false);
  const [gender, setGender] = useState('');
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile| null>(null);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);

  const currentUser = auth.currentUser;
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const openMatchModal = (profile: Profile) => {
    setMatchedProfile(profile);
    setMatchModalVisible(true);
  };
  
  const closeMatchModal = () => {
    setMatchedProfile(null);
    setMatchModalVisible(false);
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

  const handleSavePreferences = async () => {
    if (currentUser) {
      try {
        setLoading(true);  // Define o estado de carregamento como true

        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          preferences: gender,
        });

        setLoading(false);  // Define o estado de carregamento como false após o sucesso
        hideDialog();  // Fecha o dialog após salvar as preferências
      } catch (error) {
        setLoading(false);  // Garante que o estado de carregamento seja desativado se houver erro
        console.error('Erro ao salvar preferências:', error);
      }
    } else {
      console.log("Usuário não está autenticado.");
    }
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
    const likedUserRef = doc(db, 'users', profile.id); // o utilizador que recebeu o like
    const likedUserId = profile.id;
  
    try {
      // Atualiza os dados do utilizador atual (quem deu like)
      await updateDoc(userRef, {
        likes: arrayUnion(likedUserId),
        dislikes: arrayRemove(likedUserId),
      });
  
      // Atualiza os dados do utilizador que recebeu o like
      await updateDoc(likedUserRef, {
        receivedLikes: arrayUnion(currentUser.uid),
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
        setCurrentMatchId(matchId); // salva o ID do match
      
        const chatRoomRef = doc(db, 'chatRooms', matchId);
        await setDoc(chatRoomRef, {
          users: [currentUser.uid, likedUserId],
          messages: [],
          status: 'ativo',
          createdAt: new Date(),
        });
      
        console.log(`💬 Sala de chat criada: ${matchId}`);
      
        openMatchModal(profile);
      
        return;
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
  const matchMessages = [
    `Você e ${matchedProfile?.firstName} são Almas Gêmeas!`,
    `🔥 Rolou química entre você e ${matchedProfile?.firstName}!`,
    `✨ Match perfeito com ${matchedProfile?.firstName}!`,
    `💫 Você e ${matchedProfile?.firstName} se curtiram de verdade!`,
    `💖 Que casal! Você e ${matchedProfile?.firstName} formam uma dupla poderosa!`,
    `🎉 ${matchedProfile?.firstName} também deu like em você! Bora conversar?`,
    `💕 Você e ${matchedProfile?.firstName} nasceram pra se encontrar!`,
    `💌 Cupido acertou em cheio com você e ${matchedProfile?.firstName}!`,
    `🌟 A conexão entre você e ${matchedProfile?.firstName} é mágica!`,
    `💥 Deu match! Você e ${matchedProfile?.firstName} são fogo e paixão!`,
    `🍷 Hora de brindar esse match com ${matchedProfile?.firstName}!`,
    `💃🕺 Você e ${matchedProfile?.firstName} vão arrasar juntos!`,
    `🌈 Match colorido com ${matchedProfile?.firstName}, que vibe boa!`,
    `🔥 O clima esquentou entre você e ${matchedProfile?.firstName}!`,
    `🎯 Acertaram em cheio! ${matchedProfile?.firstName} também curtiu você.`,
    `🧲 Você e ${matchedProfile?.firstName} se atraíram como ímãs!`,
    `💬 ${matchedProfile?.firstName} está só esperando sua primeira mensagem!`,
    `💞 Você e ${matchedProfile?.firstName} estão na mesma sintonia.`,
    `🎶 Você e ${matchedProfile?.firstName} dariam uma bela canção de amor.`,
    `🚀 Que conexão! Você e ${matchedProfile?.firstName} têm potencial interestelar!`,
  ];
  
  const [matchMessage, setMatchMessage] = useState('');
  useEffect(() => {
    if (matchModalVisible && matchedProfile) {
      const randomIndex = Math.floor(Math.random() * matchMessages.length);
      setMatchMessage(matchMessages[randomIndex]);
    }
  }, [matchModalVisible, matchedProfile]);
    
  return (
      <View style={styles.container}>
<Appbar.Header mode="small" style={{ backgroundColor: '#FFF' }}>
        <Appbar.Content title="Encontros" titleStyle={{ fontSize: 24, fontWeight: 'bold' }} />
        <Appbar.Action icon="cog" onPress={showDialog} />
      </Appbar.Header>

      {/* Dialog para escolher preferências */}
      <Portal>
  <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialog}>
    <Dialog.Title style={styles.title}>Preferências</Dialog.Title>
    <Dialog.Content>
      <Text style={styles.text}>Escolha o seu gênero preferido</Text>
      <RadioButton.Group onValueChange={newValue => setGender(newValue)} value={gender}>
  <RadioButton.Item 
    label="Masculino" 
    value="Male" 
    labelStyle={styles.radioLabel} 
    color="#4A90E2" // azul bebê
  />
  <RadioButton.Item 
    label="Feminino" 
    value="Female" 
    labelStyle={styles.radioLabel} 
    color="#4A90E2"
  />
  <RadioButton.Item 
    label="Ambos" 
    value="Both" 
    labelStyle={styles.radioLabel} 
    color="#4A90E2"
  />
</RadioButton.Group>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={hideDialog} textColor="#4A90E2">Cancelar</Button>
      <Button onPress={handleSavePreferences} textColor="#4A90E2">Salvar</Button>
    </Dialog.Actions>
  </Dialog>
</Portal>
        
{profile && (
  <View style={styles.profileOverlay}>
    <Text style={styles.overlayName}>
      {profile.firstName}, {calculateAge(profile.birthDate)}
    </Text>
  </View>
)}

        {/* ScrollView para tornar o perfil rolável */}
        <View style={styles.profileCardContainer}>
  {loading ? (
    <Text style={styles.loadingText}>A carregar perfis...</Text>
  ) : profiles.length === 0 ? (
    <Text style={styles.loadingText}>Não existem perfis disponíveis.</Text>
  ) : profile === null ? (
    <Text style={styles.loadingText}>Não há mais perfis disponíveis.</Text>
  ) : (
    <View style={styles.profileCard}>
      <ScrollView contentContainerStyle={styles.profileContent} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: profile.profilePicture }} style={styles.profileImage} />
        
        {profile.UserBio ? (
  <View style={{ marginTop: 16 }}>
    <Text style={styles.profileBioTitle}>Sobre Mim</Text>
    <Text style={styles.profileBio}>{profile.UserBio}</Text>
  </View>
) : null}



        {profile.additionalPictures.map((pic, index) => (
          <Image key={index} source={{ uri: pic }} style={styles.additionalImage} />
        ))}
      </ScrollView>
    </View>
  )}
</View>


        {/* Botões Like e Dislike */}
        <View style={styles.buttonContainer}>
  {/* Botão de Dislike */}
  <FAB
    icon="close-thick"
    style={styles.fabDislike}
    onPress={handleDislike}
    color="white"
  />

  {/* Botão de Like */}
  <FAB
    icon="heart"
    style={styles.fabLike}
    onPress={handleLike}
    color="white"
  />
</View>
<Portal>
  <Modal visible={matchModalVisible} onDismiss={closeMatchModal} contentContainerStyle={styles.modalContainer}>
    {matchedProfile && (
      <View style={styles.innerContainer}>
        <Image 
          source={{ uri: matchedProfile.profilePicture }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <Text style={styles.title}>💘 É um Match!</Text>
        <Text style={styles.subtitle}>
  {matchMessage}
</Text>

        <View style={styles.buttonRow}>
          <Button 
            mode="outlined" 
            onPress={() => {
              closeMatchModal();
              getNextProfile();
            }} 
            textColor="white" 
            style={styles.outlinedButton}
          >
            Continuar
          </Button>
          <Button 
            mode="contained" 
            onPress={() => {
              closeMatchModal();
              if (currentMatchId) {
                navigation.navigate('MatchChats', { matchId: currentMatchId });
                setCurrentMatchId(null);
              } else {
                console.warn("Match ID não disponível");
              }
            }} 
            buttonColor="white" 
            textColor="black"
          >
            Ir para o chat
          </Button>
        </View>
      </View>
    )}
  </Modal>
</Portal>

        {/* Navbar fixa no fundo */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('MatchList')}>
            <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.9973 8.53055C11.1975 7.62155 9.8639 7.37703 8.86188 8.2094C7.85986 9.04177 7.71879 10.4334 8.50568 11.4179C8.97361 12.0033 10.1197 13.053 10.9719 13.8079C11.3237 14.1195 11.4996 14.2753 11.7114 14.3385C11.8925 14.3925 12.102 14.3925 12.2832 14.3385C12.4949 14.2753 12.6708 14.1195 13.0226 13.8079C13.8748 13.053 15.0209 12.0033 15.4888 11.4179C16.2757 10.4334 16.1519 9.03301 15.1326 8.2094C14.1134 7.38579 12.797 7.62155 11.9973 8.53055Z"
                stroke="#696969"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <Path
                d="M3 7.2C3 6.07989 3 5.51984 3.21799 5.09202C3.40973 4.71569 3.71569 4.40973 4.09202 4.21799C4.51984 4 5.0799 4 6.2 4H17.8C18.9201 4 19.4802 4 19.908 4.21799C20.2843 4.40973 20.5903 4.71569 20.782 5.09202C21 5.51984 21 6.0799 21 7.2V20L17.6757 18.3378C17.4237 18.2118 17.2977 18.1488 17.1656 18.1044C17.0484 18.065 16.9277 18.0365 16.8052 18.0193C16.6672 18 16.5263 18 16.2446 18H6.2C5.07989 18 4.51984 18 4.09202 17.782C3.71569 17.5903 3.40973 17.2843 3.21799 16.908C3 16.4802 3 15.9201 3 14.8V7.2Z"
                stroke="#696969"
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
        
          <TouchableOpacity style={styles.navButtonActive} onPress={() => navigation.navigate('MatchScreen')}>
            <Svg fill="#FFFFFF" viewBox="0 0 24 24" width={30} height={30}>
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
      </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerBar: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: height * 0.06,
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.05,
    zIndex: 1000,
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: 'black',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: width * 0.02,
  },
  headerButton: {
    paddingVertical: height * 0.007,
    paddingHorizontal: width * 0.03,
    borderRadius: width * 0.015,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: width * 0.04,
    color: 'white',
    textAlign: 'center',
    marginTop: height * 0.02,
  },
  profileCardContainer: {
    flex: 1,
    padding: width * 0.01,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    width: width * 0.95,
    height: height * 0.8,
    borderRadius: width * 0.05,
    backgroundColor: 'white',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: height * 0.05,
  },
  dialog: {
    backgroundColor: 'white',
  },
  title: {
    fontSize: width * 0.09,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: height * 0.02,
  },
  subtitle: {
    fontSize: width * 0.05,
    color: 'white',
    marginBottom: height * 0.04,
    textAlign: 'center', // <-- esta linha alinha o texto ao centro
  },
  text: {
    color: '#01579B',
    fontSize: width * 0.04,
  },
  radioLabel: {
    color: '#0277BD',
    fontSize: width * 0.04,
  },
  profileContent: {
    alignItems: 'center',
  },
  profileCardInner: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.05,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
  },
  profileImage: {
    width: width,
    height: height * 0.8,
    borderTopLeftRadius: width * 0.05,
    borderTopRightRadius: width * 0.05,
    marginBottom: height * 0.01,
  },
  profileName: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#333',
  },
  profileBio: {
    fontSize: width * 0.05,
    color: '#555',
    textAlign: 'left',
    marginTop: height * 0.01,
    marginBottom: height * 0.015,
    fontWeight: 'bold',
  },
  profileBioTitle: {
    fontSize: width * 0.035,
    color: '#777',
    fontWeight: '500',
    marginBottom: height * 0.005,
    textAlign: 'left',
    width: height * 0.4,
  },
  additionalImagesContainer: {
    marginTop: 0,
    marginBottom: 0,
  },
  additionalImage: {
    width: width,
    height: height * 0.8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: height * 0.12,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: width * 0.4,
  },
  actionButton: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
  dislikeButton: {
    backgroundColor: 'white',
    padding: width * 0.04,
    borderRadius: 50,
    elevation: 5,
  },
  likeButton: {
    backgroundColor: 'white',
    padding: width * 0.04,
    borderRadius: 50,
    elevation: 5,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: height * 0.015,
    borderTopWidth: 1,
    borderColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navButton: {
    width: '18%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: width * 0.035,
    fontWeight: 'bold',
    color: '#333',
  },
  navButtonActive: {
    width: '18%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A7C7E7',
    borderRadius: width * 0.08,
    padding: width * 0.01,
  },
  fabLike: {
    backgroundColor: '#A7C7E7',
    position: 'absolute',
    right: width * 0.1,
    bottom: height * 0.025,
  },
  fabDislike: {
    backgroundColor: '#A7C7E7',
    position: 'absolute',
    left: width * 0.1,
    bottom: height * 0.025,
  },
  profileOverlay: {
    position: 'absolute',
    top: height * 0.17,
    left: width * 0.05,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: width * 0.02,
    borderRadius: width * 0.03,
  },
  overlayName: {
    color: 'white',
    fontSize: width * 0.055,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: width * 0.05,
  },
  outlinedButton: {
    borderColor: 'white',
  },
});


export default MatchScreen;
