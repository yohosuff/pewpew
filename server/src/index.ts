import { Server } from 'socket.io';
import { createServer } from 'http';
import { EventName } from './event-name';
import { Player } from './player';
import { Vector } from './vector';
import { Settings } from './settings';
import express from 'express';
import { Flag } from './flag';
import { WelcomeDto } from './dtos/welcome-dto';
import { PlayerUpdateDto } from './dtos/player-update-dto';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: Settings.CLIENT,
    methods: ['GET', 'POST'],
  }
});

const players = new Map<string, Player>();
const flag = new Flag();

io.on('connection', socket => {

  console.log('connection', socket.id);

  const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
  const player = new Player(color);
  player.id = socket.id;
  player.socket = socket;
  player.position = new Vector(
    Math.floor(Math.random() * 1000 - 500),
    Math.floor(Math.random() * 1000 - 500),
  );
  players.set(socket.id, player);

  socket.on(EventName.INPUT, input => {
    player.input = input;
  });

  socket.on(EventName.DISCONNECT, () => {
    console.log('disconnect', socket.id);
    const leaver = players.get(socket.id);
    players.delete(leaver.id);
    socket.broadcast.emit(EventName.PLAYER_LEFT, {
      id: leaver.id,
    });
  });

  const welcomeDto = new WelcomeDto(player, flag, players);
  socket.emit(EventName.WELCOME, welcomeDto);

  socket.broadcast.emit(EventName.PLAYER_JOINED, {
    id: player.id,
    position: player.position,
    color: player.color,
  });
});

const port = 3000;
const host = '0.0.0.0';

httpServer.listen(port, host, () => {
  console.log(`listening on ${host}:${port}`);
});

//////////////////////

function getTime() {
  return Number(process.hrtime.bigint() / 1000000n);
}

let previous = getTime();
const tickLength = 1000 / 60;

function loop() {
  const now = getTime();
  const delta = (now - previous) / 1000;
  previous = now;
  update(delta);
  setTimeout(loop, tickLength);
}

function update(delta: number) {
  handleInput();
  updatePositions(delta);
  handleCollisions();
  emitUpdate();
}

function emitUpdate() {
  const playerUpdateDtos = Array.from(players.values()).map(player => {
    const playerUpdateDto = new PlayerUpdateDto();
    playerUpdateDto.id = player.id;
    playerUpdateDto.position = player.position;
    playerUpdateDto.velocity = player.velocity;
    playerUpdateDto.input = player.input;
    return playerUpdateDto;
  });
  io.emit(EventName.UPDATE, playerUpdateDtos);
}

function handleCollisions() {
  const playersArray = Array.from(players.values());

  for (let i = 0; i < playersArray.length - 1; ++i) {
    for (let j = i + 1; j < playersArray.length; ++j) {
      const a = playersArray[i];
      const b = playersArray[j];

      if (!areColliding(a, b)) { continue; }

      collideElastically(a, b);
    }
  }

  for (const player of playersArray) {
    if (!areColliding(player, flag)) { continue; }
    flag.reposition();
    io.emit(EventName.FLAG_UPDATE, flag);
  }
}

// we should use a collidable interface here or something...
function areColliding(a: Player | Flag, b: Player | Flag) {
  const distance = a.position.distanceFrom(b.position);
  return distance <= a.radius + b.radius;
}

function collideElastically(a: Player, b: Player) {
  separateCollidees(a, b);
  const aVelocity = getNewVelocity(a, b);
  const bVelocity = getNewVelocity(b, a);
  a.velocity = aVelocity;
  b.velocity = bVelocity;
}

// https://github.com/OneLoneCoder/videos/blob/master/OneLoneCoder_Balls1.cpp
function separateCollidees(a: Player, b: Player) {
  const distance = a.position.distanceFrom(b.position);
  const overlap = 0.5 * (distance - a.radius - b.radius);
  a.position.x -= overlap * (a.position.x - b.position.x) / distance;
  a.position.y -= overlap * (a.position.y - b.position.y) / distance;
  b.position.x += overlap * (a.position.x - b.position.x) / distance;
  b.position.y += overlap * (a.position.y - b.position.y) / distance;
}

// https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
function getNewVelocity(a: Player, b: Player) {
  const mass = 2 * b.mass / (a.mass + b.mass);
  const velocityDiff = a.velocity.subtract(b.velocity);
  const positionDiff = a.position.subtract(b.position);
  const dotProduct = velocityDiff.dotProduct(positionDiff);
  const magnitude = Math.pow(positionDiff.magnitude, 2);
  const rightSide = positionDiff.multiplyByScalar(mass * dotProduct / magnitude)
  return a.velocity.subtract(rightSide);
}

function updatePositions(delta: number) {
  Array.from(players.values()).forEach(player => {
    player.velocity.x += player.acceleration.x * delta;
    player.velocity.y += player.acceleration.y * delta;
    player.position.x += player.velocity.x * delta;
    player.position.y += player.velocity.y * delta;
  });
}

function handleInput() {
  Array.from(players.values()).forEach(player => {
    const input = player.input;

    const acceleration = new Vector(0, 0);

    if (input.up) {
      acceleration.y -= player.speed;
    }

    if (input.down) {
      acceleration.y += player.speed;
    }

    if (input.left) {
      acceleration.x -= player.speed;
    }
    
    if (input.right) {
      acceleration.x += player.speed;
    }

    player.acceleration = acceleration;
  });
}

loop();
