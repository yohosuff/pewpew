//fun idea: fly around and shoot missiles at each otherr
//turret auto targets, can cycle targets, missiles track target, firing has cooldown?
//get multiplayer going with socket.io
//add button to enable ai with steering behavior to hit other players

import './index.css';

import { Camera } from './camera';
import { Input } from './input';
import { Player } from "./player";
import { Vector } from "./vector";

function update(progress: number) {
    handleInput();
    updatePositions(progress);
    handleCollisions();
}

function handleInput() {
    if (input.up) {
        player1.acceleration.y = -player1.speed;
    } else if (input.down) {
        player1.acceleration.y = player1.speed;
    } else {
        player1.acceleration.y = 0;
    }

    if (input.left) {
        player1.acceleration.x = -player1.speed;
    } else if (input.right) {
        player1.acceleration.x = player1.speed;
    } else {
        player1.acceleration.x = 0;
    }
}

function updatePositions(progress: number) {
    const delta = progress / 1000;

    const moveables = [
        player1,
        player2,
    ];

    moveables.forEach(moveable => {
        moveable.velocity.x += moveable.acceleration.x * delta;
        moveable.velocity.y += moveable.acceleration.y * delta;
        moveable.position.x += moveable.velocity.x * delta;
        moveable.position.y += moveable.velocity.y * delta;    
    });

    camera.follow(player1);
}

function getDistanceBetweenPoints(a: Vector, b: Vector) {
    const distanceX = a.x - b.x;
    const distanceY = a.y - b.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    return distance;
}

function handleCollisions() {
    const collidables = [
        player1,
        player2
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
        player1,
        player2,
    ];

    drawables.forEach(drawable => {
        drawable.draw(context, camera);
    });
}

function loop(timestamp: number) {
    const progress = timestamp - lastRender;
    update(progress);
    draw();
    lastRender = timestamp;
    window.requestAnimationFrame(loop);
}

function keydown(event: KeyboardEvent) {
    switch(event.code) {
        case 'KeyW': input.up = true; break;
        case 'KeyS': input.down = true; break;
        case 'KeyA': input.left = true; break;
        case 'KeyD': input.right = true; break;
    }
}

function keyup(event: KeyboardEvent) {
    switch(event.code) {
        case 'KeyW': input.up = false; break;
        case 'KeyS': input.down = false; break;
        case 'KeyA': input.left = false; break;
        case 'KeyD': input.right = false; break;
    }
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

const camera = new Camera();
const player1 = new Player('red');
const player2 = new Player('teal');

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

player2.position.y = player1.position.y;
player2.position.x = player1.position.x + player1.radius * 4;

camera.follow(player1);

const input = new Input();

const canvas = document.createElement('canvas');

document.body.appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext('2d');

let lastRender = 0;
window.requestAnimationFrame(loop);

window.addEventListener('keydown', keydown);
window.addEventListener('keyup', keyup);
window.addEventListener('resize', resize);

