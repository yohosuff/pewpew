import { PlayerDto } from "../../server/src/dtos/player-dto";
import { Vector } from "../../server/src/vector";
import { Camera } from "./camera";

export class Player {
    id: string;
    position: Vector;
    radius: number;
    color: string;

    debugging = false;

    constructor(color: string) {
        this.color = color;
        this.position = new Vector(0, 0);
        this.radius = 50;
    }

    static createFromPlayerDto(playerDto: PlayerDto) {
        const player = new Player(playerDto.color);
        player.id = playerDto.id;
        player.position = playerDto.position;
        player.radius = playerDto.radius;
        return player;
    }

    draw(context: CanvasRenderingContext2D, camera: Camera) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(
            camera.getScreenX(this),
            camera.getScreenY(this),
            this.radius, 0, 2 * Math.PI,
        );
        context.fill();

        if(this.debugging) {
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.font = "12px Arial";
            context.fillText(
                `${camera.getScreenVector(this).getString()}`,
                camera.getScreenX(this),
                camera.getScreenY(this),
            );
        }
    }

    getPositionString() {
        return `${this.position.getString()}`;
    }
}
