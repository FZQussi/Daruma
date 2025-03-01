import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, addDoc, query, onSnapshot, orderBy, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './types'; // Certifique-se de importar o tipo da navegação
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationType = NativeStackNavigationProp<RootStackParamList, 'ChatScreen'>;

const ChatScreen: React.FC<any> = ({ route }) => {
  const { chatRoomId } = route.params; // Receber o ID da sala
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLikes, setUserLikes] = useState<{ [key: string]: boolean }>({}); // Armazenar o estado de Like/Dislike
  const [isChatClosed, setIsChatClosed] = useState(false); // Monitorar o status de fechamento do chat
  const flatListRef = useRef<FlatList>(null); // Referência para a FlatList

  const currentUser = getAuth().currentUser;
  const navigation = useNavigation<NavigationType>(); // Navegação com tipagem correta

  // Função para enviar mensagem
  const sendMessage = async () => {
    if (message.trim() === '') return;
    try {
      setLoading(true);
      const user = getAuth().currentUser;
      if (user) {
        await addDoc(collection(db, `chatRooms/${chatRoomId}/messages`), {
          text: message,
          createdAt: new Date().toISOString(),
          userId: user.uid, // Salva o uid do remetente
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

  // Função para rolar até a última mensagem
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Função para verificar o estado do Like/Dislike
  useEffect(() => {
    const fetchLikesStatus = async () => {
      if (!currentUser) return;
      const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
      const chatRoomDoc = await getDoc(chatRoomRef);
      if (chatRoomDoc.exists()) {
        const data = chatRoomDoc.data();
        if (data?.likes) {
          setUserLikes(data.likes);
        }
        if (data?.isClosed) {
          setIsChatClosed(data.isClosed);
        }
      }
    };

    fetchLikesStatus();
  }, [chatRoomId]);

  // Função para lidar com o Like
  const handleLike = async () => {
    if (!currentUser) return;

    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
    const chatRoomDoc = await getDoc(chatRoomRef);

    if (chatRoomDoc.exists()) {
      const data = chatRoomDoc.data();
      
      // Atualiza os likes
      let updatedLikes = { ...userLikes, [currentUser.uid]: true };

      // Verificar se ambos os usuários deram like
      const otherUser = Object.keys(userLikes).find((id) => id !== currentUser?.uid);
      if (updatedLikes[currentUser.uid] && updatedLikes[otherUser || '']) {
        // Criar o match
        console.log('🎉 Match encontrado!');
        
        // Criar o match entre os dois usuários
        const matchRef = doc(db, 'matches', `${currentUser.uid}_${otherUser}`);
        await setDoc(matchRef, {
          users: [currentUser.uid, otherUser],
          createdAt: new Date(),
        });

        // Atualizar o estado do chat para fechado
        await updateDoc(chatRoomRef, { isClosed: true });

        // Redirecionar para a tela de MatchList
        navigation.navigate('MatchList');
      }

      // Atualiza os likes na base de dados
      await updateDoc(chatRoomRef, {
        likes: updatedLikes,
      });
    }
  };

  // Função para lidar com o Dislike
  const handleDislike = async () => {
    if (!currentUser) return;

    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
    const chatRoomDoc = await getDoc(chatRoomRef);

    if (chatRoomDoc.exists()) {
      const data = chatRoomDoc.data();

      // Atualiza os likes e dislikes
      let updatedLikes = { ...userLikes, [currentUser.uid]: false };

      // Atualiza os dislikes e fecha o chat
      await updateDoc(chatRoomRef, {
        likes: updatedLikes,
        isClosed: true, // Fecha o chat
      });

      console.log('Chat fechado!');
      setIsChatClosed(true); // Atualiza o estado do chat na UI

      // Redireciona para a tela de MatchList
      navigation.navigate('MatchList');
    }
  };

  if (isChatClosed) {
    return (
      <View style={styles.container}>
        <Text>Este chat foi fechado devido a um "dislike".</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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

      <View style={styles.buttonContainer}>
        <Button title="❌ Dislike" onPress={handleDislike} color="red" />
        <Button title="❤️ Like" onPress={handleLike} color="green" />
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
  },
});

export default ChatScreen;
