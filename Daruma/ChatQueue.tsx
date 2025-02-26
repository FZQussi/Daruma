// ChatQueue.tsx
import React, { useEffect, useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { collection, addDoc, onSnapshot, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Garante que 'db' está exportado

const ChatQueue: React.FC<any> = ({ navigation }) => {
  const [waiting, setWaiting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Função para entrar na fila de espera
  const joinQueue = async () => {
    setWaiting(true);
    try {
      const docRef = await addDoc(collection(db, 'chatQueue'), {
        status: 'waiting',
        timestamp: new Date().toISOString(),
      });
      setUserId(docRef.id); // Guardar o ID do utilizador na fila
    } catch (error) {
      console.error('Erro ao entrar na fila:', error);
      setWaiting(false);
    }
  };

  // Monitorar mudanças na fila para detetar emparelhamentos
  useEffect(() => {
    if (userId) {
      const unsubscribe = onSnapshot(collection(db, 'chatQueue'), async (snapshot) => {
        const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        if (users.length >= 2) {
          const [user1, user2] = users;

          // Criar uma sala de chat para os dois utilizadores
          const chatRoomId = `${user1.id}_${user2.id}`;
          await setDoc(doc(db, 'chatRooms', chatRoomId), {
            users: [user1.id, user2.id],
          });

          // Remover os utilizadores da fila de espera
          await deleteDoc(doc(db, 'chatQueue', user1.id));
          await deleteDoc(doc(db, 'chatQueue', user2.id));

          // Redirecionar o utilizador para a sala de chat
          navigation.navigate('ChatScreen', { chatRoomId });
        }
      });

      return () => unsubscribe(); // Cancelar subscrição ao sair da página
    }
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Emparelhamento aleatório para chat</Text>
      {!waiting && <Button title="Entrar no chat aleatório" onPress={joinQueue} />}
      {waiting && <Text>A aguardar emparelhamento...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default ChatQueue;
