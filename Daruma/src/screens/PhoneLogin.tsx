// PhoneLogin.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { getAuth, signInWithPhoneNumber } from 'firebase/auth';

const PhoneLogin: React.FC<any> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePhoneLogin = async () => {
    const auth = getAuth();
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber);
      // Pode ser necessário implementar a verificação de código SMS aqui
      alert('Código SMS enviado!');
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login com Telemóvel</Text>
      <TextInput
        style={styles.input}
        placeholder="Número de Telemóvel (+351...)"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <Button title="Enviar Código" onPress={handlePhoneLogin} />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 },
  error: { color: 'red', marginTop: 10 },
});

export default PhoneLogin;
