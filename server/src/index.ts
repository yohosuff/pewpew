import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { EventName } from './event-name';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
});

const players = new Map<string, any>();

io.on('connection', socket => {

  const player = {
    id: socket.id,
    socket,
  };

  players.set(socket.id, player);

  socket.on(EventName.INPUT, input => {

  });

  socket.on(EventName.DISCONNECT, () => {
    const leaver = players.get(socket.id);
    players.delete(leaver.id);
  });
});

const port = 3000;
const host = '0.0.0.0';

httpServer.listen(port, host, () => {
  console.log(`listening on ${host}:${port}`);
});
