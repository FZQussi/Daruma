// src/screens/RegistrationStep3.tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from './firebaseConfig';
import uploadToCloudinary from './uploadToCloudinary'; // Função para enviar imagens ao Cloudinary
import { useRegistration } from '../context/RegistrationContext';

const db = getFirestore(app); // Firestore

const RegistrationStep3: React.FC<any> = ({ navigation }) => {
  const { userData, setUserData } = useRegistration();
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [additionalImagesUri, setAdditionalImagesUri] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Função para selecionar imagem
  const pickImage = async (isProfileImage: boolean) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permissão necessária', 'Você precisa permitir o acesso à galeria!');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Manter proporção quadrada
        quality: 1,
      });

      if (!pickerResult.canceled) { 
        const imageUri = pickerResult.assets[0].uri; // Acessando URI da imagem

        if (isProfileImage) {
          setProfileImageUri(imageUri);
        } else {
          if (additionalImagesUri.length < 3) {
            setAdditionalImagesUri((prevImages) => [...prevImages, imageUri]);
          } else {
            Alert.alert('Limite atingido', 'Você pode selecionar no máximo 3 imagens adicionais.');
          }
        }
      }
    } catch (error: any) {
      setError('Erro ao selecionar a imagem: ' + error.message);
    }
  };

  const uploadImages = async () => {
    if (!profileImageUri) {
      setError('Selecione uma foto de perfil!');
      return;
    }
  
    setLoading(true);
    try {
      const user = getAuth(app).currentUser;
      const userId = user?.uid;
      
      if (!userId) {
        setLoading(false);
        setError('Usuário não autenticado!');
        return;
      }
  
      // Enviar imagem de perfil ao Cloudinary
      const profileImageURL = await uploadToCloudinary(profileImageUri);
  
      // Enviar imagens adicionais ao Cloudinary
      const additionalImagesURLs: string[] = [];
      for (let i = 0; i < additionalImagesUri.length; i++) {
        const additionalImageURL = await uploadToCloudinary(additionalImagesUri[i]);
        additionalImagesURLs.push(additionalImageURL);
      }
  
      // Atualizar o estado global com as URLs das imagens e outros dados
      setUserData({
        ...userData,
        profilePicture: profileImageURL,
        additionalPictures: additionalImagesURLs,
        likedUsers: [], // Lista vazia por padrão
        dislikedUsers: [], // Lista vazia por padrão
        accountType: 'normal', // Tipo de conta padrão
      });
  
      setLoading(false);
      Alert.alert('Sucesso', 'Fotos carregadas com sucesso!');
      navigation.navigate('Home');
  
    } catch (error: any) {
      setLoading(false);
      setError('Erro ao enviar as imagens: ' + error.message);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Passo 3: Carregar Fotos de Perfil</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text>Foto de Perfil</Text>
      <Button title="Selecionar Foto de Perfil" onPress={() => pickImage(true)} />
      {profileImageUri && <Image source={{ uri: profileImageUri }} style={styles.image} />}

      <Text>Fotos Adicionais (Máximo 3)</Text>
      <Button title="Selecionar Foto Adicional" onPress={() => pickImage(false)} />
      {additionalImagesUri.length > 0 && (
        <View style={styles.imageContainer}>
          {additionalImagesUri.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.image} />
          ))}
        </View>
      )}

      <Button
        title={loading ? 'Carregando...' : 'Enviar Fotos'}
        onPress={uploadImages}
        disabled={loading}
      />
    </View>
  );
};

// Estilos da tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
});

export default RegistrationStep3;
