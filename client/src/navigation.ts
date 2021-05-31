import { Vector } from "../../server/src/vector";
import { Camera } from "./camera";
import { Flag } from "./flag";
import { Player } from "./player";

export class Navigation {

    readonly left = 0;
    readonly right = window.innerWidth;
    readonly top = 0;
    readonly bottom = window.innerHeight;

    lineSegments = {
        top: [
            new Vector(this.left, this.top),
            new Vector(this.right, this.top)
        ],
        bottom: [
            new Vector(this.left, this.bottom),
            new Vector(this.right, this.bottom)
        ],
        left: [
            new Vector(this.left, this.top),
            new Vector(this.left, this.bottom)
        ],
        right: [
            new Vector(this.right, this.top),
            new Vector(this.right, this.bottom)
        ],
    };

    draw(context: CanvasRenderingContext2D, camera: Camera, me: Player, flag: Flag) {
    
        const navMarkerPosition = this.getNavMarkerPosition(me, flag, camera);
        
        if(navMarkerPosition) {
            context.fillStyle = 'white';
            context.beginPath();
            context.arc(
                camera.getScreenX(navMarkerPosition),
                camera.getScreenY(navMarkerPosition),
                25, 0, 2 * Math.PI,
            );
            context.fill();
        }
    }

    getNavMarkerPosition(me: Player, flag: Flag, camera: Camera) {
        let point: Vector;

        point = this.getNavMarkerPositionForSide(me, flag, this.lineSegments.top, camera);

        if (point) {
            return point;
        }

        point = this.getNavMarkerPositionForSide(me, flag, this.lineSegments.bottom, camera);

        if (point) {
            return point;
        }

        point = this.getNavMarkerPositionForSide(me, flag, this.lineSegments.left, camera);

        if (point) {
            return point;
        }

        point = this.getNavMarkerPositionForSide(me, flag, this.lineSegments.right, camera);

        if (point) {
            return point;
        }

        return point;
    }
    
    getNavMarkerPositionForSide(me: Player, flag: Flag, side: Vector[], camera: Camera) {
        return this.getLineSegmentsIntersectionPoint(
            me.position, 
            flag.position,
            camera.getWorldPosition(side[0]),
            camera.getWorldPosition(side[1]),
        );
    }
    
    // https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
    getLineSegmentsIntersectionPoint(p: Vector, p2: Vector, q: Vector, q2: Vector) {
        const r = p2.subtract(p);
        const s = q2.subtract(q);
        const uNumerator = q.subtract(p).crossProduct(r);
        const denominator = r.crossProduct(s);
        const collinear = uNumerator === 0 && denominator === 0;
    
        if (collinear) { return; }
    
        const parallel = denominator === 0;
    
        if (parallel) { return; }
    
        const u = uNumerator / denominator;
        const t = q.subtract(p).crossProduct(s) / denominator;
        const intersecting = (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1);
    
        if(!intersecting) { return; }
    
        const intersection = p.add(r.multiplyByScalar(t));
    
        return intersection;
    }
}
