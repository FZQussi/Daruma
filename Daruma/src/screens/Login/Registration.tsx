
import React, { useState, useEffect, useRef } from 'react';
import { View,StyleSheet, ScrollView, Image, Alert, ImageBackground, Animated, TouchableOpacity,Dimensions,  Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import uploadToCloudinary from '../uploadToCloudinary'; // Função para enviar imagens ao Cloudinary
import { useRegistration } from '../../context/RegistrationContext';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Location from 'expo-location';  
import { TextInput, Button, Text } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';




const Registration: React.FC<any> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const { userData, setUserData } = useRegistration();
  const db = getFirestore(app);
  // Estados do formulário
  const [email, setEmail] = useState(userData.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState(userData.firstName || '');
  const [lastName, setLastName] = useState(userData.lastName || '');
  const [UserBio, setUserBio] = useState(userData.UserBio || '');
  const [country, setCountry] = useState(userData.country || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => (currentYear - i).toString());
  const minimumYear = currentYear - 18;
  const [showAlert, setShowAlert] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { width, height } = Dimensions.get('window');
  const [modalVisible, setModalVisible] = useState(false);
  // Animated value for border color
  const animatedBorder = useRef(new Animated.Value(0)).current;

  const handleFocus = (inputName: string) => {
    setFocusedInput(inputName); // Quando o campo recebe o foco, atualiza o estado
  };
  
  const handleBlur = () => {
    setFocusedInput(null); // Remove o foco quando o campo perde o foco
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

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await require('./countries.json');
        setCountries(response); // Definir o estado com os países carregados
      } catch (error) {
        console.error("Erro ao carregar os países:", error);
      }
    };

    loadCountries();
  }, []);

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


useEffect(() => {
  fetchLocation();
  getDeviceInfo();
}, []);  // Esse useEffect será executado uma vez, quando o componente for montado


  // Função para criar o usuário no Firebase Authentication
  const handleUserRegistration = async () => {
    let user: User | null = null; // <-- variável para guardar o user, para poder deletar se der erro
  
    try {
      if (!profileImageUri) {
        Alert.alert('Erro', 'Você precisa carregar uma foto de perfil!');
        return;
      }
  
      setLoading(true);
  
      // Primeiro: Upload de imagens
      const profilePictureUrl = await uploadToCloudinary(profileImageUri);
      const additionalPicturesUrls = await Promise.all(additionalImagesUri.map(uploadToCloudinary));
  
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user; // <-- guardamos aqui
      const userId = user?.uid;
  
      if (!userId) {
        Alert.alert('Erro', 'Usuário não autenticado corretamente!');
        setLoading(false);
        return;
      }
  
      // Agora cria no Firestore
      await setDoc(doc(db, 'users', userId), {
        // seus campos...
        firstName,
        lastName,
        gender,
        birthDate: selectedYear,
        arealocation: '',
        country,
        accountType: 'Free',
        status: 'offline',
        verification: 'unverified',
        preferences,
        likedUsers: [],
        dislikedUsers: [],
        profilePicture: profilePictureUrl,
        additionalPictures: additionalPicturesUrls,
        UserBio,
        workplace: '',
        workposition: '',
        educationschool: '',
        educationarea: '',
        moodstate: '',
        heigth: 0,
        children: '',
        alchool: '',
        knownlanguages: '',
        relationshipstatus: '',
        sexualaty: '',
        smoking: '',
        zoodiacsign: '',
        pets: '',
        religion: '',
        personalaty: '',
        educationtier: '',
        Question1: '',
        Question2: '',
        Question3: '',
        awnser1: '',
        awnser2: '',
        awnser3: '',
        interests: [],
        kink1: '',
        kink2: '',
        kink3: '',
      });
  
      await setDoc(doc(db, 'users', userId, 'private', 'data'), {
        email,
        country,
        location,
        device: deviceInfo,
        DeviceId,
        verification: 'unverified',
        status: 'offline',
        appVersion: Application.nativeApplicationVersion,
        createdAt: new Date(),
      });
  
      setLoading(false);
  
      navigation.reset({
        index: 0,
        routes: [{ name: 'ChatQueue' }],
      });
  
    } catch (error: any) {
      console.error('Erro no registo:', error);
  
      // Se já criou o user no Authentication, apaga ele
      if (user) {
        try {
          await user.delete();
          console.log('Usuário deletado após erro.');
        } catch (deleteError) {
          console.error('Erro ao deletar usuário:', deleteError);
        }
      }
  
      setLoading(false);
      Alert.alert('Erro', error.message || 'Não foi possível completar o registro.');
    }
  };
  
  


  const handleNextStep = () => {
    if (emailExists) {
      setErrorMessage('Este email já está em uso.');
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
  
    handleUserRegistration();
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

  const handleCountrySelection = (value) => {
    setCountry(value);
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
        <Text style={styles.header}>Registo de Urilizador</Text>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
{/* Animated Inputs */}
{[
  { placeholder: "Email", value: email, onChangeText: setEmail, name: "email" },
  { placeholder: "Palavra-Passe", value: password, onChangeText: setPassword, name: "password", secureTextEntry: true },
  { placeholder: "Confirmar Palavra-Passe", value: confirmPassword, onChangeText: setConfirmPassword, name: "confirmPassword", secureTextEntry: true },
  { placeholder: "Nome", value: firstName, onChangeText: setFirstName, name: "firstName" },
  { placeholder: "Apelido", value: lastName, onChangeText: setLastName, name: "lastName" },
  { placeholder: "Bio (Opcional)", value: UserBio, onChangeText: setUserBio, name: "bio" }
].map((field, index) => (
  <Animated.View
    key={index}
    style={[
      styles.inputContainer,
      focusedInput === field.name && { borderBottomColor: 'black' }, // Linha preta ao focar
    ]}
    
  >
    <TextInput
      style={styles.input}
      placeholder={field.placeholder}
      value={field.value}
      onChangeText={field.onChangeText}
      secureTextEntry={field.secureTextEntry}
      onFocus={() => handleFocus(field.name)} 
      onBlur={handleBlur} 
      // Impede o foco padrão de alterar a borda
      autoCorrect={false}
      autoCapitalize="none"
      keyboardType="default"
      placeholderTextColor="#777" // Cor do texto do placeholder
      selectionColor= "black"
      activeUnderlineColor="black"
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
        selectedValue={setCountry} 
        onValueChange={handleCountrySelection} 
        style={styles.picker}
        onFocus={() => handleFocusPicker('country')} 
        onBlur={handleBlurPicker}
      >
        <Picker.Item label="Selecione um país" value="" />
        {countries.map((country, index) => (
          <Picker.Item key={index} label={country.name} value={country.name} />
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
              <Picker.Item label="Masculino" value="Male" />
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
              <Picker.Item label="Mulheres" value="Female" />
              <Picker.Item label="Homens" value="Male" />
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
      <Svg viewBox="0 0 24 24" fill="none" width={70} height={70}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.75 6.5C6.75 3.6005 9.1005 1.25 12 1.25C14.8995 1.25 17.25 3.6005 17.25 6.5C17.25 9.3995 14.8995 11.75 12 11.75C9.1005 11.75 6.75 9.3995 6.75 6.5Z"
      fill="#000000"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.25 18.5714C4.25 15.6325 6.63249 13.25 9.57143 13.25H14.4286C17.3675 13.25 19.75 15.6325 19.75 18.5714C19.75 20.8792 17.8792 22.75 15.5714 22.75H8.42857C6.12081 22.75 4.25 20.8792 4.25 18.5714Z"
      fill="#000000"
    />
  </Svg>
      
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
          <Text style={styles.placeholderText}>➕</Text> 
           {/* Emoji de adição */}
        </View>
      )}
    </TouchableOpacity>
  ))}
</View>
<Button rippleColor={"#ADD8E6"} buttonColor='#ADD8E6' mode="contained" onPress={handleNextStep}>
<Text style={styles.buttonText}>
    {loading ? 'Carregando...' : 'Finalizar Registro'}
  </Text>
  </Button>
  </View>

        {/* Botão de envio */}
       </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'blue',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fieldinfo: {
    textAlign: 'center',
    alignContent: 'center',
    fontWeight: 'bold',
    fontSize: 18,
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
    alignSelf: 'center',
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
    width: 100,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center',
    marginTop: 50,
  },
  inputContainer: {
    backgroundColor: 'transparent',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  input: {
    height: 50,
    fontSize: 16,
    color: '#333',
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'transparent',
  },
  
  picker: {
    ...Platform.select({
      ios: {
        height: 150,
        width: '100%',
        
        fontSize: 16,
        borderRadius: 10,
      },
      android: {
        height: 50,
        width: '100%',
        marginBottom: 1,
        fontSize: 16,
        borderRadius: 10,
      },
    }),
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
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
    flexWrap: 'nowrap',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
});



export default Registration;