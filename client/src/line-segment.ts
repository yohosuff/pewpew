import { Vector } from "../../server/src/vector";

export class LineSegment {
    a: Vector;
    b: Vector;
    
    constructor(a?: Vector, b?: Vector) {
        this.a = a ?? new Vector(0, 0);
        this.b = b ?? new Vector(0, 0);
    }

    applyOffset(ax: number, ay: number, bx: number, by: number) {
        const lineSegment = new LineSegment();
        lineSegment.a.x = this.a.x + ax;
        lineSegment.a.y = this.a.y + ay;
        lineSegment.b.x = this.b.x + bx;
        lineSegment.b.y = this.b.y + by;
        return lineSegment;
    }
}
