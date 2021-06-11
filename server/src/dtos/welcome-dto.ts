import { FlagDto } from "./flag-dto";
import { PlayerDto } from "./player-dto";
import { WallDto } from "./wall-dto";

export class WelcomeDto {
  id: string;
  flag: FlagDto;
  players: PlayerDto[];
  walls: WallDto[];
}
