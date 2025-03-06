import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, doc, setDoc, getDocs, deleteDoc, addDoc, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import Svg, { Path } from 'react-native-svg';

const Navbar = ({ navigation }: { navigation: any }) => {
  return (
<View style={styles.navbar}>
<TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('MatchList')}>
  <Text style={styles.navText}>Conversas</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ChatQueue')}>
  <Text style={styles.navText}>RandChat</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('MatchScreen')}>
  <Text style={styles.navText}>Swipe</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Likes')}>
  <Text style={styles.navText}>Likes</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
  <Text style={styles.navText}>Perfil</Text>
</TouchableOpacity>

</View>
 );
};
const QueueScreen = ({ navigation }: { navigation: any }) => {
  const [isInQueue, setIsInQueue] = useState(false);
  const [hasMatch, setHasMatch] = useState(false); // Armazena se o usuário tem um match

  useEffect(() => {
    const checkQueue = async () => {
      const user = auth.currentUser;
      if (user) {
        const queueRef = collection(db, 'Queue');
        const queueSnapshot = await getDocs(queueRef);
        const userInQueue = queueSnapshot.docs.some(doc => doc.id === user.uid);
        setIsInQueue(userInQueue);
      }
    };
    checkQueue();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && isInQueue) {
      // A escuta de matches só deve acontecer quando o usuário está na fila
      const matchesQuery = query(
        collection(db, 'Matches'),
        where('user1', '==', user.uid),
      );
      const unsubscribe1 = onSnapshot(matchesQuery, (snapshot) => {
        if (!snapshot.empty) {
          setHasMatch(true); // Quando encontrar um match
        }
      });

      const matchesQuery2 = query(
        collection(db, 'Matches'),
        where('user2', '==', user.uid),
      );
      const unsubscribe2 = onSnapshot(matchesQuery2, (snapshot) => {
        if (!snapshot.empty) {
          setHasMatch(true); // Quando encontrar um match
        }
      });

      return () => {
        unsubscribe1();
        unsubscribe2();
      };
    }
  }, [isInQueue]); // Só escuta mudanças quando o usuário está na fila

  useEffect(() => {
    if (hasMatch) {
      // Alerta para os dois usuários envolvidos no match
      Alert.alert('Parabéns!', 'Você fez um match com outro usuário!');
      navigation.navigate('MatchList'); // Redireciona para a lista de matches
    }
  }, [hasMatch]); // Quando o match for encontrado, faz o redirecionamento

  const enterQueue = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'Queue', user.uid);
      await setDoc(userRef, { timestamp: Date.now() });
      setIsInQueue(true);
      Alert.alert('Sucesso', 'Você entrou na fila de match!');
      findMatch();
    }
  };

  const leaveQueue = async () => {
    const user = auth.currentUser;
    if (user) {
      await deleteDoc(doc(db, 'Queue', user.uid));
      setIsInQueue(false);
      Alert.alert('Sucesso', 'Você saiu da fila de match!');
    }
  };

  const findMatch = async () => {
    const queueRef = collection(db, 'Queue');
    const queueSnapshot = await getDocs(queueRef);
    const usersInQueue = queueSnapshot.docs.map(doc => doc.id);

    if (usersInQueue.length < 2) {
      console.log('Não há usuários suficientes na fila para criar um match.');
      return;
    }

    const user1 = auth.currentUser?.uid;
    if (!user1) return;

    let user2 = usersInQueue.find(uid => uid !== user1);
    if (!user2) return;

    const matchesRef = collection(db, 'Matches');
    await addDoc(matchesRef, {
      user1,
      user2,
      timestamp: Date.now(),
    });

    await deleteDoc(doc(db, 'Queue', user1));
    await deleteDoc(doc(db, 'Queue', user2));

    // Avisar os dois usuários que o match foi feito
    const user1Ref = doc(db, 'Users', user1); // Supondo que você tenha uma coleção 'Users'
    const user2Ref = doc(db, 'Users', user2);

    const user1Doc = await getDoc(user1Ref); // Usando getDoc para pegar o documento
    const user2Doc = await getDoc(user2Ref); // Usando getDoc para pegar o documento

    const user1Data = user1Doc.exists() ? user1Doc.data() : null;
    const user2Data = user2Doc.exists() ? user2Doc.data() : null;

    if (user1Data && user2Data) {
      Alert.alert(`Match encontrado!`, `Você fez um match com ${user2Data?.name || 'Outro Usuário'}.`);
      Alert.alert(`Match encontrado!`, `Você fez um match com ${user1Data?.name || 'Outro Usuário'}.`);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Bem-vindo à fila de Match!</Text>
      <Button title={isInQueue ? 'Aguarde...' : 'Entrar na Fila'} onPress={enterQueue} disabled={isInQueue} />
      {isInQueue && <Button title="Sair da Fila" onPress={leaveQueue} />}
      <Navbar navigation={navigation} />
    </View>
    
  );
  
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { paddingTop: 20, paddingBottom: 20 },
  profileImage: { width: 150, height: 150, borderRadius: 75, alignSelf: 'center', marginBottom: 15, marginTop: 50 },
  infoCard: { backgroundColor: '#f8f8f8', padding: 15, borderRadius: 10, marginHorizontal: 20, alignItems: 'center' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  userBio: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 5 },
  progressBarContainer: { height: 5, backgroundColor: '#e0e0e0', borderRadius: 2, overflow: 'hidden', marginVertical: 15, marginHorizontal: 20 },
  progressBar: { height: '100%', backgroundColor: '#3b5998' },
  wrapper: { height: 400 },
  slide: { justifyContent: 'center', alignItems: 'center' },
  additionalPhoto: { width: 350, height: 450, borderRadius: 10 },
  noImagesText: { fontStyle: 'italic', textAlign: 'center', color: 'gray' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '90%', height: '70%', resizeMode: 'contain' },
  closeArea: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  unmatchButton: {
    backgroundColor: '#ff4d4d', // Cor vermelha para destacar
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  unmatchText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navButton: {
    padding: 10,
  },
  navText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default QueueScreen;


