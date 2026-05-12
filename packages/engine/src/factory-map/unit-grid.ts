import type { FactoryUnit } from "../factory-units/abstract/factory-unit";
import { packCoords } from "./util/math";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { FactoryMap } from "."; // used in JSDoc

/**
 * A class that manages the placement, removal and querying of
 * {@link FactoryUnit} instances on a grid. Factory units can only be placed in
 * pre-defined unit cells.
 *
 * This class does not handle any flow logic, which is required for factory
 * units to transfer resources.
 * @see {@link FactoryMap} for the orchestration layer connecting both unit and flow logic.
 */
export class FactoryUnitGrid {
  /**
   * A map of packed node coordinates to {@link FactoryUnit} instances placed at
   * those coordinates.
   *
   * @see {@link packCoords}
   */
  private readonly units = new Map<number, FactoryUnit>();

  /**
   * Place a factory unit at the specified position.
   *
   * @throws Will throw if the specified position does not point to a unit cell.
   *
   * @returns `true` if the unit was placed, otherwise `false` if the cell was already occupied by a factory unit.
   */
  placeUnit(unit: FactoryUnit, x: number, y: number): boolean {
    FactoryUnitGrid.validatePosition(x, y);

    const key = packCoords(x, y);
    if (this.units.has(key)) return false;
    this.units.set(key, unit);
    return true;
  }

  /**
   * Remove the factory unit at the specified position.
   *
   * @throws Will throw if the specified position does not point to a unit cell.
   * @throws Will throw if the unit to be removed is in an invalid state (cannot be removed).
   *
   * @returns `true` if there is a unit placed at that position and it was removed, or `false` if there isn't one.
   */
  removeUnitAt(x: number, y: number): boolean {
    FactoryUnitGrid.validatePosition(x, y);

    const key = packCoords(x, y);

    // Clean-up before removal
    this.units.get(key)?.remove?.(); // used by ProductionPlant to throw when in an invalid state

    return this.units.delete(key);
  }

  /**
   * Retrieves the factory unit placed at the specified position.
   *
   * @returns The factory unit placed at the specified position, or `undefined` if there isn't one.
   */
  getUnitAt(x: number, y: number): FactoryUnit | undefined {
    FactoryUnitGrid.validatePosition(x, y);

    return this.units.get(packCoords(x, y));
  }

  /**
   * Finds all factory units placed on the grid.
   *
   * @returns An iterator of all placed factory units.
   */
  getAllUnits(): IterableIterator<FactoryUnit> {
    return this.units.values();
  }

  /**
   * Validates that a cell is a unit cell.
   *
   * @throws Will throw if the cell at the specified position is not a unit cell.
   *
   * @see {@link isUnitCell}
   */
  private static validatePosition(x: number, y: number): void {
    if (!FactoryUnitGrid.isUnitCell(x, y))
      throw new Error(`Invalid unit position (${x}, ${y})`);
  }

  /**
   * Check whether the cell at a given coordinate is a unit cell. Unit cells
   * follow a recurrent pattern defined by the formula (2n, 2m + n), where `n`
   * and `m` are some integers
   */
  static isUnitCell(x: number, y: number): boolean {
    return x % 2 === 0 && (y - x / 2) % 2 === 0;
  }
}
