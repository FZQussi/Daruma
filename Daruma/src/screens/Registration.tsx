import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Image, Alert, ImageBackground, Animated, TouchableOpacity } from 'react-native';
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
  const [focusedInput, setFocusedInput] = useState(null);
  
  // Animated value for border color
  const animatedBorder = useRef(new Animated.Value(0)).current;

  const handleFocus = (inputName) => {
    setFocusedInput(inputName);
    Animated.timing(animatedBorder, {
      toValue: 1, // Darker border when focused
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocusedInput(null);
    Animated.timing(animatedBorder, {
      toValue: 0, // Lighter border when blurred
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Interpolating the border color based on animation state
  const borderColorInterpolation = animatedBorder.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ccc', '#333'], // Light gray to dark gray
  });
  

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
  const [focusedPicker, setFocusedPicker] = useState(null);

  const handleFocusPicker = (pickerName) => {
    setFocusedPicker(pickerName);
    Animated.timing(animatedBorder, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlurPicker = () => {
    setFocusedPicker(null);
    Animated.timing(animatedBorder, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
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
    <ImageBackground 
      source={{ uri: 'https://res.cloudinary.com/dped93q3y/image/upload/v1741791078/profile_pics/yhahsqll16casizjoaqi.jpg' }} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>

        {/* Card Container */}
        <View style={styles.cardContainer}>
        <Text style={styles.header}>Registro de Usuário</Text>

{errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          {/* Animated Inputs */}
          {[
            { placeholder: "Email", value: email, onChangeText: setEmail, name: "email" },
            { placeholder: "Senha", value: password, onChangeText: setPassword, name: "password", secureTextEntry: true },
            { placeholder: "Confirmar Senha", value: confirmPassword, onChangeText: setConfirmPassword, name: "confirmPassword", secureTextEntry: true },
            { placeholder: "Nome", value: firstName, onChangeText: setFirstName, name: "firstName" },
            { placeholder: "Sobrenome", value: lastName, onChangeText: setLastName, name: "lastName" },
            { placeholder: "Nome de Usuário", value: username, onChangeText: setUsername, name: "username" },
            { placeholder: "Bio (Opcional)", value: UserBio, onChangeText: setUserBio, name: "bio" }
          ].map((field, index) => (
            <Animated.View key={index} style={[styles.inputContainer, focusedInput === field.name && { borderBottomColor: borderColorInterpolation }]}>
              <TextInput 
                style={styles.input} 
                placeholder={field.placeholder} 
                value={field.value} 
                onChangeText={field.onChangeText} 
                secureTextEntry={field.secureTextEntry}
                onFocus={() => handleFocus(field.name)} 
                onBlur={handleBlur} 
              />
            </Animated.View>
          ))}

          {/* Animated Picker (Ano) */}
          
          <Animated.View style={[styles.inputContainer, focusedPicker === 'year' && { borderBottomColor: borderColorInterpolation }]}>
            <Picker 
              selectedValue={selectedYear} 
              onValueChange={handleYearSelection} 
              style={styles.picker}
              onFocus={() => handleFocusPicker('year')} 
              onBlur={handleBlurPicker}
            >
              <Picker.Item label="Ano" value="" />
              {years.map((year, index) => (
                <Picker.Item key={index} label={year} value={year} />
              ))}
            </Picker>
          </Animated.View>

          {/* Animated Picker (País) */}
          
          <Animated.View style={[styles.inputContainer, focusedPicker === 'country' && { borderBottomColor: borderColorInterpolation }]}>
            <Picker 
              selectedValue={country} 
              onValueChange={(itemValue) => setCountry(itemValue)} 
              style={styles.picker}
              onFocus={() => handleFocusPicker('country')} 
              onBlur={handleBlurPicker}
            >
              <Picker.Item label="Selecione o País" value="" />
              <Picker.Item label="Portugal" value="Portugal" />
              {countries.map((country, index) => (
                <Picker.Item key={index} label={country.label} value={country.value} />
              ))}
            </Picker>
          </Animated.View>

          {/* Animated Picker (Gênero) */}
         
          <Animated.View style={[styles.inputContainer, focusedPicker === 'gender' && { borderBottomColor: borderColorInterpolation }]}>
            <Picker 
              selectedValue={gender} 
              onValueChange={(itemValue) => setGender(itemValue)} 
              style={styles.picker}
              onFocus={() => handleFocusPicker('gender')} 
              onBlur={handleBlurPicker}
            >
              <Picker.Item label="Selecione o Gênero" value="" />
              <Picker.Item label="Masculino" value="male" />
              <Picker.Item label="Feminino" value="Female" />
              <Picker.Item label="Outro" value="other" />
            </Picker>
          </Animated.View>

          {/* Animated Picker (Preferências) */}
          <Animated.View style={[styles.inputContainer, focusedPicker === 'preferences' && { borderBottomColor: borderColorInterpolation }]}>
            <Picker 
              selectedValue={preferences} 
              onValueChange={(itemValue) => setPreferences(itemValue)} 
              style={styles.picker}
              onFocus={() => handleFocusPicker('preferences')} 
              onBlur={handleBlurPicker}
            >
              <Picker.Item label="Selecione as Preferências" value="" />
              <Picker.Item label="Mulheres" value="women" />
              <Picker.Item label="Homens" value="men" />
              <Picker.Item label="Ambos" value="both" />
            </Picker>
          </Animated.View>

          <Text style={styles.fieldinfo}>Foto de Perfil</Text>
          {/* Foto de Perfil */}
          <TouchableOpacity
  style={styles.profileImageContainer}
  onPress={() => pickImage(true)}
>
  {profileImageUri ? (
    <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
  ) : (
    <View style={styles.profilePlaceholder}>
      <Text style={styles.placeholderText}>📷</Text> {/* Emoji de câmera */}
    </View>
  )}
</TouchableOpacity>

<Text style={styles.fieldinfo}>Fotos Adicionais (Máximo 3)</Text>
<View style={styles.imageContainer}>
  {/* Renderiza as 3 caixas */}
  {[...Array(3)].map((_, index) => (
    <TouchableOpacity
      key={index}
      style={styles.additionalImageContainer}
      onPress={() => pickImage(false, index)} // Passando o índice para saber qual caixa foi clicada
    >
      {additionalImagesUri[index] ? (
        // Se a imagem já foi adicionada, exibe a imagem
        <Image source={{ uri: additionalImagesUri[index] }} style={styles.additionalImage} />
      ) : (
        // Caso contrário, exibe o emoji de adição
        <View style={styles.additionalImagePlaceholder}>
          <Text style={styles.placeholderText}>➕</Text>  {/* Emoji de adição */}
        </View>
      )}
    </TouchableOpacity>
  ))}
</View>
<TouchableOpacity 
  style={[styles.button, loading && styles.buttonDisabled]} 
  onPress={handleNextStep} 
  disabled={loading}
>
  <Text style={styles.buttonText}>
    {loading ? 'Carregando...' : 'Finalizar Registro'}
  </Text>
</TouchableOpacity>    </View>

        {/* Botão de envio */}
       </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,          // This creates rounded corners
    borderWidth: 1,            // Thin border
    borderColor: 'blue',       // Blue color for the border
    backgroundColor: 'white',  // White background
    paddingVertical: 10,       // Vertical padding for the button
    paddingHorizontal: 20,     // Horizontal padding for the button
    alignItems: 'center',      // Centering the text horizontally
    justifyContent: 'center',  // Centering the text vertically
  },
  buttonDisabled: {
    backgroundColor: '#f0f0f0', // Lighter background color when disabled
    borderColor: '#ccc',         // Lighter border color when disabled
  },
  buttonText: {
    color: 'blue',             // Blue text color
    fontSize: 16,              // Font size for the button text
    fontWeight: 'bold',        // Bold text
  },
  fieldinfo: {
    textAlign: 'center',
    alignContent: 'center',   // Aligns content to the center
    fontWeight: 'bold',       // Makes text bold
    fontSize: 18,             // Sets the font size to 12
},
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    alignSelf: 'center',  // Centraliza a imagem de perfil
  },

  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },

  profilePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },

  placeholderText: {
    fontSize: 40,
    color: '#555',
  },

  additionalImageContainer: {
    width: 100,  // Definido para garantir o tamanho das imagens
    height: 100,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },

  additionalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },

  additionalImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },

  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },

  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'flex-start',  // Alinhar conteúdo no topo
    alignItems: 'flex-start',  // Alinhar conteúdo à esquerda
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },

  cardContainer: {
    width: '95%',  // Largura aumentada do container
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center',
    marginTop: 50,
  },

  inputContainer: {
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    marginBottom: 15,
  },

  input: {
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },

  picker: {
    height: 50,
    width: '100%',
    marginBottom: 1,
    fontSize: 16,
    borderRadius: 10,
  },

  error: {
    color: 'red',
    marginBottom: 10,
  },

  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 10,
  },

  imageContainer: {
    flexDirection: 'row',  // Garantir que as imagens fiquem na linha
    justifyContent: 'flex-start',  // Alinhar à esquerda
    marginBottom: 10,
    flexWrap: 'nowrap',  // Impede que as imagens vão para a próxima linha
  },

  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
});



export default Registration;

