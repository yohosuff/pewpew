import { WallDto } from "./dtos/wall-dto";
import { Vector } from "./vector";
import { WallBase } from "./wall-base";

export class Wall extends WallBase {
  
  constructor(position?: Vector, bounds?: Vector, color?: string) {
    super();
    this.position = position;
    this.bounds = bounds;
    this.color = color;
  }

  dto() {
    const dto = new WallDto();
    dto.bounds = this.bounds;
    dto.position = this.position;
    dto.color = this.color;
    return dto;
  }
}
