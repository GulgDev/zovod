import type { Game } from "../game";
import type { ResourceKind } from "../resource-kind";
import { ContainerUnit } from "./abstract/container-unit";

export class Storage extends ContainerUnit {
  renewedResourceKind: ResourceKind | undefined;

  protected doUpdate(game: Game): void {
    let sentResource;
    while (
      (sentResource = this.sendOneOf(
        new Set(this.getContainedResources().keys()),
      ))
    )
      this.drop(sentResource);

    if (
      this.getContainedResources().size === 0 &&
      this.renewedResourceKind !== undefined
    ) {
      // the storage is empty, try to renew resources

      if (game.inventory.buyResource(this.renewedResourceKind))
        this.put(this.renewedResourceKind);
    }
  }
}
