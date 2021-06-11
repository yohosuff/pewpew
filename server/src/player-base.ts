import { Vector } from "./vector";

export class PlayerBase {
  id: string;
  name: string;
  color: string;
  score: number;
  
  position: Vector;
  velocity: Vector;
  acceleration: Vector;
  
  radius: number;
  mass: number;
  speed: number;
}
