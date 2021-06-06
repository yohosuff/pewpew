import { Player } from "../player";
import { Flag } from "../flag";
import { PlayerDto } from "./player-dto";

export class WelcomeDto {
  id: string;
  flag: Flag;
  players: PlayerDto[];

  constructor(playerId: string, flag: Flag, players: Map<string, Player>) {
    this.id = playerId;
    this.flag = flag;
    this.players = Array.from(players.values()).map(player => {
      return {
        id: player.id,
        position: player.position,
        color: player.color,
        radius: player.radius,
        name: player.name,
        score: player.score,
      };
    });
  }
}