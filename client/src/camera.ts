import { Player } from "./player";
import { Vector } from "./vector";

export class Camera {
    position: Vector;

    constructor() {
        this.position = new Vector(0, 0);
    }

    follow(followee: Player) {
        this.position.x = followee.position.x;
        this.position.y = followee.position.y;
    }

    getScreenX(drawable: any) {
        return drawable.position.x - (this.position.x - window.innerWidth / 2);
    }

    getScreenY(drawable: any) {
        return drawable.position.y - (this.position.y - window.innerHeight / 2);
    }
}
