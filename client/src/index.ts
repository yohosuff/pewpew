//fun idea: fly around and shoot missiles at each other
//turret auto targets, can cycle targets, missiles track target, firing has cooldown?
//add button to enable ai with steering behavior to hit other players
//do 'king of the hill' where the 'hill' is a cirular area that randomly relocates and players try to bash each other out of it
//the flag should try to run away from the players
//infect other players with control virus that randomizes their controls
//players try to 'kick' a ball into the other team's 'net'

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
const canvas = createCanvas();
const context = canvas.getContext('2d');
const flag = new Flag();
const navigation = new Navigation();
const leaderBoard = new LeaderBoard();
const playersList: Player[] = [];

let me: Player;

window.addEventListener('resize', resize);

initializeSocket();

function createCanvas() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.oncontextmenu = () => false;
    return canvas;
}

function addPlayer(player: Player) {
    if(players.has(player.id)) { 
        removePlayer(player.id);
    }
    players.set(player.id, player);
    playersList.push(player);
}

function removePlayer(playerId: string) {
    const player = players.get(playerId);
    const index = playersList.indexOf(player);
    playersList.splice(index, 1);
    players.delete(playerId);
}

function removeAllPlayers() {
    playersList.splice(0, playersList.length);
    players.clear();
}

function initializeSocket() {
    const socket = io(Settings.SERVER);

    socket.on(EventName.WELCOME, (welcome: WelcomeDto) => {

        console.log('welcome');
        
        removeAllPlayers();

        welcome.players.forEach(playerDto => {
            console.log(`joining existing player: ${playerDto.id}`);
            const player = Player.createFromPlayerDto(playerDto);
            addPlayer(player);
        });

        me = players.get(welcome.id);
        me.input.listenForKeyboardEvents();
        me.input.inputChange.subscribe(input => {
            socket.emit(EventName.INPUT, input);
        });
        
        flag.update(welcome.flag);
        camera.follow(me);
        draw();

        //register these event handlers in a map, and use a helper function to do an 'auto on/off' subscription thing...
        socket.off(EventName.UPDATE, updateHandler);
        socket.on(EventName.UPDATE, updateHandler);

        socket.off(EventName.PLAYER_JOINED, playerJoinedHandler);
        socket.on(EventName.PLAYER_JOINED, playerJoinedHandler);

        socket.off(EventName.PLAYER_LEFT, playerLeftHandler);
        socket.on(EventName.PLAYER_LEFT, playerLeftHandler);

        socket.off(EventName.FLAG_UPDATE, flagUpdateHandler);
        socket.on(EventName.FLAG_UPDATE, flagUpdateHandler);

        socket.off(EventName.DISCONNECT, disconnectHandler);
        socket.on(EventName.DISCONNECT, disconnectHandler);
    });

    return socket;
}

const disconnectHandler = () => {
    console.log('disconnect');
    removeAllPlayers();
    draw();
};

const flagUpdateHandler = (serverFlag: ServerFlag) => {
    flag.update(serverFlag);
};

const playerLeftHandler = (leftPlayer: any) => {
    console.log(`player left: ${leftPlayer.id}`);
    removePlayer(leftPlayer.id);
    draw();
};

const playerJoinedHandler = (joinedPlayer: any) => {
    console.log(`player joined: ${joinedPlayer.id}`);
    const newPlayer = new Player('red');
    newPlayer.id = joinedPlayer.id;
    newPlayer.color = joinedPlayer.color;
    addPlayer(newPlayer);
    draw();
};

const updateHandler = (updatedPlayers: PlayerUpdateDto[]) => {

    //console.log('update');

    updatedPlayers.forEach(updatedPlayer => {
        const player = players.get(updatedPlayer.id);
        
        if (!player) { return; }
        
        player.position.x = updatedPlayer.position.x;
        player.position.y = updatedPlayer.position.y;
        player.velocity.x = updatedPlayer.velocity.x;
        player.velocity.y = updatedPlayer.velocity.y;
        
        if(player.id !== me.id) {
            player.input.left = updatedPlayer.input.left;
            player.input.right = updatedPlayer.input.right;
            player.input.up = updatedPlayer.input.up;
            player.input.down = updatedPlayer.input.down;
        }
    });
    camera.follow(me);
    draw();
};

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
