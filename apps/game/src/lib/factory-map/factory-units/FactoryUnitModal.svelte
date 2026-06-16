<script lang="ts">
  import {
    Inventory,
    ProductionPlant,
    Storage,
    type FactoryUnit,
  } from "@zovod/engine";
  import FactoryUnitStatusIcon from "./FactoryUnitStatusIcon.svelte";
  import Portal from "../../util/Portal.svelte";
  import { overlay } from "../../overlay.svelte";
  import { game, gameState } from "../../game.svelte";
  import close from "../../../assets/close.svg";
  import { getFactoryUnitName } from "../../economy/factory-unit-types";
  import { resourceKinds } from "../../economy/resource-kinds";

  let {
    onremove,
    unit,
    open = $bindable(),
  }: {
    onremove: () => void;
    unit: FactoryUnit;
    open: boolean;
  } = $props();

  const active = $derived.by(gameState(() => unit.active));

  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    // FIXME: Is this a hack?
    if (open) dialog?.showModal();
    else dialog?.close();
  });

  let tab = $state(0);

  function setTab(targetTab: number): () => void {
    return () => (tab = targetTab);
  }
</script>

<svelte:document
  onkeydown={open
    ? (ev): void => {
        if (ev.key === "Escape") {
          open = false;
        }
      }
    : undefined}
/>

{#if open}
  <Portal bind:target={overlay.current}>
    <dialog
      bind:this={dialog}
      closedby="any"
      onpointerdown={(ev): void => {
        ev.stopPropagation();
      }}
      onclose={(): void => {
        open = false;
      }}
    >
      <div class="header">
        <FactoryUnitStatusIcon {active} />
        <span class="title">{getFactoryUnitName(unit) ?? "Отдел"}</span>

        <button
          class="close-button"
          title="Закрыть"
          onclick={(): void => {
            open = false;
          }}
        >
          <img src={close} alt="Закрыть" height="8" />
        </button>
      </div>

      <nav>
        <ul>
          <li class={{ active: tab === 0 }}>
            <button onclick={setTab(0)}>Характеристики</button>
          </li>
          <li class={{ active: tab === 1 }}>
            <button onclick={setTab(1)}>Состояние</button>
          </li>
          <li class={{ active: tab === 2 }}>
            <button onclick={setTab(2)}>Производство</button>
          </li>
          <li class={{ active: tab === 3 }}>
            <button onclick={setTab(3)}>Снабжение</button>
          </li>
        </ul>
      </nav>

      <div class="content">
        {#if tab === 0}
          <!-- Characteristics -->
          <div class="characteristics">
            <!-- TODO: make reactive -->
            {#if unit instanceof Storage}
              <div class="characteristic frame">
                <span class="title">Ресурсы</span>
                <span class="value">
                  {const availableSlotCount = $derived.by(
                    gameState(() => unit.availableSlotCount),
                  )}
                  <b>
                    {unit.slotCount - availableSlotCount}/{unit.slotCount}
                  </b>
                </span>
              </div>
            {:else if unit instanceof ProductionPlant}
              {const assignedWorkforce = $derived.by(
                gameState(() => Inventory.getAssignedWorkforce(unit)),
              )}
              <div class="characteristic frame">
                <span class="title">Мощность</span>
                <span class="value">
                  <b>
                    {(
                      assignedWorkforce * unit.throughputPerWorkforceUnit
                    ).toFixed(1)}
                  </b> ед./с
                </span>
              </div>
              <div class="characteristic frame">
                <span class="title">Рабочие</span>
                <span class="value"><b>{assignedWorkforce}</b></span>
              </div>
            {/if}
          </div>
        {:else if tab === 1}
          <!-- State -->
          <div class="state">
            <div class="state-info frame">
              <span class="title">Статус:</span>
              <span class="value">
                <FactoryUnitStatusIcon {active} />
                {active ? "В работе" : "Неактивен"}
              </span>
            </div>
            <div class="state-action frame">
              <span class="title">Текущая работа</span>
              <span class="description">
                {#if unit instanceof Storage}
                  Хранилище принимает и хранит ресурсы разных видов
                {:else if unit instanceof ProductionPlant}
                  Завод перерабатывает
                  <strong>
                    {resourceKinds[unit.consumedKind].nameAccusative}
                  </strong>
                  и производит
                  <strong>
                    {resourceKinds[unit.producedKind].nameAccusative}
                  </strong>
                {/if}
              </span>
              <button
                onclick={(): void => {
                  unit.paused = !unit.paused;
                }}
              >
                {const paused = $derived.by(gameState(() => unit.paused))}
                {paused ? "Запустить" : "Остановить"}
              </button>
            </div>
            <div class="state-action frame">
              <span class="title">Закрытие отдела</span>
              <span class="description">
                После закрытия доступа к отделу не будет
              </span>
              <button onclick={onremove}>Закрыть</button>
            </div>
          </div>
        {:else if tab === 2}
          <!-- Production -->
          <div class="production">
            {#if unit instanceof ProductionPlant}
              {const assignedWorkforce = $derived.by(
                  gameState(() => Inventory.getAssignedWorkforce(unit)),
                ),
                unassignedWorkforce = $derived.by(
                  gameState(() => game.inventory.unassignedWorkforce),
                )}
              <div class="frame">
                <span class="title">Рабочая сила</span>
                <div class="contents">
                  <input
                    bind:value={
                      (): number => assignedWorkforce,
                      (value): void => {
                        const current = Inventory.getAssignedWorkforce(unit);
                        if (value > current)
                          game.inventory.assignWorkforce(unit, value - current);
                        else
                          game.inventory.unassignWorkforce(
                            unit,
                            current - value,
                          );
                      }
                    }
                    max={assignedWorkforce + unassignedWorkforce}
                    type="range"
                  />
                  <div class="legend">
                    <div class="legend-item">
                      <span class="legend-label" style:--symbol-color="#dcb982">
                        Текущий отдел
                      </span>
                      <span class="legend-value">{assignedWorkforce}</span>
                    </div>
                    <div class="legend-item">
                      <span class="legend-label" style:--symbol-color="#ddd1b7">
                        В запасе
                      </span>
                      <span class="legend-value">{unassignedWorkforce}</span>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {:else if tab === 3}
          <!-- Supply -->
          <div class="supply"></div>
        {/if}
      </div>
    </dialog>
  </Portal>
{/if}

<style>
  dialog {
    width: 540px;
    height: 500px;
    max-width: calc(100% - 24px * 2);
    max-height: calc(100% - 24px * 2);
    box-sizing: border-box;

    padding: 20px 0;

    background-color: #fffbf2;
    border: 1px solid #ddd1b7;
    border-radius: 16px;
  }

  dialog::backdrop {
    background-color: #8e7556;
    opacity: 0.4;
    backdrop-filter: blur(8px);
  }

  /* Header */
  .header {
    padding: 0 32px;
    margin-bottom: 8px;
  }

  .header .title {
    margin-left: 10px;
  }

  .close-button {
    float: right;

    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  /* Tab navigation */
  nav ul {
    display: flex;

    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  nav li {
    flex: 1;
  }

  nav li.active {
    background-color: #f7eacd;
  }

  nav button {
    width: 100%;
    padding: 10px;

    font-size: 12px;

    background: none;
    border: none;
  }

  nav li:not(.active) button {
    cursor: pointer;
  }

  /* Main content */
  .content {
    padding: 24px 32px;
  }

  .frame {
    padding: 8px 12px;

    background-color: white;
    border: 1px solid #ddd1b7;
    border-radius: 8px;
  }

  /* Characteristics tab */
  .characteristics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .characteristic {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* State tab */
  .state {
    display: flex;
    flex-direction: column;
    gap: 24px;

    color: #564a3f;
  }

  .state-info .title {
    margin-right: 12px;
  }

  .state-info .value {
    text-transform: uppercase;

    color: #36302b;
  }

  .state-action {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto 1fr;
    grid-auto-flow: column;
    column-gap: 12px;
  }

  .state-action .title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1817;
  }

  .state-action button {
    grid-row: span 2;
    place-self: center;

    font-size: 14px;
    font-weight: 500;

    background-color: #f7eacd;
    color: #563414;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;

    cursor: pointer;
  }

  /* Production tab */
  .production {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .production .title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1817;
  }

  .production .legend {
    display: flex;
    flex-direction: column;
    gap: 16px;

    margin-top: 8px;
  }

  .production .legend-label::before {
    content: "";
    display: inline-block;

    width: 2em;
    height: 1.5em;
    margin-right: 0.5em;
    vertical-align: middle;

    background-color: var(--symbol-color);
    border-radius: 6px;
  }

  .production .legend-value {
    float: right;
  }

  /* Range input styles */
  .production input[type="range"] {
    --track-color: #ddd1b7;
    --progress-color: #dcb982;
    --track-height: 6px;

    --thumb-color: #dcb982;
    --thumb-shadow: 0 2px 10px #dcb98280;
    --thumb-height: 24px;
  }

  .production input[type="range"] {
    /* Reset user agent styles */
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    margin: 0;

    width: 100%;
    height: var(--thumb-height);
  }

  /* Track style */
  .production input[type="range"]::-webkit-slider-container {
    background-color: var(--track-color);
    border-radius: var(--track-height);
    height: var(--track-height);

    margin-top: calc((var(--thumb-height) - var(--track-height)) / 2);
  }

  .production input[type="range"]::-moz-range-track {
    background-color: var(--track-color);
    border-radius: var(--track-height);
    height: var(--track-height);
  }

  /* Thumb style */
  .production input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;

    height: var(--thumb-height);
    width: var(--thumb-height);

    background-color: var(--thumb-color);
    box-shadow: var(--thumb-shadow);
    border: none;
    border-radius: 100%;
  }

  .production input[type="range"]::-moz-range-thumb {
    height: var(--thumb-height);
    width: var(--thumb-height);

    background-color: var(--thumb-color);
    box-shadow: var(--thumb-shadow);
    border: none;
    border-radius: 100%;
  }

  /* Progress style */
  .production input[type="range"]::-webkit-slider-thumb {
    /*
      Chromium browsers don't support changing the progress color natively, so
      we use thumb border as a workaround
    */
    border-image: linear-gradient(var(--progress-color))
      /* set border image slice so that the top, bottom and right parts are
         empty (transparent) and the left part is filled with progress color */
      0 0 0 1 /
      /* fill the space between thumb bounding box and track with transparency
         (empty top and bottom parts) */
      calc((var(--thumb-height) - var(--track-height)) / 2)
      /* stretch the border horizontally */ 100vw /
      /* allow the border to overflow horizontally */ 0 100vw;
  }

  .production input[type="range"]::-webkit-slider-runnable-track {
    overflow-x: clip; /* clip the thumb border to the track */
  }

  .production input[type="range"]::-webkit-slider-container {
    /*
      Because the progress fill created that way cannot be rounded, the rounded
      edges must be created by the slider container itself
    */
    padding: 0 calc(var(--track-height) / 2);
    background-image: linear-gradient(
      to right,
      var(--progress-color) calc(var(--track-height) / 2),
      transparent 0
    );
  }

  .production input[type="range"]::-moz-range-progress {
    height: var(--track-height);
    border-radius: var(--track-height);
    background-color: var(--progress-color);
  }

  /* Supply tab */
</style>
