// =========================================================================
// SCOPED TRADE PARTNER PORTAL (js/trade-portal.js)
// Strictly locked to state.selectedTradeOrg; zero cross-trade impersonation
// =========================================================================
function populatePortalDropdowns() {
  const orgBadge = document.getElementById('portal-locked-org-label');
  if (orgBadge) {
    const oObj = getOrgByCode(state.selectedTradeOrg);
    orgBadge.textContent = oObj.code + ' - ' + oObj.fullName + ' (' + getActiveScope().prefix + ')';
  }

  const fInput = document.getElementById('portal-foreman-input');
  if (fInput) {
    fInput.value = state.portalForeman || getOrgByCode(state.selectedTradeOrg).defaultForeman || '';
  }

  const areaSel = document.getElementById('new-task-area');
  if (areaSel) {
    areaSel.innerHTML = state.areas.map(function(a) {
      return '<option value="' + escapeHtml(a) + '">' + escapeHtml(a) + '</option>';
    }).join('');
  }
  ensureTradeScheduleLoaded();
  renderTradeP6TypeAheadOptions();
}

function renderTradeP6TypeAheadOptions() {
  const searchInp = document.getElementById('new-task-p6-search');
  const selEl = document.getElementById('new-task-p6-select');
  const customToggle = document.getElementById('new-task-unlisted-toggle');
  const customWrap = document.getElementById('new-task-custom-desc-wrap');
  if (!selEl) return;

  const isCustom = customToggle ? customToggle.checked : false;
  if (customWrap) customWrap.classList.toggle('hidden', !isCustom);

  const q = ((searchInp && searchInp.value) || '').trim().toLowerCase();
  const myP6 = (state.p6Activities || []).filter(function(a) {
    if (a.org !== state.selectedTradeOrg) return false;
    if (q) {
      const hay = (a.p6Id + ' ' + a.area + ' ' + a.activityName).toLowerCase();
      return hay.indexOf(q) !== -1;
    }
    return true;
  });

  if (myP6.length === 0) {
    selEl.innerHTML = '<option value="">No P6 activities match filter for ' + escapeHtml(state.selectedTradeOrg) + ' (check Unlisted box below if emergent)</option>';
    return;
  }

  selEl.innerHTML = myP6.map(function(a) {
    return '<option value="' + escapeHtml(a.p6Id) + '">[' + escapeHtml(a.p6Id) + ' | ' + escapeHtml(a.area) + '] ' + escapeHtml(a.activityName) + ' (P6: ' + formatShortDate(a.p6Start) + '-' + formatShortDate(a.p6Finish) + ')</option>';
  }).join('');
  applySelectedP6ToNewTaskForm(selEl.value);
}

function applySelectedP6ToNewTaskForm(p6Id) {
  const act = (state.p6Activities || []).find(function(a) { return a.p6Id === p6Id; });
  if (!act) return;
  const areaSel = document.getElementById('new-task-area');
  const wbsInp = document.getElementById('new-task-wbs');
  const sInp = document.getElementById('new-task-start');
  const eInp = document.getElementById('new-task-end');
  if (areaSel && state.areas.indexOf(act.area) !== -1) areaSel.value = act.area;
  if (wbsInp) wbsInp.value = act.wbs || '8';
  if (sInp) sInp.value = act.p6Start;
  if (eInp) eInp.value = act.p6Finish;
}


let tradeHolidayDraftList = null;

function ensureTradeScheduleLoaded() {
  const org = state.selectedTradeOrg;
  if (!state.tradeWorkSchedules) state.tradeWorkSchedules = {};
  const existing = state.tradeWorkSchedules[org] || {
    org: org,
    updatedBy: state.portalForeman || getOrgByCode(org).defaultForeman || '',
    updatedAt: '',
    shiftPattern: 'Mon-Fri (5x10s)',
    shiftHours: '07:00 - 17:30',
    dailyCrew: 4,
    sat1Status: 'Off-Site',
    sat1Crew: 0,
    sun1Status: 'Off-Site',
    sun1Crew: 0,
    sat2Status: 'Off-Site',
    sat2Crew: 0,
    sun2Status: 'Off-Site',
    sun2Crew: 0,
    offSiteDates: [],
    notes: ''
  };
  if (!tradeHolidayDraftList || tradeHolidayDraftList._org !== org) {
    tradeHolidayDraftList = JSON.parse(JSON.stringify(existing.offSiteDates || []));
    tradeHolidayDraftList._org = org;
  }
  const pEl = document.getElementById('ts-shift-pattern');
  if (!pEl) return;
  pEl.value = existing.shiftPattern || 'Mon-Fri (5x10s)';
  document.getElementById('ts-shift-hours').value = existing.shiftHours || '07:00 - 17:30';
  document.getElementById('ts-daily-crew').value = Number(existing.dailyCrew || 4);
  document.getElementById('ts-sat1-status').value = existing.sat1Status || 'Off-Site';
  document.getElementById('ts-sat1-crew').value = Number(existing.sat1Crew || 0);
  document.getElementById('ts-sun1-status').value = existing.sun1Status || 'Off-Site';
  document.getElementById('ts-sun1-crew').value = Number(existing.sun1Crew || 0);
  document.getElementById('ts-sat2-status').value = existing.sat2Status || 'Off-Site';
  document.getElementById('ts-sat2-crew').value = Number(existing.sat2Crew || 0);
  document.getElementById('ts-sun2-status').value = existing.sun2Status || 'Off-Site';
  document.getElementById('ts-sun2-crew').value = Number(existing.sun2Crew || 0);
  document.getElementById('ts-notes').value = existing.notes || '';
  const statusEl = document.getElementById('ts-last-saved-badge');
  if (statusEl) {
    statusEl.textContent = existing.updatedAt ? ('Last submitted: ' + existing.updatedAt + ' by ' + existing.updatedBy) : 'Not yet submitted this week';
  }
  renderTradeHolidayPills();
}

function renderTradeHolidayPills() {
  const wrap = document.getElementById('ts-holidays-list');
  if (!wrap) return;
  const list = tradeHolidayDraftList || [];
  if (list.length === 0) {
    wrap.innerHTML = '<span class="text-xs text-slate-400 italic">No planned holiday or off-site dates logged.</span>';
    return;
  }
  wrap.innerHTML = list.map(function(item, idx) {
    return '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">' +
      '<span>' + escapeHtml(formatShortDate(item.date) + ' - ' + item.reason) + '</span>' +
      '<button type="button" onclick="removeTradeHolidayDate(' + idx + ')" class="text-rose-600 hover:text-rose-900 font-bold">&times;</button>' +
    '</span>';
  }).join('');
}

function quickAddTradeHoliday(isoDate, reasonText) {
  if (!tradeHolidayDraftList) tradeHolidayDraftList = [];
  if (tradeHolidayDraftList.some(function(x) { return x.date === isoDate; })) {
    showToast(formatShortDate(isoDate) + ' is already in your off-site list.', 'info');
    return;
  }
  tradeHolidayDraftList.push({ date: isoDate, reason: reasonText });
  renderTradeHolidayPills();
}

function addCustomTradeHoliday() {
  const dInp = document.getElementById('ts-new-holiday-date');
  const rInp = document.getElementById('ts-new-holiday-reason');
  const dVal = dInp ? dInp.value : '';
  const rVal = ((rInp && rInp.value) || '').trim() || 'Planned Crew Off-Site';
  if (!dVal) {
    showToast('Select an off-site date first.', 'error');
    return;
  }
  quickAddTradeHoliday(dVal, rVal);
  if (rInp) rInp.value = '';
}

function removeTradeHolidayDate(idx) {
  if (!tradeHolidayDraftList) return;
  tradeHolidayDraftList.splice(idx, 1);
  renderTradeHolidayPills();
}

function saveTradeWorkSchedule() {
  const org = state.selectedTradeOrg;
  const fInp = document.getElementById('portal-foreman-input');
  const foreman = ((fInp && fInp.value) || '').trim() || getOrgByCode(org).defaultForeman || 'Foreman';
  const nowStr = '11/20 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const cleanDates = (tradeHolidayDraftList || []).map(function(x) { return { date: x.date, reason: x.reason }; });

  const record = {
    org: org,
    updatedBy: foreman,
    updatedAt: nowStr,
    shiftPattern: document.getElementById('ts-shift-pattern').value,
    shiftHours: document.getElementById('ts-shift-hours').value.trim() || '07:00 - 17:30',
    dailyCrew: Math.max(0, Number(document.getElementById('ts-daily-crew').value) || 0),
    sat1Status: document.getElementById('ts-sat1-status').value,
    sat1Crew: Math.max(0, Number(document.getElementById('ts-sat1-crew').value) || 0),
    sun1Status: document.getElementById('ts-sun1-status').value,
    sun1Crew: Math.max(0, Number(document.getElementById('ts-sun1-crew').value) || 0),
    sat2Status: document.getElementById('ts-sat2-status').value,
    sat2Crew: Math.max(0, Number(document.getElementById('ts-sat2-crew').value) || 0),
    sun2Status: document.getElementById('ts-sun2-status').value,
    sun2Crew: Math.max(0, Number(document.getElementById('ts-sun2-crew').value) || 0),
    offSiteDates: cleanDates,
    notes: document.getElementById('ts-notes').value.trim()
  };

  if (!state.tradeWorkSchedules) state.tradeWorkSchedules = {};
  state.tradeWorkSchedules[org] = record;

  recordWwpChange('TRADE_SCHEDULE', {
    actor: foreman + ' (' + org + ')',
    org: org,
    area: 'Sitewide Availability',
    taskDesc: record.shiftPattern + ' | Sat 11/21: ' + record.sat1Status,
    beforeVal: 'Work Schedule Update',
    afterVal: cleanDates.length + ' holiday/off-site date(s) logged'
  });

  saveState();
  ensureTradeScheduleLoaded();
  showToast('Submitted ' + org + ' work schedule, weekend availability & off-site dates to McGough!', 'success');
}


function renderTradePortal() {
  const showOthersEl = document.getElementById('portal-show-other-trades');
  const showOthers = showOthersEl ? showOthersEl.checked : false;
  const myTasks = state.officialTasks.filter(function(t) { return t.org === state.selectedTradeOrg && !t.hiddenEarly; });
  const myAreas = {};
  myTasks.forEach(function(t) { myAreas[t.area] = true; });

  const displayTasks = showOthers
    ? state.officialTasks.filter(function(t) {
        if (t.hiddenEarly) return false;
        return Object.keys(myAreas).length === 0 ? true : Boolean(myAreas[t.area]);
      })
    : myTasks;

  const tasksEl = document.getElementById('portal-tasks-container');
  if (tasksEl) {
    if (displayTasks.length === 0) {
      tasksEl.innerHTML = '<div class="p-6 text-center">' +
        '<p class="text-sm font-semibold text-slate-700">No active tasks currently on the Official WWP for ' + escapeHtml(state.selectedTradeOrg) + ' in ' + escapeHtml(getActiveScope().label) + '.</p>' +
        '<p class="text-xs text-slate-500 mt-1">Use the Propose New Lookahead Assignment form above to submit upcoming work for McGough approval.</p>' +
      '</div>';
    } else {
      tasksEl.innerHTML = displayTasks.map(function(t) {
        const isMine = t.org === state.selectedTradeOrg;
        const orgObj = getOrgByCode(t.org);
        const alreadyStaged = state.portalStagedItems.some(function(s) { return s.taskId === t.id; });
        const pendingApproval = getPendingForTask(t.id).length > 0;

        return '<div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ' + (isMine ? 'bg-white' : 'bg-slate-50/80 opacity-80') + '">' +
          '<div class="flex flex-col gap-1">' +
            '<div class="flex items-center gap-2 flex-wrap">' +
              '<span class="px-2 py-0.5 rounded text-[10px] font-bold text-white" style="background-color:' + escapeHtml(orgObj.color) + '">' + escapeHtml(t.org) + '</span>' +
              '<span class="text-xs font-bold text-slate-700">' + escapeHtml(t.area) + ' | WBS ' + escapeHtml(t.wbs) + '</span>' +
              '<span class="text-xs text-slate-500">' + formatShortDate(t.startDate) + ' to ' + formatShortDate(t.endDate) + ' | ' + t.percentComplete + '% Complete</span>' +
              (alreadyStaged ? '<span class="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">Modification Staged</span>' : '') +
              (pendingApproval ? '<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">Awaiting McGough Approval</span>' : '') +
            '</div>' +
            '<div class="text-sm font-semibold text-slate-900">' + escapeHtml(t.description) + '</div>' +
            (t.prerequisite ? '<div class="text-xs text-rose-700">Prerequisite: ' + escapeHtml(t.prerequisite) + '</div>' : '') +
          '</div>' +
          '<div class="shrink-0">' +
            (isMine
              ? '<button type="button" onclick="openStageTaskUpdateModal(\'' + t.id + '\')" class="px-3.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold transition">Modify / Stage Update</button>'
              : '<span class="text-[11px] font-medium text-slate-400 px-2 py-1 rounded bg-slate-100">Read-Only (Area Coordination)</span>') +
          '</div>' +
        '</div>';
      }).join('');
    }
  }

  const countEl = document.getElementById('portal-staged-count');
  if (countEl) {
    countEl.textContent = state.portalStagedItems.length + ' item' + (state.portalStagedItems.length === 1 ? '' : 's');
  }

  const stagedEl = document.getElementById('portal-staged-list');
  if (stagedEl) {
    if (state.portalStagedItems.length === 0) {
      stagedEl.innerHTML = '<div class="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg p-3">No updates staged yet. Review your current tasks below or stage a new lookahead assignment.</div>';
    } else {
      stagedEl.innerHTML = state.portalStagedItems.map(function(item, idx) {
        return '<div class="p-3 rounded-lg border border-sky-200 bg-sky-50/50 text-xs flex flex-col gap-1">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="font-bold text-sky-900">' + (item.type === 'NEW_TASK' ? '[NEW] ' : '[EXISTING MODIFIED] ') + escapeHtml(item.org) + ' | ' + escapeHtml(item.area) + '</span>' +
            '<button type="button" onclick="removePortalStagedItem(' + idx + ')" class="text-rose-600 hover:text-rose-800 font-semibold text-[11px]">Remove</button>' +
          '</div>' +
          '<div class="font-medium text-slate-800">' + escapeHtml(item.description) + '</div>' +
          '<div class="text-[11px] text-slate-600">' + formatShortDate(item.proposedStartDate) + ' &rarr; ' + formatShortDate(item.proposedEndDate) + ' | ' + item.proposedPercent + '%</div>' +
        '</div>';
      }).join('');
    }
  }
}

function openStageTaskUpdateModal(taskId) {
  const t = getTaskById(taskId);
  if (!t || t.org !== state.selectedTradeOrg) return;
  const varOpts = '<option value="">- Select if NO -</option>' + VARIANCE_CATEGORIES.map(function(vc) {
    return '<option value="' + escapeHtml(vc) + '"' + (t.varianceCategory === vc ? ' selected' : '') + '>' + escapeHtml(vc) + '</option>';
  }).join('');

  openModal(
    '<div class="p-5">' +
      '<h3 class="text-base font-bold text-slate-900">Modify Existing WWP Task (Routes for McGough Approval)</h3>' +
      '<p class="text-xs text-slate-500 mt-0.5">' + escapeHtml(t.area) + ' | Current Official Dates: ' + formatShortDate(t.startDate) + ' to ' + formatShortDate(t.endDate) + ' (Remains locked until McGough approves)</p>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">' +
        '<div class="sm:col-span-2"><label class="block font-semibold text-slate-700 mb-1">Task Scope Description</label><input id="stu-desc" type="text" value="' + escapeHtml(t.description) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Proposed Start Date</label><input id="stu-start" type="date" value="' + escapeHtml(t.startDate) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Proposed End Date</label><input id="stu-end" type="date" value="' + escapeHtml(t.endDate) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Updated % Complete</label><input id="stu-pct" type="number" min="0" max="100" value="' + Number(t.percentComplete) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Planned Crew Size</label><input id="stu-crew" type="number" min="1" max="99" value="' + Number(t.crew || 4) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Completed Commitment as Planned?</label>' +
          '<select id="stu-ppc" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white">' +
            '<option value="">In Progress / Not Due Yet</option>' +
            '<option value="YES"' + (t.completedAsPlanned === 'YES' ? ' selected' : '') + '>YES - On Plan</option>' +
            '<option value="NO"' + (t.completedAsPlanned === 'NO' ? ' selected' : '') + '>NO - Variance Occurred</option>' +
          '</select>' +
        '</div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Variance Reason (If NO)</label><select id="stu-var" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white">' + varOpts + '</select></div>' +
        '<div class="sm:col-span-2"><label class="block font-semibold text-slate-700 mb-1">Required Prerequisite / Roadblock From Others</label><input id="stu-prereq" type="text" value="' + escapeHtml(t.prerequisite || '') + '" placeholder="Leave blank if install-ready" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
        '<div class="sm:col-span-2"><label class="block font-semibold text-slate-700 mb-1">Foreman Coordination Note for McGough</label><input id="stu-comment" type="text" placeholder="e.g., Requesting date shift for overhead clearance" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
      '</div>' +
      '<div class="mt-5 flex justify-end gap-2">' +
        '<button type="button" onclick="closeModal()" class="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700">Cancel</button>' +
        '<button type="button" onclick="confirmStageTaskUpdate(\'' + t.id + '\')" class="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold">Stage Modification for Approval</button>' +
      '</div>' +
    '</div>'
  );
}

function confirmStageTaskUpdate(taskId) {
  const t = getTaskById(taskId);
  if (!t) return;
  const sDate = document.getElementById('stu-start').value;
  const eDate = document.getElementById('stu-end').value;
  const updatedDesc = (document.getElementById('stu-desc').value || '').trim() || t.description;
  if (!sDate || !eDate || eDate < sDate) {
    showToast('Please enter a valid start and end date.', 'error');
    return;
  }
  const fInp = document.getElementById('portal-foreman-input');
  const foreman = (fInp && fInp.value.trim()) || t.responsible || state.selectedTradeOrg;
  state.portalForeman = foreman;

  state.portalStagedItems = state.portalStagedItems.filter(function(x) { return x.taskId !== taskId; });
  state.portalStagedItems.push({
    subId: 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    isDemo: false,
    type: 'TASK_UPDATE',
    taskId: t.id,
    org: t.org,
    submittedBy: foreman,
    submittedAt: 'Just now',
    area: t.area,
    wbs: t.wbs,
    description: updatedDesc,
    proposedStartDate: sDate,
    proposedEndDate: eDate,
    proposedPercent: Math.min(100, Math.max(0, Number(document.getElementById('stu-pct').value) || 0)),
    proposedCrew: Math.max(1, Number(document.getElementById('stu-crew').value) || 4),
    proposedCompletedAsPlanned: document.getElementById('stu-ppc').value || null,
    proposedVarianceCategory: document.getElementById('stu-var').value || '',
    proposedPrerequisite: document.getElementById('stu-prereq').value.trim(),
    comment: document.getElementById('stu-comment').value.trim()
  });

  closeModal();
  saveState();
  renderTradePortal();
  showToast('Task modification staged! Click Submit Updates for McGough Approval when ready.', 'info');
}

function stageNewTaskFromPortal() {
  const customToggle = document.getElementById('new-task-unlisted-toggle');
  const isCustom = customToggle ? customToggle.checked : false;
  const p6Sel = document.getElementById('new-task-p6-select');
  const pickedP6Id = (!isCustom && p6Sel) ? p6Sel.value : '';
  const pickedP6Obj = pickedP6Id ? (state.p6Activities || []).find(function(a) { return a.p6Id === pickedP6Id; }) : null;
  const desc = pickedP6Obj ? pickedP6Obj.activityName : (document.getElementById('new-task-desc').value || '').trim();
  if (!pickedP6Obj && !isCustom) {
    showToast('Select one of your P6 schedule tasks above (or check Unlisted emergent scope).', 'error');
    return;
  }
  const sDate = document.getElementById('new-task-start').value;
  const eDate = document.getElementById('new-task-end').value;
  if (!desc) {
    showToast('Please enter an Assignment Description.', 'error');
    return;
  }
  if (!sDate || !eDate || eDate < sDate) {
    showToast('End date must be on or after start date.', 'error');
    return;
  }
  const fInp = document.getElementById('portal-foreman-input');
  const foreman = (fInp && fInp.value.trim()) || getOrgByCode(state.selectedTradeOrg).defaultForeman || 'Foreman';
  state.portalForeman = foreman;

  state.portalStagedItems.push({
    subId: 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    isDemo: false,
    type: 'NEW_TASK',
    taskId: null,
    p6ActivityId: pickedP6Obj ? pickedP6Obj.p6Id : '',
    org: state.selectedTradeOrg,
    submittedBy: foreman,
    submittedAt: 'Just now',
    area: document.getElementById('new-task-area').value,
    wbs: document.getElementById('new-task-wbs').value.trim() || '-',
    description: desc,
    proposedStartDate: sDate,
    proposedEndDate: eDate,
    proposedPercent: 0,
    proposedCrew: Math.max(1, Number(document.getElementById('new-task-crew').value) || 4),
    proposedCompletedAsPlanned: null,
    proposedVarianceCategory: '',
    proposedPrerequisite: document.getElementById('new-task-prereq').value.trim(),
    comment: 'New lookahead task submitted via Trade Partner Portal'
  });

  document.getElementById('new-task-desc').value = '';
  document.getElementById('new-task-prereq').value = '';
  saveState();
  renderTradePortal();
  showToast('Added new proposed task to your staged submission.', 'info');
}

function removePortalStagedItem(idx) {
  state.portalStagedItems.splice(idx, 1);
  saveState();
  renderTradePortal();
}

function submitPortalPackageToMcGough() {
  if (state.portalStagedItems.length === 0) {
    showToast('Stage at least one task update or new task before submitting.', 'error');
    return;
  }
  const count = state.portalStagedItems.length;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.portalStagedItems.forEach(function(item) {
    item.submittedAt = 'Today ' + timeStr;
    state.pendingSubmissions.unshift(item);
    recordWwpChange('TRADE_SUBMITTED', { actor: (item.submittedBy || 'Foreman') + ' (' + item.org + ')', org: item.org, area: item.area, taskDesc: item.description, beforeVal: item.type === 'NEW_TASK' ? 'New Task Proposal' : 'Existing Task Update', afterVal: item.proposedStartDate + ' to ' + item.proposedEndDate + ' (' + item.proposedPercent + '%)' });
  });
  if (typeof dispatchNotificationPing === 'function') dispatchNotificationPing('WWP_SUBMITTED', ['MCGOUGH'], state.selectedTradeOrg + ' Submitted ' + count + ' WWP Update(s)', state.selectedTradeOrg + ' (' + (state.portalForeman || 'Foreman') + ') submitted ' + count + ' WWP lookahead item(s) for McGough approval.');
  state.portalStagedItems = [];
  saveState();
  renderAll();

  openModal(
    '<div class="p-6 text-center">' +
      '<div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">' +
        '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' +
      '</div>' +
      '<h3 class="text-base font-bold text-slate-900">Submitted ' + count + ' Update(s) to McGough Supervision!</h3>' +
      '<p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">Both modified existing tasks and new proposals stay isolated in staging until McGough reviews and approves them.</p>' +
      '<div class="mt-5 flex justify-center">' +
        '<button type="button" onclick="closeModal()" class="px-5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold">Done</button>' +
      '</div>' +
    '</div>'
  );
}
