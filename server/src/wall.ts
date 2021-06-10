import { WallDto } from "./dtos/wall-dto";
import { Vector } from "./vector";

export class Wall {
  position: Vector;
  bounds: Vector;
  color: string;
  
  constructor(position?: Vector, bounds?: Vector, color?: string) {
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
