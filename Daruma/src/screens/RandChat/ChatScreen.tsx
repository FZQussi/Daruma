import React, { useEffect, useState, useRef } from 'react';
import { 
  View, TextInput, Button, FlatList, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { collection, addDoc, query, onSnapshot, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Definição das rotas
type RootStackParamList = {
  ChatQueue: undefined;
  ChatScreen: { chatRoomId: string };
  Home: undefined;
};

const ChatScreen: React.FC<any> = ({ route }) => {
  const { chatRoomId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isChatClosed, setIsChatClosed] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const currentUser = getAuth().currentUser;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const updateUserStatusInChat = async (isUserInChat: boolean) => {
    if (!currentUser) return;
    try {
      const chatRef = doc(db, 'chatRooms', chatRoomId);
      const chatSnap = await getDoc(chatRef);
  
      if (chatSnap.exists()) {
        const data = chatSnap.data();
        // Atualizar o status dependendo de quem está saindo
        if (data?.users[0] === currentUser.uid) {
          await updateDoc(chatRef, { isUser1InChat: isUserInChat });
        } else if (data?.users[1] === currentUser.uid) {
          await updateDoc(chatRef, { isUser2InChat: isUserInChat });
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status no chat:', error);
    }
  };
  

  // Enviar mensagem
  const sendMessage = async () => {
    if (message.trim() === '') return;
    try {
      setLoading(true);
      if (currentUser) {
        await addDoc(collection(db, `chatRooms/${chatRoomId}/messages`), {
          text: message,
          createdAt: new Date().toISOString(),
          userId: currentUser.uid,
        });
        setMessage('');
      }
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

  // Verificar status do chat em tempo real
  useEffect(() => {
    const checkChatStatus = async () => {
      const chatRef = doc(db, 'chatRooms', chatRoomId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        const data = chatSnap.data();
        // Se algum usuário estiver "offline" ou não estiver mais no chat, marcar chat como fechado
        if (data?.isUser1InChat === false || data?.isUser2InChat === false) {
          setIsChatClosed(true);
        } else {
          setIsChatClosed(false);
        }
      }
    };

    // Criar listener em tempo real para atualizar o status do chat
    const unsubscribe = onSnapshot(doc(db, 'chatRooms', chatRoomId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // Atualizar o estado de isChatClosed com base nos status dos usuários
        if (data?.isUser1InChat === false || data?.isUser2InChat === false) {
          setIsChatClosed(true);
        } else {
          setIsChatClosed(false);
        }
      }
    });

    return () => unsubscribe();
  }, [chatRoomId]);

  // Fechar chat e iniciar um novo
  const handleNewChat = async () => {
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'chatRooms', chatRoomId), {
        status: 'closed',
      });

      // Atualiza o status do usuário para "offline" ou "saiu"
      await updateUserStatusInChat(false); // Marca o usuário como "não está mais no chat"

      navigation.navigate('ChatQueue');
    } catch (error) {
      console.error('Erro ao fechar o chat:', error);
    }
  };

  // Sair e voltar para Home
  const handleExit = () => {
    if (currentUser) {
      updateUserStatusInChat(false); // Marca o usuário como "não está mais no chat"
    }
    navigation.navigate('Home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {/* Botões no topo */}
      <View style={styles.headerButtons}>
        <Button title="Novo Chat" onPress={handleNewChat} />
        <Button title="Sair" onPress={handleExit} color="red" />
      </View>

      {/* Exibir mensagens */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isCurrentUser = item.userId === getAuth().currentUser?.uid;
            return (
              <View style={[styles.messageContainer, isCurrentUser ? styles.messageRight : styles.messageLeft]}>
                <Text style={styles.message}>{item.text}</Text>
              </View>
            );
          }}
        />
      </ScrollView>

      {/* Verificar se o chat está fechado */}
      {isChatClosed ? (
        <View style={styles.closedChatContainer}>
          <Text style={styles.closedChatMessage}>Este chat foi fechado.</Text>
        </View>
      ) : (
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
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  messageContainer: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  messageLeft: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  messageRight: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  message: {
    padding: 10,
    backgroundColor: '#e1ffc7',
    borderRadius: 10,
    fontSize: 16,
    maxWidth: '80%',
  },
  closedChatContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  closedChatMessage: {
    fontSize: 18,
    color: 'red',
    fontStyle: 'italic',
  },
});

export default ChatScreen;
