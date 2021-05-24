//fun idea: fly around and shoot missiles at each otherr
//turret auto targets, can cycle targets, missiles track target, firing has cooldown?
//get multiplayer going with socket.io
//add button to enable ai with steering behavior to hit other players

import './index.css';

import { Camera } from './camera';
import { Input } from './input';
import { Player } from "./player";
import { Vector } from "./vector";
import { EventName } from '../../server/src/event-name';
import { io } from 'socket.io-client';

function handleInput() {
    if (input.up) {
        me.acceleration.y = -me.speed;
    } else if (input.down) {
        me.acceleration.y = me.speed;
    } else {
        me.acceleration.y = 0;
    }

    if (input.left) {
        me.acceleration.x = -me.speed;
    } else if (input.right) {
        me.acceleration.x = me.speed;
    } else {
        me.acceleration.x = 0;
    }
}

function updatePositions(delta: number) {
    const moveables = [
        ...Array.from(players.values()),
    ];

    moveables.forEach(moveable => {
        moveable.velocity.x += moveable.acceleration.x * delta;
        moveable.velocity.y += moveable.acceleration.y * delta;
        moveable.position.x += moveable.velocity.x * delta;
        moveable.position.y += moveable.velocity.y * delta;
    });

    camera.follow(me);
}

function getDistanceBetweenPoints(a: Vector, b: Vector) {
    const distanceX = a.x - b.x;
    const distanceY = a.y - b.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    return distance;
}

function handleCollisions() {
    const collidables = [
        ...Array.from(players.values()),
    ];

    for(let i = 0; i < collidables.length - 1; ++i) {
        for(let j = i + 1; j < collidables.length; ++j) {
            const a = collidables[i];
            const b = collidables[j];
            
            if (!areColliding(a, b)) {
                continue;
            }

            collideElastically(a, b);
        }
    }
}

function areColliding(a: Player, b: Player) {
    const distance = getDistanceBetweenPoints(a.position, b.position);
    return distance <= a.radius + b.radius;
}

function collideElastically(a: Player, b: Player) {
    separateCollidees(a, b);
    const aVelocity = getNewVelocity(a, b);
    const bVelocity = getNewVelocity(b, a);
    a.velocity = aVelocity;
    b.velocity = bVelocity;
}

//https://github.com/OneLoneCoder/videos/blob/master/OneLoneCoder_Balls1.cpp
function separateCollidees(a: Player, b: Player) {
    const distance = getDistanceBetweenPoints(a.position, b.position);
    const overlap = 0.5 * (distance - a.radius - b.radius);
    a.position.x -= overlap * (a.position.x - b.position.x) / distance;
    a.position.y -= overlap * (a.position.y - b.position.y) / distance;
    b.position.x += overlap * (a.position.x - b.position.x) / distance;
    b.position.y += overlap * (a.position.y - b.position.y) / distance;
}

//https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
function getNewVelocity(a: Player, b: Player) {
    const mass = 2 * b.mass / (a.mass + b.mass);
    const velocityDiff = a.velocity.subtract(b.velocity);
    const positionDiff = a.position.subtract(b.position);
    const dotProduct = velocityDiff.dotProduct(positionDiff);
    const magnitude = Math.pow(positionDiff.magnitude, 2);
    const rightSide = positionDiff.multiplyByScalar(mass * dotProduct / magnitude)
    return a.velocity.subtract(rightSide);
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const drawables = [
        boundary,
        ...Array.from(players.values()),
    ];

    drawables.forEach(drawable => {
        drawable.draw(context, camera);
    });
}

function loop(now: number) {
    const delta = (now - previous) / 1000;
    update(delta);
    previous = now;
    window.requestAnimationFrame(loop);
}

function update(delta: number) {
    handleInput();
    updatePositions(delta);
    handleCollisions();
    draw();
}

function keydown(event: KeyboardEvent) {
    switch(event.code) {
        case 'KeyW': input.up = true; break;
        case 'KeyS': input.down = true; break;
        case 'KeyA': input.left = true; break;
        case 'KeyD': input.right = true; break;
    }

    socket.emit(EventName.INPUT, input);
}

function keyup(event: KeyboardEvent) {
    switch(event.code) {
        case 'KeyW': input.up = false; break;
        case 'KeyS': input.down = false; break;
        case 'KeyA': input.left = false; break;
        case 'KeyD': input.right = false; break;
    }

    socket.emit(EventName.INPUT, input);
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

const camera = new Camera();


const boundary = {
    radius: 500,
    color: 'blue',
    position: new Vector(0,0),
    draw: function(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(
            this.position.x - (camera.position.x - window.innerWidth / 2), 
            this.position.y - (camera.position.y - window.innerHeight / 2),
            this.radius,
            0,
            2 * Math.PI
        );
        context.fill();
    },
};

const players = new Map<string, Player>();
const input = new Input();
const canvas = document.createElement('canvas');

document.body.appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext('2d');

let previous = 0;

//disabling for now as server will send updates
//it plays pretty good locally, but it will probably start to suck over the internet
//window.requestAnimationFrame(loop);

window.addEventListener('keydown', keydown); //this should only fire once....
window.addEventListener('keyup', keyup);
window.addEventListener('resize', resize);

const socket = initializeSocket();

draw();

let me: Player;

function initializeSocket() {
    const socket = io('http://localhost:3000');

    socket.on(EventName.WELCOME, welcome => {
        
        me = new Player('red');
        me.id = welcome.id;
        players.set(me.id, me);

        welcome.players.forEach((updatedPlayer: any) => {
            const player = players.get(updatedPlayer.id);
            if(player) {
                player.position = updatedPlayer.position;
            } else {
                const newPlayer = new Player('red');
                newPlayer.id = updatedPlayer.id;
                players.set(newPlayer.id, newPlayer);
            }
        });

        camera.follow(me);
        draw();

        socket.on(EventName.UPDATE, (updatedPlayers: any[]) => {
            updatedPlayers.forEach(updatedPlayer => {
                const player = players.get(updatedPlayer.id);
                if(!player) {
                    return;
                }
                player.position = updatedPlayer.position;
            });
            camera.follow(me);
            draw();
        });

        socket.on(EventName.PLAYER_JOINED, joinedPlayer => {
            console.log('player joined', joinedPlayer.id)
            const newPlayer = new Player('red');
            newPlayer.id = joinedPlayer.id;
            players.set(newPlayer.id, newPlayer);
            draw();
        });

        socket.on(EventName.PLAYER_LEFT, leftPlayer => {
            console.log('player left', leftPlayer.id);
            players.delete(leftPlayer.id);
            draw();
        });
    });

    return socket;
}
