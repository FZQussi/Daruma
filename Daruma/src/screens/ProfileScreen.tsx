import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Animated, TouchableOpacity, Modal } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Swiper from 'react-native-swiper';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path } from 'react-native-svg'; // Importando o SVG para usar o ícone de lápis
import { RootStackParamList } from './types';


type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  additionalPictures: string[];
  birthDate: string;
  UserBio: string;
}

interface ProfileProps {
  navigation: ProfileScreenNavigationProp;
}

const db = getFirestore();
const auth = getAuth();

const Profile: React.FC<ProfileProps> = ({ navigation }) => {
  const userId = auth.currentUser?.uid; // Obtendo o ID do usuário logado
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return; // Garantir que o usuário esteja logado

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
      </ScrollView>

      <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeArea} onPress={() => setModalVisible(false)} />
          <Image source={{ uri: userProfile.profilePicture }} style={styles.fullImage} />
        </View>
      </Modal>

      {/* Botão de editar no topo direito com ícone SVG */}
      <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.editButton}>
      <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12.2424 20H17.5758M4.48485 16.5L15.8242 5.25607C16.5395 4.54674 17.6798 4.5061 18.4438 5.16268V5.16268C19.2877 5.8879 19.3462 7.17421 18.5716 7.97301L7.39394 19.5L4 20L4.48485 16.5Z"
      stroke="#464455"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
      </TouchableOpacity>
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { paddingTop: 20, paddingBottom: 20 },
  profileImage: { width: 150, height: 150, borderRadius: 75, alignSelf: 'center', marginBottom: 15, marginTop: 70 },
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
  closeArea: { position: 'absolute', width: '100%', height: '100%' },
  editButton: { 
    position: 'absolute', 
    top: 20, 
    right: 0, 
    backgroundColor: 'transparent', 
    padding: 10,
    zIndex: 1 
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

