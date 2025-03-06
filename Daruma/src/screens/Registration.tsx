import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from './firebaseConfig';
import uploadToCloudinary from './uploadToCloudinary'; // Função para enviar imagens ao Cloudinary
import { useRegistration } from '../context/RegistrationContext';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Location from 'expo-location';  


// Função para carregar países
const fetchCountries = async () => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    return data.map((country: any) => ({
      label: country.name.common,
      value: country.cca2,
    }));
  } catch (error) {
    console.error('Erro ao carregar países:', error);
    Alert.alert('Erro', 'Não foi possível carregar os países. Tente novamente.');
    return [];
  }
};

const Registration: React.FC<any> = ({ navigation }) => {
  const { userData, setUserData } = useRegistration();
  const db = getFirestore(app);
  // Estados do formulário
  const [email, setEmail] = useState(userData.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState(userData.firstName || '');
  const [lastName, setLastName] = useState(userData.lastName || '');
  const [UserBio, setUserBio] = useState(userData.UserBio || '');
  const [username, setUsername] = useState(userData.username || '');
  const [country, setCountry] = useState(userData.country || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => (currentYear - i).toString());
  const minimumYear = currentYear - 18;
  const [showAlert, setShowAlert] = useState(false);
  

  const handleYearSelection = (year: string) => {
    if (parseInt(year) > minimumYear) {
      setShowAlert(true);
    } else {
      setSelectedYear(year); // ✅ Salva corretamente a data de nascimento
    }
  };
  
  // Efeito para resetar o estado após o alerta ser fechado
useEffect(() => {
  if (showAlert) {
    Alert.alert('Idade insuficiente', 'Você precisa ter no mínimo 18 anos para continuar.', [
      { text: 'OK', onPress: () => {
        setShowAlert(false);
        setSelectedYear(''); // Resetar o campo corretamente
      }}
    ]);
  }
}, [showAlert]);
  

  // Preferências e gênero
  const [gender, setGender] = useState(userData.gender || '');
  const [preferences, setPreferences] = useState(userData.preferences || '');

  // Imagens
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [additionalImagesUri, setAdditionalImagesUri] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState<any[]>([]);

  // Novos estados para coleta de dados adicionais
  const [location, setLocation] = useState<any>(null); // Para armazenar localização do usuário
  const [deviceInfo, setDeviceInfo] = useState<any>(null); // Para armazenar informações do dispositivo
  const [DeviceId, setDeviceId] = useState<any>(null);
  
    // Verificação em tempo real do email
  useEffect(() => {
    if (email) {
      const checkEmail = async () => {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const querySnapshot = await getDocs(q);
        setEmailExists(!querySnapshot.empty);
      };
      checkEmail();
    }
  }, [email]);

  // Verificação em tempo real do username
  useEffect(() => {
    if (username) {
      const checkUsername = async () => {
        const q = query(collection(db, 'users'), where('username', '==', username));
        const querySnapshot = await getDocs(q);
        setUsernameExists(!querySnapshot.empty);
      };
      checkUsername();
    }
  }, [username]);

  // Carregar lista de países ao iniciar o componente
  useEffect(() => {
    const loadCountries = async () => {
      const countryList = await fetchCountries();
      if (countryList.length > 0) {
        setCountries(countryList);
      }
    };

 // Função para obter a localização do usuário
 const fetchLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erro', 'Permissão para acessar a localização não foi concedida.');
      return;
    }

    const userLocation = await Location.getCurrentPositionAsync({});
    setLocation(userLocation.coords);
  } catch (error) {
    console.error('Erro ao obter a localização:', error);
    setLocation(null); // Caso haja um erro, definimos como null
  }
};

// Função para obter as informações do dispositivo
const getDeviceInfo = () => {
  const deviceData = {
    model: Device.modelName,
    os: Device.osName,
    version: Application.nativeApplicationVersion, // Corrigido para 'nativeApplicationVersion'
  };
  setDeviceInfo(deviceData);
};

loadCountries();
fetchLocation();
getDeviceInfo();
  }, []);

  // Função para criar o usuário no Firebase Authentication
const createUser = async () => {
  try {
    const auth = getAuth(app);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'users', user.uid), { email, username });
    Alert.alert('Sucesso', 'Registro concluído com sucesso!');
    navigation.navigate('Home');
    if (user) {
      // Usuário criado com sucesso, agora vamos finalizar o registro
      finalizeRegistration(user);
    }
  } catch (error: any) {
    setErrorMessage('Erro ao criar usuário: ' + error.message);
  }
};


  // Função para finalizar o registro e salvar os dados no Firestore
  const finalizeRegistration = async (user: any) => {
    try {
      if (!profileImageUri) {
        Alert.alert('Erro', 'Você precisa carregar uma foto de perfil!');
        return;
      }

      setLoading(true);

      // Verificar se o `user.uid` está correto
      const userId = user.uid;
      console.log('ID do usuário:', userId);

      if (!userId) {
        setLoading(false);
        Alert.alert('Erro', 'Usuário não autenticado corretamente!');
        return;
      }

      await setDoc(doc(getFirestore(app), 'users', userId), {
        email,
        firstName,
        lastName,
        username,
        country,
        gender,
        preferences,
        DeviceId,
        profilePicture: await uploadToCloudinary(profileImageUri),
        additionalPictures: await Promise.all(additionalImagesUri.map(async (uri) => uploadToCloudinary(uri))),
        likedUsers: [],
        dislikedUsers: [],
        accountType: 'normal',
        status: 'offline',
        location,
        device: deviceInfo,
        createdAt: new Date(),
        appVersion: Application.nativeApplicationVersion,
        UserBio, // ✅ Adicionado Bio
        birthDate: selectedYear, // ✅ Adicionado Data de Nascimento
      });

      setLoading(false);
      Alert.alert('Sucesso', 'Registro concluído com sucesso!');
      navigation.navigate('Home'); // Redireciona para a tela principal ou onde desejar
    } catch (error) {
      console.error('Erro ao salvar dados no Firestore:', error);
      setLoading(false);
      Alert.alert('Erro', 'Não foi possível finalizar o registro. Tente novamente.');
    }
  };


  const handleNextStep = () => {
    if (emailExists) {
      setErrorMessage('Este email já está em uso.');
      return;
    }
    if (usernameExists) {
      setErrorMessage('Este nome de usuário já está em uso.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('A confirmação da senha não corresponde.');
      return;
    }
    if (!validatePassword(password)) {
      setErrorMessage('A senha deve ter entre 8 e 16 caracteres, incluir pelo menos 1 símbolo e 1 letra maiúscula.');
      return;
    }
    if (!profileImageUri) {
      setErrorMessage('Você precisa carregar uma foto de perfil!');
      return;
    }
    if (!gender) {
      setErrorMessage('Você precisa selecionar um gênero');
      return;
    }
    if (!country) {
      setErrorMessage('Você precisa selecionar um país');
      return;
    }
    if (!preferences) {
      setErrorMessage('Você precisa selecionar uma preferência');
      return;
    }
  
    // Verificar se o usuário tem pelo menos 18 anos
    const currentYear = new Date().getFullYear();
    const minimumYear = currentYear - 18;
  
    if (!selectedYear || parseInt(selectedYear) > minimumYear) {
      setErrorMessage('Você precisa ter no mínimo 18 anos para continuar.');
      return;
    }
  
    createUser();
  };
  

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8 && password.length <= 16;
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    return hasMinLength && hasSymbol && hasUppercase;
  };

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
        const imageUri = pickerResult.assets[0].uri;

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
      console.error('Erro ao selecionar a imagem:', error);
      setError('Erro ao selecionar a imagem: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Etapa 1 */}
      <Text style={styles.header}>Registro de Usuário</Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      {emailExists && <Text style={styles.error}>Este email já está em uso.</Text>}

      <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirmar Senha" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Nome" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Sobrenome" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Nome de Usuário" value={username} onChangeText={setUsername} />
      {usernameExists && <Text style={styles.error}>Este nome de usuário já está em uso.</Text>}
        <TextInput
    style={styles.input}
    placeholder="Bio (Opcional)"
    value={UserBio}
    onChangeText={setUserBio}
  />

      // Picker para escolher o ano
<View style={styles.container}>
  <Text style={styles.label}>Selecione o Ano:</Text>
  <Picker
    selectedValue={selectedYear}
    onValueChange={handleYearSelection}
    style={styles.picker}
  >
    <Picker.Item label="Ano" value="" />
    {years.map((year, index) => (
      <Picker.Item key={index} label={year} value={year} />
    ))}
  </Picker>
</View>
      {/* Substituindo o Picker de País pelo dinâmico */}
      <Text>Selecione o País</Text>
      <Picker selectedValue={country} onValueChange={(itemValue) => setCountry(itemValue)} style={styles.picker}>
        <Picker.Item label="Selecione o País" value="" />
        <Picker.Item label="Portugal" value="Portugal" />
        {countries.map((country, index) => (
          <Picker.Item key={index} label={country.label} value={country.value} />
          
          
        ))}
      </Picker>
      
      <Text>Escolha seu gênero:</Text>
      <Picker selectedValue={gender} onValueChange={(itemValue) => setGender(itemValue)} style={styles.picker}>
        <Picker.Item label="Selecione o Gênero" value="" />
        <Picker.Item label="Masculino" value="male" />
        <Picker.Item label="Feminino" value="Female" />
        <Picker.Item label="Outro" value="other" />
      </Picker>

      <Text>Escolha suas preferências:</Text>
      <Picker selectedValue={preferences} onValueChange={(itemValue) => setPreferences(itemValue)} style={styles.picker}>
        <Picker.Item label="Selecione as Preferências" value="" />
        <Picker.Item label="Mulheres" value="women" />
        <Picker.Item label="Homens" value="men" />
        <Picker.Item label="Ambos" value="both" />
      </Picker>

      {/* Foto de Perfil */}
      <Text>Foto de Perfil</Text>
      <Button title="Selecionar Foto de Perfil" onPress={() => pickImage(true)} />
      {profileImageUri && <Image source={{ uri: profileImageUri }} style={styles.image} />}

      {/* Fotos Adicionais */}
      <Text>Fotos Adicionais (Máximo 3)</Text>
      <Button title="Selecionar Foto Adicional" onPress={() => pickImage(false)} />
      {additionalImagesUri.length > 0 && (
        <View style={styles.imageContainer}>
          {additionalImagesUri.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.image} />
          ))}
        </View>
      )}

      {/* Botão de envio */}
      <Button title={loading ? 'Carregando...' : 'Finalizar Registro'} onPress={handleNextStep} disabled={loading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 },
  picker: { height: 50, width: '100%', marginBottom: 20, fontSize: 16, backgroundColor: '#f4f4f4' },
  error: { color: 'red', marginBottom: 10 },
  image: { width: 100, height: 100, marginBottom: 10, borderRadius: 10 },
  imageContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
});

export default Registration;

