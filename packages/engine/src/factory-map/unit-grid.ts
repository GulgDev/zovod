import type { FactoryUnit } from "../factory-units/abstract/factory-unit";
import { packCoords } from "./util/math";

export class FactoryUnitGrid {
  private readonly units = new Map<number, FactoryUnit>();

  placeUnit(unit: FactoryUnit, x: number, y: number): boolean {
    FactoryUnitGrid.validatePosition(x, y);

    const key = packCoords(x, y);
    if (this.units.has(key)) return false;
    this.units.set(key, unit);
    return true;
  }

  removeUnitAt(x: number, y: number): boolean {
    FactoryUnitGrid.validatePosition(x, y);

    const key = packCoords(x, y);

    // Clean-up before removal
    this.units.get(key)?.remove?.(); // used by ProductionPlant to throw when in an invalid state

    return this.units.delete(key);
  }

  getUnitAt(x: number, y: number): FactoryUnit | undefined {
    FactoryUnitGrid.validatePosition(x, y);

    return this.units.get(packCoords(x, y));
  }

  getAllUnits(): IterableIterator<FactoryUnit> {
    return this.units.values();
  }

  private static validatePosition(x: number, y: number): void {
    if (!FactoryUnitGrid.isUnitCell(x, y))
      throw new Error(`Invalid unit position (${x}, ${y})`);
  }

  static isUnitCell(x: number, y: number): boolean {
    return x % 2 === 0 && (y - x / 2) % 2 === 0;
  }
}
