import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import { PaperProvider, Button } from 'react-native-paper';
import { View, Text, StyleSheet, Alert } from 'react-native';
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
import LikeScreen from './src/screens/LikeScreen';
import ProfilePlan from './src/screens/ProfilePlan';

// Definição dos tipos das rotas
export type RootStackParamList = {
  Login: undefined;
  EmailLogin: undefined;
  PhoneLogin: undefined;
  Registration: undefined;
  Home: undefined;
  ChatScreen: undefined;
  ChatQueue: undefined;
  Profile: undefined;
  Encounters: undefined;
  Likes: undefined;
  MatchScreen: undefined;
  MatchChats: { matchId: string };
  MatchList: undefined;
  MatchProfile: { userId: string };
  EditProfile: undefined;
  ProfileScreen: undefined;
  LikeScreen: undefined;
  ProfilePlan: undefined;
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
      <Button mode="contained" onPress={() => navigation.navigate('Profile')}>Perfil</Button>
      <Button mode="contained" onPress={() => navigation.navigate('ChatQueue')}>Emparelhamento Aleatório</Button>
      <Button mode="contained" onPress={handleLogout}>Logout</Button>
      <Button mode="contained" onPress={() => navigation.navigate('MatchList')}>Ir para os Matches</Button>
      <BottomNavBar />
    </View>
  );
};

type BottomNavBarNavigationProp = NativeStackNavigationProp<RootStackParamList>;
const BottomNavBar = () => {
  const navigation = useNavigation<BottomNavBarNavigationProp>();

  return (
    <View style={styles.navBar}>
      <Button mode="text" onPress={() => navigation.navigate('MatchChats', { matchId: 'exemploMatchId' })}>Conversas</Button>
      <Button mode="text" onPress={() => navigation.navigate('MatchScreen')}>Match</Button>
      <Button mode="text" onPress={() => navigation.navigate('ChatQueue')}>RandChat</Button>
      <Button mode="text" onPress={() => navigation.navigate('LikeScreen')}>Gostos</Button>
      <Button mode="text" onPress={() => navigation.navigate('Profile')}>Perfil</Button>
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

    return () => unsubscribe();
  }, []);

  return (
    <PaperProvider> {/* Envolvendo todo o app com PaperProvider */}
      <RegistrationProvider> 
        <NavigationContainer>
          <Stack.Navigator initialRouteName={user ? "Home" : "Login"} screenOptions={{ headerShown: false, animation: 'none' }}>
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
            <Stack.Screen name="LikeScreen" component={LikeScreen} />
            <Stack.Screen name="ProfilePlan" component={ProfilePlan} />
          </Stack.Navigator>  
        </NavigationContainer>
      </RegistrationProvider>
    </PaperProvider> 
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
