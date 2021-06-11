import { Vector } from "../vector";

export class PlayerDto {
  id: string;
  name: string;
  position: Vector;
  velocity: Vector;
  color: string;
  radius: number;
  score: number;
}
