import Matter from "matter-js";
import { WallDto } from "./dtos/wall-dto";
import { WallBase } from "./wall-base";

export class Wall extends WallBase {
  body: Matter.Body;
    
  constructor(x: number, y: number, w: number, h: number, color?: string) {
    super();
    this.color = color;
    this.body = Matter.Bodies.rectangle(x, y, w, h, { isStatic: true });
    this.width = w;
    this.height = h;
  }

  dto() {
    //matter.js - are rectangle positions in the center of the rectangle?
    const dto = new WallDto();
    dto.x = this.body.position.x;
    dto.x = this.body.position.x;
    dto.w = this.width;
    dto.h = this.height;
    dto.color = this.color;
    return dto;
  }
}
