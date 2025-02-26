import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { app } from './firebaseConfig'; // Certifica-te que importas corretamente a configuração do Firebase
import * as ImagePicker from 'expo-image-picker';

const db = getFirestore(app);
const auth = getAuth(app);

interface UserData {
  profilePicture: string | null;
  [key: string]: any; // Caso queira adicionar mais campos no futuro
}

const ProfileScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as DocumentData; // Captura o tipo de dados do Firestore
            setUserData({
              profilePicture: data.profilePicture || null, // Atribui `null` caso a foto não exista
              ...data, // Se existirem outros dados, eles serão adicionados ao estado
            });
            setProfileImage(data.profilePicture || null);
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

  const pickImage = async () => {
    // Verificando a permissão para acessar as imagens
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Desculpe, precisamos de permissão para acessar suas fotos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const saveChanges = async () => {
    if (!profileImage) {
      alert('Por favor, selecione uma foto de perfil!');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, 'users', user.uid), {
        profilePicture: profileImage,
      });

      alert('Perfil atualizado com sucesso!');
    } catch (err) {
      setError('Erro ao atualizar perfil');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (!userData) return <Text>Usuário não encontrado</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      {/* Exibição de imagem de perfil */}
      {profileImage && <Image source={{ uri: profileImage }} style={styles.image} />}
      {!profileImage && <Text>Sem foto de perfil</Text>}

      <Button title="Alterar Foto de Perfil" onPress={pickImage} />
      <Button title="Salvar Alterações" onPress={saveChanges} />

      {/* Exibindo erro, caso exista */}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  image: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default ProfileScreen;


