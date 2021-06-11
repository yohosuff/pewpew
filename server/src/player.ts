import { Socket } from "socket.io";
import { PlayerDto } from "./dtos/player-dto";
import { PlayerFrameUpdateDto } from "./dtos/player-frame-update-dto";
import { Input } from "./input";
import { PlayerBase } from "./player-base";
import { Vector } from "./vector";

export class Player extends PlayerBase {
  
  socket: Socket;
  input: Input;
  
  constructor(socket: Socket) {
    super();
    
    this.socket = socket;
    this.input = new Input();

    this.id = socket.id;
    this.position = new Vector(
      Math.floor(Math.random() * 1000 - 500),
      Math.floor(Math.random() * 1000 - 500),
    );
    this.radius = 50;
    this.color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    this.mass = 1;
    this.speed = 500;
    this.velocity = Vector.ZERO;
    this.acceleration = Vector.ZERO;
    this.score = 0;
  }

  dto() {
    const dto = new PlayerDto();
    dto.id = this.id;
    dto.position = this.position;
    dto.color = this.color;
    dto.radius = this.radius;
    dto.name = this.name;
    dto.score = this.score;
    return dto;
  }

  frameUpdateDto() {
    const dto = new PlayerFrameUpdateDto();
    dto.id = this.id;
    dto.position = this.position;
    dto.velocity = this.velocity;
    dto.input = this.input;
    return dto;
  }
}
