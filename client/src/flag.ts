import { Camera } from "./camera";
import { FlagDto } from "../../server/src/dtos/flag-dto";
import { FlagBase } from "../../server/src/flag-base";
import { IMarker } from "./marker-interface";
import * as Matter from 'matter-js';

export class Flag extends FlagBase implements IMarker {
  
  static fromDto(dto: FlagDto) {
    const flag = new Flag();
    flag.color = dto.color;
    flag.name = dto.name;
    flag.body = Matter.Bodies.circle(dto.position.x, dto.position.y, dto.radius);
    return flag;
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
    
    context.fillStyle = 'black';
    context.textAlign = 'center';
    const fontSize = 12;
    context.font = `${fontSize}px Arial`;
    context.fillText(
      `FLAG`,
      camera.getScreenX(this.body.position),
      camera.getScreenY(this.body.position) + fontSize / 2,
    );
    
  }

  getPositionString() {
    return `${this.body.position.x.toFixed()} ${this.body.position.y.toFixed()}`;
  }
}
