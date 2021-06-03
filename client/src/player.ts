import { PlayerDto } from "../../server/src/dtos/player-dto";
import { Vector } from "../../server/src/vector";
import { Camera } from "./camera";
import { Input } from "./input";

export class Player {
    id: string;
    position: Vector;
    radius: number;
    color: string;
    input: Input;
    velocity: Vector;

    debugging = false;

    constructor(color: string) {
        this.color = color;
        this.position = new Vector(0, 0);
        this.radius = 50;
        this.input = new Input();
        this.velocity = Vector.ZERO;
    }

    static createFromPlayerDto(playerDto: PlayerDto) {
        const player = new Player(playerDto.color);
        player.id = playerDto.id;
        player.position = new Vector(
            playerDto.position.x,
            playerDto.position.y,
        );
        player.radius = playerDto.radius;
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
        this.drawSpeedArrow(context, camera);

        if(this.debugging) {
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.font = "12px Arial";
            context.fillText(
                `${camera.getScreenPosition(this.position).getString()}`,
                camera.getScreenX(this.position),
                camera.getScreenY(this.position),
            );
        }
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

        if (this.input.left) {
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

        if (this.input.up) {
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

        if (this.input.right) {
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

        if (this.input.down) {
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
        const linearGradient = context.createLinearGradient(
            gradientPoint0.x,
            gradientPoint0.y,
            gradientPoint1.x,
            gradientPoint1.y);

        linearGradient.addColorStop(0, 'blue');
        linearGradient.addColorStop(1, 'transparent');
        context.fillStyle = linearGradient;

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
