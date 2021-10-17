import Matter from "matter-js";
import { FlagDto } from "./dtos/flag-dto";
import { FlagBase } from "./flag-base";

export class Flag extends FlagBase {
  
  range: number;
  
  constructor(range: number) {
    super();
    this.range = range;
    this.body = Matter.Bodies.circle(0, 0, 25, { isStatic: true, isSensor: true });
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
    const halfRange = this.range / 2;
    const position = Matter.Vector.create();
    position.x = this.getRandomNumber(-halfRange, halfRange);
    position.y = this.getRandomNumber(-halfRange, halfRange);
    Matter.Body.setPosition(this.body, position);
  }

  private getRandomNumber(min: number, max: number) {
    return min + Math.floor(Math.random() * (max - min));
  }
}
