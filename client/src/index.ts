//fun idea: fly around and shoot missiles at each other
//turret auto targets, can cycle targets, missiles track target, firing has cooldown?
//add button to enable ai with steering behavior to hit other players
//do 'king of the hill' where the 'hill' is a cirular area that randomly relocates and players try to bash each other out of it
//the flag should try to run away from the players
//infect other players with control virus that randomizes their controls

import './index.css';

import { Camera } from './camera';
import { Player } from "./player";
import { Settings } from './settings';
import { Flag } from './flag';
import { Navigation } from './navigation';
import { LeaderBoard } from './leader-board';

import { WelcomeDto } from '../../server/src/dtos/welcome-dto';
import { PlayerUpdateDto } from "../../server/src/dtos/player-update-dto";
import { EventName } from '../../server/src/event-name';
import { Flag as ServerFlag } from "../../server/src/flag";

import { io } from 'socket.io-client';

const camera = new Camera();
const players = new Map<string, Player>();
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.oncontextmenu = () => false;
const context = canvas.getContext('2d');
const flag = new Flag();
const navigation = new Navigation();
const leaderBoard = new LeaderBoard();
const playersList: Player[] = [];

let me: Player;

window.addEventListener('resize', resize);

initializeSocket();

function initializeSocket() {
    const socket = io(Settings.SERVER);

    socket.on(EventName.WELCOME, (welcome: WelcomeDto) => {

        welcome.players.forEach(playerDto => {
            const player = Player.createFromPlayerDto(playerDto);
            players.set(player.id, player);
            playersList.push(player);
        });

        me = players.get(welcome.id);
        me.input.listenForKeyboardEvents();
        me.input.inputChange.subscribe(input => {
            socket.emit(EventName.INPUT, input);
        });
        
        flag.update(welcome.flag);
        camera.follow(me);
        draw();

        socket.on(EventName.UPDATE, (updatedPlayers: PlayerUpdateDto[]) => {
            updatedPlayers.forEach(updatedPlayer => {
                const player = players.get(updatedPlayer.id);
                
                if (!player) { return; }
                
                player.position.x = updatedPlayer.position.x;
                player.position.y = updatedPlayer.position.y;
                
                if(player.id !== me.id) {
                    player.input.left = updatedPlayer.input.left;
                    player.input.right = updatedPlayer.input.right;
                    player.input.up = updatedPlayer.input.up;
                    player.input.down = updatedPlayer.input.down;
                }
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
        ...playersList,
    ];

    drawables
        .filter(drawable => camera.canSee(drawable))
        .forEach(drawable => drawable.draw(context, camera));

    navigation.draw(context, camera, me, flag);
    leaderBoard.draw(context, playersList);
    
    document.body.style.backgroundPositionX = `${-me.position.x}px`;
    document.body.style.backgroundPositionY = `${-me.position.y}px`;    
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.recalculateBorders();
}
