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
import { Flag } from './flag';
import { Flag as ServerFlag } from "../../server/src/flag";
import { Navigation } from './navigation';
import { LeaderBoard } from './leader-board';
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
const flag = new Flag();
const navigation = new Navigation();
const leaderBoard = new LeaderBoard();
const playersList: Player[] = [];

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
            playersList.push(player);
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
            playersList.push(newPlayer);
            draw();
        });

        socket.on(EventName.PLAYER_LEFT, leftPlayer => {
            console.log(`player ${leftPlayer.id} left`);
            playersList.splice(playersList.indexOf(players.get(leftPlayer.id)), 1);
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
        ...Array.from(players.values()),
    ];

    drawables
        .filter(drawable => camera.canSee(drawable))
        .forEach(drawable => drawable.draw(context, camera));

    navigation.draw(context, camera, me, flag);
    leaderBoard.draw(context, playersList);
    
    document.body.style.backgroundPositionX = `${-me.position.x}px`;
    document.body.style.backgroundPositionY = `${-me.position.y}px`;

    drawEngineThrust();
}

// TODO: draw thrust for other players. add a player parameter, include player input on dto update from server
function drawEngineThrust() {
    const myScreenPosition = camera.getScreenPosition(me.position);
    const flameLength = 100;
    const flameWidth = 20;
    const gradientPoint0 = new Vector(0, 0);
    const gradientPoint1 = new Vector(0, 0);
    const rectPosition = new Vector(0, 0);
    let rectWidth: number;
    let rectHeight: number;

    if(input.left) {
        gradientPoint0.x = myScreenPosition.x + me.radius;
        gradientPoint0.y = myScreenPosition.y;
        gradientPoint1.x = myScreenPosition.x + (me.radius + flameLength);
        gradientPoint1.y = myScreenPosition.y;
        rectPosition.x = myScreenPosition.x + me.radius;
        rectPosition.y = myScreenPosition.y - flameWidth / 2;
        rectWidth = flameLength;
        rectHeight = flameWidth;
        drawEngineThrustHelper(gradientPoint0, gradientPoint1, rectPosition, rectWidth, rectHeight);
    }
    
    if(input.up) {
        gradientPoint0.x = myScreenPosition.x;
        gradientPoint0.y = myScreenPosition.y + me.radius;
        gradientPoint1.x = myScreenPosition.x;
        gradientPoint1.y = myScreenPosition.y + (me.radius + flameLength);
        rectPosition.x = myScreenPosition.x - flameWidth / 2;
        rectPosition.y = myScreenPosition.y + me.radius;
        rectWidth = flameWidth;
        rectHeight = flameLength;
        drawEngineThrustHelper(gradientPoint0, gradientPoint1, rectPosition, rectWidth, rectHeight);
    }
    
    if(input.right) {
        gradientPoint0.x = myScreenPosition.x - me.radius;
        gradientPoint0.y = myScreenPosition.y;
        gradientPoint1.x = myScreenPosition.x - (me.radius + flameLength);
        gradientPoint1.y = myScreenPosition.y;
        rectPosition.x = myScreenPosition.x - (me.radius + flameLength);
        rectPosition.y = myScreenPosition.y - flameWidth / 2;
        rectWidth = flameLength;
        rectHeight = flameWidth;
        drawEngineThrustHelper(gradientPoint0, gradientPoint1, rectPosition, rectWidth, rectHeight);
    }

    if(input.down) {
        gradientPoint0.x = myScreenPosition.x;
        gradientPoint0.y = myScreenPosition.y - me.radius;
        gradientPoint1.x = myScreenPosition.x;
        gradientPoint1.y = myScreenPosition.y - (me.radius + flameLength);
        rectPosition.x = myScreenPosition.x - flameWidth / 2;
        rectPosition.y = myScreenPosition.y - (me.radius + flameLength);
        rectWidth = flameWidth;
        rectHeight = flameLength;
        drawEngineThrustHelper(gradientPoint0, gradientPoint1, rectPosition, rectWidth, rectHeight);
    }
}

function drawEngineThrustHelper(gradientPoint0: Vector, gradientPoint1: Vector, rectPosition: Vector, rectWidth: number, rectHeight: number) {
    const linearGradient = context.createLinearGradient(
        gradientPoint0.x,
        gradientPoint0.y,
        gradientPoint1.x,
        gradientPoint1.y);

    linearGradient.addColorStop(0, 'blue');
    linearGradient.addColorStop(1, 'transparent');
    context.fillStyle = linearGradient;

    context.fillRect(
        rectPosition.x,
        rectPosition.y,
        rectWidth,
        rectHeight,
    );
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.recalculateBorders();
}
