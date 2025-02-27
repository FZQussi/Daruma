// src/screens/RegistrationStep1.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from './firebaseConfig'; // Configuração do Firebase

const RegistrationStep1: React.FC<any> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState(''); // País
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth(app);
  const db = getFirestore(app); // Acesso ao Firestore

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setErrorMessage('A confirmação da senha não corresponde à senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      // Registar o utilizador com email e senha
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Agora, vamos salvar os dados adicionais no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        phone: phone,
        firstName: firstName,
        lastName: lastName,
        username: username,
        country: country,
        createdAt: new Date(),
      });

      // Navegar para a próxima tela (Step2)
      navigation.navigate('RegistrationStep2');

    } catch (error: any) {
      setLoading(false);
      setErrorMessage(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Registo de Usuário</Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Sobrenome"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Número de Telemóvel"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Nome de Usuário"
        value={username}
        onChangeText={setUsername}
      />

      {/* Selecione o país */}
      <Picker
        selectedValue={country}
        onValueChange={(itemValue) => setCountry(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Selecione o País" value="" />
        <Picker.Item label="Brasil" value="BR" />
        <Picker.Item label="Portugal" value="PT" />
        <Picker.Item label="Estados Unidos" value="US" />
        {/* Adicione mais opções conforme necessário */}
      </Picker>

      <Button title={loading ? "Aguarde..." : "Registar"} onPress={handleRegister} disabled={loading} />
    </View>
  );
};

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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  picker: {
    height: 40,
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default RegistrationStep1;
