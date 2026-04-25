import { FactoryUnit } from "./factory-unit";
import { Flow } from "./flow";
import { Renderer } from "./render";

function serializePos(x: number, y: number): number {
  return (y << 16) | x;
}

export class Factory {
  private unassignedWorkforceUnits: number = 0;

  private readonly units: Map<number, FactoryUnit> = new Map();
  private readonly flows: Map<number, Flow> = new Map();

  constructor(private money: number) {}

  placeUnit(unit: FactoryUnit, x: number, y: number): boolean {
    const key = serializePos(x, y);
    if (this.units.has(key)) return false;
    this.units.set(key, unit);
    return true;
  }

  removeUnit(x: number, y: number): void {
    this.units.delete(serializePos(x, y));
  }

  update(): void {
    this.units.forEach((unit) => unit.update());
    this.flows.forEach((flow) => flow.update());
  }

  render(renderer: Renderer): void {
    this.units.forEach((unit) => unit.render(renderer));
    this.flows.forEach((flow) => flow.render(renderer));
  }
}
