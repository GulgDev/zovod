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
   * Check whether a resource can be sent to a specific unit.
   *
   * @returns `false` if the target unit is paused or cannot accept the resource, otherwise `true`.
   */
  private static canSendTo(target: FactoryUnit, resource: ResourceKind) {
    return !target.paused && target.canAccept(resource);
  }

  /**
   * Try to send a resource to a randomly chosen target unit.
   *
   * @returns `true` if the resource was successfully sent to an available target, `false` if no target can accept it.
   *
   * @see {@link FactoryMap.setTargetDistribution} for more information on the target distribution.
   * @see {@link sendOneOf} for underlying implementation.
   */
  protected send(resource: ResourceKind): boolean {
    return this.sendOneOf(new Set([resource])) === resource;
  }

  /**
   * Send the most demanded of the specified resources to a randomly chosen
   * target unit. The resource is selected based on the amount of targets that
   * can accept it.
   *
   * @returns The sent resource kind, or `undefined` if no target can accept any of the specified resources.
   *
   * @see {@link FactoryMap.setTargetDistribution} for more information on the target distribution.
   */
  protected sendOneOf(
    resourceKinds: ReadonlySet<ResourceKind>,
  ): ResourceKind | undefined {
    // Find a resource kind that can be accepted by the most targets
    const entryWithMaxTargets = resourceKinds
      .values()
      .map(
        (resourceKind) =>
          [
            resourceKind,
            new Map(
              FactoryMap.getTargetDistribution(this)
                .entries()
                .filter(([target]) =>
                  FactoryUnit.canSendTo(target, resourceKind),
                ),
            ),
          ] as const,
      )
      .filter(([, distribution]) => distribution.size > 0)
      .reduce((entryWithMaxTargets, currentEntry) =>
        currentEntry[1].size > entryWithMaxTargets[1].size
          ? currentEntry
          : entryWithMaxTargets,
      );
    if (!entryWithMaxTargets) return undefined; // there is no resource kind that can be accepted by any of the targets

    const [resourceKind, distribution] = entryWithMaxTargets;
    const target = sampleFrom(distribution);
    target.accept(resourceKind);
    return resourceKind;
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
