<script lang="ts" module>
  // TODO: refactor this into multiple components

  const factoryUnitIds = new WeakMap<FactoryUnit, number>();

  let currentId = 1;
  function getFactoryUnitId(unit: FactoryUnit): number {
    let id = factoryUnitIds.get(unit);
    if (id !== undefined) return id;

    factoryUnitIds.set(unit, (id = currentId++));
    return id;
  }

  function getUniqueFactoryUnitName(unit: FactoryUnit): string {
    return unit instanceof Market
      ? "Рынок" // there is only a single market unit instance in the game
      : `${getFactoryUnitName(unit) ?? "Отдел"} №${getFactoryUnitId(unit)}`;
  }
</script>

<script lang="ts">
  import {
    FactoryMap,
    Inventory,
    Market,
    ProductionPlant,
    Storage,
    type FactoryUnit,
  } from "@zovod/engine";
  import FactoryUnitStatusIcon from "./FactoryUnitStatusIcon.svelte";
  import Portal from "../../util/Portal.svelte";
  import MultiSlider from "../../MultiSlider.svelte";
  import { overlay } from "../../overlay.svelte";
  import { game, gameState } from "../../game.svelte";
  import close from "../../../assets/close.svg";
  import { getFactoryUnitName } from "../../economy/factory-unit-types";
  import { resourceKinds, workforceUnit } from "../../economy/resource-kinds";

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
    // Show the dialog as a modal (this can't be done with HTML only)
    if (open) dialog?.showModal();
    else dialog?.close();
  });

  let tab = $state(0);

  function setTab(targetTab: number): () => void {
    return () => (tab = targetTab);
  }

   // used in the supply tab
  let currentResource = $derived(
    unit instanceof Storage
      ? Object.keys(resourceKinds)[0]
      : unit instanceof ProductionPlant
        ? "workforceUnit"
        : undefined,
  );

  function validateResourceCount(value: number): number {
    if (currentResource === undefined)
      throw new Error("No resource kind selected to validate against.");

    return Math.min(
      Math.max(value, 1),
      currentResource === "workforceUnit"
        ? game.inventory.getMaxAffordableWorkforceUnits()
        : game.inventory.getMaxAffordableResourceAmount(currentResource)
    );
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
        <span class="title">{getUniqueFactoryUnitName(unit)}</span>

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
            {const targetDistribution = $derived.by(
              gameState(() => FactoryMap.getTargetDistribution(unit))
            )}
            {#if targetDistribution.size >= 2}
              <div class="frame">
                <div class="title">Распределение выхода продукции</div>
                <div class="contents">
                  <MultiSlider
                    bind:values={
                      (): number[] => Array.from(targetDistribution.values()),
                      (values: number[]): void =>
                        FactoryMap.setTargetDistribution(
                          unit,
                          new Map(
                            Array.from(
                              targetDistribution.keys(),
                              (target, i) => [target, values[i]],
                            ),
                          ),
                        )
                    }
                  />
                  <div class="legend" style:margin-top="20px">
                    {#each targetDistribution.entries() as [unit, probability], index (unit)}
                      <div class="legend-item">
                        <span
                          class="legend-label"
                          style:--symbol-color="color-mix(in srgb, #f0d8aa,
                          #563414 calc({index / (targetDistribution.size - 1)} *
                          100%))"
                        >
                          &rightarrow; {getUniqueFactoryUnitName(unit)}
                        </span>
                        <span class="legend-value">
                          {Math.round(probability * 100)}%
                        </span>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {:else if tab === 3}
          <!-- Supply -->
          <div class="supply">
            {#if unit instanceof Storage}
              {#each Object.entries(resourceKinds) as [resource, info] (resource)}
                <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                <div
                  class={[
                    "frame item",
                    { active: currentResource === resource },
                  ]}
                  onclick={(): void => {
                    if (currentResource !== resource)
                      currentResource = unit.renewedResourceKind = resource;
                    else currentResource = unit.renewedResourceKind = undefined;
                  }}
                >
                  <span class="resource-info">
                    <span class="title">{info.name}</span>
                    <span class="label">Контракт</span>
                  </span>
                  <span class="price">
                    <b>{info.price.buy} р.</b> / ед.
                  </span>
                </div>
              {/each}
            {:else if unit instanceof ProductionPlant}
              <div
                class={[
                  "frame item",
                  { active: currentResource === "workforceUnit" },
                ]}
              >
                <span class="title">{workforceUnit.name}</span>
                <span class="label">Разовая покупка</span>
                <span class="price">
                  <b>{workforceUnit.price.buy} р.</b>
                  / ед.
                </span>
              </div>
            {/if}
          </div>
          {/if}
        </div>
        {#if tab === 3 && (unit instanceof ProductionPlant) && currentResource !== undefined}
          {const balance = $derived.by(gameState(() => game.inventory.balance))}
          {#key balance}
            {let resourceCount = $state(validateResourceCount(1))}
            <div class="purchase-panel">
              <div>
                {#if currentResource === "workforceUnit"}
                  <span class="label">Объём поставки</span>
                  <input
                    type="number"
                    bind:value={
                      (): number => resourceCount,
                      (value): void => {
                        resourceCount = validateResourceCount(value);
                      }
                    }
                  />
                {/if}
              </div>
              <div>
                <span class="price">
                  {currentResource === "workforceUnit"
                    ? game.inventory.getWorkforceUnitPrice() * resourceCount
                    : game.inventory.getResourcePrice(currentResource)} р.
                </span>
                <button
                  disabled={resourceCount === 0}
                  onclick={(): void => {
                    if (currentResource === "workforceUnit") {
                      if (!(unit instanceof ProductionPlant))
                        throw new Error(
                          "Cannot assign workforce to a non-production unit."
                        );

                      if (!game.inventory.buyWorkforce(resourceCount))
                        throw new Error("Failed to buy workforce units.");
                      game.inventory.assignWorkforce(unit, resourceCount);
                    } else {
                      if (!(unit instanceof Storage))
                        throw new Error(
                          "Cannot assign resources to a non-storage unit."
                        );
                      
                      unit.renewedResourceKind = currentResource;
                    }
                  }}
                >
                  Купить
                </button>
              </div>
            </div>
          {/key}
        {/if}
      </dialog>
  </Portal>
{/if}

<style>
  dialog {
    display: flex;
    flex-direction: column;

    width: 540px;
    height: 500px;
    max-width: calc(100% - 24px * 2);
    max-height: calc(100% - 24px * 2);
    box-sizing: border-box;

    padding: 0;
    padding-top: 20px;

    background-color: #fffbf2;
    color: inherit;
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
    flex: auto;
    overflow-y: auto;
    
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

  .production .frame {
    display: flex;
    flex-direction: column;
    gap: 12px;
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

    margin-top: 12px;
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
  .supply {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .supply .item {
    display: flex;
    align-items: baseline;

    color: #564a3f;

    user-select: none;
  }

  .supply .item:not(.active) {
    background-color: transparent;
  }

  .supply .title {
    font-weight: 700;
    color: #1a1817;
  }

  .supply .label {
    margin-left: 8px;
    padding: 0 6px;
    border-radius: 4px;
    align-self: center;

    background-color: #f0d8aa;
    color: #563414;

    font-size: 12px;
    font-style: italic;
  }

  .supply .price {
    margin-left: auto;
  }

  .purchase-panel {
    display: flex;
    justify-content: space-between;

    padding: 16px 32px;

    border-top: inherit;
  }

  .purchase-panel .label {
    display: block;
    margin-bottom: 8px;

    font-size: 12px;
  }

  .purchase-panel input {
    width: 3ch;
    padding: 4px 14px;
    
    font: inherit;
    background-color: white;
    border: 1px solid #906a3c;
    border-radius: 12px;
  }

  /* Hide the step buttons in number input */
  .purchase-panel input[type="number"] {
    -moz-appearance: textfield;
    appearance: auto; /* silence css vendor prefix warning */
  }

  .purchase-panel input[type="number"]::-webkit-outer-spin-button,
  .purchase-panel input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .purchase-panel div:last-child {
    text-align: right;
  }

  .purchase-panel .price {
    display: block;
    margin-bottom: 8px;

    font-size: 24px;
    font-weight: 800;
  }

  .purchase-panel button {
    padding: 10px 16px;

    font-size: 14px;
    font-weight: 500;

    background-color: #dcb982;
    color: #1a0b00;
    border: none;
    border-radius: 8px;

    cursor: pointer;
  }

  .purchase-panel button:disabled {
    filter: brightness(0.95);
    opacity: 0.8;

    cursor: not-allowed;
  }
</style>
