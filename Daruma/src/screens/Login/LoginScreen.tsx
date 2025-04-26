import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button } from 'react-native-paper';
import { RootStackParamList } from '../types';

// Define a tipagem para a navegação
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
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
      <View style={styles.overlay}>
        <Image
          source={{ uri: 'https://res.cloudinary.com/dped93q3y/image/upload/v1741812581/profile_pics/xwskrtysmko0rdxvgdup.png' }}
          style={styles.logo}
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('EmailLogin')}
            style={styles.button}
            labelStyle={styles.buttonText}
            rippleColor="rgba(173, 216, 230, 0.5)"
          >
            Login com Email
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Registration')}
            style={styles.button}
            labelStyle={styles.buttonText}
            rippleColor="rgba(173, 216, 230, 0.5)"
          >
            Registar
          </Button>
        </View>

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
    width: 350,
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
    marginVertical: 5,
    width: '90%',
    borderColor: '#fff',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
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