import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Redis from "ioredis";
import admin from "firebase-admin";
import dotenv from "dotenv";

// 🔥 Configurar Variáveis de Ambiente
dotenv.config();

// 🔥 Inicializar Firebase
const serviceAccount = require("./serviceAccountKey.json"); // Baixa isso do Firebase Console
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://teuprojeto.firebaseio.com",
});
const db = admin.firestore();

// 🔥 Configurar Redis
const redis = new Redis();

// 🔥 Criar o servidor HTTP e WebSocket
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// 🔥 Armazena conexões ativas
const users: Map<string, WebSocket> = new Map();

wss.on("connection", (ws: WebSocket) => {
  console.log("🔗 Novo usuário conectado");

  ws.on("message", async (message: string) => {
    const data = JSON.parse(message);

    if (data.type === "join_queue") {
      console.log(`✅ Usuário ${data.userId} entrou na fila`);
      await redis.lpush("queue", data.userId); // Adiciona o usuário na fila
      users.set(data.userId, ws);
      matchUsers();
    }

    if (data.type === "send_message") {
      const { to, from, message } = data;
      if (users.has(to)) {
        users.get(to)?.send(JSON.stringify({ type: "receive_message", from, message }));
      }
      // 🔥 Salva a mensagem no Firebase
      await db.collection("chats").add({ from, to, message, timestamp: Date.now() });
    }
  });

  ws.on("close", () => {
    console.log("❌ Usuário desconectado");
  });
});

// 🔄 Função para parear usuários
async function matchUsers() {
  const user1 = await redis.rpop("queue");
  const user2 = await redis.rpop("queue");

  if (user1 && user2) {
    console.log(`🔗 Pareando ${user1} com ${user2}`);
    users.get(user1)?.send(JSON.stringify({ type: "matched", partner: user2 }));
    users.get(user2)?.send(JSON.stringify({ type: "matched", partner: user1 }));
  }
}

// 🔥 Iniciar Servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));