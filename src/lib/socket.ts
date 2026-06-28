import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyToken, JWTPayload } from './auth';

let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return io;
}

export function initSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    const user = verifyToken(token);
    if (!user) {
      return next(new Error('Invalid token'));
    }
    (socket as any).user = user;
    next();
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user as JWTPayload;

    socket.join(`user:${user.id}`);

    socket.on('join:conversation', ({ userId }: { userId: number }) => {
      const roomId = [user.id, userId].sort().join(':');
      socket.join(`chat:${roomId}`);
    });

    socket.on(
      'message:send',
      (data: { receiverId: number; productId?: number; message: string }) => {
        const roomId = [user.id, data.receiverId].sort().join(':');
        const messageData = {
          senderId: user.id,
          senderName: user.name,
          receiverId: data.receiverId,
          productId: data.productId,
          message: data.message,
          createdAt: new Date().toISOString(),
        };
        io?.to(`chat:${roomId}`).emit('message:received', messageData);
        io?.to(`user:${data.receiverId}`).emit('notification:new', {
          type: 'message',
          message: `New message from ${user.name}`,
        });
      }
    );

    socket.on('disconnect', () => {});
  });

  return io;
}
