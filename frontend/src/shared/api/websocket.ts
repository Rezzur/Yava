import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useChatStore } from '@/entities/chat/model/chatStore';
import { useEffect, useRef } from 'react';

const SOCKET_URL = 'http://localhost:8080/ws';

export function useWebSocket() {
  const { addMessage, updateChatLastMessage } = useChatStore();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('yavimax_token');
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${SOCKET_URL}?token=${token}`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log('Connected to WebSocket');
      
      // Subscribe to user personal notifications/messages if needed
      // For now, subscriptions are usually per-chat, but we can subscribe to all user chats
      // Or a general topic for new chats
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const subscribeToChat = (chatId: number) => {
    if (!clientRef.current || !clientRef.current.connected) return;

    return clientRef.current.subscribe(`/topic/chats.${chatId}`, (message) => {
      const data = JSON.parse(message.body);
      if (data.type === 'message.created') {
        const msg = data.payload;
        addMessage(msg);
        updateChatLastMessage(chatId, msg.text, msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  return { subscribeToChat };
}
