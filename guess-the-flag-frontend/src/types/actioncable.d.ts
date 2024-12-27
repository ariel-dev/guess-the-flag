declare module '@rails/actioncable' {
  interface Consumer {
    subscriptions: any;
    connect(): void;
    disconnect(): void;
    ensureActiveConnection(): void;
  }

  interface Subscription {
    perform(action: string, data?: object): void;
    send(data: object): void;
    unsubscribe(): void;
  }

  export function createConsumer(url?: string): Consumer;
  export function logger(level: string, message: string): void;
} 