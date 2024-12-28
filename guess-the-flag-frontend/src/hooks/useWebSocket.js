import { useEffect } from 'react';
import { createConsumer } from '@rails/actioncable';

export const useWebSocket = ({ sessionCode, onReceived, setWsConnected }) => {
  useEffect(() => {
    if (!sessionCode) return;

    // Create ActionCable consumer
    const consumer = createConsumer('ws://localhost:3000/cable');

    // Subscribe to the game session channel
    const subscription = consumer.subscriptions.create(
      {
        channel: 'GameSessionChannel',
        session_code: sessionCode
      },
      {
        connected() {
          console.log('Connected to WebSocket');
          setWsConnected(true);
        },
        disconnected() {
          console.log('Disconnected from WebSocket');
          setWsConnected(false);
        },
        received(data) {
          console.log('Received data:', data);
          onReceived(data);
        }
      }
    );

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
      consumer.disconnect();
    };
  }, [sessionCode, onReceived, setWsConnected]);

  return {};
}; 