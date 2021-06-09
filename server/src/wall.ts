import { Vector } from "./vector";

export class Wall {
  position: Vector; //center of rectangle
  bounds: Vector; //distance from position
  color: string;
  
  constructor(position: Vector, bounds: Vector, color: string) {
    this.position = position;
    this.bounds = bounds;
    this.color = color;
  }
}
