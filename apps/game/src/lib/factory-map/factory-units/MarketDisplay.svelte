<script lang="ts">
  import market from "../../../assets/market.svg";
  import { TILE_GAP, TILE_SIZE } from "../sizes";
</script>

<image
  href={market}
  x="0"
  y={-(TILE_SIZE + TILE_GAP)}
  width={TILE_SIZE + TILE_GAP + TILE_SIZE}
/>
