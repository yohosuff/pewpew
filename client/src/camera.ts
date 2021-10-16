import * as Matter from 'matter-js';
import { LineSegment } from "./line-segment";
import { Player } from "./player";

export class Camera {
    position: Matter.Vector;

    left: number;
    right: number;
    top: number;
    bottom: number;

    topBorder: LineSegment;
    bottomBorder: LineSegment;
    leftBorder: LineSegment;
    rightBorder: LineSegment;
    
    constructor() {
        this.position = Matter.Vector.create();
        this.recalculateBorders();
    }

    recalculateBorders() {
        this.left = 0;
        this.right = window.innerWidth;
        this.top = 0;
        this.bottom = window.innerHeight;

        this.topBorder = new LineSegment(
            Matter.Vector.create(this.left, this.top),
            Matter.Vector.create(this.right, this.top),
        );
        this.bottomBorder = new LineSegment(
            Matter.Vector.create(this.left, this.bottom),
            Matter.Vector.create(this.right, this.bottom),
        );
        this.leftBorder = new LineSegment(
            Matter.Vector.create(this.left, this.top),
            Matter.Vector.create(this.left, this.bottom),
        );
        this.rightBorder = new LineSegment(
            Matter.Vector.create(this.right, this.top),
            Matter.Vector.create(this.right, this.bottom),
        );
    }

    follow(followee: Player) {
        this.position.x = followee.body.position.x;
        this.position.y = followee.body.position.y;
    }

    getScreenX(worldPosition: Matter.Vector) {
        const offset = this.position.x - window.innerWidth / 2;
        return worldPosition.x - offset;
    }

    getScreenY(worldPosition: Matter.Vector) {
        const offset = this.position.y - window.innerHeight / 2;
        return worldPosition.y - offset;
    }

    getWorldPosition(screenPosition: Matter.Vector): Matter.Vector {
        const offsetX = this.position.x - window.innerWidth / 2;
        const offsetY = this.position.y - window.innerHeight / 2;
        const worldPosition = Matter.Vector.create(
            screenPosition.x + offsetX,
            screenPosition.y + offsetY,
        );
        return worldPosition;
    }

    getScreenPosition(worldPosition: Matter.Vector): Matter.Vector {
        return Matter.Vector.create(
            this.getScreenX(worldPosition),
            this.getScreenY(worldPosition),
        );
    }

    canSee(drawable: any) {
        const x = this.getScreenX(drawable.body.position);
        const y = this.getScreenY(drawable.body.position);

        if(x < -drawable.radius) return false;
        if(y < -drawable.radius) return false;
        if(x > window.innerWidth + drawable.radius) return false;
        if(y > window.innerHeight + drawable.radius) return false;

        return true;
    }
}
