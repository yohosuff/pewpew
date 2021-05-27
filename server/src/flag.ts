import { Vector } from "./vector";

export class Flag {
  position: Vector;
  radius: number;

  constructor() {
    this.reposition();
    this.radius = 25;
  }

  private getRandomNumber(min: number, max: number) {
    return min + Math.floor(Math.random() * (max - min));
  }

  reposition() {
    this.position = new Vector(
      this.getRandomNumber(-5000, 5000),
      this.getRandomNumber(-5000, 5000),
    );
  }
}
