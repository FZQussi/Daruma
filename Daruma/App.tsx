import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';

import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { app } from './src/screens/firebaseConfig';  // Importa a configuração do Firebase

import ChatScreen from './src/screens/ChatScreen';
import ChatQueue from './src/screens/ChatQueue';
import LoginScreen from './src/screens/LoginScreen';  
import EmailLogin from './src/screens/EmailLogin';    
import PhoneLogin from './src/screens/PhoneLogin';    
import ProfileScreen from './src/screens/ProfileScreen';
import MatchScreen from './src/screens/MatchScreen';
import MatchChat from './src/screens/MatchChat';
import { useNavigation } from '@react-navigation/native';
import MatchListScreen from './src/screens/MatchListScreen';
import { RegistrationProvider } from './src/context/RegistrationContext';
import Registration from './src/screens/Registration'; 
import Profile from './src/screens/Profile';
import EditProfile from './src/screens/EditProfile';

// Definição dos tipos das rotas
export type RootStackParamList = {
  Login: undefined;
  EmailLogin: undefined;
  PhoneLogin: undefined;
  RegistrationStep1: undefined;
  RegistrationStep2: undefined;
  RegistrationStep3: undefined;
  Registration: undefined;
  Home: undefined;
  ChatScreen: undefined;
  ChatQueue: undefined;
  Profile: undefined;
  Encounters: undefined;
  Likes: undefined;
  MatchScreen: undefined;
  MatchChats: { matchId: string };
  MatchList: undefined; // Verifique se esta chave existe aqui
  MatchProfile: { userId: string };
  EditProfile: undefined;
  ProfileScreen: undefined;
};


const Stack = createNativeStackNavigator<RootStackParamList>();

const ConversationsScreen = () => (
  <View style={styles.container}>
    <Text>Conversas</Text>
  </View>
);

const EncountersScreen = () => (
  <View style={styles.container}>
    <Text>Encontros</Text>
  </View>
);

const LikesScreen = () => (
  <View style={styles.container}>
    <Text>Gostos</Text>
  </View>
);

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
  const auth = getAuth(app);
  
  const handleLogout = async () => {
    Alert.alert(
      'Confirmar Logout',
      'Você tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: async () => {
            await signOut(auth);
            navigation.navigate('Login');
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bem-vindo à App!</Text>
      <Button title="Perfil" onPress={() => navigation.navigate('Profile')} />
      <Button title="Emparelhamento Aleatório" onPress={() => navigation.navigate('ChatQueue')} />
      <Button title="Logout" onPress={handleLogout} />
      <Button title="Ir para os Matches" onPress={() => navigation.navigate('MatchList')} />
      <BottomNavBar />
    </View>
  );
};

type BottomNavBarNavigationProp = NativeStackNavigationProp<RootStackParamList>;
const BottomNavBar = () => {
  const navigation = useNavigation<BottomNavBarNavigationProp>();

  return (
    <View style={styles.navBar}>
      <Button title="Conversas" onPress={() => navigation.navigate('MatchChats', { matchId: 'exemploMatchId' })} />
      <Button title="Match" onPress={() => navigation.navigate('MatchScreen')} />
      <Button title="RandChat" onPress={() => navigation.navigate('ChatQueue')} />
      <Button title="Gostos" onPress={() => navigation.navigate('Likes')} />
      <Button title="Perfil" onPress={() => navigation.navigate('Profile')} />
    </View>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);  // Atualiza o estado de usuário com a autenticação do Firebase
    });

    // Limpa o listener quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  return (
    <RegistrationProvider> 
      <NavigationContainer>
        <Stack.Navigator initialRouteName={user ? "Home" : "Login"} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="EmailLogin" component={EmailLogin} />
          <Stack.Screen name="PhoneLogin" component={PhoneLogin} />
          <Stack.Screen name="Registration" component={Registration} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="ChatQueue" component={ChatQueue} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Encounters" component={EncountersScreen} />
          <Stack.Screen name="Likes" component={LikesScreen} />
          <Stack.Screen name="MatchScreen" component={MatchScreen} />
          <Stack.Screen name="MatchChats" component={MatchChat} />
          <Stack.Screen name="MatchList" component={MatchListScreen} />
          <Stack.Screen name="MatchProfile" component={Profile} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
        </Stack.Navigator>  
      </NavigationContainer>
    </RegistrationProvider> 
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
});

export default App;
