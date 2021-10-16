import { IIntercept } from "./intercept-interface";

export interface IMarker {
  id?: string;
  name: string;
  body: Matter.Body;
  color: string;
  intercept?: IIntercept;
}
