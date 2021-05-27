import { Camera } from "./camera";
import { Vector } from "./vector";

export class Player {
    id: string;
    position: Vector;
    radius: number;
    color: string;

    debugging = false;

    constructor(color: string) {
        this.position = new Vector(0, 0);
        this.radius = 50;
        this.color = color;
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
                `${this.position.x.toFixed(1)} ${this.position.y.toFixed(1)}`,
                camera.getScreenX(this),
                camera.getScreenY(this),
            );
        }
    }
}
