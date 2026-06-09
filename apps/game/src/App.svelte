<script lang="ts">
  import { Game, Inventory } from "@zovod/engine";
  import FactoryMapView from "./lib/factory-map/FactoryMapView.svelte";
  import UIOverlay from "./lib/ui/UIOverlay.svelte";

  const game = new Game(
    new Inventory(0, { workforceUnit: { buy: 0, sell: 0 } }),
  );
</script>

<FactoryMapView map={game.factoryMap}></FactoryMapView>
<UIOverlay></UIOverlay>
