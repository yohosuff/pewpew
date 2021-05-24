export class Vector {

    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    toUnitVector() {
        this.x /= this.magnitude;
        this.y /= this.magnitude;
    }

    dotProduct(v: Vector) {
        return this.x * v.x + this.y * v.y;
    }

    subtract(b: Vector) {
        const a = new Vector(this.x, this.y);
        a.x -= b.x;
        a.y -= b.y;
        return a;
    }

    multiplyByScalar(scalar: number) {
        const a = new Vector(this.x, this.y);
        a.x *= scalar;
        a.y *= scalar;
        return a;
    }
}
