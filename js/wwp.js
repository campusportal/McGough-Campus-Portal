// =========================================================================
// TAB 1: LOOKAHEAD & OFFICIAL WWP (Editable for McGough | Read-Only for AD Const)
// Includes Per-Task Undo, Bar-Change Verification Pop-up & Active MOP Clash Badges
// =========================================================================

let inlineRowState = null; // { afterTaskId: null | string, area: string, wbs: string, org: string, responsible: string, crew: number, description: string, startDate: string, endDate: string, percentComplete: number, prerequisite: string }

function startInlineRowInArea(areaName) {
  if (isWwpReadOnlySession()) return;
  state.collapsedAreas[areaName] = false;
  const areaTasks = state.officialTasks.filter(function(t) { return t.area === areaName && !t.hiddenEarly; });
  const lastTask = areaTasks.length > 0 ? areaTasks[areaTasks.length - 1] : null;
  const defaultOrg = lastTask ? lastTask.org : 'LoenBro';
  inlineRowState = {
    afterTaskId: lastTask ? lastTask.id : null,
    area: areaName,
    wbs: lastTask ? (lastTask.wbs || '8') : '8',
    org: defaultOrg,
    responsible: lastTask ? (lastTask.responsible || getOrgByCode(defaultOrg).defaultForeman || '') : (getOrgByCode(defaultOrg).defaultForeman || ''),
    crew: lastTask ? (lastTask.crew || 4) : 4,
    description: '',
    startDate: state.lookaheadStart,
    endDate: addDaysIso(state.lookaheadStart, 4),
    percentComplete: 0,
    prerequisite: ''
  };
  renderLookaheadView();
  focusInlineRowDesc();
}

function startInlineRowAfterTask(taskId) {
  if (isWwpReadOnlySession()) return;
  const ref = getTaskById(taskId);
  if (!ref) return;
  inlineRowState = {
    afterTaskId: ref.id,
    area: ref.area,
    wbs: ref.wbs || '8',
    org: ref.org,
    responsible: ref.responsible || getOrgByCode(ref.org).defaultForeman || '',
    crew: ref.crew || 4,
    description: '',
    startDate: ref.startDate,
    endDate: ref.endDate,
    percentComplete: 0,
    prerequisite: ''
  };
  renderLookaheadView();
  focusInlineRowDesc();
}

function focusInlineRowDesc() {
  setTimeout(function() {
    const inp = document.getElementById('inline-row-desc');
    if (inp) inp.focus();
  }, 30);
}

function handleInlineRowOrgChange(orgCode) {
  if (!inlineRowState) return;
  syncInlineRowDomToState();
  inlineRowState.org = orgCode;
  const defF = getOrgByCode(orgCode).defaultForeman || '';
  if (defF) inlineRowState.responsible = defF;
  const rInp = document.getElementById('inline-row-resp');
  if (rInp && defF) rInp.value = defF;
}

function syncInlineRowDomToState() {
  if (!inlineRowState) return;
  const d = document.getElementById('inline-row-desc');
  const w = document.getElementById('inline-row-wbs');
  const o = document.getElementById('inline-row-org');
  const r = document.getElementById('inline-row-resp');
  const p = document.getElementById('inline-row-pct');
  const s = document.getElementById('inline-row-start');
  const e = document.getElementById('inline-row-end');
  const c = document.getElementById('inline-row-crew');
  const pr = document.getElementById('inline-row-prereq');
  if (d) inlineRowState.description = d.value;
  if (w) inlineRowState.wbs = w.value;
  if (o) inlineRowState.org = o.value;
  if (r) inlineRowState.responsible = r.value;
  if (p) inlineRowState.percentComplete = Number(p.value) || 0;
  if (s) inlineRowState.startDate = s.value;
  if (e) inlineRowState.endDate = e.value;
  if (c) inlineRowState.crew = Number(c.value) || 4;
  if (pr) inlineRowState.prerequisite = pr.value;
}

function handleInlineRowKeydown(event) {
  if (!event) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    cancelInlineRowInsert();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    commitInlineRowInsert(!event.shiftKey);
  }
}

function cancelInlineRowInsert() {
  inlineRowState = null;
  renderLookaheadView();
}

function commitInlineRowInsert(keepInsertingNext) {
  if (!inlineRowState) return;
  syncInlineRowDomToState();
  const desc = (inlineRowState.description || '').trim();
  const sDate = inlineRowState.startDate;
  const eDate = inlineRowState.endDate;
  if (!desc) {
    showToast('Enter an Assignment Description in the inline row.', 'error');
    focusInlineRowDesc();
    return;
  }
  if (!sDate || !eDate || eDate < sDate) {
    showToast('Inline row End Date must be on or after Start Date.', 'error');
    return;
  }
  const pct = Math.min(100, Math.max(0, Number(inlineRowState.percentComplete) || 0));
  const prereq = (inlineRowState.prerequisite || '').trim();
  const newTask = {
    id: 't-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    area: inlineRowState.area,
    wbs: (inlineRowState.wbs || '-').trim() || '-',
    org: inlineRowState.org,
    responsible: (inlineRowState.responsible || '').trim(),
    crew: Math.max(1, Number(inlineRowState.crew) || 4),
    description: desc,
    startDate: sDate,
    endDate: eDate,
    percentComplete: pct,
    dailyPlan: buildPlanRange(sDate, eDate, { markStart: true, markComplete: pct >= 100 }),
    completedAsPlanned: pct >= 100 ? 'YES' : null,
    varianceCategory: '',
    prerequisite: prereq,
    prerequisiteStatus: prereq ? 'OPEN' : 'CLEARED',
    hiddenEarly: false,
    undoStack: []
  };

  if (inlineRowState.afterTaskId) {
    const idx = state.officialTasks.findIndex(function(t) { return t.id === inlineRowState.afterTaskId; });
    if (idx !== -1) {
      state.officialTasks.splice(idx + 1, 0, newTask);
    } else {
      insertTaskGroupedWithContractor(newTask);
    }
  } else {
    insertTaskGroupedWithContractor(newTask);
  }

  recordWwpChange('LIVE_ROW_INSERT', {
    org: newTask.org,
    area: newTask.area,
    taskDesc: newTask.description,
    beforeVal: 'Live Excel Row Insert',
    afterVal: newTask.startDate + ' to ' + newTask.endDate + ' (Crew ' + newTask.crew + ')'
  });

  if (keepInsertingNext) {
    inlineRowState = {
      afterTaskId: newTask.id,
      area: newTask.area,
      wbs: newTask.wbs,
      org: newTask.org,
      responsible: newTask.responsible,
      crew: newTask.crew,
      description: '',
      startDate: newTask.startDate,
      endDate: newTask.endDate,
      percentComplete: 0,
      prerequisite: ''
    };
    saveState();
    renderLookaheadView();
    focusInlineRowDesc();
  } else {
    inlineRowState = null;
    saveState();
    renderAll();
    showToast('Inserted "' + newTask.description + '" into ' + newTask.area + '.', 'success');
  }
}

function buildInlineExcelRowHtml(dateColsCount) {
  if (!inlineRowState) return '';
  const orgOpts = state.organizations.map(function(o) {
    return '<option value="' + escapeHtml(o.code) + '"' + (o.code === inlineRowState.org ? ' selected' : '') + '>' + escapeHtml(o.code) + '</option>';
  }).join('');

  return '<tr id="inline-excel-entry-row" onkeydown="handleInlineRowKeydown(event)" class="bg-sky-100/95 border-y-2 border-sky-500 shadow-inner">' +
    '<td class="sticky-col-left bg-sky-100 px-2.5 py-2 border-r border-sky-300">' +
      '<div class="text-[10px] font-bold uppercase tracking-wider text-sky-900 mb-1">New Live Row in ' + escapeHtml(inlineRowState.area) + ' (Enter = Save &amp; Next | Esc = Cancel)</div>' +
      '<input id="inline-row-desc" type="text" value="' + escapeHtml(inlineRowState.description) + '" placeholder="Type assignment scope &amp; sequence..." class="w-full px-2.5 py-1.5 rounded border border-sky-400 bg-white text-xs font-semibold text-slate-900" />' +
    '</td>' +
    '<td class="px-1.5 py-2 border-r border-sky-300"><input id="inline-row-wbs" type="text" value="' + escapeHtml(inlineRowState.wbs) + '" class="w-full px-1.5 py-1.5 rounded border border-sky-300 bg-white text-center font-mono text-xs" /></td>' +
    '<td class="px-1.5 py-2 border-r border-sky-300"><select id="inline-row-org" onchange="handleInlineRowOrgChange(this.value)" class="w-full px-1.5 py-1.5 rounded border border-sky-300 bg-white text-xs font-bold">' + orgOpts + '</select></td>' +
    '<td class="px-1.5 py-2 border-r border-sky-300"><input id="inline-row-resp" type="text" value="' + escapeHtml(inlineRowState.responsible) + '" placeholder="Foreman" class="w-full px-2 py-1.5 rounded border border-sky-300 bg-white text-xs" /></td>' +
    '<td class="px-1.5 py-2 border-r border-sky-300"><input id="inline-row-pct" type="number" min="0" max="100" value="' + Number(inlineRowState.percentComplete) + '" class="w-full px-1 py-1.5 rounded border border-sky-300 bg-white text-center text-xs font-semibold" /></td>' +
    '<td colspan="' + (dateColsCount + 2) + '" class="px-3 py-2 bg-sky-50/95">' +
      '<div class="flex flex-wrap items-center justify-between gap-2 text-xs">' +
        '<div class="flex flex-wrap items-center gap-2">' +
          '<label class="font-semibold text-slate-700">Start: <input id="inline-row-start" type="date" value="' + escapeHtml(inlineRowState.startDate) + '" class="ml-1 px-2 py-1 rounded border border-sky-300 bg-white" /></label>' +
          '<label class="font-semibold text-slate-700">End: <input id="inline-row-end" type="date" value="' + escapeHtml(inlineRowState.endDate) + '" class="ml-1 px-2 py-1 rounded border border-sky-300 bg-white" /></label>' +
          '<label class="font-semibold text-slate-700">Crew: <input id="inline-row-crew" type="number" min="1" max="99" value="' + Number(inlineRowState.crew) + '" class="ml-1 w-14 px-2 py-1 rounded border border-sky-300 bg-white" /></label>' +
          '<input id="inline-row-prereq" type="text" value="' + escapeHtml(inlineRowState.prerequisite) + '" placeholder="Optional prerequisite / roadblock" class="w-44 px-2 py-1 rounded border border-sky-300 bg-white" />' +
        '</div>' +
        '<div class="flex items-center gap-1.5">' +
          '<button type="button" onclick="commitInlineRowInsert(true)" class="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold shadow-sm">Save &amp; +Next (Enter)</button>' +
          '<button type="button" onclick="commitInlineRowInsert(false)" class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold">Save &amp; Done</button>' +
          '<button type="button" onclick="cancelInlineRowInsert()" class="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold">Cancel</button>' +
        '</div>' +
      '</div>' +
    '</td>' +
  '</tr>';
}

// =========================================================================
// FULLSCREEN INTERACTIVE WWP MEETING MODE & WEEKLY BASELINE FREEZE
// =========================================================================
function toggleWwpMeetingMode(forceVal) {
  if (state.authRole !== 'mcgough') return;
  const nextMode = typeof forceVal === 'boolean' ? forceVal : !state.meetingMode;
  state.meetingMode = nextMode;
  state.portalMode = 'gc';
  state.gcTab = 'lookahead';

  if (nextMode) {
    state.muteMeetingToasts = true;
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function() {});
      }
    } catch (e) {}
  } else {
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(function() {});
      }
    } catch (e) {}
  }
  renderAll();
}

function toggleMuteMeetingToasts() {
  state.muteMeetingToasts = !state.muteMeetingToasts;
  renderMeetingModeBar();
}

function dismissTeamsFocusTip() {
  state.dismissedTeamsTip = true;
  renderMeetingModeBar();
}

function renderMeetingModeBar() {
  const bar = document.getElementById('meeting-mode-bar');
  if (!bar) return;
  const sc = getActiveScope();
  const wkNum = computePlanningWeekNumber(state.lookaheadStart);
  const frozenBadge = state.frozenBaseline
    ? '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[11px] font-bold">Baseline Frozen (' + escapeHtml(state.frozenBaseline.frozenAt) + ')</span>'
    : '<span class="px-2 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-400/40 text-[11px] font-semibold">Unfrozen Working Plan</span>';

  bar.innerHTML =
    '<div class="bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-1.5 no-print">' +
      '<div class="flex flex-wrap items-center justify-between gap-2 text-xs">' +
        '<div class="flex items-center gap-2 flex-wrap">' +
          '<span class="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold uppercase tracking-wider text-[10px]">WWP Meeting Mode</span>' +
          '<strong class="text-sm text-white">' + escapeHtml(sc.prefix + ' - ' + sc.campus + ' | ' + sc.building) + ' (Week ' + wkNum + ')</strong>' +
          frozenBadge +
        '</div>' +
        '<div class="flex flex-wrap items-center gap-1.5">' +
          '<button type="button" onclick="startInlineRowInArea(state.areas[0])" class="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold">+ Insert Live Row</button>' +
          '<button type="button" onclick="freezeWeeklyBaseline()" class="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">' + (state.frozenBaseline ? 'Re-Freeze Baseline' : 'Freeze Weekly Baseline') + '</button>' +
          '<button type="button" onclick="printTabloidWwp()" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 font-semibold">Print 11x17 WWP</button>' +
          '<button type="button" onclick="toggleMuteMeetingToasts()" class="px-2.5 py-1 rounded-lg border font-semibold ' + (state.muteMeetingToasts ? 'bg-amber-500/20 border-amber-400/50 text-amber-200' : 'bg-slate-800 border-slate-600 text-slate-300') + '">' + (state.muteMeetingToasts ? 'In-App Popups: Muted' : 'In-App Popups: Active') + '</button>' +
          '<button type="button" onclick="toggleWwpMeetingMode(false)" class="px-3 py-1 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold">Exit Meeting Mode</button>' +
        '</div>' +
      '</div>' +
      (!state.dismissedTeamsTip
        ? '<div class="flex items-center justify-between gap-2 px-2.5 py-1 rounded bg-slate-800/90 border border-slate-700 text-[11px] text-slate-300">' +
            '<span><strong>Conference Room Notification Shield:</strong> In-app popups are muted. To block Outlook &amp; phone alerts while keeping <strong>Microsoft Teams</strong> active on this screen, enable Windows <em>Do Not Disturb</em> with Teams added under <em>Priority Notifications</em>.</span>' +
            '<button type="button" onclick="dismissTeamsFocusTip()" class="text-slate-400 hover:text-white font-bold px-1.5">Dismiss</button>' +
          '</div>'
        : '') +
    '</div>';
}

function freezeWeeklyBaseline() {
  if (state.authRole !== 'mcgough') return;
  const map = {};
  state.officialTasks.forEach(function(t) {
    if (!t.hiddenEarly) {
      map[t.id] = {
        startDate: t.startDate,
        endDate: t.endDate,
        percentComplete: t.percentComplete,
        description: t.description
      };
    }
  });
  const stamp = '11/20 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const app = getActiveApprover();
  state.frozenBaseline = {
    frozenAt: stamp,
    frozenBy: app.name,
    weekNum: computePlanningWeekNumber(state.lookaheadStart),
    tasksById: map
  };
  recordWwpChange('BASELINE_FREEZE', {
    org: 'All Active Trades',
    area: 'All Areas',
    taskDesc: 'Frozen Week ' + state.frozenBaseline.weekNum + ' Official Baseline (' + Object.keys(map).length + ' tasks)',
    beforeVal: 'Working Schedule',
    afterVal: 'Locked Baseline @ ' + stamp
  });
  saveState();
  renderAll();
  const prevMute = state.muteMeetingToasts;
  state.muteMeetingToasts = false;
  showToast('Froze Week ' + state.frozenBaseline.weekNum + ' WWP Baseline! Any mid-week shifts now track against baseline.', 'success');
  state.muteMeetingToasts = prevMute;
}

function clearFrozenBaseline() {
  if (state.authRole !== 'mcgough') return;
  state.frozenBaseline = null;
  saveState();
  renderAll();
  showToast('Cleared frozen baseline lock.', 'info');
}

function renderChangeLogView() {
  const container = document.getElementById('changelog-list-container');
  const statusBanner = document.getElementById('changelog-baseline-banner');
  if (!container) return;

  if (statusBanner) {
    if (state.frozenBaseline) {
      statusBanner.innerHTML =
        '<div class="p-3.5 rounded-xl bg-indigo-50 border border-indigo-300 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-950">' +
          '<div><strong>Week ' + state.frozenBaseline.weekNum + ' Baseline Frozen:</strong> Locked on ' + escapeHtml(state.frozenBaseline.frozenAt) + ' by <strong>' + escapeHtml(state.frozenBaseline.frozenBy) + '</strong> (' + Object.keys(state.frozenBaseline.tasksById || {}).length + ' committed tasks). Subsequent edits are flagged as Post-Freeze Changes.</div>' +
          '<div class="flex items-center gap-2">' +
            '<button type="button" onclick="freezeWeeklyBaseline()" class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold">Re-Snapshot Baseline</button>' +
            '<button type="button" onclick="clearFrozenBaseline()" class="px-3 py-1.5 rounded-lg border border-indigo-300 bg-white text-indigo-900 font-semibold">Unlock Baseline</button>' +
          '</div>' +
        '</div>';
    } else {
      statusBanner.innerHTML =
        '<div class="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950">' +
          '<div><strong>Weekly Baseline Not Yet Frozen:</strong> Click <em>Freeze Weekly Baseline</em> at the end of your WWP Huddle right before printing the 11x17 wall chart so mid-week schedule changes are highlighted.</div>' +
          '<button type="button" onclick="freezeWeeklyBaseline()" class="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-sm">Freeze Weekly Baseline Now</button>' +
        '</div>';
    }
  }

  const catF = ((document.getElementById('cl-filter-cat') || {}).value) || 'ALL';
  const q = (((document.getElementById('cl-filter-search') || {}).value) || '').trim().toLowerCase();

  const entries = (state.wwpChangeLog || []).filter(function(item) {
    if (catF === 'POST_FREEZE' && !item.postFreeze) return false;
    if (catF !== 'ALL' && catF !== 'POST_FREEZE' && item.category !== catF) return false;
    if (q) {
      const hay = [item.actor, item.org, item.area, item.taskDesc, item.beforeVal, item.afterVal, item.category].join(' ').toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });

  if (entries.length === 0) {
    container.innerHTML = '<div class="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">No WWP change log entries recorded yet matching this filter. Submit a trade update, approve a queued item, insert a live row, or adjust a Gantt bar to populate the live audit log.</div>';
    return;
  }

  container.innerHTML = '<div class="divide-y divide-slate-200 bg-white rounded-xl border border-slate-300 overflow-hidden">' +
    entries.map(function(e) {
      const catMeta = {
        TRADE_SUBMITTED: { lbl: 'Trade Submitted', cls: 'bg-sky-100 text-sky-900 border-sky-300' },
        MCGOUGH_APPROVED: { lbl: 'McGough Approved', cls: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        MCGOUGH_RETURNED: { lbl: 'McGough Returned', cls: 'bg-rose-100 text-rose-900 border-rose-300' },
        LIVE_ROW_INSERT: { lbl: 'Live Row Inserted', cls: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
        LIVE_MCGOUGH_EDIT: { lbl: 'Live McGough Edit', cls: 'bg-amber-100 text-amber-950 border-amber-300' },
        TASK_UNDO: { lbl: 'Task Undo', cls: 'bg-slate-200 text-slate-800 border-slate-400' },
        BASELINE_FREEZE: { lbl: 'Baseline Frozen', cls: 'bg-indigo-600 text-white border-indigo-700' },
        TRADE_SCHEDULE: { lbl: 'Crew Schedule / Holiday', cls: 'bg-emerald-50 text-emerald-900 border-emerald-300' }
      }[e.category] || { lbl: e.category, cls: 'bg-slate-100 text-slate-800 border-slate-300' };

      return '<div class="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-50">' +
        '<div class="flex flex-col gap-1">' +
          '<div class="flex items-center gap-2 flex-wrap">' +
            '<span class="px-2 py-0.5 rounded border text-[10px] font-bold uppercase ' + catMeta.cls + '">' + escapeHtml(catMeta.lbl) + '</span>' +
            (e.postFreeze ? '<span class="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">POST-FREEZE CHANGE</span>' : '') +
            '<strong class="text-slate-900">' + escapeHtml(e.org) + '</strong>' +
            '<span class="text-slate-500">[' + escapeHtml(e.area) + ']</span>' +
            '<span class="font-semibold text-slate-800">' + escapeHtml(e.taskDesc) + '</span>' +
          '</div>' +
          '<div class="text-[11px] text-slate-600">' +
            (e.beforeVal ? '<span>Before: <strong>' + escapeHtml(e.beforeVal) + '</strong> &rarr; </span>' : '') +
            '<span>After: <strong class="text-slate-900">' + escapeHtml(e.afterVal) + '</strong></span>' +
          '</div>' +
        '</div>' +
        '<div class="text-right shrink-0 text-[11px] text-slate-500">' +
          '<div class="font-semibold text-slate-800">' + escapeHtml(e.actor) + '</div>' +
          '<div>' + escapeHtml(e.timestamp) + '</div>' +
        '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

function exportChangeLogCsv() {
  const rows = [['Timestamp', 'Category', 'Post-Freeze', 'Actor', 'Organization', 'Area', 'Task / Scope', 'Before', 'After'].join(',')];
  (state.wwpChangeLog || []).forEach(function(e) {
    rows.push([e.timestamp, e.category, e.postFreeze ? 'YES' : 'NO', e.actor, e.org, e.area, e.taskDesc, e.beforeVal, e.afterVal].map(function(v) {
      return '"' + String(v || '').replace(/"/g, '""') + '"';
    }).join(','));
  });
  downloadBlob(rows.join('\n'), getActiveScope().prefix + '_WWP_Change_Log.csv', 'text/csv;charset=utf-8;');
  showToast('Exported WWP Change Log CSV!', 'success');
}

// Render Trade Crew Work Schedules & Holiday Off-Site Matrix inside McGough Approvals/Analytics
function renderTradeSchedulesSummaryHtml() {
  const keys = Object.keys(state.tradeWorkSchedules || {}).sort();
  if (keys.length === 0) {
    return '<div class="text-xs text-slate-500 italic">No contractor shift or holiday schedules submitted for this scope yet.</div>';
  }
  return '<div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">' +
    keys.map(function(orgCode) {
      const sc = state.tradeWorkSchedules[orgCode];
      const orgObj = getOrgByCode(orgCode);
      const holidays = (sc.offSiteDates || []).map(function(d) { return formatShortDate(d.date) + ' (' + d.reason + ')'; }).join(', ') || 'None logged';
      return '<div class="p-3 rounded-xl bg-white border border-slate-300 flex flex-col gap-1 shadow-sm">' +
        '<div class="flex items-center justify-between">' +
          '<span class="px-2 py-0.5 rounded text-[11px] font-bold text-white" style="background-color:' + escapeHtml(orgObj.color) + '">' + escapeHtml(orgCode) + '</span>' +
          '<span class="text-[11px] font-bold text-slate-700">' + escapeHtml(sc.shiftPattern) + ' (' + escapeHtml(sc.shiftHours) + ')</span>' +
        '</div>' +
        '<div class="text-[11px] text-slate-600 mt-0.5"><strong>Daily Crew:</strong> ' + Number(sc.dailyCrew || 0) + ' | <strong>Sat 11/21:</strong> ' + escapeHtml(sc.sat1Status) + (sc.sat1Crew ? ' (' + sc.sat1Crew + ')' : '') + ' | <strong>Sun 11/22:</strong> ' + escapeHtml(sc.sun1Status) + '</div>' +
        '<div class="text-[11px] text-rose-800"><strong>Off-Site / Holidays:</strong> ' + escapeHtml(holidays) + '</div>' +
        (sc.notes ? '<div class="text-[11px] text-slate-500 italic">"' + escapeHtml(sc.notes) + '"</div>' : '') +
      '</div>';
    }).join('') +
  '</div>';
}


function findMatchingP6ForTask(task) {
  if (!task || !Array.isArray(state.p6Activities)) return null;
  if (task.p6ActivityId) {
    const byId = state.p6Activities.find(function(a) { return a.p6Id === task.p6ActivityId; });
    if (byId) return byId;
  }
  const byLinked = state.p6Activities.find(function(a) { return a.linkedTaskId === task.id; });
  if (byLinked) return byLinked;
  const cleanDesc = String(task.description || '').toLowerCase().trim();
  return state.p6Activities.find(function(a) {
    return a.org === task.org && String(a.activityName || '').toLowerCase().trim() === cleanDesc;
  }) || null;
}

function toggleP6Overlay() {
  state.showP6Overlay = !state.showP6Overlay;
  if (!isWwpReadOnlySession()) saveState();
  renderLookaheadView();
}

function isWwpReadOnlySession() {
  return state.authRole !== 'mcgough';
}

function shiftLookaheadDays(delta) {
  state.lookaheadStart = addDaysIso(state.lookaheadStart, delta);
  const inp = document.getElementById('lookahead-start-input');
  if (inp) inp.value = state.lookaheadStart;
  if (!isWwpReadOnlySession()) saveState();
  renderLookaheadView();
  showToast('Window shifted to ' + formatShortDate(state.lookaheadStart) + ' - tasks stay anchored to calendar dates.', 'info');
}

function resetLookaheadToday() {
  state.lookaheadStart = BASE_ANCHOR_DATE;
  const inp = document.getElementById('lookahead-start-input');
  if (inp) inp.value = state.lookaheadStart;
  if (!isWwpReadOnlySession()) saveState();
  renderLookaheadView();
}

function setLookaheadStartDate(val) {
  if (!val) return;
  state.lookaheadStart = val;
  if (!isWwpReadOnlySession()) saveState();
  renderLookaheadView();
}

function setHorizonWeeks(daysVal) {
  state.horizonDays = Number(daysVal) || 16;
  if (!isWwpReadOnlySession()) saveState();
  renderLookaheadView();
}

function setDisplayMode(modeVal) {
  state.displayMode = modeVal || 'hybrid';
  if (!isWwpReadOnlySession()) saveState();
  renderLookaheadView();
}

function applyLookaheadFilters() {
  renderLookaheadView();
}

function toggleAreaCollapse(areaName) {
  state.collapsedAreas[areaName] = !state.collapsedAreas[areaName];
  if (!isWwpReadOnlySession()) saveState();
  renderLookaheadView();
}

function expandCollapseAllAreas() {
  const anyCollapsed = state.areas.some(function(a) { return Boolean(state.collapsedAreas[a]); });
  state.areas.forEach(function(a) {
    state.collapsedAreas[a] = !anyCollapsed;
  });
  if (!isWwpReadOnlySession()) saveState();
  renderLookaheadView();
}

function computePpcStats() {
  let yesCount = 0;
  let noCount = 0;
  state.officialTasks.forEach(function(t) {
    if (t.completedAsPlanned === 'YES') yesCount++;
    else if (t.completedAsPlanned === 'NO') noCount++;
  });
  const totalEval = yesCount + noCount;
  const pct = totalEval > 0 ? Math.round((yesCount / totalEval) * 100) : 100;
  return { yesCount: yesCount, noCount: noCount, totalEval: totalEval, pct: pct };
}

function renderLookaheadView() {
  const readOnly = isWwpReadOnlySession();
  const inp = document.getElementById('lookahead-start-input');
  if (inp && inp.value !== state.lookaheadStart) inp.value = state.lookaheadStart;

  const windowStart = state.lookaheadStart;
  const windowEnd = addDaysIso(windowStart, state.horizonDays - 1);

  const dates = [];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  for (let i = 0; i < state.horizonDays; i++) {
    const iso = addDaysIso(windowStart, i);
    const dObj = parseIsoDate(iso);
    const dow = dObj.getDay();
    dates.push({
      iso: iso,
      shortLabel: (dObj.getMonth() + 1) + '/' + dObj.getDate(),
      dowLabel: dayNames[dow],
      isWeekend: dow === 0 || dow === 6,
      isToday: iso === BASE_ANCHOR_DATE
    });
  }

  const ppc = computePpcStats();
  const activeWindowTasks = state.officialTasks.filter(function(t) {
    return t.endDate >= windowStart && t.startDate <= windowEnd;
  });
  const activeOrgsSet = {};
  activeWindowTasks.forEach(function(t) { activeOrgsSet[t.org] = true; });
  const openRoadblocks = state.officialTasks.filter(function(t) {
    return t.prerequisite && t.prerequisiteStatus !== 'CLEARED';
  }).length;

  const kpiStrip = document.getElementById('lookahead-kpi-strip');
  const hiddenEarlyCount = state.officialTasks.filter(function(t) { return Boolean(t.hiddenEarly); }).length;
  const hiddenBtnLbl = document.getElementById('hidden-tasks-btn-label');
  const p6Btn = document.getElementById('toggle-p6-overlay-btn');
  if (p6Btn) {
    p6Btn.textContent = state.showP6Overlay ? 'P6 Overlay: ON' : 'P6 Overlay: OFF';
    p6Btn.className = state.showP6Overlay ? 'px-2.5 py-1.5 rounded-lg border border-emerald-500 bg-emerald-700 text-white text-xs font-bold transition shadow-sm' : 'px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold transition';
  }
  const hiddenBtn = document.getElementById('toggle-hidden-tasks-btn');
  if (hiddenBtnLbl && hiddenBtn) {
    hiddenBtnLbl.textContent = (state.showHiddenEarly ? 'Showing Hidden (' : 'Hidden Early (') + hiddenEarlyCount + ')';
    hiddenBtn.className = state.showHiddenEarly
      ? 'px-2.5 py-1.5 rounded-lg border border-indigo-400 bg-indigo-100 text-xs font-bold text-indigo-950 transition flex items-center gap-1.5'
      : 'px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-200/90 hover:bg-slate-300/70 text-xs font-semibold text-slate-800 transition flex items-center gap-1.5';
  }

  if (kpiStrip) {
    const kpiCards = [
      {
        label: '% Planned Complete (PPC)',
        value: ppc.pct + '%',
        sub: ppc.yesCount + ' Yes / ' + ppc.totalEval + ' evaluated commitments',
        tone: 'text-emerald-900 bg-emerald-100/85 border-emerald-300'
      },
      {
        label: 'Active Window Tasks (' + formatShortDate(windowStart) + ' - ' + formatShortDate(windowEnd) + ')',
        value: String(activeWindowTasks.filter(function(t) { return !t.hiddenEarly; }).length),
        sub: state.officialTasks.length + ' official tasks in ' + getActiveScope().prefix,
        tone: 'text-slate-900 bg-slate-100 border-slate-300'
      },
      {
        label: 'Active Trades Scheduled',
        value: Object.keys(activeOrgsSet).length + ' / ' + state.organizations.length,
        sub: 'Grouped by contractor per Area',
        tone: 'text-sky-900 bg-sky-100/70 border-sky-300'
      }
    ];

    if (!readOnly) {
      kpiCards.push(
        {
          label: 'Pending Trade Submissions',
          value: String(state.pendingSubmissions.length),
          sub: state.pendingSubmissions.length > 0 ? 'Click Approval Queue to review' : 'All trade updates merged',
          tone: state.pendingSubmissions.length > 0 ? 'text-amber-950 bg-amber-100/90 border-amber-300 cursor-pointer' : 'text-slate-800 bg-slate-100 border-slate-300',
          action: "switchGcTab('approvals')"
        },
        {
          label: 'Open Prerequisites / Roadblocks',
          value: String(openRoadblocks),
          sub: 'Make-ready handoffs tracked',
          tone: openRoadblocks > 0 ? 'text-rose-950 bg-rose-100/85 border-rose-300 cursor-pointer' : 'text-emerald-900 bg-slate-100 border-slate-300',
          action: "switchGcTab('roadblocks')"
        }
      );
    } else {
      kpiCards.push({
        label: 'Open Prerequisites',
        value: String(openRoadblocks),
        sub: 'Read-only field constraint count',
        tone: 'text-slate-900 bg-slate-100 border-slate-300'
      });
    }

    kpiStrip.innerHTML = kpiCards.map(function(card) {
      const clickAttr = (!readOnly && card.action) ? ' onclick="' + card.action + '"' : '';
      return '<div' + clickAttr + ' class="p-3 rounded-xl border shadow-sm transition ' + card.tone + '">' +
        '<div class="text-[11px] font-semibold uppercase tracking-wider opacity-80">' + escapeHtml(card.label) + '</div>' +
        '<div class="text-xl sm:text-2xl font-bold mt-0.5">' + escapeHtml(card.value) + '</div>' +
        '<div class="text-[11px] opacity-75 mt-0.5 truncate">' + escapeHtml(card.sub) + '</div>' +
      '</div>';
    }).join('');
  }

  const horizonGroups = [];
  let idx = 0;
  if (state.horizonDays === 16 && windowStart === '2026-11-18') {
    horizonGroups.push({ label: "NEXT WEEK'S WORK", span: 2 });
    horizonGroups.push({ label: 'TWO WEEKS AHEAD', span: 7 });
    horizonGroups.push({ label: 'THREE WEEKS AHEAD', span: 7 });
  } else {
    let weekCounter = 1;
    while (idx < dates.length) {
      const chunk = Math.min(7, dates.length - idx);
      const lbl = weekCounter === 1 ? 'WEEK 1 (COMMITMENT WINDOW)' : 'WEEK ' + weekCounter + ' LOOKAHEAD';
      horizonGroups.push({ label: lbl, span: chunk });
      idx += chunk;
      weekCounter++;
    }
  }

  const searchEl = document.getElementById('filter-search');
  const areaEl = document.getElementById('filter-area');
  const orgEl = document.getElementById('filter-org');
  const statusEl = document.getElementById('filter-status');
  const q = ((searchEl && searchEl.value) || '').trim().toLowerCase();
  const areaFilter = (areaEl && areaEl.value) || 'ALL';
  const orgFilter = (orgEl && orgEl.value) || 'ALL';
  const statusFilter = (statusEl && statusEl.value) || 'ALL';

  normalizeContractorGrouping();

  const filteredTasks = state.officialTasks.filter(function(t) {
    if (!state.showHiddenEarly && t.hiddenEarly) return false;
    if (areaFilter !== 'ALL' && t.area !== areaFilter) return false;
    if (orgFilter !== 'ALL' && t.org !== orgFilter) return false;
    if (statusFilter === 'PENDING_SUBMISSION' && getPendingForTask(t.id).length === 0) return false;
    if (statusFilter === 'HAS_PREREQ' && (!t.prerequisite || t.prerequisiteStatus === 'CLEARED')) return false;
    if (statusFilter === 'IN_WINDOW' && (t.endDate < windowStart || t.startDate > windowEnd)) return false;
    if (statusFilter === 'COMPLETED' && t.percentComplete < 100) return false;
    if (q) {
      const hay = [t.wbs, t.area, t.description, t.org, t.responsible, t.prerequisite].join(' ').toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });

  let html = '<table class="w-full border-collapse text-left text-xs select-none">';
  html += '<thead class="sticky-header-top bg-slate-900 text-white shadow-sm">';
  html += '<tr class="border-b border-slate-700 text-[10px] uppercase tracking-wider">';
  html += '<th class="sticky-col-left bg-slate-900 px-3 py-1.5 font-bold text-slate-300 border-r border-slate-700">Official Assignment (' + escapeHtml(getActiveScope().prefix) + ')</th>';
  html += '<th colspan="4" class="bg-slate-900 px-3 py-1.5 font-bold text-slate-300 border-r border-slate-700">WBS &amp; Trade Ownership</th>';
  horizonGroups.forEach(function(g) {
    html += '<th colspan="' + g.span + '" class="px-2 py-1.5 text-center font-bold bg-slate-800 text-slate-200 border-r border-slate-700">' + escapeHtml(g.label) + '</th>';
  });
  html += '<th colspan="2" class="px-2.5 py-1.5 text-center font-bold bg-slate-900 text-slate-300">PPC &amp; Make-Ready</th>';
  html += '</tr>';

  html += '<tr class="bg-slate-800 text-slate-200 border-b border-slate-700 text-[11px]">';
  html += '<th class="sticky-col-left bg-slate-800 px-3 py-2 min-w-[250px] max-w-[330px] font-semibold border-r border-slate-700">Assignment Description</th>';
  html += '<th class="px-2 py-2 w-12 text-center font-semibold border-r border-slate-700">WBS</th>';
  html += '<th class="px-2.5 py-2 min-w-[125px] font-semibold border-r border-slate-700">Organization</th>';
  html += '<th class="px-2.5 py-2 min-w-[110px] font-semibold border-r border-slate-700">Responsible</th>';
  html += '<th class="px-2 py-2 w-14 text-center font-semibold border-r border-slate-700">%</th>';

  dates.forEach(function(d) {
    const hdrCls = d.isToday
      ? 'bg-red-800 text-white border-r border-red-600'
      : d.isWeekend
        ? 'bg-slate-700/80 text-slate-300 border-r border-slate-600'
        : 'bg-slate-800 text-slate-200 border-r border-slate-700';
    html += '<th class="gantt-cell px-1 py-1.5 text-center font-semibold ' + hdrCls + '">' +
      '<div class="text-[10px] leading-tight">' + d.shortLabel + '</div>' +
      '<div class="text-[9px] font-normal opacity-80">' + d.dowLabel + '</div>' +
    '</th>';
  });

  html += '<th class="px-2 py-2 w-20 text-center font-semibold border-r border-slate-700">Planned?</th>';
  html += '<th class="px-3 py-2 min-w-[200px] font-semibold">Prerequisite / Roadblock</th>';
  html += '</tr></thead><tbody class="divide-y divide-slate-200">';

  const areasToRender = areaFilter === 'ALL' ? state.areas : [areaFilter];
  let renderedRowCount = 0;

  areasToRender.forEach(function(areaName) {
    const areaTasks = filteredTasks.filter(function(t) { return t.area === areaName; });
    if (areaTasks.length === 0 && (q || orgFilter !== 'ALL' || statusFilter !== 'ALL')) return;

    const isCollapsed = Boolean(state.collapsedAreas[areaName]);
    const areaTrades = {};
    let areaPending = 0;
    areaTasks.forEach(function(t) {
      areaTrades[t.org] = true;
      areaPending += getPendingForTask(t.id).length;
    });

    const totalCols = 7 + dates.length;
    html += '<tr class="bg-slate-700 hover:bg-slate-600 text-white cursor-pointer border-y border-slate-800 transition" onclick="toggleAreaCollapse(\'' + escapeHtml(areaName) + '\')">';
    html += '<td colspan="' + totalCols + '" class="px-3 py-2">';
    html += '<div class="flex items-center justify-between gap-2">';
    html += '<div class="flex items-center gap-2.5">';
    html += '<span class="w-5 h-5 rounded bg-slate-900 text-white inline-flex items-center justify-center text-[11px] font-bold border border-slate-500">' + (isCollapsed ? '+' : '-') + '</span>';
    html += '<span class="font-bold text-xs sm:text-sm text-white tracking-tight">' + escapeHtml(areaName) + '</span>';
    html += '<span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-600">' + areaTasks.length + ' task' + (areaTasks.length === 1 ? '' : 's') + ' | ' + Object.keys(areaTrades).length + ' trade' + (Object.keys(areaTrades).length === 1 ? '' : 's') + '</span>';
    if (!readOnly && areaPending > 0) {
      html += '<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">' + areaPending + ' pending update' + (areaPending === 1 ? '' : 's') + '</span>';
    }
    html += '</div>';
    if (!readOnly) {
      html += '<div class="flex items-center gap-1.5" onclick="event.stopPropagation()">' +
        '<button type="button" onclick="startInlineRowInArea(\'' + escapeHtml(areaName) + '\')" class="text-[11px] font-bold text-sky-200 hover:bg-sky-700 hover:text-white px-2.5 py-1 rounded bg-slate-900 border border-sky-500/50 shadow-sm">+ Inline Row</button>' +
        '<button type="button" onclick="openTaskModal(null, \'' + escapeHtml(areaName) + '\')" class="text-[11px] font-semibold text-white hover:bg-slate-900 px-2.5 py-1 rounded bg-slate-800 border border-slate-500 shadow-sm">+ Modal Task</button>' +
      '</div>';
    }
    html += '</div></td></tr>';

    if (isCollapsed) return;

    if (areaTasks.length === 0) {
      if (!readOnly && inlineRowState && inlineRowState.area === areaName && !inlineRowState.afterTaskId) {
        html += buildInlineExcelRowHtml(dates.length);
      } else {
        html += '<tr><td colspan="' + totalCols + '" class="px-4 py-3 text-xs text-slate-500 bg-slate-100 italic">No active tasks scheduled in ' + escapeHtml(areaName) + ' for this project scope yet.</td></tr>';
      }
      return;
    }

    areaTasks.forEach(function(task, rowIdx) {
      renderedRowCount++;
      const orgObj = getOrgByCode(task.org);
      const pendingList = getPendingForTask(task.id);
      const hasPending = !readOnly && pendingList.length > 0;
      const hasOpenPrereq = task.prerequisite && task.prerequisiteStatus !== 'CLEARED';
      const hasUndo = !readOnly && Array.isArray(task.undoStack) && task.undoStack.length > 0;
      const mopClashes = getActiveMopClashesForTask(task);
      const matchedP6 = state.showP6Overlay ? findMatchingP6ForTask(task) : null;
      const prevSameOrg = rowIdx > 0 && areaTasks[rowIdx - 1].org === task.org;

      const rowSurface = task.hiddenEarly
        ? 'bg-slate-200/80 opacity-65'
        : (rowIdx % 2 === 0 ? 'bg-[#f4f7fb]' : 'bg-[#eaeff6]');
      const stickySurface = task.hiddenEarly
        ? 'bg-slate-200'
        : (rowIdx % 2 === 0 ? 'bg-[#f4f7fb]' : 'bg-[#eaeff6]');
      const groupBorderTop = prevSameOrg ? 'border-t border-slate-200/80' : 'border-t-2 border-slate-300';
      const clickTaskOpen = readOnly ? '' : ' onclick="openTaskModal(\'' + task.id + '\')"';

      html += '<tr class="group ' + rowSurface + ' hover:bg-sky-50/90 transition ' + groupBorderTop + '">';
      html += '<td' + clickTaskOpen + ' class="sticky-col-left ' + stickySurface + ' group-hover:bg-sky-50 px-3 py-2 border-r border-slate-300 ' + (readOnly ? '' : 'cursor-pointer ') + 'max-w-[330px]" style="border-left: 4px solid ' + escapeHtml(orgObj.color) + ';">';
      html += '<div class="flex items-start justify-between gap-1.5">';
      html += '<span class="font-semibold text-slate-900 leading-snug ' + (task.hiddenEarly ? 'line-through text-slate-600' : '') + '">' + escapeHtml(task.description) + '</span>';

      if (!readOnly) {
        html += '<div class="flex items-center gap-1 shrink-0">';
        if (hasUndo) {
          html += '<button type="button" onclick="event.stopPropagation(); undoLastTaskChange(\'' + task.id + '\')" class="px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-400 text-[10px] font-bold" title="Undo last modification on this task">&#8634; Undo</button>';
        }
        if (hasPending) {
          html += '<button type="button" onclick="event.stopPropagation(); switchGcTab(\'approvals\')" class="px-1.5 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-400 text-[10px] font-bold">Pending</button>';
        }
        html += '<button type="button" onclick="event.stopPropagation(); startInlineRowAfterTask(\'' + task.id + '\')" class="px-1.5 py-0.5 rounded border border-sky-300 bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-800 text-[10px] font-bold transition" title="Insert live Excel row directly below this task">+ Row</button>';
        if (task.hiddenEarly) {
          html += '<button type="button" onclick="event.stopPropagation(); toggleHideTaskEarly(\'' + task.id + '\')" class="px-1.5 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold">Unhide</button>';
        } else {
          html += '<button type="button" onclick="event.stopPropagation(); toggleHideTaskEarly(\'' + task.id + '\')" class="px-1.5 py-0.5 rounded border border-slate-300 bg-white/80 hover:bg-emerald-600 hover:text-white text-slate-600 text-[10px] font-semibold transition">&#10003; Hide</button>';
        }
        html += '</div>';
      }
      html += '</div>';

      // Active MOP / LOTO Room Clash Warning Pill (Co-Developer Addition #1)
      if (matchedP6) {
        const p6Delta = diffDaysIso(matchedP6.p6Finish, task.endDate);
        const p6Tone = p6Delta > 0
          ? 'bg-rose-100 text-rose-900 border-rose-300'
          : p6Delta < 0
            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
            : 'bg-slate-200 text-slate-800 border-slate-400';
        const p6Word = p6Delta > 0 ? ('+' + p6Delta + 'd behind P6') : p6Delta < 0 ? (Math.abs(p6Delta) + 'd ahead of P6') : 'On P6 Target';
        html += '<div class="mt-0.5"><span class="inline-block px-1.5 py-0.2 rounded border text-[10px] font-mono font-bold ' + p6Tone + '" title="P6 Master Schedule: ' + escapeHtml(matchedP6.p6Start + ' to ' + matchedP6.p6Finish) + '">' + escapeHtml(matchedP6.p6Id + ': ' + p6Word) + '</span></div>';
      }
      if (mopClashes.length > 0) {
        const mopLabels = mopClashes.map(function(m) { return m.mopId + ' (' + m.risk + ' Risk)'; }).join(', ');
        html += '<div class="mt-1"><span class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-bold" title="Active MOP / LOTO window in ' + escapeHtml(task.area) + '">! Active MOP/LOTO: ' + escapeHtml(mopLabels) + '</span></div>';
      }
      if (state.frozenBaseline && state.frozenBaseline.tasksById && state.frozenBaseline.tasksById[task.id]) {
        const baseT = state.frozenBaseline.tasksById[task.id];
        const slipDays = diffDaysIso(baseT.endDate, task.endDate);
        if (slipDays !== 0) {
          const slipTone = slipDays > 0 ? 'bg-amber-100 text-amber-950 border-amber-400' : 'bg-emerald-100 text-emerald-900 border-emerald-400';
          html += '<div class="mt-0.5"><span class="inline-block px-1.5 py-0.2 rounded border text-[10px] font-bold ' + slipTone + '">vs Frozen Baseline: ' + (slipDays > 0 ? '+' + slipDays + 'd slip' : slipDays + 'd pulled in') + '</span></div>';
        }
      }

      html += '<div class="flex items-center justify-between gap-2 mt-1">';
      html += '<span class="text-[10px] font-medium text-slate-600">' + formatShortDate(task.startDate) + ' &rarr; ' + formatShortDate(task.endDate) + (task.crew ? ' | Crew ' + task.crew : '') + '</span>';
      if (!readOnly) {
        html += '<div class="inline-flex items-center gap-0.5 opacity-80 group-hover:opacity-100" onclick="event.stopPropagation()">';
        html += '<button type="button" onclick="requestNudgeTaskDates(\'' + task.id + '\', -1, -1)" class="px-1.5 py-0.2 rounded bg-slate-200/90 hover:bg-slate-800 hover:text-white text-[10px] font-bold text-slate-700" title="Slide task 1 day earlier">-1d</button>';
        html += '<button type="button" onclick="requestNudgeTaskDates(\'' + task.id + '\', 1, 1)" class="px-1.5 py-0.2 rounded bg-slate-200/90 hover:bg-slate-800 hover:text-white text-[10px] font-bold text-slate-700" title="Slide task 1 day later">+1d</button>';
        html += '<button type="button" onclick="requestNudgeTaskDates(\'' + task.id + '\', 0, 1)" class="px-1.5 py-0.2 rounded bg-slate-200/90 hover:bg-sky-700 hover:text-white text-[10px] font-semibold text-slate-700" title="Extend duration +1 day">+Dur</button>';
        html += '</div>';
      }
      html += '</div></td>';

      html += '<td' + clickTaskOpen + ' class="px-2 py-2 text-center font-mono text-[11px] text-slate-600 border-r border-slate-200">' + escapeHtml(task.wbs || '-') + '</td>';
      html += '<td' + clickTaskOpen + ' class="px-2.5 py-2 border-r border-slate-200"><span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-white shadow-sm" style="background-color:' + escapeHtml(orgObj.color) + '">' + escapeHtml(task.org) + '</span></td>';
      html += '<td' + clickTaskOpen + ' class="px-2.5 py-2 text-slate-800 font-medium border-r border-slate-200 truncate max-w-[130px]">' + escapeHtml(task.responsible || '-') + '</td>';

      const pctCls = task.percentComplete >= 100
        ? 'text-emerald-800 font-bold bg-emerald-100/60'
        : task.percentComplete > 0
          ? 'text-sky-800 font-semibold'
          : 'text-slate-500';
      const pctClick = readOnly ? '' : ' onclick="quickStepPercent(\'' + task.id + '\')"';
      html += '<td' + pctClick + ' class="px-2 py-2 text-center border-r border-slate-300 ' + (readOnly ? '' : 'cursor-pointer hover:bg-sky-100/70 ') + pctCls + '">' + task.percentComplete + '%</td>';

      dates.forEach(function(d) {
        const inSpan = d.iso >= task.startDate && d.iso <= task.endDate;
        const code = (task.dailyPlan && task.dailyPlan[d.iso]) ? task.dailyPlan[d.iso] : '';
        const inProposedSpan = hasPending && d.iso >= pendingList[0].proposedStartDate && d.iso <= pendingList[0].proposedEndDate;

        const bgCls = d.isToday
          ? 'bg-red-100/55 border-r border-red-300'
          : d.isWeekend
            ? 'bg-slate-300/75 border-r border-slate-300'
            : 'border-r border-slate-300/80';

        const cellAttrs = readOnly
          ? ''
          : ' onmousedown="handleGanttCellMouseDown(event, \'' + task.id + '\', \'' + d.iso + '\')" onmouseenter="handleGanttCellMouseEnter(\'' + task.id + '\', \'' + d.iso + '\')" onclick="handleGanttCellClick(\'' + task.id + '\', \'' + d.iso + '\')"';

        html += '<td data-task-id="' + task.id + '" data-iso="' + d.iso + '"' + cellAttrs + ' class="gantt-cell relative text-center align-middle ' + (readOnly ? '' : 'cursor-pointer ') + bgCls + '">';

        if (inProposedSpan && !inSpan) {
          html += '<div class="absolute inset-x-0.5 top-1/2 -translate-y-1/2 h-6 rounded border-2 border-dashed border-amber-500 bg-amber-200/50 pointer-events-none"></div>';
        }

        if (inSpan || code) {
          const isStart = d.iso === task.startDate;
          const isEnd = d.iso === task.endDate;
          const roundCls = (isStart && isEnd) ? 'rounded-md mx-0.5' : isStart ? 'rounded-l-md ml-0.5' : isEnd ? 'rounded-r-md mr-0.5' : '';

          if (state.displayMode === 'codes') {
            const displayCode = code || (!d.isWeekend ? 'x' : '');
            if (displayCode) {
              const badgeTone = displayCode === 'C'
                ? 'bg-indigo-200 text-indigo-950 border border-indigo-400'
                : displayCode === 'S'
                  ? 'bg-emerald-200 text-emerald-950 border border-emerald-400'
                  : 'bg-white text-slate-900 border border-slate-400';
              html += '<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm ' + badgeTone + '">' + escapeHtml(displayCode) + '</span>';
            }
          } else {
            const barOpacity = (d.isWeekend && !code) ? '0.38' : '0.94';
            html += '<div class="gantt-bar-segment h-7 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ' + roundCls + '" style="background-color:' + escapeHtml(orgObj.color) + '; opacity:' + barOpacity + ';">';
            if (!readOnly && isStart) {
              html += '<span onmousedown="startGanttResize(event, \'' + task.id + '\', \'resize-start\', \'' + d.iso + '\')" class="gantt-resize-handle left-0 rounded-l-md text-[9px] text-white/90">&#8249;</span>';
            }
            if (state.displayMode === 'hybrid') {
              const lbl = code || (isStart ? 'S' : isEnd && task.percentComplete === 100 ? 'C' : (!d.isWeekend ? 'x' : ''));
              html += '<span class="pointer-events-none">' + escapeHtml(lbl) + '</span>';
            }
            if (!readOnly && isEnd) {
              html += '<span onmousedown="startGanttResize(event, \'' + task.id + '\', \'resize-end\', \'' + d.iso + '\')" class="gantt-resize-handle right-0 rounded-r-md text-[9px] text-white/90">&#8250;</span>';
            }
            html += '</div>';
          }
        }
        if (matchedP6 && d.iso >= matchedP6.p6Start && d.iso <= matchedP6.p6Finish) {
          html += '<div class="h-1.5 mt-0.5 mx-0.5 rounded-full bg-slate-900/80 pointer-events-none" title="' + escapeHtml('P6 Baseline (' + matchedP6.p6Id + '): ' + matchedP6.p6Start + ' to ' + matchedP6.p6Finish) + '"></div>';
        }
        const offReason = getContractorOffSiteReason(task.org, d.iso);
        if (offReason) {
          html += '<span class="absolute top-0 right-0 px-1 rounded-bl bg-amber-300 text-slate-950 text-[8px] font-bold leading-tight pointer-events-none" title="' + escapeHtml(task.org + ' Off-Site: ' + offReason) + '">OFF</span>';
        }
        html += '</td>';
      });

      html += '<td class="px-2 py-1.5 text-center border-r border-slate-100">';
      if (readOnly) {
        html += '<span class="text-[10px] font-bold text-slate-600">' + escapeHtml(task.completedAsPlanned || '-') + '</span>';
      } else if (task.completedAsPlanned === 'YES') {
        html += '<button type="button" onclick="quickTogglePpc(\'' + task.id + '\')" class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]">YES</button>';
      } else if (task.completedAsPlanned === 'NO') {
        html += '<button type="button" onclick="quickTogglePpc(\'' + task.id + '\')" class="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[10px]">NO</button>';
      } else {
        html += '<button type="button" onclick="quickTogglePpc(\'' + task.id + '\')" class="px-2 py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 text-[10px] font-medium">Set</button>';
      }
      html += '</td>';

      html += '<td' + clickTaskOpen + ' class="px-3 py-2 max-w-[240px]">';
      if (task.prerequisite) {
        const prTone = hasOpenPrereq
          ? 'bg-rose-50 text-rose-800 border-rose-200'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200 line-through opacity-75';
        html += '<div class="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] truncate max-w-full ' + prTone + '">';
        html += '<span class="w-1.5 h-1.5 rounded-full ' + (hasOpenPrereq ? 'bg-rose-500' : 'bg-emerald-500') + ' shrink-0"></span>';
        html += '<span class="truncate">' + escapeHtml(task.prerequisite) + '</span></div>';
      } else {
        html += '<span class="text-slate-400 text-[11px]">Install-ready</span>';
      }
      html += '</td></tr>';
      if (!readOnly && inlineRowState && inlineRowState.afterTaskId === task.id) {
        html += buildInlineExcelRowHtml(dates.length);
      }
    });
  });

  if (renderedRowCount === 0 && (q || orgFilter !== 'ALL' || statusFilter !== 'ALL')) {
    html += '<tr><td colspan="' + (7 + dates.length) + '" class="px-6 py-10 text-center text-sm text-slate-500">No official tasks match your active search or filter criteria.</td></tr>';
  }

  html += '</tbody></table>';
  const gridContainer = document.getElementById('lookahead-grid-container');
  if (gridContainer) gridContainer.innerHTML = html;
}

function toggleShowHiddenTasks() {
  state.showHiddenEarly = !state.showHiddenEarly;
  if (!isWwpReadOnlySession()) saveState();
  renderLookaheadView();
}

function hideAllCompletedTasks() {
  if (isWwpReadOnlySession()) return;
  let count = 0;
  state.officialTasks.forEach(function(t) {
    if (t.percentComplete >= 100 && !t.hiddenEarly) {
      pushTaskUndoSnapshot(t, 'Hide Completed');
      t.hiddenEarly = true;
      count++;
    }
  });
  saveState();
  renderAll();
  showToast(count > 0 ? ('Tucked away ' + count + ' completed task(s).') : 'No unhidden 100% completed tasks found.', 'info');
}

function shiftDailyPlanMap(oldPlan, dayDelta) {
  const next = {};
  if (!oldPlan) return next;
  Object.keys(oldPlan).forEach(function(iso) {
    next[addDaysIso(iso, dayDelta)] = oldPlan[iso];
  });
  return next;
}

// =========================================================================
// BAR MODIFICATION CONFIRMATION MODAL (With Enter Key Quick-Confirm)
// =========================================================================
function openBarChangeVerifyModal(task, origStart, origEnd, origPlan, nextStart, nextEnd, nextPlan) {
  pendingBarConfirmAction = {
    taskId: task.id,
    origStart: origStart,
    origEnd: origEnd,
    origPlan: origPlan,
    nextStart: nextStart,
    nextEnd: nextEnd,
    nextPlan: nextPlan
  };

  openModal(
    '<div class="p-5 text-xs" onkeydown="if(event.key===\'Enter\'){event.preventDefault();confirmPendingBarChange();}">' +
      '<h3 class="text-base font-bold text-slate-900">Confirm WWP Bar Change?</h3>' +
      '<p class="text-slate-600 mt-1">Verify schedule bar adjustment for <strong>' + escapeHtml(task.org) + '</strong> before updating the Official WWP:</p>' +
      '<div class="mt-3 p-3 rounded-xl bg-slate-100 border border-slate-300 flex flex-col gap-1.5">' +
        '<div class="font-bold text-slate-900">' + escapeHtml(task.description) + ' (' + escapeHtml(task.area) + ')</div>' +
        '<div class="flex items-center gap-3 mt-1">' +
          '<span class="px-2 py-1 rounded bg-white border border-slate-300 text-slate-700">Current: <strong>' + formatShortDate(origStart) + ' to ' + formatShortDate(origEnd) + '</strong></span>' +
          '<span class="font-bold text-slate-500">&rarr;</span>' +
          '<span class="px-2 py-1 rounded bg-amber-100 border border-amber-300 text-amber-950">New: <strong>' + formatShortDate(nextStart) + ' to ' + formatShortDate(nextEnd) + '</strong></span>' +
        '</div>' +
      '</div>' +
      '<div class="mt-4 flex justify-end gap-2">' +
        '<button type="button" onclick="cancelPendingBarChange()" class="px-3.5 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100">Cancel (Revert)</button>' +
        '<button type="button" id="confirm-bar-change-btn" onclick="confirmPendingBarChange()" class="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold shadow-sm">Confirm Change (Enter)</button>' +
      '</div>' +
    '</div>'
  );
  setTimeout(function() {
    const btn = document.getElementById('confirm-bar-change-btn');
    if (btn) btn.focus();
  }, 30);
}

function confirmPendingBarChange() {
  if (!pendingBarConfirmAction) return;
  const act = pendingBarConfirmAction;
  pendingBarConfirmAction = null;
  const task = getTaskById(act.taskId);
  if (task) {
    // Restore original briefly so pushTaskUndoSnapshot captures pre-change dates
    task.startDate = act.origStart;
    task.endDate = act.origEnd;
    task.dailyPlan = act.origPlan;
    pushTaskUndoSnapshot(task, 'Bar Date Shift');

    task.startDate = act.nextStart;
    task.endDate = act.nextEnd;
    task.dailyPlan = act.nextPlan;
    recordWwpChange('LIVE_MCGOUGH_EDIT', { org: task.org, area: task.area, taskDesc: task.description, beforeVal: act.origStart + ' to ' + act.origEnd, afterVal: act.nextStart + ' to ' + act.nextEnd });
    saveState();
  }
  closeModal();
  renderLookaheadView();
  if (task) {
    showToast('Updated ' + task.org + ' (' + formatShortDate(task.startDate) + ' to ' + formatShortDate(task.endDate) + '). Click Undo on row to revert.', 'success');
  }
}

function cancelPendingBarChange() {
  if (pendingBarConfirmAction) {
    const act = pendingBarConfirmAction;
    const task = getTaskById(act.taskId);
    if (task) {
      task.startDate = act.origStart;
      task.endDate = act.origEnd;
      task.dailyPlan = act.origPlan;
    }
  }
  pendingBarConfirmAction = null;
  closeModal();
  renderLookaheadView();
}

function requestNudgeTaskDates(taskId, startDelta, endDelta) {
  if (isWwpReadOnlySession()) return;
  const task = getTaskById(taskId);
  if (!task) return;
  const origStart = task.startDate;
  const origEnd = task.endDate;
  const origPlan = JSON.parse(JSON.stringify(task.dailyPlan || {}));
  const nextStart = addDaysIso(origStart, startDelta);
  const nextEnd = addDaysIso(origEnd, endDelta);
  if (nextEnd < nextStart) return;
  const nextPlan = (startDelta === endDelta && startDelta !== 0)
    ? shiftDailyPlanMap(origPlan, startDelta)
    : buildPlanRange(nextStart, nextEnd, { markComplete: task.percentComplete >= 100 });
  openBarChangeVerifyModal(task, origStart, origEnd, origPlan, nextStart, nextEnd, nextPlan);
}

function quickStepPercent(taskId) {
  if (isWwpReadOnlySession()) return;
  const task = getTaskById(taskId);
  if (!task) return;
  pushTaskUndoSnapshot(task, 'Percent Step');
  const steps = [0, 25, 50, 75, 100];
  let nextVal = 100;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i] > task.percentComplete) {
      nextVal = steps[i];
      break;
    }
  }
  if (task.percentComplete >= 100) nextVal = 0;
  const prevPctVal = task.percentComplete;
  task.percentComplete = nextVal;
  recordWwpChange('LIVE_MCGOUGH_EDIT', { org: task.org, area: task.area, taskDesc: task.description, beforeVal: prevPctVal + '%', afterVal: nextVal + '%' });
  if (nextVal === 100) {
    task.completedAsPlanned = 'YES';
    if (!task.dailyPlan) task.dailyPlan = {};
    task.dailyPlan[task.endDate] = 'C';
  }
  saveState();
  renderAll();
}

function startGanttResize(e, taskId, mode, isoDate) {
  if (isWwpReadOnlySession()) return;
  e.stopPropagation();
  e.preventDefault();
  const task = getTaskById(taskId);
  if (!task) return;
  ganttDrag.active = true;
  ganttDrag.moved = false;
  ganttDrag.mode = mode;
  ganttDrag.taskId = taskId;
  ganttDrag.anchorIso = isoDate;
  ganttDrag.origStart = task.startDate;
  ganttDrag.origEnd = task.endDate;
  ganttDrag.origDailyPlan = JSON.parse(JSON.stringify(task.dailyPlan || {}));
  document.body.classList.add('gantt-dragging-active');
}

function handleGanttCellMouseDown(e, taskId, isoDate) {
  if (isWwpReadOnlySession() || e.button !== 0) return;
  const task = getTaskById(taskId);
  if (!task) return;
  const inSpan = isoDate >= task.startDate && isoDate <= task.endDate;
  ganttDrag.active = true;
  ganttDrag.moved = false;
  ganttDrag.mode = inSpan ? 'move' : 'paint';
  ganttDrag.taskId = taskId;
  ganttDrag.anchorIso = isoDate;
  ganttDrag.origStart = task.startDate;
  ganttDrag.origEnd = task.endDate;
  ganttDrag.origDailyPlan = JSON.parse(JSON.stringify(task.dailyPlan || {}));
  document.body.classList.add('gantt-dragging-active');
}

function handleGanttCellMouseEnter(rowTaskId, hoverIso) {
  if (!ganttDrag.active || !ganttDrag.taskId) return;
  const task = getTaskById(ganttDrag.taskId);
  if (!task) return;
  if (hoverIso !== ganttDrag.anchorIso) {
    ganttDrag.moved = true;
  }
  if (!ganttDrag.moved) return;

  if (ganttDrag.mode === 'move') {
    const delta = diffDaysIso(ganttDrag.anchorIso, hoverIso);
    task.startDate = addDaysIso(ganttDrag.origStart, delta);
    task.endDate = addDaysIso(ganttDrag.origEnd, delta);
    task.dailyPlan = shiftDailyPlanMap(ganttDrag.origDailyPlan, delta);
  } else if (ganttDrag.mode === 'resize-start') {
    const clampedStart = hoverIso <= ganttDrag.origEnd ? hoverIso : ganttDrag.origEnd;
    task.startDate = clampedStart;
    task.dailyPlan = buildPlanRange(task.startDate, task.endDate, { markStart: true, markComplete: task.percentComplete >= 100 });
  } else if (ganttDrag.mode === 'resize-end') {
    const clampedEnd = hoverIso >= ganttDrag.origStart ? hoverIso : ganttDrag.origStart;
    task.endDate = clampedEnd;
    task.dailyPlan = buildPlanRange(task.startDate, task.endDate, { markComplete: task.percentComplete >= 100 });
  } else if (ganttDrag.mode === 'paint') {
    const s = hoverIso < ganttDrag.anchorIso ? hoverIso : ganttDrag.anchorIso;
    const endD = hoverIso > ganttDrag.anchorIso ? hoverIso : ganttDrag.anchorIso;
    task.startDate = s;
    task.endDate = endD;
    task.dailyPlan = buildPlanRange(s, endD, { markStart: true, markComplete: task.percentComplete >= 100 });
  }
  renderLookaheadView();
}

function handleGanttCellClick(taskId, isoDate) {
  if (isWwpReadOnlySession()) return;
  if (ganttDrag.suppressNextClick) {
    ganttDrag.suppressNextClick = false;
    return;
  }
  cycleDailyCellCode(taskId, isoDate);
}

window.addEventListener('mouseup', function() {
  if (!ganttDrag.active) return;
  const wasMoved = ganttDrag.moved;
  const draggedTask = getTaskById(ganttDrag.taskId);
  const origS = ganttDrag.origStart;
  const origE = ganttDrag.origEnd;
  const origP = ganttDrag.origDailyPlan;
  ganttDrag.active = false;
  ganttDrag.moved = false;
  document.body.classList.remove('gantt-dragging-active');

  if (wasMoved && draggedTask && (draggedTask.startDate !== origS || draggedTask.endDate !== origE)) {
    ganttDrag.suppressNextClick = true;
    const nextS = draggedTask.startDate;
    const nextE = draggedTask.endDate;
    const nextP = JSON.parse(JSON.stringify(draggedTask.dailyPlan || {}));
    openBarChangeVerifyModal(draggedTask, origS, origE, origP, nextS, nextE, nextP);
  }
});

function cycleDailyCellCode(taskId, isoDate) {
  if (isWwpReadOnlySession()) return;
  const task = getTaskById(taskId);
  if (!task) return;
  pushTaskUndoSnapshot(task, 'Cell Code Toggle');
  if (!task.dailyPlan) task.dailyPlan = {};
  const cur = task.dailyPlan[isoDate] || '';
  const order = ['', 'S', 'x', 'C'];
  const nextIdx = (order.indexOf(cur) + 1) % order.length;
  const nextCode = order[nextIdx];
  if (nextCode === '') {
    delete task.dailyPlan[isoDate];
  } else {
    task.dailyPlan[isoDate] = nextCode;
    if (isoDate < task.startDate) task.startDate = isoDate;
    if (isoDate > task.endDate) task.endDate = isoDate;
    if (nextCode === 'C') task.percentComplete = 100;
  }
  saveState();
  renderLookaheadView();
}

function quickTogglePpc(taskId) {
  if (isWwpReadOnlySession()) return;
  const task = getTaskById(taskId);
  if (!task) return;
  pushTaskUndoSnapshot(task, 'PPC Toggle');
  if (task.completedAsPlanned === null) {
    task.completedAsPlanned = 'YES';
    task.varianceCategory = '';
  } else if (task.completedAsPlanned === 'YES') {
    task.completedAsPlanned = 'NO';
    if (!task.varianceCategory) task.varianceCategory = VARIANCE_CATEGORIES[0];
  } else {
    task.completedAsPlanned = null;
    task.varianceCategory = '';
  }
  saveState();
  renderAll();
}

function mergeSubmissionIntoOfficial(sub) {
  const approver = getActiveApprover();
  const isNew = sub.type === 'NEW_TASK' || !sub.taskId || !getTaskById(sub.taskId);
  if (isNew) {
    insertTaskGroupedWithContractor({
      id: 't-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      wbs: sub.wbs || '-',
      area: sub.area || 'Admin',
      description: sub.description,
      org: sub.org,
      responsible: sub.submittedBy || getOrgByCode(sub.org).defaultForeman || '',
      crew: Number(sub.proposedCrew) || 4,
      startDate: sub.proposedStartDate,
      endDate: sub.proposedEndDate,
      percentComplete: Number(sub.proposedPercent) || 0,
      dailyPlan: buildPlanRange(sub.proposedStartDate, sub.proposedEndDate, {
        markStart: true,
        markComplete: Number(sub.proposedPercent) >= 100
      }),
      completedAsPlanned: sub.proposedCompletedAsPlanned || null,
      varianceCategory: sub.proposedVarianceCategory || '',
      prerequisite: sub.proposedPrerequisite || '',
      prerequisiteStatus: sub.proposedPrerequisite ? 'OPEN' : 'CLEARED',
      hiddenEarly: false,
      undoStack: []
    });
  } else {
    const orig = getTaskById(sub.taskId);
    pushTaskUndoSnapshot(orig, 'Merged Trade Submission');
    orig.description = sub.description || orig.description;
    orig.wbs = sub.wbs || orig.wbs;
    orig.area = sub.area || orig.area;
    orig.startDate = sub.proposedStartDate;
    orig.endDate = sub.proposedEndDate;
    orig.percentComplete = Number(sub.proposedPercent);
    orig.crew = Number(sub.proposedCrew) || orig.crew;
    orig.dailyPlan = buildPlanRange(sub.proposedStartDate, sub.proposedEndDate, {
      markComplete: Number(sub.proposedPercent) >= 100
    });
    if (sub.proposedCompletedAsPlanned) {
      orig.completedAsPlanned = sub.proposedCompletedAsPlanned;
      orig.varianceCategory = sub.proposedCompletedAsPlanned === 'NO' ? (sub.proposedVarianceCategory || VARIANCE_CATEGORIES[0]) : '';
    }
    orig.prerequisite = sub.proposedPrerequisite || '';
    orig.prerequisiteStatus = sub.proposedPrerequisite ? 'OPEN' : 'CLEARED';
  }

  recordWwpChange('MCGOUGH_APPROVED', { actor: approver.name + ' (' + approver.role + ')', org: sub.org, area: sub.area, taskDesc: sub.description, beforeVal: isNew ? 'New Trade Proposal' : 'Queued Update', afterVal: sub.proposedStartDate + ' to ' + sub.proposedEndDate + ' (' + sub.proposedPercent + '%)' });
  state.auditLog.unshift({
    decision: 'APPROVED',
    org: sub.org,
    area: sub.area,
    description: sub.description,
    approverName: approver.name + ' (' + approver.role + ')',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    note: sub.comment || ''
  });
}

// =========================================================================
    // TAB 2: MCGOUGH APPROVAL QUEUE & GOVERNANCE
    // =========================================================================
    function setActiveApprover(approverId) {
      state.activeApproverId = approverId;
      saveState();
      renderAll();
      const app = getActiveApprover();
      showToast('Active McGough approver set to ' + app.name, 'info');
    }

    function clearDemoSubmissions() {
      state.pendingSubmissions = state.pendingSubmissions.filter(function(s) { return !s.isDemo; });
      saveState();
      renderAll();
      showToast('Cleared demo staging items.', 'info');
    }

    function renderApprovalsView() {
      populateDropdownOptions();

      // 1. Render Weekly Trade Check-In Readiness Strip
      const activeOrgsMap = {};
      state.officialTasks.forEach(function(t) { activeOrgsMap[t.org] = true; });
      const activeOrgCodes = Object.keys(activeOrgsMap).sort();

      const submittedOrgSet = {};
      state.pendingSubmissions.forEach(function(s) { submittedOrgSet[s.org] = 'PENDING'; });
      state.auditLog.forEach(function(a) {
        if (a.decision === 'APPROVED') submittedOrgSet[a.org] = 'APPROVED';
      });

      const stripEl = document.getElementById('submission-tracker-strip');
      stripEl.innerHTML = activeOrgCodes.map(function(orgCode) {
        const st = submittedOrgSet[orgCode];
        const badgeCls = st === 'APPROVED'
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
          : st === 'PENDING'
            ? 'bg-amber-50 text-amber-900 border-amber-300'
            : 'bg-slate-50 text-slate-600 border-slate-200';
        const dotCls = st === 'APPROVED' ? 'bg-emerald-500' : st === 'PENDING' ? 'bg-amber-500' : 'bg-slate-300';
        const statusWord = st === 'APPROVED' ? 'Merged' : st === 'PENDING' ? 'In Queue' : 'Awaiting Link';
        return '<button type="button" onclick="openPortalForContractor(\'' + escapeHtml(orgCode) + '\')" class="px-2.5 py-1 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 hover:shadow-sm transition ' + badgeCls + '" title="Click to copy scoped login PIN for ' + escapeHtml(orgCode) + '">' +
          '<span class="w-2 h-2 rounded-full ' + dotCls + '"></span>' +
          '<span class="font-semibold">' + escapeHtml(orgCode) + '</span>' +
          '<span class="text-[10px] opacity-75">(' + statusWord + ')</span>' +
        '</button>';
      }).join('');

      // 2. Filter & Render Pending Submission Diff Cards
      const orgF = document.getElementById('queue-filter-org').value || 'ALL';
      const typeF = document.getElementById('queue-filter-type').value || 'ALL';

      const list = state.pendingSubmissions.filter(function(s) {
        if (orgF !== 'ALL' && s.org !== orgF) return false;
        if (typeF !== 'ALL' && s.type !== typeF) return false;
        return true;
      });

      const qContainer = document.getElementById('approval-queue-container');
      if (list.length === 0) {
        qContainer.innerHTML = '<div class="bg-white rounded-xl border border-slate-200 p-8 text-center">' +
          '<div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">' +
            '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' +
          '</div>' +
          '<h3 class="text-sm font-bold text-slate-900">Approval Queue Clear</h3>' +
          '<p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">No unapproved trade updates match the current filter. Share the Trade Portal link or switch to the Trade Partner Portal to test submitting updates.</p>' +
          '<div class="mt-4 flex justify-center gap-2">' +
            '<button type="button" onclick="switchPortalMode(\'trade\')" class="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold">Open Trade Partner Portal</button>' +
            '<button type="button" onclick="openShareLinkModal()" class="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold">Send Link to Trades</button>' +
          '</div>' +
        '</div>';
      } else {
        qContainer.innerHTML = list.map(function(sub) {
          const orgObj = getOrgByCode(sub.org);
          const orig = sub.taskId ? getTaskById(sub.taskId) : null;
          const isNew = sub.type === 'NEW_TASK' || !orig;

          let shiftBadge = '';
          if (!isNew && orig) {
            const endDelta = diffDaysIso(orig.endDate, sub.proposedEndDate);
            if (endDelta > 0) {
              shiftBadge = '<span class="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">+' + endDelta + 'd End Slip</span>';
            } else if (endDelta < 0) {
              shiftBadge = '<span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">' + endDelta + 'd Pulled In</span>';
            } else {
              shiftBadge = '<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">Dates Unchanged</span>';
            }
          }

          return '<div class="bg-slate-100 rounded-xl border border-slate-300 shadow-md overflow-hidden">' +
            '<div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">' +
              '<div class="flex items-center gap-2 flex-wrap">' +
                '<span class="px-2.5 py-0.5 rounded-md text-xs font-bold text-white" style="background-color:' + escapeHtml(orgObj.color) + '">' + escapeHtml(sub.org) + '</span>' +
                '<span class="text-xs font-semibold text-slate-800">Submitted by ' + escapeHtml(sub.submittedBy || 'Trade Foreman') + '</span>' +
                '<span class="text-[11px] text-slate-400">&bull; ' + escapeHtml(sub.submittedAt) + '</span>' +
                (isNew
                  ? '<span class="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 text-[10px] font-bold uppercase">New Task Proposal</span>'
                  : '<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase">Task Update</span>') +
                (sub.isDemo ? '<span class="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-medium">Sample Staging</span>' : '') +
                shiftBadge +
              '</div>' +
              '<div class="text-xs font-semibold text-slate-600">' + escapeHtml(sub.area) + ' &bull; WBS ' + escapeHtml(sub.wbs || '-') + '</div>' +
            '</div>' +

            '<div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">' +
              // Left: Official Locked Version
              '<div class="p-3 rounded-lg bg-slate-50 border border-slate-200">' +
                '<div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Current Official WWP (Locked)</div>' +
                (isNew
                  ? '<div class="text-xs text-slate-500 italic py-3">Not currently on Official WWP - proposed as a new lookahead assignment.</div>'
                  : '<div class="text-xs font-semibold text-slate-900">' + escapeHtml(orig.description) + '</div>' +
                    '<div class="mt-2 grid grid-cols-2 gap-2 text-xs">' +
                      '<div><span class="text-slate-400">Dates:</span> <strong class="text-slate-700">' + formatShortDate(orig.startDate) + ' - ' + formatShortDate(orig.endDate) + '</strong></div>' +
                      '<div><span class="text-slate-400">Progress:</span> <strong class="text-slate-700">' + orig.percentComplete + '% (Crew ' + (orig.crew || '-') + ')</strong></div>' +
                      '<div class="col-span-2"><span class="text-slate-400">Prerequisite:</span> <span class="text-slate-700">' + escapeHtml(orig.prerequisite || 'None') + '</span></div>' +
                    '</div>') +
              '</div>' +

              // Right: Proposed Trade Submission
              '<div class="p-3 rounded-lg bg-amber-50/50 border border-amber-200">' +
                '<div class="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1">Trade Proposed Update</div>' +
                '<div class="text-xs font-semibold text-slate-900">' + escapeHtml(sub.description) + '</div>' +
                '<div class="mt-2 grid grid-cols-2 gap-2 text-xs">' +
                  '<div><span class="text-slate-500">Proposed Dates:</span> <strong class="text-slate-900">' + formatShortDate(sub.proposedStartDate) + ' - ' + formatShortDate(sub.proposedEndDate) + '</strong></div>' +
                  '<div><span class="text-slate-500">Progress:</span> <strong class="text-slate-900">' + sub.proposedPercent + '% (Crew ' + (sub.proposedCrew || 4) + ')</strong></div>' +
                  '<div><span class="text-slate-500">PPC Planned?:</span> <strong class="text-slate-900">' + escapeHtml(sub.proposedCompletedAsPlanned || 'Pending') + (sub.proposedVarianceCategory ? ' (' + escapeHtml(sub.proposedVarianceCategory) + ')' : '') + '</strong></div>' +
                  '<div><span class="text-slate-500">Prerequisite:</span> <span class="text-rose-800 font-medium">' + escapeHtml(sub.proposedPrerequisite || 'None') + '</span></div>' +
                '</div>' +
                (sub.comment ? '<div class="mt-2 pt-2 border-t border-amber-200/70 text-xs text-slate-700"><strong>Foreman Note:</strong> "' + escapeHtml(sub.comment) + '"</div>' : '') +
              '</div>' +
            '</div>' +

            '<div class="px-4 py-2.5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">' +
              '<button type="button" onclick="rejectSubmissionModal(\'' + sub.subId + '\')" class="px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition">Return / Reject</button>' +
              '<button type="button" onclick="openEditBeforeApproveModal(\'' + sub.subId + '\')" class="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition">Edit &amp; Approve</button>' +
              '<button type="button" onclick="approveSubmission(\'' + sub.subId + '\')" class="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition shadow-sm">Approve &amp; Merge to Official WWP</button>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      // 3. Render Audit Trail
      const auditEl = document.getElementById('audit-log-container');
      if (state.auditLog.length === 0) {
        auditEl.innerHTML = '<p class="text-xs text-slate-400 italic">No submissions approved or returned in this session yet. Actions taken by McGough Approvers are recorded here with timestamps.</p>';
      } else {
        auditEl.innerHTML = '<div class="divide-y divide-slate-100">' + state.auditLog.map(function(entry) {
          const badge = entry.decision === 'APPROVED'
            ? '<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">MERGED</span>'
            : '<span class="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">RETURNED</span>';
          return '<div class="py-2 flex flex-wrap items-center justify-between gap-2 text-xs">' +
            '<div class="flex items-center gap-2 flex-wrap">' +
              badge +
              '<strong class="text-slate-900">' + escapeHtml(entry.org) + '</strong>' +
              '<span class="text-slate-600">' + escapeHtml(entry.description) + ' (' + escapeHtml(entry.area) + ')</span>' +
              (entry.note ? '<span class="text-slate-500 italic">- "' + escapeHtml(entry.note) + '"</span>' : '') +
            '</div>' +
            '<div class="text-[11px] text-slate-500">By <strong>' + escapeHtml(entry.approverName) + '</strong> &bull; ' + escapeHtml(entry.timestamp) + '</div>' +
          '</div>';
        }).join('') + '</div>';
      }
    }

    function approveSubmission(subId) {
      const idx = state.pendingSubmissions.findIndex(function(s) { return s.subId === subId; });
      if (idx === -1) return;
      const sub = state.pendingSubmissions[idx];
      mergeSubmissionIntoOfficial(sub);
      state.pendingSubmissions.splice(idx, 1);
      saveState();
      renderAll();
      showToast('Approved & merged ' + sub.org + ' update into Official WWP!', 'success');
    }

    function approveAllVisibleSubmissions() {
      const orgF = document.getElementById('queue-filter-org').value || 'ALL';
      const typeF = document.getElementById('queue-filter-type').value || 'ALL';
      const toApprove = state.pendingSubmissions.filter(function(s) {
        if (orgF !== 'ALL' && s.org !== orgF) return false;
        if (typeF !== 'ALL' && s.type !== typeF) return false;
        return true;
      });
      if (toApprove.length === 0) {
        showToast('No pending submissions to approve.', 'info');
        return;
      }
      toApprove.forEach(function(sub) {
        mergeSubmissionIntoOfficial(sub);
      });
      const approvedIds = toApprove.map(function(s) { return s.subId; });
      state.pendingSubmissions = state.pendingSubmissions.filter(function(s) {
        return approvedIds.indexOf(s.subId) === -1;
      });
      saveState();
      renderAll();
      showToast('Merged ' + toApprove.length + ' trade submission(s) into Official WWP!', 'success');
    }

    function rejectSubmissionModal(subId) {
      const sub = state.pendingSubmissions.find(function(s) { return s.subId === subId; });
      if (!sub) return;
      openModal(
        '<div class="p-5">' +
          '<h3 class="text-base font-bold text-slate-900">Return Submission to ' + escapeHtml(sub.org) + '</h3>' +
          '<p class="text-xs text-slate-500 mt-1">Returning keeps the Official WWP unchanged and records review notes for ' + escapeHtml(sub.submittedBy || sub.org) + '.</p>' +
          '<div class="mt-4">' +
            '<label for="reject-reason-input" class="block text-xs font-semibold text-slate-700 mb-1">McGough Reviewer Note / Reason</label>' +
            '<textarea id="reject-reason-input" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs" placeholder="e.g., Cannot shift past 11/24 due to Data Hall turnover milestone - please add crew or coordinate Saturday shift."></textarea>' +
          '</div>' +
          '<div class="mt-4 flex justify-end gap-2">' +
            '<button type="button" onclick="closeModal()" class="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700">Cancel</button>' +
            '<button type="button" onclick="confirmRejectSubmission(\'' + sub.subId + '\')" class="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold">Confirm Return</button>' +
          '</div>' +
        '</div>'
      );
    }

    function confirmRejectSubmission(subId) {
      const idx = state.pendingSubmissions.findIndex(function(s) { return s.subId === subId; });
      if (idx === -1) return;
      const sub = state.pendingSubmissions[idx];
      const reasonEl = document.getElementById('reject-reason-input');
      const note = reasonEl ? reasonEl.value.trim() : '';
      const approver = getActiveApprover();

      state.auditLog.unshift({
        decision: 'RETURNED',
        org: sub.org,
        area: sub.area,
        description: sub.description,
        approverName: approver.name + ' (' + approver.role + ')',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: note || 'Returned for schedule revision'
      });

      state.pendingSubmissions.splice(idx, 1);
      closeModal();
      saveState();
      renderAll();
      showToast('Returned submission to ' + sub.org + ' without altering Official WWP.', 'info');
    }

    function openEditBeforeApproveModal(subId) {
      const sub = state.pendingSubmissions.find(function(s) { return s.subId === subId; });
      if (!sub) return;
      const areaOpts = state.areas.map(function(a) {
        return '<option value="' + escapeHtml(a) + '"' + (a === sub.area ? ' selected' : '') + '>' + escapeHtml(a) + '</option>';
      }).join('');

      openModal(
        '<div class="p-5">' +
          '<div class="flex items-center justify-between border-b border-slate-100 pb-3">' +
            '<div>' +
              '<h3 class="text-base font-bold text-slate-900">Adjust &amp; Approve Submission (' + escapeHtml(sub.org) + ')</h3>' +
              '<p class="text-xs text-slate-500">Modify proposed dates, scope, or prerequisites before merging into the Official WWP.</p>' +
            '</div>' +
          '</div>' +
          '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">' +
            '<div><label class="block font-semibold text-slate-700 mb-1">Area</label><select id="eba-area" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300">' + areaOpts + '</select></div>' +
            '<div><label class="block font-semibold text-slate-700 mb-1">WBS #</label><input id="eba-wbs" type="text" value="' + escapeHtml(sub.wbs) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
            '<div class="sm:col-span-2"><label class="block font-semibold text-slate-700 mb-1">Assignment Description</label><input id="eba-desc" type="text" value="' + escapeHtml(sub.description) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
            '<div><label class="block font-semibold text-slate-700 mb-1">Approved Start Date</label><input id="eba-start" type="date" value="' + escapeHtml(sub.proposedStartDate) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
            '<div><label class="block font-semibold text-slate-700 mb-1">Approved End Date</label><input id="eba-end" type="date" value="' + escapeHtml(sub.proposedEndDate) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
            '<div><label class="block font-semibold text-slate-700 mb-1">% Complete</label><input id="eba-pct" type="number" min="0" max="100" value="' + Number(sub.proposedPercent) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
            '<div><label class="block font-semibold text-slate-700 mb-1">Crew Size</label><input id="eba-crew" type="number" min="1" max="99" value="' + Number(sub.proposedCrew || 4) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
            '<div class="sm:col-span-2"><label class="block font-semibold text-slate-700 mb-1">Prerequisite / Roadblock</label><input id="eba-prereq" type="text" value="' + escapeHtml(sub.proposedPrerequisite || '') + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
          '</div>' +
          '<div class="mt-5 flex justify-end gap-2">' +
            '<button type="button" onclick="closeModal()" class="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700">Cancel</button>' +
            '<button type="button" onclick="saveEditAndApprove(\'' + sub.subId + '\')" class="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold">Merge Adjusted Update</button>' +
          '</div>' +
        '</div>'
      );
    }

    function saveEditAndApprove(subId) {
      const sub = state.pendingSubmissions.find(function(s) { return s.subId === subId; });
      if (!sub) return;
      const sDate = document.getElementById('eba-start').value;
      const eDate = document.getElementById('eba-end').value;
      if (sDate && eDate && eDate < sDate) {
        showToast('End date cannot be earlier than start date.', 'error');
        return;
      }
      sub.area = document.getElementById('eba-area').value;
      sub.wbs = document.getElementById('eba-wbs').value.trim() || '-';
      sub.description = document.getElementById('eba-desc').value.trim() || sub.description;
      sub.proposedStartDate = sDate || sub.proposedStartDate;
      sub.proposedEndDate = eDate || sub.proposedEndDate;
      sub.proposedPercent = Math.min(100, Math.max(0, Number(document.getElementById('eba-pct').value) || 0));
      sub.proposedCrew = Math.max(1, Number(document.getElementById('eba-crew').value) || 4);
      sub.proposedPrerequisite = document.getElementById('eba-prereq').value.trim();
      closeModal();
      approveSubmission(subId);
    }

    // =========================================================================
    // TAB 3: ROADBLOCKS & MAKE-READY PREREQUISITES BOARD
    // =========================================================================
    function renderRoadblocksView() {
      populateDropdownOptions();
      const statusF = document.getElementById('rb-filter-status').value || 'ALL';
      const areaF = document.getElementById('rb-filter-area').value || 'ALL';

      const prereqTasks = state.officialTasks.filter(function(t) {
        if (!t.prerequisite) return false;
        const st = t.prerequisiteStatus || 'OPEN';
        if (statusF !== 'ALL' && st !== statusF) return false;
        if (areaF !== 'ALL' && t.area !== areaF) return false;
        return true;
      });

      const columns = [
        { key: 'OPEN', title: 'Open Roadblocks (Needs Action)', badgeCls: 'bg-rose-100 text-rose-800', borderCls: 'border-rose-200' },
        { key: 'COORDINATED', title: 'Coordinated / In Handoff', badgeCls: 'bg-amber-100 text-amber-800', borderCls: 'border-amber-200' },
        { key: 'CLEARED', title: 'Cleared (Install-Ready)', badgeCls: 'bg-emerald-100 text-emerald-800', borderCls: 'border-emerald-200' }
      ];

      const board = document.getElementById('roadblocks-board-container');
      board.innerHTML = columns.map(function(col) {
        const items = prereqTasks.filter(function(t) {
          return (t.prerequisiteStatus || 'OPEN') === col.key;
        });

        return '<div class="bg-slate-100/80 rounded-xl border border-slate-200 p-3 flex flex-col gap-2.5">' +
          '<div class="flex items-center justify-between px-1">' +
            '<h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">' + escapeHtml(col.title) + '</h3>' +
            '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold ' + col.badgeCls + '">' + items.length + '</span>' +
          '</div>' +
          (items.length === 0
            ? '<div class="bg-white/70 rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">No items in this column</div>'
            : items.map(function(t) {
                const orgObj = getOrgByCode(t.org);
                return '<div class="bg-white rounded-xl border ' + col.borderCls + ' p-3 shadow-sm flex flex-col gap-2">' +
                  '<div class="flex items-center justify-between gap-2">' +
                    '<span class="px-2 py-0.5 rounded text-[10px] font-bold text-white" style="background-color:' + escapeHtml(orgObj.color) + '">' + escapeHtml(t.org) + '</span>' +
                    '<span class="text-[11px] font-semibold text-slate-500">' + escapeHtml(t.area) + ' &bull; Start ' + formatShortDate(t.startDate) + '</span>' +
                  '</div>' +
                  '<div class="text-xs font-bold text-rose-900 bg-rose-50/70 px-2.5 py-1.5 rounded-lg border border-rose-100">' + escapeHtml(t.prerequisite) + '</div>' +
                  '<div class="text-xs text-slate-700"><span class="text-slate-400">Impacted Task:</span> ' + escapeHtml(t.description) + ' (' + escapeHtml(t.responsible || 'Foreman') + ')</div>' +
                  '<div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">' +
                    (col.key !== 'OPEN' ? '<button type="button" onclick="setTaskPrereqStatus(\'' + t.id + '\', \'OPEN\')" class="px-2 py-1 rounded text-[11px] font-medium text-rose-700 hover:bg-rose-50">Reopen</button>' : '<span></span>') +
                    '<div class="flex items-center gap-1">' +
                      (col.key !== 'COORDINATED' ? '<button type="button" onclick="setTaskPrereqStatus(\'' + t.id + '\', \'COORDINATED\')" class="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-semibold border border-amber-200">Mark Coordinated</button>' : '') +
                      (col.key !== 'CLEARED' ? '<button type="button" onclick="setTaskPrereqStatus(\'' + t.id + '\', \'CLEARED\')" class="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-semibold">Clear Roadblock</button>' : '') +
                    '</div>' +
                  '</div>' +
                '</div>';
              }).join('')) +
        '</div>';
      }).join('');
    }

    function setTaskPrereqStatus(taskId, nextStatus) {
      const t = getTaskById(taskId);
      if (!t) return;
      t.prerequisiteStatus = nextStatus;
      saveState();
      renderAll();
      showToast('Updated roadblock status to ' + nextStatus, 'info');
    }

    function openAddRoadblockModal() {
      const taskOpts = state.officialTasks.map(function(t) {
        return '<option value="' + t.id + '">[' + escapeHtml(t.area) + ' - ' + escapeHtml(t.org) + '] ' + escapeHtml(t.description) + '</option>';
      }).join('');

      openModal(
        '<div class="p-5">' +
          '<h3 class="text-base font-bold text-slate-900">Flag Prerequisite / Make-Ready Roadblock</h3>' +
          '<p class="text-xs text-slate-500 mt-1">Attach a required prerequisite from another trade, inspection, or material delivery to an official task.</p>' +
          '<div class="mt-4 flex flex-col gap-3 text-xs">' +
            '<div><label class="block font-semibold text-slate-700 mb-1">Select Impacted Official Task</label><select id="rb-modal-task" class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white">' + taskOpts + '</select></div>' +
            '<div><label class="block font-semibold text-slate-700 mb-1">Required Prerequisite Work From Others *</label><input id="rb-modal-text" type="text" placeholder="e.g., Overhead hydro-test signoff needed prior to ceiling grid closure" class="w-full px-3 py-2 rounded-lg border border-slate-300" /></div>' +
          '</div>' +
          '<div class="mt-5 flex justify-end gap-2">' +
            '<button type="button" onclick="closeModal()" class="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700">Cancel</button>' +
            '<button type="button" onclick="saveRoadblockFromModal()" class="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold">Save Roadblock</button>' +
          '</div>' +
        '</div>'
      );
    }

    function saveRoadblockFromModal() {
      const taskId = document.getElementById('rb-modal-task').value;
      const text = document.getElementById('rb-modal-text').value.trim();
      if (!text) {
        showToast('Please enter a prerequisite description.', 'error');
        return;
      }
      const t = getTaskById(taskId);
      if (t) {
        t.prerequisite = text;
        t.prerequisiteStatus = 'OPEN';
      }
      closeModal();
      saveState();
      renderAll();
      showToast('Roadblock flagged on ' + (t ? t.org : 'task'), 'success');
    }

    // =========================================================================
    // TAB 4: PPC ANALYTICS & 27 CONTRACTORS ROSTER
    // =========================================================================
    function renderAnalyticsView() {
      const ppc = computePpcStats();
      const totalTasks = state.officialTasks.length;
      const constraintFree = state.officialTasks.filter(function(t) {
        return !t.prerequisite || t.prerequisiteStatus === 'CLEARED';
      }).length;
      const readyPct = totalTasks > 0 ? Math.round((constraintFree / totalTasks) * 100) : 100;
      const totalCrew = state.officialTasks.reduce(function(acc, t) { return acc + (Number(t.crew) || 0); }, 0);

      document.getElementById('analytics-kpi-container').innerHTML = [
        { label: 'Percent Plan Complete (PPC)', val: ppc.pct + '%', sub: ppc.yesCount + ' completed as planned / ' + ppc.noCount + ' variance' },
        { label: 'Make-Ready Install Health', val: readyPct + '%', sub: constraintFree + ' of ' + totalTasks + ' tasks constraint-free' },
        { label: 'Registered Contractors (JOBDATA)', val: String(state.organizations.length), sub: 'With dedicated WWP portal links' },
        { label: 'Planned Field Manpower', val: totalCrew + ' crew', sub: 'Summed across active task assignments' }
      ].map(function(k) {
        return '<div class="bg-slate-100 p-4 rounded-xl border border-slate-300 shadow-sm">' +
          '<div class="text-xs font-semibold text-slate-500">' + escapeHtml(k.label) + '</div>' +
          '<div class="text-2xl font-bold text-slate-900 mt-1">' + escapeHtml(k.val) + '</div>' +
          '<div class="text-xs text-slate-400 mt-0.5">' + escapeHtml(k.sub) + '</div>' +
        '</div>';
      }).join('');

      // Render Interactive PPC Closeout List
      const ppcListEl = document.getElementById('ppc-eval-list');
      ppcListEl.innerHTML = state.officialTasks.slice(0, 20).map(function(t) {
        const orgObj = getOrgByCode(t.org);
        const varOpts = VARIANCE_CATEGORIES.map(function(vc) {
          return '<option value="' + escapeHtml(vc) + '"' + (t.varianceCategory === vc ? ' selected' : '') + '>' + escapeHtml(vc) + '</option>';
        }).join('');

        return '<div class="py-2.5 px-2 flex flex-wrap items-center justify-between gap-2 text-xs hover:bg-slate-50">' +
          '<div class="flex items-center gap-2 min-w-0">' +
            '<span class="px-2 py-0.5 rounded text-[10px] font-bold text-white shrink-0" style="background-color:' + escapeHtml(orgObj.color) + '">' + escapeHtml(t.org) + '</span>' +
            '<span class="font-medium text-slate-600 shrink-0">[' + escapeHtml(t.area) + ']</span>' +
            '<span class="font-semibold text-slate-900 truncate">' + escapeHtml(t.description) + '</span>' +
          '</div>' +
          '<div class="flex items-center gap-2">' +
            (t.completedAsPlanned === 'NO'
              ? '<select onchange="setTaskVariance(\'' + t.id + '\', this.value)" class="px-2 py-1 rounded border border-rose-300 bg-rose-50 text-rose-900 text-[11px]">' + varOpts + '</select>'
              : '') +
            '<button type="button" onclick="setTaskPpcExplicit(\'' + t.id + '\', \'YES\')" class="px-2.5 py-1 rounded font-bold text-[11px] transition ' + (t.completedAsPlanned === 'YES' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50') + '">YES</button>' +
            '<button type="button" onclick="setTaskPpcExplicit(\'' + t.id + '\', \'NO\')" class="px-2.5 py-1 rounded font-bold text-[11px] transition ' + (t.completedAsPlanned === 'NO' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-rose-50') + '">NO</button>' +
          '</div>' +
        '</div>';
      }).join('');

      renderContractorsRoster();
      renderCharts();
    }

    function setTaskPpcExplicit(taskId, val) {
      const t = getTaskById(taskId);
      if (!t) return;
      t.completedAsPlanned = val;
      if (val === 'NO' && !t.varianceCategory) t.varianceCategory = VARIANCE_CATEGORIES[0];
      if (val === 'YES') t.varianceCategory = '';
      saveState();
      renderAnalyticsView();
    }

    function setTaskVariance(taskId, category) {
      const t = getTaskById(taskId);
      if (!t) return;
      t.varianceCategory = category;
      saveState();
      renderCharts();
    }

    function renderContractorsRoster() {
      const q = (document.getElementById('contractor-search').value || '').trim().toLowerCase();
      const filtered = state.organizations.filter(function(o) {
        if (!q) return true;
        return (o.code + ' ' + o.fullName + ' ' + o.defaultForeman).toLowerCase().indexOf(q) !== -1;
      });

      document.getElementById('contractors-roster-container').innerHTML = filtered.map(function(o) {
        const count = state.officialTasks.filter(function(t) { return t.org === o.code; }).length;
        return '<div class="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition flex flex-col justify-between gap-2">' +
          '<div class="flex items-start justify-between gap-2">' +
            '<div class="flex items-center gap-2">' +
              '<span class="w-3.5 h-3.5 rounded-full shrink-0" style="background-color:' + escapeHtml(o.color) + '"></span>' +
              '<div>' +
                '<div class="text-xs font-bold text-slate-900">' + escapeHtml(o.code) + '</div>' +
                '<div class="text-[11px] text-slate-500">' + escapeHtml(o.fullName) + '</div>' +
              '</div>' +
            '</div>' +
            '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-700">' + count + ' task' + (count === 1 ? '' : 's') + '</span>' +
          '</div>' +
          '<div class="flex items-center justify-between pt-2 border-t border-slate-200/70 text-[11px]">' +
            '<span class="text-slate-500 truncate">Lead: <strong>' + escapeHtml(o.defaultForeman || 'Assign in Portal') + '</strong></span>' +
            (o.isGC
              ? '<span class="text-red-700 font-semibold">GC Approver</span>'
              : '<div class="flex items-center gap-1.5">' +
                  '<button type="button" onclick="copyContractorPortalLink(\'' + escapeHtml(o.code) + '\')" class="text-slate-600 hover:text-slate-900 font-semibold underline">Copy Link</button>' +
                  '<button type="button" onclick="openPortalForContractor(\'' + escapeHtml(o.code) + '\')" class="text-sky-700 hover:text-sky-900 font-semibold">Portal &rarr;</button>' +
                '</div>') +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderCharts() {
      if (typeof Chart === 'undefined') return;

      // 1. Area Tasks Chart
      const areaCounts = state.areas.map(function(a) {
        return state.officialTasks.filter(function(t) { return t.area === a; }).length;
      });
      const ctxArea = document.getElementById('chart-area-tasks');
      if (ctxArea) {
        if (chartInstances.area) chartInstances.area.destroy();
        chartInstances.area = new Chart(ctxArea, {
          type: 'bar',
          data: {
            labels: state.areas,
            datasets: [{
              label: 'Scheduled Tasks',
              data: areaCounts,
              backgroundColor: '#0f172a',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
          }
        });
      }

      // 2. Trade Workload Chart
      const orgMap = {};
      state.officialTasks.forEach(function(t) {
        orgMap[t.org] = (orgMap[t.org] || 0) + 1;
      });
      const sortedOrgs = Object.keys(orgMap).sort(function(a, b) { return orgMap[b] - orgMap[a]; }).slice(0, 8);
      const ctxTrade = document.getElementById('chart-trade-workload');
      if (ctxTrade) {
        if (chartInstances.trade) chartInstances.trade.destroy();
        chartInstances.trade = new Chart(ctxTrade, {
          type: 'bar',
          data: {
            labels: sortedOrgs,
            datasets: [{
              label: 'Active Assignments',
              data: sortedOrgs.map(function(c) { return orgMap[c]; }),
              backgroundColor: sortedOrgs.map(function(c) { return getOrgByCode(c).color; }),
              borderRadius: 6
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
          }
        });
      }

      // 3. Variance & Prerequisite Categories Chart
      const catCounts = {
        'Prerequisite / Handoff': 0,
        'Material / Delivery': 0,
        'Area / CRAH Access': 0,
        'Testing / Inspection': 0
      };
      state.officialTasks.forEach(function(t) {
        if (t.prerequisite && t.prerequisiteStatus !== 'CLEARED') {
          const low = t.prerequisite.toLowerCase();
          if (low.indexOf('delivery') !== -1 || low.indexOf('blanket') !== -1) catCounts['Material / Delivery']++;
          else if (low.indexOf('crah') !== -1 || low.indexOf('wrigley') !== -1) catCounts['Area / CRAH Access']++;
          else if (low.indexOf('test') !== -1 || low.indexOf('flush') !== -1) catCounts['Testing / Inspection']++;
          else catCounts['Prerequisite / Handoff']++;
        }
        if (t.completedAsPlanned === 'NO') {
          catCounts['Prerequisite / Handoff']++;
        }
      });

      const ctxVar = document.getElementById('chart-variance-reasons');
      if (ctxVar) {
        if (chartInstances.variance) chartInstances.variance.destroy();
        chartInstances.variance = new Chart(ctxVar, {
          type: 'doughnut',
          data: {
            labels: Object.keys(catCounts),
            datasets: [{
              data: Object.values(catCounts),
              backgroundColor: ['#e11d48', '#f59e0b', '#0284c7', '#6366f1']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
            }
          }
        });
      }
    }

