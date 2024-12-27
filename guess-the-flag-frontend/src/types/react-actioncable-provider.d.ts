declare module 'react-actioncable-provider' {
  interface ActionCableProviderProps {
    children: React.ReactNode;
    cable: any;
  }

  interface ActionCableConsumerProps {
    channel: { channel: string; [key: string]: any };
    onReceived: (data: any) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
    onRejected?: () => void;
  }

  export class ActionCableProvider extends React.Component<ActionCableProviderProps> {}
  export class ActionCableConsumer extends React.Component<ActionCableConsumerProps> {}
} 