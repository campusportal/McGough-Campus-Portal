// =========================================================================
// PRIVATE TRADE-TO-MCGOUGH POTENTIAL CHANGE ORDER (PCO) ENGINE (js/pco.js)
// Strictly hidden from Applied Digital; includes 1-Click Share to AD Button,
// McGough Comments, and Mandatory Cost-Only vs. P6 Schedule-Impact Tagging
// =========================================================================
function toggleTradePcoImpactFields() {
  const sel = document.getElementById('pco-impact-type');
  const wrap = document.getElementById('pco-schedule-impact-fields');
  if (!sel || !wrap) return;
  wrap.classList.toggle('hidden', sel.value !== 'SCHEDULE_IMPACT');
}

function renderTradePcoWorkspace() {
  const areaSel = document.getElementById('pco-area');
  const p6Sel = document.getElementById('pco-impacted-p6');
  if (areaSel && areaSel.options.length === 0) {
    areaSel.innerHTML = state.areas.map(function(a) { return '<option value="' + escapeHtml(a) + '">' + escapeHtml(a) + '</option>'; }).join('');
  }
  if (p6Sel) {
    const myP6 = (state.p6Activities || []).filter(function(a) { return a.org === state.selectedTradeOrg; });
    p6Sel.innerHTML = myP6.length === 0
      ? '<option value="UNLISTED">General Project Milestone</option>'
      : myP6.map(function(a) {
          return '<option value="' + escapeHtml(a.p6Id) + '">[' + escapeHtml(a.p6Id) + '] ' + escapeHtml(a.activityName) + '</option>';
        }).join('');
  }
  toggleTradePcoImpactFields();

  const listWrap = document.getElementById('trade-pco-list');
  if (!listWrap) return;
  const mine = (state.pcos || []).filter(function(p) { return p.org === state.selectedTradeOrg; });
  if (mine.length === 0) {
    listWrap.innerHTML = '<div class="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">No Potential Change Orders submitted by ' + escapeHtml(state.selectedTradeOrg) + ' yet.</div>';
    return;
  }

  listWrap.innerHTML = mine.map(function(p) {
    const visibleComments = (p.mcgoughComments || []).filter(function(c) { return c.visibility !== 'INTERNAL'; });
    return '<div class="p-4 rounded-xl bg-white border border-slate-300 shadow-sm flex flex-col gap-2 text-xs">' +
      '<div class="flex flex-wrap items-center justify-between gap-2">' +
        '<div class="flex items-center gap-2 flex-wrap">' +
          '<span class="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold">' + escapeHtml(p.pcoId) + '</span>' +
          '<span class="font-bold text-slate-900 text-sm">' + escapeHtml(p.title) + '</span>' +
        '</div>' +
        '<span class="px-2.5 py-0.5 rounded-full font-bold text-[11px] ' + (p.status === 'APPROVED' ? 'bg-emerald-600 text-white' : p.status === 'REJECTED' ? 'bg-rose-600 text-white' : 'bg-amber-400 text-slate-950') + '">' + escapeHtml(p.status) + '</span>' +
      '</div>' +
      '<div class="text-slate-600"><strong>Area / Room:</strong> ' + escapeHtml(p.area + ' - ' + p.room) + ' | <strong>ROM Cost:</strong> $' + Number(p.romAmount || 0).toLocaleString() + ' (' + escapeHtml(p.pricingBasis) + ') | <strong>Schedule Tag:</strong> ' + (p.scheduleImpactType === 'COST_ONLY' ? 'Cost Only (0d Slip)' : ('Impacts ' + escapeHtml(p.impactedP6Id) + ' (+' + p.estimatedSlipDays + 'd)')) + '</div>' +
      (visibleComments.length > 0
        ? '<div class="mt-1 p-2.5 rounded-lg bg-slate-100 border border-slate-200">' +
            '<div class="font-bold text-slate-700 mb-1">McGough Review Comments:</div>' +
            visibleComments.map(function(c) { return '<div class="text-slate-700">"' + escapeHtml(c.text) + '" <span class="text-slate-400">- ' + escapeHtml(c.author + ' @ ' + c.timestamp) + '</span></div>'; }).join('') +
          '</div>'
        : '') +
    '</div>';
  }).join('');
}

function submitNewTradePco() {
  if (state.authRole !== 'trade') return;
  const title = (document.getElementById('pco-title').value || '').trim();
  const room = (document.getElementById('pco-room').value || '').trim();
  const rom = Number(document.getElementById('pco-rom').value) || 0;
  const impactType = document.getElementById('pco-impact-type').value;
  if (!title || !room) {
    showToast('Enter PCO Scope Description and Area/Room.', 'error');
    return;
  }

  let impId = '';
  let impName = '';
  let slipDays = 0;
  if (impactType === 'SCHEDULE_IMPACT') {
    impId = document.getElementById('pco-impacted-p6').value || 'UNLISTED';
    const p6Obj = (state.p6Activities || []).find(function(a) { return a.p6Id === impId; });
    impName = p6Obj ? p6Obj.activityName : 'Schedule Milestone';
    slipDays = Math.max(1, Number(document.getElementById('pco-slip-days').value) || 1);
  }

  const nowStr = '2026-11-20 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const pcoId = 'PCO-' + getActiveScope().prefix + '-' + String(1 + (state.pcos ? state.pcos.length : 0)).padStart(3, '0');

  const rec = {
    pcoId: pcoId,
    isSample: false,
    org: state.selectedTradeOrg,
    submittedBy: state.portalForeman || getOrgByCode(state.selectedTradeOrg).defaultForeman || 'Foreman',
    submittedAt: nowStr,
    area: document.getElementById('pco-area').value,
    room: room,
    title: title,
    reason: document.getElementById('pco-reason').value,
    romAmount: rom,
    pricingBasis: document.getElementById('pco-basis').value,
    scheduleImpactType: impactType,
    impactedP6Id: impId,
    impactedP6Name: impName,
    estimatedSlipDays: slipDays,
    status: 'PENDING_MCGOUGH',
    mcgoughComments: [],
    sharedWithAppliedDigital: false,
    sharedWithAdAt: '',
    sharedWithAdNote: ''
  };

  if (!Array.isArray(state.pcos)) state.pcos = [];
  state.pcos.unshift(rec);

  if (typeof dispatchNotificationPing === 'function') {
    dispatchNotificationPing('PCO_SUBMITTED', ['MCGOUGH'], 'New Trade PCO Submitted: ' + pcoId + ' ($' + rom.toLocaleString() + ')', state.selectedTradeOrg + ' submitted ' + pcoId + ': "' + title + '" (' + (impactType === 'COST_ONLY' ? 'Cost Only - 0d Slip' : ('Impacts ' + impId + ' +' + slipDays + 'd')) + ').');
  }

  document.getElementById('pco-title').value = '';
  document.getElementById('pco-room').value = '';
  document.getElementById('pco-rom').value = '';
  saveState();
  renderAll();
  showToast('Submitted ' + pcoId + ' privately to McGough Supervision!', 'success');
}

function renderMcGoughPcoView() {
  const container = document.getElementById('mc-pco-cards-container');
  const kpiEl = document.getElementById('mc-pco-kpi-strip');
  if (!container) return;

  const list = state.pcos || [];
  const pending = list.filter(function(p) { return p.status === 'PENDING_MCGOUGH'; });
  const totalRom = list.reduce(function(s, p) { return s + (Number(p.romAmount) || 0); }, 0);
  const schedImpacting = list.filter(function(p) { return p.scheduleImpactType === 'SCHEDULE_IMPACT'; }).length;
  const sharedCnt = list.filter(function(p) { return p.sharedWithAppliedDigital; }).length;

  if (kpiEl) {
    kpiEl.innerHTML = [
      { lbl: 'Pending McGough Review', val: String(pending.length), sub: list.length + ' total PCOs (Private to McGough)', cls: 'bg-amber-100/85 border-amber-300 text-amber-950' },
      { lbl: 'Total Submitted ROM Exposure', val: '$' + totalRom.toLocaleString(), sub: 'Summed across active scope PCOs', cls: 'bg-slate-100 border-slate-300 text-slate-900' },
      { lbl: 'Flagged P6 Schedule Impact', val: String(schedImpacting), sub: (list.length - schedImpacting) + ' tagged Cost-Only (0d Slip)', cls: schedImpacting > 0 ? 'bg-rose-100/85 border-rose-300 text-rose-950' : 'bg-emerald-100/85 border-emerald-300 text-emerald-950' },
      { lbl: 'Forwarded to Applied Digital', val: String(sharedCnt), sub: 'Hidden from AD unless explicitly sent', cls: 'bg-indigo-100/85 border-indigo-300 text-indigo-950' }
    ].map(function(k) {
      return '<div class="p-3.5 rounded-xl border shadow-sm ' + k.cls + '"><div class="text-[11px] font-bold uppercase tracking-wider opacity-80">' + escapeHtml(k.lbl) + '</div><div class="text-2xl font-bold mt-0.5">' + escapeHtml(k.val) + '</div><div class="text-[11px] opacity-75 mt-0.5">' + escapeHtml(k.sub) + '</div></div>';
    }).join('');
  }

  if (list.length === 0) {
    container.innerHTML = '<div class="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">No Potential Change Orders submitted in ' + escapeHtml(getActiveScope().label) + ' yet.</div>';
    return;
  }

  container.innerHTML = list.map(function(p) {
    const orgObj = getOrgByCode(p.org);
    const commentsHtml = (p.mcgoughComments || []).map(function(c) {
      return '<div class="p-2 rounded bg-white border border-slate-200 flex items-center justify-between gap-2">' +
        '<div><span class="px-1.5 py-0.2 rounded text-[10px] font-bold mr-1.5 ' + (c.visibility === 'INTERNAL' ? 'bg-slate-800 text-white' : 'bg-sky-100 text-sky-900') + '">' + escapeHtml(c.visibility) + '</span>' +
        '<span>' + escapeHtml(c.text) + '</span></div>' +
        '<span class="text-[10px] text-slate-400 shrink-0">' + escapeHtml(c.author + ' @ ' + c.timestamp) + '</span>' +
      '</div>';
    }).join('');

    return '<div class="bg-slate-100 rounded-xl border border-slate-300 shadow-sm overflow-hidden text-xs">' +
      '<div class="px-4 py-3 bg-slate-200/85 border-b border-slate-300 flex flex-wrap items-center justify-between gap-2">' +
        '<div class="flex items-center gap-2 flex-wrap">' +
          '<span class="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold">' + escapeHtml(p.pcoId) + '</span>' +
          '<span class="px-2 py-0.5 rounded text-white font-bold" style="background-color:' + escapeHtml(orgObj.color) + '">' + escapeHtml(p.org) + '</span>' +
          '<span class="font-bold text-slate-900 text-sm">' + escapeHtml(p.title) + '</span>' +
          (p.scheduleImpactType === 'COST_ONLY'
            ? '<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px]">Cost Only (0d P6 Slip)</span>'
            : '<span class="px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 font-bold text-[11px]">Impacts ' + escapeHtml(p.impactedP6Id) + ' (+' + p.estimatedSlipDays + 'd Slip)</span>') +
          (p.sharedWithAppliedDigital ? '<span class="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px]">Sent to Applied Digital (' + escapeHtml(p.sharedWithAdAt) + ')</span>' : '<span class="px-2 py-0.5 rounded bg-slate-300 text-slate-700 font-semibold text-[10px]">Private (McGough Only)</span>') +
        '</div>' +
        '<div class="font-mono font-bold text-sm text-slate-900">$' + Number(p.romAmount || 0).toLocaleString() + ' <span class="text-[11px] font-sans font-normal text-slate-600">(' + escapeHtml(p.pricingBasis) + ')</span></div>' +
      '</div>' +

      '<div class="p-4 flex flex-col gap-3">' +
        '<div class="text-slate-700 flex flex-wrap gap-x-4 gap-y-1">' +
          '<span><strong>Area / Room:</strong> ' + escapeHtml(p.area + ' - ' + p.room) + '</span>' +
          '<span><strong>Origin:</strong> ' + escapeHtml(p.reason) + '</span>' +
          '<span><strong>Submitted By:</strong> ' + escapeHtml(p.submittedBy + ' @ ' + p.submittedAt) + '</span>' +
          '<span><strong>Status:</strong> <strong>' + escapeHtml(p.status) + '</strong></span>' +
        '</div>' +

        // McGough Comments Thread + Input
        '<div class="p-3 rounded-lg bg-slate-200/70 border border-slate-300 flex flex-col gap-2">' +
          '<div class="font-bold text-slate-800">McGough PCO Review Comments</div>' +
          (commentsHtml || '<div class="text-slate-500 italic">No comments added yet.</div>') +
          '<div class="flex flex-wrap items-center gap-2 mt-1">' +
            '<input id="pco-cmt-text-' + escapeHtml(p.pcoId) + '" type="text" placeholder="Add McGough review note or pricing comment..." class="flex-1 min-w-[200px] px-2.5 py-1.5 rounded border border-slate-300 bg-white" />' +
            '<select id="pco-cmt-vis-' + escapeHtml(p.pcoId) + '" class="px-2 py-1.5 rounded border border-slate-300 bg-white font-semibold"><option value="SHARED">Visible to ' + escapeHtml(p.org) + '</option><option value="INTERNAL">McGough Internal Only</option></select>' +
            '<button type="button" onclick="addMcGoughPcoComment(\'' + escapeHtml(p.pcoId) + '\')" class="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold">+ Post Comment</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">' +
        '<button type="button" onclick="openSendPcoToAppliedDigitalModal(\'' + escapeHtml(p.pcoId) + '\')" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-sm">Send Awareness Summary to Applied Digital &rarr;</button>' +
        '<div class="flex flex-wrap items-center gap-2">' +
          '<button type="button" onclick="setMcGoughPcoDecision(\'' + escapeHtml(p.pcoId) + '\', \'REJECTED\')" class="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold">Reject</button>' +
          '<button type="button" onclick="setMcGoughPcoDecision(\'' + escapeHtml(p.pcoId) + '\', \'REVISION_REQUESTED\')" class="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-950 font-semibold">Request Backup / Revise</button>' +
          '<button type="button" onclick="setMcGoughPcoDecision(\'' + escapeHtml(p.pcoId) + '\', \'APPROVED\')" class="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold shadow-sm">Approve PCO</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function addMcGoughPcoComment(pcoId) {
  if (state.authRole !== 'mcgough') return;
  const p = (state.pcos || []).find(function(x) { return x.pcoId === pcoId; });
  if (!p) return;
  const inp = document.getElementById('pco-cmt-text-' + pcoId);
  const vis = document.getElementById('pco-cmt-vis-' + pcoId);
  const txt = ((inp && inp.value) || '').trim();
  if (!txt) {
    showToast('Enter a comment first.', 'error');
    return;
  }
  if (!Array.isArray(p.mcgoughComments)) p.mcgoughComments = [];
  const app = getActiveApprover();
  p.mcgoughComments.push({
    author: app.name + ' (McGough)',
    timestamp: '11/20 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    visibility: vis ? vis.value : 'SHARED',
    text: txt
  });
  if (vis && vis.value === 'SHARED' && typeof dispatchNotificationPing === 'function') {
    dispatchNotificationPing('PCO_COMMENT', ['TRADE:' + p.org], 'McGough Comment on ' + p.pcoId, app.name + ' commented on ' + p.pcoId + ': "' + txt + '"');
  }
  saveState();
  renderMcGoughPcoView();
  showToast('Added comment to ' + pcoId + '.', 'info');
}

function setMcGoughPcoDecision(pcoId, nextStatus) {
  if (state.authRole !== 'mcgough') return;
  const p = (state.pcos || []).find(function(x) { return x.pcoId === pcoId; });
  if (!p) return;
  p.status = nextStatus;
  if (typeof dispatchNotificationPing === 'function') {
    dispatchNotificationPing('PCO_DECISION', ['TRADE:' + p.org], p.pcoId + ' Status Updated: ' + nextStatus, 'McGough (' + getActiveApprover().name + ') marked ' + p.pcoId + ' (' + p.title + ') as ' + nextStatus + '.');
  }
  saveState();
  renderAll();
  showToast('Marked ' + pcoId + ' as ' + nextStatus + ' & pinged ' + p.org + '.', 'success');
}

function openSendPcoToAppliedDigitalModal(pcoId) {
  if (state.authRole !== 'mcgough') return;
  const p = (state.pcos || []).find(function(x) { return x.pcoId === pcoId; });
  if (!p) return;
  openModal(
    '<div class="p-5 text-xs">' +
      '<h3 class="text-base font-bold text-slate-900">Send PCO Summary to Applied Digital (' + escapeHtml(p.pcoId) + ')</h3>' +
      '<p class="text-slate-600 mt-1">PCOs stay completely hidden from Applied Digital portals. Sending dispatches an owner awareness notification packet for <strong>' + escapeHtml(p.title) + ' ($' + Number(p.romAmount || 0).toLocaleString() + ')</strong>.</p>' +
      '<div class="mt-3">' +
        '<label class="block font-semibold text-slate-700 mb-1">McGough Cover Note for Applied Digital</label>' +
        '<textarea id="pco-ad-share-note" rows="3" placeholder="e.g., Forwarding ROM awareness summary for owner-requested riser coordination." class="w-full px-3 py-2 rounded-lg border border-slate-300">' + escapeHtml(p.sharedWithAdNote || '') + '</textarea>' +
      '</div>' +
      '<div class="mt-4 flex justify-end gap-2">' +
        '<button type="button" onclick="closeModal()" class="px-3.5 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700">Cancel</button>' +
        '<button type="button" onclick="confirmSendPcoToAppliedDigital(\'' + escapeHtml(p.pcoId) + '\')" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Dispatch Summary to Applied Digital</button>' +
      '</div>' +
    '</div>'
  );
}

function confirmSendPcoToAppliedDigital(pcoId) {
  const p = (state.pcos || []).find(function(x) { return x.pcoId === pcoId; });
  if (!p) return;
  const note = (document.getElementById('pco-ad-share-note').value || '').trim();
  const nowStr = '11/20 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  p.sharedWithAppliedDigital = true;
  p.sharedWithAdAt = nowStr;
  p.sharedWithAdNote = note;

  if (typeof dispatchNotificationPing === 'function') {
    dispatchNotificationPing(
      'PCO_SHARED_AD',
      ['AD_CONST', 'AD_FACOPS'],
      'McGough PCO Awareness Notice: ' + p.pcoId + ' - ' + p.title,
      'Project: ' + getActiveScope().label + ' | Trade: ' + p.org + ' | ROM: $' + Number(p.romAmount || 0).toLocaleString() + ' | Schedule Impact: ' + (p.scheduleImpactType === 'COST_ONLY' ? 'Cost Only (0d)' : ('+' + p.estimatedSlipDays + 'd on ' + p.impactedP6Id)) + (note ? (' | McGough Note: ' + note) : '')
    );
  }

  closeModal();
  saveState();
  renderMcGoughPcoView();
  showToast('Dispatched ' + pcoId + ' summary to Applied Digital!', 'success');
}
