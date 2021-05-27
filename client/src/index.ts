//fun idea: fly around and shoot missiles at each otherr
//turret auto targets, can cycle targets, missiles track target, firing has cooldown?
//add button to enable ai with steering behavior to hit other players

import './index.css';

import { Camera } from './camera';
import { Input } from './input';
import { Player } from "./player";
import { EventName } from '../../server/src/event-name';
import { io } from 'socket.io-client';
import { Settings } from './settings';
import { Star } from './star';

const camera = new Camera();
const players = new Map<string, Player>();
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.oncontextmenu = () => false;
const context = canvas.getContext('2d');
const socket = initializeSocket();
const input = new Input();
const stars = Star.generateStars(2000, -5000, 5000);

input.inputChange.subscribe(input => {
    socket.emit(EventName.INPUT, input);
});

let me: Player;

window.addEventListener('resize', resize);

function initializeSocket() {
    const socket = io(Settings.SERVER);

    socket.on(EventName.WELCOME, welcome => {

        me = new Player(welcome.color);
        me.id = welcome.id;
        players.set(me.id, me);

        welcome.players.forEach((updatedPlayer: any) => {
            const player = players.get(updatedPlayer.id);
            if(player) {
                player.position = updatedPlayer.position;
            } else {
                const newPlayer = new Player(updatedPlayer.color);
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
            newPlayer.color = joinedPlayer.color;
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
        ...stars,
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
