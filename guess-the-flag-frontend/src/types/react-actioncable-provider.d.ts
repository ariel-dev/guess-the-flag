declare module 'react-actioncable-provider' {
  import { ComponentType, Component } from 'react';
  
  const ActionCableProvider: ComponentType<{ url: string; children?: React.ReactNode }>;
  export default ActionCableProvider;
  
  export const ActionCableConsumer: ComponentType<{
    channel: {
      channel: string;
      [key: string]: any;
    };
    onReceived: (data: any) => void;
  }>;
} 