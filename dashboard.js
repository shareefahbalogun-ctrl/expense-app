// -------------------- DASHBOARD.JS (Unified Dashboard + Financial Snapshot + Achievements + Cash Flow + Insights + Future Projections) --------------------

// --- GLOBAL CURRENCY (declare once globally)
window.CURRENCY_RATES = {
  NGN: 1,
  USD: 0.0027,
  EUR: 0.0025,
  GBP: 0.0021,
  QAR: 0.0099,
  AED: 0.010,
  SAR: 0.0105,
  JPY: 0.36,
  CHF: 0.0025,
  CAD: 0.0036,
  AUD: 0.0039,
  CNY: 0.018,
  INR: 0.22,
  BRL: 0.014,
  ZAR: 0.045,
  EGP: 0.049,
  KES: 0.37
};

window.CURRENCY_SYMBOLS = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GBP: "£",
  QAR: "ر.ق",
  AED: "د.إ",
  SAR: "﷼",
  JPY: "¥",
  CHF: "CHF",
  CAD: "$",
  AUD: "$",
  CNY: "¥",
  INR: "₹",
  BRL: "R$",
  ZAR: "R",
  EGP: "£",
  KES: "KSh"
};


// --- Active User
function getActiveUser() {
  return localStorage.getItem("activeUser") || "defaultUser";
}

// --- User Settings
function getUserSettings() {
  return JSON.parse(
    localStorage.getItem("userSettings") ||
      JSON.stringify({ currency: "NGN", budget: 150000, weeklyGoal: 50000 })
  );
}

// --- Global selected currency
window.selectedCurrency = getUserSettings().currency || "NGN";

// --- Change Currency
function changeCurrency(newCurrency) {
  const settings = getUserSettings();
  localStorage.setItem(
    "userSettings",
    JSON.stringify({ ...settings, currency: newCurrency })
  );
  document.dispatchEvent(new CustomEvent("currencyChanged"));
}

// --- Transactions
function getTransactions() {
  return JSON.parse(
    localStorage.getItem("transactions") ||
      JSON.stringify([
        { user: "defaultUser", type: "income", amount: 215000, category: "Salary", date: "2026-01-01" },
        { user: "defaultUser", type: "expense", amount: 30000, category: "Food", date: "2026-01-01", dueDate: "2026-01-05" },
        { user: "defaultUser", type: "expense", amount: 15000, category: "Transport", date: "2026-01-02" },
        { user: "defaultUser", type: "expense", amount: 5000, category: "Utilities", date: "2026-01-02" },
        { user: "defaultUser", type: "expense", description: "Lunch", amount: 5000, category: "Food", date: "2026-01-12", dueDate: "2026-01-12" },
        { user: "defaultUser", type: "expense", description: "Dinner", amount: 7000, category: "Food", date: "2026-01-12", dueDate: "2026-01-12" }
      ])
  );
}

// --- Save Transactions
function saveTransactions(newTxns) {
  localStorage.setItem("transactions", JSON.stringify(newTxns));
  document.dispatchEvent(new CustomEvent("transactionsUpdated"));
}

// --- Toggle Paid Status
function togglePaid(desc, dueDate) {
  const txns = getTransactions();
  const txn = txns.find(t => t.description === desc && t.dueDate === dueDate);
  if (txn) txn.paid = !txn.paid;
  saveTransactions(txns);
}

// --- Currency Helpers
function convertAmount(val) {
  const code = window.selectedCurrency || "NGN";
  return Number(val || 0) * (window.CURRENCY_RATES?.[code] || 1);
}

function formatCurrency(val) {
  const code = window.selectedCurrency || "NGN";
  const symbol = window.CURRENCY_SYMBOLS?.[code] || code;
  const amount = convertAmount(val);
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// --- Animate Numbers
function animateNumber(el, startVal, endVal, duration = 800) {
  if (!el) return;
  const start = convertAmount(startVal);
  const end = convertAmount(endVal);
  const range = end - start;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const factor = Math.min(progress / duration, 1);
    const value = start + range * factor;
    el.textContent = formatCurrency(value);
    if (factor < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// -------------------- MINI CHARTS --------------------
function renderMiniCharts(categories, containerId, clickable = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const rawAmounts = Object.values(categories);
  const max = Math.max(...rawAmounts, 1);

  Object.entries(categories).forEach(([cat, rawAmt]) => {
    const mini = document.createElement("div");
    mini.className = "miniChart";

    mini.innerHTML = `
      <div class="miniTooltip">${formatCurrency(rawAmt)}</div>
      <p>${cat}</p>
      <div class="miniChartBar"><div class="miniChartBarInner"></div></div>
    `;

    const bar = mini.querySelector(".miniChartBarInner");
    if (bar) {
      bar.style.width = "0%";
      requestAnimationFrame(() => {
        const widthPercent = (rawAmt / max) * 100;
        bar.style.width = widthPercent + "%";
      });
    }

    if (clickable) {
      mini.onclick = () => {
        filteredCategory = cat;
        renderFinancialSnapshot();
      };
    }

    container.appendChild(mini);
  });
}

// ===================== DOWN DASHBOARD =====================
function renderDownDashboard() {
  const user = getActiveUser();
  const txns = getTransactions().filter(t => t.user === user);

  const income = txns.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = txns.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expenses;

  const categories = {};
  txns.filter(t => t.type === "expense").forEach(t => {
    const c = t.category || "Others";
    categories[c] = (categories[c] || 0) + Number(t.amount);
  });

  const topCategory = Object.keys(categories).length
    ? Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b)
    : "-";

  // Card data
  const cardData = [
    { label: "Balance", value: balance, color: "#FFD700" },
    { label: "Income", value: income, color: "#4CAF50" },
    { label: "Expenses", value: expenses, color: "#FF6B6B" },
    { label: "Top Category", value: topCategory, color: "#2196F3" }
  ];

  const cards = document.querySelectorAll("#downDashboard .down-card");
  const maxVal = Math.max(income, expenses, balance, 1);

  cards.forEach((card, i) => {
    const data = cardData[i];
    const valueEl = card.querySelector(".down-card-value");
    const labelEl = card.querySelector(".down-card-label");
    const barEl = card.querySelector(".down-card-bar");

    if (valueEl) {
      if (typeof data.value === "number") animateNumber(valueEl, 0, data.value);
      else valueEl.textContent = data.value;
    }

    if (labelEl) labelEl.textContent = data.label;

    if (barEl && typeof data.value === "number") {
      barEl.style.width = "0%";
      requestAnimationFrame(() => {
        const widthPercent = (convertAmount(data.value) / convertAmount(maxVal)) * 100;
        barEl.style.width = widthPercent + "%";
        barEl.style.backgroundColor = data.color;
      });
    }
  });

  // Sparkline for Top Category
  const topCard = document.querySelector('.down-card[data-type="Top Category"]');
  if (topCard) {
    const sparkCanvas = topCard.querySelector(".sparkline-container");
    if (sparkCanvas) {
      const sparkData = Array(12).fill(0);
      txns.filter(t => t.type === "expense" && t.category === topCategory)
        .forEach(t => { sparkData[new Date(t.date).getMonth()] += Number(t.amount); });

      if (sparkCanvas.chartInstance) sparkCanvas.chartInstance.destroy();

      sparkCanvas.chartInstance = new Chart(sparkCanvas.getContext("2d"), {
        type: "line",
        data: {
          labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
          datasets: [{
            data: sparkData.map(a => convertAmount(a)),
            borderColor: "#2196F3",
            backgroundColor: "transparent",
            pointRadius: 0,
            tension: 0.3
          }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
      });
    }
  }

  // Mini charts
  renderMiniCharts(categories, "miniChartsContainerDown", false);
}

// -------------------- FINANCIAL SNAPSHOT --------------------
let filteredCategory = null;
let snapshotChart = null;

function renderFinancialSnapshot() {
  const user = getActiveUser();
  const txns = getTransactions().filter(t => t.user === user);

  const filteredTxns = filteredCategory
    ? txns.filter(t => (t.category || "").toLowerCase() === filteredCategory.toLowerCase())
    : txns;

  const income = filteredTxns.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = filteredTxns.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expenses;

  [["snapshotTotalBalance", balance],
   ["snapshotTotalIncome", income],
   ["snapshotTotalExpenses", expenses],
   ["snapshotRemainingBudget", balance]
  ].forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) animateNumber(el, 0, val);
  });

  const categories = {};
  txns.filter(t => t.type === "expense").forEach(t => {
    const c = t.category || "Others";
    categories[c] = (categories[c] || 0) + Number(t.amount);
  });

  const ctx = document.getElementById("snapshotCategoryChart");
  if (ctx) {
    if (snapshotChart) snapshotChart.destroy();
    snapshotChart = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels: Object.keys(categories).map(c => c.toUpperCase()),
        datasets: [{
          label: "Expenses",
          data: Object.values(categories).map(a => convertAmount(a)),
          backgroundColor: "#1982c4"
        }]
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
            }
          }
        },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  renderMiniCharts(categories, "miniChartsContainer", true);
}

// -------------------- LOAD DASHBOARD --------------------
document.addEventListener("DOMContentLoaded", () => {
  renderFinancialSnapshot();
});
document.addEventListener("currencyChanged", renderFinancialSnapshot);
document.addEventListener("transactionsUpdated", renderFinancialSnapshot);

// ===================== BUDGET ALERTS + MINI BARS =====================
let budgetAlertBars = []; // track mini bars for animation

function renderBudgetAlerts(allTxns = null) {
  const settings = getUserSettings();
  const txns = allTxns || getTransactions().filter(t => t.user === getActiveUser());

  // --- TOTALS
  const totalIncome = txns.filter(t => t.type === "income")
                          .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = txns.filter(t => t.type === "expense")
                            .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  // --- Update main summary cards
  const balanceElem   = document.getElementById("totalBalance");
  const incomeElem    = document.getElementById("totalIncome");
  const expensesElem  = document.getElementById("totalExpenses");

  if(balanceElem) animateNumber(balanceElem, 0, balance);
  if(incomeElem) animateNumber(incomeElem, 0, totalIncome);
  if(expensesElem) animateNumber(expensesElem, 0, totalExpenses);

  // --- Category totals
  const categoryBudgets = settings.categoryBudgets || {};
  const categories = {};
  txns.filter(t => t.type === "expense").forEach(t => {
    const cat = t.category || "Uncategorized";
    categories[cat] = (categories[cat] || 0) + Number(t.amount);
  });

  // --- Clear previous alerts & bars
  const alertsList = document.getElementById("budgetAlertsList");
  const chartsContainer = document.getElementById("budgetAlertCharts");
  if(alertsList) alertsList.innerHTML = "";
  if(chartsContainer) chartsContainer.innerHTML = "";

  budgetAlertBars = []; // reset tracked bars

  // --- Loop through categories
  Object.entries(categories).forEach(([cat, spent]) => {
  const budget = categoryBudgets[cat] ?? totalIncome * 0.25;
  const remaining = budget - spent;

  // ✅ Convert amounts to selected currency
  const convertedSpent = convertAmount(spent);
  const convertedBudget = convertAmount(budget);
  const convertedRemaining = convertAmount(remaining);

  // --- Calculate percent spent using converted values
  const percentSpent = (convertedSpent / convertedBudget) * 100;
  const targetPercent = Math.min(percentSpent, 100);

  // --- ALERT LIST ITEM
  if(alertsList){
  const li = document.createElement("li");
  li.textContent = `${cat}: ${formatCurrency(convertedSpent)} (${Math.round(percentSpent)}%) — ${remaining >= 0 ? "Remaining" : "Overspent"}: ${remaining >= 0 ? formatCurrency(convertedRemaining) : formatCurrency(Math.abs(convertedRemaining))}`;
  alertsList.appendChild(li);
}


  // --- MINI BAR
  if(chartsContainer){
    const miniBar = document.createElement("div");
    miniBar.className = "mini-bar";
    miniBar.style.position = "relative";

    const miniInner = document.createElement("div");
    miniInner.className = "mini-bar-inner";
    miniInner.style.width = "0%";
    miniInner.textContent = remaining >= 0
    ? formatCurrency(convertedRemaining)
    : `Overspent ${formatCurrency(Math.abs(convertedRemaining))}`;
    miniBar.appendChild(miniInner);
    chartsContainer.appendChild(miniBar);

    budgetAlertBars.push({element: miniInner, targetPercent, overspent: percentSpent > 100});

    if(percentSpent > 100) addBurningGlow(miniInner);
  }
});

  // --- Animate all mini bars
  budgetAlertBars.forEach(bar => animateFlowBar(bar.element, bar.targetPercent));
}

// --- Animate gradient flow for mini bars
function animateFlowBar(element, targetPercent){
  let width = 0;
  let offset = 0;

  function getColor(percent){
    if(percent < 75) return `rgb(0, ${Math.round(255*(percent/75))}, 0)`;          // green
    if(percent < 100) return `rgb(255, ${Math.round(128 - 128*((percent-75)/25))}, 0)`; // yellow→orange
    return `rgb(220,53,69)`; // red overspent
  }

  function step(){
    width += Math.min(1, targetPercent - width);
    offset = (offset + 2) % 100;
    const color = getColor(width);
    element.style.width = width + "%";
    element.style.background = `linear-gradient(to right,
      ${color} ${offset}%,
      rgba(0,128,255,0.9) ${offset+20}%,
      ${color} ${offset+40}%)`;
    if(width < targetPercent) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// --- Add burning glow for overspent categories
function addBurningGlow(barElement){
  const glow = document.createElement("div");
  glow.style.position = "absolute";
  glow.style.right = "-5px";
  glow.style.top = "0";
  glow.style.width = "12px";
  glow.style.height = "100%";
  glow.style.borderRadius = "6px";
  glow.style.boxShadow = "0 0 12px 6px rgba(220,53,69,0.7)";
  barElement.style.position = "relative";
  barElement.appendChild(glow);

  let pulse = 0;
  function pulseGlow(){
    pulse = (pulse + 1) % 60;
    const intensity = 0.7 + 0.3 * Math.sin((pulse/60) * 2 * Math.PI);
    glow.style.boxShadow = `0 0 12px ${6*intensity}px rgba(220,53,69,${intensity})`;
    requestAnimationFrame(pulseGlow);
  }
  pulseGlow();
}


// -------------------- INTEGRATE WITH DASHBOARD --------------------
document.addEventListener("DOMContentLoaded", () => {
  renderFinancialSnapshot();
  renderDownDashboard();
  renderDashboard();
  renderBudgetAlerts();
});

// Re-render all on currency change or transaction update
document.addEventListener("currencyChanged", () => {
  renderFinancialSnapshot();
  renderDownDashboard();
  renderDashboard();
  renderBudgetAlerts();
});
document.addEventListener("transactionsUpdated", () => {
  renderFinancialSnapshot();
  renderDownDashboard();
  renderDashboard();
  renderBudgetAlerts();
});

// ===================== ACHIEVEMENTS =====================
function renderAchievements() {
  const allTxns = getTransactions().filter(t => t.user === getActiveUser());
  const budgetNGN = Number(getUserSettings().budget || 0);
  const budgetConverted = convertAmount(budgetNGN);
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Pre-convert all transaction amounts
  const txnsConverted = allTxns.map(tx => ({
    ...tx,
    convertedAmount: convertAmount(Number(tx.amount))
  }));

  // --- Daily totals in converted currency
  const dailyTotals = {};
  txnsConverted.filter(t => t.type === "expense" && t.date).forEach(t => {
    const d = new Date(t.date).toISOString().split("T")[0];
    dailyTotals[d] = (dailyTotals[d] || 0) + t.convertedAmount;
  });

  // --- Calculate streak
  let streak = 0;
  for (let i = 0; i <= 365; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dStr = day.toISOString().split("T")[0];
    if ((dailyTotals[dStr] || 0) <= budgetConverted) streak++;
    else break;
  }

  const streakElem = document.getElementById("currentStreak");
  const streakBar = document.getElementById("streakBar");
  if (streakElem) streakElem.textContent = `${streak} day${streak !== 1 ? 's' : ''}`;
  if (streakBar) {
    streakBar.style.width = Math.min((streak / 30) * 100, 100) + "%";
    streakBar.style.backgroundColor = streak >= 3 ? "#4caf50" : "#ff595e";
  }

  // --- Weekly achievements
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  const weekly = txnsConverted.filter(t => t.type === "expense" && t.date && new Date(t.date) >= oneWeekAgo && t.convertedAmount <= budgetConverted).length;

  const weeklyAchievementsElem = document.getElementById("weeklyAchievements");
  if (weeklyAchievementsElem) {
    weeklyAchievementsElem.textContent = weekly;
    weeklyAchievementsElem.style.color = weekly >= 3 ? "#4caf50" : "#ff595e";
  }

  // --- Achievement data with converted currency
  const fc = formatCurrency;
  const achievementData = [
    {
      id: "streak",
      condition: streak >= 3,
      text: `Under-budget streak: ${streak} day${streak !== 1 ? 's' : ''} (≤ ${fc(budgetConverted)})`,
      badge: "🔥",
      confetti: true
    },
    {
      id: "weeklyGoal",
      condition: weekly >= 3,
      text: `Weekly savings goal reached (≤ ${fc(budgetConverted)} per day)`,
      badge: "🏅",
      confetti: true
    },
    {
      id: "transactions10",
      condition: allTxns.length >= 10,
      text: `10 transactions recorded`,
      badge: "🎯",
      confetti: true
    }
  ];

  const achievements = [];
  let delay = 0;
  let popupContainer = document.getElementById("achievementPopups");
  if (!popupContainer) {
    popupContainer = document.createElement("div");
    popupContainer.id = "achievementPopups";
    Object.assign(popupContainer.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    });
    document.body.appendChild(popupContainer);
  }

  achievementData.forEach(a => {
    if (a.condition) {
      achievements.push(a);
      if (typeof unlockAchievement === "function" && unlockAchievement(a.id) && a.confetti) {
        setTimeout(() => {
          const achievementSound = document.getElementById("achievementSound");
          if (achievementSound) {
            achievementSound.currentTime = 0;
            achievementSound.play().catch(() => {});
          }
          const popup = document.createElement("div");
          Object.assign(popup.style, {
            background: "#fff",
            padding: "10px 15px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "sans-serif"
          });
          popup.innerHTML = `<span style="font-size:18px;">${a.badge}</span><span>${a.text}</span>`;
          popupContainer.appendChild(popup);
          popup.animate([{ opacity: 0, transform: "translateX(50px)" }, { opacity: 1, transform: "translateX(0)" }], { duration: 500, easing: "ease-out" });
          setTimeout(() => popup.remove(), 3000);
        }, delay);
        delay += 1000;
      }
    }
  });

  const totalAchievementsElem = document.getElementById("totalAchievements");
  if (totalAchievementsElem) totalAchievementsElem.textContent = achievements.length;

  const achievementsList = document.getElementById("achievementsList");
  if (achievementsList)
    achievementsList.innerHTML = achievements
      .map(a => `<li><span>${a.text} <span class="badge">${a.badge}</span></span><small>${todayStr}</small></li>`)
      .join("");
}

let progressChart = null;
let pieChart = null;

// -------------------- WEEKLY GOAL (Optimized & Currency-Aware) --------------------
function renderWeeklyGoal() {
  const settings = getUserSettings();
  const weeklyGoalNGN = Number(settings.weeklyGoal || 50000);
  const userTxns = getTransactions().filter(t => t.user === getActiveUser());

  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  // --- Pre-convert all transaction amounts to selected currency
  const txnsConverted = userTxns.map(tx => ({
    ...tx,
    convertedAmount: convertAmount(Number(tx.amount))
  }));

  // --- Sum of expenses in the last 7 days
  let spentThisWeekNGN = userTxns
    .filter(t => t.type === "expense" && t.date && new Date(t.date) >= oneWeekAgo)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // --- Fallback for empty transactions
  if (userTxns.length === 0) spentThisWeekNGN = weeklyGoalNGN * 0.3;

  const remainingGoalNGN = Math.max(weeklyGoalNGN - spentThisWeekNGN, 0);

  // --- Convert totals to selected currency
  const spentThisWeekConverted = convertAmount(spentThisWeekNGN);
  const weeklyGoalConverted = convertAmount(weeklyGoalNGN);
  const remainingGoalConverted = convertAmount(remainingGoalNGN);

  // --- Percent of goal used
  const percentUsed = Math.min((spentThisWeekConverted / weeklyGoalConverted) * 100, 100);

  // --- Animate weekly spending circle
  const weeklyCircle = document.querySelector("#weeklyGoalsSection .progress-circle");
  if (weeklyCircle) animateCircle(weeklyCircle, percentUsed, "#4caf50");

  // --- Update weekly goals list
  const list = document.getElementById("weeklyGoalsList");
  if (list) {
    list.innerHTML = `
      <li>Spent: ${formatCurrency(spentThisWeekConverted)}</li>
      <li>Goal: ${formatCurrency(weeklyGoalConverted)}</li>
      <li>Remaining: ${formatCurrency(remainingGoalConverted)}</li>
    `;
  }

  // --- Celebration message
  const celebrationMsg = document.getElementById("celebrationMsg");
  if (celebrationMsg) {
    celebrationMsg.textContent = spentThisWeekConverted <= weeklyGoalConverted ? "🏅 Goal achieved!" : "⏳ Keep saving!";
    celebrationMsg.style.color = spentThisWeekConverted <= weeklyGoalConverted ? "#4caf50" : "#ff595e";
  }

  // --- Daily budgets for behavior goals (converted)
  const dailyBudgetConverted = weeklyGoalConverted / 7;
  const dailyFoodLimitConverted = dailyBudgetConverted * 0.5;

  const behaviorGoals = [
    { key: "log-expenses", label: "Log expenses every day 📅" },
    { key: "no-impulse", label: "Avoid impulse purchases 🛑" },
    { key: "food-budget", label: "Stay within food budget 🍽️" }
  ];

  behaviorGoals.forEach(goal => {
    const checkbox = document.querySelector(`#behaviorGoalsList input[data-goal="${goal.key}"]`);
    const progressSpan = document.querySelector(`#behaviorGoalsList .goal-progress[data-goal="${goal.key}"]`);
    let completedDays = 0;

    for (let d = 0; d < 7; d++) {
      const day = new Date(oneWeekAgo);
      day.setDate(oneWeekAgo.getDate() + d);
      const dayStr = day.toISOString().split("T")[0];

      if (goal.key === "log-expenses") {
        if (txnsConverted.some(tx => tx.type === "expense" && tx.date && new Date(tx.date).toISOString().split("T")[0] === dayStr)) completedDays++;
      }

      if (goal.key === "no-impulse") {
        const dayTxns = txnsConverted.filter(tx => tx.type === "expense" && tx.date && new Date(tx.date).toISOString().split("T")[0] === dayStr);
        if (dayTxns.length === 0 || dayTxns.every(tx => tx.convertedAmount <= dailyBudgetConverted)) completedDays++;
      }

      if (goal.key === "food-budget") {
        const foodTxns = txnsConverted.filter(tx => tx.type === "expense" && tx.category === "Food" && tx.date && new Date(tx.date).toISOString().split("T")[0] === dayStr);
        if (foodTxns.length === 0 || foodTxns.every(tx => tx.convertedAmount <= dailyFoodLimitConverted)) completedDays++;
      }
    }

    let percent = (completedDays / 7) * 100;

    // Fallback if no transactions
    if (userTxns.length === 0) percent = 50;

    if (checkbox) checkbox.checked = percent >= 100;
    if (progressSpan) animateCircle(progressSpan, percent, "#2196F3", 600);
  });

  // --- Overall Weekly Score
  const behaviorAvg = behaviorGoals
    .map(goal => parseInt(document.querySelector(`.goal-progress[data-goal="${goal.key}"]`)?.textContent) || 0)
    .reduce((a, b) => a + b, 0) / behaviorGoals.length;

  const overallPercent = Math.min((behaviorAvg * 0.5) + (percentUsed * 0.5), 100);

  const overallCircle = document.getElementById("overallProgress");
  const overallMsg = document.getElementById("overallMsg");
  if (overallCircle) animateCircle(overallCircle, overallPercent, "#ff9800", 800);

  if (overallMsg) {
    overallMsg.textContent = overallPercent >= 75 ? "Excellent progress! 🎉" :
                             overallPercent >= 50 ? "Good progress 🙂" :
                             "Keep going! 💪";
    overallMsg.style.color = overallPercent >= 75 ? "#4caf50" :
                             overallPercent >= 50 ? "#ffca3a" :
                             "#ff595e";
  }
}


// --- Generic function to animate any circular progress
function animateCircle(el, percent, color = "#4caf50", duration = 800) {
  let current = 0;
  const steps = duration / 10;
  const increment = percent / steps;

  const interval = setInterval(() => {
    current += increment;
    if (current >= percent) current = percent;
    el.textContent = `${Math.round(current)}%`;
    el.style.background = `conic-gradient(${color} 0deg ${current*3.6}deg, #dce0e6 ${current*3.6}deg 360deg)`;
    if (current >= percent) clearInterval(interval);
  }, 10);
}


// -------------------- Run on load & updates --------------------
document.addEventListener("DOMContentLoaded", () => {
  renderWeeklyGoal();
  checkWeeklyGoalAchievement();
});

document.addEventListener("currencyChanged", () => {
  renderWeeklyGoal();
  checkWeeklyGoalAchievement();
});

document.addEventListener("transactionsUpdated", () => {
  renderWeeklyGoal();
  checkWeeklyGoalAchievement();
});


// -------------------- DASHBOARD / UPCOMING PAYMENTS --------------------
function renderDashboard() {
  const user = getActiveUser();
  const txns = getTransactions().filter(t => t.user === user);
  const today = new Date();
  today.setHours(0,0,0,0);

  // --- Expenses ---
  let totalPaid = 0, totalUpcoming = 0;
  const expenses = txns.filter(t => t.type === "expense").map(t => {
    const due = t.dueDate ? new Date(t.dueDate) : null;
    const daysLeft = due ? Math.ceil((due - today) / (1000*60*60*24)) : "-";
    const status = t.paid ? "Paid" : (due ? (daysLeft<0 ? "Overdue" : daysLeft<=3 ? "Due Soon" : "Upcoming") : "Upcoming");
    if(t.paid) totalPaid += Number(t.amount); else totalUpcoming += Number(t.amount);
    return {...t, nextDue: due, daysLeft, status, paidSort: t.paid?1:0};
  });

  const incomeTotal = txns.filter(t=>t.type==="income").reduce((a,b)=>a+Number(b.amount),0);
  const remainingTotal = Math.max(incomeTotal-totalPaid-totalUpcoming,0);

  // --- Totals (summary cards) ---
  const totalPaidElem = document.getElementById("totalPaid");
  const totalUpcomingElem = document.getElementById("totalUpcoming");
  const remainingBudgetElem = document.getElementById("remainingBudget");

  if(totalPaidElem) animateNumber(totalPaidElem, 0, totalPaid);
  if(totalUpcomingElem) animateNumber(totalUpcomingElem, 0, totalUpcoming);
  if(remainingBudgetElem) animateNumber(remainingBudgetElem, 0, remainingTotal);

  // --- Progress Chart ---
  const ctxProgress = document.getElementById("progressCircle");
  if(ctxProgress && expenses.length>0) {
    if(progressChart) progressChart.destroy();
    progressChart = new Chart(ctxProgress.getContext("2d"), {
      type:"doughnut",
      data: {
        labels:["Paid","Upcoming","Remaining"],
        datasets:[{
          data:[convertAmount(totalPaid),convertAmount(totalUpcoming),convertAmount(remainingTotal)],
          backgroundColor:["#4caf50","#ffca3a","#dce0e6"],borderWidth:0
        }]
      },
      options:{
        cutout:"70%",
        plugins:{
          legend:{display:false},
          tooltip:{
            callbacks:{
              label: ctx => `${ctx.label}: ${formatCurrency(ctx.raw)}`
            }
          }
        }
      }
    });
  }

  // --- Category Pie Chart ---
  const catTotals = {};
  expenses.forEach(t=>{
    const cat = t.category || "Others";
    catTotals[cat] = (catTotals[cat] || 0) + Number(t.amount);
  });
  const ctxPie = document.getElementById("categoryPieChart");
  if(ctxPie && Object.keys(catTotals).length>0) {
    if(pieChart) pieChart.destroy();
    pieChart = new Chart(ctxPie.getContext("2d"),{
      type:"pie",
      data:{
        labels:Object.keys(catTotals),
        datasets:[{
          data:Object.values(catTotals).map(a=>convertAmount(a)),
          backgroundColor:['#1982c4','#ff595e','#ffca3a','#8ac926','#6a4c93','#ff6d00']
        }]
      },
      options:{
        plugins:{
          legend:{position:'bottom'},
          tooltip:{callbacks:{label:c=>`${c.label}: ${formatCurrency(c.raw)}`}}
        }
      }
    });
  }

  // --- Table ---
  const searchValue = document.getElementById("searchInput")?.value.toLowerCase()||"";
  const selectedCat = document.getElementById("categoryFilter")?.value || "All";
  let filtered = expenses.filter(t=>{
    const matchSearch = (t.description||"").toLowerCase().includes(searchValue);
    const matchCat = selectedCat==="All" || (t.category||"Others")===selectedCat;
    return matchSearch && matchCat;
  });

  const tbody = document.querySelector("#upcomingPaymentsTable tbody");
  if(tbody){
    if(filtered.length===0) {
      tbody.innerHTML=`<tr><td colspan="10" class="center">No records found</td></tr>`;
    } else {
      tbody.innerHTML = filtered.map(t=>`
        <tr class="${t.status==='Paid'?'paid':t.status==='Overdue'?'overdue':t.status==='Due Soon'?'dueSoon':'upcoming'}">
          <td>${t.description||t.category||"No description"}</td>
          <td class="amount-cell" data-amount="${t.amount}">-</td>
          <td>${t.nextDue ? t.nextDue.toISOString().split("T")[0] : "-"}</td>
          <td class="center">${t.daysLeft}</td>
          <td>${t.status}</td>
          <td>${t.category||"Others"}</td>
          <td>${t.recurrence||"-"}</td>
          <td>${t.method||"-"}</td>
          <td>${t.notes||"-"}</td>
          <td class="center"><input type="checkbox" ${t.paid?'checked':''} onchange="togglePaid('${t.description||t.category}','${t.dueDate||""}')"></td>
        </tr>
      `).join("");

      // Animate amounts in table
      tbody.querySelectorAll(".amount-cell").forEach(cell => {
        const amount = Number(cell.dataset.amount);
        animateNumber(cell, 0, amount);
      });
    }
  }

  // --- Category Filter ---
  const filterSelect = document.getElementById("categoryFilter");
  if(filterSelect){
    const cats = [...new Set(expenses.map(e=>e.category||"Others"))];
    filterSelect.innerHTML = '<option value="All">All Categories</option>'+cats.map(c=>`<option value="${c}">${c}</option>`).join('');
  }
}

// -------------------- ANIMATE NUMBER --------------------
function animateNumber(el, startVal, endVal, duration = 800) {
  const start = convertAmount(startVal);
  const end = convertAmount(endVal);
  const range = end - start;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const factor = Math.min(progress / duration, 1);
    const value = start + range * factor;
    el.textContent = formatCurrency(value);
    if (factor < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}


// ===================== CASH FLOW DASHBOARD WITH MINI-BARS =====================

// --- Animate currency helper
function animateCurrency(el, startVal, endVal, duration = 800) {
  const convertedStart = convertAmount(startVal);
  const convertedEnd = convertAmount(endVal);
  const range = convertedEnd - convertedStart;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const factor = Math.min(progress / duration, 1);
    const value = convertedStart + range * factor;
    el.textContent = formatCurrency(value);
    if (factor < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// --- Radial card progress helper
function updateRadialProgress(value, max, circleEl, color = "#2196F3") {
  const radius = circleEl.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  circleEl.style.stroke = color;
  circleEl.style.strokeDasharray = circumference;
  const percent = max > 0 ? Math.min(value / max, 1) : 0;
  circleEl.style.strokeDashoffset = circumference * (1 - percent);
}

// --- Render Cash Flow Dashboard
function renderCashFlowDashboard() {
  const user = getActiveUser();
  const txns = getTransactions().filter(t => t.user === user);

  // --- Totals
  const incomeTx = txns.filter(t => t.type === "income");
  const expenseTx = txns.filter(t => t.type === "expense");

  const totalIncome = incomeTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalExpenses = expenseTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const balance = totalIncome - totalExpenses;

  // --- Top expense category
  const categoryTotals = {};
  expenseTx.forEach(tx => {
    const cat = tx.category || "Others";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(tx.amount);
  });

  let topCategory = "-";
  let topAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > topAmount) { topAmount = amt; topCategory = cat; }
  }

  // --- Update down cards
  const cards = document.querySelectorAll("#downDashboard .down-card");
  const cardValues = [balance, totalIncome, totalExpenses, topAmount];
  const maxVal = Math.max(...cardValues, 1);
  const colors = ["#FFD700", "#4CAF50", "#FF6B6B", "#2196F3"];

  cards.forEach((card, i) => {
    const circle = card.querySelector(".progress-circle");
    const valueEl = card.querySelector(".down-card-value");
    const barEl = card.querySelector(".down-card-bar"); // mini-bar element inside the card

    // --- Value text
    if (i === 3) {
      valueEl.textContent = topCategory !== "-" ? `${topCategory} (${formatCurrency(topAmount)})` : "-";
    } else {
      animateCurrency(valueEl, 0, cardValues[i]);
    }

    // --- Radial circle
    if (circle && typeof cardValues[i] === "number") {
      updateRadialProgress(convertAmount(cardValues[i]), convertAmount(maxVal), circle, colors[i]);
    }

    // --- Mini-bar (optional horizontal bar under card)
    if (barEl && typeof cardValues[i] === "number") {
      barEl.style.width = "0%";
      requestAnimationFrame(() => {
        const widthPercent = (convertAmount(cardValues[i]) / convertAmount(maxVal)) * 100;
        barEl.style.width = widthPercent + "%";
        barEl.style.backgroundColor = colors[i];
      });
    }
  });

  // --- Animate summary stats
  const totalIncomeEl = document.getElementById("totalIncome");
  const totalExpensesEl = document.getElementById("totalExpenses");
  const remainingEl = document.getElementById("remainingBalance");

  if (totalIncomeEl) animateCurrency(totalIncomeEl, 0, totalIncome);
  if (totalExpensesEl) animateCurrency(totalExpensesEl, 0, totalExpenses);
  if (remainingEl) animateCurrency(remainingEl, 0, balance);

  // --- Update cash flow chart
  const ctx = document.getElementById("cashFlow");
  if (ctx) {
    if (ctx._chartInstance) ctx._chartInstance.destroy();

    ctx._chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Income", "Expenses", "Balance"],
        datasets: [{
          label: "Cash Flow",
          data: [convertAmount(totalIncome), convertAmount(totalExpenses), convertAmount(balance)],
          backgroundColor: ["#4CAF50", "#FF6B6B", "#FFD700"]
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: val => formatCurrency(val) }
          }
        }
      }
    });
  }
}

// --- Run on page load and currency change
document.addEventListener("DOMContentLoaded", renderCashFlowDashboard);
document.addEventListener("currencyChanged", renderCashFlowDashboard);


// -------------------- Down Dashboard helper --------------------
function updateDownDashboardCards(income, expenses, balance, topCategoryValue = 0) {
  const cards = document.querySelectorAll("#downDashboard .down-card");
  const values = [balance, income, expenses, topCategoryValue];
  const colors = ["#FFD700","#4CAF50","#FF6B6B","#2196F3"];

  cards.forEach((card, i) => {
    const circle = card.querySelector(".progress-circle");
    updateRadialProgress(values[i], Math.max(...values), circle, colors[i]);
    card.querySelector(".down-card-value").textContent = values[i] ? formatCurrency(values[i]) : "-";
  });
}

// -------------------- Radial Progress helper --------------------
function updateRadialProgress(value, max, circleEl, color="#2196F3"){
  const radius = circleEl.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  circleEl.style.stroke = color;
  circleEl.style.strokeDasharray = circumference;
  const percent = Math.min(value/max,1);
  circleEl.style.strokeDashoffset = circumference * (1 - percent);
}

// -------------------- GET ALL TRANSACTIONS WITH PROJECTION --------------------
function getAllTransactionsWithProjection() {
  const txns = getTransactions().filter(t => t.user === getActiveUser());
  const today = new Date();
  today.setHours(0,0,0,0);

  // Real transactions
  const realTxns = txns.map(t => ({ ...t, dateObj: new Date(t.date), projected: false }));

  // Projected expenses
  const categoryTotals = {};
  txns.filter(t => t.type === "expense").forEach(t => {
    const cat = t.category || "Others";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
  });

  const projectedExpenses = Object.keys(categoryTotals).map(cat => {
    const amount = Math.round(categoryTotals[cat] * 1.1); // 10% increase
    const projDate = new Date(today);
    projDate.setMonth(today.getMonth() + 1);
    return {
      description: `Projected ${cat}`,
      type: "expense",
      amount,
      category: cat,
      date: projDate.toISOString().split("T")[0],
      dateObj: projDate,
      projected: true
    };
  });

  // Projected income (e.g., 5% increase)
  const incomeTotals = {};
  txns.filter(t => t.type === "income").forEach(t => {
    const src = t.source || "Other";
    incomeTotals[src] = (incomeTotals[src] || 0) + Number(t.amount);
  });

  const projectedIncome = Object.keys(incomeTotals).map(src => {
    const amount = Math.round(incomeTotals[src] * 1.05); // 5% increase
    const projDate = new Date(today);
    projDate.setMonth(today.getMonth() + 1);
    return {
      description: `Projected Income: ${src}`,
      type: "income",
      amount,
      source: src,
      date: projDate.toISOString().split("T")[0],
      dateObj: projDate,
      projected: true
    };
  });

  return [...realTxns, ...projectedExpenses, ...projectedIncome];
}

// -------------------- FUTURE PROJECTION CHART --------------------
function normalizeCategory(cat) {
  if (!cat) return "Others";
  cat = cat.trim().toLowerCase();
  if (cat === "food") return "Food";
  if (cat === "transport" || cat === "transportation") return "Transportation";
  if (cat === "entertainment") return "Entertainment";
  if (cat === "utilities") return "Utilities";
  if (cat === "rent" || cat === "housing") return "Rent";
  return "Others";
}

const CATEGORY_COLORS = {
  Food: "#f87171",
  Transportation: "#a78bfa",
  Entertainment: "#34d399",
  Utilities: "#ff6d00",
  Rent: "#22c55e",
  Others: "#facc15"
};

// -------------------- FUTURE PROJECTION BAR CHART --------------------
function renderFutureProjectionBarChart() {
  const ctx = document.getElementById("futureProjectionBarChart");
  if (!ctx) return;

  const expenses = getRecentTransactions().filter(tx => tx.type === "expense");
  if (!expenses.length) return;

  const categoryTotals = {};
  expenses.forEach(tx => {
    const cat = normalizeCategory(tx.category);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(tx.amount);
  });

  const labels = Object.keys(categoryTotals);

  // ✅ convert amounts for chart
  const rawData = Object.values(categoryTotals);
  const data = rawData.map(a => convertAmount(a));

  // find top category (still use raw values)
  let topCategory = labels[0] || "";
  let maxAmount = rawData[0] || 0;
  labels.forEach((label, i) => {
    if (rawData[i] > maxAmount) {
      maxAmount = rawData[i];
      topCategory = label;
    }
  });

  const backgroundColors = labels.map(label => {
    const color = CATEGORY_COLORS[label] || CATEGORY_COLORS.Others;
    return label === topCategory ? darkenColor(color, 20) : color;
  });

  if (ctx._chartInstance) ctx._chartInstance.destroy();

  ctx._chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Expenses by Category",
        data,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: c => `${c.label}: ${formatCurrency(c.raw)}`
          }
        },
        datalabels: {
          formatter: val => formatCurrency(val),
          anchor: "end",
          align: "end",
          font: { weight: "bold" }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: val => formatCurrency(val)
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

// -------------------- UTILITY FUNCTION --------------------
function darkenColor(hex, percent) {
  const num = parseInt(hex.replace("#",""),16);
  let r = (num >> 16) & 0xFF;
  let g = (num >> 8) & 0xFF;
  let b = num & 0xFF;

  r = Math.max(0, r - Math.round(r * (percent/100)));
  g = Math.max(0, g - Math.round(g * (percent/100)));
  b = Math.max(0, b - Math.round(b * (percent/100)));

  return "#" + ((1<<24) + (r<<16) + (g<<8) + b).toString(16).slice(1);
}

// -------------------- RECENT TRANSACTIONS --------------------
function getRecentTransactions(days = 30) {
  const allTx = getTransactions();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return allTx.filter(tx => new Date(tx.date) >= cutoff);
}

// -------------------- FUTURE PROJECTION CHART --------------------
function renderFutureProjectionChart() {
  const ctx = document.getElementById("futureChart");
  if (!ctx) return;

  const transactions = getRecentTransactions();
  const dailyTotals = {};

  transactions.forEach(tx => {
    const day = tx.date.split("T")[0];
    dailyTotals[day] = (dailyTotals[day] || 0) + (tx.type === "income" ? tx.amount : -tx.amount);
  });

  const labels = Object.keys(dailyTotals).sort();
  const data = labels.map(d => dailyTotals[d]);

  if (ctx._chartInstance) ctx._chartInstance.destroy();

  const currency = window.selectedCurrency || "₦";

  ctx._chartInstance = new Chart(ctx, {
    type: "line",
    data: { labels, datasets: [{ label: "Net Daily Change", data, borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.2)", fill: true }] },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// -------------------- CATEGORY BREAKDOWN --------------------
function renderFutureCategoryBreakdown() {
  const ctx = document.getElementById("categoryChart");
  if (!ctx) return;

  const expenses = getRecentTransactions().filter(tx => tx.type === "expense");
  const categoryTotals = {};
  expenses.forEach(tx => { const cat = normalizeCategory(tx.category); categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount; });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const backgroundColors = labels.map(label => CATEGORY_COLORS[label] || CATEGORY_COLORS.Others);

  if (ctx._chartInstance) ctx._chartInstance.destroy();

  const currency = window.selectedCurrency || "₦";

  ctx._chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: backgroundColors, borderColor: "#fff", borderWidth: 2 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 12, padding: 10 } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${currency}${ctx.raw.toLocaleString()}` } }
      }
    }
  });
}

// -------------------- FUTURE TRANSACTIONS --------------------
function renderFutureTransactions() {
  const tbody = document.getElementById("transactionTable");
  if (!tbody) return;

  const transactions = getRecentTransactions()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  tbody.innerHTML = transactions.map(tx => `
    <tr>
      <td>${tx.date.split("T")[0]}</td>
      <td>${tx.description}</td>
      <td>${normalizeCategory(tx.category)}</td>
      <td>${tx.type}</td>
      <td>${formatCurrency(tx.amount)}</td>
    </tr>
  `).join("");
}

// -------------------- TOP CATEGORY CARD --------------------
function renderFutureTopCategoryCard() {
  const topCatElem = document.getElementById("topCategory");
  const barElem = topCatElem?.nextElementSibling;
  const currency = window.selectedCurrency || "₦";

  const expenses = getRecentTransactions().filter(tx => tx.type === "expense");
  if (!expenses.length) {
    topCatElem.textContent = "-";
    if (barElem) { barElem.style.width = "0%"; barElem.style.backgroundColor = CATEGORY_COLORS.Others; }
    return;
  }

  const categoryTotals = {};
  expenses.forEach(tx => { const cat = normalizeCategory(tx.category); categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount; });

  let topCategory = "-", maxAmount = 0, totalExpenses = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    totalExpenses += amt;
    if (amt > maxAmount) { maxAmount = amt; topCategory = cat; }
  }

  topCatElem.textContent = `${topCategory} (${currency}${convertAmount(maxAmount).toLocaleString()})`;

  if (barElem) {
    const percentage = Math.round((maxAmount / totalExpenses) * 100);
    barElem.style.width = `${percentage}%`;
    barElem.style.backgroundColor = CATEGORY_COLORS[topCategory] || CATEGORY_COLORS.Others;
  }
}

// -------------------- FUTURE INSIGHTS --------------------
function renderFutureInsights() {
  const insightElem = document.getElementById("insightText");
  const transactions = getRecentTransactions();
  if (!insightElem || !transactions.length) return;

  const expenses = transactions.filter(tx => tx.type === "expense");
  const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0);
  if (!totalExpenses) { insightElem.textContent = "No expenses recorded."; return; }

  const categoryTotals = {};
  expenses.forEach(tx => {
    const cat = normalizeCategory(tx.category);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount;
  });

  let topCategory = "-", topAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > topAmount) { topAmount = amt; topCategory = cat; }
  }

  const currency = window.selectedCurrency || getUserSettings().currency || "₦";
  insightElem.textContent = `In the last 30 days, you spent ${currency}${totalExpenses.toLocaleString()} in total. Top spending: ${topCategory} (${currency}${topAmount.toLocaleString()}).`;
}

// -------------------- FUTURE STATS --------------------
function renderFutureStats() {
  const transactions = getAllTransactionsWithProjection();
  let totalExpenses = 0, totalIncome = 0;

  transactions.forEach(tx => {
    if (tx.type === "expense") totalExpenses += Number(tx.amount);
    else if (tx.type === "income") totalIncome += Number(tx.amount);
  });

  const balance = totalIncome - totalExpenses;

  // -------------------- CONVERT AMOUNTS --------------------
  const totalIncomeConverted = convertAmount(totalIncome);
  const totalExpensesConverted = convertAmount(totalExpenses);
  const balanceConverted = convertAmount(balance);
  const avgSpendingConverted = convertAmount(totalExpenses / 30);

  const currency = window.selectedCurrency || "₦";

  // -------------------- DISPLAY CONVERTED VALUES --------------------
  const balanceElem = document.getElementById("balanceValue");
  const incomeElem = document.getElementById("incomeValue");
  const expenseElem = document.getElementById("expenseValue");
  const avgSpendingElem = document.getElementById("avgSpending");
  const projectedElem = document.getElementById("projectedSavings");
  const projectedElem2 = document.getElementById("projected");

  if (balanceElem) balanceElem.textContent = formatCurrency(balanceConverted);
  if (incomeElem) incomeElem.textContent = formatCurrency(totalIncomeConverted);
  if (expenseElem) expenseElem.textContent = formatCurrency(totalExpensesConverted);
  if (avgSpendingElem) avgSpendingElem.textContent = formatCurrency(avgSpendingConverted);
  if (projectedElem) projectedElem.textContent = formatCurrency(balanceConverted);
  if (projectedElem2) projectedElem2.textContent = formatCurrency(balanceConverted);

  // -------------------- UPDATE BARS --------------------
  const balanceBar = document.getElementById("balanceBar");
  const incomeBar = document.getElementById("incomeBar");
  const expenseBar = document.getElementById("expenseBar");

  if (totalIncomeConverted > 0) {
    if (balanceBar) balanceBar.style.width = `${Math.min((balanceConverted / totalIncomeConverted) * 100, 100)}%`;
    if (expenseBar) expenseBar.style.width = `${Math.min((totalExpensesConverted / totalIncomeConverted) * 100, 100)}%`;
  } else {
    if (balanceBar) balanceBar.style.width = "0%";
    if (expenseBar) expenseBar.style.width = "0%";
  }
  if (incomeBar) incomeBar.style.width = "100%";

  // -------------------- PROJECTED BAR --------------------
  let projectedBar = document.getElementById("projectedBar");
  if (!projectedBar && projectedElem2) {
    const projectedCard = projectedElem2.parentElement;
    projectedBar = document.createElement("div");
    projectedBar.id = "projectedBar";
    projectedBar.className = "down-card-bar";
    projectedCard.appendChild(projectedBar);
  }
  if (projectedBar) {
    projectedBar.style.width = totalIncomeConverted > 0
      ? `${Math.min((balanceConverted / totalIncomeConverted) * 100, 100)}%`
      : "0%";
    projectedBar.style.backgroundColor = "#3b82f6";
  }
}

// -------------------- SPENDING PATTERN --------------------
function renderSpendingPattern() {
  const txns = getTransactions().filter(t => t.user === getActiveUser());
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const currency = window.selectedCurrency || getUserSettings().currency || "₦";

  // --- Monthly totals
  const monthlyTotalsRaw = Array(12).fill(0);
  txns.filter(t => t.type === "expense").forEach(t => {
    const m = new Date(t.date).getMonth();
    monthlyTotalsRaw[m] += Number(t.amount);
  });

  // --- Totals
  const totalExpensesRaw = monthlyTotalsRaw.reduce((a,b) => a + b, 0);
  const totalIncomeRaw = txns.filter(t => t.type === "income")
                             .reduce((sum, t) => sum + Number(t.amount), 0);
  const balanceRaw = totalIncomeRaw - totalExpensesRaw;

  // --- Convert all totals once
  const totalExpenses = convertAmount(totalExpensesRaw);
  const totalIncome = convertAmount(totalIncomeRaw);
  const balance = convertAmount(balanceRaw);

  const monthlyTotals = monthlyTotalsRaw.map(m => convertAmount(m));

  // --- Category totals
  const catTotalsRaw = {};
  txns.filter(t => t.type==="expense").forEach(t => {
    const cat = t.category || "Others";
    catTotalsRaw[cat] = (catTotalsRaw[cat] || 0) + Number(t.amount);
  });

  const catTotals = {};
  Object.entries(catTotalsRaw).forEach(([cat, amt]) => {
    catTotals[cat] = convertAmount(amt);
  });

  const sortedCats = Object.entries(catTotals).sort((a,b) => b[1]-a[1]);
  const topCat = sortedCats.length ? sortedCats[0][0] : "-";

  // --- Monthly spending chart (bar)
  const ctx = document.getElementById("spendingChart");
  if(ctx){
    if(ctx.chartInstance) ctx.chartInstance.destroy();
    ctx.chartInstance = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: { labels: months, datasets: [{ label: "Spending", data: monthlyTotals, backgroundColor: "#4CAF50" }] },
      options: { responsive: true, plugins:{ tooltip:{ callbacks:{ label: ctx => formatCurrency(ctx.raw) } } } }
    });
  }

  // --- Sparkline for top category
  const topCard = document.querySelector('.down-card[data-type="topCategory"]');
  if(topCard){
    const sparkCanvas = topCard.querySelector(".sparkline-container");
    if(sparkCanvas){
      const sparkDataRaw = Array(12).fill(0);
      txns.filter(t => t.type==="expense" && t.category===topCat)
          .forEach(t => { sparkDataRaw[new Date(t.date).getMonth()] += Number(t.amount); });

      const sparkData = sparkDataRaw.map(m => convertAmount(m));

      if(sparkCanvas.chartInstance) sparkCanvas.chartInstance.destroy();
      sparkCanvas.chartInstance = new Chart(sparkCanvas.getContext("2d"), {
        type:"line",
        data:{
          labels: months,
          datasets:[{
            data: sparkData,
            borderColor:"#2196F3",
            backgroundColor:"transparent",
            pointRadius:0,
            tension:0.3
          }]
        },
        options:{ responsive:true, plugins:{ legend:{display:false}, tooltip:{callbacks:{label:ctx=>formatCurrency(ctx.raw)}} }, scales:{ x:{display:false}, y:{display:false} } }
      });
    }
  }

  // --- Top categories list
  const topCategoriesList = document.getElementById("topCategoriesList");
  if(topCategoriesList){
    topCategoriesList.innerHTML = sortedCats.map(([cat, amt], i) => {
      return `<li>
        <span>${cat}</span>
        <span class="amount">${formatCurrency(amt)}</span>
        ${i===0 ? '<span class="badge">Top</span>' : ''}
      </li>`;
    }).join("");
  }

  // --- Update totals
  document.getElementById("avgSpending").textContent = formatCurrency(balance);
  document.getElementById("thisMonthSpending").textContent = formatCurrency(totalIncome);
  document.getElementById("topCategory").textContent = formatCurrency(totalExpenses);
  document.getElementById("topCategoryName").textContent = topCat;
}

// -------------------- TREND COMPARISON PAGE --------------------
let trendChart = null;

function renderTrendComparison() {
  const txns = getTransactions().filter(t => t.user === getActiveUser());
  const month = new Date().getMonth();
  const currency = window.selectedCurrency || getUserSettings().currency || "₦";

  // --- Raw totals
  const totalIncomeRaw = txns.filter(t => t.type === "income")
                             .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpensesRaw = txns.filter(t => t.type === "expense")
                               .reduce((sum, t) => sum + Number(t.amount), 0);
  const balanceRaw = totalIncomeRaw - totalExpensesRaw;

  // --- Convert totals once
  const totalIncome = convertAmount(totalIncomeRaw);
  const totalExpenses = convertAmount(totalExpensesRaw);
  const balance = convertAmount(balanceRaw);

  // --- Category totals
  const catTotalsRaw = {};
  txns.filter(t => t.type === "expense").forEach(t => {
    const cat = t.category || "Others";
    catTotalsRaw[cat] = (catTotalsRaw[cat] || 0) + Number(t.amount);
  });

  const catTotals = {};
  Object.entries(catTotalsRaw).forEach(([cat, amt]) => {
    catTotals[cat] = convertAmount(amt);
  });

  const sortedCats = Object.entries(catTotals).sort((a,b) => b[1] - a[1]);
  const topCat = sortedCats.length ? sortedCats[0][0] : "-";

  // --- Update down cards
  const downCards = document.querySelectorAll("#downDashboard .down-card");
  if (downCards.length) {
    downCards[0].querySelector(".down-card-value").textContent = formatCurrency(balance);
    downCards[1].querySelector(".down-card-value").textContent = formatCurrency(totalIncome);
    downCards[2].querySelector(".down-card-value").textContent = formatCurrency(totalExpenses);
    downCards[3].querySelector(".down-card-value").textContent = topCat;
  }

  // --- This month & average
  const thisMonthTotalRaw = txns.filter(t => t.type === "expense" && new Date(t.date).getMonth() === month)
                                .reduce((s, t) => s + Number(t.amount), 0);
  const thisMonthTotal = convertAmount(thisMonthTotalRaw);
  const avgTotal = convertAmount(totalExpensesRaw / 12);
  const diff = avgTotal ? Math.round(((thisMonthTotal - avgTotal) / avgTotal) * 100) : 0;

  document.getElementById("thisMonth").textContent = formatCurrency(thisMonthTotal);
  document.getElementById("avgMonth").textContent = formatCurrency(avgTotal);
  document.getElementById("diff").textContent = diff + "%";

  // --- Monthly trend chart
  const ctx = document.getElementById("trendChart");
  if (ctx) {
    if (trendChart) trendChart.destroy();

    const monthlyDataRaw = Array(12).fill(0).map((_, i) =>
      txns.filter(t => t.type === "expense" && new Date(t.date).getMonth() === i)
          .reduce((s, t) => s + Number(t.amount), 0)
    );
    const monthlyData = monthlyDataRaw.map(m => convertAmount(m));

    // Top 3 months
    const sortedData = monthlyData.map((v, i) => ({ val: v, idx: i }))
                                  .sort((a, b) => b.val - a.val)
                                  .slice(0, 3);
    const topIndexes = sortedData.map(d => d.idx);

    const pointColors = monthlyData.map((val, idx) => {
      if (idx === topIndexes[0]) return "#FF3B30";
      if (idx === topIndexes[1]) return "#FF9500";
      if (idx === topIndexes[2]) return "#FFCC00";
      return "#2196F3";
    });

    const pointSizes = monthlyData.map((val, idx) => {
      if (idx === topIndexes[0]) return 14;
      if (idx === topIndexes[1]) return 12;
      if (idx === topIndexes[2]) return 10;
      return 6;
    });

    const pulseSettings = {};
    topIndexes.forEach((idx, rank) => {
      pulseSettings[idx] = {
        speed: 0.8 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        colors: ["#FF3B30", "#FF9500", "#FFCC00"][rank]
      };
    });

    trendChart = new Chart(ctx.getContext("2d"), {
      type: "line",
      data: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        datasets: [{
          label: "Spending",
          data: monthlyData,
          borderColor: "#2196F3",
          backgroundColor: "rgba(33,150,243,0.2)",
          tension: 0.3,
          fill: true,
          pointBackgroundColor: pointColors,
          pointRadius: pointSizes,
          pointHoverRadius: pointSizes.map(s => s + 4),
          pointBorderWidth: monthlyData.map((val, idx) => topIndexes.includes(idx) ? 3 : 1),
          pointBorderColor: "#fff"
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: ctx => formatCurrency(ctx.raw)
            }
          }
        },
        animation: { duration: 1000 },
        afterDraw: chart => {
          const ctx2 = chart.ctx;
          const now = Date.now() / 1000;

          chart.data.datasets[0].data.forEach((val, idx) => {
            if (!topIndexes.includes(idx)) return;
            const meta = chart.getDatasetMeta(0);
            const pt = meta.data[idx];
            if (!pt) return;

            const { speed, phase, colors } = pulseSettings[idx];
            const baseRadius = pointSizes[idx];
            const floatOffset = 5 * Math.sin(now * speed * 2 * Math.PI + phase);
            const pulse = baseRadius + 4 * Math.abs(Math.sin(now * speed * 2 * Math.PI + phase));
            const haloAlpha = 0.5;
            const pulseAlpha = haloAlpha * (0.5 + 0.5 * Math.sin(now * speed * 2 * Math.PI + phase));

            // Pulse glow
            ctx2.save();
            ctx2.beginPath();
            ctx2.arc(pt.x, pt.y + floatOffset, pulse, 0, 2 * Math.PI);
            ctx2.strokeStyle = colors;
            ctx2.lineWidth = 4;
            ctx2.shadowBlur = 15;
            ctx2.shadowColor = colors;
            ctx2.stroke();
            ctx2.restore();

            ctx2.save();
            ctx2.beginPath();
            ctx2.arc(pt.x, pt.y + floatOffset, pulse + 6, 0, 2 * Math.PI);
            ctx2.fillStyle = `rgba(${parseInt(colors.slice(1,3),16)},${parseInt(colors.slice(3,5),16)},${parseInt(colors.slice(5,7),16)},${pulseAlpha})`;
            ctx2.fill();
            ctx2.restore();
          });
        }
      }
    });
  }
}


// -------------------- TOP CATEGORY CHART --------------------
let topCategoryChart = null;

function renderTopCategoryChart() {
  const txns = getTransactions().filter(t => t.user === getActiveUser() && t.type === "expense");
  const currency = window.selectedCurrency || getUserSettings().currency || "₦";

  // --- Calculate raw totals per category
  const categoryTotalsRaw = {};
  txns.forEach(t => {
    const cat = t.category || "Others";
    categoryTotalsRaw[cat] = (categoryTotalsRaw[cat] || 0) + Number(t.amount);
  });

  // --- Convert totals once
  const categoryTotals = {};
  Object.entries(categoryTotalsRaw).forEach(([cat, amt]) => {
    categoryTotals[cat] = convertAmount(amt);
  });

  const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const labels = sortedCats.map(([cat]) => cat);
  const data = sortedCats.map(([_, amt]) => amt);

  const ctx = document.getElementById("topCategoryChart");
  if (ctx) {
    if (topCategoryChart) topCategoryChart.destroy();

    topCategoryChart = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Expenses",
          data,
          backgroundColor: "#FF6B6B"
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => formatCurrency(ctx.raw)
            }
          }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  // --- Optional: update top category text elsewhere in dashboard
  const topCatNameEl = document.getElementById("topCategoryName");
  if (topCatNameEl) topCatNameEl.textContent = labels[0] || "-";

  const topCatAmountEl = document.getElementById("topCategory");
  if (topCatAmountEl) topCatAmountEl.textContent = formatCurrency(data[0] || 0);
}


// -------------------- INSIGHTS --------------------
let insightsCharts = {}; // store mini sparkline instances
let pulseAnimationFrame = null; // global animation loop
let hoverGlowFrame = null; // smooth hover glow animation

function renderInsights() {
  const txns = getTransactions().filter(
    t => t.user === getActiveUser() && t.type === "expense"
  );

  const currentMonth = new Date().getMonth();
  const currency = window.selectedCurrency || getUserSettings().currency || "₦";

  // --- Total Spending (THIS MONTH ONLY)
  const totalSpending = convertAmount(
    txns
      .filter(t => new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0)
  );

  const totalSpendingEl = document.getElementById("totalSpending");
  totalSpendingEl.textContent = formatCurrency(totalSpending);

  // --- Average Monthly Spending
  const monthlyTotals = Array(12).fill(0);
  txns.forEach(t => {
    const m = new Date(t.date).getMonth();
    monthlyTotals[m] += Number(t.amount);
  });

  const avgMonthly = convertAmount(monthlyTotals.reduce((a, b) => a + b, 0) / 12);
  document.getElementById("avgSpendingSummary").textContent = formatCurrency(avgMonthly);

  // --- Category Totals
  const catTotalsRaw = {};
  txns.forEach(t => {
    const cat = t.category || "Others";
    catTotalsRaw[cat] = (catTotalsRaw[cat] || 0) + Number(t.amount);
  });

  const catTotals = {};
  Object.entries(catTotalsRaw).forEach(([cat, amt]) => {
    catTotals[cat] = convertAmount(amt);
  });

  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCats.length ? sortedCats[0][0] : "-";
  document.getElementById("summaryTopCategory").textContent = topCategory;

  // --- Category color palette
  const palette = ["#FFD700", "#4ADE80", "#60A5FA", "#F472B6", "#FB923C", "#A78BFA"];
  const catColors = {};
  sortedCats.forEach(([cat], i) => (catColors[cat] = palette[i % palette.length]));

  // --- Populate insights list
  const insightsList = document.getElementById("insightsList");
  if (insightsList) {
    insightsList.innerHTML = sortedCats
      .map(
        ([cat, amt]) => `
      <li class="insightItem" data-category="${cat}">
        <span class="insightText">${cat}: ${formatCurrency(amt)}</span>
        <canvas class="miniSparkline" data-category="${cat}" width="90" height="26"></canvas>
      </li>
    `
      )
      .join("");
  }

  // --- Render enhanced sparklines
  document.querySelectorAll(".miniSparkline").forEach(canvas => {
    const cat = canvas.dataset.category;

    const rawData = Array(12).fill(0);
    txns
      .filter(t => (t.category || "Others") === cat)
      .forEach(t => (rawData[new Date(t.date).getMonth()] += Number(t.amount)));

    // Convert amounts
    const convertedData = rawData.map(v => convertAmount(v));

    // Normalize for sparkline height
    const max = Math.max(...convertedData, 1);
    const normalized = convertedData.map(v => (v / max) * 100);

    if (insightsCharts[cat]) insightsCharts[cat].destroy();

    const ctx = canvas.getContext("2d");

    // Default line gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `${catColors[cat]}55`);
    gradient.addColorStop(1, `${catColors[cat]}08`);

    insightsCharts[cat] = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array(12).fill(""),
        datasets: [
          {
            data: normalized,
            borderColor: catColors[cat],
            backgroundColor: gradient,
            borderWidth: cat === topCategory ? 3 : 2,
            tension: 0.55,
            fill: true,
            pointRadius: normalized.map((_, i) => (i === currentMonth ? 4 : 2)),
            pointBackgroundColor: "#fff",
            pointBorderColor: catColors[cat],
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { duration: 700, easing: "easeOutQuart" }
      }
    });
  });

  // --- Smooth hover gradient glow & pulsing points (unchanged)
  document.querySelectorAll(".insightItem").forEach(item => {
    const category = item.dataset.category;
    let glow = 0;
    let fadingOut = false;

    const animateGlow = () => {
      Object.entries(insightsCharts).forEach(([cat, chart]) => {
        const dataset = chart.data.datasets[0];
        const ctx = chart.ctx;

        const grad = ctx.createLinearGradient(0, 0, 0, chart.height);
        grad.addColorStop(
          0,
          `${catColors[cat]}${cat === category ? (0.2 + glow * 0.35).toString(16) : "08"}`
        );
        grad.addColorStop(
          1,
          `${catColors[cat]}${cat === category ? (0.1 + glow * 0.25).toString(16) : "08"}`
        );
        dataset.backgroundColor = grad;
        dataset.borderWidth = cat === category ? (cat === topCategory ? 4 : 3) : cat === topCategory ? 3 : 2;
        chart.update();
      });

      if (!fadingOut && glow < 1) glow += 0.03;
      if (fadingOut && glow > 0) glow -= 0.03;
      if (!fadingOut || glow > 0) hoverGlowFrame = requestAnimationFrame(animateGlow);
    };

    item.addEventListener("mouseenter", () => {
      cancelAnimationFrame(hoverGlowFrame);
      fadingOut = false;
      animateGlow();
    });

    item.addEventListener("mouseleave", () => {
      fadingOut = true;
      animateGlow();
    });
  });

  function animateSparklines() {
    Object.values(insightsCharts).forEach(chart => {
      const meta = chart.getDatasetMeta(0);
      const ctx2 = chart.ctx;
      meta.data.forEach((pt, i) => {
        if (!pt) return;
        if (i === currentMonth) {
          const time = Date.now() / 400;
          const radius = 4 + 2 * Math.sin(time);
          const haloRadius = radius + 6;
          const alpha = 0.3 + 0.2 * Math.sin(time);

          ctx2.save();
          ctx2.beginPath();
          ctx2.arc(pt.x, pt.y, haloRadius, 0, 2 * Math.PI);
          ctx2.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx2.shadowBlur = 8;
          ctx2.shadowColor = `rgba(255,255,255,${alpha})`;
          ctx2.fill();
          ctx2.restore();

          ctx2.save();
          ctx2.beginPath();
          ctx2.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
          ctx2.fillStyle = "#fff";
          ctx2.shadowBlur = 4;
          ctx2.shadowColor = "#fff";
          ctx2.fill();
          ctx2.restore();
        }
      });
    });
    pulseAnimationFrame = requestAnimationFrame(animateSparklines);
  }

  cancelAnimationFrame(pulseAnimationFrame);
  animateSparklines();
}


// ===================== GLOBAL CURRENCY SETUP =====================

// 1. Initialize selected currency (ONLY from localStorage or fallback)
window.selectedCurrency =
  localStorage.getItem("selectedCurrency") ||
  getUserSettings()?.currency ||
  "₦";

// 2. Global formatter (USE EVERYWHERE)
function formatCurrency(val) {
  return `${window.selectedCurrency}${Number(val).toLocaleString()}`;
}

// 3. Currency dropdown handler
const currencyDropdown = document.getElementById("currencyDropdown");
if (currencyDropdown) {
  currencyDropdown.value = window.selectedCurrency;

  currencyDropdown.addEventListener("change", (e) => {
    window.selectedCurrency = e.target.value;
    localStorage.setItem("selectedCurrency", window.selectedCurrency);

    // ONE event to rule them all
    document.dispatchEvent(new Event("currencyChanged"));
  });
}



// ===================== UNIFIED DASHBOARD UPDATE =====================

function updateFutureSection() {
  renderFutureProjectionChart();
  renderFutureProjectionBarChart();
  renderFutureCategoryBreakdown();
  renderFutureTransactions();
  renderFutureTopCategoryCard();
  renderFutureInsights();
  renderFutureStats();
}

function updateAllDashboards() {
  if (document.getElementById("downDashboard")) renderDownDashboard();
  if (document.getElementById("snapshotCategoryChart")) renderFinancialSnapshot();
  if (document.getElementById("achievementsList")) renderAchievements();
  if (document.getElementById("upcomingPaymentsTable")) renderDashboard();
  if (document.getElementById("cashFlow")) renderCashFlow();
  if (document.getElementById("futureChart")) updateFutureSection();
  if (document.getElementById("spendingChart")) renderSpendingPattern();
  if (document.getElementById("insightsList")) renderInsights();
  if (document.getElementById("trendChart")) renderTrendComparison();
  if (document.getElementById("topCategoryChart")) renderTopCategoryChart();
}

// ===================== EVENT LISTENERS =====================

document.addEventListener("currencyChanged", updateAllDashboards);
document.addEventListener("transactionsUpdated", updateAllDashboards);
document.addEventListener("DOMContentLoaded", updateAllDashboards);
