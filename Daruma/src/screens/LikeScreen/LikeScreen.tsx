import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { getFirestore, collection, getDocs, updateDoc, doc, arrayUnion, arrayRemove, getDoc, addDoc, setDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebaseConfig'; 
import Svg, { Path } from "react-native-svg";
import { useNavigation } from '@react-navigation/native';
import { Appbar, Text, IconButton, Card } from 'react-native-paper';

const db = getFirestore(app);
const auth = getAuth(app);
const { width, height } = Dimensions.get('window');

interface Profile {
  id: string;
  profilePicture: string;
  username: string; 
  likes: string[];
  dislikes: string[];
  accountType: string;
  preferences: string;
  receivedLikes: string[];
}

const LikeScreen = () => {
  const navigation = useNavigation();
  const [likedProfiles, setLikedProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const currentUser = auth.currentUser;
  const [currentUserData, setCurrentUserData] = useState<Profile | null>(null);
  
  const [isFreeUser, setIsFreeUser] = useState(false);
  const hardcodedFProfiles = [
    { id: '1', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583435/zngsthaerg_ostl1m.jpg', username: 'Perfil 1' },
    { id: '2', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583226/56m85m678_tf2bia.jpg', username: 'Perfil 2' },
    { id: '3', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583223/56jhu56u_kopw8v.jpg', username: 'Perfil 3' },
    { id: '4', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583221/9-8.p7o_5mn_d82sbr.jpg', username: 'Perfil 4' },
    { id: '5', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583219/9-8.65m4n_ewfdpv.jpg', username: 'Perfil 5' },
    { id: '6', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583171/56m8568m_pk76ns.jpg', username: 'Perfil 6' },
    { id: '7', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583217/8m678_fxmen3.jpg', username: 'Perfil 7' },
    { id: '8', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583215/5m678567m8_ej0xgj.jpg', username: 'Perfil 8' },
    { id: '9', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583213/5m67856m8_a4y3ld.jpg', username: 'Perfil 9' },
    { id: '10', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583211/8.po_m5un_xfmydy.jpg', username: 'Perfil 10' },
    { id: '11', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583209/._met_p7hfyy.jpg', username: 'Perfil 11' },
    { id: '12', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583205/xnfxfjx_psugja.jpg', username: 'Perfil 12' },
    { id: '13', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583203/xfgjxfj_csyr2k.jpg', username: 'Perfil 13' },
    { id: '14', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583201/u_yumtjnrh_jcuu0r.jpg', username: 'Perfil 14' },
    { id: '15', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583199/ssgdrgsd_i1smfz.jpg', username: 'Perfil 15' },
    { id: '16', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583197/sfj_7i_dyfscj.jpg', username: 'Perfil 16' },
    { id: '17', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583195/sdfgvsd_cyhrur.jpg', username: 'Perfil 17' },
    { id: '18', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583194/ngf_y5r9dg.jpg', username: 'Perfil 18' },
    { id: '19', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583192/jdsbf_ticbgx.jpg', username: 'Perfil 19' },
    { id: '20', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583190/imoluiol_jknybg.jpg', username: 'Perfil 20' },
    { id: '21', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583188/ghgyui_wwawof.jpg', username: 'Perfil 21' },
    { id: '22', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583186/dndgn_tolepl.jpg', username: 'Perfil 22' },
    { id: '23', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583184/djsdkf_tvsv9g.jpg', username: 'Perfil 23' },
    { id: '24', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583182/atn_ujxtax.jpg', username: 'Perfil 24' },
    { id: '25', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583181/5678m657m56im_cigbc4.jpg', username: 'Perfil 25' },
    { id: '26', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583179/567i58m_b1b8si.jpg', username: 'Perfil 26' },
    { id: '27', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583178/68tujol_khb7ap.jpg', username: 'Perfil 27' },
    { id: '28', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583175/67m967m98_zvxrh5.jpg', username: 'Perfil 28' },
    { id: '29', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583174/67_988769_utbg27.jpg', username: 'Perfil 29' },
    { id: '30', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583172/67_986789_zq7isb.jpg', username: 'Perfil 30' },
    
  ];
  const hardcodedMProfiles = [
    { id: '1', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582516/imageedit_31_5184026529_bqxpjh.jpg', username: 'Perfil 1' },
{ id: '2', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582515/imageedit_30_4988893563_sy8ivf.jpg', username: 'Perfil 2' },
{ id: '3', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582514/imageedit_29_9313600849_hfx9xc.jpg', username: 'Perfil 3' },
{ id: '4', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582514/imageedit_28_4923507466_fmhdxm.jpg', username: 'Perfil 4' },
{ id: '5', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582513/imageedit_26_2548659108_jaukfq.jpg', username: 'Perfil 5' },
{ id: '6', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582511/imageedit_25_7158586552_bgz1cc.jpg', username: 'Perfil 6' },
{ id: '7', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582511/imageedit_24_4783160635_gclqhh.jpg', username: 'Perfil 7' },
{ id: '8', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582510/imageedit_23_5185021398_qvjgct.jpg', username: 'Perfil 8' },
{ id: '9', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582509/imageedit_22_6119419467_jcufgh.jpg', username: 'Perfil 9' },
{ id: '10', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582508/imageedit_21_3913570396_r7gfop.jpg', username: 'Perfil 10' },
{ id: '11', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582507/imageedit_20_6206399949_jvotnc.jpg', username: 'Perfil 11' },
{ id: '12', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582506/imageedit_19_7485576075_sbiz7c.jpg', username: 'Perfil 12' },
{ id: '13', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582505/imageedit_18_9075354774_psnfzp.jpg', username: 'Perfil 13' },
{ id: '14', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582505/imageedit_17_7192087263_xy094m.jpg', username: 'Perfil 14' },
{ id: '15', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582504/imageedit_16_7025568960_nhm4lb.jpg', username: 'Perfil 15' },
{ id: '16', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582503/imageedit_15_8073267062_cl66aj.jpg', username: 'Perfil 16' },
{ id: '17', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582502/imageedit_14_4090201950_fpmv9y.jpg', username: 'Perfil 17' },
{ id: '18', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582502/imageedit_13_4645341952_xahwkw.jpg', username: 'Perfil 18' },
{ id: '19', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582501/imageedit_12_3475497061_tw9a2h.jpg', username: 'Perfil 19' },
{ id: '20', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582500/imageedit_11_6468551083_m7wrp9.jpg', username: 'Perfil 20' },
{ id: '21', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582500/imageedit_10_7274450325_wyzvah.jpg', username: 'Perfil 21' },
{ id: '22', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582499/imageedit_9_4085511297_wm2mkx.jpg', username: 'Perfil 22' },
{ id: '23', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582498/imageedit_8_4403484954_enmq2y.jpg', username: 'Perfil 23' },
{ id: '24', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582498/imageedit_7_5387748416_hxdrvn.jpg', username: 'Perfil 24' },
{ id: '25', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582497/imageedit_6_9318120744_rtaf0n.jpg', username: 'Perfil 25' },
{ id: '26', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582496/imageedit_5_3528290959_zica8k.jpg', username: 'Perfil 26' },
{ id: '27', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582496/imageedit_4_9657893512_oabhit.jpg', username: 'Perfil 27' },
{ id: '28', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582496/imageedit_1_2256798367_h7pg2f.jpg', username: 'Perfil 28' },
{ id: '29', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582495/do-sharp_oguncn.jpg', username: 'Perfil 29' },
{ id: '30', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582495/imageedit_3_6459916651_yncsjn.jpg', username: 'Perfil 30' },

  ];
  const hardcodedBProfiles = [
    { id: '1', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583217/8m678_fxmen3.jpg', username: 'Perfil 1' },
    { id: '2', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582505/imageedit_17_7192087263_xy094m.jpg', username: 'Perfil 2' },
    { id: '3', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583203/xfgjxfj_csyr2k.jpg', username: 'Perfil 3' },
    { id: '4', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582514/imageedit_28_4923507466_fmhdxm.jpg', username: 'Perfil 4' },
    { id: '5', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583171/56m8568m_pk76ns.jpg', username: 'Perfil 5' },
    { id: '6', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583211/8.po_m5un_xfmydy.jpg', username: 'Perfil 6' },
    { id: '7', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582514/imageedit_29_9313600849_hfx9xc.jpg', username: 'Perfil 7' },
    { id: '8', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583226/56m85m678_tf2bia.jpg', username: 'Perfil 8' },
    { id: '9', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583435/zngsthaerg_ostl1m.jpg', username: 'Perfil 9' },
    { id: '10', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582506/imageedit_19_7485576075_sbiz7c.jpg', username: 'Perfil 10' },
    { id: '11', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582511/imageedit_25_7158586552_bgz1cc.jpg', username: 'Perfil 11' },
    { id: '12', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583213/5m67856m8_a4y3ld.jpg', username: 'Perfil 12' },
    { id: '13', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583219/9-8.65m4n_ewfdpv.jpg', username: 'Perfil 13' },
    { id: '14', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582504/imageedit_16_7025568960_nhm4lb.jpg', username: 'Perfil 14' },
    { id: '15', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583209/._met_p7hfyy.jpg', username: 'Perfil 15' },
    { id: '16', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583215/5m678567m8_ej0xgj.jpg', username: 'Perfil 16' },
    { id: '17', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582510/imageedit_23_5185021398_qvjgct.jpg', username: 'Perfil 17' },
    { id: '18', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582505/imageedit_18_9075354774_psnfzp.jpg', username: 'Perfil 18' },
    { id: '19', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582516/imageedit_31_5184026529_bqxpjh.jpg', username: 'Perfil 19' },
    { id: '20', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583199/ssgdrgsd_i1smfz.jpg', username: 'Perfil 20' },
    { id: '21', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582508/imageedit_21_3913570396_r7gfop.jpg', username: 'Perfil 21' },
    { id: '22', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582505/imageedit_30_4988893563_sy8ivf.jpg', username: 'Perfil 22' },
    { id: '23', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583201/u_yumtjnrh_jcuu0r.jpg', username: 'Perfil 23' },
    { id: '24', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582513/imageedit_26_2548659108_jaukfq.jpg', username: 'Perfil 24' },
    { id: '25', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583221/9-8.p7o_5mn_d82sbr.jpg', username: 'Perfil 25' },
    { id: '26', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583205/xnfxfjx_psugja.jpg', username: 'Perfil 26' },
    { id: '27', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582507/imageedit_20_6206399949_jvotnc.jpg', username: 'Perfil 27' },
    { id: '28', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744583223/56jhu56u_kopw8v.jpg', username: 'Perfil 28' },
    { id: '29', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582509/imageedit_22_6119419467_jcufgh.jpg', username: 'Perfil 29' },
    { id: '30', profilePicture: 'https://res.cloudinary.com/dped93q3y/image/upload/v1744582511/imageedit_24_4783160635_gclqhh.jpg', username: 'Perfil 30' },
  ];
  

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!currentUser) return;
      
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setCurrentUserData({ id: userSnap.id, ...userSnap.data() } as Profile);
      } else {
        console.error("Usuário não encontrado no Firestore");
      }
    };
  
    fetchCurrentUser();
  }, [currentUser]);

  const fetchLikedProfiles = async () => {
    if (!currentUser || !currentUserData) {
      console.log('⛔ currentUser ou currentUserData estão ausentes');
      return;
    }
  
    const rawReceivedLikes = currentUserData.receivedLikes || [];
  
    if (!Array.isArray(rawReceivedLikes) || rawReceivedLikes.length === 0) {
      console.log("⚠️ Nenhum receivedLike encontrado.");
      setLikedProfiles([]);
      setLoading(false);
      return;
    }
  
    if (currentUserData.accountType === "Free") {
      console.log('🆓 Conta Free - usando perfis hardcoded');
      setIsFreeUser(true); 
      if (currentUserData.preferences === "Female") {
        setLikedProfiles(hardcodedFProfiles);
      } else if (currentUserData.preferences === "Male") {
        setLikedProfiles(hardcodedMProfiles);
      } else if (currentUserData.preferences === "Both") {
        setLikedProfiles(hardcodedBProfiles);
      }
  
      setLoading(false);
      return;
    }
  
    setIsFreeUser(false); // Premium ou Pro
  
    try {
      setLoading(true);
      console.log('🚀 Buscando perfis com base em receivedLikes');
  
      // Limpar os IDs (remover espaços)
      const receivedLikes = rawReceivedLikes.map((id: string) => id.trim());
  
      console.log(`📩 ReceivedLikes (${receivedLikes.length}):`, receivedLikes);
  
      if (receivedLikes.length === 0) {
        console.log('⚠️ Nenhum like recebido ainda');
        setLikedProfiles([]);
        return;
      }
  
      // Pegar perfis de quem te deu like
      const profilesPromises = receivedLikes.map((uid: string) => {
        console.log(`🔍 Buscando user com ID: ${uid}`);
        return getDoc(doc(db, 'users', uid));
      });
  
      const profileDocs = await Promise.all(profilesPromises);
  
      const profiles = profileDocs
        .filter(doc => {
          const exists = doc.exists();
          if (!exists) {
            console.log(`⚠️ Documento com ID ${doc.id} não encontrado.`);
          }
          return exists;
        })
        .map(doc => {
          const data = { id: doc.id, ...doc.data() } as Profile;
          console.log(`✅ Perfil carregado:`, data);
          return data;
        })
        .filter(profile => {
          const alreadyLiked = currentUserData.likes?.includes(profile.id);
          const alreadyDisliked = currentUserData.dislikes?.includes(profile.id);
          const isIncluded = !alreadyLiked && !alreadyDisliked;
  
          console.log(`🧪 Verificando se inclui ${profile.id}: Liked=${alreadyLiked}, Disliked=${alreadyDisliked}, Incluído=${isIncluded}`);
  
          return isIncluded;
        });
  
      console.log(`🎯 Total de perfis finais para mostrar: ${profiles.length}`);
      setLikedProfiles(profiles);
    } catch (error) {
      console.error("❌ Erro ao carregar perfis recebidos:", error);
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    if (currentUser && currentUserData?.accountType) {
      fetchLikedProfiles();
    }
  }, [currentUser, currentUserData]);
  

  const handleLike = async (profileId: string) => {
    if (!currentUser) return;
  
    try {
      // Verifica se já existe um match entre os dois usuários (uma consulta de cada vez)
      const matchQuery1 = query(
        collection(db, 'Matches'),
        where('users', 'array-contains', currentUser.uid),
        where('status', '==', 'ativo') // Garantir que o match esteja ativo
      );
  
      const matchSnap1 = await getDocs(matchQuery1);
      const matchQuery2 = query(
        collection(db, 'Matches'),
        where('users', 'array-contains', profileId),
        where('status', '==', 'ativo') // Garantir que o match esteja ativo
      );
  
      const matchSnap2 = await getDocs(matchQuery2);
  
      // Verifica se já existe um match entre os dois usuários (considera ambos os matchQuery)
      if (!matchSnap1.empty && !matchSnap2.empty) {
        console.log('Já existe um match entre os usuários!');
        return;
      }
  
      // Atualiza o perfil do usuário atual para adicionar um like
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        likes: arrayUnion(profileId), // Adiciona o ID do perfil à lista de likes do usuário
      });
  
      // Verifica se o perfil do outro usuário já tem o ID do usuário atual na lista de likes
      const profileRef = doc(db, 'users', profileId);
      const profileSnap = await getDoc(profileRef); // Usando getDoc para pegar o perfil de outro usuário
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        if (profileData.likes && profileData.likes.includes(currentUser.uid)) {
          // Se ambos deram like, é um match
          const matchRef = await addDoc(collection(db, 'Matches'), {
            users: [currentUser.uid, profileId],
            status: 'ativo',
            createdAt: new Date(),
          });
  
          const matchId = matchRef.id;
  
          // Cria a sala de chat para os usuários do match
          const chatRoomRef = doc(db, 'chatRooms', matchId);
          await setDoc(chatRoomRef, {
            users: [currentUser.uid, profileId],
            messages: [],
            status: 'ativo',
            createdAt: new Date(),
          });
  
          console.log(`💬 Sala de chat criada: ${matchId}`);
  
          // Navega para a tela de chats de match
          navigation.navigate('MatchChats', { matchId });
        }
      }
      await updateDoc(userRef, {
        likes: arrayUnion(profileId),
      });
  
      fetchLikedProfiles();
    } catch (error) {
      console.error("Erro ao dar like:", error);
    }
  };
  
  
  
  

  const handleDislike = async (profileId: string) => {
    if (!currentUser) return;
  
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Remover o perfil da lista de likes
      await updateDoc(userRef, {
        likes: arrayRemove(profileId), // Remove o ID do perfil da lista de likes do usuário
      });
  
      // Adicionar o perfil à lista de dislikes
      
      await updateDoc(userRef, {
        likes: arrayRemove(profileId),
        dislikes: arrayUnion(profileId),
      });
      setLikedProfiles((prev) => prev.filter(profile => profile.id !== profileId));
      
  
      console.log(`Você deu dislike no perfil ${profileId}`);
      
    } catch (error) {
      console.error("Erro ao dar dislike:", error);
    }
  };
  
  
  
  return (
    <View style={styles.container}>
      <Appbar.Header mode="small" style={{ backgroundColor: '#FFF' }}>
        <Appbar.Content title="Lista de Gostos"  titleStyle={{ fontSize: 24, fontWeight: 'bold' }} />
        
      </Appbar.Header>
      <Text style={styles.subtitle}>
        Aqui estão os Perfis que gostam de ti!
        
      </Text>
      

      <View style={styles.separatorContainer}>
        <View style={styles.separator} />
      </View>

      {loading ? (
        <Text style={styles.loadingText}>A carregar likes...</Text>
      ) : likedProfiles.length === 0 ? (
        <View style={styles.noLikesContainer}>
          <Text style={styles.noLikesText}>Você ainda não tem likes.</Text>
          <Image
            source={{uri: 'https://example.com/empty-likes-icon.png'}} 
            style={styles.noLikesImage}
          />
        </View>
      ) : (

        <ScrollView contentContainerStyle={styles.scrollContainer}>
  <View style={styles.profileGrid}>
  {isFreeUser ? (
              <>
                {likedProfiles.map((profile) => (
                  <Card key={profile.id} style={styles.profileCard}>
                    <View>
                      <Card.Cover
                        source={{ uri: profile.profilePicture }}
                        style={styles.profileImage}
                      />
                      <View style={styles.nameOverlay}>
                        <Text style={styles.nameText}>Premium</Text>
                      </View>
                    </View>
                    <View style={styles.buttonContainer}>
              <IconButton
                style={[styles.button, styles.leftButton]}
                icon="close-thick"
                iconColor='#A7C7E7'
                size={25}
                onPress={() => navigation.navigate('ProfilePlan')}
                rippleColor="transparent"
              />
              <View style={styles.buttonSeparator} />
              <IconButton
                style={[styles.button, styles.rightButton]}
                icon="heart"
                iconColor='#A7C7E7'
                size={25}
                onPress={() => navigation.navigate('ProfilePlan')}
                rippleColor="transparent"
              />
            </View>
                  </Card>
                ))}
               
              </>
            ) : (
      likedProfiles.map((profile) => (
        <TouchableOpacity 
          key={profile.id} 
          onPress={() => navigation.navigate('MatchProfile', { userId: profile.id })}
        >
          <Card style={styles.profileCard}>
            <View>
              <Card.Cover source={{ uri: profile.profilePicture }} style={styles.profileImage} />
              <View style={styles.nameOverlay}>
                <Text style={styles.nameText}>{profile.username}</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <IconButton
                style={[styles.button, styles.leftButton]}
                icon="close-thick"
                iconColor='#A7C7E7'
                size={25}
                onPress={() => handleDislike(profile.id)}
                rippleColor="transparent"
              />
              <View style={styles.buttonSeparator} />
              <IconButton
                style={[styles.button, styles.rightButton]}
                icon="heart"
                iconColor='#A7C7E7'
                size={25}
                onPress={() => handleLike(profile.id)}
                rippleColor="transparent"
              />
            </View>
          </Card>
        </TouchableOpacity>
      ))
    )}
  </View>
</ScrollView>

      )}
{isFreeUser && likedProfiles.length > 0 && (
  <TouchableOpacity 
    style={styles.fixedUpgradeButton}
    onPress={() => navigation.navigate('ProfilePlan')}
  >
    <Text style={styles.upgradeButtonText}>Ver Planos</Text>
  </TouchableOpacity>
)}

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

  <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ChatQueue')}>
    <Svg viewBox="0 0 16 16" fill="none" width={30} height={30}>
      <Path
        d="M5 4a1 1 0 000 2h.01a1 1 0 000-2H5zM7 8a1 1 0 011-1h.01a1 1 0 010 2H8a1 1 0 01-1-1zM11.01 10a1 1 0 100 2h.01a1 1 0 100-2h-.01z"
        fill="#696969"
      />
      <Path
        fillRule="evenodd"
        d="M3.25 1A2.25 2.25 0 001 3.25v9.5A2.25 2.25 0 003.25 15h9.5A2.25 2.25 0 0015 12.75v-9.5A2.25 2.25 0 0012.75 1h-9.5zM2.5 3.25a.75.75 0 01.75-.75h9.5a.75.75 0 01.75.75v9.5a.75.75 0 01-.75.75h-9.5a.75.75 0 01-.75-.75v-9.5z"
        clipRule="evenodd"
        fill="#696969"
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

  <TouchableOpacity style={styles.navButtonActive} onPress={() => navigation.navigate('LikeScreen')}>
    <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
        stroke="#FFFFFF"
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
    </View>
  );
};

const styles = StyleSheet.create({
  buttonSeparator: {
    width: 2,
    backgroundColor: '#D3D3D3',
    height: '100%',
    alignSelf: 'center',
  },
  fixedUpgradeButton: {
    position: 'absolute',
    bottom: height * 0.09,
    left: width * 0.57,
    transform: [{ translateX: -(width * 0.25) }],
    backgroundColor: '#A7C7E7',
    paddingVertical: height * 0.017,
    paddingHorizontal: width * 0.07,
    borderRadius: 20,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: width * 0.045,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FFF',
  },
  button: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.01,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  leftButton: {
    borderRadius: 0,
  },
  rightButton: {
    borderRadius: 0,
  },
  profileCard: {
    borderRadius: 10,
    overflow: 'hidden',
    width: width * 0.4,
    height: height * 0.24,
    marginBottom: 20,
  },
  overlayContainer: {
    position: 'relative',
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: height * 0.01,
    alignItems: 'center',
    zIndex: 1,
  },
  nameText: {
    color: '#FFF',
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  profileImage: {
    width: '100%',
    height: height * 0.18,
    borderRadius: 10,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: '#666666',
    textAlign: 'left',
    marginLeft: width * 0.04,
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  separatorContainer: {
    width: '100%',
    height: 2,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  separator: {
    height: 1,
    backgroundColor: '#CCCCCC',
    width: '100%',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: height * 0.012,
    borderTopWidth: 1,
    borderColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navButton: {
    width: '18%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonActive: {
    width: '18%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A7C7E7',
    borderRadius: 30,
    padding: 5,
  },
  navText: {
    fontSize: width * 0.035,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.01,
    paddingBottom: height * 0.15,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '90%',
  },
  usernameText: {
    position: 'absolute',
    bottom: 10,
    color: 'white',
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },
  likeButton: {
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.05,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'black',
  },
  likeButtonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: width * 0.045,
    color: '#333',
  },
  noLikesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noLikesText: {
    fontSize: width * 0.045,
    color: '#333',
    marginBottom: 10,
  },
  noLikesImage: {
    width: width * 0.25,
    height: width * 0.25,
    marginTop: 10,
  },
});

export default LikeScreen;







