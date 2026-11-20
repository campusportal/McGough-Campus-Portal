// =========================================================================
// DEDICATED P6 SCHEDULE & % TRACKER ENGINE (js/p6.js)
// Drag-and-Drop CSV/XLSX Uploader, Historical % Tracker Log & Trade P6 View
// =========================================================================
function parseCsvRows(text) {
  const lines = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(function(l) { return l.trim() !== ''; });
  return lines.map(function(line) {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if ((ch === ',' || ch === '\t') && !inQuotes) {
        out.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  });
}

function normalizeP6DateInput(val) {
  const s = String(val || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const yr = m[3].length === 2 ? ('20' + m[3]) : m[3];
    return yr + '-' + String(m[1]).padStart(2, '0') + '-' + String(m[2]).padStart(2, '0');
  }
  return BASE_ANCHOR_DATE;
}

function ingestParsedP6Table(rows2d, sourceFilename) {
  if (!rows2d || rows2d.length < 2) {
    showToast('P6 file needs a header row and at least 1 activity row.', 'error');
    return;
  }
  const hdr = rows2d[0].map(function(h) { return String(h || '').toLowerCase(); });
  const findCol = function(keywords, fallbackIdx) {
    for (let i = 0; i < hdr.length; i++) {
      for (let k = 0; k < keywords.length; k++) {
        if (hdr[i].indexOf(keywords[k]) !== -1) return i;
      }
    }
    return fallbackIdx;
  };

  const idIdx = findCol(['activity id', 'p6 id', 'id', 'task_code'], 0);
  const nameIdx = findCol(['activity name', 'description', 'task_name', 'name'], 1);
  const orgIdx = findCol(['trade', 'organization', 'subcontractor', 'resource', 'org'], 2);
  const areaIdx = findCol(['area', 'location', 'hall', 'zone'], 3);
  const wbsIdx = findCol(['wbs'], -1);
  const startIdx = findCol(['start', 'bl start', 'target_start'], 4);
  const finishIdx = findCol(['finish', 'end', 'bl finish', 'target_end'], 5);
  const pctIdx = findCol(['%', 'percent', 'complete'], 6);

  // Archive current % Tracker before overwriting!
  archiveCurrentP6Snapshot('Auto-Archived Prior to P6 Upload (' + sourceFilename + ')');

  const priorMap = {};
  (state.p6Activities || []).forEach(function(a) { priorMap[a.p6Id] = a.p6Percent; });

  const imported = [];
  for (let r = 1; r < rows2d.length; r++) {
    const cols = rows2d[r];
    if (!cols || cols.length < 2) continue;
    const rawName = String(cols[nameIdx] || '').trim();
    if (!rawName) continue;
    const pid = String(cols[idIdx] || ('P6-' + (1000 + r * 10))).trim();
    const rawOrg = String(cols[orgIdx] || 'LoenBro').trim();
    const matchedOrg = state.organizations.find(function(o) { return o.code.toLowerCase() === rawOrg.toLowerCase(); });
    const rawArea = String(cols[areaIdx] || state.areas[0]).trim();
    if (rawArea && state.areas.indexOf(rawArea) === -1) state.areas.push(rawArea);
    const pctNum = Math.min(100, Math.max(0, parseFloat(String(cols[pctIdx] || '0').replace('%', '')) || 0));

    imported.push({
      p6Id: pid,
      linkedTaskId: '',
      wbs: wbsIdx >= 0 ? String(cols[wbsIdx] || '-').trim() : '8',
      area: rawArea || state.areas[0],
      org: matchedOrg ? matchedOrg.code : rawOrg,
      activityName: rawName,
      p6Start: normalizeP6DateInput(cols[startIdx]),
      p6Finish: normalizeP6DateInput(cols[finishIdx]),
      priorPercent: priorMap[pid] != null ? priorMap[pid] : pctNum,
      p6Percent: Math.round(pctNum)
    });
  }

  if (imported.length === 0) {
    showToast('No valid P6 activity rows found in file.', 'error');
    return;
  }

  state.p6Activities = imported;
  if (typeof dispatchNotificationPing === 'function') {
    dispatchNotificationPing('P6_UPLOADED', ['MCGOUGH', 'AD_CONST'], 'Updated P6 Schedule & % Tracker Uploaded (' + imported.length + ' activities)', 'McGough uploaded "' + sourceFilename + '" into ' + getActiveScope().label + '. Previous % Tracker snapshot has been archived.');
  }
  saveState();
  renderAll();
  showToast('Imported ' + imported.length + ' P6 activities from ' + sourceFilename + ' & archived prior % Tracker!', 'success');
}

function handleP6FileUpload(event) {
  const file = event.target && event.target.files && event.target.files[0];
  if (!file) return;
  processP6FileObject(file);
}

function handleP6DropEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  const dz = document.getElementById('p6-dropzone');
  if (dz) dz.classList.remove('border-emerald-500');
  const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
  if (file) processP6FileObject(file);
}

function processP6FileObject(file) {
  const name = file.name || 'P6_Schedule.csv';
  const lower = name.toLowerCase();
  if ((lower.endsWith('.xlsx') || lower.endsWith('.xls')) && typeof XLSX !== 'undefined') {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
        ingestParsedP6Table(rows, name);
      } catch (err) {
        showToast('Could not parse Excel file - try saving as .csv or check sheet columns.', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    const reader = new FileReader();
    reader.onload = function(e) {
      const rows = parseCsvRows(e.target.result);
      ingestParsedP6Table(rows, name);
    };
    reader.readAsText(file);
  }
}

function downloadSampleP6TemplateCsv() {
  const rows = [['Activity ID', 'Activity Name', 'Trade', 'Area', 'WBS', 'BL Start', 'BL Finish', '% Complete'].join(',')];
  (state.p6Activities || []).forEach(function(a) {
    rows.push([a.p6Id, a.activityName, a.org, a.area, a.wbs, a.p6Start, a.p6Finish, a.p6Percent + '%'].map(function(v) {
      return '"' + String(v || '').replace(/"/g, '""') + '"';
    }).join(','));
  });
  downloadBlob(rows.join('\n'), getActiveScope().prefix + '_P6_Schedule_Percent_Tracker.csv', 'text/csv;charset=utf-8;');
  showToast('Downloaded P6 & % Tracker CSV!', 'success');
}

function updateP6ActivityPercent(p6Id, nextVal) {
  if (state.authRole !== 'mcgough') return;
  const act = (state.p6Activities || []).find(function(a) { return a.p6Id === p6Id; });
  if (!act) return;
  act.p6Percent = Math.min(100, Math.max(0, Math.round(Number(nextVal) || 0)));
  saveState();
  renderMcGoughP6View();
}

function archiveCurrentP6Snapshot(customLabel) {
  if (!Array.isArray(state.p6TrackerHistory)) state.p6TrackerHistory = [];
  const list = state.p6Activities || [];
  if (list.length === 0) return;
  const avg = Math.round(list.reduce(function(s, a) { return s + (Number(a.p6Percent) || 0); }, 0) / list.length);
  const nowStr = '2026-11-20 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const wkNum = computePlanningWeekNumber(state.lookaheadStart);
  const snap = {
    snapId: 'snap-' + Date.now(),
    label: customLabel || ('Week ' + wkNum + ' % Tracker Submission (' + nowStr + ')'),
    submittedAt: nowStr,
    submittedBy: state.authRole === 'mcgough' ? getActiveApprover().name : 'Scheduler',
    overallPercent: avg,
    activityCount: list.length,
    items: JSON.parse(JSON.stringify(list))
  };
  state.p6TrackerHistory.unshift(snap);
}

function submitAndLogWeeklyPercentTracker() {
  if (state.authRole !== 'mcgough') return;
  archiveCurrentP6Snapshot(null);
  // Advance priorPercent baseline to match logged week
  (state.p6Activities || []).forEach(function(a) { a.priorPercent = a.p6Percent; });
  if (typeof dispatchNotificationPing === 'function') {
    dispatchNotificationPing('P6_TRACKER_SUBMITTED', ['MCGOUGH', 'AD_CONST'], 'Weekly P6 % Tracker Logged & Archived', getActiveApprover().name + ' logged the weekly % Tracker snapshot for ' + getActiveScope().label + '.');
  }
  saveState();
  renderMcGoughP6View();
  showToast('Archived Weekly % Tracker snapshot & pinged project leads!', 'success');
}

function renderMcGoughP6View() {
  const snapSel = document.getElementById('p6-history-select');
  const kpiWrap = document.getElementById('p6-kpi-strip');
  const tbody = document.getElementById('p6-tracker-tbody');
  if (!tbody) return;

  if (snapSel) {
    const prevVal = snapSel.value || 'LIVE';
    snapSel.innerHTML = '<option value="LIVE">Current Live P6 &amp; % Tracker (' + (state.p6Activities || []).length + ' activities)</option>' +
      (state.p6TrackerHistory || []).map(function(h) {
        return '<option value="' + escapeHtml(h.snapId) + '">[Archived] ' + escapeHtml(h.label) + ' - ' + h.overallPercent + '% Avg</option>';
      }).join('');
    if (prevVal === 'LIVE' || (state.p6TrackerHistory || []).some(function(h) { return h.snapId === prevVal; })) {
      snapSel.value = prevVal;
    }
  }

  const activeSnapId = snapSel ? snapSel.value : 'LIVE';
  const isHistorical = activeSnapId !== 'LIVE';
  const snapObj = isHistorical ? (state.p6TrackerHistory || []).find(function(h) { return h.snapId === activeSnapId; }) : null;
  const sourceRows = snapObj ? snapObj.items : (state.p6Activities || []);

  const orgF = ((document.getElementById('p6-filter-org') || {}).value) || 'ALL';
  const q = (((document.getElementById('p6-filter-search') || {}).value) || '').trim().toLowerCase();

  const p6OrgSel = document.getElementById('p6-filter-org');
  if (p6OrgSel && p6OrgSel.options.length <= 1) {
    p6OrgSel.innerHTML = '<option value="ALL">All P6 Contractors</option>' +
      state.organizations.filter(function(o) { return !o.isGC; }).map(function(o) {
        return '<option value="' + escapeHtml(o.code) + '">' + escapeHtml(o.code) + '</option>';
      }).join('');
    p6OrgSel.value = orgF;
  }

  const filtered = sourceRows.filter(function(a) {
    if (orgF !== 'ALL' && a.org !== orgF) return false;
    if (q) {
      const hay = (a.p6Id + ' ' + a.area + ' ' + a.org + ' ' + a.activityName).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });

  const avgPct = sourceRows.length > 0
    ? Math.round(sourceRows.reduce(function(s, a) { return s + (Number(a.p6Percent) || 0); }, 0) / sourceRows.length)
    : 0;
  const completedCnt = sourceRows.filter(function(a) { return Number(a.p6Percent) >= 100; }).length;
  let slippingCnt = 0;
  sourceRows.forEach(function(a) {
    const wwpTask = state.officialTasks.find(function(t) { return t.id === a.linkedTaskId || (t.org === a.org && t.description === a.activityName); });
    if (wwpTask && diffDaysIso(a.p6Finish, wwpTask.endDate) > 0) slippingCnt++;
  });

  if (kpiWrap) {
    kpiWrap.innerHTML = [
      { lbl: 'Overall P6 % Tracker Progress', val: avgPct + '%', sub: completedCnt + ' of ' + sourceRows.length + ' P6 activities at 100%', cls: 'bg-emerald-100/80 border-emerald-300 text-emerald-950' },
      { lbl: 'Tracked P6 Activities', val: String(sourceRows.length), sub: 'Feeds Trade Type-Ahead WWP Picker', cls: 'bg-slate-100 border-slate-300 text-slate-900' },
      { lbl: 'WWP vs. P6 Finish Variances', val: String(slippingCnt), sub: slippingCnt > 0 ? 'WWP bars finishing later than P6 target' : 'All linked WWP tasks on or ahead of P6', cls: slippingCnt > 0 ? 'bg-rose-100/80 border-rose-300 text-rose-950' : 'bg-sky-100/80 border-sky-300 text-sky-950' },
      { lbl: 'Archived % Tracker Weeks', val: String((state.p6TrackerHistory || []).length), sub: 'Previous weekly submissions preserved', cls: 'bg-indigo-100/80 border-indigo-300 text-indigo-950' }
    ].map(function(k) {
      return '<div class="p-3.5 rounded-xl border shadow-sm ' + k.cls + '"><div class="text-[11px] font-bold uppercase tracking-wider opacity-80">' + escapeHtml(k.lbl) + '</div><div class="text-2xl font-bold mt-0.5">' + escapeHtml(k.val) + '</div><div class="text-[11px] opacity-75 mt-0.5">' + escapeHtml(k.sub) + '</div></div>';
    }).join('');
  }

  tbody.innerHTML = filtered.map(function(a) {
    const orgObj = getOrgByCode(a.org);
    const wwpTask = state.officialTasks.find(function(t) { return t.id === a.linkedTaskId || (t.org === a.org && t.description === a.activityName); });
    const gain = (Number(a.p6Percent) || 0) - (Number(a.priorPercent) || 0);
    let varHtml = '<span class="text-slate-400">Unscheduled on WWP</span>';
    if (wwpTask) {
      const slip = diffDaysIso(a.p6Finish, wwpTask.endDate);
      varHtml = slip > 0
        ? '<span class="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold">+' + slip + 'd Slip (WWP ' + formatShortDate(wwpTask.endDate) + ')</span>'
        : slip < 0
          ? '<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">' + slip + 'd Ahead</span>'
          : '<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">Aligned (' + formatShortDate(wwpTask.endDate) + ')</span>';
    }

    return '<tr class="hover:bg-slate-50 text-xs">' +
      '<td class="px-3 py-2 font-mono font-bold text-slate-800 border-r border-slate-200">' + escapeHtml(a.p6Id) + '</td>' +
      '<td class="px-2.5 py-2 font-semibold text-slate-700 border-r border-slate-200">' + escapeHtml(a.area) + '</td>' +
      '<td class="px-2.5 py-2 border-r border-slate-200"><span class="px-2 py-0.5 rounded text-[10px] font-bold text-white" style="background-color:' + escapeHtml(orgObj.color) + '">' + escapeHtml(a.org) + '</span></td>' +
      '<td class="px-3 py-2 font-semibold text-slate-900 border-r border-slate-200">' + escapeHtml(a.activityName) + '</td>' +
      '<td class="px-2.5 py-2 font-mono text-[11px] text-slate-700 border-r border-slate-200">' + formatShortDate(a.p6Start) + ' - ' + formatShortDate(a.p6Finish) + '</td>' +
      '<td class="px-2.5 py-2 border-r border-slate-200">' + varHtml + '</td>' +
      '<td class="px-2.5 py-2 text-center border-r border-slate-200 font-mono text-slate-500">' + Number(a.priorPercent || 0) + '%</td>' +
      '<td class="px-3 py-2 border-r border-slate-200">' +
        (isHistorical
          ? '<div class="font-bold text-slate-900">' + Number(a.p6Percent) + '%</div>'
          : '<div class="flex items-center gap-2">' +
              '<input type="number" min="0" max="100" value="' + Number(a.p6Percent) + '" onchange="updateP6ActivityPercent(\'' + escapeHtml(a.p6Id) + '\', this.value)" class="w-16 px-2 py-1 rounded border border-slate-300 font-bold text-slate-900 text-center" />' +
              '<div class="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden min-w-[60px]"><div class="h-full bg-emerald-600" style="width:' + Number(a.p6Percent) + '%"></div></div>' +
            '</div>') +
      '</td>' +
      '<td class="px-2 py-2 text-center font-bold ' + (gain > 0 ? 'text-emerald-700' : 'text-slate-400') + '">' + (gain > 0 ? '+' + gain + '%' : '0%') + '</td>' +
    '</tr>';
  }).join('');
}

// Read-Only P6 Schedule View inside Trade Partner Portal
function renderTradeP6Workspace() {
  const tbody = document.getElementById('trade-p6-tbody');
  const scopeChk = document.getElementById('trade-p6-show-all-areas');
  if (!tbody) return;
  const showAll = scopeChk ? scopeChk.checked : false;
  const q = (((document.getElementById('trade-p6-search') || {}).value) || '').trim().toLowerCase();

  const rows = (state.p6Activities || []).filter(function(a) {
    if (!showAll && a.org !== state.selectedTradeOrg) return false;
    if (q && (a.p6Id + ' ' + a.area + ' ' + a.org + ' ' + a.activityName).toLowerCase().indexOf(q) === -1) return false;
    return true;
  });

  tbody.innerHTML = rows.length === 0
    ? '<tr><td colspan="6" class="p-6 text-center text-xs text-slate-500">No P6 schedule activities match the current filter.</td></tr>'
    : rows.map(function(a) {
        const orgObj = getOrgByCode(a.org);
        return '<tr class="hover:bg-slate-50 text-xs">' +
          '<td class="px-3 py-2 font-mono font-bold text-slate-800 border-r border-slate-200">' + escapeHtml(a.p6Id) + '</td>' +
          '<td class="px-2.5 py-2 font-semibold text-slate-700 border-r border-slate-200">' + escapeHtml(a.area) + '</td>' +
          '<td class="px-2.5 py-2 border-r border-slate-200"><span class="px-2 py-0.5 rounded text-[10px] font-bold text-white" style="background-color:' + escapeHtml(orgObj.color) + '">' + escapeHtml(a.org) + '</span></td>' +
          '<td class="px-3 py-2 font-semibold text-slate-900 border-r border-slate-200">' + escapeHtml(a.activityName) + '</td>' +
          '<td class="px-2.5 py-2 font-mono text-slate-700 border-r border-slate-200">' + formatShortDate(a.p6Start) + ' to ' + formatShortDate(a.p6Finish) + '</td>' +
          '<td class="px-2.5 py-2 text-center font-bold text-emerald-800">' + Number(a.p6Percent) + '%</td>' +
        '</tr>';
      }).join('');
}
