import { Vector } from "../../server/src/vector";

export class LineSegment {
    a: Vector;
    b: Vector;
    
    constructor(a?: Vector, b?: Vector) {
        this.a = a;
        this.b = b;
    }
}
