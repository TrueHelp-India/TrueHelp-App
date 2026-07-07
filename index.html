const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxVIHDlQYg1wK0xP28d2sNzmWJKcVi0O5Sx_b9YwzvBAVGv1hstsrgjQTRbAxgjIpPu/exec"; 

let currentUser = null;
let globalSystemConfig = {};
let autoReferredCode = "";
let masterHistoryRecords = []; 

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if(urlParams.has('ref')) {
    autoReferredCode = urlParams.get('ref').trim();
  }
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

function toggleFetchOverlay(show) {
  const overlay = document.getElementById('global-app-fetch-loader');
  if(show) { overlay.classList.remove('hidden'); } else { overlay.classList.add('hidden'); }
}

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
  if (!dateObj || isNaN(dateObj.getTime())) { dateObj = new Date(dateInput); }
  if (isNaN(dateObj.getTime())) { return dateInput; }
  try {
    const dtf = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    const parts = dtf.formatToParts(dateObj);
    const p = parts.reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
    return `${p.day}-${p.month}-${p.year} | ${p.hour}:${p.minute} ${p.dayPeriod || p.ampm || 'AM'}`;
  } catch(e) {
    const finalDay = String(dateObj.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const finalMonth = months[dateObj.getMonth()];
    const finalYear = dateObj.getFullYear();
    let options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true };
    let timeString = dateObj.toLocaleTimeString('en-US', options);
    return `${finalDay}-${finalMonth}-${finalYear} | ${timeString}`;
  }
}

function resolveTransactionIDValue(log) {
  if (!log) return "N/A";
  let transactionIdValue = log.txId || log.transactionId || log.transactionID || log.txnId || log.txnID || log.id || log.Id || log.ID || log.Transaction || log.transaction;
  if (transactionIdValue && String(transactionIdValue).trim() !== "" && String(transactionIdValue).trim().toLowerCase() !== "null") { return String(transactionIdValue).trim(); }
  let rawDetails = log.utr || log.utrNo || log.utrno || log.UTR || log.reference || log.details || "N/A";
  let val = String(rawDetails).trim();
  if (val.startsWith("UPI:")) { val = val.substring(4).trim(); } else if (val.startsWith("Bank:")) { val = val.substring(5).trim(); }
  return val === "" ? "N/A" : val;
}

async function callBackendAPI(payload) {
  const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', mode: 'cors', body: JSON.stringify(payload) });
  return await response.json();
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
      <p style="font-size:14px; color:var(--text-muted); margin:10px 0;">Account registration completed successfully.</p>
      <div style="background:var(--bg); padding:15px; border-radius:10px; font-weight:800; font-size:20px; color:var(--primary); letter-spacing:1px; margin:15px 0;">
        YOUR ID: ${res.userId}
      </div>
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
      let rawLogs = (res.history || []).filter(log => { if (!log || !log.type) return false; let typeLower = log.type.trim().toLowerCase(); if (typeLower === "type" || typeLower === "") return false; return true; });
      masterHistoryRecords = [...rawLogs].sort((a, b) => { let timeA = parseToSafeTimestamp(a.date); let timeB = parseToSafeTimestamp(b.date); return timeB - timeA; });
      renderDashboardTransactionRows(masterHistoryRecords);
      if(res.notification && res.notification.trim() !== "") { triggerGlobalNotification(res.notification); }
    } else { throw new Error("Dashboard API status failed"); }
  } catch (e) { toggleFetchOverlay(false); alert("Error loading dashboard data. Please reload."); }
}

function renderDashboardTransactionRows(records) {
  const container = document.getElementById('dashboard-history-log-container');
  const viewMoreBtn = document.getElementById('view-more-tx-btn');
  container.innerHTML = "";
  if(!records || records.length === 0) { container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;">No history records found.</div>`; viewMoreBtn.classList.add('hidden'); return; }
  const dashboardLimitedRecords = records.slice(0, 4);
  dashboardLimitedRecords.forEach((log) => {
    let isProvide = log.type === "Provide Help";
    let statusClass = log.status === "Success" ? "status-success" : "status-pending";
    let activeTxnID = resolveTransactionIDValue(log);
    let formattedTxDate = formatCustomDateTime(log.date);
    container.innerHTML += `
      <div class="log-item ${isProvide ? 'provide' : 'get'}">
        <div class="log-details">
          <div>${log.type}</div>
          <p><i class="fa-solid fa-user-circle"></i> ${log.name || 'Unknown User'}</p>
          <span>Txn ID: ${activeTxnID}</span>
          <span style="font-size: 11px; color: var(--text-muted); margin-top: 2px;"><i class="fa-solid fa-calendar-alt"></i> ${formattedTxDate}</span>
        </div>
        <div class="log-amount">
          <div style="color:${isProvide?'var(--secondary)':'#EF4444'}">₹${Math.abs(log.amount || 0).toLocaleString('en-IN')}</div>
          <span class="${statusClass}">${log.status || 'Pending'}</span>
        </div>
      </div>
    `;
  });
  if (records.length > 4) { viewMoreBtn.classList.remove('hidden'); } else { viewMoreBtn.classList.add('hidden'); }
}

function openAllTransactionsScreen() {
  showScreen('all-transactions-screen');
  document.getElementById('tx-search-box').value = ""; 
  renderFullTransactionRows(masterHistoryRecords);
  setTimeout(() => { document.getElementById('tx-search-box').focus(); }, 50);
}

function renderFullTransactionRows(records) {
  const container = document.getElementById('full-history-log-container');
  container.innerHTML = "";
  if(!records || records.length === 0) { container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;">No matching logs found.</div>`; return; }
  records.forEach((log) => {
    let isProvide = log.type === "Provide Help";
    let statusClass = log.status === "Success" ? "status-success" : "status-pending";
    let activeTxnID = resolveTransactionIDValue(log);
    let formattedTxDate = formatCustomDateTime(log.date);
    container.innerHTML += `
      <div class="log-item ${isProvide ? 'provide' : 'get'}">
        <div class="log-details">
          <div>${log.type}</div>
          <p><i class="fa-solid fa-user-circle"></i> ${log.name || 'Unknown User'}</p>
          <span>Txn ID: ${activeTxnID}</span>
          <span style="font-size: 11px; color: var(--text-muted); margin-top: 2px;"><i class="fa-solid fa-calendar-alt"></i> ${formattedTxDate}</span>
        </div>
        <div class="log-amount">
          <div style="color:${isProvide?'var(--secondary)':'#EF4444'}">₹${Math.abs(log.amount || 0).toLocaleString('en-IN')}</div>
          <span class="${statusClass}">${log.status || 'Pending'}</span>
        </div>
      </div>
    `;
  });
}

function filterTransactionHistory() {
  const searchVal = document.getElementById('tx-search-box').value.toLowerCase().trim();
  if(!searchVal) { renderFullTransactionRows(masterHistoryRecords); return; }
  const filtered = masterHistoryRecords.filter(log => {
    let matchName = log.name ? log.name.toLowerCase().includes(searchVal) : false;
    let matchUserId = log.userId ? log.userId.toLowerCase().includes(searchVal) : false;
    let matchTxID = false;
    let activeTxnID = resolveTransactionIDValue(log);
    if (activeTxnID && activeTxnID !== "N/A") { matchTxID = activeTxnID.toLowerCase().includes(searchVal); }
    return matchName || matchUserId || matchTxID;
  });
  renderFullTransactionRows(filtered);
}

function openProvideHelp() {
  document.getElementById('p-amount').value = "";
  document.getElementById('p-utr').value = "";
  document.getElementById('utr-section').classList.add('hidden');
  showScreen('provide-help-screen');
}

function triggerUPIPayment() {
  const amt = document.getElementById('p-amount').value.trim();
  if(!amt || isNaN(amt) || Number(amt) <= 0) { alert("Please input a valid amount."); return; }
  const upiTarget = globalSystemConfig.upiId;
  const payeeName = "TrueHelp Admin";
  const appSelected = document.getElementById('p-method').value;
  let upiString = `upi://pay?pa=${upiTarget}&pn=${encodeURIComponent(payeeName)}&am=${amt}&cu=INR`;
  if(appSelected === "PhonePe") { window.location.href = "phonepe://pay?pa=" + upiTarget + "&pn=" + encodeURIComponent(payeeName) + "&am=" + amt + "&cu=INR"; } 
  else if(appSelected === "Paytm") { window.location.href = "paytmmp://pay?pa=" + upiTarget + "&pn=" + encodeURIComponent(payeeName) + "&am=" + amt + "&cu=INR"; } 
  else { window.location.href = upiString; }
  setTimeout(() => { document.getElementById('utr-section').classList.remove('hidden'); }, 1500);
}

async function submitProvideHelpFinal() {
  const amt = document.getElementById('p-amount').value.trim();
  const method = document.getElementById('p-method').value;
  const utr = document.getElementById('p-utr').value.trim();
  if(utr.length < 6) { alert("Please provide a valid transaction reference / UTR number."); return; }
  setLoading('p-submit-btn', true, "SUBMIT");
  try {
    let res = await callBackendAPI({ action: "submitProvideHelp", userId: currentUser.id, amount: amt, method: method, utr: utr });
    setLoading('p-submit-btn', false, "Submit");
    if(res && res.success) {
      let generatedDateStr = res.dateTime || new Date().toISOString();
      let resTxnID = res.txId || res.transactionId || res.transactionID || res.txnId || res.txnID || res.id || "Pending Verification";
      let freshLocalItem = { type: "Provide Help", name: res.name || currentUser.name, userId: currentUser.id, amount: amt, status: "Pending", date: generatedDateStr, transactionId: resTxnID, utr: utr };
      masterHistoryRecords.unshift(freshLocalItem); 
      renderDashboardTransactionRows(masterHistoryRecords);
      let displayDateTime = formatCustomDateTime(generatedDateStr);
      document.getElementById('modal-content-area').innerHTML = `
        <div class="modal-icon alert-icon"><i class="fa-solid fa-clock"></i></div>
        <h3 style="color:#7F6000;">Sent for Admin Approval</h3>
        <div class="modal-bold-amt">₹${Number(amt).toLocaleString('en-IN')}</div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:10px; text-align:center;">Your transaction is pending verification. Fund will update once approved.</p>
        <div class="detail-grid">
          <div class="detail-row"><span>Name:</span> <span>${freshLocalItem.name}</span></div>
          <div class="detail-row"><span>Transaction ID:</span> <span>${resTxnID}</span></div>
          <div class="detail-row"><span>Status:</span> <span style="color:#7F6000;">Pending</span></div>
          <div class="detail-row"><span>UTR Number:</span> <span>${utr}</span></div>
          <div class="detail-row"><span>Date Time:</span> <span>${displayDateTime}</span></div>
        </div>
        <button onclick="closeModalAndGoDashboard()" class="btn">Close</button>
      `;
      document.getElementById('global-modal').classList.add('active');
    }
  } catch(e) { setLoading('p-submit-btn', false, "Submit Verification Proof"); alert("Network timeout. Please try again."); }
}

function openGetHelp() {
  const currentFund = Number(globalSystemConfig.totalFund || 0);
  const minimumRequired = Number(globalSystemConfig.minFund || 0);
  if (currentFund <= minimumRequired) {
    document.getElementById('modal-content-area').innerHTML = `
      <div class="modal-icon danger-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
      <h3 style="color:#EF4444; font-size:18px; margin-bottom:10px;">Fund Limit Reached!</h3>
      <p style="font-size:14px; text-align:center; line-height:1.5; color:var(--text); margin-bottom:20px;">System under maintenance. Current reserve fund has touched its minimum threshold. Please try again later.</p>
      <button onclick="document.getElementById('global-modal').classList.remove('active')" class="btn" style="background:#EF4444;">Okay</button>
    `;
    document.getElementById('global-modal').classList.add('active');
    return;
  }
  document.getElementById('g-amount').value = "";
  document.getElementById('g-upi').value = "";
  document.getElementById('g-bankname').value = "";
  document.getElementById('g-accnum').value = "";
  document.getElementById('g-ifsc').value = "";
  document.getElementById('g-reason').value = "";
  showScreen('get-help-screen');
  toggleGetHelpFields();
}

function toggleGetHelpFields() {
  const mode = document.getElementById('g-method').value;
  if(mode === "UPI") { document.getElementById('g-upi-fields').classList.remove('hidden'); document.getElementById('g-bank-fields').classList.add('hidden'); } 
  else { document.getElementById('g-upi-fields').classList.add('hidden'); document.getElementById('g-bank-fields').classList.remove('hidden'); }
}

async function submitGetHelpRequest() {
  const amt = Number(document.getElementById('g-amount').value.trim());
  const method = document.getElementById('g-method').value;
  const reason = document.getElementById('g-reason').value.trim();
  const availableFund = Number(globalSystemConfig.totalFund || 0);
  if(!amt || amt <= 0 || !reason) { alert("Please complete all fields with a valid reason."); return; }
  if (amt > availableFund) {
    if (method === "UPI") {
      document.getElementById('modal-content-area').innerHTML = `
        <div class="modal-icon alert-icon"><i class="fa-solid fa-hourglass-half"></i></div>
        <h3 style="color:#D4AF37; font-size:18px; margin-bottom:10px;">Fund Not Available</h3>
        <p style="font-size:15px; font-weight:700; text-align:center; line-height:1.5; color:var(--text); margin-bottom:20px;">Fund Not Available Please Wait...</p>
        <button onclick="document.getElementById('global-modal').classList.remove('active')" class="btn" style="background:#D4AF37;">Okay</button>
      `;
    } else {
      document.getElementById('modal-content-area').innerHTML = `
        <div class="modal-icon danger-icon"><i class="fa-solid fa-circle-exclamation"></i></div>
        <h3 style="color:#EF4444; font-size:18px; margin-bottom:10px;">Insufficient Balance!</h3>
        <p style="font-size:14px; text-align:center; line-height:1.5; color:var(--text); margin-bottom:20px;">Aap available TrueHelp Fund (₹${availableFund.toLocaleString('en-IN')}) se zyada ka help request nahi laga sakte.</p>
        <button onclick="document.getElementById('global-modal').classList.remove('active')" class="btn" style="background:#EF4444;">Modify Amount</button>
      `;
    }
    document.getElementById('global-modal').classList.add('active');
    return;
  }
  let detailsStr = "";
  if(method === "UPI") { detailsStr = "UPI: " + document.getElementById('g-upi').value.trim(); } 
  else { detailsStr = `Bank: ${document.getElementById('g-bankname').value.trim()} | A/C: ${document.getElementById('g-accnum').value.trim()} | IFSC: ${document.getElementById('g-ifsc').value.trim()}`; }
  setLoading('g-submit-btn', true, "Submit Request to Admin");
  try {
    let res = await callBackendAPI({ action: "submitGetHelp", userId: currentUser.id, amount: amt, method: method, details: detailsStr, reason: reason });
    setLoading('g-submit-btn', false, "Submit Request to Admin");
    if(res && res.success) {
      let runtimeStamp = new Date().toISOString();
      let resTxnID = res.txId || res.transactionId || res.transactionID || res.txnId || res.txnID || res.id || "Pending Approval";
      let freshGetHelpItem = { type: "Get Help", name: res.name || currentUser.name, userId: currentUser.id, amount: amt, status: "Pending", date: runtimeStamp, transactionId: resTxnID, details: detailsStr };
      masterHistoryRecords.unshift(freshGetHelpItem); 
      renderDashboardTransactionRows(masterHistoryRecords);
      let generatedDate = formatCustomDateTime(runtimeStamp);
      document.getElementById('modal-content-area').innerHTML = `
        <div class="modal-icon alert-icon"><i class="fa-solid fa-hourglass-half"></i></div>
        <h3 style="color:#7F6000;">Get Help Request Success</h3>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px; text-align:center;">Please Wait For Approval. System under validation status review.</p>
        <div class="modal-bold-amt" style="color:#EF4444;">₹${amt.toLocaleString('en-IN')}</div>
        <div class="detail-grid">
          <div class="detail-row"><span>Name:</span> <span>${freshGetHelpItem.name}</span></div>
          <div class="detail-row"><span>User ID:</span> <span>${currentUser.id}</span></div>
          <div class="detail-row"><span>Transaction ID:</span> <span>${resTxnID}</span></div>
          <div class="detail-row"><span>Status:</span> <span style="color:#7F6000;">Pending</span></div>
          <div class="detail-row"><span>Get Help Amount:</span> <span>₹${amt.toLocaleString('en-IN')}</span></div>
          <div class="detail-row"><span>Date:</span> <span>${generatedDate}</span></div>
        </div>
        <button onclick="closeModalAndGoDashboard()" class="btn">Go To Dashboard</button>
      `;
      document.getElementById('global-modal').classList.add('active');
    }
  } catch(e) { setLoading('g-submit-btn', false, "Submit Request to Admin"); alert("Request communication error. Try again."); }
}

function openReferralPanel() {
  showScreen('referral-screen');
  document.getElementById('ref-count-display').innerText = globalSystemConfig.totalReferrals || 0;
  const container = document.getElementById('refer-history-container');
  container.innerHTML = "";
  let validReferHistory = (globalSystemConfig.referHistory || []).filter(r => { if(!r || !r.name) return false; let nameLower = r.name.trim().toLowerCase(); return nameLower !== "" && nameLower !== "name"; });
  if(validReferHistory.length === 0) { container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;">You haven't referred anyone yet.</div>`; return; }
  let sortedReferHistory = validReferHistory.sort((a, b) => parseToSafeTimestamp(b.date) - parseToSafeTimestamp(a.date));
  sortedReferHistory.forEach(r => {
    let formattedRefDate = formatCustomDateTime(r.date);
    container.innerHTML += `
      <div class="log-item" style="border-left-color: var(--primary);">
        <div class="log-details">
          <div style="font-size:14px; font-weight:700;">${r.name}</div>
          <span style="font-size:11px;">ID: ${r.uid}</span>
        </div>
        <div class="log-amount" style="font-size:11px; color:var(--text-muted);">${formattedRefDate}</div>
      </div>
    `;
  });
}

function shareReferralLink() {
  if(!currentUser || !currentUser.id) return;
  const baseLink = window.location.href.split('?')[0];
  const referralLink = `${baseLink}?ref=${currentUser.id}`;
  const shareMessage = `Join TrueHelp - Real Help. Real Trust. Use my Referral Code: ${currentUser.id} to register. Register here: ${referralLink}`;
  if (navigator.share) { navigator.share({ title: 'TrueHelp Referral', text: shareMessage, url: referralLink }).catch(err => console.log(err)); } 
  else {
    const tempInput = document.createElement("input");
    tempInput.value = shareMessage;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    alert("Referral link copied to clipboard! You can share it manually on WhatsApp, Telegram, etc.");
  }
}

function triggerGlobalNotification(text) {
  document.getElementById('modal-content-area').innerHTML = `
    <div class="modal-icon alert-icon"><i class="fa-solid fa-bell"></i></div>
    <h3 style="color:var(--primary); font-size:18px; margin-bottom:10px;">TrueHelp Announcement</h3>
    <p style="font-size:14px; text-align:center; line-height:1.5; color:var(--text); margin-bottom:20px;">${text}</p>
    <button onclick="document.getElementById('global-modal').classList.remove('active')" class="btn">Okay</button>
  `;
  document.getElementById('global-modal').classList.add('active');
}

function setLoading(btnId, isLoad, defaultText) {
  const btn = document.getElementById(btnId);
  if(isLoad) { btn.disabled = true; let extraClass = (btnId === 'login-btn') ? '' : ' loader-white'; btn.innerHTML = `<span class="loader${extraClass}"></span>`; } 
  else { btn.disabled = false; btn.innerHTML = defaultText; }
}

function logout() { currentUser = null; document.getElementById('login-mobile').value = ""; showScreen('login-screen'); }
