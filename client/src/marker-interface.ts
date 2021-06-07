import { Vector } from "../../server/src/vector";
import { IIntercept } from "./intercept-interface";

export interface IMarker {
  id?: string;
  name: string;
  position: Vector;
  radius: number;
  color: string;
  intercept?: IIntercept;
}
