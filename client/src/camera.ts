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
}
