export class Vector {

    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    get magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    getString(): string {
        return `${this.x.toFixed()} ${this.y.toFixed()}`;
    }

    toUnitVector() {
        this.x /= this.magnitude;
        this.y /= this.magnitude;
    }

    dotProduct(v: Vector): number {
        return this.x * v.x + this.y * v.y;
    }

    // cross product of 2D vector is a scalar (ie. unlike that of a 3D vector, which is another vector)
    // https://www.quora.com/Can-you-cross-product-2D-vectors
    crossProduct(v: Vector): number {
        return this.x * v.y - this.y * v.x;
    }

    subtract(b: Vector): Vector {
        const a = new Vector(this.x, this.y);
        a.x -= b.x;
        a.y -= b.y;
        return a;
    }

    add(b: Vector): Vector {
        const a = new Vector(this.x, this.y);
        a.x += b.x;
        a.y += b.y;
        return a;
    }

    multiplyByScalar(scalar: number): Vector {
        const a = new Vector(this.x, this.y);
        a.x *= scalar;
        a.y *= scalar;
        return a;
    }
}
