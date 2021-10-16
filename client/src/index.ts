//fun idea: fly around and shoot missiles at each other
//turret auto targets, can cycle targets, missiles track target, firing has cooldown?
//add button to enable ai with steering behavior to hit other players
//do 'king of the hill' where the 'hill' is a cirular area that randomly relocates and players try to bash each other out of it
//the flag should try to run away from the players
//infect other players with control virus that randomizes their controls
//players try to 'kick' a ball into the other team's 'net'
//grappling other players and flinging them around would be fun
//add toasts for certain events (player name changes, flag captures, players leaving/joining)
//allow players to pick their own persistant color
//solution for imperfect collision detection on wall corners... put an immovable circle on the corner so the player hits the circle before the corner of the wall
//to prevent skipping through walls, add continous collision detection. *gulp*

import './index.css';

import { Camera } from './camera';
import { Player } from "./player";
import { Settings } from './settings';
import { Flag } from './flag';
// import { Navigation } from './navigation';
import { LeaderBoard } from './leader-board';
import { IMenuState } from './menu-state-interface';
import { Wall } from './wall';

import { EventName } from '../../server/src/event-name';
import { WelcomeDto } from '../../server/src/dtos/welcome-dto';
import { PlayerDto } from '../../server/src/dtos/player-dto';
import { FlagCapturedDto } from '../../server/src/dtos/flag-captured-dto';
import { FrameUpdateDto } from '../../server/src/dtos/frame-update-dto';

import { io, Socket } from 'socket.io-client';
import Swal from 'sweetalert2'
import * as Matter from 'matter-js';


const camera = new Camera();
const players = new Map<string, Player>();
const canvas = createCanvas();
const context = canvas.getContext('2d');
// const navigation = new Navigation();
const leaderBoard = new LeaderBoard();
const playersList: Player[] = [];
const eventHandlers = new Map<string,any>();
const walls: Wall[] = [];

let me: Player;
let flag: Flag;

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

    socket.on(EventName.WELCOME, (dto: WelcomeDto) => {

        console.log('welcome', dto);
        
        walls.splice(0, walls.length);
        
        dto.walls
            .map(wall => Wall.fromDto(wall))
            .forEach(wall => walls.push(wall));

        removeAllPlayers();
        
        dto.players
            .map(player => Player.fromDto(player))
            .forEach(player => addPlayer(player));

        me = players.get(dto.id);

        const name = localStorage.getItem('name');
        
        if(name) {
            socket.emit(EventName.CHANGE_NAME, name);
        }

        me.input.listenForKeyboardEvents();
        
        me.input.movementChange.subscribe(input => {
            socket.emit(EventName.INPUT, input);
        });

        me.input.menuChange.subscribe(async (state: IMenuState) => {
            if(state.setName) {
                const { value: name } = await Swal.fire({
                    title: 'What should we call you?',
                    input: 'text',
                    inputValue: me.name,
                    inputAutoTrim: true,
                    showCancelButton: true,
                    inputValidator: (value) => {
                        if (!value) {
                            return 'You need to write something!'
                        }
                    }
                });

                if(name) {
                    localStorage.setItem('name', name);
                    socket.emit(EventName.CHANGE_NAME, name);
                }
            }
        });
        
        flag = Flag.fromDto(dto.flag);
        camera.follow(me);
        registerEventHandlers(socket);
    });

    return socket;
}

function registerEventHandlers(socket: Socket) {
    registerEventHandler(socket, EventName.FRAME_UPDATE, (dto: FrameUpdateDto) => {
        dto.players.forEach(updatedPlayer => {
            const player = players.get(updatedPlayer.id);
            
            if (!player) { return; }
            
            player.body.position = Matter.Vector.create(updatedPlayer.position.x, updatedPlayer.position.y);
            player.velocity = Matter.Vector.create(updatedPlayer.velocity.x, updatedPlayer.velocity.y);
            
            if(player.id === me.id) { return; }
            
            player.input.moveLeft.pressed = updatedPlayer.input.left;
            player.input.moveRight.pressed = updatedPlayer.input.right;
            player.input.moveUp.pressed = updatedPlayer.input.up;
            player.input.moveDown.pressed = updatedPlayer.input.down;
        });
        camera.follow(me);
        draw();
    });
    
    registerEventHandler(socket, EventName.PLAYER_UPDATE, (dto: PlayerDto) => {
        // updating a player (change name, and then others later (eg. color, call sign)) could be part of a player manager class
        const player = players.get(dto.id);
        if (!player) {
            console.error(`could not find player with id ${dto.id}`);
            return;
        }
        player.name = dto.name;
    });
    
    registerEventHandler(socket, EventName.PLAYER_JOINED, (dto: PlayerDto) => {
        console.log(`player joined: ${dto.id}`);
        const player = Player.fromDto(dto);
        //adding a player could be contained in a player manager class
        addPlayer(player);
        draw();
    });

    registerEventHandler(socket, EventName.PLAYER_LEFT, (leftPlayer: any) => {
        console.log(`player left: ${leftPlayer.id}`);
        removePlayer(leftPlayer.id);
        draw();
    });
    
    registerEventHandler(socket, EventName.FLAG_CAPTURED, (dto: FlagCapturedDto) => {
        flag = Flag.fromDto(dto.flag);
        const player = players.get(dto.playerId);
        player.score = dto.playerScore;
        playersList.sort((a,b) => b.score - a.score);
        draw();
    });

    registerEventHandler(socket, EventName.DISCONNECT, () => {
        console.log('disconnect');
        removeAllPlayers();
        draw();
    });
}

function registerEventHandler(socket: Socket, event: string, handler: any) {
    const existingHandler = eventHandlers.get(event);
    
    if(existingHandler) {
        socket.off(event, existingHandler);
    }
    
    eventHandlers.set(event, handler);
    socket.on(event, handler);
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

    // navigation.draw(context, camera, me, drawables);
    walls.forEach(wall => wall.draw(context, camera))

    leaderBoard.draw(context, playersList);
    
    document.body.style.backgroundPositionX = `${-me.body.position.x}px`;
    document.body.style.backgroundPositionY = `${-me.body.position.y}px`;
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.recalculateBorders();
}
