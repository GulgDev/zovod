import { Renderer } from "./render";
import { FactoryMap } from "./map";

export class Factory {
  readonly map: FactoryMap = new FactoryMap();

  private unassignedWorkforceUnits = 0;

  constructor(private money: number) {}

  update(): void {
    for (const unit of this.map.getAllUnits()) unit.update();
  }

  render(renderer: Renderer): void {
    for (const unit of this.map.getAllUnits()) unit.render(renderer);
  }
}
