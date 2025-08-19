import { io, Socket } from 'socket.io-client';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

export const socket: Socket = io(API_BASE, {
  autoConnect: true,
  transports: ['websocket']
});

export function waitForConnected(): Promise<void> {
  return new Promise((resolve) => {
    if (socket.connected) return resolve();
    const onConnect = () => {
      socket.off('connect', onConnect);
      resolve();
    };
    socket.on('connect', onConnect);
  });
}



