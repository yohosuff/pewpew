//fun idea: fly around and shoot missiles at each other
//turret auto targets, can cycle targets, missiles track target, firing has cooldown?
//add button to enable ai with steering behavior to hit other players
//do 'king of the hill' where the 'hill' is a cirular area that randomly relocates and players try to bash each other out of it
//the flag should try to run away from the players

import './index.css';

import { Camera } from './camera';
import { Input } from './input';
import { Player } from "./player";
import { EventName } from '../../server/src/event-name';
import { WelcomeDto } from '../../server/src/dtos/welcome-dto';
import { io } from 'socket.io-client';
import { Settings } from './settings';
import { Star } from './star';
import { Flag } from './flag';
import { Flag as ServerFlag } from "../../server/src/flag";
import { Vector } from '../../server/src/vector';

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
const stars = Star.generateStars(5000, -10000, 10000);
const flag = new Flag();

input.inputChange.subscribe(input => {
    socket.emit(EventName.INPUT, input);
});

let me: Player;

window.addEventListener('resize', resize);

function initializeSocket() {
    const socket = io(Settings.SERVER);

    socket.on(EventName.WELCOME, (welcome: WelcomeDto) => {

        welcome.players.forEach(playerDto => {
            const player = Player.createFromPlayerDto(playerDto);
            players.set(player.id, player);
        });

        me = players.get(welcome.id);
        flag.update(welcome.flag);
        camera.follow(me);
        draw();

        socket.on(EventName.UPDATE, (updatedPlayers: any[]) => {
            updatedPlayers.forEach(updatedPlayer => {
                const player = players.get(updatedPlayer.id);
                if (!player) { return; }
                player.position.x = updatedPlayer.position.x;
                player.position.y = updatedPlayer.position.y;
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

        socket.on(EventName.FLAG_UPDATE, (serverFlag: ServerFlag) => {
            flag.update(serverFlag);
        });
    });

    return socket;
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const drawables = [
        flag,
        ...stars,
        ...Array.from(players.values()),
    ];

    drawables
        .filter(drawable => camera.canSee(drawable))
        .forEach(drawable => drawable.draw(context, camera));

    drawLineToFlag();
}

function drawLineToFlag() {
    
    //this is only the top right now... need to do left, right, and bottom of screen next
    const intersectionPoint = getLineSegmentsIntersectionPoint(
        me.position, 
        flag.position,
        camera.getWorldPosition(new Vector(0,0)),
        camera.getWorldPosition(new Vector(window.innerWidth, 0)),
    );

    if(intersectionPoint) {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(
            camera.getScreenX(intersectionPoint),
            camera.getScreenY(intersectionPoint),
            25, 0, 2 * Math.PI,
        );
        context.fill();
    }
    
    context.strokeStyle = 'red';
    context.beginPath();
    context.moveTo(
        camera.getScreenX(me.position),
        camera.getScreenY(me.position),
    );
    context.lineTo(
        camera.getScreenX(flag.position),
        camera.getScreenY(flag.position),
    );
    context.stroke();
}

//https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
function getLineSegmentsIntersectionPoint(p: Vector, p2: Vector, q: Vector, q2: Vector) {
    const r = p2.subtract(p);
    const s = q2.subtract(q);
    const uNumerator = q.subtract(p).crossProduct(r);
    const denominator = r.crossProduct(s);
    const collinear = uNumerator === 0 && denominator === 0;

    if (collinear) { return; }

    const parallel = denominator === 0;

    if (parallel) { return; }

    const u = uNumerator / denominator;
    const t = q.subtract(p).crossProduct(s) / denominator;
    const intersecting = (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1);

    if(!intersecting) { return; }

    const intersection = p.add(r.multiplyByScalar(t));

    return intersection;
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
