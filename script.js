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
  if (dateInput instanceof Date) return dateInput.getTime();
  if (typeof dateInput === 'string') {
    let clean = dateInput.replace(/\|/g, '').trim();
    if (clean.includes('/') && clean.includes(' ')) {
      let parts = clean.split(' ');
      let dateParts = parts[0].split('/');
      let timeParts = parts[1].split(':');
      if (dateParts.length === 3) {
        let day = parseInt(dateParts[0], 10);
        let monthIdx = parseInt(dateParts[1], 10) - 1;
        let year = dateParts[2].length === 4 ? parseInt(dateParts[2], 10) : parseInt(dateParts[0], 10);
        if (dateParts[0].length === 4) { year = parseInt(dateParts[0], 10); day = parseInt(dateParts[2], 10); }
        let hrs = parseInt(timeParts[0] || 0, 10);
        let mins = parseInt(timeParts[1] || 0, 10);
        let secs = parseInt(timeParts[2] || 0, 10);
        let compiledObj = new Date(year, monthIdx, day, hrs, mins, secs);
        if (!isNaN(compiledObj.getTime())) return compiledObj.getTime();
      }
    }
  }
  let nativeDateObj = new Date(dateInput);
  return isNaN(nativeDateObj.getTime()) ? 0 : nativeDateObj.getTime();
}

function formatCustomDateTime(dateInput) {
  if (!dateInput) return "";
  let dateObj;
  if (typeof dateInput === 'string') {
    let cleanInput = dateInput.replace(/\|/g, '').trim();
    if (cleanInput.includes('/') && cleanInput.includes(' ')) {
      let parts = cleanInput.split(' ');
      let dateParts = parts[0].split('/');
      let timeParts = parts[1].split(':');
      if (dateParts.length === 3) {
        let day, monthIdx, year;
        if (dateParts[2].length === 4) { day = parseInt(dateParts[0], 10); monthIdx = parseInt(dateParts[1], 10) - 1; year = parseInt(dateParts[2], 10); }
        else if (dateParts[0].length === 4) { year = parseInt(dateParts[0], 10); monthIdx = parseInt(dateParts[1], 10) - 1; day = parseInt(dateParts[2], 10); }
        let hours = parseInt(timeParts[0] || 0, 10);
        let minutes = parseInt(timeParts[1] || 0, 10);
        let seconds = parseInt(timeParts[2] || 0, 10);
        dateObj = new Date(year, monthIdx, day, hours, minutes, seconds);
      }
    } else if (cleanInput.includes(' ') && cleanInput.includes('-')) {
      let parts = cleanInput.split(' ');
      let dateParts = parts[0].split('-');
      let timeParts = parts[1].split(':');
      if (dateParts.length === 3) {
        let year = parseInt(dateParts[0], 10);
        let monthIdx = parseInt(dateParts[1], 10) - 1;
        let day = parseInt(dateParts[2], 10);
        let hours = parseInt(timeParts[0] || 0, 10);
        let minutes = parseInt(timeParts[1] || 0, 10);
        let seconds = parseInt(timeParts[2] || 0, 10);
        dateObj = new Date(year, monthIdx, day, hours, minutes, seconds);
      }
    }
  }
  if (!dateObj || isNaN(dateObj.getTime())) dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) return dateInput;
  try {
    const dtf = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    const p = dtf.formatToParts(dateObj).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
    return `${p.day}-${p.month}-${p.year} | ${p.hour}:${p.minute} ${p.dayPeriod || p.ampm || 'AM'}`;
  } catch(e) { return dateInput; }
}

function resolveTransactionIDValue(log) {
  if (!log) return "N/A";
  let transactionIdValue = log.txId || log.transactionId || log.transactionID || log.txnId || log.txnID || log.id || log.Id || log.ID || log.Transaction || log.transaction;
  if (transactionIdValue && String(transactionIdValue).trim() !== "" && String(transactionIdValue).trim().toLowerCase() !== "null") return String(transactionIdValue).trim();
  let rawDetails = log.utr || log.utrNo || log.utrno || log.UTR || log.reference || log.details || "N/A";
  let val = String(rawDetails).trim();
  if (val.startsWith("UPI:")) val = val.substring(4).trim(); else if (val.startsWith("Bank:")) val = val.substring(5).trim();
  return val === "" ? "N/A" : val;
}

async function callBackendAPI(payload) {
  const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', mode: 'cors', body: JSON.stringify(payload) });
  return await response.json();
}

// FINAL SORTING LOGIC: Pending/New sabse uper
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
    else openRegistrationPopup(mobile);
  } catch(e) { setLoading('login-btn', false, "Verify & Proceed"); alert("Network Error."); }
}

function openRegistrationPopup(mobile) {
  const modal = document.getElementById('global-modal');
  document.getElementById('modal-content-area').innerHTML = `
    <h3 style="color:var(--primary); font-size:18px;">Number Not Registered</h3>
    <div class="form-group" style="text-align:left;"><label>Full Name</label><input type="text" id="reg-name" class="form-control"></div>
    <div class="form-group" style="text-align:left;"><label>Referral</label><input type="text" id="reg-ref" class="form-control" value="${autoReferredCode}"></div>
    <button onclick="submitRegistration('${mobile}')" class="btn">Create Account</button>`;
  modal.classList.add('active');
}

async function submitRegistration(mobile) {
  const name = document.getElementById('reg-name').value.trim();
  const referral = document.getElementById('reg-ref').value.trim();
  if(!name) return;
  document.getElementById('global-modal').classList.remove('active');
  let res = await callBackendAPI({ action: "registerUser", name: name, mobile: mobile, referral: referral });
  if(res && res.success) { currentUser = { id: res.userId, name: res.name, mobile: mobile }; loadDashboardLifecycle(); }
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
      let rawLogs = (res.history || []).filter(log => log && log.type);
      masterHistoryRecords = sortHistoryRecords(rawLogs);
      renderDashboardTransactionRows(masterHistoryRecords);
      if(res.notification) triggerGlobalNotification(res.notification);
    }
  } catch (e) { toggleFetchOverlay(false); }
}

function renderDashboardTransactionRows(records) {
  const container = document.getElementById('dashboard-history-log-container');
  const viewMoreBtn = document.getElementById('view-more-tx-btn');
  container.innerHTML = "";
  records.slice(0, 4).forEach(log => {
    let isProvide = log.type === "Provide Help";
    container.innerHTML += `
      <div class="log-item ${isProvide ? 'provide' : 'get'}">
        <div class="log-details"><div>${log.type}</div><p>${log.name}</p><span>Txn: ${resolveTransactionIDValue(log)}</span><span style="font-size:10px">${formatCustomDateTime(log.date)}</span></div>
        <div class="log-amount"><div>₹${Math.abs(log.amount)}</div><span class="${log.status === 'Success' ? 'status-success' : 'status-pending'}">${log.status}</span></div>
      </div>`;
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
        <div class="log-details"><div>${log.type}</div><p>${log.name}</p><span>Txn: ${resolveTransactionIDValue(log)}</span><span style="font-size:10px">${formatCustomDateTime(log.date)}</span></div>
        <div class="log-amount"><div>₹${Math.abs(log.amount)}</div><span class="${log.status === 'Success' ? 'status-success' : 'status-pending'}">${log.status}</span></div>
      </div>`;
  });
}

function openAllTransactionsScreen() { showScreen('all-transactions-screen'); renderFullTransactionRows(masterHistoryRecords); }
function filterTransactionHistory() {
  const val = document.getElementById('tx-search-box').value.toLowerCase();
  renderFullTransactionRows(masterHistoryRecords.filter(l => l.name.toLowerCase().includes(val) || resolveTransactionIDValue(l).toLowerCase().includes(val)));
}

function openProvideHelp() { showScreen('provide-help-screen'); }
function triggerUPIPayment() {
  const amt = document.getElementById('p-amount').value;
  const app = document.getElementById('p-method').value;
  window.location.href = `${app.toLowerCase()}://pay?pa=${globalSystemConfig.upiId}&am=${amt}&cu=INR&pn=TrueHelp`;
  setTimeout(() => document.getElementById('utr-section').classList.remove('hidden'), 1000);
}

async function submitProvideHelpFinal() {
  const utr = document.getElementById('p-utr').value;
  if(utr.length < 6) return alert("Valid UTR required");
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
  setLoading('g-submit-btn', true, "Submit");
  let res = await callBackendAPI({ action: "submitGetHelp", userId: currentUser.id, amount: document.getElementById('g-amount').value, reason: document.getElementById('g-reason').value });
  setLoading('g-submit-btn', false, "Submit");
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
  document.getElementById('modal-content-area').innerHTML = `<h3>Alert</h3><p>${text}</p><button onclick="document.getElementById('global-modal').classList.remove('active')" class="btn">Okay</button>`;
  document.getElementById('global-modal').classList.add('active');
}

function logout() { currentUser = null; document.getElementById('login-mobile').value = ""; showScreen('login-screen'); }
