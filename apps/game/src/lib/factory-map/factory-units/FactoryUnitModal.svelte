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
  import close from "../../../assets/close.svg";
  import { resourceKinds } from "../../economy/resource-kinds";

  let {
    onremove,
    unit,
    active,
    open = $bindable(),
  }: {
    onremove: () => void;
    unit: FactoryUnit;
    active: boolean;
    open: boolean;
  } = $props();

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
        <span> Прядильный отдел</span>

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
          {#if unit instanceof Storage}
            <div class="characteristic">
              <span class="title">Ресурсы</span>
              <span class="value">
                {unit.slotCount - unit.availableSlotCount}/{unit.slotCount}
              </span>
            </div>
          {:else if unit instanceof ProductionPlant}
            <div class="characteristic">
              <span class="title">Мощность</span>
              <span class="value">
                {Inventory.getAssignedWorkforce(unit) *
                  unit.throughputPerWorkforceUnit} ед./с
              </span>
            </div>
            <div class="characteristic">
              <span class="title">Рабочие</span>
              <span class="value">{Inventory.getAssignedWorkforce(unit)}</span>
            </div>
          {/if}
        {:else if tab === 1}
          <!-- Status -->
          <div class="state-info">
            <span class="title">Статус:</span>
            <span class="value">
              <FactoryUnitStatusIcon {active} />
              {active ? "В работе" : "Неактивен"}
            </span>
          </div>
          <div class="state-action">
            <span class="title">Текущая работа</span>
            <span class="description">
              {#if unit instanceof Storage}
                Хранилище принимает и хранит ресурсы разных видов
              {:else if unit instanceof ProductionPlant}
                Завод перерабатывает
                <b>{resourceKinds[unit.consumedKind].nameAccusative}</b>
                и производит
                <b>{resourceKinds[unit.producedKind].nameAccusative}</b>
              {/if}
            </span>
            <button
              onclick={(): void => {
                unit.paused = !unit.paused;
              }}
            >
              {unit.paused ? "Запустить" : "Остановить"}
            </button>
          </div>
          <div class="state-action">
            <span class="title">Закрытие отдела</span>
            <span class="description">
              После закрытия доступа к отделу не будет
            </span>
            <button onclick={onremove}>Закрыть</button>
          </div>
        {:else if tab === 2}
          <!-- Production -->
        {:else if tab === 3}
          <!-- Supply -->
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

  /* Characteristics tab */

  /* State tab */

  /* Production tab */

  /* Supply tab */
</style>
