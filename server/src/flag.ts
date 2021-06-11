import { FlagDto } from "./dtos/flag-dto";
import { FlagBase } from "./flag-base";
import { Vector } from "./vector";

export class Flag extends FlagBase {
  
  readonly RANGE = 4900;

  constructor() {
    super();
    this.radius = 25;
    this.color = 'white';
    this.name = 'flag';
    this.reposition();
  }

  dto() {
    const dto = new FlagDto();
    dto.position = this.position;
    dto.radius = this.radius;
    dto.name = this.name;
    dto.color = this.color;
    return dto;
  }

  reposition() {
    const range = this.RANGE;
    this.position = new Vector(
      this.getRandomNumber(-range, range),
      this.getRandomNumber(-range, range),
    );
  }

  private getRandomNumber(min: number, max: number) {
    return min + Math.floor(Math.random() * (max - min));
  }
}
