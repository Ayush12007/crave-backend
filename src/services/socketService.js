import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL }
  });

  io.on('connection', (socket) => {
    socket.join('public_queue');
  });
};

export const emitQueueUpdate = (order) => {
  if (io) {
    io.to('public_queue').emit('queue_update', order);
  }
};