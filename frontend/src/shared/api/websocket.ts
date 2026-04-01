import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useChatStore } from '@/entities/chat/model/chatStore';
import { useUser } from '@/entities/user/model/useUser';
import { useEffect, useRef } from 'react';

const SOCKET_URL = 'http://localhost:8080/ws';

export function useWebSocket() {
  const { addMessage } = useChatStore();
  const { user: currentUser } = useUser();
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());

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
      
      // Global subscription for all messages for this user
      // This ensures sidebar updates even if chat is not active
      client.subscribe('/user/queue/messages', (message) => {
        const data = JSON.parse(message.body);
        if (data.type === 'message.created') {
          console.log('Global message received:', data.payload);
          addMessage(data.payload);
        }
      });
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
    const topic = `/topic/chats.${chatId}`;
    
    const performSubscribe = () => {
      if (subscriptionsRef.current.has(topic)) return;

      console.log(`Subscribing to chat topic ${topic}`);
      const sub = client!.subscribe(topic, (message) => {
        const data = JSON.parse(message.body);
        if (data.type === 'message.created') {
          addMessage(data.payload);
        }
      });
      subscriptionsRef.current.set(topic, sub);
    };

    if (client && client.connected) {
      performSubscribe();
    } else if (client) {
      const interval = setInterval(() => {
        if (client.connected) {
          performSubscribe();
          clearInterval(interval);
        }
      }, 500);
      return { unsubscribe: () => {
        clearInterval(interval);
        const sub = subscriptionsRef.current.get(topic);
        if (sub) {
          sub.unsubscribe();
          subscriptionsRef.current.delete(topic);
        }
      }};
    }

    return {
      unsubscribe: () => {
        const sub = subscriptionsRef.current.get(topic);
        if (sub) {
          sub.unsubscribe();
          subscriptionsRef.current.delete(topic);
        }
      }
    };
  };

  return { subscribeToChat };
}
