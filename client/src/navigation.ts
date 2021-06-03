import { Vector } from "../../server/src/vector";
import { Camera } from "./camera";
import { Flag } from "./flag";
import { LineSegment } from "./line-segment";
import { Player } from "./player";

export class Navigation {

    textAlignMap: Map<string, CanvasTextAlign>;
    textOffsetMap: Map<string, Vector>;
    iconOffsetMap: Map<string, Vector>;

    static readonly ICON_OFFSET = 15;
    static readonly TEXT_OFFSET = 50;

    constructor() {
        this.textAlignMap = new Map<string, CanvasTextAlign>();
        this.textAlignMap.set('top', 'center');
        this.textAlignMap.set('bottom', 'center');
        this.textAlignMap.set('left', 'left');
        this.textAlignMap.set('right', 'right');
    
        this.textOffsetMap = new Map<string, Vector>();
        this.textOffsetMap.set('top', new Vector(0, Navigation.TEXT_OFFSET));
        this.textOffsetMap.set('bottom', new Vector(0, -Navigation.TEXT_OFFSET));
        this.textOffsetMap.set('left', new Vector(Navigation.TEXT_OFFSET, 0));
        this.textOffsetMap.set('right', new Vector(-Navigation.TEXT_OFFSET, 0));

        this.iconOffsetMap = new Map<string, Vector>();
        this.iconOffsetMap.set('top', new Vector(0, Navigation.ICON_OFFSET));
        this.iconOffsetMap.set('bottom', new Vector(0, -Navigation.ICON_OFFSET));
        this.iconOffsetMap.set('left', new Vector(Navigation.ICON_OFFSET, 0));
        this.iconOffsetMap.set('right', new Vector(-Navigation.ICON_OFFSET, 0));
    }

    clamp(number: number, min: number, max: number) {
        return Math.min(Math.max(number, min), max);
    }

    draw(context: CanvasRenderingContext2D, camera: Camera, me: Player, flag: Flag) {
    
        const markerPosition = this.getMarker(me, flag, camera);
        
        if(markerPosition) {

            //icon
            const iconOffset = this.iconOffsetMap.get(markerPosition.side);
            context.fillStyle = 'white';
            context.beginPath();
            const iconScreenX = camera.getScreenX(markerPosition.position) + iconOffset.x;
            const iconScreenY = camera.getScreenY(markerPosition.position) + iconOffset.y;
            const iconScreenXClamped = this.clamp(iconScreenX, Navigation.ICON_OFFSET, window.innerWidth - Navigation.ICON_OFFSET);
            const iconScreenYClamped = this.clamp(iconScreenY, Navigation.ICON_OFFSET, window.innerHeight - Navigation.ICON_OFFSET);
            context.arc(iconScreenXClamped, iconScreenYClamped, 12.5, 0, 2 * Math.PI);
            context.fill();
            
            const fontSize = 18;
            context.fillStyle = 'black'
            context.font = `${fontSize}px Arial`;
            context.textAlign = 'center';
            context.fillText(`F`, iconScreenXClamped, iconScreenYClamped + 7);
            
            this.drawText(context, camera, me, flag, markerPosition, iconOffset);
        }
    }

    drawText(
        context: CanvasRenderingContext2D, 
        camera: Camera, 
        me: Player, 
        flag: Flag, 
        markerPosition: { side: any; position: any; }, 
        iconOffset: Vector
    ) {
        const textOffset = this.textOffsetMap.get(markerPosition.side);
        context.fillStyle = 'red';
        const fontSize = 12;
        context.font = `${fontSize}px Arial`;
        context.textAlign = this.textAlignMap.get(markerPosition.side);
        const distance = me.position.distanceFrom(flag.position) / 100;
        const textScreenX = camera.getScreenX(markerPosition.position) + iconOffset.x + textOffset.x;
        const textScreenY = camera.getScreenY(markerPosition.position) + iconOffset.y + textOffset.y;
        context.fillText(
            `${distance.toFixed(1)} m`,
            this.clamp(textScreenX, Navigation.ICON_OFFSET, window.innerWidth - Navigation.ICON_OFFSET),
            this.clamp(textScreenY, Navigation.ICON_OFFSET, window.innerHeight - Navigation.ICON_OFFSET) + fontSize / 2,
        );
    }

    getMarker(me: Player, flag: Flag, camera: Camera) {
        const r = flag.radius;
        let position = this.getMarkerPositionForSide(me, flag, camera.topBorder.applyOffset(-r, -r, +r, -r), camera);

        if (position) {
            return { side: 'top', position };
        }

        position = this.getMarkerPositionForSide(me, flag, camera.bottomBorder.applyOffset(-r, +r, +r, +r), camera);

        if (position) {
            return { side: 'bottom', position };
        }

        position = this.getMarkerPositionForSide(me, flag, camera.leftBorder.applyOffset(-r, -r, -r, +r), camera);

        if (position) {
            return { side: 'left', position };
        }

        position = this.getMarkerPositionForSide(me, flag, camera.rightBorder.applyOffset(+r, -r, +r, +r), camera);

        if (position) {
            return { side: 'right', position };
        }

        return undefined;
    }
    
    getMarkerPositionForSide(me: Player, flag: Flag, side: LineSegment, camera: Camera) {
        return this.getLineSegmentsIntersectionPoint(
            me.position, 
            flag.position,
            camera.getWorldPosition(side.a),
            camera.getWorldPosition(side.b),
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
