import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useChatStore } from '@/entities/chat/model/chatStore';
import { useEffect, useRef } from 'react';

const SOCKET_URL = 'http://localhost:8080/ws';

export function useWebSocket() {
  const { addMessage } = useChatStore();
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<number, StompSubscription>>(new Map());

  useEffect(() => {
    const token = localStorage.getItem('yavimax_token');
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${SOCKET_URL}?token=${token}`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('WebSocket Connected');
      // If we had a pending subscription, we could do it here
    };

    client.activate();
    clientRef.current = client;

    return () => {
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      client.deactivate();
    };
  }, []);

  const subscribeToChat = (chatId: number) => {
    const client = clientRef.current;
    
    // Logic to handle subscription even if not connected yet
    const performSubscribe = () => {
      if (subscriptionsRef.current.has(chatId)) return;

      console.log(`Subscribing to chat ${chatId}`);
      const sub = client!.subscribe(`/topic/chats.${chatId}`, (message) => {
        const data = JSON.parse(message.body);
        if (data.type === 'message.created') {
          addMessage(data.payload);
        }
      });
      subscriptionsRef.current.set(chatId, sub);
    };

    if (client && client.connected) {
      performSubscribe();
    } else if (client) {
      // Polling or waiting for connection
      const interval = setInterval(() => {
        if (client.connected) {
          performSubscribe();
          clearInterval(interval);
        }
      }, 500);
      return { unsubscribe: () => {
        clearInterval(interval);
        const sub = subscriptionsRef.current.get(chatId);
        if (sub) {
          sub.unsubscribe();
          subscriptionsRef.current.delete(chatId);
        }
      }};
    }

    return {
      unsubscribe: () => {
        const sub = subscriptionsRef.current.get(chatId);
        if (sub) {
          sub.unsubscribe();
          subscriptionsRef.current.delete(chatId);
        }
      }
    };
  };

  return { subscribeToChat };
}
