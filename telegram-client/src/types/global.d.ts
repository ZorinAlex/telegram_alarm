import { Buffer } from 'buffer';
import { Process } from 'process';
import stream from 'stream-browserify';
import events from 'events';
import os from 'os-browserify';

declare global {
  interface Window {
    Buffer: typeof Buffer;
    process: {
      env: Record<string, string>;
      [key: string]: any;
    };
    global: typeof globalThis;
    os: {
      type: () => string;
      [key: string]: any;
    };
    util: any;
    stream: any;
    events: any;
  }
}

declare module 'stream-browserify' {
  import * as stream from 'stream';
  export = stream;
}

declare module 'os-browserify/browser' {
  const os: {
    type?: () => string;
    platform: () => string;
    arch: () => string;
    release: () => string;
    homedir: () => string;
    tmpdir: () => string;
    endianness: () => string;
    hostname: () => string;
    loadavg: () => number[];
    uptime: () => number;
    freemem: () => number;
    totalmem: () => number;
    cpus: () => any[];
    networkInterfaces: () => any;
    EOL: string;
  };
  export = os;
}

export {}; 