import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

// Define a tipagem para a navegação
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // Função para abrir os Termos e Condições
  const handleTermsAndConditionsPress = () => {
    Linking.openURL('https://www.seusite.com/termos-e-condicoes'); // Substitua pelo link real
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://res.cloudinary.com/dped93q3y/image/upload/v1741791078/profile_pics/yhahsqll16casizjoaqi.jpg',
      }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Overlay for better contrast */}
      <View style={styles.overlay}>
        {/* Imagem no lugar do texto */}
        <Image
          source={{ uri: 'https://res.cloudinary.com/dped93q3y/image/upload/v1741812581/profile_pics/xwskrtysmko0rdxvgdup.png' }} // Substitua pelo link da sua imagem
          style={styles.logo}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('EmailLogin')}
          >
            <Text style={styles.buttonText}>Login com Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.marginTop]}
            onPress={() => navigation.navigate('Registration')}
          >
            <Text style={styles.buttonText}>Registar</Text>
          </TouchableOpacity>
        </View>

        {/* Texto de Termos e Condições */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Ao continuar, você concorda com nossos{' '}
            <Text style={styles.link} onPress={handleTermsAndConditionsPress}>
              Termos e Condições
            </Text>.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

// Estilos
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  logo: {
    width: 350, // Ajuste o tamanho conforme necessário
    height: 350,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 3,
    borderRadius: 30,
    paddingVertical: 15,
    marginBottom: 5,
    width: '100%',
    alignItems: 'center',
  },
  marginTop: {
    marginTop: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  termsText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  link: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;

