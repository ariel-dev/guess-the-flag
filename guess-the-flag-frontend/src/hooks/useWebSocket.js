import { useEffect, useRef } from 'react';
import { createConsumer } from '@rails/actioncable';

// Create a single consumer instance that will be reused
const consumer = createConsumer(import.meta.env.VITE_WS_URL);

export const useWebSocket = ({ sessionCode, onReceived, setWsConnected }) => {
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!sessionCode) return;

    // Only create a new subscription if we don't have one or if the session code changed
    if (!subscriptionRef.current) {
      console.log('Creating new WebSocket subscription');
      subscriptionRef.current = consumer.subscriptions.create(
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
    }

    // Cleanup on unmount or session code change
    return () => {
      if (subscriptionRef.current) {
        console.log('Cleaning up WebSocket subscription');
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [sessionCode, onReceived, setWsConnected]);

  return {};
}; 