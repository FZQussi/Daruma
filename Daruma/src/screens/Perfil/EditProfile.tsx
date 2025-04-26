import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, TextInput, StyleSheet, ActivityIndicator, Alert,SafeAreaView,Dimensions, ScrollView, FlatList, TouchableOpacity, Modal } from 'react-native';
import { getAuth, sendPasswordResetEmail  } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, DocumentData, setDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import uploadToCloudinary from '../uploadToCloudinary'; // Importando a função de upload
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const db = getFirestore(app);
const auth = getAuth(app);
const { width, height } = Dimensions.get('window');

interface UserData {
  profilePicture: string | null;
  additionalPictures: string[];
  firstName: string;
  lastName: string;
  UserBio: string;
  [key: string]: any;
  birthDate: string;
}

const EditProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<'profile' | 'additional' | null>(null);

 

const [firstName, setFirstName] = useState<string>('');
const [lastName, setLastName] = useState<string>('');
const [UserBio, setUserBio] = useState<string>('');
const [Question1, setQuestion1] = useState<string>('');
const [Question2, setQuestion2] = useState<string>('');
const [Question3, setQuestion3] = useState<string>('');
const [accountType, setAccountType] = useState<string>('Free');
const [alchool, setAlchool] = useState<string>('');
const [arealocation, setArealocation] = useState<string>('');
const [awnser1, setAwnser1] = useState<string>('');
const [awnser2, setAwnser2] = useState<string>('');
const [awnser3, setAwnser3] = useState<string>('');
const [birthDate, setBirthDate] = useState<string>('');
const [children, setChildren] = useState<string>('');
const [country, setCountry] = useState<string>('');
const [dislikedUsers, setDislikedUsers] = useState<string[]>([]);
const [educationarea, setEducationarea] = useState<string>('');
const [educationschool, setEducationschool] = useState<string>('');
const [educationtier, setEducationtier] = useState<string>('');
const [gender, setGender] = useState<string>('');
const [heigth, setHeigth] = useState<number>(0);
const [interests, setInterests] = useState<string[]>([]);
const [kink1, setKink1] = useState<string>('');
const [kink2, setKink2] = useState<string>('');
const [kink3, setKink3] = useState<string>('');
const [knownlanguages, setKnownlanguages] = useState<string>('');
const [moodstate, setMoodstate] = useState<string>('');
const [personalaty, setPersonalaty] = useState<string>('');
const [pets, setPets] = useState<string>('');
const [preferences, setPreferences] = useState<string>('Male');
const [relationshipstatus, setRelationshipstatus] = useState<string>('');
const [religion, setReligion] = useState<string>('');
const [sexualaty, setSexualaty] = useState<string>('');
const [smoking, setSmoking] = useState<string>('');
const [status, setStatus] = useState<string>('offline');
const [verification, setVerification] = useState<string>('unverified');
const [workplace, setWorkplace] = useState<string>('');
const [workposition, setWorkposition] = useState<string>('');
const [zoodiacsign, setZoodiacsign] = useState<string>('');

const [editModalVisible, setEditModalVisible] = useState(false);
   
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
  const fetchUserData = async () => {
    const user = auth.currentUser;

    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as DocumentData;

          // Atualizar o estado com todos os campos do usuário
          setUserData({
            profilePicture: data.profilePicture || null,
            additionalPictures: data.additionalPictures || [],
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            UserBio: data.UserBio || '',
            Question1: data.Question1 || '',
            Question2: data.Question2 || '',
            Question3: data.Question3 || '',
            accountType: data.accountType || 'Free',
            alchool: data.alchool || '',
            arealocation: data.arealocation || '',
            awnser1: data.awnser1 || '',
            awnser2: data.awnser2 || '',
            awnser3: data.awnser3 || '',
            birthDate: data.birthDate || '',
            children: data.children || '',
            country: data.country || '',
            dislikedUsers: data.dislikedUsers || [],
            educationarea: data.educationarea || '',
            educationschool: data.educationschool || '',
            educationtier: data.educationtier || '',
            gender: data.gender || '',
            heigth: data.heigth || 0,
            interests: data.interests || [],
            kink1: data.kink1 || '',
            kink2: data.kink2 || '',
            kink3: data.kink3 || '',
            knownlanguages: data.knownlanguages || '',
            moodstate: data.moodstate || '',
            personalaty: data.personalaty || '',
            pets: data.pets || '',
            preferences: data.preferences || 'Male',
            relationshipstatus: data.relationshipstatus || '',
            religion: data.religion || '',
            sexualaty: data.sexualaty || '',
            smoking: data.smoking || '',
            status: data.status || 'offline',
            verification: data.verification || 'unverified',
            workplace: data.workplace || '',
            workposition: data.workposition || '',
            zoodiacsign: data.zoodiacsign || '',
            // Outras propriedades que possam estar presentes no documento
          });

          // Definir imagens e outros campos separadamente
          setProfileImage(data.profilePicture || null);
          setAdditionalImages(data.additionalPictures || []);
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setUserBio(data.UserBio || '');
          setQuestion1(data.Question1 || '');
          setQuestion2(data.Question2 || '');
          setQuestion3(data.Question3 || '');
          setAccountType(data.accountType || 'Free');
          setAlchool(data.alchool || '');
          setArealocation(data.arealocation || '');
          setAwnser1(data.awnser1 || '');
          setAwnser2(data.awnser2 || '');
          setAwnser3(data.awnser3 || '');
          setBirthDate(data.birthDate || '');
          setChildren(data.children || '');
          setCountry(data.country || '');
          setDislikedUsers(data.dislikedUsers || []);
          setEducationarea(data.educationarea || '');
          setEducationschool(data.educationschool || '');
          setEducationtier(data.educationtier || '');
          setGender(data.gender || '');
          setHeigth(data.heigth || 0);
          setInterests(data.interests || []);
          setKink1(data.kink1 || '');
          setKink2(data.kink2 || '');
          setKink3(data.kink3 || '');
          setKnownlanguages(data.knownlanguages || '');
          setMoodstate(data.moodstate || '');
          setPersonalaty(data.personalaty || '');
          setPets(data.pets || '');
          setPreferences(data.preferences || 'Male');
          setRelationshipstatus(data.relationshipstatus || '');
          setReligion(data.religion || '');
          setSexualaty(data.sexualaty || '');
          setSmoking(data.smoking || '');
          setStatus(data.status || 'offline');
          setVerification(data.verification || 'unverified');
          setWorkplace(data.workplace || '');
          setWorkposition(data.workposition || '');
          setZoodiacsign(data.zoodiacsign || '');
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
  const updateUserProfile = async () => {
    const user = auth.currentUser;
    
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          lastName,
          birthDate,
          // Adicione aqui outros campos que você deseja atualizar
        }, { merge: true });
  
        console.log('Dados atualizados com sucesso!');
      } catch (err) {
        console.error('Erro ao atualizar os dados', err);
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


  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (!userData) return <Text>Usuário não encontrado</Text>;




  return (
    <>
    {/* Appbar fora do SafeAreaView */}
   
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Barra no topo */}
      <Appbar.Header mode="small" style={{ backgroundColor: '#fff' }}>
      <Appbar.BackAction onPress={() => navigation.navigate('Profile')} />
      <Appbar.Content title="Edit Profile" titleStyle={{ fontSize: 24, fontWeight: 'bold' }} />
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

         
             {/* nome , idade , genero e pais */}
             <TouchableOpacity
          style={styles.FirstinfoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
          <Text style={styles.infoCardTitle}>
            {firstName} {lastName}, {calculateAge(userData.birthDate)}   <Icon 
              name="pencil" 
              size={24} 
              color="black" 
              style={styles.editIcon} 
            />
          </Text>
          <Text style={styles.infoCardText}>
            {gender}, {country}
          </Text>
    
        </TouchableOpacity>


            {/* Trabalho*/}
            <TouchableOpacity
          style={styles.infoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
          <Text style={styles.infoCardTitle}>
            Trabalho   <Icon 
              name="pencil" 
              size={24} 
              color="black" 
              style={styles.editIcon} 
            />
          </Text>
          <Text style={styles.infoCardText}>
            {workplace}, {workposition}
          </Text>
    
        </TouchableOpacity>
         
           {/* Educação*/}
           <TouchableOpacity
          style={styles.infoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
          <Text style={styles.infoCardTitle}>
            Educação   <Icon 
              name="pencil" 
              size={24} 
              color="black" 
              style={styles.editIcon} 
            />
          </Text>
          <Text style={styles.infoCardText}>
            {educationtier}
          </Text>
    
        </TouchableOpacity>

           {/* Mood*/}
           <TouchableOpacity
          style={styles.infoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
          <Text style={styles.infoCardTitle}>
            Estou me a sentir ...   <Icon 
              name="pencil" 
              size={24} 
              color="black" 
              style={styles.editIcon} 
            />
          </Text>
          <Text style={styles.infoCardText}>
            {moodstate}
          </Text>
    
        </TouchableOpacity>

           {/* Bio*/}
           <TouchableOpacity
          style={styles.infoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
          <Text style={styles.infoCardTitle}>
            Bio  <Icon 
              name="pencil" 
              size={24} 
              color="black" 
              style={styles.editIcon} 
            />
          </Text>
          <Text style={styles.infoCardText}>
            {UserBio}
          </Text>
    
        </TouchableOpacity>


      <View style={styles.SecondaryinfoCard}>

             {/* Altura*/}
             <TouchableOpacity
          style={styles.SecondinfoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
           <Icon 
              name="ruler" 
              size={24} 
              color="black" 
              style={styles.SecondeditIcon} 
            /> 
          <Text style={styles.SecondinfoCardTitle}>
         Altura 
          </Text>
          <Text style={styles.SecondinfoCardText}>
            {heigth} cm
           
          </Text>
          <Icon 
              name="chevron-right" 
              size={20} 
              color="grey" 
              style={styles.ArroweditIcon} 
            />
        </TouchableOpacity>

             {/* Filhos*/}
             <TouchableOpacity
          style={styles.SecondinfoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
           <Icon 
              name="ruler" 
              size={24} 
              color="black" 
              style={styles.SecondeditIcon} 
            /> 
          <Text style={styles.SecondinfoCardTitle}>
         Filhos 
          </Text>
          <Text style={styles.SecondinfoCardText}>
            {heigth} cm
           
          </Text>
          <Icon 
              name="chevron-right" 
              size={20} 
              color="grey" 
              style={styles.ArroweditIcon} 
            />
        </TouchableOpacity>
              {/* Alcool*/}
              <TouchableOpacity
          style={styles.SecondinfoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
           <Icon 
              name="ruler" 
              size={24} 
              color="black" 
              style={styles.SecondeditIcon} 
            /> 
          <Text style={styles.SecondinfoCardTitle}>
         Álcool 
          </Text>
          <Text style={styles.SecondinfoCardText}>
            {heigth} cm
           
          </Text>
          <Icon 
              name="chevron-right" 
              size={20} 
              color="grey" 
              style={styles.ArroweditIcon} 
            />
        </TouchableOpacity>

              {/* Você fala*/}
              <TouchableOpacity
          style={styles.SecondinfoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
           <Icon 
              name="ruler" 
              size={24} 
              color="black" 
              style={styles.SecondeditIcon} 
            /> 
          <Text style={styles.SecondinfoCardTitle}>
         Você Fala
          </Text>
          <Text style={styles.SecondinfoCardText}>
            {heigth} cm
           
          </Text>
          <Icon 
              name="chevron-right" 
              size={20} 
              color="grey" 
              style={styles.ArroweditIcon} 
            />
        </TouchableOpacity>

              {/* Estado Civil*/}
              <TouchableOpacity
          style={styles.SecondinfoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
           <Icon 
              name="ruler" 
              size={24} 
              color="black" 
              style={styles.SecondeditIcon} 
            /> 
          <Text style={styles.SecondinfoCardTitle}>
         Estado Civil 
          </Text>
          <Text style={styles.SecondinfoCardText}>
            {heigth} cm
           
          </Text>
          <Icon 
              name="chevron-right" 
              size={20} 
              color="grey" 
              style={styles.ArroweditIcon} 
            />
        </TouchableOpacity>

              {/* Fumar*/}
              <TouchableOpacity
          style={styles.SecondinfoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
           <Icon 
              name="ruler" 
              size={24} 
              color="black" 
              style={styles.SecondeditIcon} 
            /> 
          <Text style={styles.SecondinfoCardTitle}>
         Cigarro 
          </Text>
          <Text style={styles.SecondinfoCardText}>
            {heigth} cm
           
          </Text>
          <Icon 
              name="chevron-right" 
              size={20} 
              color="grey" 
              style={styles.ArroweditIcon} 
            />
        </TouchableOpacity>

              {/* Signo*/}
              <TouchableOpacity
          style={styles.SecondinfoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
           <Icon 
              name="ruler" 
              size={24} 
              color="black" 
              style={styles.SecondeditIcon} 
            /> 
          <Text style={styles.SecondinfoCardTitle}>
         Signo
          </Text>
          <Text style={styles.SecondinfoCardText}>
            {heigth} cm
           
          </Text>
          <Icon 
              name="chevron-right" 
              size={20} 
              color="grey" 
              style={styles.ArroweditIcon} 
            />
        </TouchableOpacity>

              {/* Pets*/}
              <TouchableOpacity
          style={styles.SecondinfoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
           <Icon 
              name="ruler" 
              size={24} 
              color="black" 
              style={styles.SecondeditIcon} 
            /> 
          <Text style={styles.SecondinfoCardTitle}>
         Animais
          </Text>
          <Text style={styles.SecondinfoCardText}>
            {heigth} cm
           
          </Text>
          <Icon 
              name="chevron-right" 
              size={20} 
              color="grey" 
              style={styles.ArroweditIcon} 
            />
        </TouchableOpacity>


              {/* Religião*/}
              <TouchableOpacity
          style={styles.SecondinfoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
           <Icon 
              name="ruler" 
              size={24} 
              color="black" 
              style={styles.SecondeditIcon} 
            /> 
          <Text style={styles.SecondinfoCardTitle}>
         Religião 
          </Text>
          <Text style={styles.SecondinfoCardText}>
            {heigth} cm
           
          </Text>
          <Icon 
              name="chevron-right" 
              size={20} 
              color="grey" 
              style={styles.ArroweditIcon} 
            />
        </TouchableOpacity>

              {/* Personalidade*/}
              <TouchableOpacity
          style={styles.SecondinfoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
           <Icon 
              name="ruler" 
              size={24} 
              color="black" 
              style={styles.SecondeditIcon} 
            /> 
          <Text style={styles.SecondinfoCardTitle}>
         Personalidade
          </Text>
          <Text style={styles.SecondinfoCardText}>
            {heigth} cm
           
          </Text>
          <Icon 
              name="chevron-right" 
              size={20} 
              color="grey" 
              style={styles.ArroweditIcon} 
            />
        </TouchableOpacity>
        </View>
         <View style={styles.SecondaryinfoCard}>
         <Text style={styles.infoCardTitle}>
         Perguntas e Respostas
          </Text>


             {/* nome , idade , genero e pais */}
             <TouchableOpacity
          style={styles.ThirdinfoCard}
          onPress={() => {
            setEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
          <Text style={styles.ThirdinfoCardTitle}>
            {Question1}<Icon 
              name="pencil" 
              size={24} 
              color="black" 
              style={styles.ThirdeditIcon} 
            />
          </Text>
          <Text style={styles.ThirdinfoCardText}>
            {awnser1}
          </Text>
    
        </TouchableOpacity>
        
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


        {/* Modal de edição */}
        <Modal
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer2}>
          {/* Botão de fechar */}
          <View style={styles.closeButtonContainer2}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.closeButtonText2}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Conteúdo */}
          <View style={styles.modalContent2}>
            <Text style={styles.modalTitle}>Editar Nome e Idade</Text>
            <TextInput
              style={styles.inputField}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Nome"
            />
            <TextInput
              style={styles.inputField}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Sobrenome"
            />
            <TextInput
              style={styles.inputField}
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="Ano de nascimento"
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={async () => {
                // Atualiza os dados na Firebase
                await updateUserProfile(); // Função para atualizar os dados no Firestore
                setEditModalVisible(false);
              }}
            >
              <Text style={styles.buttonText2}>Salvar Alterações</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
    </>
  );
     
};

const styles = StyleSheet.create({
  
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.01,
    paddingBottom: height * 0.15,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',  // Garantir que as imagens fiquem bem alinhadas à esquerda
    alignItems: 'flex-start',
    padding: 1,
  },
  mainImageWrapper: {
    width: width * 0.65,  // Aumentando a largura da foto principal
    height: width * 0.9, // Ajustando a altura proporcionalmente
    marginRight: 10,     // Adicionando margem à direita para dar mais espaço entre as imagens
    backgroundColor: '#eee',
    borderRadius: 15,
    overflow: 'hidden',
    marginLeft: width * 0.25,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  additionalImagesContainer: {
    flexDirection: 'row',      // Mantém as imagens lado a lado
    flexWrap: 'wrap',          // Permite que as imagens quebrem para uma nova linha se necessário
    justifyContent: 'flex-start',  // Alinha as imagens à esquerda
    width: width * 0.55,   // A largura total das imagens adicionais agora ocupa mais espaço
    paddingTop: 1,
  },
  additionalWrapper: {
    width: width * 0.28,  // A largura das imagens adicionais se mantém a mesma
    height: height * 0.131,          // A altura permanece fixa
    marginRight: 10,      // Espaço entre as imagens adicionais
    marginBottom: 8,      // Espaço abaixo das imagens
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
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
  

  // Estilos para a área retangular (Nome e Idade)
  FirstinfoCard: {
    backgroundColor: '#f5f5f5',
    flex: 2,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: height * 0.025,
    width: width * 1
    
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    flex: 2,
    borderRadius: 10,
    marginBottom: 10,
    
    width: width * 1
  },
  editIcon: {
    marginLeft: 10, // Espaço entre o texto e o ícone
    padding: 5,
  },
  infoCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: width* 0.03,
    marginTop: height * 0.015,
  },
  infoCardText: {
    fontSize: 16,
    marginLeft: width* 0.03,
    marginTop: height * 0.015,
    marginBottom: height * 0.015,
    color: "grey",
    
  },

  // Estilos para o Modal de Edição
  modalContainer2: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButtonContainer2: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 16,
  },
  closeButtonText2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContent2: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  inputField: {
    width: '100%',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  saveButton: {
    backgroundColor: 'black',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  buttonText2: {
    color: 'white',
    fontSize: 16,
  },


  SecondinfoCard: {
    backgroundColor: '#f5f5f5',
    padding: width * 0.02,
    borderRadius: 10,
    flexDirection: 'row',  // Isso vai alinhar os itens horizontalmente
    alignItems: 'center',  // Centraliza os itens verticalmente
    justifyContent: 'space-between',  // Coloca o ícone no lado direito
    
  },
  SecondinfoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: -width* 0.3,
    marginRight: width* 0.3
  },
  SecondinfoCardText: {
    fontSize: 14,
    
  },
  SecondeditIcon: {
    marginLeft: width* 0.01, // Espaço entre o texto e o ícone
    padding: 5,
    marginRight: width* 0.05
  },
  ArroweditIcon: {
    marginLeft: - width* 0.25, // Espaço entre o texto e o ícone
    padding: 5,
    marginRight: -width* 0.03
    
  },
  SecondaryinfoCard: {
    backgroundColor: '#f5f5f5',
    flex: 2,
    borderRadius: 10,
    marginBottom: 10,
    
    width: width * 1
  },
 

  ThirdinfoCard: {
    backgroundColor: '#f5f5f5',
    flex: 2,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: height * 0.025,
    width: width * 1
    
  },
  ThirdeditIcon: {
    marginLeft: 10, // Espaço entre o texto e o ícone
    padding: 5,
  },
  ThirdinfoCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: width* 0.03,
    marginTop: height * 0.015,
  },
  ThirdinfoCardText: {
    fontSize: 16,
    marginLeft: width* 0.03,
    marginTop: height * 0.015,
    marginBottom: height * 0.015,
    color: "grey",
    
  },
});





export default EditProfile;

