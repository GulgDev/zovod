import { ResourceKind } from "../resource-kind";
import { ContainerUnit } from "./container-unit";

export class Storage extends ContainerUnit {
  renewedResourceKind: ResourceKind | undefined;

  doUpdate(): void {
    const resource = this.pick();
    if (resource !== undefined && this.send(resource)) this.drop(resource);

    if (resource === undefined && this.renewedResourceKind !== undefined) {
      // the storage is empty, try to renew resources

      this.put(this.renewedResourceKind); // TODO: charge money
    }
  }
}
