import React, { useEffect, useState, useRef} from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  Alert, TouchableOpacity, Image, Modal, Dimensions
} from 'react-native';
import {
  getFirestore, collection, addDoc, orderBy,
  onSnapshot, updateDoc, doc, getDoc, query, where, getDocs
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp  } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from './types';
import { Appbar, Avatar, Button } from 'react-native-paper';
import uploadToCloudinary from './uploadToCloudinary'; // ⚠️ Importa a tua função


const db = getFirestore();
const auth = getAuth();

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isDeleted: boolean;
  read: boolean;
  imageUrl?: string;
  
};

type MatchChatScreenRouteProp = RouteProp<RootStackParamList, 'MatchChats'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MatchChats'>;

interface Props {
  route: MatchChatScreenRouteProp;
  navigation: NavigationProp;
}

const MatchChat: React.FC<Props> = ({ route, navigation }) => {
  const { matchId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [otherUserName, setOtherUserName] = useState<string | null>(null);
  const [otherUserAvatar, setOtherUserAvatar] = useState<string | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);
  const isFocused = useIsFocused();
  

  const openImageZoom = (imageUrl: string) => {
    setZoomImageUrl(imageUrl);
    setShowImageZoom(true);
  };
  
  const currentUser = auth.currentUser;
  const { width } = Dimensions.get('window');
  useEffect(() => {
    if (!matchId) return;
  
    const messagesRef = collection(db, `chatRooms/${matchId}/messages`);
    // Consulta as mensagens ordenadas de forma decrescente
    const q = query(messagesRef, orderBy('timestamp', 'desc'));  // Aqui
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, 'id'>),
      }));
      setMessages(loadedMessages);
    });
  
    return () => unsubscribe();
  }, [matchId]);
  
  
    
  
  

  const sendMessage = async () => {
    if (!inputText.trim()) return;
  
    // ⚠️ Buscando o outro usuário
    const matchRef = doc(db, 'Matches', matchId);
    const matchSnap = await getDoc(matchRef);
    const usersInMatch = matchSnap.exists() ? matchSnap.data().users : [];
    const receiverId = usersInMatch.find((id: string) => id !== currentUser?.uid);
  
    const newMessage = {
      senderId: currentUser?.uid,
      receiverId: receiverId || '',
      text: inputText,
      timestamp: Date.now(),
      isDeleted: false,
      read: false,
    };
  
    try {
      await addDoc(collection(db, `chatRooms/${matchId}/messages`), newMessage);
      setInputText('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };
  

  const sendImageMessage = async (imageUri: string, caption: string) => {
    try {
      const imageUrl = await uploadToCloudinary(imageUri);
  
      // ⚠️ Buscando o outro usuário
      const matchRef = doc(db, 'Matches', matchId);
      const matchSnap = await getDoc(matchRef);
      const usersInMatch = matchSnap.exists() ? matchSnap.data().users : [];
      const receiverId = usersInMatch.find((id: string) => id !== currentUser?.uid);
  
      const message = {
        senderId: currentUser?.uid,
        receiverId: receiverId || '',
        text: caption,
        imageUrl,
        timestamp: Date.now(),
        isDeleted: false,
        read: false,
      };
  
      await addDoc(collection(db, `chatRooms/${matchId}/messages`), message);
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
    }
  };
  

  const pickImage = async (fromCamera = false) => {
    const result = await (fromCamera
      ? ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 })
      : ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 }));

    if (!result.canceled && result.assets.length > 0) {
      setPreviewImage(result.assets[0].uri);
      setCaptionText('');
      setShowPreview(true);
    }
  };

  const confirmSendImage = () => {
    if (previewImage) {
      sendImageMessage(previewImage, captionText);
      setPreviewImage(null);
      setCaptionText('');
      setShowPreview(false);
    }
  };

  const markMessageAsDeleted = async (messageId: string) => {
    try {
      const messageRef = doc(db, `chatRooms/${matchId}/messages`, messageId);
      await updateDoc(messageRef, { isDeleted: true });
    } catch (error) {
      console.error('Erro ao ocultar mensagem:', error);
    }
  };

  const confirmDeleteMessage = async (messageId: string, senderId: string) => {
    if (senderId !== currentUser?.uid) {
      Alert.alert('Erro', 'Você não pode excluir esta mensagem.');
      return;
    }
  
    Alert.alert('Excluir mensagem', 'Tem certeza que deseja excluir esta mensagem?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', onPress: () => markMessageAsDeleted(messageId) },
    ]);
  };
  
  const confirmReportMessage = (messageId: string, senderId: string) => {
    if (senderId === currentUser?.uid) {
      Alert.alert('Erro', 'Você não pode reportar sua própria mensagem.');
      return;
    }
  
    Alert.alert('Reportar mensagem', 'Você tem certeza que deseja reportar esta mensagem?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reportar', onPress: () => reportMessage(messageId) },
    ]);
  };

  const reportMessage = async (messageId: string) => {
    try {
      const reportedMessagesRef = collection(db, 'reportedMessages');
  
      // 🔍 Verifica se já existe um report deste user para este chat
      const q = query(
        reportedMessagesRef,
        where('messageId', '==', messageId),
        where('userId', '==', currentUser?.uid)
      );
  
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        Alert.alert('Já reportado', 'Você já reportou uma mensagem neste chat.');
        return;
      }
  
      // ✅ Se não encontrou, adiciona o novo report
      const newReport = {
        messageId: messageId,
        userId: currentUser?.uid,
        timestamp: Date.now(),
        status: 'pendente',
      };
  
      await addDoc(reportedMessagesRef, newReport);
      Alert.alert('Mensagem reportada', 'A mensagem foi reportada com sucesso!');
    } catch (error) {
      console.error('Erro ao reportar a mensagem:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar reportar a mensagem.');
    }
  };
  
  

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchOtherUserName = async () => {
      if (!matchId || !currentUser) return;

      const matchRef = doc(db, 'Matches', matchId);
      const matchSnap = await getDoc(matchRef);

      if (matchSnap.exists()) {
        const usersInMatch = matchSnap.data().users;
        const otherUserId = usersInMatch.find((id: string) => id !== currentUser.uid);

        if (otherUserId) {
          const userRef = doc(db, 'users', otherUserId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setOtherUserAvatar(userData.profilePicture);
            setOtherUserName(userData.username);
          }
        }
      }
    };

    fetchOtherUserName();
  }, [matchId, currentUser]);

useEffect(() => {
  if (!matchId || !currentUser) return;

  const messagesRef = collection(db, `chatRooms/${matchId}/messages`);
  const q = query(messagesRef, orderBy('timestamp', 'desc'));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const loadedMessages: Message[] = [];

    await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data() as Message;

        // Marcar como lido se for para o usuário atual, ainda não lida, e a tela estiver focada
        if (data.receiverId === currentUser.uid && !data.read && isFocused) {
          await updateDoc(doc(db, `chatRooms/${matchId}/messages`, docSnap.id), {
            read: true,
          });
        }

        loadedMessages.push({ id: docSnap.id, ...data });
      })
    );

    setMessages(loadedMessages);
  });

  return () => unsubscribe();
}, [matchId, currentUser, isFocused]); // 👈 isFocused incluído aqui

  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.navigate('MatchList')} />
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {otherUserAvatar && (
            <Avatar.Image source={{ uri: otherUserAvatar }} size={36} style={{ marginRight: 10 }} />
          )}
          <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold' }}>
            {otherUserName || 'Carregando...'}
          </Text>
        </View>
        <Appbar.Action icon="camera" onPress={() => pickImage(true)} />
        <Appbar.Action icon="image" onPress={() => pickImage(false)} />
      </Appbar.Header>

      <FlatList
  data={messages.filter((m) => !m.isDeleted)}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => {
    const isMyMessage = item.senderId === currentUser?.uid;
    const hasImage = !!item.imageUrl;
    const hasText = !!item.text;

    return (
      <TouchableOpacity
        onLongPress={() => {
          if (item.senderId !== currentUser?.uid) {
            // Se a mensagem não for sua, chama a função de reportar
            confirmReportMessage(item.id, item.senderId);
          } else {
            // Se a mensagem for sua, chama a função de deletar
            confirmDeleteMessage(item.id, item.senderId);
          }
        }}
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage,
          hasImage && styles.imageMessageBubble,
          hasImage && hasText && styles.imageWithTextBubble,
        ]}
      >
        {/* Renderização do conteúdo da mensagem */}
        {hasImage && (
          <TouchableOpacity onPress={() => openImageZoom(item.imageUrl!)}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        {hasImage && hasText ? (
          <>
            <Text style={styles.imageCaption}>{item.text}</Text>
            <Text style={styles.timestampBelow}>{formatTimestamp(item.timestamp)}</Text>
          </>
        ) : hasText ? (
          <>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </>
        ) : (
          hasImage && (
            <Text style={styles.timestampOverlay}>{formatTimestamp(item.timestamp)}</Text>
          )
        )}
      </TouchableOpacity>
    );
  }}
  inverted
/>




      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite sua mensagem..."
        />
        
        <Button icon="send" // This is the icon (send icon)
        mode="contained" // Button style
        onPress={sendMessage}
        buttonColor="#ADD8E6"
        disabled={!inputText}>
    Send
  </Button>
      </View>

      {/* Modal preview da imagem */}
      <Modal visible={showPreview} animationType="slide">
        <View style={styles.fullscreenPreview}>
          {previewImage && <Image source={{ uri: previewImage }} style={styles.fullscreenImage} />}
          <TextInput
            style={styles.fullscreenCaption}
            placeholder="Adicione uma legenda..."
            value={captionText}
            onChangeText={setCaptionText}
            placeholderTextColor="#999"
          />
          <View style={styles.fullscreenButtons}>
            <TouchableOpacity
              onPress={() => {
                setShowPreview(false);
                setPreviewImage(null);
                setCaptionText('');
              }}
              style={[styles.previewButton, { backgroundColor: '#ccc' }]}
            >
              <Text>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirmSendImage}
              style={[styles.previewButton, { backgroundColor: '#ADD8E6' }]}
            >
              <Text style={{ color: 'white' }}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showImageZoom} animationType="fade">
  <View style={styles.fullscreenPreview1}>
    {zoomImageUrl && <Image source={{ uri: zoomImageUrl }} style={styles.fullscreenImage1} />}
    
    {/* Botão de fechar no topo */}
    <TouchableOpacity
      onPress={() => setShowImageZoom(false)}
      style={styles.closeButton}
    >
      <Text style={{ color: 'white', fontSize: 18 }}>Fechar</Text>
    </TouchableOpacity>
  </View>
</Modal>


    </View>
  );
};
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
    maxWidth: width * 0.75, // <-- ótimo
    overflow: 'hidden',
    alignSelf: 'flex-start', // ou flex-end, conforme necessário
    flexShrink: 1, // <-- força a caixa a encolher ao invés de expandir
    
  },
  
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ADD8E6',
  },

  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
  },
  fullscreenPreview1: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',  // Centraliza a imagem na tela
    alignItems: 'center',      // Centraliza a imagem na tela
  },

  fullscreenImage1: {
    width: '90%',             // Ajuste conforme necessário para o tamanho desejado
    height: '75%',            // Ajuste conforme necessário para o tamanho desejado
    resizeMode: 'contain',    // Isso mantém a proporção da imagem
  },

  closeButton: {
    position: 'absolute',   // Fixa o botão no topo
    top: 30,                // Distância do topo
    left: 20,               // Distância da borda esquerda (ajuste conforme necessário)
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo semitransparente
    padding: 10,
    borderRadius: 10,
  },
  imageMessageBubble: {
    padding: 6,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    maxWidth: width * 0.80, // largura proporcional
  },

  imageWithTextBubble: {
    padding: 6,
    borderWidth: 1,
  },

  messageImage: {
    width: width * 0.7,  // 70% da largura da tela
    height: width * 0.7,
    borderRadius: 10,
    resizeMode: 'contain',
    alignSelf: 'center',
  },

  imageCaption: {
    color: 'white',
    fontSize: 14,
    paddingTop: 6,
  },

  timestampBelow: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  timestampOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10, // <-- muito mais estável e evita empurrar o texto
    color: 'white',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },

  messageText: {
    color: 'white',
    fontSize: 15,
  },

  timestamp: {
    fontSize: 11,
    color: 'white',
    marginTop: 4,
    alignSelf: 'flex-end',
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
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
  },

  fullscreenPreview: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
  },

  fullscreenImage: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '75%',
    resizeMode: 'contain',
  },

  fullscreenCaption: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },

  fullscreenButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },

  previewButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginHorizontal: 10,
  },
});

export default MatchChat;



