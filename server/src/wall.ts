import { Vector } from "./vector";

export class Wall {
  position: Vector; //center of rectangle
  bounds: Vector; //distance from position
  color: string;
  
  constructor() {
    this.position = new Vector(100, 100);
    this.bounds = new Vector(20, 400);
    this.color = 'red';
  }
}
