const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxfncClK-pqEab5OOB_fTmxbt6m38J0F7at71a2Sr5A9l5STjBBd8R5iZ2Qgq9-bXvS/exec"; 

let currentUser = null;
let globalSystemConfig = {};
let autoReferredCode = "";
let masterHistoryRecords = []; 

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if(urlParams.has('ref')) autoReferredCode = urlParams.get('ref').trim();
  setTimeout(() => {
    document.getElementById('intro-screen').classList.remove('active');
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('login-screen').classList.add('active');
  }, 2000);
});

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function showDashboard() { showScreen('dashboard-screen'); }
function toggleFetchOverlay(show) { if(show) document.getElementById('global-app-fetch-loader').classList.remove('hidden'); else document.getElementById('global-app-fetch-loader').classList.add('hidden'); }

function parseToSafeTimestamp(dateInput) {
  if (!dateInput) return 0;
  let nativeDateObj = new Date(dateInput);
  return isNaN(nativeDateObj.getTime()) ? 0 : nativeDateObj.getTime();
}

function formatCustomDateTime(dateInput) {
  if (!dateInput) return "";
  let dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) return dateInput;
  try {
    const dtf = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    const p = dtf.formatToParts(dateObj).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
    return `${p.day}-${p.month}-${p.year} | ${p.hour}:${p.minute} ${p.dayPeriod || 'AM'}`;
  } catch(e) { return dateInput; }
}

function resolveTransactionIDValue(log) {
  if (!log) return "N/A";
  let val = log.txId || log.transactionId || log.utr || log.reference || "N/A";
  return String(val).trim();
}

async function callBackendAPI(payload) {
  const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', mode: 'cors', body: JSON.stringify(payload) });
  return await response.json();
}

// Logic: Pending upar, Success niche, Latest date upar
function sortHistoryRecords(records) {
  return [...records].sort((a, b) => {
    let statusA = (a.status || "").toLowerCase() === "pending" ? 0 : 1;
    let statusB = (b.status || "").toLowerCase() === "pending" ? 0 : 1;
    if (statusA !== statusB) return statusA - statusB;
    return parseToSafeTimestamp(b.date) - parseToSafeTimestamp(a.date);
  });
}

async function handleLoginSubmit() {
  const mobile = document.getElementById('login-mobile').value.trim();
  if(mobile.length !== 10) { alert("Invalid number."); return; }
  setLoading('login-btn', true, "Verify & Proceed");
  try {
    let res = await callBackendAPI({ action: "checkLogin", mobile: mobile });
    setLoading('login-btn', false, "Verify & Proceed");
    if(res && res.exists) { currentUser = { id: res.userId, name: res.name, mobile: mobile }; loadDashboardLifecycle(); } 
    else openRegistrationPopup(mobile);
  } catch(e) { setLoading('login-btn', false, "Verify & Proceed"); alert("Error."); }
}

function openRegistrationPopup(mobile) {
  const modal = document.getElementById('global-modal');
  modal.innerHTML = `<div class="modal-card"><h3>Register</h3><input type="text" id="reg-name" class="form-control" placeholder="Full Name"><button onclick="submitRegistration('${mobile}')" class="btn">Submit</button></div>`;
  modal.classList.add('active');
}

async function submitRegistration(mobile) {
  const name = document.getElementById('reg-name').value.trim();
  if(!name) return alert("Required");
  document.getElementById('global-modal').classList.remove('active');
  let res = await callBackendAPI({ action: "registerUser", name: name, mobile: mobile });
  if(res.success) { currentUser = { id: res.userId, name: res.name, mobile: mobile }; loadDashboardLifecycle(); }
}

function closeModalAndGoDashboard() { document.getElementById('global-modal').classList.remove('active'); loadDashboardLifecycle(); }

async function loadDashboardLifecycle() {
  showScreen('dashboard-screen');
  document.getElementById('user-display-id').innerText = `${currentUser.id} - ${currentUser.name}`;
  toggleFetchOverlay(true);
  try {
    let res = await callBackendAPI({ action: "getDashboardData", userId: currentUser.id });
    toggleFetchOverlay(false);
    if(res && res.success) {
      globalSystemConfig = res;
      document.getElementById('total-fund-display').innerText = "₹" + Number(res.totalFund || 0).toLocaleString('en-IN');
      masterHistoryRecords = sortHistoryRecords(res.history || []);
      renderDashboardTransactionRows(masterHistoryRecords);
    }
  } catch (e) { toggleFetchOverlay(false); }
}

function renderDashboardTransactionRows(records) {
  const container = document.getElementById('dashboard-history-log-container');
  const viewMoreBtn = document.getElementById('view-more-tx-btn');
  container.innerHTML = "";
  records.slice(0, 4).forEach(log => {
    let isProvide = log.type === "Provide Help";
    container.innerHTML += `<div class="log-item ${isProvide ? 'provide' : 'get'}"><div><div>${log.type}</div><p>${log.name}</p></div><div class="log-amount"><div>₹${Math.abs(log.amount)}</div><span class="${log.status === 'Success' ? 'status-success' : 'status-pending'}">${log.status}</span></div></div>`;
  });
  viewMoreBtn.classList.toggle('hidden', records.length <= 4);
}

function openAllTransactionsScreen() {
  showScreen('all-transactions-screen');
  renderFullTransactionRows(masterHistoryRecords);
}

function renderFullTransactionRows(records) {
  const container = document.getElementById('full-history-log-container');
  container.innerHTML = "";
  records.forEach(log => {
    let isProvide = log.type === "Provide Help";
    container.innerHTML += `<div class="log-item ${isProvide ? 'provide' : 'get'}"><div><div>${log.type}</div><p>${log.name}</p></div><div class="log-amount"><div>₹${Math.abs(log.amount)}</div><span class="${log.status === 'Success' ? 'status-success' : 'status-pending'}">${log.status}</span></div></div>`;
  });
}

function filterTransactionHistory() {
  const searchVal = document.getElementById('tx-search-box').value.toLowerCase().trim();
  const filtered = masterHistoryRecords.filter(log => log.name.toLowerCase().includes(searchVal) || resolveTransactionIDValue(log).toLowerCase().includes(searchVal));
  renderFullTransactionRows(filtered);
}

function openProvideHelp() { showScreen('provide-help-screen'); }

function triggerUPIPayment() {
  const amt = document.getElementById('p-amount').value.trim();
  const app = document.getElementById('p-method').value;
  window.location.href = `${app.toLowerCase()}://pay?pa=${globalSystemConfig.upiId}&am=${amt}`;
  setTimeout(() => document.getElementById('utr-section').classList.remove('hidden'), 1000);
}

function openGetHelp() { showScreen('get-help-screen'); }

function toggleGetHelpFields() {
  const mode = document.getElementById('g-method').value;
  document.getElementById('g-upi-fields').classList.toggle('hidden', mode !== 'UPI');
  document.getElementById('g-bank-fields').classList.toggle('hidden', mode !== 'Bank');
}

function shareReferralLink() {
  const link = `${window.location.href.split('?')[0]}?ref=${currentUser.id}`;
  navigator.clipboard.writeText(link);
  alert("Referral link copied!");
}

function setLoading(btnId, isLoad, defaultText) {
  const btn = document.getElementById(btnId);
  if(btn) { btn.disabled = isLoad; btn.innerHTML = isLoad ? `<span class="loader"></span>` : defaultText; }
}

function logout() { currentUser = null; showScreen('login-screen'); }
