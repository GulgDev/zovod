import { FactoryUnit } from "../factory-unit";
import { packCoords } from "./util/math";

export class FactoryUnitGrid {
  private readonly units: Map<number, FactoryUnit> = new Map();

  placeUnit(unit: FactoryUnit, x: number, y: number): void {
    FactoryUnitGrid.validatePosition(x, y);

    const key = packCoords(x, y);
    if (this.units.has(key))
      throw new Error(`A unit is already placed at (${x}, ${y})`);
    else this.units.set(key, unit);
  }

  removeUnitAt(x: number, y: number): void {
    FactoryUnitGrid.validatePosition(x, y);

    if (!this.units.delete(packCoords(x, y)))
      throw new Error(`No unit to remove at (${x}, ${y})`);
  }

  getUnitAt(x: number, y: number): FactoryUnit | undefined {
    FactoryUnitGrid.validatePosition(x, y);

    return this.units.get(packCoords(x, y));
  }

  getAllUnits(): IterableIterator<FactoryUnit> {
    return this.units.values();
  }

  private static validatePosition(x: number, y: number) {
    if (!FactoryUnitGrid.isUnitCell(x, y))
      throw new Error(`Invalid unit position (${x}, ${y})`);
  }

  static isUnitCell(x: number, y: number): boolean {
    return x % 2 === 0 && (y - x / 2) % 2 === 0;
  }
}
