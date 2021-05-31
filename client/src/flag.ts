import { Camera } from "./camera";
import { Flag as ServerFlag } from "../../server/src/flag";
import { Vector } from "../../server/src/vector";

export class Flag {
  position: Vector;
  radius: number;
  color: string;

  constructor() {
    this.color = 'white';
    this.radius = 25;
    this.position = new Vector(0, 0);
  }

  update(flag: ServerFlag) {
    this.position.x = flag.position.x;
    this.position.y = flag.position.y;
    this.radius = flag.radius;
  }

  draw(context: CanvasRenderingContext2D, camera: Camera) {
    
    // could check what the screen x and y values are here, 
    // and if they fall outside of the viewport just skip drawing them...
    // probably would be a good base class method...
    
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
