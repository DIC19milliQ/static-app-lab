import { calculateSavingsGrowth } from "./calculator_math.js";

const formatCurrency = (value) =>
  value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export const initCalculatorLab = () => {
  const initialInput = document.getElementById("calc-initial");
  const monthlyInput = document.getElementById("calc-monthly");
  const rateInput = document.getElementById("calc-rate");
  const yearsInput = document.getElementById("calc-years");
  const finalOutput = document.getElementById("calc-final");
  const contribOutput = document.getElementById("calc-contrib");
  const interestOutput = document.getElementById("calc-interest");
  const tableBody = document.getElementById("calc-table-body");
  const chart = document.getElementById("calc-chart");

  const compute = () => {
    const initial = Number(initialInput.value) || 0;
    const monthly = Number(monthlyInput.value) || 0;
    const annualRate = Number(rateInput.value) || 0;
    const years = Math.max(1, Number(yearsInput.value) || 1);

    const { finalBalance, totalContrib, totalInterest, yearly } = calculateSavingsGrowth({
      initial,
      monthly,
      annualRate,
      years,
    });

    finalOutput.textContent = formatCurrency(finalBalance);
    contribOutput.textContent = formatCurrency(totalContrib);
    interestOutput.textContent = formatCurrency(totalInterest);

    tableBody.innerHTML = "";
    yearly.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.year}</td>
        <td>${formatCurrency(row.balance)}</td>
        <td>${formatCurrency(row.contributions)}</td>
        <td>${formatCurrency(row.interest)}</td>
      `;
      tableBody.appendChild(tr);
    });

    chart.innerHTML = "";
    const maxBalance = Math.max(...yearly.map((row) => row.balance), 1);
    yearly.forEach((row) => {
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = `${(row.balance / maxBalance) * 100}%`;
      bar.title = `Year ${row.year}: ${formatCurrency(row.balance)}`;
      const label = document.createElement("span");
      label.textContent = row.year;
      bar.appendChild(label);
      chart.appendChild(bar);
    });
  };

  [initialInput, monthlyInput, rateInput, yearsInput].forEach((input) => {
    input.addEventListener("input", compute);
  });

  compute();
};
