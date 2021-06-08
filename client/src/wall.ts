import { Camera } from "./camera";
import { Wall as ServerWall } from "../../server/src/wall";

export class Wall extends ServerWall {
  draw(context: CanvasRenderingContext2D, camera: Camera) {
    context.fillStyle = this.color;
    const x = camera.getScreenX(this.position) - this.bounds.x;
    const y = camera.getScreenY(this.position) - this.bounds.y;
    context.fillRect(x, y, this.bounds.x * 2, this.bounds.y * 2);
  }
}
