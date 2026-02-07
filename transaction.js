document.addEventListener("DOMContentLoaded", () => {
  const DOM = {
    transactionFeedPage: document.getElementById("pageTransactionHistoryFeedContainer"),
    backBtn: document.getElementById("backToDashboardBtn"),
    prevPageBtn: document.getElementById("pagePrevPageBtn"),
    nextPageBtn: document.getElementById("pageNextPageBtn"),
    currentPageSpan: document.getElementById("pageCurrentPage"),
    typeFilter: document.getElementById("pageTypeFilter"),
    searchInput: document.getElementById("pageSearchInput"),

    toggleDashboardTxnsBtn: document.getElementById("toggleDashboardTxnsBtn"),
    dashboardTxnsPanel: document.getElementById("dashboardTransactionFeedPanel"),
    closeDashboardTxnsBtn: document.getElementById("closeDashboardTransactionFeedBtn"),
    dashboardFeedContainer: document.getElementById("dashboardTransactionHistoryFeedContainer")?.querySelector("tbody"),
    dashboardPrevPageBtn: document.getElementById("dashboardPrevPageBtn"),
    dashboardNextPageBtn: document.getElementById("dashboardNextPageBtn"),
    dashboardCurrentPageSpan: document.getElementById("dashboardCurrentPage"),
    dashboardTypeFilter: document.getElementById("dashboardTypeFilter"),
    dashboardSearchInput: document.getElementById("dashboardSearchInput"),
    dashboardTotalBalance: document.getElementById("dashboardTotalBalance"),

    dashboardNotification: document.getElementById("dashboardTxnNotification"),
    notificationBtn: document.getElementById("notificationBtn") || null,
    notificationCount: document.getElementById("notificationCount") || null,

    editModal: document.getElementById("editModal"),
    editDescription: document.getElementById("editDescription"),
    editAmount: document.getElementById("editAmount"),
    editType: document.getElementById("editType"),
    saveEditBtn: document.getElementById("saveEditBtn"),
    cancelEditBtn: document.getElementById("cancelEditBtn"),

    addForm: document.getElementById("addTransactionForm"),
    addDescription: document.getElementById("addDescription"),
    addAmount: document.getElementById("addAmount"),
    addType: document.getElementById("addType"),
    addCategory: document.getElementById("addCategory"),
  };

  const PAGE_SIZE = 5;
  let sharedPage = 1;
  let editTxnId = null;
  let highlightedRow = null;

  // ===== Initialize localStorage =====
  if (!localStorage.getItem("transactions")) localStorage.setItem("transactions", JSON.stringify([]));
  if (!localStorage.getItem("activeUser")) localStorage.setItem("activeUser", "sherifat");
  if (!localStorage.getItem("settings")) localStorage.setItem("settings", JSON.stringify({ currencyCode: "NGN" }));

  const getActiveUser = () => localStorage.getItem("activeUser");

  const parseCurrency = value => {
    if (typeof value === "number") return value;
    if (!value) return 0;
    const num = Number(value.toString().replace(/[^0-9.-]/g,""));
    return isNaN(num) ? 0 : num;
  };

  const getTransactions = () => {
    const txns = JSON.parse(localStorage.getItem("transactions")) || [];
    txns.forEach(t => {
      if (!t.user) t.user = getActiveUser();
      t.amount = parseCurrency(t.amount);
    });
    return txns;
  };

  const saveTransactions = txns => localStorage.setItem("transactions", JSON.stringify(txns));

  // ===== Currency Conversion =====
  const CURRENCY_RATES = {
    NGN: 1, USD: 0.0027, EUR: 0.0025, GBP: 0.0022, QAR: 0.0099, AED: 0.0099, SAR: 0.01,
    JPY: 0.37, CAD: 0.0035, AUD: 0.0042, CHF: 0.0023, CNY: 0.018, INR: 0.23, BRL: 0.014,
    ZAR: 0.051, EGP: 0.089, KES: 0.38
  };

  const currencyMap = { NGN:"₦", USD:"$", EUR:"€", GBP:"£", QAR:"ر.ق", AED:"د.إ", SAR:"﷼", JPY:"¥", CAD:"$", AUD:"$", CHF:"CHF", CNY:"¥", INR:"₹", BRL:"R$", ZAR:"R", EGP:"£", KES:"KSh" };

  const getCurrencyCode = () => JSON.parse(localStorage.getItem("settings"))?.currencyCode || "NGN";
  const getCurrencySymbol = () => currencyMap[getCurrencyCode()] || getCurrencyCode();

  const convertAmount = value => Number(value || 0) * (CURRENCY_RATES[getCurrencyCode()] || 1);
  const formatCurrency = value => getCurrencySymbol() + convertAmount(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const updateAmountPlaceholders = () => {
    if (DOM.editAmount) DOM.editAmount.placeholder = getCurrencySymbol() + "0";
    if (DOM.addAmount) DOM.addAmount.placeholder = getCurrencySymbol() + "0";
  };

  // ===== Filter & Pagination =====
  const filterTransactions = (txns, search="", type="all") => {
    search = search.toLowerCase();
    return txns.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(search) || (t.category?.toLowerCase().includes(search));
      const matchesType = type==="all" || t.type===type;
      return matchesSearch && matchesType;
    });
  };

  const paginateTransactions = (txns, page) => {
    const totalPages = Math.ceil(txns.length / PAGE_SIZE) || 1;
    page = Math.max(1, Math.min(page, totalPages));
    return { paginated: txns.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), totalPages };
  };

  // ===== Notification System =====
  let notificationCount = 0;

  function showNotification(message, type = "info", duration = 3000) {
    const notifEl = DOM.dashboardNotification;
    if (!notifEl) return;

    // --- Toast ---
    notifEl.textContent = message;
    notifEl.className = `notification show ${type}`;
    void notifEl.offsetWidth; // force reflow to restart animation

    clearTimeout(window.notificationTimeout);
    window.notificationTimeout = setTimeout(() => {
      notifEl.classList.remove("show");
    }, duration);

    notifEl.onclick = () => notifEl.classList.remove("show");

    // --- Bell Badge ---
    const notifCountEl = DOM.notificationCount;
    if (notifCountEl) {
      notificationCount += 1;
      notifCountEl.textContent = notificationCount;
      notifCountEl.classList.remove("hidden");
    }
  }

  // Clicking bell resets badge
  if (DOM.notificationBtn && DOM.notificationCount) {
    DOM.notificationBtn.addEventListener("click", () => {
      notificationCount = 0;
      DOM.notificationCount.textContent = "0";
      DOM.notificationCount.classList.add("hidden");

      // optional panel logic here
      // alert("🔔 Notifications clicked!");
    });
  }

  // ===== Edit / Delete =====
  const openEdit = (id, row) => {
    if(highlightedRow) highlightedRow.classList.remove("editing");
    editTxnId = id;
    const txn = getTransactions().find(t => t.id === id);
    if (!txn) return;
    DOM.editDescription.value = txn.description;
    DOM.editAmount.value = txn.amount;
    DOM.editType.value = txn.type;
    DOM.editModal.classList.add("show");
    highlightedRow = row;
    highlightedRow.classList.add("editing");
  };

  const deleteTxn = id => {
    const txns = getTransactions().filter(t => t.id !== id);
    saveTransactions(txns);
    sharedPage = Math.min(sharedPage, Math.ceil(filterTransactions(txns).length / PAGE_SIZE) || 1);
    updateTransactionHistory();
    showNotification("Transaction deleted", "error");
  };

  // ===== Dashboard Balance =====
  const updateDashboardBalance = () => {
    const txns = getTransactions().filter(t => t.user === getActiveUser());
    const totalIncome = txns.filter(t => t.type==="income").reduce((sum,t)=>sum + parseCurrency(t.amount),0);
    const totalExpense = txns.filter(t => t.type==="expense").reduce((sum,t)=>sum + parseCurrency(t.amount),0);
    const balance = totalIncome - totalExpense;
    if(DOM.dashboardTotalBalance){
      DOM.dashboardTotalBalance.textContent = formatCurrency(balance);
      DOM.dashboardTotalBalance.classList.toggle("positive", balance>=0);
      DOM.dashboardTotalBalance.classList.toggle("negative", balance<0);
    }
  };

  // ===== Render Transactions =====
  const renderTransactions = ({container, searchInput=null, typeFilter=null, currentPageSpan=null, prevBtn=null, nextBtn=null, isTable=false}) => {
    if(!container) return;
    const activeUser = getActiveUser();
    let txns = getTransactions().filter(t => t.user === activeUser);
    const search = searchInput?.value || "";
    const type = typeFilter?.value || "all";
    txns = filterTransactions(txns, search, type);
    txns.sort((a,b) => new Date(b.date) - new Date(a.date));

    const { paginated, totalPages } = paginateTransactions(txns, sharedPage);

    container.innerHTML = paginated.length ? "" : `<${isTable ? "tr" : "p"} style='text-align:center; padding:20px;'>No transactions found.</${isTable ? "tr" : "p"}>`;

    paginated.forEach(t => {
      if(isTable){
        const tr = document.createElement("tr");
        tr.dataset.id = t.id;
        tr.innerHTML = `
          <td>${new Date(t.date).toLocaleDateString()}</td>
          <td>${t.description}</td>
          <td>${t.category||"General"}</td>
          <td>${formatCurrency(t.amount)}</td>
          <td>${t.type}</td>
          <td>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
          </td>
        `;
        container.appendChild(tr);
        tr.querySelector(".edit-btn").addEventListener("click", ()=>openEdit(t.id,tr));
        tr.querySelector(".delete-btn").addEventListener("click", ()=>deleteTxn(t.id));
      } else {
        const div = document.createElement("div");
        div.className = "transaction-item";
        div.dataset.id = t.id;
        div.innerHTML = `
          <div class="txn-left">
            <div class="txn-description">${t.description}</div>
            <div class="txn-category-date">${t.category||"General"} • ${new Date(t.date).toLocaleDateString()}</div>
          </div>
          <div class="txn-right">
            <div class="txn-amount ${t.type}">${formatCurrency(t.amount)}</div>
            <div class="txn-type">${t.type}</div>
          </div>
          <div class="transaction-actions">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
          </div>
        `;
        container.appendChild(div);
        div.querySelector(".edit-btn").addEventListener("click", ()=>openEdit(t.id,div));
        div.querySelector(".delete-btn").addEventListener("click", ()=>deleteTxn(t.id));
      }
    });

    if(currentPageSpan){
      currentPageSpan.textContent = sharedPage;
      if(prevBtn) prevBtn.disabled = sharedPage <= 1;
      if(nextBtn) nextBtn.disabled = sharedPage >= totalPages;
    }
  };

  // ===== Update all feeds =====
  const updateTransactionHistory = () => {
    renderTransactions({
      container: DOM.transactionFeedPage,
      searchInput: DOM.searchInput,
      typeFilter: DOM.typeFilter,
      currentPageSpan: DOM.currentPageSpan,
      prevBtn: DOM.prevPageBtn,
      nextBtn: DOM.nextPageBtn,
      isTable: false
    });

    renderTransactions({
      container: DOM.dashboardFeedContainer,
      searchInput: DOM.dashboardSearchInput,
      typeFilter: DOM.dashboardTypeFilter,
      currentPageSpan: DOM.dashboardCurrentPageSpan,
      prevBtn: DOM.dashboardPrevPageBtn,
      nextBtn: DOM.dashboardNextPageBtn,
      isTable: true
    });

    updateDashboardBalance();
  };

  // ===== Add Transaction =====
  DOM.addForm?.addEventListener("submit", e=>{
    e.preventDefault();
    const txns = getTransactions();
    const newTxn = {
      id: Date.now(),
      user: getActiveUser(),
      description: DOM.addDescription.value.trim(),
      amount: parseCurrency(DOM.addAmount.value),
      type: DOM.addType.value,
      category: DOM.addCategory.value.trim(),
      date: new Date().toISOString()
    };
    txns.unshift(newTxn);
    saveTransactions(txns);
    DOM.addDescription.value = "";
    DOM.addAmount.value = "";
    DOM.addCategory.value = "";
    sharedPage = 1;
    updateTransactionHistory();
    showNotification("Transaction added successfully", "success");
  });

  // ===== Edit / Cancel =====
  DOM.saveEditBtn?.addEventListener("click", ()=>{
    if(editTxnId === null) return;
    const txns = getTransactions();
    const idx = txns.findIndex(t=>t.id===editTxnId);
    txns[idx] = {
      ...txns[idx],
      description: DOM.editDescription.value.trim(),
      amount: parseCurrency(DOM.editAmount.value),
      type: DOM.editType.value
    };
    saveTransactions(txns);
    DOM.editModal.classList.remove("show");
    highlightedRow?.classList.remove("editing");
    editTxnId=null; highlightedRow=null;
    updateTransactionHistory();
    showNotification("Transaction updated", "success");
  });

  DOM.cancelEditBtn?.addEventListener("click", ()=>{
    DOM.editModal.classList.remove("show");
    highlightedRow?.classList.remove("editing");
    editTxnId=null; highlightedRow=null;
  });

  // ===== Pagination =====
  const goPrev = () => { if(sharedPage>1) sharedPage--; updateTransactionHistory(); };
  const goNext = () => { sharedPage++; updateTransactionHistory(); };

  DOM.prevPageBtn?.addEventListener("click", goPrev);
  DOM.nextPageBtn?.addEventListener("click", goNext);
  DOM.dashboardPrevPageBtn?.addEventListener("click", goPrev);
  DOM.dashboardNextPageBtn?.addEventListener("click", goNext);

  // ===== Filters =====
  DOM.searchInput?.addEventListener("input", ()=>{ sharedPage=1; updateTransactionHistory(); });
  DOM.typeFilter?.addEventListener("change", ()=>{ sharedPage=1; updateTransactionHistory(); });
  DOM.dashboardSearchInput?.addEventListener("input", ()=>{ sharedPage=1; updateTransactionHistory(); });
  DOM.dashboardTypeFilter?.addEventListener("change", ()=>{ sharedPage=1; updateTransactionHistory(); });

  // ===== Dashboard Toggle =====
  DOM.toggleDashboardTxnsBtn?.addEventListener("click", ()=>{ DOM.dashboardTxnsPanel.classList.toggle("show"); updateTransactionHistory(); });
  DOM.closeDashboardTxnsBtn?.addEventListener("click", ()=>{ DOM.dashboardTxnsPanel.classList.remove("show"); });
  DOM.backBtn?.addEventListener("click", ()=>window.location.href="index.html");

  // ===== Currency change =====
  document.addEventListener("currencyChanged", e=>{
    const settings = JSON.parse(localStorage.getItem("settings"))||{};
    settings.currencyCode = e.detail.newCurrencyCode;
    localStorage.setItem("settings", JSON.stringify(settings));
    updateAmountPlaceholders();
    updateTransactionHistory();
  });

  // ===== Initial render =====
  updateAmountPlaceholders();
  updateTransactionHistory();
});
