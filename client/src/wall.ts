import { Camera } from "./camera";
import { WallDto } from "../../server/src/dtos/wall-dto";
import { WallBase } from "../../server/src/wall-base";
import * as Matter from 'matter-js';

export class Wall extends WallBase {

  static fromDto(dto: WallDto) {
    const wall = new Wall();
    wall.width = dto.w;
    wall.height = dto.h;
    wall.color = dto.color;
    const position = Matter.Vector.create();
    position.x = dto.x;
    position.y = dto.y;
    wall.position = position;
    return wall;
  }

  draw(context: CanvasRenderingContext2D, camera: Camera) {
    context.fillStyle = this.color;
    const x = camera.getScreenX(this.position) - this.width / 2;
    const y = camera.getScreenY(this.position) - this.height / 2;
    context.fillRect(x, y, this.width, this.height);
  }
}
