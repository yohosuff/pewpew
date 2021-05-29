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

    getScreenX(worldPosition: Vector) {
        const offset = this.position.x - window.innerWidth / 2;
        return worldPosition.x - offset;
    }

    getScreenY(worldPosition: Vector) {
        const offset = this.position.y - window.innerHeight / 2;
        return worldPosition.y - offset;
    }

    getWorldPosition(screenPosition: Vector): Vector {
        const offsetX = this.position.x - window.innerWidth / 2;
        const offsetY = this.position.y - window.innerHeight / 2;
        const worldPosition = new Vector(
            screenPosition.x + offsetX,
            screenPosition.y + offsetY,
        );
        return worldPosition;
    }

    getScreenVector(drawable: any): Vector {
        return new Vector(
            this.getScreenX(drawable),
            this.getScreenX(drawable),
        );
    }

    canSee(drawable: any) {
        const x = this.getScreenX(drawable.position);
        const y = this.getScreenY(drawable.position);

        if(x < 0) return false;
        if(y < 0) return false;
        if(x > window.innerWidth) return false;
        if(y > window.innerHeight) return false;

        return true;
    }
}
