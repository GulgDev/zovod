import { Renderer } from "./render";
import { FactoryMap } from "./factory-map";

export class Factory {
  readonly map: FactoryMap = new FactoryMap();

  update(deltaTime: number): void {
    for (const unit of this.map.getAllUnits()) unit.update(deltaTime);
  }

  render(renderer: Renderer): void {
    for (const unit of this.map.getAllUnits()) unit.render(renderer);
  }
}
