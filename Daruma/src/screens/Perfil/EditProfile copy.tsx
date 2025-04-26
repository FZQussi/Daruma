import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, TextInput, StyleSheet, ActivityIndicator, Alert, ScrollView, FlatList, TouchableOpacity, Modal } from 'react-native';
import { getAuth, sendPasswordResetEmail  } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import uploadToCloudinary from '../uploadToCloudinary'; // Importando a função de upload
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar } from 'react-native-paper';

const db = getFirestore(app);
const auth = getAuth(app);

interface UserData {
  profilePicture: string | null;
  additionalPictures: string[];
  firstName: string;
  lastName: string;
  UserBio: string;
  [key: string]: any;
}

const EditProfile: React.FC = () => {
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [userBio, setUserBio] = useState<string>('');
  const navigation = useNavigation();
  const [accountType, setAccountType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<'profile' | 'additional' | null>(null);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [showModal, setShowModal] = useState(false); 

  
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            
            const data = userDoc.data() as DocumentData;
            setUserData({
              profilePicture: data.profilePicture || null,
              additionalPictures: data.additionalPictures || [],
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              UserBio: data.UserBio || '',
              ...data,
            });
            setProfileImage(data.profilePicture || null);
            setAdditionalImages(data.additionalPictures || []);
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
            setUserBio(data.UserBio || '');
          } else {
            setUserData(null);
          }
        } catch (err) {
          setError('Erro ao buscar dados do usuário.');
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);


  const toggleVerificationStatus = async () => {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const currentStatus = userSnap.data().verification || 'unverified';
  
        let newStatus;
        switch (currentStatus) {
          case 'unverified':
            newStatus = 'pending';
            break;
          case 'pending':
            newStatus = 'verified';
            break;
          case 'verified':
          default:
            newStatus = 'unverified';
            break;
        }
  
        await updateDoc(userRef, {
          verification: newStatus,
        });
  
        alert(`Status de verificação atualizado para "${newStatus}"`);
      } else {
        alert('Usuário não encontrado no banco de dados.');
      }
    } catch (error) {
      console.error('Erro ao atualizar verificação:', error);
      alert('Erro ao atualizar verificação.');
    }
  };
  
  
  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', 'Verifique sua caixa de entrada para redefinir sua senha.');
      setShowModal(false);  // Fechar o modal após o envio do e-mail
    } catch (error: any) {
      setErrorMessage(error.message);
      Alert.alert('Erro', error.message);
    }
 };
  
  
  // Função para alterar a foto de perfil
  const pickProfileImageAndSave = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Precisamos de permissão para acessar suas fotos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        setLoading(true);
        const cloudinaryUrl = await uploadToCloudinary(result.assets[0].uri); // Faz o upload para Cloudinary

        const user = auth.currentUser;
        if (!user) return;

        await updateDoc(doc(db, 'users', user.uid), {
          profilePicture: cloudinaryUrl, // Salva a URL da foto de perfil no Firebase
        });

        setProfileImage(cloudinaryUrl);
        alert('Foto de perfil atualizada com sucesso!');
      } catch (err) {
        setError('Erro ao fazer upload da foto de perfil.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Função para adicionar foto adicional
  const addAdditionalImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Precisamos de permissão para acessar suas fotos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        setLoading(true);
        const cloudinaryUrl = await uploadToCloudinary(result.assets[0].uri); // Faz upload da foto adicional

        const user = auth.currentUser;
        if (!user) return;

        const updatedImages = [...additionalImages, cloudinaryUrl];

        await updateDoc(doc(db, 'users', user.uid), {
          additionalPictures: updatedImages, // Atualiza a lista de fotos adicionais no Firebase
        });

        setAdditionalImages(updatedImages);
        alert('Foto adicional adicionada com sucesso!');
      } catch (err) {
        setError('Erro ao fazer upload da foto adicional.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Função para alterar foto adicional
  const updateAdditionalImage = async (imageUri: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Precisamos de permissão para acessar suas fotos!');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // <<< agora não força corte
      quality: 1,           // qualidade máxima
    });
  
    if (!result.canceled) {
      try {
        setLoading(true);
        const cloudinaryUrl = await uploadToCloudinary(result.assets[0].uri); // Faz o upload da nova foto
  
        const user = auth.currentUser;
        if (!user) return;
  
        const updatedImages = additionalImages.map(img => (img === imageUri ? cloudinaryUrl : img));
  
        await updateDoc(doc(db, 'users', user.uid), {
          additionalPictures: updatedImages,
        });
  
        setAdditionalImages(updatedImages);
        alert('Foto adicional alterada com sucesso!');
      } catch (err) {
        setError('Erro ao atualizar a foto adicional.');
      } finally {
        setLoading(false);
      }
    }
  };
  

  // Função para excluir foto adicional
  const deleteImage = async (imageUri: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const updatedImages = additionalImages.filter(image => image !== imageUri);
      await updateDoc(doc(db, 'users', user.uid), {
        additionalPictures: updatedImages, // Remove a foto da lista de fotos adicionais no Firebase
      });

      setAdditionalImages(updatedImages);
      alert('Foto excluída com sucesso!');
    } catch (err) {
      setError('Erro ao excluir foto.');
    }
  };


  const saveChanges = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        UserBio: userBio,
      });
      alert('Dados atualizados com sucesso!');
    } catch (err) {
      setError('Erro ao atualizar dados.');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (!userData) return <Text>Usuário não encontrado</Text>;




  return (
    <>
    {/* Appbar fora do SafeAreaView */}
   
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Barra no topo */}
      <Appbar.Header mode="small" style={{ backgroundColor: '#fff' }}>
      <Appbar.BackAction onPress={() => {}} />
      <Appbar.Content title="Edit Profile" />
    </Appbar.Header>
  
      {/* Conteúdo scrollável */}
      <ScrollView contentContainerStyle={styles.container}>
        {/* Grelha lado a lado */}
        <View style={styles.gridContainer}>
          {/* Foto de Perfil */}
          <TouchableOpacity
            onPress={() => {
              setSelectedImage(profileImage);
              setSelectedImageType('profile');
              setModalVisible(true);
            }}
            style={styles.mainImageWrapper}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.mainImage} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Foto de perfil</Text>
              </View>
            )}
          </TouchableOpacity>
  
          {/* Fotos adicionais */}
          <View style={styles.additionalImagesContainer}>
            {[0, 1, 2].map((index) => {
              const imageUri = additionalImages[index];
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.additionalWrapper}
                  onPress={() => {
                    if (imageUri) {
                      setSelectedImage(imageUri);
                      setSelectedImageType('additional');
                      setSelectedImageIndex(index);
                      setModalVisible(true);
                    } else {
                      addAdditionalImage();
                    }
                  }}
                >
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.additionalGridImage}
                    />
                  ) : (
                    <View style={styles.placeholder}>
                      <Text style={styles.placeholderText}>+</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
  
      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Botão de fechar */}
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
  
          {/* Conteúdo */}
          <View style={styles.modalContent}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.modalImage}
              />
            )}
  
            {/* Botões */}
            <View style={styles.modalButtonGroup}>
              {selectedImageType === 'profile' && (
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={async () => {
                    setModalVisible(false);
                    await pickProfileImageAndSave();
                  }}
                >
                  <Text style={styles.buttonText}>Alterar Foto de Perfil</Text>
                </TouchableOpacity>
              )}
  
              {selectedImageType === 'additional' && (
                <View style={styles.additionalButtonsRow}>
                  <TouchableOpacity
                    style={styles.additionalButton}
                    onPress={async () => {
                      setModalVisible(false);
                      if (selectedImage) await updateAdditionalImage(selectedImage);
                    }}
                  >
                    <Text style={styles.buttonText}>Alterar</Text>
                  </TouchableOpacity>
  
                  <TouchableOpacity
                    style={[styles.additionalButton, styles.deleteButton]}
                    onPress={async () => {
                      setModalVisible(false);
                      if (selectedImage) await deleteImage(selectedImage);
                    }}
                  >
                    <Text style={styles.buttonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
    </>
  );
     
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 1,
  },
  mainImageWrapper: {
    flex: 2,
    aspectRatio: 1 / 1.25,
    marginRight: 5,
    backgroundColor: '#eee',
    borderRadius: 15,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  additionalImagesContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: 1,
    height: '95%',
  },
  additionalWrapper: {
    flex: 1,
    aspectRatio: 1,
    marginBottom: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
    height: 105,
  },
  additionalGridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  placeholderText: {
    fontSize: 24,
    color: '#888',
  },
  
  // NOVOS ESTILOS DO MODAL
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 16,
  },
  closeButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '85%',
    resizeMode: 'contain',
  },
  modalButtonGroup: {
    marginTop: 40,
    width: '80%',
  },
  profileButton: {
    backgroundColor: 'black',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  additionalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  additionalButton: {
    backgroundColor: 'black',
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'black',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  
});





export default EditProfile;

