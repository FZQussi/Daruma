import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, Image, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { signInWithEmailAndPassword, getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const EmailLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation();

  const handleEmailLogin = async () => {
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.reset({ index: 0, routes: [{ name: 'MatchScreen' }] });
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const handlePasswordReset = async () => {
    const auth = getAuth();
    if (!email) {
      Alert.alert('Erro', 'Por favor, insira o seu email.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', 'Verifique sua caixa de entrada para redefinir sua senha.');
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://res.cloudinary.com/dped93q3y/image/upload/v1741791078/profile_pics/yhahsqll16casizjoaqi.jpg' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Image
          source={{ uri: 'https://res.cloudinary.com/dped93q3y/image/upload/v1741812581/profile_pics/xwskrtysmko0rdxvgdup.png' }}
          style={styles.logo}
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          mode="flat"
          style={styles.input}
          theme={{ colors: { primary: 'white', text: 'white', placeholder: 'white' } }}
          textColor='white'
        />

        <TextInput
          label="Palavra-passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="flat"
          style={styles.input}
          theme={{ colors: { primary: 'white', text: 'white', placeholder: 'white' } }}
          textColor='white'
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Button
          mode="outlined"
          onPress={handleEmailLogin}
          style={styles.button}
          labelStyle={styles.buttonText}
          rippleColor="rgba(173, 216, 230, 0.5)"
        >
          Entrar
        </Button>

        <Text style={styles.forgotPassword} onPress={handlePasswordReset}>
          Esqueci-me da minha palavra-passe
        </Text>
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
    width: 300,
    height: 300,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  input: {
    width: '90%',
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  button: {
    marginVertical: 10,
    width: '90%',
    borderColor: '#fff',
    borderWidth: 2,
    backgroundColor: 'transparent',
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  forgotPassword: {
    color: 'white',
    marginTop: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default EmailLogin;
