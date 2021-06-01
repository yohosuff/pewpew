import { Player } from "./player";

export class LeaderBoard {
    draw(context: CanvasRenderingContext2D, players: Player[]) {
        for(let i = 0; i < players.length; ++i) {
            const player = players[i];
            context.fillStyle = 'red';
            context.textAlign = 'left';
            context.fillText(`${player.id}`, 0, (i+1) * 20);
        }
    }
}
