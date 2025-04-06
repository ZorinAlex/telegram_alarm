declare module 'stream-browserify' {
  import { Stream } from 'stream';
  export = Stream;
}

declare module 'os-browserify/browser' {
  interface OS {
    type(): string;
    [key: string]: any;
  }
  const os: OS;
  export = os;
}

declare module 'buffer' {
  export { Buffer } from 'buffer';
}

declare module 'process' {
  namespace NodeJS {
    interface Process {
      env: Record<string, string>;
      [key: string]: any;
    }
  }
  const process: NodeJS.Process;
  export = process;
} 