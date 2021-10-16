import { Input } from "../input";

export class PlayerFrameUpdateDto {
  id: string;
  position: Matter.Vector;
  velocity: Matter.Vector;
  input: Input;
}
