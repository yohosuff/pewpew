import { Vector } from "../../server/src/vector";
import { LineSegment } from "./line-segment";
import { Player } from "./player";

export class Camera {
    position: Vector;

    left: number;
    right: number;
    top: number;
    bottom: number;

    topBorder: LineSegment;
    bottomBorder: LineSegment;
    leftBorder: LineSegment;
    rightBorder: LineSegment;
    
    constructor() {
        this.position = new Vector(0, 0);
        this.recalculateBorders();
    }

    recalculateBorders() {
        this.left = 0;
        this.right = window.innerWidth;
        this.top = 0;
        this.bottom = window.innerHeight;

        this.topBorder = new LineSegment(
            new Vector(this.left, this.top),
            new Vector(this.right, this.top),
        );
        this.bottomBorder = new LineSegment(
            new Vector(this.left, this.bottom),
            new Vector(this.right, this.bottom)
        );
        this.leftBorder = new LineSegment(
            new Vector(this.left, this.top),
            new Vector(this.left, this.bottom)
        );
        this.rightBorder = new LineSegment(
            new Vector(this.right, this.top),
            new Vector(this.right, this.bottom)
        );
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

    getScreenPosition(worldPosition: Vector): Vector {
        return new Vector(
            this.getScreenX(worldPosition),
            this.getScreenY(worldPosition),
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
