import * as Clipboard from 'expo-clipboard'; // no topo do arquivo, se usas Expo

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  Alert,
  Modal,
  Linking,
  Dimensions
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
} from 'react-native-paper';
import {
  signInWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { checkIfUserIsBanned } from '../checkIfUserIsBanned'; // Ajuste o caminho conforme necessário

const { width, height } = Dimensions.get('window');

const EmailLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isBannedModalVisible, setBannedModalVisible] = useState(false);
  const navigation = useNavigation();

  const handleEmailLogin = async () => {
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const isBanned = await checkIfUserIsBanned();

      if (isBanned) {
        setBannedModalVisible(true);
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'MatchScreen' }] });
      }
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

  const handleBannedModalClose = () => {
    setBannedModalVisible(false);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
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
          source={{
            uri: 'https://res.cloudinary.com/dped93q3y/image/upload/v1741812581/profile_pics/xwskrtysmko0rdxvgdup.png',
          }}
          style={styles.logo}
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          mode="flat"
          style={styles.input}
          theme={{
            colors: {
              primary: 'white',
              text: 'white',
              placeholder: 'white',
            },
          }}
          textColor="white"
        />

        <TextInput
          label="Palavra-passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="flat"
          style={styles.input}
          theme={{
            colors: {
              primary: 'white',
              text: 'white',
              placeholder: 'white',
            },
          }}
          textColor="white"
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

      <Modal
  transparent={true}
  animationType="slide"
  visible={isBannedModalVisible}
  onRequestClose={handleBannedModalClose}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Conta Banida</Text>
      <Text style={styles.modalMessage}>
        Sua conta foi banida. Para apelar ou reportar um erro, envie um e-mail com o ID abaixo.
      </Text>

      <Text style={styles.banIdText}>ID do Ban: {getAuth().currentUser?.uid}</Text>
      <Text style={styles.supportEmail}>📧 suporte@app.com</Text>

      <Button
        mode="outlined"
        textColor='white'
        onPress={() => {
          Clipboard.setStringAsync(getAuth().currentUser?.uid || '');
          Alert.alert('ID copiado', 'O ID do ban foi copiado para sua área de transferência.');
        }}
        style={styles.modalButtonOutline}
      >
        Copiar ID do Ban
      </Button>

      <Button
        mode="outlined"
        textColor='white'
        onPress={() => {
          const uid = getAuth().currentUser?.uid || '';
          const subject = encodeURIComponent('Apelo de Banimento');
          const body = encodeURIComponent(`Olá equipe de suporte,\n\nGostaria de apelar contra meu banimento.\n\nID do Ban: ${uid}\n\nMotivo do apelo:\n`);
          const emailUrl = `mailto:suporte@app.com?subject=${subject}&body=${body}`;
          Linking.openURL(emailUrl);
        }}
        style={styles.modalButtonOutline}
      >
        Enviar E-mail de Apelo
      </Button>

      <Button
        mode="contained"
        textColor='white'
        onPress={handleBannedModalClose}
        style={styles.modalButton}
      >
        Voltar para Login
      </Button>
    </View>
  </View>
</Modal>

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: height * 1.5, // A altura é ajustada dinamicamente
    width: width, // A largura é ajustada dinamicamente
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
    width: width * 0.6, // A largura da logo é 60% da largura da tela
    height: width * 0.6, // A altura da logo é 60% da largura da tela
    marginBottom: 30,
    resizeMode: 'contain',
  },
  input: {
    width: width * 0.9, // A largura dos inputs é 90% da largura da tela
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  button: {
    marginVertical: 10,
    width: width * 0.9, // A largura do botão é 90% da largura da tela
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8, // A largura da modal é 80% da largura da tela
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  banIdText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'black',
    textAlign: 'center',
  },
  supportEmail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonOutline: {
    borderColor: '#ADD8E6', // Azul bebê (Light Blue) como a cor da borda
    borderWidth: 1,
    marginBottom: 10,
    width: '80%', // Largura do botão na modal
    borderRadius: 20,
    backgroundColor: '#ADD8E6', // Cor de fundo azul bebê
  },
  
  modalButton: {
    borderRadius: 20,
    backgroundColor: '#ADD8E6', // Azul bebê para o fundo
    borderColor: '#ADD8E6', // Azul bebê na borda
    borderWidth: 1,
  },

  // Agora, vamos adicionar a cor branca ao texto do botão:
  modalButtonText: {
    color: '#FFFFFF', // Cor branca para o texto
    fontSize: 16, // Ajuste o tamanho da fonte se necessário
    fontWeight: 'bold', // Pode adicionar negrito se necessário
  },
});

export default EmailLogin;
