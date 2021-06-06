import { PlayerDto } from "../../server/src/dtos/player-dto";
import { Vector } from "../../server/src/vector";
import { Camera } from "./camera";
import { Input } from "./input";

// client and server should share this class
export class Player {
    id: string;
    name: string;
    position: Vector;
    radius: number;
    color: string;
    input: Input;
    velocity: Vector;
    score: number;

    constructor(color: string) {
        this.color = color;
        this.position = Vector.ZERO;
        this.radius = 50;
        this.input = new Input();
        this.velocity = Vector.ZERO;
        this.score = 0;
    }

    static createFromPlayerDto(dto: PlayerDto) {
        const player = new Player(dto.color);
        player.id = dto.id;
        player.name = dto.name;
        player.position.assign(dto.position);
        player.radius = dto.radius;
        player.score = dto.score;
        return player;
    }

    draw(context: CanvasRenderingContext2D, camera: Camera) {
        context.fillStyle = this.color;        
        context.beginPath();
        context.arc(
            camera.getScreenX(this.position),
            camera.getScreenY(this.position),
            this.radius, 0, 2 * Math.PI,
        );
        context.fill();

        this.drawEngineThrust(context, camera);
        //this.drawSpeedArrow(context, camera);
        //this.drawScreenPosition(context, camera);
        this.drawName(context, camera);
    }

    drawName(context: CanvasRenderingContext2D, camera: Camera) {
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = "12px Arial";
        context.fillText(
            `${this.name ?? this.id}`,
            camera.getScreenX(this.position),
            camera.getScreenY(this.position),
        );
    }

    drawScreenPosition(context: CanvasRenderingContext2D, camera: Camera) {
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = "12px Arial";
        context.fillText(
            `${camera.getScreenPosition(this.position).getString()}`,
            camera.getScreenX(this.position),
            camera.getScreenY(this.position),
        );
    }

    drawSpeedArrow(context: CanvasRenderingContext2D, camera: Camera) {
        // speed
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = "12px Arial";
        const speed = this.velocity.magnitude / 100;
        context.fillText(
            `${speed.toFixed(1)} m/s`,
            camera.getScreenX(this.position),
            camera.getScreenY(this.position) + 30,
        );

        // arrow
        const a = camera.getScreenPosition(this.position);
        const b = a.add(this.velocity.getUnitVector().multiplyByScalar(15));
        context.strokeStyle = 'white';
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();

        //arrow origin
        context.fillStyle = 'white'
        context.beginPath();
        context.arc(
            camera.getScreenX(this.position),
            camera.getScreenY(this.position),
            3, 0, 2 * Math.PI,
        );
        context.fill();
    }

    drawEngineThrust(context: CanvasRenderingContext2D, camera: Camera) {
        const screenPosition = camera.getScreenPosition(this.position);
        const flameLength = 100;
        const flameWidth = 20;
        const gradientPoint0 = new Vector(0, 0);
        const gradientPoint1 = new Vector(0, 0);
        const rectPosition = new Vector(0, 0);
        let rectWidth: number;
        let rectHeight: number;

        if (this.input.moveLeft.pressed) {
            gradientPoint0.x = screenPosition.x + this.radius;
            gradientPoint0.y = screenPosition.y;
            gradientPoint1.x = screenPosition.x + (this.radius + flameLength);
            gradientPoint1.y = screenPosition.y;
            rectPosition.x = screenPosition.x + this.radius;
            rectPosition.y = screenPosition.y - flameWidth / 2;
            rectWidth = flameLength;
            rectHeight = flameWidth;
            this.drawEngineThrustHelper(context, gradientPoint0, gradientPoint1, rectPosition, rectWidth, rectHeight);
        }

        if (this.input.moveUp.pressed) {
            gradientPoint0.x = screenPosition.x;
            gradientPoint0.y = screenPosition.y + this.radius;
            gradientPoint1.x = screenPosition.x;
            gradientPoint1.y = screenPosition.y + (this.radius + flameLength);
            rectPosition.x = screenPosition.x - flameWidth / 2;
            rectPosition.y = screenPosition.y + this.radius;
            rectWidth = flameWidth;
            rectHeight = flameLength;
            this.drawEngineThrustHelper(context, gradientPoint0, gradientPoint1, rectPosition, rectWidth, rectHeight);
        }

        if (this.input.moveRight.pressed) {
            gradientPoint0.x = screenPosition.x - this.radius;
            gradientPoint0.y = screenPosition.y;
            gradientPoint1.x = screenPosition.x - (this.radius + flameLength);
            gradientPoint1.y = screenPosition.y;
            rectPosition.x = screenPosition.x - (this.radius + flameLength);
            rectPosition.y = screenPosition.y - flameWidth / 2;
            rectWidth = flameLength;
            rectHeight = flameWidth;
            this.drawEngineThrustHelper(context, gradientPoint0, gradientPoint1, rectPosition, rectWidth, rectHeight);
        }

        if (this.input.moveDown.pressed) {
            gradientPoint0.x = screenPosition.x;
            gradientPoint0.y = screenPosition.y - this.radius;
            gradientPoint1.x = screenPosition.x;
            gradientPoint1.y = screenPosition.y - (this.radius + flameLength);
            rectPosition.x = screenPosition.x - flameWidth / 2;
            rectPosition.y = screenPosition.y - (this.radius + flameLength);
            rectWidth = flameWidth;
            rectHeight = flameLength;
            this.drawEngineThrustHelper(context, gradientPoint0, gradientPoint1, rectPosition, rectWidth, rectHeight);
        }
    }

    drawEngineThrustHelper(
        context: CanvasRenderingContext2D, 
        gradientPoint0: Vector, 
        gradientPoint1: Vector, 
        rectPosition: Vector, 
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
        return `${this.position.getString()}`;
    }
}
