import { Camera } from "./camera";
import { FlagDto } from "../../server/src/dtos/flag-dto";
import { FlagBase } from "../../server/src/flag-base";
import { Vector } from "../../server/src/vector";
import { IMarker } from "./marker-interface";

export class Flag extends FlagBase implements IMarker {
  
  static fromDto(dto: FlagDto) {
    const flag = new Flag();
    flag.color = dto.color;
    flag.name = dto.name;
    flag.position = Vector.fromDto(dto.position);
    flag.radius = dto.radius;
    return flag;
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
    
    context.fillStyle = 'black';
    context.textAlign = 'center';
    const fontSize = 12;
    context.font = `${fontSize}px Arial`;
    context.fillText(
      `FLAG`,
      camera.getScreenX(this.position),
      camera.getScreenY(this.position) + fontSize / 2,
    );
    
  }

  getPositionString() {
    return `${this.position.x.toFixed()} ${this.position.y.toFixed()}`;
  }
}
