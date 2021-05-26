//fun idea: fly around and shoot missiles at each otherr
//turret auto targets, can cycle targets, missiles track target, firing has cooldown?
//add button to enable ai with steering behavior to hit other players

import './index.css';

import { Camera } from './camera';
import { Input } from './input';
import { Player } from "./player";
import { Vector } from "./vector";
import { EventName } from '../../server/src/event-name';
import { io } from 'socket.io-client';

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
            this.radius, 0, 2 * Math.PI
        );
        context.fill();
    },
};

const players = new Map<string, Player>();
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');
const socket = initializeSocket();
const input = new Input();

input.inputChange.subscribe(input => {
    socket.emit(EventName.INPUT, input);
});

let me: Player;

window.addEventListener('resize', resize);

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
            console.log(`player ${joinedPlayer.id} joined`);
            const newPlayer = new Player('red');
            newPlayer.id = joinedPlayer.id;
            players.set(newPlayer.id, newPlayer);
            draw();
        });

        socket.on(EventName.PLAYER_LEFT, leftPlayer => {
            console.log(`player ${leftPlayer.id} left`);
            players.delete(leftPlayer.id);
            draw();
        });
    });

    return socket;
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

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
