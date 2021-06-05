import { Socket } from "socket.io";
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
  }
}
