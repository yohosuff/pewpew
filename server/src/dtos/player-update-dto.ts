import { Input } from "../input";
import { Vector } from "../vector";

export class PlayerUpdateDto {
  id: string;
  position: Vector;
  input: Input;
}
