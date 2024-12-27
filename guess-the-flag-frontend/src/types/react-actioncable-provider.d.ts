declare module 'react-actioncable-provider' {
  import { Component } from 'react';
  
  export class ActionCableConsumer extends Component<{
    channel: {
      channel: string;
      [key: string]: any;
    };
    onReceived: (data: any) => void;
  }> {}
} 