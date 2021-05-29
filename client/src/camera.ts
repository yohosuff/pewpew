import { Vector } from "../../server/src/vector";
import { Player } from "./player";

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

    getScreenVector(drawable: any): Vector {
        return new Vector(
            this.getScreenX(drawable),
            this.getScreenX(drawable),
        );
    }

    canSee(drawable: any) {
        const x = this.getScreenX(drawable);
        const y = this.getScreenY(drawable);

        if(x < 0) return false;
        if(y < 0) return false;
        if(x > window.innerWidth) return false;
        if(y > window.innerHeight) return false;

        return true;
    }
}
