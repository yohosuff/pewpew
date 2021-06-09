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
    const range = 900;
    this.position = new Vector(
      this.getRandomNumber(-range, range),
      this.getRandomNumber(-range, range),
    );
  }
}
