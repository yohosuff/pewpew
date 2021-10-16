import * as Matter from 'matter-js';

export class LineSegment {
    a: Matter.Vector;
    b: Matter.Vector;
    
    constructor(a?: Matter.Vector, b?: Matter.Vector) {
        this.a = a ?? Matter.Vector.create(0, 0);
        this.b = b ?? Matter.Vector.create(0, 0);
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
