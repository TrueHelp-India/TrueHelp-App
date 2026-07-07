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
function toggleFetchOverlay(show) { document.getElementById('global-app-fetch-loader').classList.toggle('hidden', !show); }

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
  let val = log.txId || log.transactionId || log.txnId || log.utr || log.reference || "N/A";
  return String(val).trim();
}

async function callBackendAPI(payload) {
  const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', mode: 'cors', body: JSON.stringify(payload) });
  return await response.json();
}

// Updated Sorting Logic: Pending/New sabse uper
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
  if(mobile.length !== 10 || isNaN(mobile)) { alert("Please enter a valid 10-digit Indian Mobile Number."); return; }
  setLoading('login-btn', true, "Verify & Proceed");
  try {
    let res = await callBackendAPI({ action: "checkLogin", mobile: mobile });
    setLoading('login-btn', false, "Verify & Proceed");
    if(res && res.exists) { currentUser = { id: res.userId, name: res.name, mobile: mobile }; loadDashboardLifecycle(); } 
    else { openRegistrationPopup(mobile); }
  } catch(e) { setLoading('login-btn', false, "Verify & Proceed"); alert("Network Error. Please try again."); }
}

function openRegistrationPopup(mobile) {
  const modal = document.getElementById('global-modal');
  document.getElementById('modal-content-area').innerHTML = `
    <h3 style="color:var(--primary); font-size:18px;">Number Not Registered</h3>
    <p style="font-size:13px; color:var(--text-muted); margin: 8px 0 20px;">You are not a registered member yet. Fill parameters to continue.</p>
    <div class="form-group" style="text-align:left;">
      <label>Full Name</label>
      <input type="text" id="reg-name" class="form-control" placeholder="Enter Full Name">
    </div>
    <div class="form-group" style="text-align:left;">
      <label>Referral Code (Optional)</label>
      <input type="text" id="reg-ref" class="form-control" placeholder="e.g. TH4839" value="${autoReferredCode}">
    </div>
    <button onclick="submitRegistration('${mobile}')" class="btn btn-secondary">Create Account & Enter</button>
  `;
  modal.classList.add('active');
}

async function submitRegistration(mobile) {
  const name = document.getElementById('reg-name').value.trim();
  const referral = document.getElementById('reg-ref').value.trim();
  if(!name) { alert("Name field is mandatory."); return; }
  document.getElementById('global-modal').classList.remove('active');
  setLoading('login-btn', true, "Verify & Proceed");
  let res = await callBackendAPI({ action: "registerUser", name: name, mobile: mobile, referral: referral });
  setLoading('login-btn', false, "Verify & Proceed");
  if(res && res.success) {
    currentUser = { id: res.userId, name: res.name, mobile: mobile };
    document.getElementById('modal-content-area').innerHTML = `
      <div class="modal-icon"><i class="fa-solid fa-circle-check"></i></div>
      <h2 style="color:var(--primary);">Welcome to TrueHelp</h2>
      <button onclick="closeModalAndGoDashboard()" class="btn">Go To Dashboard</button>
    `;
    document.getElementById('global-modal').classList.add('active');
  } else { alert(res.error || "Registration failed."); }
}

function closeModalAndGoDashboard() { document.getElementById('global-modal').classList.remove('active'); loadDashboardLifecycle(); }

async function loadDashboardLifecycle() {
  showScreen('dashboard-screen');
  document.getElementById('user-display-id').innerText = `${currentUser.id} - ${currentUser.name}`;
  document.getElementById('user-ref-code-text').innerText = currentUser.id;
  toggleFetchOverlay(true);
  try {
    let res = await callBackendAPI({ action: "getDashboardData", userId: currentUser.id });
    toggleFetchOverlay(false);
    if(res && res.success) {
      globalSystemConfig = res;
      document.getElementById('total-fund-display').innerText = "₹" + Number(res.totalFund || 0).toLocaleString('en-IN', {minimumFractionDigits: 2});
      masterHistoryRecords = sortHistoryRecords(res.history || []);
      renderDashboardTransactionRows(masterHistoryRecords);
      if(res.notification && res.notification.trim() !== "") triggerGlobalNotification(res.notification);
    }
  } catch (e) { toggleFetchOverlay(false); alert("Error loading dashboard data."); }
}

function renderDashboardTransactionRows(records) {
  const container = document.getElementById('dashboard-history-log-container');
  const viewMoreBtn = document.getElementById('view-more-tx-btn');
  container.innerHTML = "";
  if(!records || records.length === 0) { container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;">No history records found.</div>`; viewMoreBtn.classList.add('hidden'); return; }
  records.slice(0, 4).forEach(log => {
    let isProvide = log.type === "Provide Help";
    container.innerHTML += `
      <div class="log-item ${isProvide ? 'provide' : 'get'}">
        <div class="log-details">
          <div>${log.type}</div>
          <p><i class="fa-solid fa-user-circle"></i> ${log.name}</p>
          <span>Txn ID: ${resolveTransactionIDValue(log)}</span>
          <span style="font-size: 11px; color: var(--text-muted); margin-top: 2px;"><i class="fa-solid fa-calendar-alt"></i> ${formatCustomDateTime(log.date)}</span>
        </div>
        <div class="log-amount">
          <div style="color:${isProvide?'var(--secondary)':'#EF4444'}">₹${Math.abs(log.amount || 0).toLocaleString('en-IN')}</div>
          <span class="${log.status === 'Success' ? 'status-success' : 'status-pending'}">${log.status}</span>
        </div>
      </div>
    `;
  });
  viewMoreBtn.classList.toggle('hidden', records.length <= 4);
}

function renderFullTransactionRows(records) {
  const container = document.getElementById('full-history-log-container');
  container.innerHTML = "";
  records.forEach(log => {
    let isProvide = log.type === "Provide Help";
    container.innerHTML += `
      <div class="log-item ${isProvide ? 'provide' : 'get'}">
        <div class="log-details">
          <div>${log.type}</div>
          <p><i class="fa-solid fa-user-circle"></i> ${log.name}</p>
          <span>Txn ID: ${resolveTransactionIDValue(log)}</span>
          <span style="font-size: 11px; color: var(--text-muted); margin-top: 2px;"><i class="fa-solid fa-calendar-alt"></i> ${formatCustomDateTime(log.date)}</span>
        </div>
        <div class="log-amount">
          <div style="color:${isProvide?'var(--secondary)':'#EF4444'}">₹${Math.abs(log.amount || 0).toLocaleString('en-IN')}</div>
          <span class="${log.status === 'Success' ? 'status-success' : 'status-pending'}">${log.status}</span>
        </div>
      </div>
    `;
  });
}

function openAllTransactionsScreen() { showScreen('all-transactions-screen'); renderFullTransactionRows(masterHistoryRecords); }

function filterTransactionHistory() {
  const searchVal = document.getElementById('tx-search-box').value.toLowerCase().trim();
  const filtered = masterHistoryRecords.filter(log => log.name.toLowerCase().includes(searchVal) || resolveTransactionIDValue(log).toLowerCase().includes(searchVal));
  renderFullTransactionRows(filtered);
}

function openProvideHelp() { showScreen('provide-help-screen'); }

function triggerUPIPayment() {
  const amt = document.getElementById('p-amount').value.trim();
  const app = document.getElementById('p-method').value;
  window.location.href = `${app.toLowerCase()}://pay?pa=${globalSystemConfig.upiId}&am=${amt}&cu=INR&pn=TrueHelp`;
  setTimeout(() => document.getElementById('utr-section').classList.remove('hidden'), 1000);
}

async function submitProvideHelpFinal() {
  const utr = document.getElementById('p-utr').value.trim();
  if(utr.length < 6) return alert("Valid UTR required.");
  setLoading('p-submit-btn', true, "SUBMIT");
  let res = await callBackendAPI({ action: "submitProvideHelp", userId: currentUser.id, amount: document.getElementById('p-amount').value, utr: utr });
  setLoading('p-submit-btn', false, "Submit");
  if(res.success) closeModalAndGoDashboard();
}

function openGetHelp() { showScreen('get-help-screen'); }
function toggleGetHelpFields() {
  const mode = document.getElementById('g-method').value;
  document.getElementById('g-upi-fields').classList.toggle('hidden', mode !== 'UPI');
  document.getElementById('g-bank-fields').classList.toggle('hidden', mode !== 'Bank');
}

async function submitGetHelpRequest() {
  setLoading('g-submit-btn', true, "Submit Request to Admin");
  let res = await callBackendAPI({ action: "submitGetHelp", userId: currentUser.id, amount: document.getElementById('g-amount').value, reason: document.getElementById('g-reason').value });
  setLoading('g-submit-btn', false, "Submit Request to Admin");
  if(res.success) closeModalAndGoDashboard();
}

function openReferralPanel() {
  showScreen('referral-screen');
  document.getElementById('ref-count-display').innerText = globalSystemConfig.totalReferrals || 0;
  const container = document.getElementById('refer-history-container');
  container.innerHTML = "";
  (globalSystemConfig.referHistory || []).forEach(r => {
    container.innerHTML += `<div class="log-item"><div><strong>${r.name}</strong><br><small>ID: ${r.uid}</small></div><div>${formatCustomDateTime(r.date)}</div></div>`;
  });
}

function shareReferralLink() {
  const link = `${window.location.href.split('?')[0]}?ref=${currentUser.id}`;
  navigator.clipboard.writeText(link);
  alert("Referral link copied!");
}

function triggerGlobalNotification(text) {
  document.getElementById('modal-content-area').innerHTML = `<h3>Announcement</h3><p>${text}</p><button onclick="document.getElementById('global-modal').classList.remove('active')" class="btn">Okay</button>`;
  document.getElementById('global-modal').classList.add('active');
}

function logout() { currentUser = null; showScreen('login-screen'); }
