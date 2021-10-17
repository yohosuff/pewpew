import Matter from "matter-js";
import { Socket } from "socket.io";
import { PlayerDto } from "./dtos/player-dto";
import { PlayerFrameUpdateDto } from "./dtos/player-frame-update-dto";
import { Input } from "./input";
import { PlayerBase } from "./player-base";

export class Player extends PlayerBase {
  
  socket: Socket;
  input: Input;
  
  constructor(socket: Socket) {
    super();
    
    this.socket = socket;
    this.input = new Input();
    this.id = socket.id;
    this.color = "#" + Math.floor(Math.random() * 16777215).toString(16);   
    this.speed = 0.01;
    this.score = 0;

    // this.body = Matter.Bodies.circle(
    //   Math.floor(Math.random() * 1000 - 500),
    //   Math.floor(Math.random() * 1000 - 500),
    //   50,
    // );

    this.body = Matter.Bodies.circle(
      0,
      0,
      50,
    );
  }

  dto() {
    const dto = new PlayerDto();
    dto.id = this.id;
    dto.color = this.color;
    dto.name = this.name;
    dto.score = this.score;
    dto.position = this.body.position;
    dto.velocity = this.body.velocity;
    dto.radius = this.body.circleRadius;
    return dto;
  }

  frameUpdateDto() {
    const dto = new PlayerFrameUpdateDto();
    dto.id = this.id;
    dto.input = this.input;
    dto.position = this.body.position;
    dto.velocity = this.body.velocity;
    return dto;
  }
}
