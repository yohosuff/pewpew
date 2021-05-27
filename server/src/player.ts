import { Socket } from "socket.io";
import { Input } from "./input";
import { Vector } from "./vector";

export class Player {
  position: Vector;
  radius: number;
  color: string;
  mass: number;
  speed: number;
  velocity: Vector;
  acceleration: Vector;
  id: string;
  socket: Socket;
  input: Input;

  constructor(color: string) {
    this.position = new Vector(0, 0);
    this.radius = 50;
    this.color = color;
    this.mass = 1;
    this.speed = 2000;
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.input = new Input();
  }
}
