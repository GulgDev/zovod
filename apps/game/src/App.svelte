<script lang="ts">
  import { Game, Inventory } from "@zovod/engine";
  import UIOverlay from "./lib/ui/UIOverlay.svelte";
  import GameView from "./lib/GameView.svelte";

  const game = new Game(
    new Inventory(0, { workforceUnit: { buy: 0, sell: 0 } }),
  );
</script>

<GameView map={game.factoryMap}></GameView>
<UIOverlay></UIOverlay>
