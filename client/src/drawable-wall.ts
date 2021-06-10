import { Camera } from "./camera";
import { Wall } from "../../server/src/wall";
import { WallDto } from "../../server/src/dtos/wall-dto";

export class DrawableWall extends Wall {

  static fromDto(wall: WallDto) {
    const drawableWall = new DrawableWall();
    drawableWall.bounds = wall.bounds;
    drawableWall.color = wall.color;
    drawableWall.position = wall.position;
    return drawableWall;
  }

  draw(context: CanvasRenderingContext2D, camera: Camera) {
    context.fillStyle = this.color;
    const x = camera.getScreenX(this.position) - this.bounds.x;
    const y = camera.getScreenY(this.position) - this.bounds.y;
    context.fillRect(x, y, this.bounds.x * 2, this.bounds.y * 2);
  }
}
