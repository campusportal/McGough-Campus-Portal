// =========================================================================
// AUTOMATED EMAIL / TEAMS / SMS NOTIFICATION RELAY & REMINDERS (js/notifications.js)
// =========================================================================
function resolveRecipientsForGroups(targetGroups, eventType) {
  const contacts = (state.notificationSettings && state.notificationSettings.contacts) || [];
  const matched = [];
  contacts.forEach(function(c) {
    const inGroup = (targetGroups || []).some(function(g) {
      if (g === 'ALL_TRADES') return String(c.group || '').indexOf('TRADE:') === 0;
      return c.group === g;
    });
    if (!inGroup) return;
    if (eventType.indexOf('MOP') === 0 && !c.notifyMop) return;
    if (eventType.indexOf('WWP') === 0 && !c.notifyWwp) return;
    if (eventType.indexOf('PCO') === 0 && !c.notifyPco) return;
    if (eventType.indexOf('P6') === 0 && !c.notifyP6) return;
    matched.push(c);
  });
  return matched;
}

function dispatchNotificationPing(eventType, targetGroups, subject, bodyText) {
  if (!Array.isArray(state.notificationOutbox)) state.notificationOutbox = [];
  const recipients = resolveRecipientsForGroups(targetGroups, eventType);
  const emails = recipients.map(function(r) { return r.email; }).filter(Boolean);
  const phones = recipients.map(function(r) { return r.phone; }).filter(Boolean);
  const nowStr = '11/20 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const entry = {
    pingId: 'ping-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: nowStr,
    eventType: eventType,
    targetGroups: (targetGroups || []).join(', '),
    emails: emails,
    phones: phones,
    subject: '[' + getActiveScope().prefix + '] ' + subject,
    body: bodyText,
    deliveryStatus: 'Logged + Ready'
  };

  // Optional Live HTTPS Teams / Email Webhook Relay (when configured by McGough)
  const cfg = state.notificationSettings || {};
  if (cfg.teamsWebhookUrl && cfg.teamsWebhookUrl.indexOf('https://') === 0) {
    try {
      fetch(cfg.teamsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '**' + entry.subject + '**\n\n' + entry.body })
      }).catch(function() {});
      entry.deliveryStatus = 'Sent to Teams Webhook';
    } catch (e) {}
  }
  if (cfg.emailWebhookUrl && cfg.emailWebhookUrl.indexOf('https://') === 0) {
    try {
      fetch(cfg.emailWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emails, phones: phones, subject: entry.subject, message: entry.body })
      }).catch(function() {});
      entry.deliveryStatus = 'Dispatched via Webhook';
    } catch (e) {}
  }

  state.notificationOutbox.unshift(entry);
  if (state.notificationOutbox.length > 150) state.notificationOutbox.pop();

  const pill = document.getElementById('notif-outbox-pill');
  if (pill) pill.textContent = String(state.notificationOutbox.length);
}

function sendPreWwpMeetingTradeReminder() {
  if (state.authRole !== 'mcgough') return;
  const wkNum = computePlanningWeekNumber(state.lookaheadStart);
  const mtgTime = (state.notificationSettings && state.notificationSettings.wwpMeetingSchedule) || 'Tuesdays at 2:00 PM CST';
  dispatchNotificationPing(
    'WWP_PRE_MEETING_REMINDER',
    ['ALL_TRADES'],
    'Reminder: Submit Planning Week ' + wkNum + ' WWP Updates Prior to Huddle',
    'All Active Trade Partners on ' + getActiveScope().label + ': Please verify your current WWP task dates/% complete and submit new 3-week lookahead tasks before the WWP meeting (' + mtgTime + ').'
  );
  saveState();
  if (document.getElementById('notif-modal-marker')) openNotificationsModal();
  showToast('Sent pre-WWP meeting reminder ping to all active Trade Partners!', 'success');
}

function openNotificationsModal() {
  if (state.authRole !== 'mcgough') return;
  const cfg = state.notificationSettings || createInitialNotificationSettings();
  const outbox = state.notificationOutbox || [];

  const contactRows = (cfg.contacts || []).map(function(c, idx) {
    return '<div class="p-2 rounded-lg bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">' +
      '<div><strong>' + escapeHtml(c.name) + '</strong> <span class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">' + escapeHtml(c.group) + '</span>' +
      '<div class="text-[11px] text-slate-500">' + escapeHtml(c.email || 'No email') + (c.phone ? ' | ' + escapeHtml(c.phone) : '') + '</div></div>' +
      '<button type="button" onclick="removeNotificationContact(' + idx + ')" class="text-rose-600 font-semibold text-[11px]">Remove</button>' +
    '</div>';
  }).join('');

  const outboxRows = outbox.length === 0
    ? '<div class="p-4 text-center text-slate-400 italic">No automated pings fired yet in this session. Submit or approve an MOP, WWP, PCO, or % Tracker to see live dispatches.</div>'
    : outbox.slice(0, 25).map(function(p) {
        const mailHref = 'mailto:' + encodeURIComponent((p.emails || []).join(',')) + '?subject=' + encodeURIComponent(p.subject) + '&body=' + encodeURIComponent(p.body);
        const smsHref = (p.phones && p.phones.length > 0) ? ('sms:' + encodeURIComponent(p.phones[0]) + '?body=' + encodeURIComponent(p.subject + ' - ' + p.body)) : '';
        return '<div class="p-3 border-b border-slate-200 flex flex-col gap-1 bg-white">' +
          '<div class="flex flex-wrap items-center justify-between gap-2">' +
            '<span class="font-bold text-slate-900">' + escapeHtml(p.subject) + '</span>' +
            '<span class="text-[11px] text-slate-500">' + escapeHtml(p.timestamp + ' | ' + p.deliveryStatus) + '</span>' +
          '</div>' +
          '<div class="text-[11px] text-slate-600">' + escapeHtml(p.body) + '</div>' +
          '<div class="flex flex-wrap items-center justify-between gap-2 mt-1">' +
            '<span class="text-[10px] font-mono text-slate-500">To: ' + escapeHtml((p.emails || []).join(', ') || p.targetGroups) + '</span>' +
            '<div class="flex items-center gap-1.5">' +
              '<a href="' + mailHref + '" class="px-2 py-0.5 rounded bg-slate-800 text-white font-semibold text-[10px] no-underline">Open in Email</a>' +
              (smsHref ? '<a href="' + smsHref + '" class="px-2 py-0.5 rounded bg-sky-700 text-white font-semibold text-[10px] no-underline">Send SMS</a>' : '') +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');

  const groupOpts = '<option value="MCGOUGH">McGough Personnel</option><option value="AD_FACOPS">Applied Digital - Fac Ops</option><option value="AD_CONST">Applied Digital - Construction</option>' +
    state.organizations.filter(function(o) { return !o.isGC; }).map(function(o) {
      return '<option value="TRADE:' + escapeHtml(o.code) + '">Trade: ' + escapeHtml(o.code) + '</option>';
    }).join('');

  openModal(
    '<div id="notif-modal-marker" class="p-5 bg-slate-50 max-h-[88vh] overflow-y-auto text-xs">' +
      '<div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">' +
        '<div>' +
          '<h3 class="text-base font-bold text-slate-900">Automated Email, SMS &amp; Teams Notification Relay</h3>' +
          '<p class="text-slate-600">Routes sequential MOP, WWP, PCO, and % Tracker pings + Pre-WWP Meeting Trade Reminders.</p>' +
        '</div>' +
        '<button type="button" onclick="sendPreWwpMeetingTradeReminder()" class="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-sm">Ping All Trades: Pre-WWP Meeting Reminder</button>' +
      '</div>' +

      '<div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-3">' +
        '<div><label class="block font-semibold text-slate-700 mb-1">WWP Meeting Window</label><input id="ns-mtg-time" type="text" value="' + escapeHtml(cfg.wwpMeetingSchedule || '') + '" class="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Teams Webhook URL (https://)</label><input id="ns-teams-url" type="text" value="' + escapeHtml(cfg.teamsWebhookUrl || '') + '" placeholder="https://..." class="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Email/SMS Webhook URL (https://)</label><input id="ns-email-url" type="text" value="' + escapeHtml(cfg.emailWebhookUrl || '') + '" placeholder="https://..." class="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono" /></div>' +
      '</div>' +
      '<div class="mt-2 flex justify-end"><button type="button" onclick="saveNotificationWebhooks()" class="px-3 py-1 rounded bg-slate-900 text-white font-semibold">Save Relay Settings</button></div>' +

      '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">' +
        '<div class="flex flex-col gap-2">' +
          '<div class="font-bold text-slate-800">Recipient Roster (Email &amp; SMS)</div>' +
          '<div class="flex flex-col gap-1.5 max-h-48 overflow-y-auto">' + contactRows + '</div>' +
          '<div class="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200">' +
            '<input id="nc-add-name" type="text" placeholder="Name" class="px-2 py-1.5 rounded border border-slate-300 bg-white" />' +
            '<select id="nc-add-group" class="px-2 py-1.5 rounded border border-slate-300 bg-white font-semibold">' + groupOpts + '</select>' +
            '<input id="nc-add-email" type="email" placeholder="Email address" class="px-2 py-1.5 rounded border border-slate-300 bg-white" />' +
            '<input id="nc-add-phone" type="text" placeholder="Mobile phone" class="px-2 py-1.5 rounded border border-slate-300 bg-white" />' +
          '</div>' +
          '<button type="button" onclick="addNotificationContact()" class="py-1.5 rounded bg-emerald-700 text-white font-semibold">+ Add Recipient</button>' +
        '</div>' +

        '<div class="flex flex-col gap-2">' +
          '<div class="font-bold text-slate-800">Recent Automated Ping Dispatches (' + outbox.length + ')</div>' +
          '<div class="rounded-xl border border-slate-300 overflow-hidden max-h-64 overflow-y-auto">' + outboxRows + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="mt-4 pt-3 border-t border-slate-200 flex justify-end">' +
        '<button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold">Close</button>' +
      '</div>' +
    '</div>'
  );
}

function saveNotificationWebhooks() {
  if (!state.notificationSettings) state.notificationSettings = createInitialNotificationSettings();
  state.notificationSettings.wwpMeetingSchedule = (document.getElementById('ns-mtg-time').value || '').trim();
  state.notificationSettings.teamsWebhookUrl = (document.getElementById('ns-teams-url').value || '').trim();
  state.notificationSettings.emailWebhookUrl = (document.getElementById('ns-email-url').value || '').trim();
  saveState();
  showToast('Saved notification relay & meeting schedule settings!', 'success');
}

function addNotificationContact() {
  const name = (document.getElementById('nc-add-name').value || '').trim();
  const group = document.getElementById('nc-add-group').value;
  const email = (document.getElementById('nc-add-email').value || '').trim();
  const phone = (document.getElementById('nc-add-phone').value || '').trim();
  if (!name || (!email && !phone)) {
    showToast('Enter recipient name and at least an email or mobile phone.', 'error');
    return;
  }
  state.notificationSettings.contacts.push({
    id: 'nc-' + Date.now(),
    name: name,
    group: group,
    email: email,
    phone: phone,
    notifyWwp: true,
    notifyMop: true,
    notifyPco: true,
    notifyP6: true
  });
  saveState();
  openNotificationsModal();
}

function removeNotificationContact(idx) {
  state.notificationSettings.contacts.splice(idx, 1);
  saveState();
  openNotificationsModal();
}
