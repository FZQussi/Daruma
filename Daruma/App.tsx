import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { app } from './screens/firebaseConfig';
import ChatScreen from './screens/ChatScreen';
import ChatQueue from './screens/ChatQueue';
import LoginScreen from './screens/LoginScreen';  
import EmailLogin from './screens/EmailLogin';    
import PhoneLogin from './screens/PhoneLogin';   
import RegistrationStep1 from './screens/RegistrationStep1'; 
import RegistrationStep2 from './screens/RegistrationStep2';
import RegistrationStep3 from './screens/RegistrationStep3'; 
import ProfileScreen from './screens/ProfileScreen';
import MatchScreen from './screens/MatchScreen';
import MatchChat from './screens/MatchChat';
import { useNavigation } from '@react-navigation/native';
import MatchListScreen from './screens/MatchListScreen';
import { RegistrationProvider } from './context/RegistrationContext';

// Definição dos tipos das rotas
export type RootStackParamList = {
  Login: undefined;
  EmailLogin: undefined;
  PhoneLogin: undefined;
  RegistrationStep1: undefined;
  RegistrationStep2: undefined;
  RegistrationStep3: undefined;
  Home: undefined;
  ChatScreen: undefined;
  ChatQueue: undefined;
  Profile: undefined;
  Encounters: undefined;
  Likes: undefined;
  MatchScreen: undefined;
  MatchChats: { matchId: string };
  MatchList: undefined;
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
    await signOut(auth);
    navigation.navigate('Login');
  };

  const navigateToMatchChats = (matchId: string) => {
    navigation.navigate('MatchChats', { matchId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bem-vindo à App!</Text>
      <Button title="Perfil" onPress={() => navigation.navigate('Profile')} />
      <Button title="Emparelhamento Aleatório" onPress={() => navigation.navigate('ChatQueue')} />
      <Button title="Logout" onPress={handleLogout} />
      <Button title="Ir para os Matches" onPress={() => navigation.navigate('MatchList')} /> {/* Alterado para a nova tela de MatchList */}
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
  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Login" component={LoginScreen} />
  <Stack.Screen name="EmailLogin" component={EmailLogin} />
  <Stack.Screen name="PhoneLogin" component={PhoneLogin} />
  <Stack.Screen name="RegistrationStep1" component={RegistrationStep1} />
  <Stack.Screen name="RegistrationStep2" component={RegistrationStep2} />
  <Stack.Screen name="RegistrationStep3" component={RegistrationStep3} />
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="ChatScreen" component={ChatScreen} />
  <Stack.Screen name="ChatQueue" component={ChatQueue} />
  <Stack.Screen name="Profile" component={ProfileScreen} />
  <Stack.Screen name="Encounters" component={EncountersScreen} />
  <Stack.Screen name="Likes" component={LikesScreen} />
  <Stack.Screen name="MatchScreen" component={MatchScreen} />
  <Stack.Screen name="MatchChats" component={MatchChat} />
  <Stack.Screen name="MatchList" component={MatchListScreen} />
</Stack.Navigator>  
    </NavigationContainer>
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

