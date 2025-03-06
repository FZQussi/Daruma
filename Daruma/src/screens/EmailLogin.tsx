import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword, getAuth, sendPasswordResetEmail } from 'firebase/auth';
import Animated, { Easing, useSharedValue, withSpring, withDelay } from 'react-native-reanimated';

const EmailLogin: React.FC<any> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Animação para o botão
  const scale = useSharedValue(1);

  const handleEmailLogin = async () => {
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navega para a Home e limpa o histórico de navegação
      navigation.reset({
        index: 0,  // Define a tela inicial como "Home"
        routes: [{ name: 'MatchScreen' }],  // Define "Home" como a única tela no stack
      });
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  // Função para lidar com a recuperação de senha
  const handlePasswordReset = async () => {
    const auth = getAuth();
    if (!email) {
      Alert.alert('Erro', 'Por favor, insira o seu email.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', 'Verifique a sua caixa de entrada para redefinir a sua palavra-passe.');
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  // Função para animar o botão
  const animateButton = () => {
    scale.value = withSpring(1.1, { damping: 2, stiffness: 100 }); // Enfraquece o botão

    // Após a animação, volta ao estado original
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 2, stiffness: 100 });
    }, 100);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login com Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Palavra-passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Botão com animação */}
      <Animated.View style={{ transform: [{ scale: scale.value }] }}>
        <TouchableOpacity onPress={() => { handleEmailLogin(); animateButton(); }}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Entrar</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      
      <Text style={styles.forgotPassword} onPress={handlePasswordReset}>
        Esqueci-me da minha palavra-passe
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 },
  error: { color: 'red', marginTop: 10 },
  forgotPassword: { color: 'blue', marginTop: 15, textAlign: 'center' },
  button: {
    backgroundColor: '#4CAF50', // Cor de fundo do botão
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmailLogin;
  