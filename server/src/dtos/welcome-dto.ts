import { Player } from "../player";
import { Flag } from "../flag";
import { PlayerDto } from "./player-dto";

export class WelcomeDto {
  id: string;
  flag: Flag;
  players: PlayerDto[];

  constructor(player: Player, flag: Flag, players: Map<string, Player>) {
    this.id = player.id;
    this.flag = flag;
    this.players = Array.from(players.values()).map(updatedPlayer => {
      return {
        id: updatedPlayer.id,
        position: updatedPlayer.position,
        color: updatedPlayer.color,
        radius: updatedPlayer.radius,
        name: updatedPlayer.name,
      };
    });
  }
}