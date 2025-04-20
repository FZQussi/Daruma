import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, TextInput, StyleSheet, ActivityIndicator, Alert, ScrollView, FlatList, TouchableOpacity, Modal } from 'react-native';
import { getAuth, sendPasswordResetEmail  } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { app } from './firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import uploadToCloudinary from './uploadToCloudinary'; // Importando a função de upload
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';


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
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        setLoading(true);
        const cloudinaryUrl = await uploadToCloudinary(result.assets[0].uri); // Faz o upload da nova foto

        const user = auth.currentUser;
        if (!user) return;

        const updatedImages = additionalImages.map(img => (img === imageUri ? cloudinaryUrl : img));

        await updateDoc(doc(db, 'users', user.uid), {
          additionalPictures: updatedImages, // Atualiza a foto na lista de fotos adicionais no Firebase
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

  // Função para exibir as opções ao clicar na imagem
  const handleImagePress = (imageUri: string) => {
    Alert.alert('Escolha uma ação', 'O que você deseja fazer?', [
      {
        text: 'Alterar Foto',
        onPress: () => updateAdditionalImage(imageUri), // Altera foto adicional
      },
      {
        text: 'Excluir Foto',
        onPress: () => deleteImage(imageUri), // Exclui foto adicional
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ]);
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      {/* Exibição de imagem de perfil */}
      {profileImage ? (
        <Image source={{ uri: profileImage }} style={styles.image} />
      ) : (
        <Text>Sem foto de perfil</Text>
      )}
      <Button title="Alterar Foto de Perfil" onPress={pickProfileImageAndSave} />

      {/* Campos de texto para editar dados */}
      <View style={styles.inputContainer}>
        <Text>Nome</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Sobrenome</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Bio</Text>
        <TextInput
          style={styles.input}
          value={userBio}
          onChangeText={setUserBio}
          multiline
        />
      </View>

      {/* Abaixo está o botão para abrir o modal de redefinição de senha */}
      <Text style={styles.forgotPassword} onPress={() => setShowModal(true)}>
          Esqueci-me da minha palavra-passe
      </Text>
          
      

      <Button title="Salvar Alterações" onPress={saveChanges} />
      {/* Modal para inserção de e-mail para redefinir a senha */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Digite seu e-mail para redefinir a senha</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Digite seu e-mail"
            />
            <Button title="Enviar E-mail" onPress={handlePasswordReset} />
            <Button title="Fechar" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>
      {/* Exibindo fotos adicionais em uma FlatList */}
      <Text style={styles.subtitle}>Outras Fotos</Text>
      {additionalImages.length > 0 ? (
        <FlatList
          data={additionalImages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleImagePress(item)}>
              <Image source={{ uri: item }} style={styles.additionalImage} />
            </TouchableOpacity>
          )}
          horizontal
        />
      ) : (
        <Text style={styles.noImagesText}>Nenhuma foto adicional.</Text>
      )}

      {/* Exibindo o botão para adicionar foto, apenas quando houver menos de 3 fotos adicionais */}
      {additionalImages.length < 3 && (
        <Button title="Adicionar Foto Adicional" onPress={addAdditionalImage} />
      )}

      {/* Exibindo erro, caso exista */}
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={{ marginTop: 30, alignItems: 'center' }}>
  <TouchableOpacity
    onPress={() => navigation.navigate('ProfilePlan')}
    style={{
      backgroundColor: '#007AFF',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginBottom: 5,
    }}
  >
    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ir para Plano</Text>
  </TouchableOpacity>

  {accountType !== null && (
    <Text style={{ marginTop: 5, color: '#444' }}>
      Tipo de conta: {accountType}
    </Text>
  )}
</View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  image: { width: 150, height: 150, borderRadius: 75, marginBottom: 20 },
  inputContainer: { marginBottom: 15, width: '80%' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
  subtitle: { fontSize: 18, marginTop: 20, fontWeight: 'bold' },
  additionalImage: { width: 150, height: 150, borderRadius: 10, margin: 5 },
  noImagesText: { fontStyle: 'italic', color: 'gray' },
  error: { color: 'red', marginTop: 10 },
  forgotPassword: {
    color: 'black',
    marginTop: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',

  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escuro
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
});

export default EditProfile;

