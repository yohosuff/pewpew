import { PlayerFrameUpdateDto } from "./player-frame-update-dto";

export class FrameUpdateDto {
  players: PlayerFrameUpdateDto[];
  //could be more things here, like bad guys...
  //flag doesn't go here because it doesn't move  
}
