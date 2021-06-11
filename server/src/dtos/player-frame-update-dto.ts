import { Input } from "../input";
import { Vector } from "../vector";

export class PlayerFrameUpdateDto {
  id: string;
  position: Vector;
  velocity: Vector;
  input: Input;
}
