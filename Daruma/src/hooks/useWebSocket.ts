import { useEffect, useState } from "react";

interface Message {
  text: string;
  from: string;
}

const useWebSocket = (userId: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [partner, setPartner] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("✅ Conectado ao servidor WebSocket");
      socket.send(JSON.stringify({ type: "join_queue", userId }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "matched") {
        setPartner(data.partner);
        console.log(`🔗 Pareado com: ${data.partner}`);
      }

      if (data.type === "receive_message") {
        setMessages((prev) => [...prev, { text: data.message, from: data.from }]);
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [userId]);

  const sendMessage = (message: string) => {
    if (ws && partner) {
      ws.send(JSON.stringify({ type: "send_message", to: partner, from: userId, message }));
      setMessages((prev) => [...prev, { text: message, from: "eu" }]);
    }
  };

  return { messages, sendMessage, partner };
};

export default useWebSocket;
