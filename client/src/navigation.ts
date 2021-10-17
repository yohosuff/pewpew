import * as Matter from "matter-js";
import { Camera } from "./camera";
import { LineSegment } from "./line-segment";
import { IMarker } from "./marker-interface";
import { Player } from "./player";

export class Navigation {

    textAlignMap: Map<string, CanvasTextAlign>;
    textOffsetDirectionMap: Map<string, Matter.Vector>;
    iconOffsetDirectionMap: Map<string, Matter.Vector>;

    static readonly ICON_OFFSET = 15;
    static readonly TEXT_OFFSET = 25;

    constructor() {
        this.textAlignMap = new Map<string, CanvasTextAlign>();
        this.textAlignMap.set('top', 'center');
        this.textAlignMap.set('bottom', 'center');
        this.textAlignMap.set('left', 'left');
        this.textAlignMap.set('right', 'right');
    
        this.textOffsetDirectionMap = new Map<string, Matter.Vector>();
        this.textOffsetDirectionMap.set('top', Matter.Vector.create(0, 1));
        this.textOffsetDirectionMap.set('bottom', Matter.Vector.create(0, -1));
        this.textOffsetDirectionMap.set('left', Matter.Vector.create(1, 0));
        this.textOffsetDirectionMap.set('right', Matter.Vector.create(-1, 0));

        this.iconOffsetDirectionMap = new Map<string, Matter.Vector>();
        this.iconOffsetDirectionMap.set('top', Matter.Vector.create(0, 1));
        this.iconOffsetDirectionMap.set('bottom', Matter.Vector.create(0, -1));
        this.iconOffsetDirectionMap.set('left', Matter.Vector.create(1, 0));
        this.iconOffsetDirectionMap.set('right', Matter.Vector.create(-1, 0));
    }

    getIconOffset(marker: IMarker) {
        const iconOffsetDirection = this.iconOffsetDirectionMap.get(marker.intercept.side);
        const offset = marker.body.circleRadius + Navigation.ICON_OFFSET;
        return Matter.Vector.mult(iconOffsetDirection, offset);
    }

    getTextOffset(marker: IMarker) {
        const textOffsetDirection = this.textOffsetDirectionMap.get(marker.intercept.side);
        const offset = marker.body.circleRadius + Navigation.ICON_OFFSET + Navigation.TEXT_OFFSET;
        return Matter.Vector.mult(textOffsetDirection, offset);
    }

    draw(context: CanvasRenderingContext2D, camera: Camera, me: Player, markers: IMarker[]) {
        markers.forEach(marker => {
            this.drawMarker(context, camera, me, marker);
        });
    }

    drawMarker(context: CanvasRenderingContext2D, camera: Camera, me: Player, marker: IMarker) {
        this.setMarkerIntercept(me, marker, camera);
        if(marker.intercept) {
            this.drawIcon(context, camera, marker);
            this.drawText(context, camera, marker, me);
        }
    }

    drawIcon(
        context: CanvasRenderingContext2D,
        camera: Camera,
        marker: IMarker
    ) {
        const iconOffset = this.getIconOffset(marker);
        context.fillStyle = marker.color;
        context.beginPath();
        const iconScreenX = camera.getScreenX(marker.intercept.position) + iconOffset.x;
        const iconScreenY = camera.getScreenY(marker.intercept.position) + iconOffset.y;
        const iconScreenXClamped = Navigation.clamp(iconScreenX, Navigation.ICON_OFFSET, window.innerWidth - Navigation.ICON_OFFSET);
        const iconScreenYClamped = Navigation.clamp(iconScreenY, Navigation.ICON_OFFSET, window.innerHeight - Navigation.ICON_OFFSET);
        context.arc(iconScreenXClamped, iconScreenYClamped, 12.5, 0, 2 * Math.PI);
        context.fill();
        
        const fontSize = 18;
        context.fillStyle = 'black'
        context.font = `${fontSize}px Arial`;
        context.textAlign = 'center';
        
        const symbol = marker.name || marker.id;
        context.fillText(`${symbol.charAt(0).toUpperCase()}`, iconScreenXClamped, iconScreenYClamped + 7);
    }

    drawText(
        context: CanvasRenderingContext2D,
        camera: Camera,
        marker: IMarker,
        me: Player,
    ) {
        const textOffset = this.getTextOffset(marker);
        context.fillStyle = 'red';
        const fontSize = 12;
        context.font = `${fontSize}px Arial`;
        context.textAlign = this.textAlignMap.get(marker.intercept.side);

        const distance = this.distanceBetween(me.body.position, marker.body.position) / 100;
        const textScreenX = camera.getScreenX(marker.intercept.position) + textOffset.x;
        const textScreenY = camera.getScreenY(marker.intercept.position) + textOffset.y;
        context.fillText(
            `${distance.toFixed(1)} m`,
            Navigation.clamp(textScreenX, Navigation.ICON_OFFSET, window.innerWidth - Navigation.ICON_OFFSET),
            Navigation.clamp(textScreenY, Navigation.ICON_OFFSET, window.innerHeight - Navigation.ICON_OFFSET) + fontSize / 2,
        );
    }

    distanceBetween(a: Matter.Vector, b: Matter.Vector): number {
        const distanceX = a.x - b.x;
        const distanceY = a.y - b.y;
        return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    }

    setMarkerIntercept(me: Player, marker: IMarker, camera: Camera) {
        marker.intercept = undefined;
        const r = marker.body.circleRadius;

        let position = this.getMarkerPositionForSide(me, marker, camera.topBorder.applyOffset(-r, -r, +r, -r), camera);

        if (position) {
            marker.intercept = { side: 'top', position };
            return;
        }

        position = this.getMarkerPositionForSide(me, marker, camera.bottomBorder.applyOffset(-r, +r, +r, +r), camera);

        if (position) {
            marker.intercept = { side: 'bottom', position };
            return;
        }

        position = this.getMarkerPositionForSide(me, marker, camera.leftBorder.applyOffset(-r, -r, -r, +r), camera);

        if (position) {
            marker.intercept = { side: 'left', position };
            return;
        }

        position = this.getMarkerPositionForSide(me, marker, camera.rightBorder.applyOffset(+r, -r, +r, +r), camera);

        if (position) {
            marker.intercept = { side: 'right', position };
            return;
        }
    }
    
    getMarkerPositionForSide(me: Player, marker: IMarker, side: LineSegment, camera: Camera) {
        return this.getLineSegmentsIntersectionPoint(
            me.body.position, 
            marker.body.position,
            camera.getWorldPosition(side.a),
            camera.getWorldPosition(side.b),
        );
    }
    
    // https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
    getLineSegmentsIntersectionPoint(p: Matter.Vector, p2: Matter.Vector, q: Matter.Vector, q2: Matter.Vector) {
        
        const r = Matter.Vector.sub(p2, p);
        const s = Matter.Vector.sub(q2, q);

        const uNumerator = Matter.Vector.cross(Matter.Vector.sub(q, p), r);
        const denominator = Matter.Vector.cross(r, s);
        
        const collinear = uNumerator === 0 && denominator === 0;
    
        if (collinear) { return; }
    
        const parallel = denominator === 0;
    
        if (parallel) { return; }
    
        const u = uNumerator / denominator;
        const t = Matter.Vector.cross(Matter.Vector.sub(q, p), s) / denominator;

        const intersecting = (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1);
    
        if(!intersecting) { return; }
    
        const intersection = Matter.Vector.add(p, Matter.Vector.mult(r, t));
    
        return intersection;
    }

    static clamp(number: number, min: number, max: number) {
        return Math.min(Math.max(number, min), max);
    }
}
