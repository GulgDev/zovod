<script lang="ts">
  import { game, gameState } from "../game.svelte";
  import moneyIcon from "../../assets/icons/money.svg";
  import workforceIcon from "../../assets/icons/workforce.svg";

  const currencyFormat = new Intl.NumberFormat("ru-RU", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    workforceFormat = new Intl.NumberFormat("ru-RU", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const balance = $derived.by(gameState(() => game.inventory.balance)),
    workforce = $derived.by(gameState(() => game.inventory.totalWorkforce));
</script>

<div class="container">
  <div class="stat">
    <img src={moneyIcon} alt="Деньги" />
    <span>{currencyFormat.format(balance)}</span>
  </div>
  <div class="stat">
    <img src={workforceIcon} alt="Рабочая сила" />
    <span>{workforceFormat.format(workforce)}</span>
  </div>
</div>

<style>
  .container {
    display: flex;
    gap: 12px;
    padding: 8px 12px;

    background-color: white;
    box-shadow: 0 2px 6px #906a3c3d;
    border-radius: 12px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;

    background-color: #f0d8aa;
    border-radius: 24px;
  }
</style>
