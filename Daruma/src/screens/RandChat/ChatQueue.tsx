import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, doc, setDoc, getDocs, deleteDoc, addDoc, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import Svg, { Path } from 'react-native-svg';

const Navbar = ({ navigation }: { navigation: any }) => {
  return (
<View style={styles.navbar}>
  <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('MatchList')}>
    <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9973 8.53055C11.1975 7.62155 9.8639 7.37703 8.86188 8.2094C7.85986 9.04177 7.71879 10.4334 8.50568 11.4179C8.97361 12.0033 10.1197 13.053 10.9719 13.8079C11.3237 14.1195 11.4996 14.2753 11.7114 14.3385C11.8925 14.3925 12.102 14.3925 12.2832 14.3385C12.4949 14.2753 12.6708 14.1195 13.0226 13.8079C13.8748 13.053 15.0209 12.0033 15.4888 11.4179C16.2757 10.4334 16.1519 9.03301 15.1326 8.2094C14.1134 7.38579 12.797 7.62155 11.9973 8.53055Z"
        stroke="#696969"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path
        d="M3 7.2C3 6.07989 3 5.51984 3.21799 5.09202C3.40973 4.71569 3.71569 4.40973 4.09202 4.21799C4.51984 4 5.0799 4 6.2 4H17.8C18.9201 4 19.4802 4 19.908 4.21799C20.2843 4.40973 20.5903 4.71569 20.782 5.09202C21 5.51984 21 6.0799 21 7.2V20L17.6757 18.3378C17.4237 18.2118 17.2977 18.1488 17.1656 18.1044C17.0484 18.065 16.9277 18.0365 16.8052 18.0193C16.6672 18 16.5263 18 16.2446 18H6.2C5.07989 18 4.51984 18 4.09202 17.782C3.71569 17.5903 3.40973 17.2843 3.21799 16.908C3 16.4802 3 15.9201 3 14.8V7.2Z"
        stroke="#696969"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navButtonActive} onPress={() => navigation.navigate('ChatQueue')}>
    <Svg viewBox="0 0 16 16" fill="none" width={30} height={30}>
      <Path
        d="M5 4a1 1 0 000 2h.01a1 1 0 000-2H5zM7 8a1 1 0 011-1h.01a1 1 0 010 2H8a1 1 0 01-1-1zM11.01 10a1 1 0 100 2h.01a1 1 0 100-2h-.01z"
        fill="#FFFFFF"
      />
      <Path
        fillRule="evenodd"
        d="M3.25 1A2.25 2.25 0 001 3.25v9.5A2.25 2.25 0 003.25 15h9.5A2.25 2.25 0 0015 12.75v-9.5A2.25 2.25 0 0012.75 1h-9.5zM2.5 3.25a.75.75 0 01.75-.75h9.5a.75.75 0 01.75.75v9.5a.75.75 0 01-.75.75h-9.5a.75.75 0 01-.75-.75v-9.5z"
        clipRule="evenodd"
        fill="#FFFFFF"
      />
    </Svg>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('MatchScreen')}>
    <Svg fill="#696969" viewBox="0 0 24 24" width={30} height={30}>
      <Path
        d="M20.466,1.967,14.78.221a5.011,5.011,0,0,0-6.224,3.24L8.368,4H5A5.006,5.006,0,0,0,0,9V19a5.006,5.006,0,0,0,5,5h6a4.975,4.975,0,0,0,3.92-1.934,5.029,5.029,0,0,0,.689.052,4.976,4.976,0,0,0,4.775-3.563L23.8,8.156A5.021,5.021,0,0,0,20.466,1.967ZM11,22H5a3,3,0,0,1-3-3V9A3,3,0,0,1,5,6h6a3,3,0,0,1,3,3V19A3,3,0,0,1,11,22ZM21.887,7.563l-3.412,10.4a2.992,2.992,0,0,1-2.6,2.134A4.992,4.992,0,0,0,16,19V9a5.006,5.006,0,0,0-5-5h-.507a3,3,0,0,1,3.7-1.867l5.686,1.746A3.006,3.006,0,0,1,21.887,7.563ZM12,13c0,1.45-1.544,3.391-2.714,4.378a1.991,1.991,0,0,1-2.572,0C5.544,16.391,4,14.45,4,13a2,2,0,0,1,4,0,2,2,0,0,1,4,0Z"
      />
    </Svg>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('LikeScreen')}>
    <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
        stroke="#696969"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
  <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
      stroke="#696969" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </Svg>
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
    justifyContent: 'space-between',  // Para garantir que os ícones ocupem o mesmo espaço
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navButton: {
    width: '18%',  // Definindo a largura de cada botão para ser a mesma
    alignItems: 'center',  // Centraliza os ícones
    justifyContent: 'center',  // Centraliza os ícones verticalmente
  },
  navText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  navButtonActive: {
    width: '18%',  // Definindo a largura de cada botão para ser a mesma
    alignItems: 'center',  // Centraliza os ícones
    justifyContent: 'center',
    backgroundColor: '#A7C7E7',
    borderRadius: 30, // Transforma em um círculo
    padding: 5,   // Centraliza os ícones verticalmente
  },
});

export default QueueScreen;


