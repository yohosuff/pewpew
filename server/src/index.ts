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
import { FlagCapturedDto } from './dtos/flag-captured-dto';
import { Wall } from './wall';

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

const wallLength = 5000;
const wallWidth = 100;
const wallColor = 'red';
const walls: Wall[] = [
  new Wall(new Vector(-wallLength, 0), new Vector(wallWidth, wallLength + wallWidth), wallColor),
  new Wall(new Vector(wallLength, 0), new Vector(wallWidth, wallLength + wallWidth), wallColor),
  new Wall(new Vector(0, wallLength), new Vector(wallLength + wallWidth, wallWidth), wallColor),
  new Wall(new Vector(0, -wallLength), new Vector(wallLength + wallWidth, wallWidth), wallColor),
];

io.on('connection', socket => {

  console.log('connection', socket.id);
  
  const player = new Player(socket);
  players.set(player.id, player);

  socket.on(EventName.CHANGE_NAME, name => {
    player.name = name;
    io.emit(EventName.PLAYER_NAME_CHANGE, player.nameChangeDto());
  });

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
  
  const welcome = new WelcomeDto();
  welcome.id = player.id;
  welcome.flag = flag;
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
    playerUpdateDto.color = player.color;
    return playerUpdateDto;
  });
  io.emit(EventName.UPDATE, playerUpdateDtos);
}

function handleCollisions() {
  const playersArray = Array.from(players.values());

  //player <> player
  for (let i = 0; i < playersArray.length - 1; ++i) {
    for (let j = i + 1; j < playersArray.length; ++j) {
      const a = playersArray[i];
      const b = playersArray[j];
      if (!areColliding(a, b)) { continue; }
      collideElastically(a, b);
    }
  }

  //player <> flag
  for (const player of playersArray) {
    if (!areColliding(player, flag)) { continue; }
    player.score += 1;
    flag.reposition();
    io.emit(EventName.FLAG_CAPTURED, {
      flag,
      playerId: player.id,
      playerScore: player.score,
    } as FlagCapturedDto);
  }

  // player <> wall
  // https://learnopengl.com/In-Practice/2D-Game/Collisions/Collision-detection
  // https://learnopengl.com/In-Practice/2D-Game/Collisions/Collision-resolution
  for(const player of playersArray) {
    for(const wall of walls) {
      const collision = detectCircleRectangleCollision(player, wall);
      if(collision.colliding) {
        resolveCircleRectangleCollision(player, collision);
      }
    }
  }
}

// this approach doesn't work very well when colliding with the corners of the rectangle
// there is a very noticable 'jump' when the player snaps to whichever side of the wall was deemed to have been hit
function resolveCircleRectangleCollision(player: Player, collision: { colliding: boolean; closestPoint: Vector; playerToClosestPointDisplacement: Vector; }) {
  const direction = getDirection(collision.playerToClosestPointDisplacement);
  
  if(direction === 'left' || direction === 'right') {
    player.velocity.x = -player.velocity.x;
    const penetration = player.radius - Math.abs(collision.playerToClosestPointDisplacement.x);
    if(direction === 'left') {
      player.position.x += penetration;
    } else {
      player.position.x -= penetration;
    }
  } else {
    player.velocity.y = -player.velocity.y;
    const penetration = player.radius - Math.abs(collision.playerToClosestPointDisplacement.y);
    if(direction === 'up') {
      player.position.y += penetration;
    } else {
      player.position.y -= penetration;
    }
  }
}

function getDirection(displacement: Vector) {
  const displacementNormalized = displacement.getUnitVector();
  const compass = [
    { unitVector: new Vector( 0, -1), direction: 'up' },
    { unitVector: new Vector( 0,  1), direction: 'down' },
    { unitVector: new Vector(-1,  0), direction: 'left' },
    { unitVector: new Vector( 1,  0), direction: 'right' },
  ];
  
  let max = 0;
  let bestMatch = -1;

  for(let i = 0; i < compass.length; ++i) {
    const dotProduct = displacementNormalized.dotProduct(compass[i].unitVector);
    
    // this condition will never be true if the circle center is inside the bounds of the AABB
    // should only be a problem if the player moves really fast
    if(dotProduct > max) {
      max = dotProduct;
      bestMatch = i;
    }
  }

  // this is ugly but will prevent the server from crashing
  if(bestMatch === -1) {
    return 'up';
  }
  
  return compass[bestMatch].direction;
}

//https://gamedev.stackexchange.com/a/178154/151167
//https://learnopengl.com/In-Practice/2D-Game/Collisions/Collision-Detection
function detectCircleRectangleCollision(player: Player, wall: Wall) {
  const wallToPlayerDisplacement = player.position.subtract(wall.position);
  const wallToPlayerDisplacementClamped = wallToPlayerDisplacement.clamp(wall.bounds.negative, wall.bounds);
  const closestPoint = wall.position.add(wallToPlayerDisplacementClamped);
  const playerToClosestPointDisplacement = closestPoint.subtract(player.position); //aka "difference"
  const colliding = playerToClosestPointDisplacement.magnitude <= player.radius;
  return { 
    colliding,
    closestPoint,
    playerToClosestPointDisplacement,
  };
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
