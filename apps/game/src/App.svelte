<script lang="ts">
  import GameView from "./lib/GameView.svelte";
  import Topbar from "./lib/ui/Topbar.svelte";
  import { game } from "./lib/game.svelte";
</script>

<GameView map={game.factoryMap} />
<Topbar />
