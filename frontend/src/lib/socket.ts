import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (tenantId: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_API_URL, {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('WebSocket connected:', socket?.id);
    socket?.emit('join-tenant', tenantId);
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};