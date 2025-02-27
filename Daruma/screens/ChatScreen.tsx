import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';

const ChatScreen: React.FC<any> = ({ route }) => {
  const { chatRoomId } = route.params; // Receber o ID da sala
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Função para enviar mensagem
  const sendMessage = async () => {
    if (message.trim() === '') return;
    try {
      setLoading(true);
      await addDoc(collection(db, `chatRooms/${chatRoomId}/messages`), {
        text: message,
        createdAt: new Date().toISOString(),
      });
      setMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem: ', error);
    } finally {
      setLoading(false);
    }
  };

  // Obter mensagens em tempo real
  useEffect(() => {
    const q = query(collection(db, `chatRooms/${chatRoomId}/messages`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [chatRoomId]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} // Melhorar o layout para iOS
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.message}>{item.text}</Text>}
        inverted // Isso vai garantir que a lista começa do final (mais recente) ao invés do início
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite a sua mensagem..."
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={sendMessage}
        />
        <Button title={loading ? 'Enviando...' : 'Enviar'} onPress={sendMessage} disabled={loading} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 8,
  },
  message: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 16,
  },
});

export default ChatScreen;

