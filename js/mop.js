// =========================================================================
// SPRINT 3 MOP ENGINE: TRADE DRAFTS, MCGOUGH MULTI-TRADE MOPS, REV 2
// RE-APPROVAL WORKFLOW, AD CONSTRUCTION RECEIPTS & SEQUENTIAL PINGS (js/mop.js)
// =========================================================================
let mopFormDraftState = {
  authorMode: 'TRADE', // 'TRADE' | 'MCGOUGH_MULTITRADE'
  isPostApprovalRevision: false,
  tradeReps: [
    { name: 'Paul', company: 'Magnum', phone: '', email: '' }
  ],
  steps: [
    { description: '', room: '', sub: 'Magnum' },
    { description: '', room: '', sub: 'Magnum' },
    { description: '', room: '', sub: 'Magnum' },
    { description: '', room: '', sub: 'Magnum' },
    { description: '', room: '', sub: 'Magnum' }
  ]
};

let mopInitializedForScope = '';

function isClientMopQueueOnlyRole() {
  return state.authRole === 'client_facops' || state.authRole === 'client_const';
}

function setMopAuthorMode(modeVal) {
  if (state.authRole !== 'mcgough') return;
  mopFormDraftState.authorMode = modeVal === 'MCGOUGH_MULTITRADE' ? 'MCGOUGH_MULTITRADE' : 'TRADE';
  renderMopAuthorModeBanner();
}

function renderMopAuthorModeBanner() {
  const wrap = document.getElementById('mop-mcgough-author-mode-bar');
  if (!wrap) return;
  if (state.authRole !== 'mcgough') {
    wrap.classList.add('hidden');
    return;
  }
  wrap.classList.remove('hidden');
  const isMulti = mopFormDraftState.authorMode === 'MCGOUGH_MULTITRADE';
  wrap.innerHTML =
    '<div class="p-3 rounded-xl border ' + (isMulti ? 'bg-red-50 border-red-300 text-red-950' : 'bg-slate-200/80 border-slate-300 text-slate-800') + ' flex flex-wrap items-center justify-between gap-2 text-xs">' +
      '<div>' +
        '<strong>' + (mopFormDraftState.isPostApprovalRevision ? 'Post-Approval Revision Mode (Requires Trade + Applied Digital Re-Approval): ' : 'McGough MOP Authoring Mode: ') + '</strong>' +
        '<span>' + (isMulti ? 'Multi-Trade Coordinated MOP - Pings all listed subcontractors to sign off first, then automatically pings Applied Digital Fac Ops.' : 'Standard Single-Trade MOP entry on behalf of lead contractor.') + '</span>' +
      '</div>' +
      '<div class="flex items-center gap-1.5">' +
        '<button type="button" onclick="setMopAuthorMode(\'MCGOUGH_MULTITRADE\')" class="px-2.5 py-1 rounded font-bold ' + (isMulti ? 'bg-red-700 text-white' : 'bg-white text-slate-700 border border-slate-300') + '">McGough Multi-Trade MOP</button>' +
        '<button type="button" onclick="setMopAuthorMode(\'TRADE\')" class="px-2.5 py-1 rounded font-semibold ' + (!isMulti ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border border-slate-300') + '">Single-Trade Entry</button>' +
      '</div>' +
    '</div>';
}

function initMopFormDefaults() {
  const orgSel = document.getElementById('mop-org');
  const areaSel = document.getElementById('mop-area');
  const projInp = document.getElementById('mop-project');
  if (projInp) projInp.value = getActiveScope().label;
  if (!orgSel || !areaSel) return;

  const tradeOrgs = state.organizations.filter(function(o) { return !o.isGC; });
  if (state.authRole === 'trade') {
    orgSel.innerHTML = '<option value="' + escapeHtml(state.selectedTradeOrg) + '">' + escapeHtml(state.selectedTradeOrg) + '</option>';
    orgSel.value = state.selectedTradeOrg;
    orgSel.disabled = true;
    mopFormDraftState.authorMode = 'TRADE';
  } else {
    orgSel.disabled = false;
    orgSel.innerHTML = tradeOrgs.map(function(o) {
      return '<option value="' + escapeHtml(o.code) + '">' + escapeHtml(o.code) + ' - ' + escapeHtml(o.fullName) + '</option>';
    }).join('');
    orgSel.value = state.selectedTradeOrg || tradeOrgs[0].code;
  }

  areaSel.innerHTML = state.areas.map(function(a) {
    return '<option value="' + escapeHtml(a) + '">' + escapeHtml(a) + '</option>';
  }).join('');

  const scopeKey = state.scopeId + ':' + (state.authRole || '') + ':' + (state.selectedTradeOrg || '');
  if (mopInitializedForScope !== scopeKey) {
    const defOrg = getOrgByCode(orgSel.value);
    mopFormDraftState.authorMode = state.authRole === 'mcgough' ? 'MCGOUGH_MULTITRADE' : 'TRADE';
    mopFormDraftState.isPostApprovalRevision = false;
    mopFormDraftState.tradeReps = [
      { name: defOrg.defaultForeman || '', company: defOrg.code, phone: '', email: '' }
    ];
    mopFormDraftState.steps = [1, 2, 3, 4, 5].map(function() {
      return { description: '', room: '', sub: defOrg.code };
    });
    mopInitializedForScope = scopeKey;
  }
  renderMopAuthorModeBanner();
  renderMopTradeRepRows();
  renderMopStepRows();
}

function handleMopLeadOrgChange(orgCode) {
  const orgObj = getOrgByCode(orgCode);
  if (mopFormDraftState.tradeReps.length > 0) {
    mopFormDraftState.tradeReps[0].company = orgCode;
    if (!mopFormDraftState.tradeReps[0].name) {
      mopFormDraftState.tradeReps[0].name = orgObj.defaultForeman || '';
    }
  }
  mopFormDraftState.steps.forEach(function(st) {
    if (!st.description) st.sub = orgCode;
  });
  renderMopTradeRepRows();
  renderMopStepRows();
}

function switchMopSubTab(subTab) {
  if (isClientMopQueueOnlyRole()) {
    state.mopSubTab = 'queue';
    renderMopWorkspace();
    return;
  }
  state.mopSubTab = subTab;
  saveState();
  renderMopWorkspace();
}

function collectInvolvedTradesFromMop(leadOrg, repsList, stepsList) {
  const map = {};
  if (leadOrg && leadOrg !== 'McGough') map[leadOrg] = true;
  (repsList || []).forEach(function(r) {
    if (r.company && r.company !== 'McGough') map[r.company] = true;
  });
  (stepsList || []).forEach(function(s) {
    if (s.sub && s.sub !== 'McGough') map[s.sub] = true;
  });
  return Object.keys(map);
}

function areAllTradeSignOffsComplete(m) {
  if (!m.tradeSignOffs || Object.keys(m.tradeSignOffs).length === 0) return true;
  return Object.keys(m.tradeSignOffs).every(function(orgKey) {
    return m.tradeSignOffs[orgKey].status === 'APPROVED';
  });
}

function getRoleScopedMopsList() {
  const all = state.mops || [];
  if (state.authRole === 'trade') {
    return all.filter(function(m) {
      if (m.org === state.selectedTradeOrg) return true;
      if (m.tradeSignOffs && m.tradeSignOffs[state.selectedTradeOrg]) return true;
      return (m.steps || []).some(function(s) { return s.sub === state.selectedTradeOrg; });
    });
  }
  if (isClientMopQueueOnlyRole()) {
    return all.filter(function(m) { return m.workflowStatus !== 'DRAFT'; });
  }
  return all;
}

function renderMopWorkspace() {
  initMopFormDefaults();

  const queueOnly = isClientMopQueueOnlyRole();
  if (queueOnly) state.mopSubTab = 'queue';

  const formSec = document.getElementById('mop-section-form');
  const queueSec = document.getElementById('mop-section-queue');
  const btnForm = document.getElementById('mop-tab-btn-form');
  const btnQueue = document.getElementById('mop-tab-btn-queue');
  const manageBtn = document.getElementById('mop-manage-approvers-btn');

  if (manageBtn) manageBtn.classList.toggle('hidden', state.authRole !== 'mcgough');

  const activeSub = queueOnly ? 'queue' : (state.mopSubTab || 'both');
  if (formSec) {
    formSec.classList.toggle('hidden', activeSub === 'queue');
    formSec.classList.toggle('flex', activeSub !== 'queue');
  }
  if (queueSec) {
    queueSec.classList.toggle('hidden', activeSub === 'form');
    queueSec.classList.toggle('flex', activeSub !== 'form');
  }

  if (btnForm) {
    btnForm.classList.toggle('hidden', queueOnly);
    if (!queueOnly) {
      btnForm.className = activeSub === 'form'
        ? 'px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-indigo-500 text-white shadow-sm'
        : 'px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/15';
    }
  }
  if (btnQueue) {
    btnQueue.className = activeSub === 'queue'
      ? 'px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-indigo-500 text-white shadow-sm'
      : 'px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/15';
  }

  const statusSel = document.getElementById('mop-filter-status');
  if (statusSel) {
    const draftOpt = statusSel.querySelector('option[value="DRAFT"]');
    if (draftOpt) draftOpt.hidden = queueOnly;
    if (queueOnly && statusSel.value === 'DRAFT') statusSel.value = 'ALL';
  }

  const visiblePool = getRoleScopedMopsList();
  const drafts = visiblePool.filter(function(m) { return m.workflowStatus === 'DRAFT'; }).length;
  const needMcgoughOrTrades = visiblePool.filter(function(m) {
    return m.workflowStatus === 'SUBMITTED' && (m.mcgoughApproval.status !== 'APPROVED' || !areAllTradeSignOffsComplete(m));
  }).length;
  const needClient = visiblePool.filter(function(m) {
    return m.workflowStatus === 'SUBMITTED' && m.mcgoughApproval.status === 'APPROVED' && areAllTradeSignOffsComplete(m) && m.clientApproval.status !== 'APPROVED';
  }).length;
  const fullApproved = visiblePool.filter(function(m) { return m.workflowStatus === 'FULLY_APPROVED'; }).length;
  const adConstViewedCount = visiblePool.filter(function(m) { return Array.isArray(m.constructionViews) && m.constructionViews.length > 0; }).length;

  const qPill = document.getElementById('mop-queue-pill-count');
  if (qPill) qPill.textContent = String(needMcgoughOrTrades + needClient);

  const kpiEl = document.getElementById('mop-kpi-strip');
  if (kpiEl) {
    const cards = [];
    if (!queueOnly) {
      cards.push({ label: 'MOP Drafts', val: String(drafts), sub: 'Saved in preparation before submittal', tone: 'bg-slate-100 border-slate-300 text-slate-800', filter: 'DRAFT' });
    }
    cards.push(
      { label: 'Gate 1: McGough / Trade Sign-Offs', val: String(needMcgoughOrTrades), sub: 'Awaiting McGough or Multi-Trade sign-offs', tone: 'bg-amber-100/85 border-amber-300 text-amber-950', filter: 'NEEDS_MCGOUGH' },
      { label: 'Gate 2: Ready for AD Fac Ops', val: String(needClient), sub: 'Gate 1 complete - Ready for Fac Ops sign-off', tone: 'bg-indigo-100/85 border-indigo-300 text-indigo-950', filter: 'NEEDS_CLIENT' },
      { label: 'Fully Approved', val: String(fullApproved), sub: 'AD Construction Viewed: ' + adConstViewedCount + ' of ' + visiblePool.length, tone: 'bg-emerald-100/85 border-emerald-300 text-emerald-950', filter: 'FULLY_APPROVED' }
    );

    kpiEl.className = cards.length === 3
      ? 'grid grid-cols-1 sm:grid-cols-3 gap-3 no-print'
      : 'grid grid-cols-2 lg:grid-cols-4 gap-3 no-print';

    kpiEl.innerHTML = cards.map(function(k) {
      return '<div onclick="filterMopByCard(\'' + k.filter + '\')" class="p-3.5 rounded-xl border shadow-sm cursor-pointer transition hover:shadow ' + k.tone + '">' +
        '<div class="text-[11px] font-bold uppercase tracking-wider opacity-80">' + escapeHtml(k.label) + '</div>' +
        '<div class="text-2xl font-bold mt-0.5">' + escapeHtml(k.val) + '</div>' +
        '<div class="text-[11px] opacity-75 mt-0.5">' + escapeHtml(k.sub) + '</div>' +
      '</div>';
    }).join('');
  }

  renderMopQueue();
}

function filterMopByCard(statusVal) {
  state.mopSubTab = 'queue';
  const sel = document.getElementById('mop-filter-status');
  if (sel) sel.value = statusVal;
  renderMopWorkspace();
}

function syncDomToMopDraftState() {
  const repNames = document.querySelectorAll('.mop-rep-name');
  if (repNames.length > 0) {
    const nextReps = [];
    for (let i = 0; i < repNames.length; i++) {
      nextReps.push({
        name: repNames[i].value,
        company: document.querySelectorAll('.mop-rep-company')[i].value,
        phone: document.querySelectorAll('.mop-rep-phone')[i].value,
        email: document.querySelectorAll('.mop-rep-email')[i].value
      });
    }
    mopFormDraftState.tradeReps = nextReps;
  }

  const stepDescs = document.querySelectorAll('.mop-step-desc');
  if (stepDescs.length > 0) {
    const nextSteps = [];
    for (let j = 0; j < stepDescs.length; j++) {
      nextSteps.push({
        description: stepDescs[j].value,
        room: document.querySelectorAll('.mop-step-room')[j].value,
        sub: document.querySelectorAll('.mop-step-sub')[j].value
      });
    }
    mopFormDraftState.steps = nextSteps;
  }
}

function renderMopTradeRepRows() {
  const container = document.getElementById('mop-trade-reps-container');
  if (!container) return;
  const orgOpts = state.organizations.filter(function(o) { return !o.isGC; });

  container.innerHTML = mopFormDraftState.tradeReps.map(function(rep, idx) {
    const selHtml = orgOpts.map(function(o) {
      return '<option value="' + escapeHtml(o.code) + '"' + (o.code === rep.company ? ' selected' : '') + '>' + escapeHtml(o.code) + '</option>';
    }).join('');

    return '<div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-300 text-xs">' +
      '<div class="sm:col-span-1 font-bold text-slate-600">Rep ' + (idx + 1) + ':</div>' +
      '<div class="sm:col-span-3"><input type="text" class="mop-rep-name w-full px-2.5 py-1.5 rounded border border-slate-300" placeholder="First / Last Name *" value="' + escapeHtml(rep.name) + '" /></div>' +
      '<div class="sm:col-span-3"><select class="mop-rep-company w-full px-2 py-1.5 rounded border border-slate-300 bg-white font-medium">' + selHtml + '</select></div>' +
      '<div class="sm:col-span-2"><input type="text" class="mop-rep-phone w-full px-2.5 py-1.5 rounded border border-slate-300" placeholder="(701) 555-0100" value="' + escapeHtml(rep.phone) + '" /></div>' +
      '<div class="sm:col-span-2"><input type="email" class="mop-rep-email w-full px-2.5 py-1.5 rounded border border-slate-300" placeholder="name@company.com" value="' + escapeHtml(rep.email) + '" /></div>' +
      '<div class="sm:col-span-1 text-center">' +
        (mopFormDraftState.tradeReps.length > 1
          ? '<button type="button" onclick="removeMopTradeRepRow(' + idx + ')" class="text-rose-600 hover:text-rose-800 font-bold">Remove</button>'
          : '<span class="text-slate-400 text-[10px]">Primary</span>') +
      '</div>' +
    '</div>';
  }).join('');
}

function addMopTradeRepRow() {
  syncDomToMopDraftState();
  const leadOrg = (document.getElementById('mop-org') || {}).value || state.selectedTradeOrg;
  mopFormDraftState.tradeReps.push({ name: '', company: leadOrg, phone: '', email: '' });
  renderMopTradeRepRows();
}

function removeMopTradeRepRow(idx) {
  syncDomToMopDraftState();
  if (mopFormDraftState.tradeReps.length <= 1) return;
  mopFormDraftState.tradeReps.splice(idx, 1);
  renderMopTradeRepRows();
}

function renderMopStepRows() {
  const tbody = document.getElementById('mop-steps-tbody');
  if (!tbody) return;
  const orgOpts = state.organizations.map(function(o) { return o.code; });

  tbody.innerHTML = mopFormDraftState.steps.map(function(st, idx) {
    const subHtml = orgOpts.map(function(code) {
      return '<option value="' + escapeHtml(code) + '"' + (code === st.sub ? ' selected' : '') + '>' + escapeHtml(code) + '</option>';
    }).join('');

    return '<tr class="hover:bg-slate-50">' +
      '<td class="px-2 py-1.5 text-center font-mono font-bold text-slate-600 border-r border-slate-200">' + (idx + 1) + '</td>' +
      '<td class="px-2 py-1.5 border-r border-slate-200"><input type="text" class="mop-step-desc w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs" placeholder="Step ' + (idx + 1) + ' - Detailed procedure / verification action" value="' + escapeHtml(st.description) + '" /></td>' +
      '<td class="px-2 py-1.5 border-r border-slate-200"><input type="text" class="mop-step-room w-full px-2 py-1.5 rounded border border-slate-300 text-xs" placeholder="Room #" value="' + escapeHtml(st.room) + '" /></td>' +
      '<td class="px-2 py-1.5 border-r border-slate-200"><select class="mop-step-sub w-full px-2 py-1.5 rounded border border-slate-300 bg-white text-xs font-medium">' + subHtml + '</select></td>' +
      '<td class="px-1.5 py-1.5 text-center">' +
        '<div class="inline-flex items-center gap-1">' +
          '<button type="button" onclick="moveMopStepRow(' + idx + ', -1)" class="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px]">&uarr;</button>' +
          '<button type="button" onclick="moveMopStepRow(' + idx + ', 1)" class="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px]">&darr;</button>' +
          (mopFormDraftState.steps.length > 1
            ? '<button type="button" onclick="removeMopStepRow(' + idx + ')" class="px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[10px]">&times;</button>'
            : '') +
        '</div>' +
      '</td>' +
    '</tr>';
  }).join('');
}

function addMopStepRows(count) {
  syncDomToMopDraftState();
  const leadOrg = (document.getElementById('mop-org') || {}).value || state.selectedTradeOrg;
  const defaultRoom = (document.getElementById('mop-rooms') || {}).value || '';
  for (let i = 0; i < count; i++) {
    mopFormDraftState.steps.push({ description: '', room: defaultRoom, sub: leadOrg });
  }
  renderMopStepRows();
}

function moveMopStepRow(idx, dir) {
  syncDomToMopDraftState();
  const target = idx + dir;
  if (target < 0 || target >= mopFormDraftState.steps.length) return;
  const tmp = mopFormDraftState.steps[idx];
  mopFormDraftState.steps[idx] = mopFormDraftState.steps[target];
  mopFormDraftState.steps[target] = tmp;
  renderMopStepRows();
}

function removeMopStepRow(idx) {
  syncDomToMopDraftState();
  if (mopFormDraftState.steps.length <= 1) return;
  mopFormDraftState.steps.splice(idx, 1);
  renderMopStepRows();
}

function resetMopForm() {
  const editEl = document.getElementById('mop-edit-id');
  if (!editEl) return;
  editEl.value = '';
  mopFormDraftState.isPostApprovalRevision = false;
  mopFormDraftState.authorMode = state.authRole === 'mcgough' ? 'MCGOUGH_MULTITRADE' : 'TRADE';
  document.getElementById('mop-form-heading').textContent = 'MOP SUBMITTAL - New Draft / Proposal';
  document.getElementById('mop-work-desc').value = '';
  document.getElementById('mop-rooms').value = '';
  document.getElementById('mop-escort-req').value = 'No';
  document.getElementById('mop-escort-steps').value = '';
  document.getElementById('mop-cw-escort-req').value = 'No';
  document.getElementById('mop-cw-escort-steps').value = '';
  document.getElementById('mop-affected-systems').value = '';
  const leadOrg = document.getElementById('mop-org').value || state.selectedTradeOrg;
  const defOrg = getOrgByCode(leadOrg);
  mopFormDraftState.tradeReps = [{ name: defOrg.defaultForeman || '', company: leadOrg, phone: '', email: '' }];
  mopFormDraftState.steps = [1, 2, 3, 4, 5].map(function() { return { description: '', room: '', sub: leadOrg }; });
  renderMopAuthorModeBanner();
  renderMopTradeRepRows();
  renderMopStepRows();
}

function saveMopEntry(targetWorkflowStatus) {
  if (isClientMopQueueOnlyRole()) return;
  syncDomToMopDraftState();
  const workDesc = document.getElementById('mop-work-desc').value.trim();
  const rooms = document.getElementById('mop-rooms').value.trim();
  const affected = document.getElementById('mop-affected-systems').value.trim();
  const propDate = document.getElementById('mop-prop-date').value;
  const propTime = document.getElementById('mop-prop-time').value || '07:00';

  const populatedSteps = mopFormDraftState.steps
    .filter(function(st) { return st.description && st.description.trim() !== ''; })
    .map(function(st, i) {
      return { stepNo: i + 1, description: st.description.trim(), room: st.room.trim(), sub: st.sub };
    });

  if (!workDesc) {
    showToast('Enter Work to be Completed (Short Description) before saving.', 'error');
    return;
  }
  if (targetWorkflowStatus === 'SUBMITTED') {
    if (!rooms || !affected) {
      showToast('Work Areas/Room Numbers and Systems Affected are required to submit an MOP.', 'error');
      return;
    }
    if (populatedSteps.length === 0) {
      showToast('Add at least 1 detailed procedure step before submitting.', 'error');
      return;
    }
  }

  const editId = document.getElementById('mop-edit-id').value;
  const existing = (state.mops || []).find(function(x) { return x.mopId === editId; });
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const nowStamp = '2026-11-20 ' + nowTime;
  const leadOrgVal = state.authRole === 'trade' ? state.selectedTradeOrg : document.getElementById('mop-org').value;

  const isMcGoughMulti = (state.authRole === 'mcgough' && mopFormDraftState.authorMode === 'MCGOUGH_MULTITRADE');
  const isRevEdit = Boolean(existing && (mopFormDraftState.isPostApprovalRevision || existing.workflowStatus === 'FULLY_APPROVED'));
  const nextRevision = isRevEdit ? ((existing.revision || 1) + 1) : (existing ? (existing.revision || 1) : 1);

  const cleanedReps = mopFormDraftState.tradeReps.map(function(r) {
    return { name: r.name.trim() || 'Trade Foreman', company: r.company, phone: r.phone.trim(), email: r.email.trim() };
  });
  const finalSteps = populatedSteps.length > 0 ? populatedSteps : [{ stepNo: 1, description: 'Draft step in preparation', room: rooms, sub: leadOrgVal }];
  const involvedTrades = collectInvolvedTradesFromMop(leadOrgVal, cleanedReps, finalSteps);

  // Build tradeSignOffs map whenever McGough authors a Multi-Trade MOP OR creates a Post-Approval Revision (Rev 2+)!
  const tradeSignOffs = {};
  if (isMcGoughMulti || isRevEdit) {
    involvedTrades.forEach(function(trCode) {
      tradeSignOffs[trCode] = { status: 'PENDING', signedBy: '', signedAt: '' };
    });
  }

  const revHistory = existing && Array.isArray(existing.revisionHistory) ? existing.revisionHistory.slice() : [];
  if (isRevEdit && existing) {
    revHistory.push({
      revision: existing.revision || 1,
      archivedAt: nowStamp,
      previousApprovalDate: existing.approvalDate || '',
      note: 'Superseded by McGough Revision ' + nextRevision
    });
  }

  const mcAppObj = (isMcGoughMulti || isRevEdit) && state.authRole === 'mcgough'
    ? {
        status: targetWorkflowStatus === 'SUBMITTED' ? 'APPROVED' : 'PENDING',
        approverName: getActiveApprover().name + ' (' + getActiveApprover().role + ')',
        phone: '',
        email: 'mcgough@mcgough.example',
        approvedAt: nowStamp,
        note: isRevEdit ? ('Issued Revision ' + nextRevision + ' - awaiting Trade & AD Fac Ops re-approval') : 'Authored & pre-approved by McGough'
      }
    : { status: 'PENDING', approverName: '', phone: '', email: '', approvedAt: '', note: '' };

  const record = {
    mopId: editId || ('MOP-' + getActiveScope().prefix + '-' + (101 + (state.mops ? state.mops.length : 0))),
    revision: nextRevision,
    authorRole: isMcGoughMulti ? 'MCGOUGH' : (existing ? (existing.authorRole || 'TRADE') : 'TRADE'),
    isSample: false,
    project: document.getElementById('mop-project').value.trim() || getActiveScope().label,
    discipline: document.getElementById('mop-discipline').value,
    org: leadOrgVal,
    area: document.getElementById('mop-area').value,
    proposedStartDate: propDate || BASE_ANCHOR_DATE,
    proposedStartTime: propTime,
    risk: document.getElementById('mop-risk').value,
    duration: document.getElementById('mop-duration').value.trim() || '1 Day',
    actualStartDate: '',
    actualStartTime: '',
    actualCompletionDate: '',
    actualCompletionTime: '',
    workDescription: workDesc,
    workAreasRooms: rooms || 'TBD in Draft',
    escortsRequired: document.getElementById('mop-escort-req').value,
    escortSteps: document.getElementById('mop-escort-steps').value.trim(),
    affectedSystems: affected || 'TBD in Draft',
    coreweaveEscortRequired: document.getElementById('mop-cw-escort-req').value,
    coreweaveEscortSteps: document.getElementById('mop-cw-escort-steps').value.trim(),
    tradeReps: cleanedReps,
    steps: finalSteps,
    tradeSignOffs: tradeSignOffs,
    revisionHistory: revHistory,
    workflowStatus: targetWorkflowStatus,
    mcgoughApproval: mcAppObj,
    clientApproval: { status: 'PENDING', approverName: '', company: 'Applied Digital Fac Ops', phone: '', email: '', approvedAt: '', note: '', concerns: '' },
    constructionViews: existing && Array.isArray(existing.constructionViews) ? existing.constructionViews : [],
    approvalDate: '',
    createdAt: 'Today ' + nowTime
  };

  const existingIdx = state.mops.findIndex(function(m) { return m.mopId === editId; });
  if (existingIdx !== -1) {
    state.mops[existingIdx] = record;
  } else {
    state.mops.unshift(record);
  }

  // Fire Sequential Automated Notification Pings!
  if (targetWorkflowStatus === 'SUBMITTED' && typeof dispatchNotificationPing === 'function') {
    const tradeTargets = involvedTrades.map(function(t) { return 'TRADE:' + t; });
    if (isRevEdit) {
      dispatchNotificationPing(
        'MOP_REVISION_ISSUED',
        tradeTargets.concat(['AD_FACOPS']),
        record.mopId + ' Rev ' + nextRevision + ' Issued - Re-Approval Required',
        'McGough issued Revision ' + nextRevision + ' on ' + record.mopId + ' (' + record.workDescription + '). Re-approval is required by involved Trade(s) (' + involvedTrades.join(', ') + ') and Applied Digital Fac Ops.'
      );
    } else if (isMcGoughMulti) {
      dispatchNotificationPing(
        'MOP_MULTITRADE_CREATED',
        tradeTargets,
        'McGough Multi-Trade MOP Sign-Off Needed: ' + record.mopId,
        'McGough created coordinated MOP ' + record.mopId + ' (' + record.workDescription + '). Involved trades (' + involvedTrades.join(', ') + ') must review and approve before Applied Digital Fac Ops sign-off.'
      );
    } else {
      dispatchNotificationPing(
        'MOP_TRADE_SUBMITTED',
        ['MCGOUGH'],
        'New Trade MOP Submitted for Gate 1 Review: ' + record.mopId,
        record.org + ' submitted ' + record.mopId + ' (' + record.workDescription + ' in ' + record.area + ') for McGough Gate 1 approval.'
      );
    }
  }

  resetMopForm();
  state.mopSubTab = 'queue';
  saveState();
  renderAll();
  showToast(
    targetWorkflowStatus === 'DRAFT'
      ? ('Saved ' + record.mopId + ' (Rev ' + nextRevision + ') as Draft.')
      : isRevEdit
        ? ('Issued ' + record.mopId + ' Rev ' + nextRevision + ' and pinged Trade(s) + Applied Digital for re-approval!')
        : isMcGoughMulti
          ? ('Created Multi-Trade ' + record.mopId + ' and pinged ' + involvedTrades.join(', ') + ' for sign-off!')
          : ('Submitted ' + record.mopId + ' and pinged McGough for Gate 1 review!'),
    'success'
  );
}

function loadMopIntoEditor(mopId, asPostApprovalRevision) {
  if (isClientMopQueueOnlyRole()) return;
  const m = (state.mops || []).find(function(x) { return x.mopId === mopId; });
  if (!m) return;
  initMopFormDefaults();
  mopFormDraftState.isPostApprovalRevision = Boolean(asPostApprovalRevision || m.workflowStatus === 'FULLY_APPROVED');
  mopFormDraftState.authorMode = m.authorRole === 'MCGOUGH' ? 'MCGOUGH_MULTITRADE' : 'TRADE';

  document.getElementById('mop-edit-id').value = m.mopId;
  document.getElementById('mop-form-heading').textContent = mopFormDraftState.isPostApprovalRevision
    ? ('Creating Revision ' + ((m.revision || 1) + 1) + ' of Approved ' + m.mopId + ' (Triggers Trade + AD Re-Approval)')
    : ('Editing ' + m.mopId + ' (Rev ' + (m.revision || 1) + ' - ' + m.workflowStatus + ')');
  document.getElementById('mop-project').value = m.project;
  document.getElementById('mop-discipline').value = m.discipline;
  document.getElementById('mop-org').value = m.org;
  document.getElementById('mop-area').value = m.area;
  document.getElementById('mop-prop-date').value = m.proposedStartDate;
  document.getElementById('mop-prop-time').value = m.proposedStartTime;
  document.getElementById('mop-risk').value = m.risk;
  document.getElementById('mop-duration').value = m.duration;
  document.getElementById('mop-work-desc').value = m.workDescription;
  document.getElementById('mop-rooms').value = m.workAreasRooms === 'TBD in Draft' ? '' : m.workAreasRooms;
  document.getElementById('mop-escort-req').value = m.escortsRequired;
  document.getElementById('mop-escort-steps').value = m.escortSteps || '';
  document.getElementById('mop-cw-escort-req').value = m.coreweaveEscortRequired;
  document.getElementById('mop-cw-escort-steps').value = m.coreweaveEscortSteps || '';
  document.getElementById('mop-affected-systems').value = m.affectedSystems === 'TBD in Draft' ? '' : m.affectedSystems;

  mopFormDraftState.tradeReps = JSON.parse(JSON.stringify(m.tradeReps));
  mopFormDraftState.steps = m.steps.map(function(st) {
    return { description: st.description, room: st.room, sub: st.sub };
  });
  renderMopAuthorModeBanner();
  renderMopTradeRepRows();
  renderMopStepRows();
  state.mopSubTab = 'form';
  renderMopWorkspace();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function submitExistingDraftMop(mopId) {
  const m = (state.mops || []).find(function(x) { return x.mopId === mopId; });
  if (!m) return;
  m.workflowStatus = 'SUBMITTED';
  if (m.authorRole !== 'MCGOUGH') {
    m.mcgoughApproval.status = 'PENDING';
  }
  m.clientApproval.status = 'PENDING';
  if (typeof dispatchNotificationPing === 'function') {
    dispatchNotificationPing('MOP_TRADE_SUBMITTED', ['MCGOUGH'], 'MOP Submitted: ' + m.mopId, m.org + ' submitted ' + m.mopId + ' for McGough Gate 1 review.');
  }
  saveState();
  renderAll();
  showToast('Submitted ' + m.mopId + ' and pinged McGough!', 'success');
}

// Trade Sign-Off Handler for McGough Multi-Trade MOPs & Post-Approval Rev 2 MOPs
function approveTradeMopSignOff(mopId, orgCode) {
  const m = (state.mops || []).find(function(x) { return x.mopId === mopId; });
  if (!m || !m.tradeSignOffs || !m.tradeSignOffs[orgCode]) return;
  if (state.authRole !== 'trade' || state.selectedTradeOrg !== orgCode) {
    showToast('Sign in as ' + orgCode + ' to record ' + orgCode + ' trade sign-off.', 'error');
    return;
  }
  const nowStamp = '2026-11-20 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  m.tradeSignOffs[orgCode] = {
    status: 'APPROVED',
    signedBy: (state.portalForeman || getOrgByCode(orgCode).defaultForeman || orgCode + ' Foreman'),
    signedAt: nowStamp
  };

  if (areAllTradeSignOffsComplete(m) && m.mcgoughApproval.status === 'APPROVED') {
    if (typeof dispatchNotificationPing === 'function') {
      dispatchNotificationPing(
        'MOP_TRADES_COMPLETE_PING_AD',
        ['AD_FACOPS'],
        'All Trades Approved ' + m.mopId + ' (Rev ' + (m.revision || 1) + ') - Ready for Applied Digital Fac Ops',
        'All involved trades signed off on ' + m.mopId + ' (' + m.workDescription + '). Gate 2 is now ready for Applied Digital Fac Ops review.'
      );
    }
    showToast(orgCode + ' signed off! All trades approved - pinged Applied Digital Fac Ops for Gate 2!', 'success');
  } else {
    showToast('Recorded ' + orgCode + ' sign-off on ' + m.mopId + '.', 'success');
  }

  saveState();
  renderAll();
}

function approveMopGate(mopId, gate) {
  const m = (state.mops || []).find(function(x) { return x.mopId === mopId; });
  if (!m) return;
  const nowStamp = '2026-11-20 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const involved = collectInvolvedTradesFromMop(m.org, m.tradeReps, m.steps);
  const tradeTargets = involved.map(function(t) { return 'TRADE:' + t; });

  if (gate === 'mcgough') {
    if (state.authRole !== 'mcgough') {
      showToast('Only authenticated McGough personnel can approve Gate 1.', 'error');
      return;
    }
    const app = getActiveApprover();
    m.mcgoughApproval = {
      status: 'APPROVED',
      approverName: app.name + ' (' + app.role + ')',
      phone: '',
      email: 'mcgough@mcgough.example',
      approvedAt: nowStamp,
      note: 'Gate 1 approved by McGough'
    };
    if (areAllTradeSignOffsComplete(m) && m.clientApproval.status !== 'APPROVED' && typeof dispatchNotificationPing === 'function') {
      dispatchNotificationPing(
        'MOP_MCGOUGH_APPROVED',
        ['AD_FACOPS'],
        'McGough Approved Gate 1 on ' + m.mopId + ' - Ready for Applied Digital Fac Ops',
        'McGough (' + app.name + ') approved Gate 1 on ' + m.mopId + ' (' + m.workDescription + '). Ready for Applied Digital Fac Ops Gate 2 approval.'
      );
    }
  } else if (gate === 'client') {
    if (state.authRole !== 'client_facops') {
      showToast('Gate 2 MOP approval is strictly reserved for Applied Digital Fac Ops.', 'error');
      return;
    }
    if (!areAllTradeSignOffsComplete(m)) {
      showToast('Involved subcontractor sign-offs must finish before Gate 2 finalization.', 'error');
      return;
    }
    const cApp = getActiveClientApprover();
    m.clientApproval = {
      status: 'APPROVED',
      approverName: cApp.name,
      company: 'Applied Digital Fac Ops',
      phone: '',
      email: cApp.email || 'facops@applieddigital.com',
      approvedAt: nowStamp,
      note: 'Gate 2 approved by Applied Digital Fac Ops',
      concerns: ''
    };
  }

  if (m.mcgoughApproval.status === 'APPROVED' && areAllTradeSignOffsComplete(m) && m.clientApproval.status === 'APPROVED') {
    m.workflowStatus = 'FULLY_APPROVED';
    m.approvalDate = '2026-11-20';
    if (typeof dispatchNotificationPing === 'function') {
      dispatchNotificationPing(
        'MOP_FULLY_APPROVED',
        ['MCGOUGH'].concat(tradeTargets),
        m.mopId + ' (Rev ' + (m.revision || 1) + ') FULLY APPROVED - Work Authorized',
        'Applied Digital Fac Ops and McGough have both approved ' + m.mopId + ' (' + m.workDescription + '). Work is authorized for ' + m.proposedStartDate + ' @ ' + m.proposedStartTime + '.'
      );
    }
    showToast(m.mopId + ' is FULLY APPROVED! Pinged McGough and ' + involved.join(', ') + '.', 'success');
  } else {
    showToast('Recorded ' + (gate === 'mcgough' ? 'McGough Gate 1 (pinged AD Fac Ops)' : 'Applied Digital Fac Ops Gate 2') + ' approval on ' + m.mopId + '.', 'success');
  }

  saveState();
  renderAll();
}

function openReturnMopModal(mopId) {
  if (state.authRole !== 'mcgough' && state.authRole !== 'client_facops') return;
  const isFacOps = state.authRole === 'client_facops';
  openModal(
    '<div class="p-5 text-xs">' +
      '<h3 class="text-base font-bold text-slate-900">' + (isFacOps ? 'Reject / Return MOP - Applied Digital Fac Ops Concerns &amp; Questions' : 'Return MOP for Revision (McGough Gate 1)') + '</h3>' +
      '<p class="text-slate-600 mt-1">' + (isFacOps ? 'Express your facility operations concerns, questions, or required isolation changes below. Returning routes ' + escapeHtml(mopId) + ' back to McGough &amp; the Trade for modification.' : 'Enter required field safety or sequence revisions for ' + escapeHtml(mopId) + '.') + '</p>' +
      '<div class="mt-3">' +
        '<label class="block font-bold text-slate-800 mb-1">' + (isFacOps ? 'Applied Digital Fac Ops Comments / Concerns / Questions *' : 'McGough Revision Notes *') + '</label>' +
        '<textarea id="mop-return-note" rows="4" placeholder="' + (isFacOps ? 'e.g., Clarify upstream PDU breaker ID in Step 2 and confirm Fac Ops escort lead 30 mins prior to switching.' : 'e.g., Attach LOTO boundary room numbers on Steps 2-4.') + '" class="w-full px-3 py-2 rounded-lg border border-slate-300"></textarea>' +
      '</div>' +
      '<div class="mt-4 flex justify-end gap-2">' +
        '<button type="button" onclick="closeModal()" class="px-3.5 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700">Cancel</button>' +
        '<button type="button" onclick="confirmReturnMop(\'' + escapeHtml(mopId) + '\')" class="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold">Return MOP &amp; Send Ping</button>' +
      '</div>' +
    '</div>'
  );
}

function confirmReturnMop(mopId) {
  const m = (state.mops || []).find(function(x) { return x.mopId === mopId; });
  if (!m) return;
  const note = (document.getElementById('mop-return-note').value || '').trim();
  if (!note) {
    showToast('Please enter your comments or concerns before returning.', 'error');
    return;
  }
  const involved = collectInvolvedTradesFromMop(m.org, m.tradeReps, m.steps);
  const tradeTargets = involved.map(function(t) { return 'TRADE:' + t; });

  m.workflowStatus = 'RETURNED';
  if (state.authRole === 'client_facops') {
    const cApp = getActiveClientApprover();
    m.clientApproval.status = 'RETURNED';
    m.clientApproval.approverName = cApp.name;
    m.clientApproval.note = note;
    m.clientApproval.concerns = note;
    if (typeof dispatchNotificationPing === 'function') {
      dispatchNotificationPing('MOP_AD_RETURNED', ['MCGOUGH'].concat(tradeTargets), 'Applied Digital Returned ' + mopId + ' with Concerns', 'Applied Digital Fac Ops (' + cApp.name + ') returned ' + mopId + ': "' + note + '"');
    }
  } else if (state.authRole === 'mcgough') {
    const app = getActiveApprover();
    m.mcgoughApproval.status = 'RETURNED';
    m.mcgoughApproval.approverName = app.name;
    m.mcgoughApproval.note = note;
    if (typeof dispatchNotificationPing === 'function') {
      dispatchNotificationPing('MOP_MCGOUGH_RETURNED', tradeTargets, 'McGough Returned ' + mopId + ' for Revision', 'McGough (' + app.name + ') returned ' + mopId + ': "' + note + '"');
    }
  }
  m.approvalDate = '';
  closeModal();
  saveState();
  renderAll();
  showToast('Returned ' + mopId + ' and notified involved parties.', 'info');
}

function recordAdConstructionMopView(mopId, showNotification) {
  const m = (state.mops || []).find(function(x) { return x.mopId === mopId; });
  if (!m) return;
  if (!Array.isArray(m.constructionViews)) m.constructionViews = [];
  if (state.authRole === 'client_const') {
    const rep = getActiveClientConstRep();
    const stamp = '11/20 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const existingIdx = m.constructionViews.findIndex(function(v) { return v.repName === rep.name; });
    if (existingIdx !== -1) {
      m.constructionViews[existingIdx].viewedAt = stamp;
    } else {
      m.constructionViews.push({
        repName: rep.name,
        role: 'Applied Digital Construction',
        viewedAt: stamp
      });
    }
    saveState();
    renderMopWorkspace();
    if (showNotification) {
      showToast('Logged AD Construction review indicator (' + rep.name + ') on ' + mopId + '.', 'info');
    }
  }
}

function openDeleteMopModal(mopId) {
  if (state.authRole !== 'mcgough') return;
  openModal(
    '<div class="p-5 text-xs">' +
      '<h3 class="text-base font-bold text-rose-900">Delete ' + escapeHtml(mopId) + '?</h3>' +
      '<p class="text-slate-600 mt-1">Permanently removes <strong>' + escapeHtml(mopId) + '</strong> from ' + escapeHtml(getActiveScope().label) + '.</p>' +
      '<div class="mt-4 flex justify-end gap-2">' +
        '<button type="button" onclick="closeModal()" class="px-3.5 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700">Cancel</button>' +
        '<button type="button" onclick="confirmDeleteMop(\'' + escapeHtml(mopId) + '\')" class="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold">Delete MOP Permanently</button>' +
      '</div>' +
    '</div>'
  );
}

function confirmDeleteMop(mopId) {
  if (state.authRole !== 'mcgough') return;
  state.mops = (state.mops || []).filter(function(x) { return x.mopId !== mopId; });
  closeModal();
  saveState();
  renderAll();
  showToast('Deleted ' + mopId + '.', 'info');
}

function openLogActualsMopModal(mopId) {
  if (isClientMopQueueOnlyRole()) return;
  const m = (state.mops || []).find(function(x) { return x.mopId === mopId; });
  if (!m) return;
  openModal(
    '<div class="p-5">' +
      '<h3 class="text-base font-bold text-slate-900">Log Actual Execution Window - ' + escapeHtml(m.mopId) + '</h3>' +
      '<div class="grid grid-cols-2 gap-3 mt-4 text-xs">' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Actual Start Date</label><input id="mop-act-sdate" type="date" value="' + escapeHtml(m.actualStartDate || m.proposedStartDate) + '" class="w-full px-2.5 py-1.5 rounded border border-slate-300" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Actual Start Time</label><input id="mop-act-stime" type="time" value="' + escapeHtml(m.actualStartTime || m.proposedStartTime) + '" class="w-full px-2.5 py-1.5 rounded border border-slate-300" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Actual Completion Date</label><input id="mop-act-edate" type="date" value="' + escapeHtml(m.actualCompletionDate || m.proposedStartDate) + '" class="w-full px-2.5 py-1.5 rounded border border-slate-300" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Actual Completion Time</label><input id="mop-act-etime" type="time" value="' + escapeHtml(m.actualCompletionTime || '15:30') + '" class="w-full px-2.5 py-1.5 rounded border border-slate-300" /></div>' +
      '</div>' +
      '<div class="mt-5 flex justify-end gap-2">' +
        '<button type="button" onclick="closeModal()" class="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700">Cancel</button>' +
        '<button type="button" onclick="saveMopActuals(\'' + escapeHtml(m.mopId) + '\')" class="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold">Save Actual Times</button>' +
      '</div>' +
    '</div>'
  );
}

function saveMopActuals(mopId) {
  const m = (state.mops || []).find(function(x) { return x.mopId === mopId; });
  if (!m) return;
  m.actualStartDate = document.getElementById('mop-act-sdate').value;
  m.actualStartTime = document.getElementById('mop-act-stime').value;
  m.actualCompletionDate = document.getElementById('mop-act-edate').value;
  m.actualCompletionTime = document.getElementById('mop-act-etime').value;
  closeModal();
  saveState();
  renderMopWorkspace();
  showToast('Recorded actual execution timestamps on ' + mopId + '!', 'success');
}

function openOfficialMopSheetModal(mopId) {
  const m = (state.mops || []).find(function(x) { return x.mopId === mopId; });
  if (!m) return;
  if (state.authRole === 'client_const') {
    recordAdConstructionMopView(mopId, false);
  }

  const repsHtml = m.tradeReps.map(function(r) {
    return '<tr class="border-b border-slate-300">' +
      '<td class="p-2 font-bold bg-slate-100 w-36">Trade Rep:</td>' +
      '<td class="p-2 font-semibold">' + escapeHtml(r.name) + '</td>' +
      '<td class="p-2">' + escapeHtml(r.company) + '</td>' +
      '<td class="p-2">' + escapeHtml(r.phone || '-') + '</td>' +
      '<td class="p-2">' + escapeHtml(r.email || '-') + '</td>' +
    '</tr>';
  }).join('');

  const stepsHtml = m.steps.map(function(s) {
    return '<tr class="border-b border-slate-200">' +
      '<td class="p-2 text-center font-mono font-bold border-r border-slate-300">' + s.stepNo + '</td>' +
      '<td class="p-2 border-r border-slate-300">' + escapeHtml(s.description) + '</td>' +
      '<td class="p-2 border-r border-slate-300">' + escapeHtml(s.room || '-') + '</td>' +
      '<td class="p-2 font-semibold">' + escapeHtml(s.sub) + '</td>' +
    '</tr>';
  }).join('');

  const viewsSummary = (m.constructionViews && m.constructionViews.length > 0)
    ? m.constructionViews.map(function(v) { return v.repName + ' (' + v.viewedAt + ')'; }).join('; ')
    : 'Not yet viewed by Applied Digital Construction';

  openModal(
    '<div class="p-5 max-h-[88vh] overflow-y-auto text-xs text-slate-900 bg-white">' +
      '<div class="flex items-center justify-between pb-3 mb-3 border-b-2 border-slate-900">' +
        '<div>' +
          '<div class="text-base font-bold tracking-tight">MOP SUBMITTAL - ' + escapeHtml(m.mopId) + ' (Rev ' + (m.revision || 1) + ')</div>' +
          '<div class="text-[11px] text-slate-600">' + escapeHtml(m.project) + ' | ' + escapeHtml(m.discipline) + ' | Origin: ' + escapeHtml(m.authorRole || 'TRADE') + ' | Status: <strong>' + escapeHtml(m.workflowStatus) + '</strong></div>' +
        '</div>' +
        '<div class="flex items-center gap-2 no-print">' +
          '<button type="button" onclick="window.print()" class="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold">Print / Save PDF</button>' +
          '<button type="button" onclick="closeModal()" class="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold">Close</button>' +
        '</div>' +
      '</div>' +
      '<table class="w-full border border-slate-400 border-collapse text-xs mb-3">' +
        '<tr class="border-b border-slate-300"><td class="p-2 font-bold bg-slate-100 w-44">PROJECT:</td><td class="p-2">' + escapeHtml(m.project) + '</td><td class="p-2 font-bold bg-slate-100 w-44">MOP Approval Date:</td><td class="p-2 font-bold text-emerald-800">' + escapeHtml(m.approvalDate || 'Pending Approval') + '</td></tr>' +
        '<tr class="border-b border-slate-300"><td class="p-2 font-bold bg-slate-100">Proposed Start:</td><td class="p-2">' + escapeHtml(m.proposedStartDate + ' ' + m.proposedStartTime) + '</td><td class="p-2 font-bold bg-slate-100">Risk / Duration:</td><td class="p-2 font-bold">' + escapeHtml(m.risk + ' / ' + m.duration) + '</td></tr>' +
        '<tr class="border-b border-slate-300"><td class="p-2 font-bold bg-slate-100">Work to be Completed:</td><td colspan="3" class="p-2 font-semibold">' + escapeHtml(m.workDescription) + '</td></tr>' +
        '<tr class="border-b border-slate-300"><td class="p-2 font-bold bg-slate-100">Systems Affected:</td><td colspan="3" class="p-2 text-rose-900">' + escapeHtml(m.affectedSystems) + '</td></tr>' +
        '<tr><td class="p-2 font-bold bg-slate-100">AD Construction Viewed:</td><td colspan="3" class="p-2 text-sky-900 font-semibold">' + escapeHtml(viewsSummary) + '</td></tr>' +
      '</table>' +
      '<table class="w-full border border-slate-400 border-collapse text-xs mb-4">' +
        '<thead class="bg-slate-800 text-white"><tr><th class="p-2">Role</th><th class="p-2">Name</th><th class="p-2">Company</th><th class="p-2">Timestamp</th><th class="p-2">Status</th></tr></thead>' +
        '<tbody>' +
          repsHtml +
          '<tr class="border-b border-slate-300 bg-emerald-50/50"><td class="p-2 font-bold">Gate 1 (McGough):</td><td class="p-2 font-semibold">' + escapeHtml(m.mcgoughApproval.approverName || 'Pending') + '</td><td class="p-2">McGough</td><td class="p-2">' + escapeHtml(m.mcgoughApproval.approvedAt || '-') + '</td><td class="p-2 font-bold">' + escapeHtml(m.mcgoughApproval.status) + '</td></tr>' +
          '<tr class="bg-indigo-50/50"><td class="p-2 font-bold">Gate 2 (AD Fac Ops):</td><td class="p-2 font-semibold">' + escapeHtml(m.clientApproval.approverName || 'Pending') + '</td><td class="p-2">Applied Digital Fac Ops</td><td class="p-2">' + escapeHtml(m.clientApproval.approvedAt || '-') + '</td><td class="p-2 font-bold">' + escapeHtml(m.clientApproval.status) + '</td></tr>' +
        '</tbody>' +
      '</table>' +
      '<table class="w-full border border-slate-400 border-collapse text-xs">' +
        '<thead class="bg-slate-800 text-white"><tr><th class="p-2 w-12 text-center">No.</th><th class="p-2">Detailed Description</th><th class="p-2 w-32">Room</th><th class="p-2 w-32">Sub</th></tr></thead>' +
        '<tbody>' + stepsHtml + '</tbody>' +
      '</table>' +
    '</div>'
  );
}

function renderMopQueue() {
  const container = document.getElementById('mop-cards-container');
  if (!container) return;

  const q = ((document.getElementById('mop-filter-search') || {}).value || '').trim().toLowerCase();
  const stFilter = ((document.getElementById('mop-filter-status') || {}).value) || 'ALL';
  const riskFilter = ((document.getElementById('mop-filter-risk') || {}).value) || 'ALL';

  const baseList = getRoleScopedMopsList();
  const list = baseList.filter(function(m) {
    if (riskFilter !== 'ALL' && m.risk !== riskFilter) return false;
    if (stFilter === 'DRAFT' && m.workflowStatus !== 'DRAFT') return false;
    if (stFilter === 'NEEDS_MCGOUGH' && !(m.workflowStatus === 'SUBMITTED' && (m.mcgoughApproval.status !== 'APPROVED' || !areAllTradeSignOffsComplete(m)))) return false;
    if (stFilter === 'NEEDS_CLIENT' && !(m.workflowStatus === 'SUBMITTED' && m.mcgoughApproval.status === 'APPROVED' && areAllTradeSignOffsComplete(m) && m.clientApproval.status !== 'APPROVED')) return false;
    if (stFilter === 'FULLY_APPROVED' && m.workflowStatus !== 'FULLY_APPROVED') return false;
    if (stFilter === 'RETURNED' && m.workflowStatus !== 'RETURNED') return false;
    if (stFilter === 'AD_CONST_VIEWED' && !(Array.isArray(m.constructionViews) && m.constructionViews.length > 0)) return false;
    if (q) {
      const hay = [m.mopId, m.discipline, m.org, m.area, m.workDescription, m.workAreasRooms, m.affectedSystems].join(' ').toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });

  if (list.length === 0) {
    container.innerHTML = '<div class="bg-slate-100 rounded-xl border border-slate-300 p-8 text-center text-xs text-slate-600">No MOP submittals match the selected filters in ' + escapeHtml(getActiveScope().label) + '.</div>';
    return;
  }

  const isMcGough = state.authRole === 'mcgough';
  const isFacOps = state.authRole === 'client_facops';
  const isAdConst = state.authRole === 'client_const';
  const isTrade = state.authRole === 'trade';

  container.innerHTML = list.map(function(m) {
    const orgObj = getOrgByCode(m.org);
    const revNum = m.revision || 1;
    const riskTone = m.risk === 'High'
      ? 'bg-rose-100 text-rose-900 border-rose-300'
      : m.risk === 'Medium'
        ? 'bg-amber-100 text-amber-900 border-amber-300'
        : 'bg-emerald-100 text-emerald-900 border-emerald-300';

    const statusBadge = m.workflowStatus === 'FULLY_APPROVED'
      ? '<span class="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">FULLY APPROVED (' + escapeHtml(m.approvalDate) + ')</span>'
      : m.workflowStatus === 'DRAFT'
        ? '<span class="px-2.5 py-0.5 rounded-full bg-slate-300 text-slate-800 text-[11px] font-bold">DRAFT</span>'
        : m.workflowStatus === 'RETURNED'
          ? '<span class="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold">RETURNED FOR REVISION</span>'
          : '<span class="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-bold">IN APPROVAL REVIEW</span>';

    const views = Array.isArray(m.constructionViews) ? m.constructionViews : [];
    const adViewedBadge = views.length > 0
      ? '<span class="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300 text-[11px] font-bold">&#10003; AD Construction Viewed (' + escapeHtml(views[views.length - 1].repName + ' ' + views[views.length - 1].viewedAt) + ')</span>'
      : '<span class="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 border border-slate-300 text-[11px] font-medium">AD Construction: Not Yet Viewed</span>';

    const concernsCallout = (m.clientApproval && m.clientApproval.concerns)
      ? '<div class="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-950 text-xs"><strong>Applied Digital Fac Ops Concerns / Questions:</strong> "' + escapeHtml(m.clientApproval.concerns) + '"</div>'
      : '';

    // Trade Sign-Off Chips (for McGough Multi-Trade MOPs and Rev 2+ Re-Approvals)
    const signOffKeys = Object.keys(m.tradeSignOffs || {});
    const tradeSignOffHtml = signOffKeys.length > 0
      ? '<div class="p-2.5 rounded-lg bg-white border border-slate-300 flex flex-wrap items-center justify-between gap-2">' +
          '<div class="flex flex-wrap items-center gap-1.5">' +
            '<span class="text-[11px] font-bold text-slate-700">Required Trade Sign-Offs:</span>' +
            signOffKeys.map(function(trCode) {
              const st = m.tradeSignOffs[trCode];
              const ok = st.status === 'APPROVED';
              return '<span class="px-2 py-0.5 rounded border text-[11px] font-semibold ' + (ok ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-50 text-amber-950 border-amber-300') + '">' +
                escapeHtml(trCode + ': ' + (ok ? ('Approved (' + st.signedBy + ')') : 'Pending Sign-Off')) +
              '</span>';
            }).join('') +
          '</div>' +
          (isTrade && m.workflowStatus === 'SUBMITTED' && m.tradeSignOffs[state.selectedTradeOrg] && m.tradeSignOffs[state.selectedTradeOrg].status !== 'APPROVED'
            ? '<button type="button" onclick="approveTradeMopSignOff(\'' + escapeHtml(m.mopId) + '\', \'' + escapeHtml(state.selectedTradeOrg) + '\')" class="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm">Approve ' + escapeHtml(state.selectedTradeOrg) + ' MOP Sign-Off</button>'
            : '') +
        '</div>'
      : '';

    const mcBadge = m.mcgoughApproval.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : m.mcgoughApproval.status === 'RETURNED' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-white border-slate-300 text-slate-700';
    const clBadge = m.clientApproval.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : m.clientApproval.status === 'RETURNED' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-white border-slate-300 text-slate-700';

    return '<div class="bg-slate-100 rounded-xl border border-slate-300 shadow-sm overflow-hidden">' +
      '<div class="px-4 py-3 bg-slate-200/85 border-b border-slate-300 flex flex-wrap items-center justify-between gap-2">' +
        '<div class="flex items-center gap-2 flex-wrap">' +
          '<span class="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-white">' + escapeHtml(m.mopId) + '</span>' +
          '<span class="px-2 py-0.5 rounded text-[11px] font-bold ' + (revNum > 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-300 text-slate-800') + '">Rev ' + revNum + '</span>' +
          (m.authorRole === 'MCGOUGH' ? '<span class="px-2 py-0.5 rounded bg-red-800 text-white text-[10px] font-bold">McGough Multi-Trade</span>' : '') +
          '<span class="px-2.5 py-0.5 rounded text-xs font-bold text-white" style="background-color:' + escapeHtml(orgObj.color) + '">' + escapeHtml(m.org) + '</span>' +
          '<span class="text-xs font-bold text-slate-800">' + escapeHtml(m.discipline) + '</span>' +
          '<span class="px-2 py-0.5 rounded border text-[11px] font-bold ' + riskTone + '">' + escapeHtml(m.risk) + ' Risk</span>' +
          adViewedBadge +
        '</div>' +
        '<div class="flex items-center gap-2">' + statusBadge + '</div>' +
      '</div>' +

      '<div class="p-4 flex flex-col gap-3 text-xs">' +
        '<div>' +
          '<div class="text-sm font-bold text-slate-900">' + escapeHtml(m.workDescription) + '</div>' +
          '<div class="text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">' +
            '<span><strong>Area / Rooms:</strong> ' + escapeHtml(m.area + ' - ' + m.workAreasRooms) + '</span>' +
            '<span><strong>Proposed Start:</strong> ' + escapeHtml(m.proposedStartDate + ' @ ' + m.proposedStartTime) + ' (' + escapeHtml(m.duration) + ')</span>' +
            '<span><strong>Escorts:</strong> ' + escapeHtml(m.escortsRequired + (m.escortSteps ? ' [' + m.escortSteps + ']' : '')) + '</span>' +
          '</div>' +
          '<div class="mt-1.5 text-rose-900 bg-rose-50/75 px-3 py-1.5 rounded-lg border border-rose-200"><strong>Systems Affected / Dangers:</strong> ' + escapeHtml(m.affectedSystems) + ' | <strong>Steps:</strong> ' + m.steps.length + '</div>' +
        '</div>' +

        concernsCallout +
        tradeSignOffHtml +

        '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">' +
          '<div class="p-2.5 rounded-lg border border-slate-300 bg-white">' +
            '<div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">1. Involved Trade Rep(s)</div>' +
            '<div class="font-bold text-slate-900 mt-0.5">' + escapeHtml(m.tradeReps.map(function(r) { return r.name + ' (' + r.company + ')'; }).join(', ')) + '</div>' +
            '<div class="text-[11px] text-slate-500 mt-0.5">' + (m.workflowStatus === 'DRAFT' ? 'Working Draft' : 'Logged ' + escapeHtml(m.createdAt)) + '</div>' +
          '</div>' +
          '<div class="p-2.5 rounded-lg border ' + mcBadge + '">' +
            '<div class="flex items-center justify-between"><span class="text-[10px] font-bold uppercase tracking-wider">2. Gate 1 - McGough</span><span class="text-[10px] font-bold uppercase">' + escapeHtml(m.mcgoughApproval.status) + '</span></div>' +
            '<div class="font-bold mt-0.5">' + escapeHtml(m.mcgoughApproval.approverName || 'Awaiting McGough Sign-Off') + '</div>' +
            (m.mcgoughApproval.note ? '<div class="text-[11px] italic mt-0.5">"' + escapeHtml(m.mcgoughApproval.note) + '"</div>' : '') +
          '</div>' +
          '<div class="p-2.5 rounded-lg border ' + clBadge + '">' +
            '<div class="flex items-center justify-between"><span class="text-[10px] font-bold uppercase tracking-wider">3. Gate 2 - AD Fac Ops</span><span class="text-[10px] font-bold uppercase">' + escapeHtml(m.clientApproval.status) + '</span></div>' +
            '<div class="font-bold mt-0.5">' + escapeHtml(m.clientApproval.approverName || 'Awaiting Applied Digital Fac Ops') + '</div>' +
            (m.clientApproval.note ? '<div class="text-[11px] italic mt-0.5">"' + escapeHtml(m.clientApproval.note) + '"</div>' : '') +
          '</div>' +
          '<div class="p-2.5 rounded-lg border ' + (views.length > 0 ? 'bg-sky-100 border-sky-400 text-sky-950' : 'bg-white border-slate-300 text-slate-500') + '">' +
            '<div class="flex items-center justify-between"><span class="text-[10px] font-bold uppercase tracking-wider">4. AD Construction</span><span class="px-1.5 py-0.5 rounded text-[10px] font-bold ' + (views.length > 0 ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-600') + '">' + (views.length > 0 ? 'VIEWED' : 'NOT VIEWED') + '</span></div>' +
            '<div class="font-bold mt-0.5">' + (views.length > 0 ? ('&#10003; ' + escapeHtml(views[views.length - 1].repName)) : 'Pending AD Construction View') + '</div>' +
            '<div class="text-[11px] mt-0.5">' + (views.length > 0 ? escapeHtml('Clicked ' + views[views.length - 1].viewedAt + (views.length > 1 ? ' (+' + (views.length - 1) + ' more)' : '')) : 'Updates live when clicked') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">' +
        '<div class="flex flex-wrap items-center gap-2">' +
          '<button type="button" onclick="openOfficialMopSheetModal(\'' + escapeHtml(m.mopId) + '\')" class="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-800">View / Print Official MOP Form</button>' +
          (isAdConst
            ? '<button type="button" onclick="recordAdConstructionMopView(\'' + escapeHtml(m.mopId) + '\', true)" class="px-3 py-1.5 rounded-lg ' + (views.length > 0 ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-sky-700 hover:bg-sky-600') + ' text-white font-semibold">' + (views.length > 0 ? '&#10003; AD Construction Viewed (Update Timestamp)' : 'Log AD Construction Viewed') + '</button>'
            : (views.length > 0
                ? '<span class="px-3 py-1.5 rounded-lg bg-sky-100 border border-sky-400 text-sky-950 font-bold inline-flex items-center gap-1.5">&#10003; AD Construction Viewed: ' + escapeHtml(views[views.length - 1].repName + ' @ ' + views[views.length - 1].viewedAt) + '</span>'
                : '<span class="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-500 font-medium inline-flex items-center gap-1.5">AD Construction: Not Viewed Yet</span>')) +
          (isMcGough ? '<button type="button" onclick="openDeleteMopModal(\'' + escapeHtml(m.mopId) + '\')" class="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold">Delete MOP</button>' : '') +
          (isMcGough && m.workflowStatus === 'FULLY_APPROVED'
            ? '<button type="button" onclick="loadMopIntoEditor(\'' + escapeHtml(m.mopId) + '\', true)" class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-sm">Edit as Rev ' + (revNum + 1) + ' (Re-Approve)</button>'
            : '') +
          ((isMcGough || (isTrade && m.org === state.selectedTradeOrg)) && (m.workflowStatus === 'DRAFT' || m.workflowStatus === 'RETURNED')
            ? '<button type="button" onclick="loadMopIntoEditor(\'' + escapeHtml(m.mopId) + '\', false)" class="px-3 py-1.5 rounded-lg border border-sky-300 bg-sky-50 hover:bg-sky-100 font-semibold text-sky-900">Edit Draft / Revise</button>' +
              '<button type="button" onclick="submitExistingDraftMop(\'' + escapeHtml(m.mopId) + '\')" class="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold">Submit for Approval</button>'
            : '') +
          ((isMcGough || (isTrade && m.org === state.selectedTradeOrg)) && m.workflowStatus === 'FULLY_APPROVED'
            ? '<button type="button" onclick="openLogActualsMopModal(\'' + escapeHtml(m.mopId) + '\')" class="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold">Log Actual Start/Completion</button>'
            : '') +
        '</div>' +

        '<div class="flex flex-wrap items-center gap-2">' +
          (isMcGough && m.workflowStatus === 'SUBMITTED'
            ? '<button type="button" onclick="openReturnMopModal(\'' + escapeHtml(m.mopId) + '\')" class="px-3 py-1.5 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold">Return to Trade</button>' +
              (m.mcgoughApproval.status !== 'APPROVED'
                ? '<button type="button" onclick="approveMopGate(\'' + escapeHtml(m.mopId) + '\', \'mcgough\')" class="px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold shadow-sm">Approve Gate 1 (McGough)</button>'
                : '<span class="px-2.5 py-1 rounded bg-slate-100 text-slate-500 font-semibold text-[11px]">Gate 2 Locked to AD Fac Ops</span>')
            : '') +
          (isFacOps && m.workflowStatus === 'SUBMITTED'
            ? '<button type="button" onclick="openReturnMopModal(\'' + escapeHtml(m.mopId) + '\')" class="px-3 py-1.5 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold">Reject / Log Concerns</button>' +
              (m.clientApproval.status !== 'APPROVED'
                ? '<button type="button" onclick="approveMopGate(\'' + escapeHtml(m.mopId) + '\', \'client\')" class="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-sm">' + (areAllTradeSignOffsComplete(m) ? 'Approve Gate 2 (Applied Digital Fac Ops)' : 'Awaiting Trade Sign-Offs First') + '</button>'
                : '<span class="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-bold text-[11px]">Gate 2 Approved</span>')
            : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}
