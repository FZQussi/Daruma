import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Alert } from 'react-native';
import { app } from './firebaseConfig';

const db = getFirestore(app);

// Função para verificar o status de banimento
export const checkIfUserIsBanned = async (): Promise<boolean> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) return false;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return userData.status === true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao verificar banimento:', error);
    return false;
  }
};
