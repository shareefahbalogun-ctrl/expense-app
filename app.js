// -------------------- GLOBAL CURRENCY --------------------
// Global currency variables accessible across all scripts
window.selectedCurrencyCode = 'NGN';
window.selectedCurrencySymbol = '₦';

// Conversion rates (base = NGN) + currency symbols
const CURRENCY_RATES = {
  NGN: { rate: 1, symbol: '₦' },
  USD: { rate: 0.0027, symbol: '$' },
  EUR: { rate: 0.0025, symbol: '€' },
  GBP: { rate: 0.0021, symbol: '£' },
  QAR: { rate: 0.0099, symbol: 'ر.ق' },
  AED: { rate: 0.01, symbol: 'د.إ' },
  SAR: { rate: 0.01, symbol: '﷼' },
  JPY: { rate: 0.37, symbol: '¥' },
  CAD: { rate: 0.0035, symbol: '$' },
  AUD: { rate: 0.0042, symbol: '$' },
  CHF: { rate: 0.0025, symbol: 'CHF' },
  CNY: { rate: 0.018, symbol: '¥' },
  INR: { rate: 0.22, symbol: '₹' },
  BRL: { rate: 0.014, symbol: 'R$' },
  ZAR: { rate: 0.05, symbol: 'R' },
  EGP: { rate: 0.086, symbol: '£' },
  KES: { rate: 0.5, symbol: 'KSh' }
};

// =================== IMMEDIATE DARK MODE APPLY ===================
// Prevent flash before DOMContentLoaded
(function() {
  let initialDarkMode = false;
  const user = localStorage.getItem("activeUser");
  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (user) {
    const u = users.find(u => u.username === user);
    if (u?.settings?.darkMode === true) initialDarkMode = true;
  }
  if (!initialDarkMode) initialDarkMode = localStorage.getItem('darkMode') === 'enabled';
  if (initialDarkMode) document.body.classList.add('dark');
  document.body.style.visibility = 'visible';
})();

// =================== DOM CONTENT LOADED ===================
document.addEventListener("DOMContentLoaded", () => {

  // ===== DOM ELEMENTS =====
  const DOM = {
    auth: document.getElementById("auth"),
    showLogin: document.getElementById("showLogin"),
    showRegister: document.getElementById("showRegister"),
    loginForm: document.getElementById("loginForm"),
    registerForm: document.getElementById("registerForm"),
    loginUser: document.getElementById("loginUser"),
    loginPass: document.getElementById("loginPass"),
    loginBtn: document.getElementById("loginBtn"),
    regUser: document.getElementById("regUser"),
    regEmail: document.getElementById("regEmail"),
    regPass: document.getElementById("regPass"),
    regPassConfirm: document.getElementById("regPassConfirm"),
    registerBtn: document.getElementById("registerBtn"),
    logoutSidebarBtn: document.getElementById("logoutSidebarBtn"),
    dashboard: document.getElementById("dashboard"),
    welcomeUser: document.getElementById("welcomeUser"),
    welcomeTotalIncome: document.getElementById("welcomeTotalIncome"),
    welcomeTotalExpenses: document.getElementById("welcomeTotalExpenses"),
    welcomeCurrentBalance: document.getElementById("welcomeCurrentBalance"),
    welcomeBudgetRemaining: document.getElementById("welcomeBudgetRemaining"),
    monthlyBudgetInput: document.getElementById("monthlyBudgetInput"),
    budgetProgressBar: document.getElementById("budgetProgressBar"),
    overspendArrow: document.getElementById("overspendArrow"),
    quickDesc: document.getElementById("transactionDescriptionSidebar"),
    quickAmount: document.getElementById("transactionAmountSidebar"),
    quickType: document.getElementById("transactionTypeSidebar"),
    quickCategory: document.getElementById("transactionCategorySidebar"),
    quickAddBtn: document.getElementById("saveTransactionBtnSidebar"),
    categoryFilter: document.getElementById("categoryFilterSidebar"),
    recurringDesc: document.getElementById("recurringDescSidebar"),
    recurringAmount: document.getElementById("recurringAmountSidebar"),
    recurringType: document.getElementById("recurringTypeSidebar"),
    recurringCategory: document.getElementById("recurringCategorySidebar"),
    recurringFrequency: document.getElementById("recurringFrequencySidebar"),
    addRecurringBtn: document.getElementById("addRecurringBtnSidebar"),
    recurringList: document.getElementById("recurringList"),
    miniCharts: document.querySelectorAll(".mini-chart"),
    progressCircles: document.querySelectorAll(".progress-circle"),
    charts: {
      income: document.getElementById("incomeChartCanvas"),
      expenses: document.getElementById("expensesChartCanvas"),
      category: document.getElementById("categoryChartCanvas"),
      budget: document.getElementById("monthlyBudgetChart")
    },
    notificationBtn: document.getElementById("notificationBtn"),
    notificationCount: document.getElementById("notificationCount"),
    dashboardNotification: document.getElementById("dashboardNotification"),
    currencySelect: document.getElementById("currencySelect"),
    quickCurrencySelect: document.getElementById("quickCurrencySelect"),
    confettiToggle: document.getElementById("confettiToggle"),
    connectMonoBtn: document.getElementById("connectMonoBtn"),
    sidebarToggleBtn: document.getElementById("sidebarToggleBtn"),
    sidebar: document.getElementById("sidebar"),
    dashboardContent: document.getElementById("dashboardContent"),
    darkModeToggle: document.getElementById("darkModeToggle"),

    // ✅ SETTINGS PANEL (ADDED)
    dateFormatSelect: document.getElementById("dateFormatSelect"),
    transactionReminderToggle: document.getElementById("transactionReminderToggle"),
    budgetAlertToggle: document.getElementById("budgetAlertToggle"),
    incomeAlertToggle: document.getElementById("incomeAlertToggle"),
    monthlyBudgetInputSettings: document.getElementById("monthlyBudgetInputSettings"),
    savingsGoalInput: document.getElementById("savingsGoalInput"),
    appPinToggle: document.getElementById("appPinToggle"),
    biometricToggle: document.getElementById("biometricToggle"),
    twoFactorToggle: document.getElementById("twoFactorToggle"),

    saveSettingsBtn: document.getElementById("saveSettingsBtn"),
    resetSettingsBtn: document.getElementById("resetSettingsBtn")
  };


  // ===== Notification System =====
let notificationCount = 0; // global counter

function showNotification(message, type = "info", duration = 3000) {
  const notifEl = DOM.dashboardNotification; // toast element
  if (!notifEl) return;

  // --- Toast notification ---
  notifEl.textContent = message;
  notifEl.className = `show ${type}`;
  void notifEl.offsetWidth; // restart animation if triggered quickly

  // auto-hide
  clearTimeout(window.notificationTimeout);
  window.notificationTimeout = setTimeout(() => {
    notifEl.classList.remove("show");
  }, duration);

  // dismiss on click
  notifEl.onclick = () => notifEl.classList.remove("show");

  // --- Bell badge ---
  const notifCountEl = DOM.notificationCount;
  if (notifCountEl) {
    notificationCount += 1;
    notifCountEl.textContent = notificationCount;
    notifCountEl.classList.remove("hidden");
  }
}

// Clicking the bell resets the badge
if (DOM.notificationBtn && DOM.notificationCount) {
  DOM.notificationBtn.addEventListener("click", () => {
    notificationCount = 0;
    DOM.notificationCount.textContent = "0";
    DOM.notificationCount.classList.add("hidden");

    // Optional: toggle a notification panel here
    alert("🔔 Notification bell clicked!"); // Replace with actual panel
  });
}

  // =================== SIDEBAR TOGGLE & AUTO-CLOSE ===================
  if (DOM.sidebarToggleBtn && DOM.sidebar && DOM.dashboardContent) {

    DOM.sidebarToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      DOM.sidebar.classList.toggle("expanded");
      DOM.dashboardContent.classList.toggle("sidebar-open");
    });

    function autoCloseSidebar() {
      if (DOM.sidebar.classList.contains("expanded")) {
        DOM.sidebar.classList.remove("expanded");
        DOM.dashboardContent.classList.remove("sidebar-open");
      }
    }

    DOM.sidebar.querySelectorAll("button, a, li").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) autoCloseSidebar();
      });
    });

    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 768 && DOM.sidebar.classList.contains("expanded")) {
        if (!DOM.sidebar.contains(e.target) && !DOM.sidebarToggleBtn.contains(e.target)) {
          autoCloseSidebar();
        }
      }
    });

  } else {
    console.warn("Sidebar toggle button or dashboard elements not found!");
  }

  // =================== TRANSACTION HISTORY BUTTON ===================
  const historyBtn = document.getElementById("dashboardTransactionHistoryBtn");
  if (historyBtn) {
    historyBtn.addEventListener("click", () => {
      window.open("./transaction.html", "_blank");
      showNotification("Opened transaction history 📄", "success");
    });
  }

    // ===== LOCAL STORAGE HELPERS =====
    const getUsers = () => JSON.parse(localStorage.getItem("users")) || [];
    const saveUsers = users => localStorage.setItem("users", JSON.stringify(users));
    const getActiveUser = () => localStorage.getItem("activeUser");
    const setActiveUser = user => localStorage.setItem("activeUser", user);
    const clearActiveUser = () => localStorage.removeItem("activeUser");
    const getTransactions = () => JSON.parse(localStorage.getItem("transactions")) || [];
    const saveTransactions = txns => localStorage.setItem("transactions", JSON.stringify(txns));

    const getDefaultSettings = () => ({
      currencyCode: "NGN",
      currencySymbol: "₦",
      darkMode: false,
      confetti: true,
      budget: 0,
      categoryBudgets: { "General":0,"Food":0,"Transport":0,"Rent":0,"Utilities":0,"Entertainment":0,"Salary":0,"Others":0 }
    });

    const getUserSettings = () => {
      const user = getActiveUser();
      if(!user) return getDefaultSettings();
      const u = getUsers().find(u => u.username === user);
      return u?.settings || getDefaultSettings();
    };

    const saveUserSettings = s => {
      const user = getActiveUser();
      if(!user) return;
      const users = getUsers();
      const idx = users.findIndex(u => u.username === user);
      if(idx===-1) return;
      users[idx].settings = s;
      saveUsers(users);
    };

    let settings = getUserSettings();
window.selectedCurrencyCode = settings.currencyCode || "NGN";
window.selectedCurrencySymbol = settings.currencySymbol || "₦";
let chartInstances = {};
let activeCategoryFilter = "All Categories";

// =================== DARK MODE TOGGLE ===================
if (DOM.darkModeToggle) {
const applyDarkMode = (enabled) => {
  document.body.classList.toggle('dark', enabled);
  DOM.darkModeToggle.textContent = enabled ? '☀️ Light Mode' : '🌙 Dark Mode';
};

// Apply saved setting on load
applyDarkMode(settings.darkMode);

// Toggle dark mode on click
DOM.darkModeToggle.addEventListener('click', () => {
  settings.darkMode = !settings.darkMode;
  applyDarkMode(settings.darkMode);
  saveUserSettings(settings);
  localStorage.setItem('darkMode', settings.darkMode ? 'enabled' : 'disabled');

  // Update chart colors if you have the chart function
  if (typeof updateChartColors === "function") updateChartColors(settings.darkMode);
});
}

// ===== Save Settings =====
  DOM.saveSettingsBtn?.addEventListener("click", () => {
    try {
      if(DOM.confettiToggle) settings.confetti = DOM.confettiToggle.checked;
      if(DOM.dateFormatSelect) settings.dateFormat = DOM.dateFormatSelect.value;
      if(DOM.transactionReminderToggle) settings.transactionReminder = DOM.transactionReminderToggle.checked;
      if(DOM.budgetAlertToggle) settings.budgetAlert = DOM.budgetAlertToggle.checked;
      if(DOM.incomeAlertToggle) settings.incomeAlert = DOM.incomeAlertToggle.checked;
      if(DOM.monthlyBudgetInputSettings) settings.budget = DOM.monthlyBudgetInputSettings.value;
      if(DOM.savingsGoalInput) settings.savingsGoal = DOM.savingsGoalInput.value;
      if(DOM.appPinToggle) settings.appPin = DOM.appPinToggle.checked;
      if(DOM.biometricToggle) settings.biometric = DOM.biometricToggle.checked;
      if(DOM.twoFactorToggle) settings.twoFactor = DOM.twoFactorToggle.checked;

      // Optional: Save category budgets safely if function exists
      if(typeof saveCategoryBudgets === "function") saveCategoryBudgets();

      saveUserSettings(settings);
      showNotification("Settings saved ✅", "success");
    } catch(err) {
      console.error("Error saving settings:", err);
      alert("❌ Something went wrong. Check console.");
    }
  });

  // ===== Reset Settings =====
  DOM.resetSettingsBtn?.addEventListener("click", () => {
    try {
      if(!confirm("Are you sure you want to reset all settings?")) return;
      settings = getDefaultSettings();
      saveUserSettings(settings);

      // Reload settings into DOM safely
      if(DOM.confettiToggle) DOM.confettiToggle.checked = settings.confetti;
      if(DOM.dateFormatSelect) DOM.dateFormatSelect.value = settings.dateFormat || "dd/mm/yyyy";
      if(DOM.transactionReminderToggle) DOM.transactionReminderToggle.checked = settings.transactionReminder || false;
      if(DOM.budgetAlertToggle) DOM.budgetAlertToggle.checked = settings.budgetAlert || false;
      if(DOM.incomeAlertToggle) DOM.incomeAlertToggle.checked = settings.incomeAlert || false;
      if(DOM.monthlyBudgetInputSettings) DOM.monthlyBudgetInputSettings.value = settings.budget || 0;
      if(DOM.savingsGoalInput) DOM.savingsGoalInput.value = settings.savingsGoal || 0;
      if(DOM.appPinToggle) DOM.appPinToggle.checked = settings.appPin || false;
      if(DOM.biometricToggle) DOM.biometricToggle.checked = settings.biometric || false;
      if(DOM.twoFactorToggle) DOM.twoFactorToggle.checked = settings.twoFactor || false;

      if(DOM.darkModeToggle) {
        document.body.classList.remove('dark');
        DOM.darkModeToggle.textContent = '🌙 Dark Mode';
      }

      showNotification("Settings reset 🔄", "success");
    } catch(err) {
      console.error("Error resetting settings:", err);
      alert("❌ Something went wrong. Check console.");
    }
  });

  // ===== MONO CONNECT MODULE (Robust & Auto-Fallback) =====
  function initMonoConnect(buttonId, sandboxKey) {
    const btn = document.getElementById(buttonId);
    if (!btn) return console.error(`❌ Mono Connect button (#${buttonId}) not found`);

    btn.disabled = true;
    btn.textContent = "Loading Mono...";

    let monoReady = false;
    let mockAttached = false;

    // Attach real Mono
    const attachMono = () => {
      try {
        const monoInstance = new MonoConnect({
          key: sandboxKey, // Sandbox key
          onLoad: () => console.log("✅ Mono widget loaded"),
          onSuccess: (authCode) => {
            alert("✅ Bank connected! Auth code: " + authCode);
            console.log("Auth code:", authCode);
          },
          onClose: () => console.log("Mono widget closed"),
        });

        btn.disabled = false;
        btn.textContent = "Connect Bank Account";
        btn.onclick = () => monoInstance.open();
        monoReady = true;

        // Remove mock status if present
        const status = document.getElementById("monoStatus");
        if (status) status.remove();
      } catch (err) {
        console.warn("⚠️ Failed to load Mono, using mock mode.", err);
        attachMock();
      }
    };

    // Attach mock fallback
    const attachMock = () => {
      btn.disabled = false;
      btn.textContent = "Connect Bank Account (Mock)";
      btn.onclick = () => {
        alert("💡 Mono not available. Mock bank connected!");
        console.log("💡 Mock Mono connected for testing purposes.");
      };
      mockAttached = true;

      // Show warning status
      let status = document.getElementById("monoStatus");
      if (!status) {
        status = document.createElement("span");
        status.id = "monoStatus";
        status.style.color = "#e53935";
        status.style.display = "block";
        status.style.marginTop = "5px";
        btn.parentNode.appendChild(status);
      }
      status.textContent = "⚠️ Mono server unavailable – mock mode active";
    };

    // Check for Mono SDK availability
    const checkMono = (attempts = 0) => {
      if (window.MonoConnect) attachMono();
      else if (attempts < 50) {
        setTimeout(() => checkMono(attempts + 1), 100); // Retry every 100ms
      } else {
        if (!mockAttached) attachMock();

        // Keep retrying every 5s to switch to real Mono
        const retryInterval = setInterval(() => {
          if (window.MonoConnect && !monoReady) {
            console.log("✅ Mono SDK now reachable! Switching from mock to real Mono.");
            attachMono();
            clearInterval(retryInterval);
          }
        }, 5000);
      }
    };

    checkMono();
  }

  // ===== INIT MONO CONNECT =====
  // Just call it inside your main DOMContentLoaded wrapper
  initMonoConnect("connectMonoBtn", "test_pk_xsfgdyphau34lxtxcsrp");


  // ===== TRANSACTION HELPERS =====
function addTransaction(txn){
  const txns = getTransactions();
  txns.push(txn);
  saveTransactions(txns);
  updateDashboard();
}

function getRecurringTxns(){
  return JSON.parse(localStorage.getItem("recurringTxns")||"[]").filter(r=>r.user===getActiveUser());
}

function saveRecurringTxns(txns){
  localStorage.setItem("recurringTxns",JSON.stringify(txns));
}

function addRecurringTransaction(rt){
  const recurringTxns = JSON.parse(localStorage.getItem("recurringTxns")||"[]");
  recurringTxns.push(rt);
  localStorage.setItem("recurringTxns",JSON.stringify(recurringTxns));
  updateDashboard();
}

function generateRecurringTransactions(){
  const recurringTxns = getRecurringTxns();
  let txns = getTransactions();
  const now = new Date();

  recurringTxns.forEach(rt=>{
    const last = new Date(rt.lastGenerated || rt.date || now);
    let nextDate = new Date(last);

    while(nextDate<=now){
      if(nextDate>last){
        txns.push({
          id:Date.now()+Math.floor(Math.random()*1000),
          user:rt.user,
          description:rt.description,
          type:rt.type,
          category:rt.category,
          quantity:1,
          amount:rt.amount,
          paymentMethod:"recurring",
          recurring:true,
          recurringId:rt.id,
          frequency:rt.frequency,
          endDate:"",
          date:nextDate.toISOString()
        });
      }

      if(rt.frequency==="daily") nextDate.setDate(nextDate.getDate()+1);
      else if(rt.frequency==="weekly") nextDate.setDate(nextDate.getDate()+7);
      else if(rt.frequency==="monthly") nextDate.setMonth(nextDate.getMonth()+1);
    }

    rt.lastGenerated = now.toISOString();
  });

  saveRecurringTxns(recurringTxns);
  saveTransactions(txns);
}

    // ===== CURRENCY SELECT =====
    function populateCurrencySelect(){
      const selects = [DOM.currencySelect,DOM.quickCurrencySelect].filter(Boolean);
      if(!selects.length) return;

      selects.forEach(select=>{
        select.innerHTML="";
        Object.keys(CURRENCY_RATES).forEach(code=>{
          const opt=document.createElement("option");
          opt.value=code;
          opt.textContent=`${CURRENCY_RATES[code].symbol} ${code}`;
          select.appendChild(opt);
        });
        select.value=settings.currencyCode||"NGN";
      });

      selects.forEach(select=>{
        select.addEventListener("change",e=>{
          const code=e.target.value;
          const symbol=CURRENCY_RATES[code]?.symbol||code;
          settings.currencyCode=code;
          settings.currencySymbol=symbol;
          saveUserSettings(settings);
          window.selectedCurrencyCode=code;
          window.selectedCurrencySymbol=symbol;
          selects.forEach(sel=>{if(sel!==e.target) sel.value=code;});
          refreshTransactions();
        });
      });
    }
    populateCurrencySelect();

    function refreshTransactions(){
      updateDashboard();
      if(window.opener?.updateDashboard) window.opener.updateDashboard();
      if(window.opener?.updateTransactionHistory) window.opener.updateTransactionHistory();
    }

  // CONFETTI
  function launchConfettiSafe() {
    if (!settings.confetti || !window.confetti) return;

    const existingCanvas = document.querySelector(".confetti-canvas");
    if (existingCanvas) existingCanvas.remove();

    const confettiCanvas = document.createElement("canvas");
    confettiCanvas.className = "confetti-canvas";
    confettiCanvas.style.position = "fixed";
    confettiCanvas.style.top = "0";
    confettiCanvas.style.left = "0";
    confettiCanvas.style.width = "100%";
    confettiCanvas.style.height = "100%";
    confettiCanvas.style.pointerEvents = "none";
    confettiCanvas.style.zIndex = 9999;
    document.body.appendChild(confettiCanvas);

    const confettiInstance = confetti.create(confettiCanvas, { resize: true, useWorker: true });
    const bursts = [
      { particleCount: 150, spread: 160, gravity: 0.6, origin: { y: 0.2 } },
      { particleCount: 120, spread: 120, gravity: 0.7, origin: { y: 0.3 } },
      { particleCount: 100, spread: 100, gravity: 0.8, origin: { y: 0.25 } }
    ];

    bursts.forEach((b, i) => setTimeout(() => confettiInstance(b), i * 150));
    setTimeout(() => confettiCanvas.remove(), 5000);
  }

  // GREETING
  function greetUser() {
    const activeUser = getActiveUser();
    if(activeUser && DOM.welcomeUser){
      DOM.welcomeUser.textContent = activeUser.charAt(0).toUpperCase() + activeUser.slice(1);
    }
  }

  // CATEGORY HELPERS
  function populateQuickCategories(){
    if(!DOM.quickCategory) return;
    DOM.quickCategory.innerHTML = "";
    Object.keys(settings.categoryBudgets).forEach(cat=>{
      const opt = document.createElement("option");
      opt.value = cat; opt.textContent = cat;
      DOM.quickCategory.appendChild(opt);
    });
    if(DOM.quickType){
      DOM.quickType.innerHTML="";
      ["income","expense"].forEach(type=>{
        const opt=document.createElement("option");
        opt.value=type; opt.textContent=type.charAt(0).toUpperCase()+type.slice(1);
        DOM.quickType.appendChild(opt);
      });
    }
    DOM.quickCategory.value = localStorage.getItem("lastQuickCategory")||"General";
    DOM.quickType.value = localStorage.getItem("lastQuickType")||"expense";
  }

  function populateTransactionCategories(){
    if(!DOM.transactionCategory) return;
    DOM.transactionCategory.innerHTML = "";
    Object.keys(settings.categoryBudgets).forEach(cat=>{
      const opt = document.createElement("option");
      opt.value = cat; opt.textContent = cat;
      DOM.transactionCategory.appendChild(opt);
    });
    if(DOM.transactionType){
      DOM.transactionType.innerHTML="";
      ["income","expense"].forEach(type=>{
        const opt=document.createElement("option");
        opt.value=type; opt.textContent=type.charAt(0).toUpperCase()+type.slice(1);
        DOM.transactionType.appendChild(opt);
      });
    }
    DOM.transactionCategory.value = localStorage.getItem("lastTransactionCategory")||"General";
    DOM.transactionType.value = localStorage.getItem("lastTransactionType")||"expense";
  }

  function populateCategoryFilter(){
    if(!DOM.categoryFilter) return;
    DOM.categoryFilter.innerHTML="";
    const allOpt=document.createElement("option");
    allOpt.value="All Categories"; allOpt.textContent="All Categories";
    DOM.categoryFilter.appendChild(allOpt);
    Object.keys(settings.categoryBudgets).forEach(cat=>{
      const opt=document.createElement("option"); opt.value=cat; opt.textContent=cat;
      DOM.categoryFilter.appendChild(opt);
    });
    const lastFilter = localStorage.getItem("lastTransactionCategory")||"All Categories";
    DOM.categoryFilter.value=lastFilter;
    activeCategoryFilter=lastFilter;
  }

  // TRANSACTIONS
DOM.addTransactionBtn?.addEventListener("click", () => {
    DOM.saveTransactionBtn.dataset.editId = "";
    DOM.transactionModal.style.display = "block";
});

DOM.closeTransactionModal?.addEventListener("click", () => {
    DOM.transactionModal.style.display = "none";
    DOM.saveTransactionBtn.dataset.editId = "";
});

// Save or Edit Transaction (with currency conversion)
DOM.saveTransactionBtn?.addEventListener("click", () => {
  const txns = getTransactions();
  const editId = DOM.saveTransactionBtn.dataset.editId;

  const desc = DOM.transactionDescription.value.trim();
  const rawAmount = Number(DOM.transactionAmount.value.replace(/[^0-9.-]+/g,""));

  if (!desc || !rawAmount) {
     showNotification("Description and amount required", "error");
    return;
  }

  // Convert to base NGN for storage
  const baseAmount = rawAmount / (CURRENCY_RATES[window.selectedCurrencyCode]?.rate || 1)

  const txn = {
    id: editId ? Number(editId) : Date.now(),
    user: getActiveUser(),
    type: DOM.transactionType.value,
    category: DOM.transactionCategory.value,
    description: desc,
    quantity: Number(DOM.transactionQuantity.value) || 1,
    amount: baseAmount, // always store in NGN
    paymentMethod: DOM.transactionPaymentMethod.value,
    recurring: DOM.transactionRecurring.checked,
    frequency: DOM.transactionFrequency.value,
    endDate: DOM.transactionEndDate.value || "",
    date: editId ? txns.find(t => t.id === Number(editId))?.date : new Date().toISOString(),
    recurringId: editId ? txns.find(t => t.id === Number(editId))?.recurringId : null
  };

  const updatedTxns = editId ? txns.map(t => t.id === txn.id ? txn : t) : [...txns, txn];
  saveTransactions(updatedTxns);

  DOM.transactionModal.style.display = "none";
  DOM.saveTransactionBtn.dataset.editId = "";

  updateDashboard();
   showNotification("Transaction saved", "success");
});

// ===== QUICK ADD TRANSACTION =====
  DOM.quickAddBtn?.addEventListener("click", () => {
    const desc = DOM.quickDesc.value.trim();
    const rawAmount = Number(DOM.quickAmount.value.replace(/[^0-9.-]+/g,""));
    if(!desc || !rawAmount) { showNotification("Enter description and amount", "error"); return; }

    const baseAmount = rawAmount / (CURRENCY_RATES[window.selectedCurrencyCode]?.rate || 1)

    addTransaction({
      id: Date.now(),
      user: getActiveUser(),
      type: DOM.quickType.value,
      category: DOM.quickCategory.value,
      description: desc,
      quantity: 1,
      amount: baseAmount,
      paymentMethod: "cash",
      recurring: false,
      frequency: "none",
      endDate: "",
      date: new Date().toISOString(),
      recurringId: null
    });

    DOM.quickDesc.value = "";
    DOM.quickAmount.value = "";
     showNotification("Transaction added", "success");
  });

  // ===== ADD RECURRING =====
  DOM.addRecurringBtn?.addEventListener("click", () => {
    const desc = DOM.recurringDesc.value.trim();
    const rawAmount = Number(DOM.recurringAmount.value.replace(/[^0-9.-]+/g,""));
    if(!desc || !rawAmount) { showNotification("Enter description and amount", "error"); return; }

    const baseAmount = rawAmount / (CURRENCY_RATES[window.selectedCurrencyCode]?.rate || 1);

    addRecurringTransaction({
      id: Date.now(),
      user: getActiveUser(),
      description: desc,
      amount: baseAmount,
      type: DOM.recurringType.value,
      category: DOM.recurringCategory.value,
      frequency: DOM.recurringFrequency.value,
      lastGenerated: new Date().toISOString()
    });

    DOM.recurringDesc.value = "";
    DOM.recurringAmount.value = "";
   showNotification("Recurring transaction added", "success");
  });

// =================== DASHBOARD ANIMATIONS ===================

// run animations only once
let dashboardAnimated = false;

function animateDashboardElements() {
  // --- Progress Bars ---
  document.querySelectorAll(".progress-bar").forEach(bar => {
    const percent = parseFloat(bar.getAttribute("data-percent")) || 0;

    bar.innerHTML = "";
    bar.style.position = "relative";

    const inner = document.createElement("div");
    inner.style.height = "100%";
    inner.style.width = "0%";
    inner.style.borderRadius = "6px";
    inner.style.transition = "width 1.5s ease-out";
    inner.style.backgroundColor =
      bar.classList.contains("red") ? "#e53935" :
      bar.classList.contains("yellow") ? "#fbc02d" : "#4caf50";

    bar.appendChild(inner);

    const label = document.createElement("span");
    label.textContent = "0%";
    label.style.position = "absolute";
    label.style.right = "10px";
    label.style.top = "50%";
    label.style.transform = "translateY(-50%)";
    label.style.fontWeight = "bold";
    label.style.color = "#fff";
    label.style.opacity = "0";
    bar.appendChild(label);

    let current = 0;
    const steps = 60;
    const intervalTime = 1500 / steps;

    const interval = setInterval(() => {
      current += percent / steps;
      if (current >= percent) {
        current = percent;
        clearInterval(interval);
        label.style.opacity = "1";
      }
      inner.style.width = current + "%";
      label.textContent = Math.round(current) + "%";
    }, intervalTime);
  });

  // --- Progress Circles ---
  document.querySelectorAll(".progress-circle").forEach(circle => {
    const percent = parseFloat(circle.getAttribute("data-progress")) || 0;
    let current = 0;
    const steps = 60;
    const intervalTime = 1500 / steps;

    circle.textContent = "0%";
    circle.style.background = "conic-gradient(#dce0e6 0deg 360deg)";

    const interval = setInterval(() => {
      current += percent / steps;
      if (current >= percent) {
        current = percent;
        clearInterval(interval);
      }
      const angle = (current / 100) * 360;
      circle.style.background =
        `conic-gradient(#4caf50 0deg ${angle}deg, #dce0e6 ${angle}deg 360deg)`;
      circle.textContent = Math.round(current) + "%";
    }, intervalTime);
  });
}

// ===== Run dashboard animations only once =====
function animateDashboardOnce() {
  if (!dashboardAnimated) {
    dashboardAnimated = true;
    animateDashboardElements();
  }
}

function updateDashboard() {
  const dashboardSection = document.getElementById("dashboardWelcome");
  if (!dashboardSection) return;

  const currentSettings = getUserSettings() || {};
  const currencyCode = window.selectedCurrencyCode || "NGN";
  const currencyData = CURRENCY_RATES[currencyCode] || { rate: 1, symbol: "₦" };
  const conversionRate = currencyData.rate || 1;
  const currencySymbolFinal = currencyData.symbol || "₦";

  const budgetAmount = Number(currentSettings.budget || 0) * conversionRate;

  generateRecurringTransactions();

  const allTxns = (getTransactions() || []).filter(t => t.user === getActiveUser());

  // Safely calculate totals
  const totalIncome = allTxns
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0) * conversionRate, 0);

  const totalExpenses = allTxns
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + (Number(t.amount) || 0) * conversionRate, 0);

  const balance = totalIncome - totalExpenses;

  // Budget remaining
  let remainingBudget = 0,
      overspent = 0,
      displayRemaining = "";

  if (budgetAmount > 0) {
    remainingBudget = budgetAmount - totalExpenses;
    if (remainingBudget < 0) {
      overspent = Math.abs(remainingBudget);
      remainingBudget = 0;
    }
    displayRemaining = overspent > 0
      ? `${currencySymbolFinal}0 remaining (Overspent ${currencySymbolFinal}${overspent.toLocaleString()})`
      : `${currencySymbolFinal}${remainingBudget.toLocaleString()} remaining`;
  } else {
    remainingBudget = balance;
    displayRemaining = `${currencySymbolFinal}${remainingBudget.toLocaleString()} remaining`;
  }

  // Update DOM
  if (DOM.welcomeTotalIncome) DOM.welcomeTotalIncome.textContent = `${currencySymbolFinal}${totalIncome.toLocaleString()}`;
  if (DOM.welcomeTotalExpenses) DOM.welcomeTotalExpenses.textContent = `${currencySymbolFinal}${totalExpenses.toLocaleString()}`;
  if (DOM.welcomeCurrentBalance) DOM.welcomeCurrentBalance.textContent = `${currencySymbolFinal}${balance.toLocaleString()}`;
  if (DOM.welcomeBudgetRemaining) DOM.welcomeBudgetRemaining.textContent = displayRemaining;

  // ===== Charts =====
  if (window.Chart && DOM.charts) {
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpenses = Array(12).fill(0);
    const categoryTotals = {};

    allTxns.forEach(txn => {
      const month = new Date(txn.date).getMonth();
      const amountConv = Number(txn.amount) * conversionRate;

      if (txn.type === "income") monthlyIncome[month] += amountConv;
      if (txn.type === "expense") monthlyExpenses[month] += amountConv;

      if (txn.type === "expense") {
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + amountConv;
      }
    });

    if (DOM.charts.income) createLineChart(DOM.charts.income, monthlyIncome, "Income", "#28a745");
    if (DOM.charts.expenses) createLineChart(DOM.charts.expenses, monthlyExpenses, "Expenses", "#dc3545");

    if (DOM.charts.category) {
      const ctx = DOM.charts.category.getContext("2d");
      chartInstances.category?.destroy();
      chartInstances.category = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(categoryTotals),
          datasets: [{ label: "Expenses by Category", data: Object.values(categoryTotals), backgroundColor: "#1982c4" }]
        },
        options: { responsive: true }
      });
    }

    if (DOM.charts.budget) {
      const ctx = DOM.charts.budget.getContext("2d");
      chartInstances.budget?.destroy();

      const budgetData = overspent > 0
        ? {
            labels: ["Spent", "Overspent"],
            datasets: [{ data: [totalExpenses, overspent], backgroundColor: ["#28a745", "#dc3545"], hoverOffset: 4 }]
          }
        : {
            labels: ["Spent", "Remaining"],
            datasets: [{ data: [totalExpenses, remainingBudget], backgroundColor: ["#28a745", "#ffc107"], hoverOffset: 4 }]
          };

      chartInstances.budget = new Chart(ctx, {
        type: "doughnut",
        data: budgetData,
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label: context => `${context.label}: ${currencySymbolFinal}${context.raw.toLocaleString()}`
              }
            }
          }
        }
      });

      // ----- Progress Bar -----
    if (DOM.budgetProgressBar && DOM.budgetProgressBar.parentElement) {
      const percentSpent = budgetAmount > 0
        ? Math.min((totalExpenses / budgetAmount) * 100, 100)
        : (totalExpenses / (totalIncome || 1)) * 100;

      DOM.budgetProgressBar.style.width = `${percentSpent}%`;
      DOM.budgetProgressBar.style.background = overspent > 0
        ? `linear-gradient(to right,#28a745 0%,#28a745 80%,#dc3545 80%,#dc3545 100%)`
        : `linear-gradient(to right,#28a745 0%,#28a745 ${percentSpent}%,#ffc107 ${percentSpent}%,#ffc107 100%)`;

      if (DOM.overspendArrow) {
        const barWidth = DOM.budgetProgressBar.parentElement.offsetWidth;
        DOM.overspendArrow.style.left = `${percentSpent * barWidth / 100}px`;
        DOM.overspendArrow.textContent = overspent > 0
        ? `${window.selectedCurrencySymbol}${overspent.toLocaleString()}`
        : "";

      }
    }

    }
  }

  // ===== Recurring Transactions =====
const recurringTxns = getRecurringTxns() || [];
if (DOM.recurringList) {
  DOM.recurringList.innerHTML = recurringTxns.length
    ? recurringTxns.map(rt => `
        <li data-id="${rt.id}" class="recurring-item">
          <span>${rt.description} - ${currencySymbolFinal}${(rt.amount * conversionRate).toLocaleString()} (${rt.frequency})</span>
          <button class="deleteRecurringBtn">Delete</button>
        </li>
      `).join("")
    : "<li>No recurring transactions</li>";
}

  // Animate dashboard once
  animateDashboardOnce();
}


//  Render Charts
function renderCharts(txns, remainingBudget, overspent, totalExpenses, budgetAmount) {
    if (!window.Chart) return;

    // ----- Monthly Income/Expense Charts -----
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpenses = Array(12).fill(0);
    const categoryTotals = {};

    txns.forEach(txn => {
        const month = new Date(txn.date).getMonth();
        if (txn.type === "income") monthlyIncome[month] += Number(txn.amount);
        if (txn.type === "expense") monthlyExpenses[month] += Number(txn.amount);
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + Number(txn.amount);
    });

    if (DOM.charts.income) createLineChart(DOM.charts.income, monthlyIncome, "Income", "#28a745");
    if (DOM.charts.expenses) createLineChart(DOM.charts.expenses, monthlyExpenses, "Expenses", "#dc3545");

    if (DOM.charts.category) {
        const ctx = DOM.charts.category.getContext("2d");
        chartInstances.category?.destroy();
        chartInstances.category = new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(categoryTotals),
                datasets: [{ label: "Expenses by Category", data: Object.values(categoryTotals), backgroundColor: "#1982c4" }]
            }
        });
    }

    // ----- Budget Doughnut Chart -----
    if (DOM.charts.budget) {
        const ctx = DOM.charts.budget.getContext("2d");
        chartInstances.budget?.destroy();

        const budgetData = overspent > 0
            ? { labels: ["Spent","Overspent"], datasets:[{ data: [totalExpenses, overspent], backgroundColor: ["#28a745","#dc3545"], hoverOffset: 4 }] }
            : { labels: ["Spent","Remaining"], datasets:[{ data: [totalExpenses, remainingBudget], backgroundColor: ["#28a745","#ffc107"], hoverOffset: 4 }] };

        chartInstances.budget = new Chart(ctx, {
            type: "doughnut",
            data: budgetData,
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" },
                  tooltip: { callbacks: { label: ctx => ctx.label + ": " + window.selectedCurrencySymbol + ctx.raw.toLocaleString() } }
                }
            }
        });

        // ----- Progress Bar -----
        if (DOM.budgetProgressBar) {
            const percentSpent = budgetAmount > 0 ? Math.min((totalExpenses / budgetAmount) * 100, 100) : (totalExpenses / (monthlyIncome.reduce((a,b)=>a+b,1))) * 100;
            DOM.budgetProgressBar.style.width = `${percentSpent}%`;
            DOM.budgetProgressBar.style.background = overspent > 0
                ? `linear-gradient(to right, #28a745 0%, #28a745 80%, #dc3545 80%, #dc3545 100%)`
                : `linear-gradient(to right, #28a745 0%, #28a745 ${percentSpent}%, #ffc107 ${percentSpent}%, #ffc107 100%)`;

            if (DOM.overspendArrow) {
                const barWidth = DOM.budgetProgressBar.parentElement.offsetWidth;
                DOM.overspendArrow.style.left = `${percentSpent * barWidth / 100}px`;
                DOM.overspendArrow.textContent = overspent > 0 ? `${settings.currency}${overspent.toLocaleString()}` : "";
            }
        }
    }
}


// =================== LINE CHART HELPER ===================
function createLineChart(canvas, dataArray, label, color) {
  const ctx = canvas.getContext("2d");
  chartInstances[label.toLowerCase()]?.destroy();
  chartInstances[label.toLowerCase()] = new Chart(ctx, {
    type:"line",
    data:{
      labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      datasets:[{ label, data:dataArray, borderColor:color, backgroundColor:color+"33", fill:true, tension:0.3 }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{ display:true },
        tooltip: { callbacks: { label: ctx => ctx.label + ": " + window.selectedCurrencySymbol + ctx.raw.toLocaleString() } }
      },
      scales:{ y:{ beginAtZero:true } }
    }
  });
}


  // CATEGORY FILTER //
  DOM.categoryFilter?.addEventListener("change",e=>{
    activeCategoryFilter=e.target.value;
    localStorage.setItem("lastTransactionCategory",activeCategoryFilter);
    updateDashboard();
  });

  //  CONFETTI //
  DOM.confettiToggle?.addEventListener("change", e=>{
    settings.confetti=e.target.checked;
    saveUserSettings(settings);
  });

  // SIDEBAR NAVIGATION //
const sections = {
  dashboardBtn: "dashboardWelcome",
  recurringBtn: "recurringTransactions",
  chartsBtn: "chartsSection",
  profileBtn: "userProfile",
  settingsBtn: "settingsPanel",
  exportImportBtn: "exportImportSection"
};

// Middle dashboard container
const middleDashboard = document.getElementById("dashboardMiddle");

// Down dashboard (persistent widget)
const downDashboard = document.getElementById("downDashboard");

function hideAllSections() {
  Object.values(sections).forEach(secId => {
    const el = document.getElementById(secId);
    if (el) el.style.display = "none";
  });

  if (middleDashboard) middleDashboard.style.display = "none";

  // ❌ Hide down dashboard by default
  if (downDashboard) downDashboard.style.display = "none";
}

// Function to set active button
function setActiveButton(activeBtnId) {
  Object.keys(sections).forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove("active");
  });

  const btn = document.getElementById(activeBtnId);
  if (btn) btn.classList.add("active");
}

// SIDEBAR NAV BUTTONS//

Object.keys(sections).forEach(btnId => {
  const btn = document.getElementById(btnId);
  const sectionId = sections[btnId];
  if (!btn) return;

  btn.addEventListener("click", () => {
    hideAllSections();

    const section = document.getElementById(sectionId);
    if (section) section.style.display = "block";

    // Show dashboard for dashboardBtn
    if (btnId === "dashboardBtn") {
    if (middleDashboard) middleDashboard.style.display = "grid";
    if (downDashboard) downDashboard.style.display = "block"; // 👈 show down dashboard
    animateDashboardElements();
  }

    setActiveButton(btnId);

    if (btnId === "dashboardBtn") updateDashboard();
  });
});


// Transaction Button //

const transactionsBtn = document.getElementById("transactionsBtn");
const sidebarTransactions = document.getElementById("transactionsSection");

if (transactionsBtn && sidebarTransactions) {
  // Show Transactions and dashboard on page load
  sidebarTransactions.style.display = "block";
  const dashboardSection = document.getElementById("dashboardWelcome");
  if (dashboardSection) dashboardSection.style.display = "block";
  if (middleDashboard) middleDashboard.style.display = "grid";

  updateDashboard();
  animateDashboardElements(); // run mini charts + progress bars
  sidebarTransactions.scrollIntoView({ behavior: "smooth" });

  transactionsBtn.addEventListener("click", () => {
    hideAllSections();

    // Show Transactions sidebar
    sidebarTransactions.style.display = "block";

    // Show dashboard cards-icons in main content
    if (dashboardSection) dashboardSection.style.display = "block";
    if (middleDashboard) middleDashboard.style.display = "grid";
    if (downDashboard) downDashboard.style.display = "block"; // 👈 show down dashboard

    updateDashboard();
    animateDashboardElements();
    sidebarTransactions.scrollIntoView({ behavior: "smooth" });

    setActiveButton(transactionsBtn.id);
  });
}

// =================== INIT DASHBOARD ===================
function initDashboard() {
  if (DOM.transactionFeedPanel) DOM.transactionFeedPanel.classList.remove("show");

  populateQuickCategories();
  populateTransactionCategories();
  populateCategoryFilter();

  hideAllSections();

if (transactionsBtn) setActiveButton(transactionsBtn.id);
if (sidebarTransactions) sidebarTransactions.style.display = "block";

const dashboardSection = document.getElementById("dashboardWelcome");
if (dashboardSection) dashboardSection.style.display = "block";
if (middleDashboard) middleDashboard.style.display = "grid";
if (downDashboard) downDashboard.style.display = "block"; // 👈 show on load

  updateDashboard();
  animateDashboardElements();
}

// ===== ROUTE Protection =====
function protectRoute(route) {
const activeUser = getActiveUser();

if (route === "dashboard" && !activeUser) {
  showLogin();
  return false;
}

if (route === "auth" && activeUser) {
  showDashboard();
  return false;
}

return true;
}

// ===== AUTH UI Controls =====
DOM.showRegister?.addEventListener("click", () => {
if (!protectRoute("auth")) return;
DOM.loginForm.style.display = "none";
DOM.registerForm.style.display = "block";
});

DOM.showLogin?.addEventListener("click", () => {
if (!protectRoute("auth")) return;
DOM.registerForm.style.display = "none";
DOM.loginForm.style.display = "block";
});

// ===== REGISTER =====
DOM.registerBtn?.addEventListener("click", () => {
if (!protectRoute("auth")) return;

const users = getUsers();
const username = DOM.regUser.value.trim().toLowerCase(); // lowercase
const email = DOM.regEmail.value.trim();
const pass = DOM.regPass.value.trim();
const passConfirm = DOM.regPassConfirm.value.trim();

if (!username || !email || !pass) {
  notify("All fields required", "error");
  return;
}

if (pass !== passConfirm) {
  notify("Passwords do not match", "error");
  return;
}

if (users.some(u => u.username === username)) {
  notify("Username already exists", "error");
  return;
}

users.push({
  username, // store lowercase
  email,
  password: pass,
  settings: getDefaultSettings()
});

saveUsers(users);
notify("Registration successful", "success");

DOM.registerForm.style.display = "none";
DOM.loginForm.style.display = "block";
});

// ===== LOGIN =====
DOM.loginBtn?.addEventListener("click", () => {
if (!protectRoute("auth")) return;

const users = getUsers();
const usernameInput = DOM.loginUser.value.trim().toLowerCase(); // lowercase input
const pass = DOM.loginPass.value.trim();

const user = users.find(
  u => u.username.toLowerCase() === usernameInput && u.password === pass
);

if (!user) {
  notify("Invalid credentials", "error");
  return;
}

setActiveUser(user.username); // preserve original case if needed
loadDashboardAfterAuth();
});

// ===== LOGOUT =====
DOM.logoutSidebarBtn?.addEventListener("click", () => {
clearActiveUser();
showLogin();
});


  // View Helpers //

  function showDashboard() {
    DOM.auth.style.display = "none";
    DOM.dashboard.style.display = "block";
  }

  function showLogin() {
    DOM.dashboard.style.display = "none";
    DOM.auth.style.display = "block";
    DOM.loginForm.style.display = "block";
    DOM.registerForm.style.display = "none";
  }

  function loadDashboardAfterAuth() {
    showDashboard();
    greetUser();
    initDashboard();
    setTimeout(() => launchConfettiSafe(), 0);
  }

  // Budget Input //
  DOM.monthlyBudgetInput?.addEventListener("change", e => {
    const value = Number(e.target.value);
    settings.budget = isNaN(value) ? 0 : value;
    saveUserSettings(settings);
    updateDashboard();
  });


  // =================== INIT APP ===================
function initApp() {
  const activeUser = getActiveUser();
  if (!activeUser) {
    showLogin();
    return;
  }
  loadDashboardAfterAuth();
}

// Prevent UI flash
if (settings.darkMode) {
  document.body.classList.add("dark");
}

initApp();
document.body.style.visibility = "visible";
});
