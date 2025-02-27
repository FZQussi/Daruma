import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types'; // Importar tipos de navegação

const db = getFirestore();
const auth = getAuth();

// 🔹 Definição do tipo para as mensagens do chat
type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isDeleted: boolean; // Campo para marcar se a mensagem foi "excluída"
};

// 🔹 Tipagem correta para as props do MatchChat
type MatchChatScreenRouteProp = RouteProp<RootStackParamList, 'MatchChats'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MatchChats'>;

interface Props {
  route: MatchChatScreenRouteProp;
  navigation: NavigationProp;
}

const MatchChat: React.FC<Props> = ({ route }) => {
  const { matchId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!matchId) return;

    // 🔹 Query para buscar mensagens do chat ordenadas por timestamp
    const messagesRef = collection(db, `chats/${matchId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    // 🔹 Listener para atualizar mensagens em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, 'id'>), // Converte corretamente os dados do Firebase
      }));
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [matchId]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage = {
      senderId: currentUser?.uid,
      text: inputText,
      timestamp: Date.now(),
      isDeleted: false, // A nova mensagem não é deletada
    };

    try {
      await addDoc(collection(db, `chats/${matchId}/messages`), newMessage);
      setInputText('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const markMessageAsDeleted = async (messageId: string) => {
    try {
      const messageRef = doc(db, `chats/${matchId}/messages`, messageId);
      await updateDoc(messageRef, {
        isDeleted: true, // Marca a mensagem como excluída (não será mais exibida)
      });
    } catch (error) {
      console.error('Erro ao ocultar mensagem:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}`;
  };

  const confirmDeleteMessage = (messageId: string, senderId: string) => {
    if (senderId !== currentUser?.uid) {
      Alert.alert('Erro', 'Você não pode excluir esta mensagem, pois não foi você quem a enviou.');
      return;
    }

    Alert.alert(
      'Excluir mensagem',
      'Tem certeza que deseja excluir esta mensagem?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: () => markMessageAsDeleted(messageId),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages.filter((message) => !message.isDeleted)} // Filtra mensagens excluídas
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => confirmDeleteMessage(item.id, item.senderId)} // Detecta pressionamento longo
            style={[styles.messageBubble, item.senderId === currentUser?.uid ? styles.myMessage : styles.otherMessage]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite sua mensagem..."
        />
        <Button title="Enviar" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
  },
  messageText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
    color: '#bbb',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
});

export default MatchChat;

