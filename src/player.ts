import { Camera } from "./camera";
import { Vector } from "./vector";

export class Player {
    radius: number;
    mass: number;
    speed: number;
    color: string;
    position: Vector;
    velocity: Vector;
    acceleration: Vector;

    constructor(color: string) {
        this.radius = 50;
        this.mass = 1;
        this.speed = 400;
        this.color = color;
        this.position = new Vector(0, 0);
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
    }

    draw(context: CanvasRenderingContext2D, camera: Camera) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(
            this.position.x - (camera.position.x - window.innerWidth / 2), 
            this.position.y - (camera.position.y - window.innerHeight / 2),
            this.radius,
            0,
            2 * Math.PI
        );
        context.fill();

        // debug info
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.fillText(
            `vx: ${this.velocity.x.toFixed(1)}, vy:  ${this.velocity.y.toFixed(1)}`,
            this.position.x - (camera.position.x - window.innerWidth / 2),
            this.position.y - (camera.position.y - window.innerHeight / 2)
        );
    }
}
