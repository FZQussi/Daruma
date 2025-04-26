import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState('Utilizador123');

  const toggleNotifications = () => setNotificationsEnabled(prev => !prev);
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleLogout = () => {
    Alert.alert('Logout', 'Tens a certeza que queres sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', onPress: () => console.log('Logout') },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Definições</Text>

      <View style={styles.settingRow}>
        <Text style={styles.label}>Notificações</Text>
        <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.label}>Modo Escuro</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.label}>Nome de utilizador</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  settingRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#FF4C4C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
