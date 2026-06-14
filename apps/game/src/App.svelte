<script lang="ts">
  import UIOverlay from "./lib/ui/UIOverlay.svelte";
  import GameView from "./lib/GameView.svelte";
  import { game } from "./lib/game.svelte";
</script>

<GameView map={game.factoryMap}></GameView>
<UIOverlay></UIOverlay>
