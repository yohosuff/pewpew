import Matter from "matter-js";
import { FlagDto } from "./dtos/flag-dto";
import { FlagBase } from "./flag-base";

export class Flag extends FlagBase {
  
  readonly RANGE = 4900;

  constructor() {
    super();
    this.body = Matter.Bodies.circle(0, 0, 25, { isStatic: true });
    this.color = 'white';
    this.name = 'flag';
    this.reposition();
  }

  dto() {
    const dto = new FlagDto();
    dto.position = this.body.position;
    dto.radius = this.body.circleRadius;
    dto.name = this.name;
    dto.color = this.color;
    return dto;
  }

  reposition() {
    const range = this.RANGE;
    const position = Matter.Vector.create();
    position.x = this.getRandomNumber(-range, range);
    position.y = this.getRandomNumber(-range, range);
    Matter.Body.setPosition(this.body, position);
  }

  private getRandomNumber(min: number, max: number) {
    return min + Math.floor(Math.random() * (max - min));
  }
}
