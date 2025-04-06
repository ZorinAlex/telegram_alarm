import { Buffer } from 'buffer';
import process from 'process';
import util from 'util';
import stream from 'stream-browserify';
import events from 'events';
import os from 'os-browserify/browser';

// Setup global Buffer
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  
  // Create a custom process object with env
  const customProcess = {
    ...process,
    env: process.env || {}
  };
  
  window.process = customProcess;
  window.global = window;

  // Create a custom os object with the type function
  const customOs = {
    ...os,
    type: () => 'Linux'
  };

  // Add custom properties to window
  Object.assign(window, {
    os: customOs,
    util,
    stream,
    events
  });
}

export {
  Buffer,
  process,
  util,
  stream,
  events,
  os
}; 