const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const JWT_SECRET = process.env.JWT_SECRET || 'rent-marketplace-secret-key-2026';

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const user = jwt.verify(token, JWT_SECRET);
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`User connected: ${user.name} (${user.id})`);

    socket.join(`user:${user.id}`);

    socket.on('join:conversation', ({ userId }) => {
      const roomId = [user.id, userId].sort().join(':');
      socket.join(`chat:${roomId}`);
    });

    socket.on('message:send', (data) => {
      const roomId = [user.id, data.receiverId].sort().join(':');
      const messageData = {
        senderId: user.id,
        senderName: user.name,
        receiverId: data.receiverId,
        productId: data.productId || null,
        message: data.message,
        createdAt: new Date().toISOString(),
      };
      io.to(`chat:${roomId}`).emit('message:received', messageData);
      io.to(`user:${data.receiverId}`).emit('notification:new', {
        type: 'message',
        message: `New message from ${user.name}`,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.name}`);
    });
  });

  const PORT = parseInt(process.env.PORT || '3000', 10);
  server.listen(PORT, () => {
    console.log(`> Server ready on http://localhost:${PORT}`);
  });
});
