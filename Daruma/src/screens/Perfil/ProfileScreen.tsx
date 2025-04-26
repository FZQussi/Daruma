import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Animated, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Swiper from 'react-native-swiper';
import { StackNavigationProp } from '@react-navigation/stack';
import { Appbar } from 'react-native-paper';  // Importando o Appbar
import Svg, { Path } from 'react-native-svg'; // Importando o SVG para usar o ícone de lápis
import { RootStackParamList } from '../types';



type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  additionalPictures: string[];
  birthDate: string;
  UserBio: string;
  verification: 'unverified' | 'verified' | 'pending';
}

interface ProfileProps {
  navigation: ProfileScreenNavigationProp;
}

const db = getFirestore();
const auth = getAuth();
const { width, height } = Dimensions.get('window'); // Obter as dimensões da tela
const verifiedIcon = 'https://res.cloudinary.com/dped93q3y/image/upload/v1745249536/verified_wsohim.png';
const unverifiedIcon = 'https://res.cloudinary.com/dped93q3y/image/upload/v1745253107/unverified_kqwx9o.png';
const pendingverifiedIcon = 'https://res.cloudinary.com/dped93q3y/image/upload/v1745253108/pending_ia0fbb.png';

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
          verification: userData.verification || false,
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
  const getVerificationIcon = (status) => {
    switch (status) {
      case 'verified':
        return verifiedIcon;
      case 'pending':
        return pendingverifiedIcon;
      case 'unverified':
      default:
        return unverifiedIcon;
    }
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
  const handleLogout = async () => {
    try {
      await getAuth().signOut();  // Faz logout do usuário
  
      // Redefine o histórico de navegação, removendo todas as telas anteriores
      navigation.reset({
        index: 0,  // Índice da nova tela (geralmente, 0 é a tela inicial)
        routes: [{ name: 'Login' }],  // Nome da tela para onde o usuário será redirecionado
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };
  if (!userProfile) {
    return <Text>Carregando perfil...</Text>;
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#fff' }}>
        <Appbar.Content title="Perfil" />
        <Appbar.Action icon="account-edit" onPress={() => navigation.navigate('EditProfile')} />
        <Appbar.Action icon="cog" onPress={() => navigation.navigate('Defenitions')}/>
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image source={{ uri: userProfile.profilePicture }} style={styles.profileImage} />
        </TouchableOpacity>

        <View style={styles.infoCard}>
        <Text style={styles.userName}>
  {userProfile.firstName} {userProfile.lastName}, {calculateAge(userProfile.birthDate)}
  {userProfile.verification && (
    <Image
      source={{ uri: getVerificationIcon(userProfile.verification) }}
      style={styles.verifiedIcon}
    />
  )}
</Text>
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
      
        <TouchableOpacity style={styles.navButtonActive} onPress={() => navigation.navigate('Profile')}>
        <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
          <Path 
            d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
            stroke="#FFFFFF" 
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
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingTop: height * 0.05, // 5% da altura da tela
    paddingBottom: height * 0.05, // 5% da altura da tela
  },
  profileImage: {
    width: width * 0.4, // 40% da largura da tela
    height: width * 0.4, // 40% da largura da tela
    borderRadius: width * 0.2, // 50% da largura para deixar a imagem redonda
    alignSelf: 'center',
    marginBottom: height * 0.02, // 2% da altura da tela
    marginTop: height * 0.01, // 10% da altura da tela
  },
  infoCard: {
    backgroundColor: '#f8f8f8',
    padding: width * 0.05, // 5% da largura da tela
    borderRadius: 10,
    marginHorizontal: width * 0.05, // 5% da largura da tela
    alignItems: 'center',
  },
  userName: {
    fontSize: width * 0.06, // 6% da largura da tela
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  verifiedIcon: {
    width: 20,
    height: 20,
    marginLeft: 5,
    marginTop: -2,
  },
  
  userBio: {
    fontSize: width * 0.04, // 4% da largura da tela
    color: '#666',
    textAlign: 'center',
    marginTop: height * 0.01, // 1% da altura da tela
  },
  progressBarContainer: {
    height: height * 0.005, // 0.5% da altura da tela
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: height * 0.02, // 2% da altura da tela
    marginHorizontal: width * 0.05, // 5% da largura da tela
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b5998',
  },
  wrapper: {
    height: height * 0.4, // 40% da altura da tela
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalPhoto: {
    width: width * 0.9, // 90% da largura da tela
    height: height * 0.45, // 45% da altura da tela
    borderRadius: 10,
  },
  noImagesText: {
    fontStyle: 'italic',
    textAlign: 'center',
    color: 'gray',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
  closeArea: {
    position: 'absolute',
    width: '100%',
    height: '100%',
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

export default Profile;

