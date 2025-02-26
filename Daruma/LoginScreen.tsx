import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { app } from './firebaseConfig';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types'; 
import { StackNavigationProp } from '@react-navigation/stack';

// Complete the web authentication session handling for Expo
WebBrowser.maybeCompleteAuthSession();

const Stack = createNativeStackNavigator<RootStackParamList>(); // Type the stack navigator

// Define the navigation type for this screen
type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList, // The type for the param list (used in types.ts)
  'Login' // The name of the current screen
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>(); // Properly typed navigation
  const auth = getAuth(app);

  // Google login configuration with Expo Auth Session
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '<YOUR_GOOGLE_CLIENT_ID>', // Replace with your actual clientId from Google Developer Console
  });

  // Handle Google login response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;

      // Authenticate with Firebase using the Google credential
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => {
          navigation.navigate('Home'); // Navigate to 'Home' screen after successful login
        })
        .catch((error) => {
          console.error('Error logging in with Google:', error);
        });
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bem-vindo! Faça Login</Text>

      {/* Button for email login */}
      <Button
        title="Login com Email"
        onPress={() => navigation.navigate('EmailLogin')}
      />

      {/* Button for phone login */}
      <Button
        title="Login com Telemóvel"
        onPress={() => navigation.navigate('PhoneLogin')}
      />

      {/* Button for Google login */}
      <Button
        title="Login com Google"
        onPress={() => promptAsync()} // Trigger the Google login flow
        disabled={!request} // Disable until the request is ready
      />

      {/* Button for registration */}
      <Button
        title="Registar"
        onPress={() => navigation.navigate('RegistrationStep1')}
      />
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
});

export default LoginScreen;
