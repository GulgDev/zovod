import { Game } from "../..";
import type { Renderer } from "../../render";
import type { ResourceKind } from "../../resource-kind";
import { FactoryMap } from "../factory-map";
import { sampleFrom } from "./util/sample";

export abstract class FactoryUnit {
  protected abstract canAccept(resource: ResourceKind): boolean;

  protected abstract accept(resource: ResourceKind): void;

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

  paused = false;

  update(game: Game, deltaTime: number): void {
    if (!this.paused) this.doUpdate(game, deltaTime);
  }
}
