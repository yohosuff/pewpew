import { Camera } from "./camera";
import { Vector } from "./vector";
import { Flag as ServerFlag } from "../../server/src/flag";

export class Flag {
  position: Vector;
  radius: number;
  color: string;

  constructor() {
    this.color = 'white';
    this.radius = 25;
  }

  update(flag: ServerFlag) {
    this.position = flag.position;
    this.radius = flag.radius;
  }

  draw(context: CanvasRenderingContext2D, camera: Camera) {
    
    // could check what the screen x and y values are here, 
    // and if they fall outside of the viewport just skip drawing them...
    // probably would be a good base class method...
    
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(
      camera.getScreenX(this),
      camera.getScreenY(this),
      this.radius, 0, 2 * Math.PI,
    );
    context.fill();
    
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.font = "12px Arial";
    context.fillText(
      `FLAG`,
      camera.getScreenX(this),
      camera.getScreenY(this),
    );
    
  }

  getPositionString() {
    return `${this.position.x.toFixed()} ${this.position.y.toFixed()}`;
  }


}
