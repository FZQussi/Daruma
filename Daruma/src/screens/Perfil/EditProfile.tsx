import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, TextInput, StyleSheet, ActivityIndicator, Alert,SafeAreaView,Dimensions, ScrollView, FlatList, TouchableOpacity, Modal } from 'react-native';
import { getAuth, sendPasswordResetEmail  } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, DocumentData, setDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import uploadToCloudinary from '../uploadToCloudinary'; // Importando a função de upload
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Appbar, Chip } from 'react-native-paper';
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
  interests: [];
  verification: string,
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

  const verifiedIcon = 'https://res.cloudinary.com/dped93q3y/image/upload/v1745249536/verified_wsohim.png';

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
const [verification, setVerification] = useState<string>('');
const [workplace, setWorkplace] = useState<string>('');
const [workposition, setWorkposition] = useState<string>('');
const [zoodiacsign, setZoodiacsign] = useState<string>('');

// contsmodals
const [editModalVisible, setEditModalVisible] = useState(false);

const [PesonaleditModalVisible, setPesonalEditModalVisible] = useState(false);
const [TrabalhoeditModalVisible, setTrabalhoEditModalVisible] = useState(false);
const [EducacaoeditModalVisible, setEducacaoEditModalVisible] = useState(false);
const [MoodeditModalVisible, setMoodEditModalVisible] = useState(false);
const [BioeditModalVisible, setBioEditModalVisible] = useState(false);

const [AlturaeditModalVisible, setAlturaEditModalVisible] = useState(false);
const [FilhoseditModalVisible, setFilhosEditModalVisible] = useState(false);
const [AlcooleditModalVisible, setAlcoolEditModalVisible] = useState(false);
const [LinguaseditModalVisible, setLinguasEditModalVisible] = useState(false);
const [CivileditModalVisible, setCivilEditModalVisible] = useState(false);
const [CigarroeditModalVisible, setCigarroEditModalVisible] = useState(false);
const [SignoeditModalVisible, setSignoEditModalVisible] = useState(false);
const [AnimaiseditModalVisible, setAnimaisEditModalVisible] = useState(false);
const [ReligiaoeditModalVisible, setReligiaoEditModalVisible] = useState(false);
const [PersonalidadeeditModalVisible, setPersonalidadeEditModalVisible] = useState(false);

const [FquestioneditModalVisible, setFquestionEditModalVisible] = useState(false);
const [SquestioneditModalVisible, setSquestionEditModalVisible] = useState(false);
const [TquestioneditModalVisible, setTquestionEditModalVisible] = useState(false);

const [InteresseseditModalVisible, setInteressesEditModalVisible] = useState(false);






   
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
            verification: data.verification,
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
          setVerification(data.verification || '');
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
            setPesonalEditModalVisible(true); // Abre o modal para editar nome e idade
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
            setTrabalhoEditModalVisible(true); // Abre o modal para editar nome e idade
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
            setMoodEditModalVisible(true); // Abre o modal para editar nome e idade
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
            setBioEditModalVisible(true); // Abre o modal para editar nome e idade
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
            setAlturaEditModalVisible(true); // Abre o modal para editar nome e idade
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
            setFilhosEditModalVisible(true); // Abre o modal para editar nome e idade
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
            setAlcoolEditModalVisible(true); // Abre o modal para editar nome e idade
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
            setLinguasEditModalVisible(true); // Abre o modal para editar nome e idade
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
            setCivilEditModalVisible(true); // Abre o modal para editar nome e idade
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
            setCigarroEditModalVisible(true); // Abre o modal para editar nome e idade
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
            setSignoEditModalVisible(true); // Abre o modal para editar nome e idade
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
            setAnimaisEditModalVisible(true); // Abre o modal para editar nome e idade
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
            setReligiaoEditModalVisible(true); // Abre o modal para editar nome e idade
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
            setPersonalidadeEditModalVisible(true); // Abre o modal para editar nome e idade
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


        {/* Perguntas e Respostas*/}
         <View style={styles.thirdyinfoCard}>
         <Text style={styles.infoCardTitle}>
         Perguntas e Respostas
          </Text>


             {/* pergunta 1*/}
             <TouchableOpacity
          style={styles.ThirdinfoCard}
          onPress={() => {
            setFquestionEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
          <Text style={styles.ThirdinfoCardTitle}>
            1. {Question1}<Icon 
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

          {/* pergunta 2 */}
          <TouchableOpacity
          style={styles.ThirdinfoCard}
          onPress={() => {
            setSquestionEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
          <Text style={styles.ThirdinfoCardTitle}>
            2. {Question2}<Icon 
              name="pencil" 
              size={24} 
              color="black" 
              style={styles.ThirdeditIcon} 
            />
          </Text>
          <Text style={styles.ThirdinfoCardText}>
            {awnser2}
          </Text>
    
        </TouchableOpacity>

          {/* pergunta 3 */}
          <TouchableOpacity
          style={styles.ThirdinfoCard}
          onPress={() => {
            setTquestionEditModalVisible(true); // Abre o modal para editar nome e idade
          }}
        >
          <Text style={styles.ThirdinfoCardTitle}>
            3. {Question3}<Icon 
              name="pencil" 
              size={24} 
              color="black" 
              style={styles.ThirdeditIcon} 
            />
          </Text>
          <Text style={styles.ThirdinfoCardText}>
            {awnser3}
          </Text>
    
        </TouchableOpacity>
        
        </View>

          {/* interesses */}
          <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>
        Interesses
        <Icon 
          name="pencil" 
          size={24} 
          color="black" 
          style={styles.editIcon} 
        />
      </Text>
      <TouchableOpacity
        style={styles.FirstinfoCard}
        onPress={() => {
          setInteressesEditModalVisible(true); // Abre o modal para editar nome e idade
        }}
      >

        {/* Exibindo os interesses como chips */}
        <View style={styles.chipContainer}>
          {userData.interests && userData.interests.length > 0 ? (
            userData.interests.map((interests, index) => (
              <Chip  key={index} style={styles.chip}>
                <Text style={styles.chipText}>#{interests}</Text>
              </Chip>
            ))
          ) : (
            <Text style={styles.infoCardText}>Nenhum interesse registrado</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>

       {/* Verificação */}
       <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>
        Verificação 
        
      </Text>
      <View style={styles.FirstinfoCard}>
          {verification === "unverified" ? (
            <View style={styles.notVerifiedContainer}>
              <Text style={styles.verificationText}>
                Seu perfil ainda não foi verificado. 
              </Text>
              <TouchableOpacity style={styles.verificationButton}>
                <Text style={styles.verificationButtonText}>Verificar agora</Text>
              </TouchableOpacity>
            </View>
          ) : verification === "pending" ? (
            <View style={styles.pendingContainer}>
              <Text style={styles.verificationText}>
                Sua verificação está pendente. Aguarde a aprovação.
              </Text>
            </View>
          ) : (
            <View style={styles.verifiedContainer}>
              <Text style={styles.verificationText}>
                Seu perfil está verificado!
              </Text>
            </View>
          )}
        </View>
    </View>


 
      </ScrollView>



  {/* ----------------------------------------------------------------------------------------------------------------------------------------------------------- */}
  {/* ----------------------------------------------------------------------------------------------------------------------------------------------------------- */}
  {/* ----------------------------------------------------------------------------------------------------------------------------------------------------------- */}
  {/* ----------------------------------------------------------------------------------------------------------------------------------------------------------- */}



      {/* Modal Foto Perfil */}
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

  {/* ----------------------------------------------------------------------------------------------------------------------------------------------------------- */}
  {/* ----------------------------------------------------------------------------------------------------------------------------------------------------------- */}
  {/* ----------------------------------------------------------------------------------------------------------------------------------------------------------- */}
  {/* ----------------------------------------------------------------------------------------------------------------------------------------------------------- */}


      <Modal
  visible={editModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      {/* Botão de fechar */}
      <TouchableOpacity 
        style={styles.closeButtonContainer3} 
        onPress={() => setEditModalVisible(false)}
      >
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>

      {/* Conteúdo do Modal */}
      <Text style={styles.modalTitle2}>Editar Dados</Text>
      <TextInput
        style={styles.inputField2}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Nome"
      />
      <TouchableOpacity
        style={styles.saveButton2}
        onPress={async () => {
          await updateUserProfile();
          setEditModalVisible(false);
        }}
      >
        <Text style={styles.buttonText3}>Salvar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

        {/* ----------------------------------------------------------------------------------------------------------------------------------------------------------- */}
  {/* ----------------------------------------------------------------------------------------------------------------------------------------------------------- */}
  {/* ----------------------------------------------------------------------------------------------------------------------------------------------------------- */}
  {/* ----------------------------------------------------------------------------------------------------------------------------------------------------------- */}


 {/* Modal - Editar Informação Pessoal */}
<Modal
  visible={PesonaleditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setPesonalEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setPesonalEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Informação Pessoal</Text>
      {/* Campos específicos aqui */}
    </View>
  </View>
</Modal>

{/* Modal - Editar Trabalho */}
<Modal
  visible={TrabalhoeditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setTrabalhoEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setTrabalhoEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Trabalho</Text>
    </View>
  </View>
</Modal>

{/* Modal - Editar Educação */}
<Modal
  visible={EducacaoeditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setEducacaoEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setEducacaoEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Educação</Text>
    </View>
  </View>
</Modal>

{/* Modal - Editar Mood */}
<Modal
  visible={MoodeditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setMoodEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setMoodEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Mood</Text>
    </View>
  </View>
</Modal>

{/* Modal - Editar Bio */}
<Modal
  visible={BioeditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setBioEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setBioEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Bio</Text>
    </View>
  </View>
</Modal>

{/* Modal - Editar Altura */}
<Modal
  visible={AlturaeditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setAlturaEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setAlturaEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Altura</Text>
    </View>
  </View>
</Modal>

{/* Modal - Editar Filhos */}
<Modal
  visible={FilhoseditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setFilhosEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setFilhosEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Informação sobre Filhos</Text>
    </View>
  </View>
</Modal>

{/* Modal - Editar Álcool */}
<Modal
  visible={AlcooleditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setAlcoolEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setAlcoolEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Consumo de Álcool</Text>
    </View>
  </View>
</Modal>

{/* Modal - Editar Línguas */}
<Modal
  visible={LinguaseditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setLinguasEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setLinguasEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Línguas</Text>
    </View>
  </View>
</Modal>

{/* Modal - Editar Estado Civil */}
<Modal
  visible={CivileditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setCivilEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setCivilEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Estado Civil</Text>
    </View>
  </View>
</Modal>

{/* Modal - Editar Cigarro */}
<Modal
  visible={CigarroeditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setCigarroEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setCigarroEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Consumo de Cigarros</Text>
    </View>
  </View>
</Modal>

{/* Modal - Editar Signo */}
<Modal
  visible={SignoeditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setSignoEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setSignoEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Signo</Text>
    </View>
  </View>
</Modal>

{/* Modal - Editar Animais */}
<Modal
  visible={AnimaiseditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setAnimaisEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setAnimaisEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Animais</Text>
    </View>
  </View>
</Modal>

{/* Modal - Editar Religião */}
<Modal
  visible={ReligiaoeditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setReligiaoEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setReligiaoEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Religião</Text>
    </View>
  </View>
</Modal>

{/* Modal - Editar Personalidade */}
<Modal
  visible={PersonalidadeeditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setPersonalidadeEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity style={styles.closeButtonContainer3} onPress={() => setPersonalidadeEditModalVisible(false)}>
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle2}>Editar Personalidade</Text>
    </View>
  </View>
</Modal>


{/* Modal para Primeira Pergunta */}
<Modal
  visible={FquestioneditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setFquestionEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity 
        style={styles.closeButtonContainer3} 
        onPress={() => setFquestionEditModalVisible(false)}
      >
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.modalTitle2}>Editar Primeira Pergunta</Text>
      <TextInput
        style={styles.inputField2}
        placeholder="Digite a resposta..."
        // Aqui colocarias o valor/controlador correto
      />
      <TouchableOpacity
        style={styles.saveButton2}
        onPress={() => setFquestionEditModalVisible(false)}
      >
        <Text style={styles.buttonText3}>Salvar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

{/* Modal para Segunda Pergunta */}
<Modal
  visible={SquestioneditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setSquestionEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity 
        style={styles.closeButtonContainer3} 
        onPress={() => setSquestionEditModalVisible(false)}
      >
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.modalTitle2}>Editar Segunda Pergunta</Text>
      <TextInput
        style={styles.inputField2}
        placeholder="Digite a resposta..."
      />
      <TouchableOpacity
        style={styles.saveButton2}
        onPress={() => setSquestionEditModalVisible(false)}
      >
        <Text style={styles.buttonText3}>Salvar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

{/* Modal para Terceira Pergunta */}
<Modal
  visible={TquestioneditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setTquestionEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity 
        style={styles.closeButtonContainer3} 
        onPress={() => setTquestionEditModalVisible(false)}
      >
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.modalTitle2}>Editar Terceira Pergunta</Text>
      <TextInput
        style={styles.inputField2}
        placeholder="Digite a resposta..."
      />
      <TouchableOpacity
        style={styles.saveButton2}
        onPress={() => setTquestionEditModalVisible(false)}
      >
        <Text style={styles.buttonText3}>Salvar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

{/* Modal para Interesses */}
<Modal
  visible={InteresseseditModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setInteressesEditModalVisible(false)}
>
  <View style={styles.bottomModalContainer}>
    <View style={styles.bottomModalContent}>
      <TouchableOpacity 
        style={styles.closeButtonContainer3} 
        onPress={() => setInteressesEditModalVisible(false)}
      >
        <Text style={styles.closeButtonText3}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.modalTitle2}>Editar Interesses</Text>
      <TextInput
        style={styles.inputField2}
        placeholder="Digite os interesses..."
      />
      <TouchableOpacity
        style={styles.saveButton2}
        onPress={() => setInteressesEditModalVisible(false)}
      >
        <Text style={styles.buttonText3}>Salvar</Text>
      </TouchableOpacity>
    </View>
  </View>
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
    justifyContent: 'center', // Centraliza na vertical
    alignItems: 'center',     // Centraliza na horizontal
    backgroundColor: 'rgba(0,0,0,0.1)', // Fundo escuro semi-transparente
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
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    maxHeight: '70%', // O modal ocupa no máximo 70% da altura
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
 
  thirdyinfoCard: {
    backgroundColor: '#f5f5f5',
    flex: 2,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 1
  },
  ThirdinfoCard: {
    backgroundColor: 'white',
    flex: 2,
    borderRadius: 20,
    marginBottom: 10,
    marginTop: height * 0.01,
    width: width * 0.95
    
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -5,
    marginLeft: 10,
  },
  chip: {
    margin: 5,
    backgroundColor: '#A7C7E7',
    borderRadius: 30,
  },
  chipText: {
    fontWeight: 'bold',   // Deixa o texto em negrito
    color: 'black',       // Cor preta
  },

  verificationContainer: {
    marginTop: 20,
  },
  notVerifiedContainer: {
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  pendingContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  verifiedContainer: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 16,
    color: '#333',
  },
  verificationButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  verificationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  

  bottomModalContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Modal no fundo
    backgroundColor: 'rgba(0,0,0,0.5)', // Fundo escuro semi-transparente
  },
  bottomModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '40%', // Só 40% da altura
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  closeButtonContainer3: {
    alignSelf: 'flex-end',
  },
  closeButtonText3: {
    fontSize: 24,
    color: 'black',
  },
  modalTitle2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  inputField2: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton2: {
    backgroundColor: '#4da6ff', // Azul bebê
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText3: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});





export default EditProfile;

