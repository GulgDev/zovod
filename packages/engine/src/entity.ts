import { Renderer } from "./render";

export interface Entity {
  update(): void;
  render(renderer: Renderer): void;
}
