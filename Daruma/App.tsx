import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { app } from './firebaseConfig';
import ChatScreen from './ChatScreen';
import ChatQueue from './ChatQueue';
import LoginScreen from './LoginScreen';  // Nova tela de login principal
import EmailLogin from './EmailLogin';    // Tela de login com email
import PhoneLogin from './PhoneLogin';    // Tela de login com telemóvel
import RegistrationStep1 from './RegistrationStep1'; // Tela de registo passo 1
import RegistrationStep2 from './RegistrationStep2';
import RegistrationStep3 from './RegistrationStep3'; 
import ProfileScreen from './ProfileScreen';


// Tela principal após o login
const HomeScreen = ({ navigation }: any) => {
  const auth = getAuth(app);

  // Função para logout
  const handleLogout = async () => {
    await signOut(auth);
    navigation.navigate('Login'); // Voltar à página de login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bem-vindo à App!</Text>
      <Button title="Perfil" onPress={ProfileScreen} />
      <Button title="Emparelhamento Aleatório" onPress={() => navigation.navigate('ChatQueue')} />
      <Button title="Logout" onPress={handleLogout} />

    </View>
  );
};

// Configuração da stack de navegação
const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="EmailLogin" component={EmailLogin} />
        <Stack.Screen name="PhoneLogin" component={PhoneLogin} />
        <Stack.Screen name="RegistrationStep1" component={RegistrationStep1} />
        <Stack.Screen name="RegistrationStep2" component={RegistrationStep2} />
        <Stack.Screen name="RegistrationStep3" component={RegistrationStep3} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="ChatQueue" component={ChatQueue} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    flex:1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default App;
