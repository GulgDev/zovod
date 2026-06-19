<script lang="ts">
  import { SvelteDate } from "svelte/reactivity";
  import { on } from "svelte/events";
  import type { GameUpdateEvent } from "@zovod/engine";
  import { game, gameState } from "../game.svelte";
  import plus from "../../assets/controls/plus.svg";
  import minus from "../../assets/controls/minus.svg";

  const dateFormat = new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const MIN_LEVEL = -1,
    MAX_LEVEL = 2,
    LEVEL_STEP = 0.5;

  let date = new SvelteDate(1860, 0);

  const speed = $derived.by(gameState(() => game.speed));

  let speedLevel = $derived(Math.log2(speed));
  $effect(() => {
    if (speedLevel < MIN_LEVEL) speedLevel = MIN_LEVEL;
    else if (speedLevel > MAX_LEVEL) speedLevel = MAX_LEVEL;
    game.speed = 2 ** speedLevel;
  });

  const TIME_SCALE = (365 * 24 * 60 * 60) / 60; // 1 minute = 1 in-game-year

  $effect(() =>
    on(game, "update", (ev) => {
      const updateEvent = ev as GameUpdateEvent;
      date.setSeconds(date.getSeconds() + updateEvent.deltaTime * TIME_SCALE);
    }),
  );

  // The game ends after a certain year
  const ENDING_YEAR = 1861;

  function gameOver(): void {
    alert(
      "Поздравляем! Вы дошли до 1861 года. На этом историческая часть игры заканчивается, но вы всё ещё можете продолжить управлять своим заводом.",
    );
  }

  let ended = false;
  $effect(() => {
    if (date.getUTCFullYear() >= ENDING_YEAR && !ended) {
      ended = true;
      gameOver();
    }
  });
</script>

<div class="container">
  <button
    onclick={(): void => {
      speedLevel -= LEVEL_STEP;
    }}
    disabled={speedLevel === MIN_LEVEL}
  >
    <img height="16" src={minus} alt="Замедлить" />
  </button>
  <span class="date">{dateFormat.format(date)}</span>
  <button
    onclick={(): void => {
      speedLevel += LEVEL_STEP;
    }}
    disabled={speedLevel === MAX_LEVEL}
  >
    <img height="16" src={plus} alt="Ускорить" />
  </button>
  <meter
    min={MIN_LEVEL}
    max={MAX_LEVEL}
    value={speedLevel}
    style:--bars={(MAX_LEVEL - MIN_LEVEL) / LEVEL_STEP}
  ></meter>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    justify-items: center;
    gap: 8px 4px;
    padding: 8px 12px;

    background-color: white;
    box-shadow: 0 2px 6px #906a3c3d;
    border-radius: 12px;

    margin-left: auto;
  }

  .date {
    min-width: 18ch;
    padding: 4px 12px;

    text-align: center;

    background-color: #f7eacd;
    color: #361c06;
    border-radius: 12px;
  }

  button {
    display: inline-flex; /* ignore font dimensions so that the buttons are square */

    background-color: #f7eacd;
    border: none;
    border-radius: 8px;
    padding: 4px;
  }

  button:not(:disabled) {
    cursor: pointer;
  }

  button:disabled {
    filter: brightness(0.95);
    opacity: 0.8;
  }

  meter {
    grid-column: span 3;
    width: calc(var(--bars) * 28px - 4px);
    height: 6px;

    /* Bar patterns */
    --background: url(../../assets/meter/bar-empty.svg);
    --fill: url(../../assets/meter/bar-filled.svg);
  }

  /* Background color (unfilled) */
  meter {
    background: var(--background);
  }

  meter::-webkit-meter-bar {
    background: var(--background);
    border: 0;
  }

  /* Filled color */
  meter::-moz-meter-bar {
    background: var(--fill);
  }

  meter::-webkit-meter-inner-element {
    grid-template-rows: none; /* fill all height */
  }

  meter::-webkit-meter-optimum-value {
    background: var(--fill);
  }
</style>
