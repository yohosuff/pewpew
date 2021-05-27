import { Camera } from "./camera";
import { Vector } from "./vector";

export class Star {
    position: Vector;
    
    constructor(min: number, max: number) {
        const x = this.getRandomNumber(min, max);
        const y = this.getRandomNumber(min, max);
        this.position = new Vector(x, y);
    }

    getRandomNumber(min: number, max: number) {
        return min + Math.floor(Math.random() * (max - min));
    }

    draw(context: CanvasRenderingContext2D, camera: Camera) {
        context.fillStyle = 'white';
        context.fillRect(
            camera.getScreenX(this),
            camera.getScreenY(this),
            1, 1);
    }

    static generateStars(count: number, min: number, max: number) {
        const stars = [];
        for(let i = 0; i < count; ++i) {
            stars.push(new Star(min, max));
        }
        return stars;
    }
}
