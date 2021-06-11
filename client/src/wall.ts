import { Camera } from "./camera";
import { WallDto } from "../../server/src/dtos/wall-dto";
import { WallBase } from "../../server/src/wall-base";

export class Wall extends WallBase {

  static fromDto(dto: WallDto) {
    const wall = new Wall();
    wall.bounds = dto.bounds;
    wall.color = dto.color;
    wall.position = dto.position;
    return wall;
  }

  draw(context: CanvasRenderingContext2D, camera: Camera) {
    context.fillStyle = this.color;
    const x = camera.getScreenX(this.position) - this.bounds.x;
    const y = camera.getScreenY(this.position) - this.bounds.y;
    context.fillRect(x, y, this.bounds.x * 2, this.bounds.y * 2);
  }
}
