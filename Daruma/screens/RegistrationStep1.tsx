import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRegistration } from '../context/RegistrationContext';

const RegistrationStep1: React.FC<any> = ({ navigation }) => {
  const { userData, setUserData } = useRegistration();
  const [email, setEmail] = useState(userData.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState(userData.firstName || '');
  const [lastName, setLastName] = useState(userData.lastName || '');
  const [phone, setPhone] = useState(userData.phone || '');
  const [username, setUsername] = useState(userData.username || '');
  const [country, setCountry] = useState(userData.country || '');
  const [errorMessage, setErrorMessage] = useState('');

  const handleNextStep = () => {
    if (password !== confirmPassword) {
      setErrorMessage('A confirmação da senha não corresponde.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setUserData({ ...userData, email, password, firstName, lastName, phone, username, country });
    navigation.navigate('RegistrationStep2');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Registo de Usuário</Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirmar Senha" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Nome" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Sobrenome" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Número de Telemóvel" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Nome de Usuário" value={username} onChangeText={setUsername} />

      <Picker selectedValue={country} onValueChange={(itemValue) => setCountry(itemValue)} style={styles.picker}>
        <Picker.Item label="Selecione o País" value="" />
        <Picker.Item label="Brasil" value="BR" />
        <Picker.Item label="Portugal" value="PT" />
        <Picker.Item label="Estados Unidos" value="US" />
      </Picker>

      <Button title="Próximo" onPress={handleNextStep} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 },
  picker: { height: 40, marginBottom: 20 },
  error: { color: 'red', marginBottom: 10 },
});

export default RegistrationStep1;
