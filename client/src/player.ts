import { Camera } from "./camera";
import { Input } from "./input";
import { IMarker } from "./marker-interface";

import { PlayerBase } from "../../server/src/player-base";
import { PlayerDto } from "../../server/src/dtos/player-dto";
import * as Matter from 'matter-js';

export class Player extends PlayerBase implements IMarker {
    
    input: Input;
    
    constructor() {
        super();
        this.input = new Input();
    }

    static fromDto(dto: PlayerDto) {
        const player = new Player();
        player.color = dto.color;
        player.id = dto.id;
        player.name = dto.name;
        player.body = Matter.Bodies.circle(dto.position.x, dto.position.y, dto.radius);
        player.score = dto.score;
        return player;
    }

    draw(context: CanvasRenderingContext2D, camera: Camera) {
        context.fillStyle = this.color;        
        context.beginPath();
        context.arc(
            camera.getScreenX(this.body.position),
            camera.getScreenY(this.body.position),
            this.body.circleRadius, 0, 2 * Math.PI,
        );
        context.fill();

        this.drawEngineThrust(context, camera);
        this.drawSpeedArrow(context, camera);
        // this.drawScreenPosition(context, camera);
        this.drawWorldPosition(context, camera);
        this.drawName(context, camera);
    }

    drawName(context: CanvasRenderingContext2D, camera: Camera) {
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = "12px Arial";
        context.fillText(
            `${this.name ?? this.id}`,
            camera.getScreenX(this.body.position),
            camera.getScreenY(this.body.position) - this.body.circleRadius / 2,
        );
    }

    drawScreenPosition(context: CanvasRenderingContext2D, camera: Camera) {
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = "12px Arial";
        context.fillText(
            `${camera.getScreenPosition(this.body.position).x}, ${camera.getScreenPosition(this.body.position).y}`,
            camera.getScreenX(this.body.position),
            camera.getScreenY(this.body.position) + this.body.circleRadius + 20,
        );
    }

    drawWorldPosition(context: CanvasRenderingContext2D, camera: Camera) {
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = "12px Arial";
        context.fillText(
            `${this.body.position.x.toFixed(0)}, ${this.body.position.y.toFixed(0)}`,
            camera.getScreenX(this.body.position),
            camera.getScreenY(this.body.position) + this.body.circleRadius + 20,
        );
    }

    drawSpeedArrow(context: CanvasRenderingContext2D, camera: Camera) {
        // speed
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = "12px Arial";

        // TODO: use this.body.speed here once physics engine is running client side
        const speed = Matter.Vector.magnitude(this.body.velocity) / 10;
        
        context.fillText(
            `${speed.toFixed(1)} m/s`,
            camera.getScreenX(this.body.position),
            camera.getScreenY(this.body.position) + 30,
        );

        // arrow line
        const a = camera.getScreenPosition(this.body.position);
        const unitVector = Matter.Vector.normalise(this.body.velocity);
        const vector = Matter.Vector.mult(unitVector, 15);
        const b = Matter.Vector.add(a, vector);

        context.strokeStyle = 'white';
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();

        //arrow origin
        context.fillStyle = 'white'
        context.beginPath();
        context.arc(
            camera.getScreenX(this.body.position),
            camera.getScreenY(this.body.position),
            3, 0, 2 * Math.PI,
        );
        context.fill();
    }

    drawEngineThrust(context: CanvasRenderingContext2D, camera: Camera) {
        const screenPosition = camera.getScreenPosition(this.body.position);
        const flameLength = 100;
        const flameWidth = 20;
        const gradientPoint0 = Matter.Vector.create(0, 0);
        const gradientPoint1 = Matter.Vector.create(0, 0);
        const rectPosition = Matter.Vector.create(0, 0);
        let rectWidth: number;
        let rectHeight: number;

        if (this.input.moveLeft.pressed) {
            gradientPoint0.x = screenPosition.x + this.body.circleRadius;
            gradientPoint0.y = screenPosition.y;
            gradientPoint1.x = screenPosition.x + (this.body.circleRadius + flameLength);
            gradientPoint1.y = screenPosition.y;
            rectPosition.x = screenPosition.x + this.body.circleRadius;
            rectPosition.y = screenPosition.y - flameWidth / 2;
            rectWidth = flameLength;
            rectHeight = flameWidth;
            this.drawEngineThrustHelper(context, gradientPoint0, gradientPoint1, rectPosition, rectWidth, rectHeight);
        }

        if (this.input.moveUp.pressed) {
            gradientPoint0.x = screenPosition.x;
            gradientPoint0.y = screenPosition.y + this.body.circleRadius;
            gradientPoint1.x = screenPosition.x;
            gradientPoint1.y = screenPosition.y + (this.body.circleRadius + flameLength);
            rectPosition.x = screenPosition.x - flameWidth / 2;
            rectPosition.y = screenPosition.y + this.body.circleRadius;
            rectWidth = flameWidth;
            rectHeight = flameLength;
            this.drawEngineThrustHelper(context, gradientPoint0, gradientPoint1, rectPosition, rectWidth, rectHeight);
        }

        if (this.input.moveRight.pressed) {
            gradientPoint0.x = screenPosition.x - this.body.circleRadius;
            gradientPoint0.y = screenPosition.y;
            gradientPoint1.x = screenPosition.x - (this.body.circleRadius + flameLength);
            gradientPoint1.y = screenPosition.y;
            rectPosition.x = screenPosition.x - (this.body.circleRadius + flameLength);
            rectPosition.y = screenPosition.y - flameWidth / 2;
            rectWidth = flameLength;
            rectHeight = flameWidth;
            this.drawEngineThrustHelper(context, gradientPoint0, gradientPoint1, rectPosition, rectWidth, rectHeight);
        }

        if (this.input.moveDown.pressed) {
            gradientPoint0.x = screenPosition.x;
            gradientPoint0.y = screenPosition.y - this.body.circleRadius;
            gradientPoint1.x = screenPosition.x;
            gradientPoint1.y = screenPosition.y - (this.body.circleRadius + flameLength);
            rectPosition.x = screenPosition.x - flameWidth / 2;
            rectPosition.y = screenPosition.y - (this.body.circleRadius + flameLength);
            rectWidth = flameWidth;
            rectHeight = flameLength;
            this.drawEngineThrustHelper(context, gradientPoint0, gradientPoint1, rectPosition, rectWidth, rectHeight);
        }
    }

    drawEngineThrustHelper(
        context: CanvasRenderingContext2D, 
        gradientPoint0: Matter.Vector, 
        gradientPoint1: Matter.Vector, 
        rectPosition: Matter.Vector, 
        rectWidth: number, 
        rectHeight: number
    ) {
        const gradient = context.createRadialGradient(
            gradientPoint0.x,
            gradientPoint0.y,
            10,
            gradientPoint1.x,
            gradientPoint1.y,
            3);

        gradient.addColorStop(0, 'rgba(0,0,255,1)');
        gradient.addColorStop(1, 'rgba(0,0,255,0)');
        
        context.fillStyle = gradient;

        context.fillRect(
            rectPosition.x,
            rectPosition.y,
            rectWidth,
            rectHeight,
        );
    }

    getPositionString() {
        return `${this.body.position.x}, ${this.body.position.y}`;
    }
}
