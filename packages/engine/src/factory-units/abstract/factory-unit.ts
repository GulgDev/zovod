import type { Game } from "../../game";
import type { ResourceKind } from "../../resource-kind";
import { FactoryMap } from "../../factory-map";
import { sampleFrom } from "../util/sample";

// Types linked to in JSDoc
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Market } from "../market";
import type { ProductionPlant } from "../production-plant";
import type { Storage } from "../storage";
/* eslint-ensable @typescript-eslint/no-unused-vars */

/**
 * An abstract class for factory units that handles the send/accept mechanism
 * and update logic.
 *
 * Factory units are a primary game element, which, together with flows, forms
 * a factory, i.e. a pipeline that buys, transforms and sells resources.
 *
 * @see {@link Market}, {@link ProductionPlant}, and {@link Storage} for concrete factory unit types.
 */
export abstract class FactoryUnit {
  /**
   * Check whether a resource can be accepted by the unit.
   */
  protected abstract canAccept(resource: ResourceKind): boolean;

  /**
   * Accept the resource and perform an action with it (e.g. store, sell, etc.).
   */
  protected abstract accept(resource: ResourceKind): void;

  /**
   * Send a resource to a randomly chosen target unit.
   *
   * @see {@link FactoryMap.setTargetDistribution} for more information on the target distribution.
   */
  protected send(resource: ResourceKind): boolean {
    const distribution = new Map(
      FactoryMap.getTargetDistribution(this)
        .entries()
        .filter(([target]) => !target.paused && target.canAccept(resource)),
    );
    if (distribution.size === 0) return false;

    const target = sampleFrom(distribution);
    target.accept(resource);
    return true;
  }

  protected abstract doUpdate(game: Game, deltaTime: number): void;

  /**
   * Whether the factory unit is currently paused and does not accept resources,
   * perform simulation steps and any other actions.
   */
  paused = false;

  /**
   * Perform a simulation step on the factory unit. If {@link paused} is set to
   * true, does nothing.
   *
   * @param game - The current active {@link Game} instance, with which the factory unit is associated.
   * @param deltaTime - Time (in seconds) passed since the last game update.
   */
  update(game: Game, deltaTime: number): void {
    if (!this.paused) this.doUpdate(game, deltaTime);
  }

  /**
   * Check the state of the factory unit and throw if it cannot be removed.
   */
  remove?(): void;
}
