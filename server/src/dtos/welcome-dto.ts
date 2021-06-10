import { Flag } from "../flag";
import { PlayerDto } from "./player-dto";
import { WallDto } from "./wall-dto";

export class WelcomeDto {
  id: string;
  flag: Flag;
  players: PlayerDto[];
  walls: WallDto[];
}
