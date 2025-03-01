// src/screens/RegistrationStep2.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRegistration } from '../context/RegistrationContext';

const RegistrationStep2: React.FC<any> = ({ navigation }) => {
  const { userData, setUserData } = useRegistration();
  const [gender, setGender] = useState(userData.gender || '');
  const [preferences, setPreferences] = useState(userData.preferences || '');

  useEffect(() => {
    // Atualizar os dados no contexto caso haja alteração
    setUserData({ ...userData, gender, preferences });
  }, [gender, preferences, setUserData, userData]);

  const handleNextStep = () => {
    navigation.navigate('RegistrationStep3');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Etapa 2: Preferências</Text>

      <Text>Escolha seu gênero:</Text>
      <Picker
        selectedValue={gender}
        onValueChange={(itemValue) => setGender(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Selecione o Gênero" value="" />
        <Picker.Item label="Masculino" value="male" />
        <Picker.Item label="Feminino" value="female" />
        <Picker.Item label="Outro" value="other" />
      </Picker>

      <Text>Escolha suas preferências:</Text>
      <Picker
        selectedValue={preferences}
        onValueChange={(itemValue) => setPreferences(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Selecione as Preferências" value="" />
        <Picker.Item label="Mulheres" value="women" />
        <Picker.Item label="Homens" value="men" />
        <Picker.Item label="Ambos" value="both" />
      </Picker>

      <Button title="Próximo" onPress={handleNextStep} />
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
  picker: {
    height: 40,
    marginBottom: 20,
  },
});

export default RegistrationStep2;

