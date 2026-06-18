const companiesKey = "business-erp-companies-v1";
const activeCompanyKey = "business-erp-active-company";
const legacyStorageKey = "business-erp-v1";
const seedDataVersionKey = "business-erp-mi-negocio-seed-version";
const seedDataVersion = "2026-06-14-demo-3p-5v-2g";

const seedData = {
  products: [
    {
      sku: "SKU-001",
      name: "Café molido 500g",
      cost: 180,
      price: 290,
      stock: 32,
      minStock: 10,
      idealStock: 50,
      supplier: "Distribuidora Central",
    },
    {
      sku: "SKU-002",
      name: "Yerba premium 1kg",
      cost: 130,
      price: 220,
      stock: 31,
      minStock: 12,
      idealStock: 45,
      supplier: "Proveedor del Sur",
    },
    {
      sku: "SKU-003",
      name: "Botella térmica 1L",
      cost: 450,
      price: 790,
      stock: 17,
      minStock: 5,
      idealStock: 25,
      supplier: "Importadora Norte",
    },
  ],
  sales: [
    {
      id: makeId(),
      date: "2026-06-14",
      receipt: "F-0005",
      customer: "Empresa Delta",
      sku: "SKU-003",
      quantity: 1,
      discount: 0,
      paymentMethod: "Transferencia",
      paymentStatus: "Pagada",
      paidAmount: 790,
      dueDate: "",
      unitPrice: 790,
      total: 790,
      cost: 450,
      margin: 340,
      debt: 0,
    },
    {
      id: makeId(),
      date: "2026-06-13",
      receipt: "F-0004",
      customer: "Almacén La Esquina",
      sku: "SKU-002",
      quantity: 4,
      discount: 0,
      paymentMethod: "Transferencia",
      paymentStatus: "Parcial",
      paidAmount: 500,
      dueDate: "2026-06-20",
      unitPrice: 220,
      total: 880,
      cost: 520,
      margin: 360,
      debt: 380,
    },
    {
      id: makeId(),
      date: "2026-06-12",
      receipt: "F-0003",
      customer: "Mostrador",
      sku: "SKU-001",
      quantity: 2,
      discount: 10,
      paymentMethod: "Mercado Pago",
      paymentStatus: "Pagada",
      paidAmount: 522,
      dueDate: "",
      unitPrice: 261,
      total: 522,
      cost: 360,
      margin: 162,
      debt: 0,
    },
    {
      id: makeId(),
      date: "2026-06-11",
      receipt: "F-0002",
      customer: "Cliente Mayorista",
      sku: "SKU-003",
      quantity: 2,
      discount: 0,
      paymentMethod: "Tarjeta",
      paymentStatus: "Pagada",
      paidAmount: 1580,
      dueDate: "",
      unitPrice: 790,
      total: 1580,
      cost: 900,
      margin: 680,
      debt: 0,
    },
    {
      id: makeId(),
      date: "2026-06-10",
      receipt: "F-0001",
      customer: "Mostrador",
      sku: "SKU-001",
      quantity: 6,
      discount: 0,
      paymentMethod: "Efectivo",
      paymentStatus: "Pagada",
      paidAmount: 1740,
      dueDate: "",
      unitPrice: 290,
      total: 1740,
      cost: 1080,
      margin: 660,
      debt: 0,
    },
  ],
  purchases: [],
  expenses: [
    {
      id: makeId(),
      date: "2026-06-01",
      category: "Alquiler",
      type: "Fijo",
      description: "Alquiler del local",
      amount: 600,
      paymentMethod: "Transferencia",
      recurrence: "monthly",
      recurrenceEnd: "",
    },
    {
      id: makeId(),
      date: "2026-06-11",
      category: "Envíos",
      type: "Variable",
      description: "Cadetería y entregas",
      amount: 85,
      paymentMethod: "Efectivo",
      recurrence: "once",
      recurrenceEnd: "",
    },
  ],
  cashSessions: [],
};

let currentCompany = null;
let storageKey = "";
let state = emptyState();
let selectedReceiptId = "";
let cloud = {
  enabled: false,
  ready: false,
  client: null,
  url: "",
  anonKey: "",
  companyPassword: "",
  saveTimer: null,
  remoteLoaded: false,
};

const currency = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("es-UY");

const viewButtons = document.querySelectorAll(".nav-button");
const views = document.querySelectorAll(".view");
const saleForm = document.querySelector("#saleForm");
const purchaseForm = document.querySelector("#purchaseForm");
const productForm = document.querySelector("#productForm");
const expenseForm = document.querySelector("#expenseForm");
const cashForm = document.querySelector("#cashForm");
const saleSku = document.querySelector("#saleSku");
const purchaseSku = document.querySelector("#purchaseSku");
const saleDate = document.querySelector("#saleDate");
const purchaseDate = document.querySelector("#purchaseDate");
const expenseDate = document.querySelector("#expenseDate");
const cashDate = document.querySelector("#cashDate");
const saleResult = document.querySelector("#saleResult");
const purchaseResult = document.querySelector("#purchaseResult");
const filterFrom = document.querySelector("#filterFrom");
const filterTo = document.querySelector("#filterTo");
const productSearch = document.querySelector("#productSearch");
const movementSearch = document.querySelector("#movementSearch");
const projectionDays = document.querySelector("#projectionDays");
const excelType = document.querySelector("#excelType");
const excelFrom = document.querySelector("#excelFrom");
const excelTo = document.querySelector("#excelTo");
const exportResult = document.querySelector("#exportResult");
const advisorForm = document.querySelector("#advisorForm");
const advisorQuestion = document.querySelector("#advisorQuestion");
const advisorChat = document.querySelector("#advisorChat");
const loginScreen = document.querySelector("#loginScreen");
const companySelect = document.querySelector("#companySelect");
const companyPassword = document.querySelector("#companyPassword");
const newCompanyName = document.querySelector("#newCompanyName");
const newCompanyPassword = document.querySelector("#newCompanyPassword");

saleDate.valueAsDate = new Date();
purchaseDate.valueAsDate = new Date();
expenseDate.valueAsDate = new Date();
cashDate.valueAsDate = new Date();

viewButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

document.querySelector("#loginCompany").addEventListener("click", loginCompany);
document.querySelector("#createCompany").addEventListener("click", createCompany);
document.querySelector("#logoutCompany").addEventListener("click", logoutCompany);
companyPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") loginCompany();
});

document.querySelector("#applyFilters").addEventListener("click", render);
document.querySelector("#clearFilters").addEventListener("click", () => {
  filterFrom.value = "";
  filterTo.value = "";
  render();
});

document.querySelector("#cancelSaleEdit").addEventListener("click", resetSaleForm);
document.querySelector("#cancelPurchaseEdit").addEventListener("click", resetPurchaseForm);
document.querySelector("#cancelProductEdit").addEventListener("click", resetProductForm);
document.querySelector("#cancelExpenseEdit").addEventListener("click", resetExpenseForm);
document.querySelector("#cancelCashEdit").addEventListener("click", resetCashForm);
document.querySelector("#printReceipt").addEventListener("click", printReceipt);
document.querySelector("#pdfReceipt").addEventListener("click", printReceipt);
document.querySelector("#exportExcel").addEventListener("click", exportExcel);
projectionDays.addEventListener("input", render);
productSearch.addEventListener("input", renderProducts);
movementSearch.addEventListener("input", () => {
  renderSales();
  renderPurchases();
});
advisorForm.addEventListener("submit", handleAdvisorQuestion);

saleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(saleForm);
  const id = String(form.get("id") || "");
  const sku = String(form.get("sku"));
  const product = state.products.find((item) => item.sku === sku);
  const quantity = Number(form.get("quantity"));
  const discount = Number(form.get("discount") || 0);
  const existing = id ? state.sales.find((sale) => sale.id === id) : null;

  if (!product) {
    showSaleResult("No existe ese producto.", "danger");
    return;
  }

  const availableStock = product.stock + (existing?.sku === sku ? existing.quantity : 0);

  if (quantity > availableStock) {
    showSaleResult(`Stock insuficiente. Disponible: ${availableStock}.`, "danger");
    return;
  }

  if (existing) {
    restoreSaleStock(existing);
  }

  const sale = buildSale({
    id: existing?.id || makeId(),
    date: String(form.get("date")),
    receipt: String(form.get("receipt")),
    customer: String(form.get("customer")),
    sku,
    quantity,
    discount,
    paymentMethod: String(form.get("paymentMethod")),
    paymentStatus: String(form.get("paymentStatus")),
    paidAmount: Number(form.get("paidAmount") || 0),
    dueDate: String(form.get("dueDate") || ""),
  });

  applySaleStock(sale);

  if (existing) {
    Object.assign(existing, sale);
  } else {
    state.sales.unshift(sale);
  }

  saveState();
  resetSaleForm();
  render();

  const currentProduct = state.products.find((item) => item.sku === sale.sku);
  const alertMessage =
    currentProduct.stock <= currentProduct.minStock
      ? `Venta guardada. ${currentProduct.name} quedó en ${currentProduct.stock} unidades y necesita reposición.`
      : `Venta guardada. Stock actual de ${currentProduct.name}: ${currentProduct.stock}.`;

  showSaleResult(alertMessage, currentProduct.stock <= currentProduct.minStock ? "warn" : "ok");
});

purchaseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(purchaseForm);
  const id = String(form.get("id") || "");
  const sku = String(form.get("sku"));
  const product = state.products.find((item) => item.sku === sku);
  const existing = id ? state.purchases.find((purchase) => purchase.id === id) : null;

  if (!product) {
    showPurchaseResult("No existe ese producto.", "danger");
    return;
  }

  if (existing) {
    restorePurchaseStock(existing);
  }

  const purchase = {
    id: existing?.id || makeId(),
    date: String(form.get("date")),
    order: String(form.get("order")),
    sku,
    quantity: Number(form.get("quantity")),
    cost: Number(form.get("cost")),
    note: String(form.get("note") || ""),
    supplier: String(form.get("supplier") || product.supplier || ""),
    status: String(form.get("status") || "Recibida"),
    dueDate: String(form.get("dueDate") || ""),
  };

  applyPurchaseStock(purchase);

  if (existing) {
    Object.assign(existing, purchase);
  } else {
    state.purchases.unshift(purchase);
  }

  saveState();
  resetPurchaseForm();
  render();
  const currentProduct = state.products.find((item) => item.sku === purchase.sku);
  showPurchaseResult(`Reposición guardada. Stock actual de ${currentProduct.name}: ${currentProduct.stock}.`, "ok");
});

productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(productForm);
  const editingSku = String(form.get("editingSku") || "");
  const sku = editingSku || makeProductCode();
  const existing = state.products.find((item) => item.sku === editingSku);

  const product = {
    sku,
    name: String(form.get("name")).trim(),
    cost: Number(form.get("cost")),
    price: Number(form.get("price")),
    stock: Number(form.get("stock")),
    minStock: Number(form.get("minStock")),
    idealStock: Number(form.get("idealStock")),
    supplier: String(form.get("supplier")).trim(),
  };

  if (existing) {
    if (editingSku && editingSku !== sku) {
      state.sales.forEach((sale) => {
        if (sale.sku === editingSku) sale.sku = sku;
      });
      state.purchases.forEach((purchase) => {
        if (purchase.sku === editingSku) purchase.sku = sku;
      });
    }
    Object.assign(existing, product);
  } else {
    state.products.push(product);
  }

  saveState();
  resetProductForm();
  render();
});

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(expenseForm);
  const id = String(form.get("id") || "");
  const existing = id ? state.expenses.find((expense) => expense.id === id) : null;
  const expense = {
    id: existing?.id || makeId(),
    date: String(form.get("date")),
    category: String(form.get("category")),
    type: String(form.get("type")),
    description: String(form.get("description")).trim(),
    amount: Number(form.get("amount")),
    recurrence: String(form.get("recurrence") || "once"),
    recurrenceEnd: String(form.get("recurrenceEnd") || ""),
    paymentMethod: String(form.get("paymentMethod")),
  };

  if (existing) {
    Object.assign(existing, expense);
  } else {
    state.expenses.unshift(expense);
  }

  saveState();
  resetExpenseForm();
  render();
});

cashForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(cashForm);
  const id = String(form.get("id") || "");
  const existing = id ? state.cashSessions.find((cash) => cash.id === id) : null;
  const cash = {
    id: existing?.id || makeId(),
    date: String(form.get("date")),
    opening: Number(form.get("opening")),
    closing: Number(form.get("closing")),
    note: String(form.get("note") || "").trim(),
  };

  if (existing) {
    Object.assign(existing, cash);
  } else {
    state.cashSessions.unshift(cash);
  }

  saveState();
  resetCashForm();
  render();
});

document.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  const questionButton = event.target.closest("[data-question]");

  if (questionButton) {
    advisorQuestion.value = questionButton.dataset.question;
    advisorForm.requestSubmit();
    return;
  }

  if (!actionButton) return;

  const { action, id, sku } = actionButton.dataset;

  if (action === "receipt-sale") showReceipt(id);
  if (action === "edit-sale") editSale(id);
  if (action === "delete-sale") deleteSale(id);
  if (action === "edit-purchase") editPurchase(id);
  if (action === "delete-purchase") deletePurchase(id);
  if (action === "edit-product") editProduct(sku);
  if (action === "delete-product") deleteProduct(sku);
  if (action === "edit-expense") editExpense(id);
  if (action === "delete-expense") deleteExpense(id);
  if (action === "edit-cash") editCash(id);
  if (action === "delete-cash") deleteCash(id);
});

function loadState() {
  const saved = localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey);
  const shouldRefreshSeed = currentCompany?.id === "mi-negocio" && localStorage.getItem(seedDataVersionKey) !== seedDataVersion;
  const parsed = shouldRefreshSeed ? structuredClone(seedData) : saved ? JSON.parse(saved) : currentCompany?.id === "mi-negocio" ? structuredClone(seedData) : emptyState();
  const migrated = migrateState(parsed);
  localStorage.setItem(storageKey, JSON.stringify(migrated));
  if (currentCompany?.id === "mi-negocio") localStorage.setItem(seedDataVersionKey, seedDataVersion);
  return migrated;
}

function saveState() {
  if (!storageKey) return;
  localStorage.setItem(storageKey, JSON.stringify(state));
  queueCloudSave();
}

function emptyState() {
  return { products: [], sales: [], purchases: [], expenses: [], cashSessions: [] };
}

function loadCompanies() {
  const saved = localStorage.getItem(companiesKey);
  if (saved) return JSON.parse(saved);
  const companies = [{ id: "mi-negocio", name: "Mi Negocio", password: "1234" }];
  localStorage.setItem(companiesKey, JSON.stringify(companies));
  return companies;
}

function saveCompanies(companies) {
  localStorage.setItem(companiesKey, JSON.stringify(companies));
}

async function renderCompanyOptions() {
  if (isSupabaseConfigured()) {
    companySelect.innerHTML = `<option value="">Cargando empresas...</option>`;
    try {
      const companies = await listCloudCompanies();
      saveCompanies(companies.map((company) => ({ ...company, password: "" })));
      companySelect.innerHTML =
        `<option value="">Seleccionar empresa</option>` +
        companies.map((company) => `<option value="${escapeHtml(company.name)}">${escapeHtml(company.name)}</option>`).join("");
      setCloudStatus("Supabase activo", `${companies.length} empresa(s) disponibles.`);
      return;
    } catch (error) {
      companySelect.innerHTML = `<option value="">Error al cargar empresas</option>`;
      setCloudStatus("Error Supabase", "No se pudo cargar el listado de empresas.");
      alert(`No se pudieron cargar las empresas desde Supabase: ${error.message}`);
      return;
    }
  }

  const companies = loadCompanies();
  companySelect.innerHTML =
    `<option value="">Seleccionar empresa</option>` +
    companies.map((company) => `<option value="${escapeHtml(company.name)}">${escapeHtml(company.name)}</option>`).join("");
}

async function loginCompany() {
  const name = companySelect.value.trim();
  const password = companyPassword.value;

  if (!name || !password) {
    alert("Ingresá nombre de empresa y contraseña.");
    return;
  }

  if (isSupabaseEnabled()) {
    try {
      const remoteCompany = await loginCloudCompany(name, password);
      cloud.companyPassword = password;
      enterCompany(
        { id: remoteCompany.id, name: remoteCompany.name, password: "" },
        remoteCompany.state || emptyState(),
        { skipCloudLoad: true }
      );
      setCloudStatus("Sincronizado", "Datos cargados desde Supabase.");
      return;
    } catch (error) {
      alert(`No se pudo ingresar con Supabase: ${error.message}`);
      return;
    }
  }

  const companies = loadCompanies();
  const company = companies.find((item) => normalize(item.name) === normalize(name) || item.id === slugify(name));
  if (!company || company.password !== password) {
    alert("Empresa o contraseña incorrecta.");
    return;
  }
  enterCompany(company);
}

async function createCompany() {
  const name = newCompanyName.value.trim();
  const password = newCompanyPassword.value.trim();
  if (!name || !password) {
    alert("Ingresá nombre de empresa y contraseña.");
    return;
  }

  if (isSupabaseEnabled()) {
    try {
      const remoteCompany = await createCloudCompany(name, password);
      cloud.companyPassword = password;
      await renderCompanyOptions();
      enterCompany(
        { id: remoteCompany.id, name: remoteCompany.name, password: "" },
        remoteCompany.state || emptyState(),
        { skipCloudLoad: true }
      );
      setCloudStatus("Sincronizado", "Empresa creada en Supabase.");
      return;
    } catch (error) {
      alert(`No se pudo crear la empresa en Supabase: ${error.message}`);
      return;
    }
  }

  const companies = loadCompanies();
  const id = slugify(name);
  if (companies.some((company) => company.id === id)) {
    alert("Ya existe una empresa con ese nombre.");
    return;
  }
  const company = { id, name, password };
  companies.push(company);
  saveCompanies(companies);
  localStorage.setItem(companyStorageKey(id), JSON.stringify(emptyState()));
  renderCompanyOptions();
  enterCompany(company);
}

function enterCompany(company, initialState = null, options = {}) {
  currentCompany = company;
  storageKey = companyStorageKey(company.id);
  migrateLegacyDataIfNeeded();
  state = initialState ? migrateState(initialState) : loadState();
  localStorage.setItem(storageKey, JSON.stringify(state));
  sessionStorage.setItem(activeCompanyKey, company.id);
  document.querySelector("#activeCompanyName").textContent = company.name;
  loginScreen.hidden = true;
  document.querySelectorAll(".app-protected").forEach((element) => {
    element.hidden = false;
  });
  companyPassword.value = "";
  companySelect.value = "";
  newCompanyName.value = "";
  newCompanyPassword.value = "";
  render();
  if (!options.skipCloudLoad) initCloudSync(company);
}

async function logoutCompany() {
  sessionStorage.removeItem(activeCompanyKey);
  currentCompany = null;
  storageKey = "";
  state = emptyState();
  cloud.remoteLoaded = false;
  cloud.companyPassword = "";
  document.querySelectorAll(".app-protected").forEach((element) => {
    element.hidden = true;
  });
  loginScreen.hidden = false;
  renderCompanyOptions();
}

async function initApp() {
  await renderCompanyOptions();
  migrateLegacyDataIfNeeded();
  if (isSupabaseConfigured()) {
    setCloudStatus("Supabase activo", "Ingresá con empresa y contraseña.");
    return;
  }
  if (window.supabaseConfig?.enabled) {
    setCloudStatus("Modo local emergencia", "Faltan credenciales reales de Supabase.");
  }
  const activeCompanyId = sessionStorage.getItem(activeCompanyKey);
  const company = loadCompanies().find((item) => item.id === activeCompanyId);
  if (company) {
    enterCompany(company);
  }
}

function migrateLegacyDataIfNeeded() {
  const defaultKey = companyStorageKey("mi-negocio");
  if (localStorage.getItem(defaultKey)) return;
  const legacy = localStorage.getItem("business-erp-v2") || localStorage.getItem(legacyStorageKey);
  if (legacy) {
    localStorage.setItem(defaultKey, legacy);
  }
}

function companyStorageKey(companyId) {
  return `business-erp-company-${companyId}`;
}

async function initCloudSync(company) {
  if (!isSupabaseConfigured()) {
    setCloudStatus("Modo local", "Los datos se guardan solo en este dispositivo.");
    return;
  }

  setCloudStatus("Supabase activo", "Ingresá nuevamente con contraseña para sincronizar.");
}

function isSupabaseEnabled() {
  return isSupabaseConfigured();
}

function isSupabaseConfigured() {
  const config = window.supabaseConfig;
  if (!config?.enabled) return false;
  const url = String(config.url || "");
  const anonKey = String(config.anonKey || "");
  if (!url || !anonKey) return false;
  if (url.includes("TU_PROYECTO")) return false;
  if (anonKey.includes("PEGAR")) return false;
  return true;
}

async function ensureSupabase() {
  if (cloud.ready) return;
  const config = window.supabaseConfig;
  const supabaseUrl = normalizeSupabaseUrl(config.url);
  const anonKey = String(config.anonKey || "").trim();
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2?bundle");

  cloud.url = supabaseUrl;
  cloud.anonKey = anonKey;
  cloud.client = createClient(supabaseUrl, anonKey, {
    db: { schema: "public" },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { "X-Client-Info": "control-negocio-app" },
    },
  });
  cloud.ready = true;
  cloud.enabled = true;
}

async function loginCloudCompany(name, password) {
  await ensureSupabase();
  const data = await callSupabaseRpc("login_company", {
    p_name: name,
    p_password: password,
  });
  if (!data) throw new Error("Empresa o contraseña incorrecta.");
  return data;
}

async function listCloudCompanies() {
  await ensureSupabase();
  const data = await callSupabaseRpc("list_companies", {});
  return Array.isArray(data) ? data : [];
}

async function createCloudCompany(name, password) {
  await ensureSupabase();
  const data = await callSupabaseRpc("create_company", {
    p_name: name,
    p_password: password,
    p_initial_state: emptyState(),
  });
  if (!data) throw new Error("No se pudo crear la empresa.");
  return data;
}

function queueCloudSave() {
  if (!cloud.ready || !cloud.companyPassword || !currentCompany) return;
  clearTimeout(cloud.saveTimer);
  cloud.saveTimer = setTimeout(() => {
    saveCloudStateNow().catch((error) => {
      console.error(error);
      setCloudStatus("Error Supabase", "No se pudieron guardar los cambios.");
      alert(`No se pudieron guardar los cambios en Supabase: ${error.message}`);
    });
  }, 600);
}

async function saveCloudStateNow() {
  if (!cloud.ready || !cloud.companyPassword || !currentCompany) return;
  await callSupabaseRpc("save_company_state", {
    p_company_id: currentCompany.id,
    p_password: cloud.companyPassword,
    p_state: state,
  });
  setCloudStatus("Sincronizado", "Últimos cambios guardados en Supabase.");
}

async function callSupabaseRpc(functionName, args) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(functionName)) {
    throw new Error(`Función RPC inválida: ${functionName}`);
  }

  let response;
  try {
    response = await cloud.client.rpc(functionName, args);
  } catch (error) {
    if (!isInvalidPathError(error)) throw normalizeSupabaseError(error);
    response = { error };
  }

  if (!response.error) return response.data;

  if (!isInvalidPathError(response.error)) {
    throw normalizeSupabaseError(response.error);
  }

  const fallbackResponse = await fetch(`${cloud.url}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: cloud.anonKey,
      Authorization: `Bearer ${cloud.anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(args),
  });

  const text = await fallbackResponse.text();
  const payload = text ? JSON.parse(text) : null;

  if (!fallbackResponse.ok) {
    throw normalizeSupabaseError(payload || { message: fallbackResponse.statusText });
  }

  return payload;
}

function normalizeSupabaseUrl(value) {
  const raw = String(value || "").trim().replace(/\/+$/, "");
  if (!raw) throw new Error("Falta configurar Supabase URL.");

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("Supabase URL inválida. Usá la Project URL, por ejemplo https://xxxx.supabase.co");
  }

  if (!parsed.hostname.endsWith(".supabase.co") && !parsed.hostname.includes("supabase")) {
    throw new Error("Supabase URL inválida. Copiá la Project URL desde Supabase → Project Settings → API.");
  }

  return parsed.origin;
}

function isInvalidPathError(error) {
  return normalize(error?.message || "").includes("invalid path specified");
}

function normalizeSupabaseError(error) {
  const message = error?.message || error?.error_description || error?.hint || "Error desconocido de Supabase.";
  return new Error(message);
}

function setCloudStatus(title, detail) {
  const element = document.querySelector("#cloudStatus");
  if (!element) return;
  element.innerHTML = `<span>${escapeHtml(title)}</span><strong>${escapeHtml(detail)}</strong>`;
}

function migrateState(parsed) {
  return {
    products: (parsed.products || []).map((product) => ({ ...product })),
    sales: (parsed.sales || []).map((sale) => normalizeSale(sale)),
    purchases: (parsed.purchases || []).map((purchase) => ({
      ...purchase,
      id: purchase.id || makeId(),
      supplier: purchase.supplier || purchase.note || "",
      status: purchase.status || "Recibida",
      dueDate: purchase.dueDate || "",
    })),
    expenses: (parsed.expenses || []).map((expense) => ({
      ...expense,
      id: expense.id || makeId(),
      category: expense.category || "Otro",
      type: expense.type || "Variable",
      recurrence: expense.recurrence || "once",
      recurrenceEnd: expense.recurrenceEnd || "",
      paymentMethod: expense.paymentMethod || "Efectivo",
    })),
    cashSessions: (parsed.cashSessions || []).map((cash) => ({ ...cash, id: cash.id || makeId() })),
  };
}

function slugify(value) {
  const clean = normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return clean || `empresa-${Date.now()}`;
}

function showView(nextView) {
  viewButtons.forEach((item) => item.classList.toggle("active", item.dataset.view === nextView));
  views.forEach((view) => view.classList.toggle("active", view.id === nextView));
}

function render() {
  renderProductOptions();
  renderMetrics();
  renderStockTable();
  renderAlerts();
  renderTopProducts();
  renderCustomers();
  renderPaymentMethods();
  renderDebts();
  renderFinancialDashboard();
  renderProfitabilityDashboard();
  renderProducts();
  renderSales();
  renderPurchases();
  renderExpenses();
  renderCashSessions();
}

function renderProductOptions() {
  const options = state.products
    .map((product) => `<option value="${escapeHtml(product.sku)}">${escapeHtml(product.name)}</option>`)
    .join("");
  saleSku.innerHTML = options;
  purchaseSku.innerHTML = options;
}

function renderMetrics() {
  const sales = filteredSales();
  const purchases = filteredPurchases();
  const expenses = filteredExpenses();
  const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const margin = sales.reduce((sum, sale) => sum + sale.margin, 0);
  const expensesTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const purchaseTotal = purchases.reduce((sum, purchase) => sum + purchase.quantity * purchase.cost, 0);
  const cashIn = sales.reduce((sum, sale) => sum + sale.paidAmount, 0);
  const cashOut = purchaseTotal + expensesTotal;
  const netProfit = margin - expensesTotal;
  const debtTotal = sales.reduce((sum, sale) => sum + sale.debt, 0);
  const pendingOrders = purchases.filter((purchase) => purchase.status !== "Recibida").length;
  const alerts = getAlerts();
  const unitsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const criticalStock = alerts.filter((alert) => alert.priority === "Sin stock" || alert.priority === "Reposición urgente").length;
  const suggestedReplenishment = alerts.reduce((sum, alert) => sum + alert.buyQuantity, 0);
  const inventoryValue = state.products.reduce((sum, product) => sum + product.stock * product.cost, 0);
  const customers = summarizeCustomers(sales);
  const status = document.querySelector("#businessStatus");

  document.querySelector("#metricRevenue").textContent = currency.format(revenue);
  document.querySelector("#metricMargin").textContent = number.format(sales.length);
  document.querySelector("#metricAlerts").textContent = number.format(alerts.filter((alert) => alert.priority !== "Vigilar").length);
  document.querySelector("#metricInventory").textContent = currency.format(inventoryValue);
  document.querySelector("#metricExpenses").textContent = number.format(unitsSold);
  document.querySelector("#metricNetProfit").textContent = number.format(suggestedReplenishment);
  document.querySelector("#metricDebt").textContent = number.format(criticalStock);
  document.querySelector("#metricPendingOrders").textContent = number.format(pendingOrders);
  document.querySelector("#metricCashIn").textContent = currency.format(cashIn);
  document.querySelector("#metricCashOut").textContent = currency.format(cashOut);
  document.querySelector("#metricCashBalance").textContent = currency.format(cashIn - cashOut);
  document.querySelector("#metricCustomers").textContent = number.format(sales.length);
  document.querySelector("#productCount").textContent = `${state.products.length} productos`;
  document.querySelector("#operationalSummary").innerHTML = buildInsightCards([
    {
      level: criticalStock ? "warn" : "ok",
      title: "Stock y reposición",
      text: criticalStock
        ? `Hay ${number.format(criticalStock)} producto(s) en estado crítico y conviene reponer ${number.format(suggestedReplenishment)} unidades.`
        : "No hay productos en estado crítico para reposición inmediata.",
    },
    {
      level: pendingOrders ? "info" : "ok",
      title: "Órdenes de compra",
      text: pendingOrders
        ? `Hay ${number.format(pendingOrders)} orden(es) pendientes o vencidas para revisar.`
        : "No hay órdenes pendientes registradas.",
    },
  ]);

  const hasCritical = alerts.some((alert) => alert.priority !== "Vigilar");
  status.textContent = hasCritical ? "Revisar reposición" : "Operación estable";
  status.className = `status-pill ${hasCritical ? "warn" : "ok"}`;
}

function renderStockTable() {
  const rows = state.products
    .map((product) => {
      const margin = product.price === 0 ? 0 : (product.price - product.cost) / product.price;
      return `
        <tr>
          <td>${escapeHtml(product.name)}</td>
          <td>${number.format(product.stock)}</td>
          <td>${number.format(product.minStock)}</td>
          <td>${currency.format(product.price)}</td>
          <td>${Math.round(margin * 100)}%</td>
        </tr>
      `;
    })
    .join("");

  document.querySelector("#stockTable").innerHTML = rows;
}

function renderAlerts() {
  const alerts = getAlerts();
  document.querySelector("#alertCount").textContent = `${alerts.length} alertas`;

  document.querySelector("#alertsTable").innerHTML =
    alerts
      .map((alert) => {
        const level = alert.priority === "Sin stock" ? "danger" : alert.priority === "Vigilar" ? "ok" : "warn";
        return `
          <tr>
            <td>${escapeHtml(alert.name)}</td>
            <td>${number.format(alert.stock)}</td>
            <td>${number.format(alert.minStock)}</td>
            <td><span class="tag ${level}">${escapeHtml(alert.priority)}</span></td>
            <td>${number.format(alert.buyQuantity)}</td>
            <td>${escapeHtml(alert.status)}</td>
          </tr>
        `;
      })
      .join("") || `<tr><td class="empty" colspan="6">No hay productos para reponer.</td></tr>`;
}

function renderTopProducts() {
  const sales = filteredSales();
  const ranking = [...sales.reduce((map, sale) => {
    const product = state.products.find((item) => item.sku === sale.sku);
    const current = map.get(sale.sku) || { sku: sale.sku, name: product?.name || sale.sku, quantity: 0, total: 0 };
    current.quantity += sale.quantity;
    current.total += sale.total;
    map.set(sale.sku, current);
    return map;
  }, new Map()).values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  document.querySelector("#rankingCount").textContent = `${sales.length} ventas`;
  document.querySelector("#topProductsTable").innerHTML =
    ranking
      .map((item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${number.format(item.quantity)}</td>
          <td>${currency.format(item.total)}</td>
        </tr>
      `)
      .join("") || `<tr><td class="empty" colspan="3">No hay ventas en el período.</td></tr>`;
}

function renderCustomers() {
  const customers = summarizeCustomers(filteredSales());
  document.querySelector("#customerCount").textContent = `${customers.length} clientes`;
}

function renderPaymentMethods() {
  const methods = summarizePaymentMethods(filteredSales());
  document.querySelector("#paymentMethodCount").textContent = `${methods.length} métodos`;
  document.querySelector("#paymentMethodsTable").innerHTML =
    methods
      .map((method) => `
        <tr>
          <td>${escapeHtml(method.name)}</td>
          <td>${number.format(method.count)}</td>
          <td>${currency.format(method.total)}</td>
        </tr>
      `)
      .join("") || `<tr><td class="empty" colspan="3">No hay pagos en el período.</td></tr>`;
}

function renderDebts() {
  const debts = summarizeDebts(filteredSales());
  document.querySelector("#debtCustomerCount").textContent = `${debts.length} clientes`;
  document.querySelector("#debtsTable").innerHTML =
    debts
      .map((debt) => `
        <tr>
          <td>${escapeHtml(debt.customer)}</td>
          <td>${currency.format(debt.total)}</td>
          <td>${currency.format(debt.salesTotal)}</td>
          <td>${escapeHtml(debt.since)}</td>
        </tr>
      `)
      .join("") || `<tr><td class="empty" colspan="4">No hay clientes con deuda.</td></tr>`;
}

function renderFinancialDashboard() {
  const sales = filteredSales();
  const expenses = filteredExpenses();
  const purchases = filteredPurchases();
  const days = getProjectionDays();
  const analysis = buildBusinessAnalysis(sales, expenses, purchases, days);
  const financeStatus = document.querySelector("#financeStatus");

  document.querySelector("#financeProjectedIncome").textContent = currency.format(analysis.projectedIncome);
  document.querySelector("#financeProjectedCash").textContent = currency.format(analysis.projectedCash);
  document.querySelector("#financeDailyAverage").textContent = currency.format(analysis.dailyRevenueAverage);
  document.querySelector("#financeDebtRisk").textContent = currency.format(analysis.debtTotal);
  document.querySelector("#financeChartTotal").textContent = currency.format(analysis.revenue);
  document.querySelector("#projectionDaysLabel").textContent = `Próximos ${number.format(days)} días`;

  financeStatus.textContent = analysis.projectedCash >= 0 ? "Caja positiva" : "Caja en riesgo";
  financeStatus.className = `status-pill ${analysis.projectedCash >= 0 ? "ok" : "warn"}`;

  document.querySelector("#financeCashChart").innerHTML = buildFinanceChart(analysis.dailyGroups);
  document.querySelector("#financeProjectionTable").innerHTML = `
    <tr><td>Saldo actual de caja</td><td>${currency.format(analysis.cashBalance)}</td></tr>
    <tr><td>Cobros proyectados por ventas</td><td>${currency.format(analysis.projectedIncome)}</td></tr>
    <tr><td>Gastos proyectados</td><td>${currency.format(analysis.projectedExpenses)}</td></tr>
    <tr><td>Compras proyectadas</td><td>${currency.format(analysis.projectedPurchases)}</td></tr>
    <tr><td><strong>Caja estimada</strong></td><td><strong>${currency.format(analysis.projectedCash)}</strong></td></tr>
  `;
  document.querySelector("#financeInsights").innerHTML = buildInsightCards(financialInsights(analysis));
}

function renderProfitabilityDashboard() {
  const sales = filteredSales();
  const expenses = filteredExpenses();
  const purchases = filteredPurchases();
  const analysis = buildBusinessAnalysis(sales, expenses, purchases, getProjectionDays());
  const profitStatus = document.querySelector("#profitStatus");
  const rate = Math.round(analysis.grossRate * 100);

  document.querySelector("#profitGrossRate").textContent = currency.format(analysis.grossProfit);
  document.querySelector("#profitNetAmount").textContent = currency.format(analysis.netProfit);
  document.querySelector("#profitBreakEven").textContent = currency.format(analysis.breakEvenRevenue);
  document.querySelector("#profitDailyTarget").textContent = currency.format(analysis.dailyBreakEvenTarget);
  document.querySelector("#profitProductCount").textContent = `${state.products.length} productos`;

  profitStatus.textContent = analysis.netProfit >= 0 ? "Rentable" : "Necesita ajuste";
  profitStatus.className = `status-pill ${analysis.netProfit >= 0 ? "ok" : "warn"}`;

  document.querySelector("#profitMarginChart").innerHTML = buildProductMarginChart();
  document.querySelector("#profitActionsTable").innerHTML = buildProductActionsTable(analysis);
}

function handleAdvisorQuestion(event) {
  event.preventDefault();
  const question = advisorQuestion.value.trim();
  if (!question) return;
  appendAdvisorMessage(question, "user");
  advisorQuestion.value = "";
  const analysis = buildBusinessAnalysis(filteredSales(), filteredExpenses(), filteredPurchases(), getProjectionDays());
  appendAdvisorMessage(buildAdvisorAnswer(question, analysis), "assistant");
}

function appendAdvisorMessage(message, sender) {
  const element = document.createElement("div");
  element.className = `chat-message ${sender === "user" ? "user-message" : "assistant-message"}`;
  element.textContent = message;
  advisorChat.appendChild(element);
  advisorChat.scrollTop = advisorChat.scrollHeight;
  return element;
}

function buildAdvisorAnswer(question, analysis) {
  const query = normalize(question);
  const context = businessContextText(analysis);
  const requestedAmount = extractAmount(question);

  if (hasInsufficientAdvisorData(analysis, query)) {
    return insufficientAdvisorDataText(analysis, query);
  }

  if (query.includes("publicidad") || query.includes("marketing") || query.includes("gastar") || query.includes("invertir")) {
    return `${context}\n\nPara decidir si conviene gastar, usá esta regla: el gasto debería generar margen bruto adicional mayor al gasto. Con tu margen actual de ${Math.round(analysis.grossRate * 100)}%, un gasto de ${requestedAmount ? currency.format(requestedAmount) : "ese monto"} necesita ventas adicionales aproximadas de ${currency.format(requiredSalesForExpense(requestedAmount || analysis.dailyBreakEvenTarget, analysis.grossRate))} para pagarse solo. Si tu caja proyectada queda negativa, no lo haría salvo que sea una acción con retorno claro y medible.`;
  }

  if (query.includes("objetivo") || query.includes("llegar") || query.includes("meta") || query.includes("cubrir")) {
    return `${context}\n\nPara llegar al objetivo, primero cubrí el punto de equilibrio: necesitás vender cerca de ${currency.format(analysis.breakEvenRevenue)} en el período, o ${currency.format(analysis.dailyBreakEvenTarget)} por día. Si querés una utilidad adicional, dividí esa utilidad por tu margen bruto (${Math.round(analysis.grossRate * 100)}%) y sumalo como ventas necesarias.`;
  }

  if (query.includes("deuda") || query.includes("cobrar") || query.includes("credito") || query.includes("crédito")) {
    return `${context}\n\nLa prioridad debería ser cobrar deuda antes de financiar más ventas. Hoy hay ${currency.format(analysis.debtTotal)} pendiente. Sugerencia: separar clientes por antigüedad, suspender crédito a quienes tengan saldo vencido y ofrecer descuento chico por pago inmediato solo si no destruye margen.`;
  }

  if (query.includes("precio") || query.includes("margen") || query.includes("rentabilidad") || query.includes("utilidad")) {
    const lowMargin = state.products.filter((product) => product.price > 0 && (product.price - product.cost) / product.price < 0.2);
    return `${context}\n\nTu margen bruto promedio es ${Math.round(analysis.grossRate * 100)}%. ${lowMargin.length ? `Hay ${lowMargin.length} producto(s) con margen menor a 20%; revisaría precios o costos ahí primero.` : "No veo productos con margen menor a 20%."} Para mejorar utilidad neta, el orden práctico es: subir margen de productos débiles, reducir gastos recurrentes, empujar productos de buen margen y controlar descuentos.`;
  }

  if (query.includes("stock") || query.includes("comprar") || query.includes("reposicion") || query.includes("reposición")) {
    const alerts = getAlerts();
    const urgent = alerts.filter((alert) => alert.priority !== "Vigilar");
    return `${context}\n\nEn stock, compraría primero lo urgente: ${urgent.length} producto(s) necesitan atención. No conviene reponer productos sin rotación salvo que sean estratégicos. Priorizá productos vendidos recientemente, con buen margen y stock bajo.`;
  }

  if (query.includes("caja") || query.includes("flujo") || query.includes("liquidez")) {
    return `${context}\n\nLa caja proyectada para ${number.format(analysis.projectionDayCount)} días es ${currency.format(analysis.projectedCash)}. Si queda ajustada, actuá en este orden: cobrar deuda, frenar compras no críticas, reducir gastos variables y mover ventas a métodos de pago más rápidos.`;
  }

  return `${context}\n\nMi evaluación general: enfocaría la gestión en 4 cosas: cobrar ${currency.format(analysis.debtTotal)} de deuda, sostener ventas diarias de al menos ${currency.format(analysis.dailyBreakEvenTarget)}, revisar gastos por ${currency.format(analysis.expensesTotal)} y empujar productos con mejor margen. Si querés, preguntame por un gasto, una meta de utilidad o una decisión de compra concreta.`;
}

function businessContextText(analysis) {
  return `Base usada: ${number.format(analysis.productCount)} producto(s), ${number.format(analysis.salesCount)} venta(s), ${number.format(analysis.expenseCount)} gasto(s) y ${number.format(analysis.purchaseCount)} compra(s) registradas en el período visible. Ventas ${currency.format(analysis.revenue)}, cobrado ${currency.format(analysis.collected)}, deuda ${currency.format(analysis.debtTotal)}, gastos ${currency.format(analysis.expensesTotal)}, utilidad neta ${currency.format(analysis.netProfit)} y caja proyectada ${currency.format(analysis.projectedCash)} a ${number.format(analysis.projectionDayCount)} días.`;
}

function hasInsufficientAdvisorData(analysis, query) {
  const hasAnyData = analysis.productCount || analysis.salesCount || analysis.expenseCount || analysis.purchaseCount;
  if (!hasAnyData) return true;

  const asksAboutStock = query.includes("stock") || query.includes("comprar") || query.includes("reposicion") || query.includes("reposición");
  if (asksAboutStock) return analysis.productCount === 0;

  return analysis.salesCount === 0;
}

function insufficientAdvisorDataText(analysis, query) {
  const asksAboutStock = query.includes("stock") || query.includes("comprar") || query.includes("reposicion") || query.includes("reposición");
  if (!analysis.productCount && !analysis.salesCount && !analysis.expenseCount && !analysis.purchaseCount) {
    return "Necesitaría más datos para poder hacer una evaluación útil. Todavía no hay productos, ventas, gastos ni compras cargadas. Primero cargá algunos productos y registrá ventas o gastos reales; después puedo analizar caja, rentabilidad, stock, deuda y objetivos.";
  }

  if (asksAboutStock && !analysis.productCount) {
    return "Necesitaría productos cargados para evaluar stock o reposición. Agregá productos con stock actual, stock mínimo e ideal, y después puedo decirte qué conviene reponer.";
  }

  return "Necesitaría más datos de ventas para poder hacer una evaluación financiera o económica confiable. Con la empresa vacía o sin ventas, cualquier recomendación sobre caja, margen, utilidad, objetivos o inversión sería poco confiable. Cargá algunas ventas reales, gastos y métodos de pago para poder analizar el negocio.";
}

function extractAmount(text) {
  const match = String(text).replace(/\./g, "").replace(",", ".").match(/(?:usd|us\$|\$)?\s*(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : 0;
}

function requiredSalesForExpense(expenseAmount, grossRate) {
  if (!grossRate) return 0;
  return expenseAmount / grossRate;
}

function projectedExpenseTotal(days) {
  const from = todayIso();
  const to = addDays(from, Math.max(days - 1, 0));
  return expandExpensesInRange(state.expenses, from, to).reduce((sum, expense) => sum + expense.amount, 0);
}

function buildBusinessAnalysis(sales, expenses, purchases, projectionDayCount = 30) {
  const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const collected = sales.reduce((sum, sale) => sum + sale.paidAmount, 0);
  const debtTotal = sales.reduce((sum, sale) => sum + sale.debt, 0);
  const grossProfit = sales.reduce((sum, sale) => sum + sale.margin, 0);
  const productCosts = sales.reduce((sum, sale) => sum + sale.cost, 0);
  const expensesTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const purchaseTotal = purchases.reduce((sum, purchase) => sum + purchase.quantity * purchase.cost, 0);
  const netProfit = grossProfit - expensesTotal;
  const grossRate = revenue > 0 ? grossProfit / revenue : averageProductMarginRate();
  const days = Math.max(countActiveDays([...sales, ...expenses, ...purchases]), 1);
  const dailyRevenueAverage = revenue / days;
  const dailyCollectedAverage = collected / days;
  const dailyExpenseAverage = expensesTotal / days;
  const dailyPurchaseAverage = purchaseTotal / days;
  const projectedIncome = dailyCollectedAverage * projectionDayCount;
  const projectedExpenses = projectedExpenseTotal(projectionDayCount);
  const projectedPurchases = dailyPurchaseAverage * projectionDayCount;
  const cashBalance = collected - expensesTotal - purchaseTotal;
  const projectedCash = cashBalance + projectedIncome - projectedExpenses - projectedPurchases;
  const breakEvenRevenue = grossRate > 0 ? expensesTotal / grossRate : 0;
  const dailyBreakEvenTarget = breakEvenRevenue / Math.max(projectionDayCount, 1);
  const unitsToBreakEven = estimateUnitsToBreakEven(breakEvenRevenue);

  return {
    revenue,
    productCount: state.products.length,
    salesCount: sales.length,
    expenseCount: expenses.length,
    purchaseCount: purchases.length,
    collected,
    debtTotal,
    grossProfit,
    productCosts,
    expensesTotal,
    purchaseTotal,
    netProfit,
    grossRate,
    days,
    projectionDayCount,
    dailyRevenueAverage,
    dailyCollectedAverage,
    projectedIncome,
    projectedExpenses,
    projectedPurchases,
    cashBalance,
    projectedCash,
    breakEvenRevenue,
    dailyBreakEvenTarget,
    unitsToBreakEven,
    dailyGroups: summarizeCashByDay(sales, expenses, purchases),
  };
}

function buildFinanceChart(groups) {
  const max = Math.max(...groups.flatMap((item) => [item.sales, item.collected, item.outcome]), 1);
  return groups
    .map((item) => {
      const salesHeight = Math.max(3, Math.round((item.sales / max) * 100));
      const collectedHeight = Math.max(3, Math.round((item.collected / max) * 100));
      const outcomeHeight = Math.max(3, Math.round((item.outcome / max) * 100));
      return `
        <div class="chart-bar triple-bar" title="${escapeHtml(item.label)}: ventas ${currency.format(item.sales)}, cobros ${currency.format(item.collected)}, egresos ${currency.format(item.outcome)}">
          <div class="bar-track">
            <div class="bar-fill" style="height:${salesHeight}%"></div>
            <div class="bar-fill cash-fill" style="height:${collectedHeight}%"></div>
            <div class="bar-fill expense-fill" style="height:${outcomeHeight}%"></div>
          </div>
          <span class="bar-label">${escapeHtml(item.label)}</span>
        </div>
      `;
    })
    .join("") || `<p class="empty">No hay datos suficientes para graficar.</p>`;
}

function buildProductMarginChart() {
  const products = state.products
    .map((product) => ({
      ...product,
      marginRate: product.price > 0 ? (product.price - product.cost) / product.price : 0,
    }))
    .sort((a, b) => b.marginRate - a.marginRate)
    .slice(0, 10);
  const max = Math.max(...products.map((product) => product.marginRate), 1);
  return products
    .map((product) => {
      const height = Math.max(4, Math.round((product.marginRate / max) * 100));
      return `
        <div class="chart-bar" title="${escapeHtml(product.name)}: margen ${Math.round(product.marginRate * 100)}%">
          <div class="bar-track">
            <div class="bar-fill margin-fill" style="height:${height}%"></div>
          </div>
          <span class="bar-label">${escapeHtml(shortLabel(product.name))}</span>
          <span class="bar-value">${Math.round(product.marginRate * 100)}%</span>
        </div>
      `;
    })
    .join("") || `<p class="empty">No hay productos cargados.</p>`;
}

function buildProductActionsTable(analysis) {
  const averageRow = `
    <tr class="summary-row">
      <td>Promedio del negocio</td>
      <td>${Math.round(analysis.grossRate * 100)}%</td>
      <td>Referencia general para comparar cada producto.</td>
    </tr>
  `;
  const rows = state.products
    .map((product) => {
      const marginRate = product.price > 0 ? (product.price - product.cost) / product.price : 0;
      const sold = state.sales.filter((sale) => sale.sku === product.sku).reduce((sum, sale) => sum + sale.quantity, 0);
      let suggestion = "Mantener precio y controlar stock.";
      if (marginRate < 0.2) suggestion = "Subir precio o renegociar costo; margen bajo.";
      else if (sold === 0 && product.stock > product.minStock) suggestion = "Promocionar o revisar si el producto rota.";
      else if (product.stock <= product.minStock) suggestion = `Reponer ${Math.max(product.idealStock - product.stock, 0)} unidades.`;
      else if (marginRate > analysis.grossRate && sold > 0) suggestion = "Priorizar en promociones; aporta buen margen.";
      return { product, marginRate, suggestion };
    })
    .sort((a, b) => a.marginRate - b.marginRate)
    .slice(0, 8);

  return averageRow + (rows
    .map((row) => `
      <tr>
        <td>${escapeHtml(row.product.name)}</td>
        <td>${Math.round(row.marginRate * 100)}%</td>
        <td>${escapeHtml(row.suggestion)}</td>
      </tr>
    `)
    .join("") || `<tr><td class="empty" colspan="3">No hay productos para evaluar.</td></tr>`);
}

function financialInsights(analysis) {
  const insights = [];
  if (analysis.projectedCash < 0) {
    insights.push({
      level: "warn",
      title: "Caja proyectada negativa",
      text: `Con el ritmo actual faltaría ${currency.format(Math.abs(analysis.projectedCash))} en ${number.format(analysis.projectionDayCount)} días. Bajá gastos, cobrá deudas o postergá compras no críticas.`,
    });
  } else {
    insights.push({
      level: "ok",
      title: "Caja proyectada positiva",
      text: `Si se mantiene el ritmo actual, la caja estimada a ${number.format(analysis.projectionDayCount)} días sería ${currency.format(analysis.projectedCash)}.`,
    });
  }

  if (analysis.debtTotal > analysis.collected * 0.25 && analysis.debtTotal > 0) {
    insights.push({
      level: "warn",
      title: "Deuda alta de clientes",
      text: `Hay ${currency.format(analysis.debtTotal)} pendiente de cobro. Priorizá cobrar antes de financiar más ventas a crédito.`,
    });
  }

  if (analysis.projectedExpenses > analysis.projectedIncome * 0.45 && analysis.projectedExpenses > 0) {
    insights.push({
      level: "warn",
      title: "Gastos pesados",
      text: `Los gastos proyectados consumen una parte alta de los cobros. Revisá alquiler, publicidad, envíos y comisiones.`,
    });
  }

  insights.push({
    level: "info",
    title: "Meta de caja",
    text: `Para cubrir los gastos del período visible, deberías vender al menos ${currency.format(analysis.dailyBreakEvenTarget)} por día durante ${number.format(analysis.projectionDayCount)} días con el margen actual.`,
  });

  return insights;
}

function profitabilityInsights(analysis) {
  const insights = [];
  const lowMarginProducts = state.products.filter((product) => product.price > 0 && (product.price - product.cost) / product.price < 0.2);
  const deadStock = state.products.filter((product) => product.stock > product.minStock && !state.sales.some((sale) => sale.sku === product.sku));

  if (analysis.netProfit < 0) {
    insights.push({
      level: "warn",
      title: "La utilidad neta es negativa",
      text: `Hoy faltan ${currency.format(Math.abs(analysis.netProfit))} para cubrir gastos. Necesitás vender aproximadamente ${currency.format(analysis.breakEvenRevenue)} en el período o reducir gastos.`,
    });
  } else {
    insights.push({
      level: "ok",
      title: "El negocio cubre sus gastos",
      text: `La utilidad neta estimada es ${currency.format(analysis.netProfit)} después de costos de productos y gastos registrados.`,
    });
  }

  if (lowMarginProducts.length) {
    insights.push({
      level: "warn",
      title: "Productos con margen bajo",
      text: `${lowMarginProducts.length} producto(s) tienen margen menor a 20%. Subí precio, bajá costo o evitá venderlos con descuento.`,
    });
  }

  if (deadStock.length) {
    insights.push({
      level: "info",
      title: "Stock sin rotación",
      text: `${deadStock.length} producto(s) tienen stock pero no ventas registradas. Conviene promocionarlos o comprar menos.`,
    });
  }

  insights.push({
    level: "info",
    title: "Cantidad sugerida a vender",
    text: `Con el ticket y margen actuales, el punto de equilibrio equivale a unas ${number.format(analysis.unitsToBreakEven)} unidades en el período visible.`,
  });

  return insights;
}

function buildInsightCards(insights) {
  return insights
    .map((insight) => `
      <article class="insight-card ${escapeHtml(insight.level)}">
        <strong>${escapeHtml(insight.title)}</strong>
        <p>${escapeHtml(insight.text)}</p>
      </article>
    `)
    .join("");
}

function renderProducts() {
  const query = normalize(productSearch.value);
  document.querySelector("#productsTable").innerHTML =
    state.products
      .filter((product) => [product.name, product.supplier].some((value) => normalize(value).includes(query)))
      .map((product) => `
        <tr>
          <td>${escapeHtml(product.name)}</td>
          <td>${number.format(product.stock)}</td>
          <td>${number.format(product.minStock)}</td>
          <td>${currency.format(product.price)}</td>
          <td>${escapeHtml(product.supplier)}</td>
          <td class="actions-cell">
            <button class="table-action" data-action="edit-product" data-sku="${escapeHtml(product.sku)}" type="button">Editar</button>
            <button class="table-action danger-action" data-action="delete-product" data-sku="${escapeHtml(product.sku)}" type="button">Eliminar</button>
          </td>
        </tr>
      `)
      .join("") || `<tr><td class="empty" colspan="6">Todavía no hay productos.</td></tr>`;
}

function renderSales() {
  const query = normalize(movementSearch.value);
  document.querySelector("#salesTable").innerHTML =
    filteredSales()
      .filter((sale) => {
        const product = state.products.find((item) => item.sku === sale.sku);
        return [sale.date, sale.receipt, sale.customer, product?.name].some((value) => normalize(value).includes(query));
      })
      .map((sale) => {
        const product = state.products.find((item) => item.sku === sale.sku);
        const tagLevel = sale.paymentStatus === "Pagada" ? "ok" : sale.paymentStatus === "Pendiente" ? "danger" : "warn";
        return `
          <tr>
            <td>${escapeHtml(sale.date)}</td>
            <td>${escapeHtml(sale.receipt)}</td>
            <td>${escapeHtml(sale.customer)}</td>
            <td>${escapeHtml(product?.name || "Producto eliminado")}</td>
            <td>${number.format(sale.quantity)}</td>
            <td>${currency.format(sale.total)}</td>
            <td>${escapeHtml(sale.paymentMethod)} · <span class="tag ${tagLevel}">${escapeHtml(sale.paymentStatus)}</span></td>
            <td>${currency.format(sale.debt)}</td>
            <td class="actions-cell">
              <button class="table-action" data-action="receipt-sale" data-id="${escapeHtml(sale.id)}" type="button">Recibo</button>
              <button class="table-action" data-action="edit-sale" data-id="${escapeHtml(sale.id)}" type="button">Editar</button>
              <button class="table-action danger-action" data-action="delete-sale" data-id="${escapeHtml(sale.id)}" type="button">Eliminar</button>
            </td>
          </tr>
        `;
      })
      .join("") || `<tr><td class="empty" colspan="9">Todavía no hay ventas registradas.</td></tr>`;
}

function renderPurchases() {
  const query = normalize(movementSearch.value);
  document.querySelector("#purchasesTable").innerHTML =
    filteredPurchases()
      .filter((purchase) => {
        const product = state.products.find((item) => item.sku === purchase.sku);
        return [purchase.date, purchase.order, purchase.note, product?.name].some((value) => normalize(value).includes(query));
      })
      .map((purchase) => {
        const product = state.products.find((item) => item.sku === purchase.sku);
        return `
          <tr>
            <td>${escapeHtml(purchase.date)}</td>
            <td>${escapeHtml(purchase.order)}</td>
            <td>${escapeHtml(product?.name || "Producto eliminado")}</td>
            <td>${number.format(purchase.quantity)}</td>
            <td>${currency.format(purchase.cost)}</td>
            <td><span class="tag ${purchase.status === "Recibida" ? "ok" : purchase.status === "Vencida" ? "danger" : "warn"}">${escapeHtml(purchase.status)}</span></td>
            <td>${escapeHtml(purchase.dueDate || "-")}</td>
            <td>${escapeHtml(purchase.note)}</td>
            <td class="actions-cell">
              <button class="table-action" data-action="edit-purchase" data-id="${escapeHtml(purchase.id)}" type="button">Editar</button>
              <button class="table-action danger-action" data-action="delete-purchase" data-id="${escapeHtml(purchase.id)}" type="button">Eliminar</button>
            </td>
          </tr>
        `;
      })
      .join("") || `<tr><td class="empty" colspan="9">Todavía no hay reposiciones registradas.</td></tr>`;
}

function renderExpenses() {
  const expenses = filteredExpenses();
  document.querySelector("#expenseCount").textContent = `${expenses.length} gastos`;
  document.querySelector("#expensesTable").innerHTML =
    expenses
      .map((expense) => `
        <tr>
          <td>${escapeHtml(expense.date)}</td>
          <td>${escapeHtml(expense.category)}</td>
          <td><span class="tag ${expense.type === "Fijo" ? "warn" : "ok"}">${escapeHtml(expense.type)}</span></td>
          <td>${escapeHtml(expense.description)}</td>
          <td>${currency.format(expense.amount)}</td>
          <td>${escapeHtml(recurrenceLabel(expense))}</td>
          <td class="actions-cell">
            <button class="table-action" data-action="edit-expense" data-id="${escapeHtml(expense.id)}" type="button">Editar</button>
            <button class="table-action danger-action" data-action="delete-expense" data-id="${escapeHtml(expense.id)}" type="button">Eliminar</button>
          </td>
        </tr>
      `)
      .join("") || `<tr><td class="empty" colspan="7">Todavía no hay gastos registrados.</td></tr>`;
}

function renderCashSessions() {
  const sessions = filteredCashSessions();
  document.querySelector("#cashCount").textContent = `${sessions.length} cierres`;
  document.querySelector("#cashTable").innerHTML =
    sessions
      .map((cash) => {
        const summary = getCashSummary(cash.date);
        const expected = cash.opening + summary.income - summary.outcome;
        const difference = cash.closing - expected;
        return `
          <tr>
            <td>${escapeHtml(cash.date)}</td>
            <td>${currency.format(cash.opening)}</td>
            <td>${currency.format(summary.income)}</td>
            <td>${currency.format(summary.outcome)}</td>
            <td>${currency.format(expected)}</td>
            <td>${currency.format(cash.closing)}</td>
            <td><span class="tag ${Math.abs(difference) < 0.01 ? "ok" : "warn"}">${currency.format(difference)}</span></td>
            <td class="actions-cell">
              <button class="table-action" data-action="edit-cash" data-id="${escapeHtml(cash.id)}" type="button">Editar</button>
              <button class="table-action danger-action" data-action="delete-cash" data-id="${escapeHtml(cash.id)}" type="button">Eliminar</button>
            </td>
          </tr>
        `;
      })
      .join("") || `<tr><td class="empty" colspan="8">Todavía no hay cierres de caja.</td></tr>`;
}

function buildSale(input) {
  const product = state.products.find((item) => item.sku === input.sku);
  const unitPrice = product.price * (1 - input.discount / 100);
  const total = unitPrice * input.quantity;
  const cost = product.cost * input.quantity;
  const paymentStatus = input.paymentStatus || "Pagada";
  let paidAmount = Number(input.paidAmount || 0);
  if (paymentStatus === "Pagada" && paidAmount === 0) paidAmount = total;
  if (paymentStatus === "Pendiente") paidAmount = 0;
  if (paymentStatus === "Parcial") paidAmount = Math.min(Math.max(paidAmount, 0), total);
  const debt = Math.max(total - paidAmount, 0);
  return {
    ...input,
    paymentMethod: input.paymentMethod || "Efectivo",
    paymentStatus,
    paidAmount,
    debt,
    unitPrice,
    total,
    cost,
    margin: total - cost,
  };
}

function applySaleStock(sale) {
  const product = state.products.find((item) => item.sku === sale.sku);
  if (product) product.stock -= sale.quantity;
}

function restoreSaleStock(sale) {
  const product = state.products.find((item) => item.sku === sale.sku);
  if (product) product.stock += sale.quantity;
}

function applyPurchaseStock(purchase) {
  const product = state.products.find((item) => item.sku === purchase.sku);
  if (!product) return;
  if (purchase.status !== "Recibida") return;
  product.stock += purchase.quantity;
  product.cost = purchase.cost || product.cost;
}

function restorePurchaseStock(purchase) {
  const product = state.products.find((item) => item.sku === purchase.sku);
  if (product && purchase.status === "Recibida") product.stock -= purchase.quantity;
}

function editSale(id) {
  const sale = state.sales.find((item) => item.id === id);
  if (!sale) return;
  document.querySelector("#saleId").value = sale.id;
  document.querySelector("#saleDate").value = sale.date;
  document.querySelector("#saleReceipt").value = sale.receipt;
  document.querySelector("#saleCustomer").value = sale.customer;
  document.querySelector("#saleSku").value = sale.sku;
  document.querySelector("#saleQuantity").value = sale.quantity;
  document.querySelector("#saleDiscount").value = sale.discount;
  document.querySelector("#salePaymentMethod").value = sale.paymentMethod;
  document.querySelector("#salePaymentStatus").value = sale.paymentStatus;
  document.querySelector("#salePaidAmount").value = sale.paidAmount;
  document.querySelector("#saleDueDate").value = sale.dueDate || "";
  document.querySelector("#saleSubmit").textContent = "Actualizar venta";
  document.querySelector("#cancelSaleEdit").hidden = false;
  showView("venta");
}

function deleteSale(id) {
  const sale = state.sales.find((item) => item.id === id);
  if (!sale || !confirm("¿Eliminar esta venta y devolver el stock?")) return;
  restoreSaleStock(sale);
  state.sales = state.sales.filter((item) => item.id !== id);
  saveState();
  render();
}

function editPurchase(id) {
  const purchase = state.purchases.find((item) => item.id === id);
  if (!purchase) return;
  document.querySelector("#purchaseId").value = purchase.id;
  document.querySelector("#purchaseDate").value = purchase.date;
  document.querySelector("#purchaseOrder").value = purchase.order;
  document.querySelector("#purchaseSku").value = purchase.sku;
  document.querySelector("#purchaseQuantity").value = purchase.quantity;
  document.querySelector("#purchaseCost").value = purchase.cost;
  document.querySelector("#purchaseNote").value = purchase.note;
  document.querySelector("#purchaseSupplier").value = purchase.supplier;
  document.querySelector("#purchaseStatus").value = purchase.status;
  document.querySelector("#purchaseDueDate").value = purchase.dueDate || "";
  document.querySelector("#purchaseSubmit").textContent = "Actualizar reposición";
  document.querySelector("#cancelPurchaseEdit").hidden = false;
  showView("reposicion");
}

function deletePurchase(id) {
  const purchase = state.purchases.find((item) => item.id === id);
  if (!purchase || !confirm("¿Eliminar esta reposición y descontar el stock recibido?")) return;
  restorePurchaseStock(purchase);
  state.purchases = state.purchases.filter((item) => item.id !== id);
  saveState();
  render();
}

function editProduct(sku) {
  const product = state.products.find((item) => item.sku === sku);
  if (!product) return;
  document.querySelector("#editingProductSku").value = product.sku;
  document.querySelector("#productName").value = product.name;
  document.querySelector("#productCost").value = product.cost;
  document.querySelector("#productPrice").value = product.price;
  document.querySelector("#productStock").value = product.stock;
  document.querySelector("#productMin").value = product.minStock;
  document.querySelector("#productIdeal").value = product.idealStock;
  document.querySelector("#productSupplier").value = product.supplier;
  document.querySelector("#productSubmit").textContent = "Actualizar producto";
  document.querySelector("#cancelProductEdit").hidden = false;
  showView("productos");
}

function deleteProduct(sku) {
  const hasMovements = state.sales.some((sale) => sale.sku === sku) || state.purchases.some((purchase) => purchase.sku === sku);
  if (hasMovements) {
    alert("No se puede eliminar un producto con ventas o reposiciones. Editalo o eliminá primero sus movimientos.");
    return;
  }
  if (!confirm("¿Eliminar este producto?")) return;
  state.products = state.products.filter((product) => product.sku !== sku);
  saveState();
  render();
}

function editExpense(id) {
  const expense = state.expenses.find((item) => item.id === id);
  if (!expense) return;
  document.querySelector("#expenseId").value = expense.id;
  document.querySelector("#expenseDate").value = expense.date;
  document.querySelector("#expenseCategory").value = expense.category;
  document.querySelector("#expenseType").value = expense.type;
  document.querySelector("#expenseDescription").value = expense.description;
  document.querySelector("#expenseAmount").value = expense.amount;
  document.querySelector("#expenseRecurrence").value = expense.recurrence || "once";
  document.querySelector("#expenseRecurrenceEnd").value = expense.recurrenceEnd || "";
  document.querySelector("#expensePaymentMethod").value = expense.paymentMethod;
  document.querySelector("#expenseSubmit").textContent = "Actualizar gasto";
  document.querySelector("#cancelExpenseEdit").hidden = false;
  showView("gastos");
}

function deleteExpense(id) {
  const expense = state.expenses.find((item) => item.id === id);
  if (!expense || !confirm("¿Eliminar este gasto?")) return;
  state.expenses = state.expenses.filter((item) => item.id !== id);
  saveState();
  render();
}

function editCash(id) {
  const cash = state.cashSessions.find((item) => item.id === id);
  if (!cash) return;
  document.querySelector("#cashId").value = cash.id;
  document.querySelector("#cashDate").value = cash.date;
  document.querySelector("#cashOpening").value = cash.opening;
  document.querySelector("#cashClosing").value = cash.closing;
  document.querySelector("#cashNote").value = cash.note;
  document.querySelector("#cashSubmit").textContent = "Actualizar cierre";
  document.querySelector("#cancelCashEdit").hidden = false;
  showView("caja");
}

function deleteCash(id) {
  const cash = state.cashSessions.find((item) => item.id === id);
  if (!cash || !confirm("¿Eliminar este cierre de caja?")) return;
  state.cashSessions = state.cashSessions.filter((item) => item.id !== id);
  saveState();
  render();
}

function resetSaleForm() {
  saleForm.reset();
  document.querySelector("#saleId").value = "";
  document.querySelector("#saleSubmit").textContent = "Guardar venta";
  document.querySelector("#cancelSaleEdit").hidden = true;
  saleDate.valueAsDate = new Date();
}

function resetPurchaseForm() {
  purchaseForm.reset();
  document.querySelector("#purchaseId").value = "";
  document.querySelector("#purchaseSubmit").textContent = "Guardar reposición";
  document.querySelector("#cancelPurchaseEdit").hidden = true;
  purchaseDate.valueAsDate = new Date();
}

function resetProductForm() {
  productForm.reset();
  document.querySelector("#editingProductSku").value = "";
  document.querySelector("#productSubmit").textContent = "Guardar producto";
  document.querySelector("#cancelProductEdit").hidden = true;
}

function resetExpenseForm() {
  expenseForm.reset();
  document.querySelector("#expenseId").value = "";
  document.querySelector("#expenseSubmit").textContent = "Guardar gasto";
  document.querySelector("#cancelExpenseEdit").hidden = true;
  expenseDate.valueAsDate = new Date();
}

function resetCashForm() {
  cashForm.reset();
  document.querySelector("#cashId").value = "";
  document.querySelector("#cashSubmit").textContent = "Guardar cierre";
  document.querySelector("#cancelCashEdit").hidden = true;
  cashDate.valueAsDate = new Date();
}

function getAlerts() {
  return state.products
    .map((product) => {
      let priority = "";
      if (product.stock <= 0) priority = "Sin stock";
      else if (product.stock <= product.minStock) priority = "Reposición urgente";
      else if (product.stock <= product.minStock * 1.5) priority = "Vigilar";
      if (!priority) return null;
      return {
        ...product,
        priority,
        buyQuantity: Math.max(product.idealStock - product.stock, 0),
        status: priority === "Vigilar" ? "Monitorear" : "Comprar ahora",
      };
    })
    .filter(Boolean)
    .sort((a, b) => priorityScore(a.priority) - priorityScore(b.priority));
}

function priorityScore(priority) {
  return { "Sin stock": 0, "Reposición urgente": 1, Vigilar: 2 }[priority] ?? 3;
}

function filteredSales() {
  return state.sales.filter((sale) => isInDateRange(sale.date));
}

function filteredPurchases() {
  return state.purchases.filter((purchase) => isInDateRange(purchase.date));
}

function filteredExpenses() {
  if (!filterFrom.value && !filterTo.value) return state.expenses;
  return expandExpensesInRange(state.expenses, filterFrom.value, filterTo.value);
}

function filteredCashSessions() {
  return state.cashSessions.filter((cash) => isInDateRange(cash.date));
}

function isInDateRange(date) {
  if (filterFrom.value && date < filterFrom.value) return false;
  if (filterTo.value && date > filterTo.value) return false;
  return true;
}

function isInCustomDateRange(date, from, to) {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function customFilteredExpenses(from, to) {
  if (!from && !to) return state.expenses;
  return expandExpensesInRange(state.expenses, from, to);
}

function expandExpensesInRange(expenses, from, to) {
  const fallbackFrom = from || earliestDate(expenses.map((expense) => expense.date)) || todayIso();
  const fallbackTo = to || todayIso();
  return expenses.flatMap((expense) => expandExpenseOccurrences(expense, fallbackFrom, fallbackTo));
}

function expandExpenseOccurrences(expense, from, to) {
  if (!expense.date || expense.date > to) return [];
  if (expense.recurrence === "once" || !expense.recurrence) {
    return isInCustomDateRange(expense.date, from, to) ? [expense] : [];
  }

  const occurrences = [];
  let currentDate = expense.date;
  const endDate = expense.recurrenceEnd && expense.recurrenceEnd < to ? expense.recurrenceEnd : to;

  while (currentDate <= endDate) {
    if (currentDate >= from) {
      occurrences.push({ ...expense, date: currentDate, sourceDate: expense.date, occurrence: true });
    }
    currentDate = nextExpenseDate(currentDate, expense.recurrence);
    if (!currentDate) break;
  }

  return occurrences;
}

function nextExpenseDate(date, recurrence) {
  if (recurrence === "weekly") return addDays(date, 7);
  if (recurrence === "monthly") return addMonths(date, 1);
  if (recurrence === "quarterly") return addMonths(date, 3);
  if (recurrence === "yearly") return addMonths(date, 12);
  return "";
}

function addDays(date, days) {
  const next = parseLocalDate(date);
  next.setDate(next.getDate() + days);
  return toIsoDate(next);
}

function addMonths(date, months) {
  const original = parseLocalDate(date);
  const day = original.getDate();
  const next = new Date(original.getFullYear(), original.getMonth() + months, 1);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
  return toIsoDate(next);
}

function parseLocalDate(date) {
  const [year, month, day] = String(date).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function todayIso() {
  return toIsoDate(new Date());
}

function earliestDate(dates) {
  return dates.filter(Boolean).sort()[0] || "";
}

function recurrenceLabel(expense) {
  const labels = {
    once: "Una sola vez",
    weekly: "Semanal",
    monthly: "Mensual",
    quarterly: "Trimestral",
    yearly: "Anual",
  };
  const label = labels[expense.recurrence || "once"] || "Una sola vez";
  return expense.recurrenceEnd ? `${label} hasta ${expense.recurrenceEnd}` : label;
}

function summarizeCustomers(sales) {
  return [...sales.reduce((map, sale) => {
    const name = sale.customer || "Sin cliente";
    const current = map.get(name) || { name, count: 0, total: 0 };
    current.count += 1;
    current.total += sale.total;
    map.set(name, current);
    return map;
  }, new Map()).values()].sort((a, b) => b.total - a.total);
}

function summarizePaymentMethods(sales) {
  return [...sales.reduce((map, sale) => {
    const name = sale.paymentMethod || "Sin método";
    const current = map.get(name) || { name, count: 0, total: 0 };
    current.count += 1;
    current.total += sale.paidAmount;
    map.set(name, current);
    return map;
  }, new Map()).values()].sort((a, b) => b.total - a.total);
}

function summarizeDebts(sales) {
  return [...sales.reduce((map, sale) => {
    if (sale.debt <= 0) return map;
    const customer = sale.customer || "Sin cliente";
    const current = map.get(customer) || { customer, total: 0, salesTotal: 0, since: sale.date };
    current.total += sale.debt;
    current.salesTotal += sale.total;
    if (sale.date < current.since) current.since = sale.date;
    map.set(customer, current);
    return map;
  }, new Map()).values()].sort((a, b) => b.total - a.total);
}

function getProjectionDays() {
  return Math.min(Math.max(Number(projectionDays.value || 30), 7), 365);
}

function summarizeCashByDay(sales, expenses, purchases) {
  const map = new Map();

  sales.forEach((sale) => {
    const current = map.get(sale.date) || emptyCashDay(sale.date);
    current.sales += sale.total;
    current.collected += sale.paidAmount;
    map.set(sale.date, current);
  });

  expenses.forEach((expense) => {
    const current = map.get(expense.date) || emptyCashDay(expense.date);
    current.outcome += expense.amount;
    map.set(expense.date, current);
  });

  purchases.forEach((purchase) => {
    const current = map.get(purchase.date) || emptyCashDay(purchase.date);
    current.outcome += purchase.quantity * purchase.cost;
    map.set(purchase.date, current);
  });

  return [...map.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map((item) => ({ ...item, label: item.date.slice(5) }));
}

function emptyCashDay(date) {
  return { date, label: date, sales: 0, collected: 0, outcome: 0 };
}

function countActiveDays(items) {
  const dates = new Set(items.map((item) => item.date).filter(Boolean));
  return dates.size;
}

function averageProductMarginRate() {
  const productsWithPrice = state.products.filter((product) => product.price > 0);
  if (!productsWithPrice.length) return 0;
  return productsWithPrice.reduce((sum, product) => sum + (product.price - product.cost) / product.price, 0) / productsWithPrice.length;
}

function estimateUnitsToBreakEven(breakEvenRevenue) {
  const totalUnits = state.sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const totalRevenue = state.sales.reduce((sum, sale) => sum + sale.total, 0);
  const averageTicketUnit = totalUnits > 0 ? totalRevenue / totalUnits : averageProductPrice();
  if (!averageTicketUnit) return 0;
  return Math.ceil(breakEvenRevenue / averageTicketUnit);
}

function averageProductPrice() {
  if (!state.products.length) return 0;
  return state.products.reduce((sum, product) => sum + product.price, 0) / state.products.length;
}

function shortLabel(value) {
  const text = String(value || "");
  return text.length > 12 ? `${text.slice(0, 11)}…` : text;
}

function getCashSummary(date) {
  const income = state.sales
    .filter((sale) => sale.date === date)
    .reduce((sum, sale) => sum + sale.paidAmount, 0);
  const expenses = expandExpensesInRange(state.expenses, date, date)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const purchases = state.purchases
    .filter((purchase) => purchase.date === date)
    .reduce((sum, purchase) => sum + purchase.quantity * purchase.cost, 0);
  return { income, outcome: expenses + purchases };
}

function normalizeSale(sale) {
  const total = Number(sale.total || 0);
  const paymentStatus = sale.paymentStatus || "Pagada";
  let paidAmount = Number(sale.paidAmount ?? (paymentStatus === "Pagada" ? total : 0));
  if (paymentStatus === "Pendiente") paidAmount = 0;
  if (paymentStatus === "Pagada" && paidAmount === 0) paidAmount = total;
  paidAmount = Math.min(Math.max(paidAmount, 0), total);
  return {
    ...sale,
    id: sale.id || makeId(),
    paymentMethod: sale.paymentMethod || "Efectivo",
    paymentStatus,
    paidAmount,
    dueDate: sale.dueDate || "",
    debt: Math.max(total - paidAmount, 0),
  };
}

function showReceipt(id) {
  const sale = state.sales.find((item) => item.id === id);
  if (!sale) return;
  const product = state.products.find((item) => item.sku === sale.sku);
  selectedReceiptId = id;
  document.querySelector("#receiptPanel").hidden = false;
  document.querySelector("#receiptContent").innerHTML = receiptHtml(sale, product);
  document.querySelector("#receiptPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function receiptHtml(sale, product) {
  return `
    <article class="receipt-card">
      <h3>Comprobante ${escapeHtml(sale.receipt)}</h3>
      <div class="receipt-row"><span>Fecha</span><strong>${escapeHtml(sale.date)}</strong></div>
      <div class="receipt-row"><span>Cliente</span><strong>${escapeHtml(sale.customer)}</strong></div>
      <div class="receipt-row"><span>Producto</span><strong>${escapeHtml(product?.name || "Producto eliminado")}</strong></div>
      <div class="receipt-row"><span>Cantidad</span><strong>${number.format(sale.quantity)}</strong></div>
      <div class="receipt-row"><span>Precio unitario</span><strong>${currency.format(sale.unitPrice)}</strong></div>
      <div class="receipt-row"><span>Descuento</span><strong>${number.format(sale.discount)}%</strong></div>
      <div class="receipt-row"><span>Método de pago</span><strong>${escapeHtml(sale.paymentMethod)}</strong></div>
      <div class="receipt-row"><span>Estado</span><strong>${escapeHtml(sale.paymentStatus)}</strong></div>
      <div class="receipt-row"><span>Cobrado</span><strong>${currency.format(sale.paidAmount)}</strong></div>
      <div class="receipt-row"><span>Saldo pendiente</span><strong>${currency.format(sale.debt)}</strong></div>
      <div class="receipt-row receipt-total"><span>Total</span><strong>${currency.format(sale.total)}</strong></div>
    </article>
  `;
}

function printReceipt() {
  const sale = state.sales.find((item) => item.id === selectedReceiptId);
  if (!sale) return;
  document.body.classList.add("printing-receipt");
  window.print();
  setTimeout(() => document.body.classList.remove("printing-receipt"), 300);
}

function exportExcel() {
  const type = excelType.value;
  const from = excelFrom.value;
  const to = excelTo.value;
  const periodLabel = buildPeriodLabel(from, to);
  const datasets = buildExcelDatasets(type, from, to);
  const workbook = buildExcelWorkbook(datasets);
  const filename = `${excelTitle(type)} ${periodLabel}.xls`.replace(/[/:]/g, "-");
  const url = createDownloadUrl(workbook, "application/vnd.ms-excel;charset=utf-8");
  exportResult.hidden = false;
  exportResult.innerHTML = `
    <strong>Excel listo:</strong>
    <a class="download-link" href="${url}" download="${escapeHtml(filename)}">Descargar ${escapeHtml(filename)}</a>
  `;
}

function buildExcelDatasets(type, from, to) {
  const sales = state.sales.filter((sale) => isInCustomDateRange(sale.date, from, to));
  const purchases = state.purchases.filter((purchase) => isInCustomDateRange(purchase.date, from, to));
  const expenses = customFilteredExpenses(from, to);
  const cashSessions = state.cashSessions.filter((cash) => isInCustomDateRange(cash.date, from, to));
  const inventoryRows = state.products.map((product) => ({
    Producto: product.name,
    Stock: product.stock,
    Minimo: product.minStock,
    Ideal: product.idealStock,
    Costo: product.cost,
    Precio: product.price,
    Proveedor: product.supplier,
  }));
  const salesRows = sales.map((sale) => {
    const product = state.products.find((item) => item.sku === sale.sku);
    return {
      Fecha: sale.date,
      Comprobante: sale.receipt,
      Cliente: sale.customer,
      Producto: product?.name || "Producto eliminado",
      Cantidad: sale.quantity,
      "Precio unitario": sale.unitPrice,
      Total: sale.total,
      "Metodo de pago": sale.paymentMethod,
      "Estado de pago": sale.paymentStatus,
      Cobrado: sale.paidAmount,
      Deuda: sale.debt,
      Vencimiento: sale.dueDate,
      "Ganancia bruta": sale.margin,
    };
  });
  const purchaseRows = purchases.map((purchase) => {
    const product = state.products.find((item) => item.sku === purchase.sku);
    return {
      Fecha: purchase.date,
      Orden: purchase.order,
      Producto: product?.name || "Producto eliminado",
      Cantidad: purchase.quantity,
      "Costo unitario": purchase.cost,
      Total: purchase.quantity * purchase.cost,
      Proveedor: purchase.supplier,
      Estado: purchase.status,
      Vencimiento: purchase.dueDate,
      Nota: purchase.note,
    };
  });
  const expenseRows = expenses.map((expense) => ({
    Fecha: expense.date,
    Categoria: expense.category,
    Tipo: expense.type,
    Descripcion: expense.description,
    Monto: expense.amount,
    Frecuencia: recurrenceLabel(expense),
    "Fecha original": expense.sourceDate || expense.date,
    "Metodo de pago": expense.paymentMethod,
  }));
  const cashRows = cashSessions.map((cash) => {
    const summary = getCashSummary(cash.date);
    const expected = cash.opening + summary.income - summary.outcome;
    return {
      Fecha: cash.date,
      Apertura: cash.opening,
      Ingresos: summary.income,
      Egresos: summary.outcome,
      "Cierre esperado": expected,
      "Cierre real": cash.closing,
      Diferencia: cash.closing - expected,
      Nota: cash.note,
    };
  });
  const customerRows = summarizeCustomers(sales).map((customer) => ({
    Cliente: customer.name,
    Compras: customer.count,
    Total: customer.total,
  }));
  const debtRows = summarizeDebts(sales).map((debt) => ({
    Cliente: debt.customer,
    Deuda: debt.total,
    Desde: debt.since,
  }));
  const summaryRows = [{
    Ventas: sales.reduce((sum, sale) => sum + sale.total, 0),
    "Ganancia bruta": sales.reduce((sum, sale) => sum + sale.margin, 0),
    Gastos: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    "Utilidad neta": sales.reduce((sum, sale) => sum + sale.margin, 0) - expenses.reduce((sum, expense) => sum + expense.amount, 0),
    "Cuentas por cobrar": sales.reduce((sum, sale) => sum + sale.debt, 0),
  }];

  const datasets = {
    inventory: [{ name: "Inventario", rows: inventoryRows }],
    sales: [{ name: "Ventas", rows: salesRows }],
    purchases: [{ name: "Reposiciones", rows: purchaseRows }],
    expenses: [{ name: "Gastos", rows: expenseRows }],
    cash: [{ name: "Caja", rows: cashRows }],
    summary: [
      { name: "Resumen", rows: summaryRows },
      { name: "Inventario", rows: inventoryRows },
      { name: "Ventas", rows: salesRows },
      { name: "Reposiciones", rows: purchaseRows },
      { name: "Gastos", rows: expenseRows },
      { name: "Caja", rows: cashRows },
      { name: "Clientes", rows: customerRows },
      { name: "Deudas", rows: debtRows },
    ],
  };

  return datasets[type] || datasets.summary;
}

function buildExcelWorkbook(datasets) {
  const worksheets = datasets.map((dataset) => `
    <Worksheet ss:Name="${escapeXml(dataset.name)}">
      <Table>${buildExcelTable(dataset.rows)}</Table>
    </Worksheet>
  `).join("");
  return `<?xml version="1.0"?>
    <?mso-application progid="Excel.Sheet"?>
    <Workbook
      xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
      <Styles>
        <Style ss:ID="header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#176B5B" ss:Pattern="Solid"/></Style>
      </Styles>
      ${worksheets}
    </Workbook>`;
}

function buildExcelTable(rows) {
  if (!rows.length) return `<Row><Cell><Data ss:Type="String">Sin datos para el período seleccionado.</Data></Cell></Row>`;
  const headers = Object.keys(rows[0]);
  return `
    <Row>${headers.map((header) => `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`).join("")}</Row>
    ${rows.map((row) => `<Row>${headers.map((header) => excelCell(row[header])).join("")}</Row>`).join("")}
  `;
}

function excelCell(value) {
  const type = typeof value === "number" && Number.isFinite(value) ? "Number" : "String";
  return `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
}

function excelTitle(type) {
  return { inventory: "Inventario", sales: "Ventas", purchases: "Reposiciones", expenses: "Gastos", cash: "Caja", summary: "Resumen" }[type] || "Exportacion";
}

function buildPeriodLabel(from, to) {
  if (from && to) return `${from} a ${to}`;
  if (from) return `desde ${from}`;
  if (to) return `hasta ${to}`;
  return new Date().toISOString().slice(0, 10);
}

function downloadText(filename, text, type) {
  const link = document.createElement("a");
  link.href = createDownloadUrl(text, type);
  link.download = filename;
  link.click();
}

function createDownloadUrl(text, type) {
  const blob = new Blob([text], { type });
  return URL.createObjectURL(blob);
}

function normalize(value) {
  return String(value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function makeProductCode() {
  return `P-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`.toUpperCase();
}

function showSaleResult(message, level) {
  saleResult.hidden = false;
  saleResult.innerHTML = `<strong>${escapeHtml(message)}</strong>`;
  saleResult.style.borderLeftColor = level === "danger" ? "var(--danger)" : level === "warn" ? "var(--warn)" : "var(--ok)";
}

function showPurchaseResult(message, level) {
  purchaseResult.hidden = false;
  purchaseResult.innerHTML = `<strong>${escapeHtml(message)}</strong>`;
  purchaseResult.style.borderLeftColor = level === "danger" ? "var(--danger)" : "var(--ok)";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

initApp();
