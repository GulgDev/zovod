import { Game } from "..";
import { ResourceKind } from "../resource-kind";
import { ContainerUnit } from "./container-unit";

export class Storage extends ContainerUnit {
  renewedResourceKind: ResourceKind | undefined;

  doUpdate(game: Game): void {
    const resource = this.pick();
    if (resource !== undefined && this.send(resource)) this.drop(resource);

    if (resource === undefined && this.renewedResourceKind !== undefined) {
      // the storage is empty, try to renew resources

      if (game.inventory.buyResource(this.renewedResourceKind))
        this.put(this.renewedResourceKind);
    }
  }
}
