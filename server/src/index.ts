import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

import { EventName } from './event-name';
import { Player } from './player';
import { Settings } from './settings';
import { Flag } from './flag';
import { Wall } from './wall';
import { WelcomeDto } from './dtos/welcome-dto';
import { FlagCapturedDto } from './dtos/flag-captured-dto';
import { FrameUpdateDto } from './dtos/frame-update-dto';
import Matter from 'matter-js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: Settings.CLIENT,
    methods: ['GET', 'POST'],
  }
});

const engine = Matter.Engine.create();
engine.gravity.x = 0;
engine.gravity.y = 0;

const playersByBodyId = new Map<number, Player>();
const players = new Map<string, Player>();

const length = 1000;

const walls = createBoundaryWalls(length, 20, 'red');
walls.forEach(wall => Matter.Composite.add(engine.world, wall.body));

const flag = new Flag(length);
Matter.Composite.add(engine.world, flag.body);

io.on('connection', socket => {

  console.log('connection', socket.id);
  
  const player = new Player(socket);
  players.set(player.id, player);
  playersByBodyId.set(player.body.id, player);

  Matter.Composite.add(engine.world, player.body);
  
  socket.on(EventName.CHANGE_NAME, name => {
    player.name = name;
    io.emit(EventName.PLAYER_UPDATE, player.dto());
  });

  socket.on(EventName.INPUT, input => {
    player.input = input;
  });

  socket.on(EventName.DISCONNECT, () => {
    console.log('disconnect', socket.id);
    const leaver = players.get(socket.id);
    Matter.Composite.remove(engine.world, leaver.body);
    players.delete(leaver.id);
    playersByBodyId.delete(leaver.body.id);
    socket.broadcast.emit(EventName.PLAYER_LEFT, {
      id: leaver.id,
    });
  });
  
  const welcome = new WelcomeDto();
  welcome.id = player.id;
  welcome.flag = flag.dto();
  welcome.players = Array.from(players.values()).map(player => player.dto());
  welcome.walls = walls.map(wall => wall.dto());
  socket.emit(EventName.WELCOME, welcome);

  socket.broadcast.emit(EventName.PLAYER_JOINED, player.dto());
});

const port = 3000;
const host = '0.0.0.0';

httpServer.listen(port, host, () => {
  console.log(`listening on ${host}:${port}`);
});

//////////////////////

const tickLength = 1000 / 30;

function loop() {
  handleInput();
  Matter.Engine.update(engine, tickLength);
  emitFrameUpdate();
  setTimeout(loop, tickLength);
}

function emitFrameUpdate() {
  const dto = new FrameUpdateDto();
  
  dto.players = Array
    .from(players.values())
    .map(player => player.frameUpdateDto());

  io.emit(EventName.FRAME_UPDATE, dto);
}

Matter.Events.on(engine, "collisionStart", event => {
  event.pairs.forEach(pair => {
    handlePlayerFlagCollision(pair);
  });
});

function handlePlayerFlagCollision(pair: Matter.IPair) {
  if (pair.bodyA !== flag.body && pair.bodyB !== flag.body) {
    return;
  }

  const bodyId = pair.bodyA === flag.body ? pair.bodyB.id : pair.bodyA.id;
  const player = playersByBodyId.get(bodyId);

  if (!player) {
    return;
  }

  player.score += 1;
  flag.reposition();

  const flagCapturedDto: FlagCapturedDto = {
    flag: flag.dto(),
    playerId: player.id,
    playerScore: player.score,
  };

  io.emit(EventName.FLAG_CAPTURED, flagCapturedDto);
}

function handleInput() {
  Array.from(players.values()).forEach(player => {
    const input = player.input;
    const force = Matter.Vector.create();

    if (input.up) {
      force.y -= player.speed;
    }

    if (input.down) {
      force.y += player.speed;
    }

    if (input.left) {
      force.x -= player.speed;
    }
    
    if (input.right) {
      force.x += player.speed;
    }

    Matter.Body.applyForce(player.body, player.body.position, force);
  });
}

function createBoundaryWalls(length: number, width: number, color: string) {
  const walls: Wall[] = [
    new Wall(-length / 2, 0, width, length + width, color), //left
    new Wall(length / 2, 0, width, length + width, color), //right
    new Wall(0, -length / 2, length + width, width, color), //top
    new Wall(0, length / 2, length + width, width, color), //bottom
  ];

  return walls;
}

// is this still needed?
//Matter.Runner.run(engine); //how can I hook into this to send frame updates to clients?

loop();
