const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp();

const db = admin.firestore();

// Função para emparelhar usuários
exports.matchUsers = functions.firestore
    .document("chatQueue/{userId}")
    .onCreate(async (snap, context) => {
      const newUser = snap.data();
      const userId = snap.id;

      // Verificar se há pelo menos dois usuários na fila
      const querySnapshot = await db.collection("chatQueue")
          .where("status", "==", "waiting")
          .limit(2) // Limita a consulta a 2 usuários
          .get();

      // Se houver menos de 2 usuários, não faz nada
      if (querySnapshot.size < 2) {
        return;
      }

      // Criar uma nova sala para os 2 usuários
      const users = querySnapshot.docs.map((doc) => doc.data());
      const user1 = users[0];
      const user2 = users[1];

      // Criar uma nova sala de chat
      const chatRoomId = `${user1.userId}_${user2.userId}`;
      const chatRoomData = {
        users: [user1.userId, user2.userId],
        status: "open",
        createdAt: new Date().toISOString(),
      };

      // Criar o documento da sala de chat
      await db.collection("chatRooms").doc(chatRoomId).set(chatRoomData);

      // Atualizar os usuários na fila para indicar que estão emparelhados
      await db.collection("chatQueue").doc(user1.userId).update({status: "matched"});
      await db.collection("chatQueue").doc(user2.userId).update({status: "matched"});

      // Remover os usuários da fila
      await db.collection("chatQueue").doc(user1.userId).delete();
      await db.collection("chatQueue").doc(user2.userId).delete();

    // Optional: Notificar os usuários ou redirecioná-los para o chat
    // Aqui você pode implementar um sistema de notificação ou fazer o redirecionamento no seu app React Native
    });
