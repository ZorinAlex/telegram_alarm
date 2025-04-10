declare global {
  interface Window {
    Buffer: typeof import('buffer').Buffer;
    global: typeof globalThis;
    process: {
      env: Record<string, string>;
      [key: string]: any;
    };
    os: {
      type(): string;
      [key: string]: any;
    };
    util: typeof import('util');
    stream: any;
    events: typeof import('events');
  }
}

export {}; 