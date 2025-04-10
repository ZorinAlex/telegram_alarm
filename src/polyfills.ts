// The polyfills are now handled by vite-plugin-node-polyfills
// This file is kept for type declarations
/// <reference types="node" />

import { Buffer } from 'buffer';
import process from 'process';
import util from 'util';
import stream from 'stream-browserify';
import events from 'events';
import os from 'os-browserify/browser';

// Setup global Buffer
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  window.process = process;
  window.global = window;

  // Create a custom os object with the type function
  const customOs = {
    ...os,
    type: () => 'Linux'
  };

  // @ts-ignore - Adding custom properties to window
  window.os = customOs;
  // @ts-ignore - Adding custom properties to window
  window.util = util;
  // @ts-ignore - Adding custom properties to window
  window.stream = stream;
  // @ts-ignore - Adding custom properties to window
  window.events = events;
}

export default {
  Buffer,
  process,
  util,
  stream,
  events,
  os: {
    ...os,
    type: () => 'Linux'
  }
};

declare global {
    interface Window {
        Buffer: typeof Buffer;
        global: typeof globalThis;
        process: {
            env: Record<string, string>;
            [key: string]: any;
        };
    }
}

export {}; 