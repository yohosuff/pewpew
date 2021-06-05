import { Player } from "./player";

export class LeaderBoard {
    draw(context: CanvasRenderingContext2D, players: Player[]) {
        for(let i = 0; i < players.length; ++i) {
            const player = players[i];
            context.fillStyle = player.color;
            context.textAlign = 'left';
            context.fillText(`${player.name ?? player.id}`, 20, 20 + (i + 1) * 20);
        }
    }
}
