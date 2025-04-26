import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import * as Location from 'expo-location';


const db = getFirestore(app);
const auth = getAuth(app);

const plans = [
  {
    name: 'Free',
    benefits: ['Acesso limitado', 'Anúncios visíveis', '1 foto adicional'],
  },
  {
    name: 'Premium',
    benefits: ['Acesso completo', 'Sem anúncios', 'Upload de 5 fotos adicionais'],
  },
  {
    name: 'Pro',
    benefits: ['Tudo do Premium', 'Destaque no app', 'Suporte prioritário'],
  },
];

const ProfilePlan: React.FC = () => {
  const [accountType, setAccountType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const isPlanExpired = (endDateString: string | undefined): boolean => {
    if (!endDateString) return true;
    const endDate = new Date(endDateString);
    return isNaN(endDate.getTime()) || new Date() > endDate;
  };
  
  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão para acessar a localização não foi concedida.');
        return;
      }
  
      const userLocation = await Location.getCurrentPositionAsync({});
      const user = auth.currentUser;
  
      if (user) {
        const privateDataRef = doc(db, 'users', user.uid, 'private', 'data');
        await updateDoc(privateDataRef, {
          location: {
            ...userLocation.coords,
            updatedAt: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error('Erro ao obter ou atualizar a localização:', error);
    }
  };
  
  

  useEffect(() => {
    const fetchAccountType = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            const data = docSnap.data();
            const expired = isPlanExpired(data.subscriptionEnd);
  
            if (expired) {
              // Atualiza no Firestore para 'Free'
              await updateDoc(docRef, {
                accountType: 'Free',
                subscriptionStart: null,
                subscriptionEnd: null,
              });
              setAccountType('Free');
            } else {
              setAccountType(data.accountType || 'Free');
            }
          } else {
            // Documento não existe, define como Free por segurança
            setAccountType('Free');
          }
        } catch (error) {
          console.error('Erro ao buscar tipo de conta:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
  
    fetchAccountType();
    fetchLocation();
  }, []);
  

  

  const handleSubscribe = async (planName: string) => {
    const user = auth.currentUser;
    if (!user) return;
  
    Alert.alert(
      'Confirmar Subscrição',
      `Deseja realmente mudar seu plano para "${planName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setUpdating(true);
  
              const now = new Date();
              const expirationDate = new Date();
              expirationDate.setDate(now.getDate() + 30);
  
              await updateDoc(doc(db, 'users', user.uid), {
                accountType: planName,
                subscriptionStart: now.toISOString(),
                subscriptionEnd: expirationDate.toISOString(),
              });
  
              setAccountType(planName);
              Alert.alert('Plano atualizado com sucesso!');
            } catch (error) {
              Alert.alert('Erro ao atualizar o plano.');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };


  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />;
  }

  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Escolha seu Plano</Text>
      <Text style={styles.currentPlan}>Plano atual: <Text style={styles.highlight}>{accountType}</Text></Text>

      {plans.map((plan, index) => (
        <View key={index} style={styles.planCard}>
          <Text style={styles.planName}>{plan.name}</Text>
          {plan.benefits.map((benefit, idx) => (
            <Text key={idx} style={styles.benefit}>• {benefit}</Text>
          ))}
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => handleSubscribe(plan.name)}
            disabled={updating || accountType === plan.name}
          >
            <Text style={styles.subscribeText}>
              {accountType === plan.name ? 'Já Subscrevido' : 'Subscrever'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  currentPlan: {
    fontSize: 16,
    marginBottom: 20,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  planCard: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  benefit: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  subscribeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfilePlan;
