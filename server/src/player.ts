import { Socket } from "socket.io";
import { PlayerDto } from "./dtos/player-dto";
import { PlayerJoinedDto } from "./dtos/player-joined-dto";
import { PlayerNameChangeDto } from "./dtos/player-name-change-dto";
import { Input } from "./input";
import { Vector } from "./vector";

export class Player {
  id: string;
  name: string;  position: Vector;
  radius: number;
  color: string;
  mass: number;
  speed: number;
  velocity: Vector;
  acceleration: Vector;
  socket: Socket;
  input: Input;
  score: number;

  constructor(socket: Socket) {
    this.socket = socket;
    this.id = socket.id;
    this.position = new Vector(
      Math.floor(Math.random() * 1000 - 500),
      Math.floor(Math.random() * 1000 - 500),
    );
    this.radius = 50;
    this.color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    this.mass = 1;
    this.speed = 500;
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.input = new Input();
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

  joinedDto() {
    const dto = new PlayerJoinedDto();
    dto.id = this.id;
    dto.position = this.position;
    dto.color = this.color;
    return dto;
  }

  nameChangeDto() {
    const dto = new PlayerNameChangeDto();
    dto.id = this.id;
    dto.name = this.name;
    return dto;
  }
}
