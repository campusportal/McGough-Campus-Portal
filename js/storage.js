// =========================================================================
// PLUGGABLE MULTI-CAMPUS STORAGE ADAPTER (js/storage.js)
// Browser localStorage active now; structured for drop-in Firebase Firestore
// =========================================================================
// =========================================================================
// PASTE YOUR FIREBASE WEB APP CONFIG HERE ONCE BEFORE PUSHING TO GITHUB
// Once projectId & apiKey are filled in below, every phone, tablet, and
// laptop opening your GitHub Pages site connects to Cloud Firestore live!
// =========================================================================
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const CAMPUS_REGISTRY_KEY = 'wwp_tfo4_campus_registry_v2';
const ACTIVE_SESSION_KEY = 'wwp_tfo4_active_session_v2';
const WORKSPACE_PREFIX = 'wwp_tfo4_scope_v2_';
const FIREBASE_BROWSER_CONFIG_KEY = 'wwp_tfo4_firebase_config_v2';

const DEFAULT_PROJECT_SCOPES = [
  {
    scopeId: 'el-b4-tfo',
    campus: 'Ellendale Campus',
    campusCode: 'EL',
    building: 'Building 4',
    buildingCode: '4',
    scopeType: 'Tenant Fit-Out',
    prefix: 'EL4T',
    label: 'Ellendale Campus - Building 4 - Tenant Fit-Out',
    hasBaselineSeed: true
  },
  {
    scopeId: 'el-b4-bb',
    campus: 'Ellendale Campus',
    campusCode: 'EL',
    building: 'Building 4',
    buildingCode: '4',
    scopeType: 'Base-Build',
    prefix: 'EL4B',
    label: 'Ellendale Campus - Building 4 - Base-Build',
    hasBaselineSeed: false
  },
  {
    scopeId: 'el-b1-tfo',
    campus: 'Ellendale Campus',
    campusCode: 'EL',
    building: 'Building 1',
    buildingCode: '1',
    scopeType: 'Tenant Fit-Out',
    prefix: 'EL1T',
    label: 'Ellendale Campus - Building 1 - Tenant Fit-Out',
    hasBaselineSeed: false
  },
  {
    scopeId: 'el-b1-bb',
    campus: 'Ellendale Campus',
    campusCode: 'EL',
    building: 'Building 1',
    buildingCode: '1',
    scopeType: 'Base-Build',
    prefix: 'EL1B',
    label: 'Ellendale Campus - Building 1 - Base-Build',
    hasBaselineSeed: false
  }
];

function normalizeScopeTypeLabel(rawType) {
  const s = String(rawType || '').trim().toLowerCase();
  if (s === 'base build' || s === 'base-build' || s === 'basebuild' || s === 'bb') return 'Base-Build';
  return 'Tenant Fit-Out';
}

function normalizeAndEnsureDualScopes(list) {
  const valid = [];
  (Array.isArray(list) ? list : []).forEach(function(item) {
    if (!item || typeof item !== 'object') return;
    const campus = String(item.campus || 'Ellendale Campus').trim() || 'Ellendale Campus';
    const building = String(item.building || 'Building 4').trim() || 'Building 4';
    const scopeType = normalizeScopeTypeLabel(item.scopeType);
    const prefix = String(item.prefix || 'EL4T').trim().toUpperCase();
    const scopeId = String(item.scopeId || (prefix.toLowerCase())).trim();
    valid.push({
      scopeId: scopeId,
      campus: campus,
      campusCode: item.campusCode || prefix.slice(0, 2) || 'EL',
      building: building,
      buildingCode: item.buildingCode || building.replace(/[^0-9A-Za-z]/g, '').slice(-1) || '4',
      scopeType: scopeType,
      prefix: prefix,
      label: campus + ' - ' + building + ' - ' + scopeType,
      hasBaselineSeed: Boolean(item.hasBaselineSeed || scopeId === 'el-b4-tfo')
    });
  });

  DEFAULT_PROJECT_SCOPES.forEach(function(defSc) {
    if (!valid.some(function(v) { return v.scopeId === defSc.scopeId; })) {
      valid.push(JSON.parse(JSON.stringify(defSc)));
    }
  });

  const pairs = [];
  valid.forEach(function(v) {
    const key = v.campus + '||' + v.building;
    if (pairs.indexOf(key) === -1) pairs.push(key);
  });
  pairs.forEach(function(key) {
    const parts = key.split('||');
    const cName = parts[0];
    const bName = parts[1];
    const existingInPair = valid.filter(function(v) { return v.campus === cName && v.building === bName; });
    ['Tenant Fit-Out', 'Base-Build'].forEach(function(reqType) {
      if (!existingInPair.some(function(v) { return v.scopeType === reqType; })) {
        const ref = existingInPair[0];
        const basePref = (ref ? ref.prefix.slice(0, -1) : (cName.slice(0, 2) + bName.replace(/[^0-9A-Za-z]/g, '').slice(-1))).toUpperCase() || 'PRJ';
        let candPref = basePref + (reqType === 'Base-Build' ? 'B' : 'T');
        let suffixNum = 2;
        while (valid.some(function(v) { return v.prefix.toUpperCase() === candPref; })) {
          candPref = basePref + (reqType === 'Base-Build' ? 'B' : 'T') + suffixNum;
          suffixNum++;
        }
        valid.push({
          scopeId: candPref.toLowerCase() + '-auto',
          campus: cName,
          campusCode: basePref.slice(0, 2),
          building: bName,
          buildingCode: bName,
          scopeType: reqType,
          prefix: candPref,
          label: cName + ' - ' + bName + ' - ' + reqType,
          hasBaselineSeed: false
        });
      }
    });
  });
  return valid;
}

function parseFirebaseConfigText(rawText) {
  const txt = String(rawText || '').trim();
  if (!txt) return null;
  try {
    const parsed = JSON.parse(txt);
    if (parsed && parsed.apiKey && parsed.projectId) return parsed;
  } catch (e) {
    // Continue to JS snippet extraction
  }
  const keys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const extracted = {};
  keys.forEach(function(k) {
    const rx = new RegExp(k + '\\s*:\\s*["\']([^"\']+)["\']');
    const m = txt.match(rx);
    if (m && m[1]) extracted[k] = m[1].trim();
  });
  if (extracted.apiKey && extracted.projectId) {
    if (!extracted.authDomain) extracted.authDomain = extracted.projectId + '.firebaseapp.com';
    return extracted;
  }
  return null;
}

const StorageAdapter = {
  driver: 'local', // 'local' | 'firestore'
  status: 'local', // 'local' | 'connecting' | 'syncing' | 'live' | 'error'
  statusDetail: 'Browser storage active (connect Firebase for multi-device sync)',
  lastSyncedAt: '',
  authUid: '',
  cloudConfig: null,
  configSource: 'none', // 'none' | 'code' | 'browser'
  db: null,
  fbApp: null,
  unsubRegistry: null,
  unsubWorkspace: null,
  watchedScopeId: null,
  saveTimers: {},
  clientInstanceId: 'cl_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now(),
  onRemoteRegistry: null,
  onRemoteWorkspace: null,
  onStatusChange: null,
  onSeedRequired: null,

  resolveFirebaseConfig: function() {
    if (DEFAULT_FIREBASE_CONFIG && DEFAULT_FIREBASE_CONFIG.apiKey && DEFAULT_FIREBASE_CONFIG.projectId) {
      this.configSource = 'code';
      return Object.assign({}, DEFAULT_FIREBASE_CONFIG);
    }
    try {
      const saved = localStorage.getItem(FIREBASE_BROWSER_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.apiKey && parsed.projectId) {
          this.configSource = 'browser';
          return parsed;
        }
      }
    } catch (err) {
      // Ignore storage read error
    }
    this.configSource = 'none';
    return null;
  },

  saveBrowserFirebaseConfig: function(cfg) {
    try {
      localStorage.setItem(FIREBASE_BROWSER_CONFIG_KEY, JSON.stringify(cfg));
    } catch (err) {
      // Ignore storage error
    }
  },

  clearBrowserFirebaseConfig: function() {
    try {
      localStorage.removeItem(FIREBASE_BROWSER_CONFIG_KEY);
    } catch (err) {
      // Ignore storage error
    }
    if (this.unsubRegistry) { try { this.unsubRegistry(); } catch (e) {} this.unsubRegistry = null; }
    if (this.unsubWorkspace) { try { this.unsubWorkspace(); } catch (e) {} this.unsubWorkspace = null; }
    this.db = null;
    this.driver = 'local';
    this.cloudConfig = null;
    this.authUid = '';
    this.setStatus('local', 'Disconnected browser override; using local browser storage.');
  },

  setStatus: function(st, detail) {
    this.status = st;
    if (detail) this.statusDetail = detail;
    if (typeof this.onStatusChange === 'function') {
      try { this.onStatusChange(this.status, this.statusDetail); } catch (e) {}
    }
  },

  stampNowTime: function() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  },

  initCloudSync: function(opts) {
    const options = opts || {};
    this.onRemoteRegistry = options.onRemoteRegistry || null;
    this.onRemoteWorkspace = options.onRemoteWorkspace || null;
    this.onStatusChange = options.onStatusChange || null;
    this.onSeedRequired = options.onSeedRequired || null;

    const cfg = this.resolveFirebaseConfig();
    if (!cfg) {
      this.driver = 'local';
      this.setStatus('local', 'Local Browser Mode (paste Firebase config to sync live across devices)');
      return;
    }
    this.connectFirestore(cfg, options.initialScopeId || 'el-b4-tfo');
  },

  connectFirestore: function(cfg, scopeIdToWatch, retryCount) {
    const self = this;
    const tries = Number(retryCount || 0);
    if (!cfg || !cfg.apiKey || !cfg.projectId) {
      self.setStatus('error', 'Missing apiKey or projectId in Firebase configuration.');
      return;
    }
    self.cloudConfig = cfg;
    self.setStatus('connecting', 'Connecting to Cloud Firestore (' + cfg.projectId + ')...');

    if (typeof window === 'undefined' || !window.firebase || !window.firebase.firestore) {
      if (tries < 12) {
        setTimeout(function() {
          self.connectFirestore(cfg, scopeIdToWatch, tries + 1);
        }, 350);
      } else {
        self.driver = 'local';
        self.setStatus('error', 'Firebase SDK unavailable in this preview frame; using local storage fallback.');
      }
      return;
    }

    try {
      const appName = 'wwpPortal_' + String(cfg.projectId).replace(/[^A-Za-z0-9_-]/g, '_');
      let appInstance = null;
      (window.firebase.apps || []).forEach(function(a) {
        if (a && a.name === appName) appInstance = a;
      });
      if (!appInstance) {
        appInstance = window.firebase.initializeApp(cfg, appName);
      }
      self.fbApp = appInstance;
      const db = window.firebase.firestore(appInstance);
      self.db = db;
      self.driver = 'firestore';

      try {
        db.enablePersistence({ synchronizeTabs: true }).catch(function() {
          // Multi-tab or private browsing may skip IndexedDB persistence cleanly
        });
      } catch (persistErr) {
        // Ignore persistence warning
      }

      const startListeners = function() {
        self.attachRegistryListener();
        if (scopeIdToWatch || self.watchedScopeId) {
          self.watchScope(scopeIdToWatch || self.watchedScopeId);
        }
      };

      if (window.firebase.auth) {
        window.firebase.auth(appInstance).signInAnonymously()
          .then(function(cred) {
            self.authUid = (cred && cred.user) ? cred.user.uid : 'anon';
            startListeners();
          })
          .catch(function(authErr) {
            self.authUid = '';
            self.statusDetail = 'Connected without Anonymous Auth (' + (authErr && authErr.code ? authErr.code : 'enable Anonymous sign-in in Firebase Console') + ')';
            startListeners();
          });
      } else {
        startListeners();
      }
    } catch (initErr) {
      self.driver = 'local';
      self.setStatus('error', 'Firestore init error: ' + String(initErr && initErr.message ? initErr.message : initErr));
    }
  },

  attachRegistryListener: function() {
    const self = this;
    if (!self.db) return;
    if (self.unsubRegistry) { try { self.unsubRegistry(); } catch (e) {} }
    try {
      self.unsubRegistry = self.db.collection('portal_meta').doc('campus_registry').onSnapshot(
        function(snap) {
          if (!snap.exists) {
            const currentScopes = self.loadScopesRegistry();
            self.pushRegistryNow(currentScopes);
            return;
          }
          const data = snap.data() || {};
          if (data.clientInstanceId === self.clientInstanceId) return;
          if (Array.isArray(data.scopes) && data.scopes.length > 0) {
            const norm = normalizeAndEnsureDualScopes(data.scopes);
            try { localStorage.setItem(CAMPUS_REGISTRY_KEY, JSON.stringify(norm)); } catch (e) {}
            if (typeof self.onRemoteRegistry === 'function') {
              self.onRemoteRegistry(norm);
            }
          }
        },
        function(err) {
          self.setStatus('error', 'Firestore Rules/Network check needed: ' + String(err && err.code ? err.code : err.message || err));
        }
      );
    } catch (e) {
      self.setStatus('error', 'Registry listener error: ' + String(e.message || e));
    }
  },

  watchScope: function(scopeId) {
    const self = this;
    if (!scopeId) return;
    self.watchedScopeId = scopeId;
    if (!self.db || self.driver !== 'firestore') return;
    if (self.unsubWorkspace) { try { self.unsubWorkspace(); } catch (e) {} self.unsubWorkspace = null; }

    try {
      self.unsubWorkspace = self.db.collection('portal_workspaces').doc(scopeId).onSnapshot(
        function(snap) {
          if (!snap.exists) {
            let seedPayload = self.loadScopeWorkspace(scopeId);
            if (!seedPayload && typeof self.onSeedRequired === 'function') {
              seedPayload = self.onSeedRequired(scopeId);
            }
            if (seedPayload) {
              self.pushScopeWorkspaceNow(scopeId, seedPayload);
            } else {
              self.lastSyncedAt = self.stampNowTime();
              self.setStatus('live', 'Connected to Cloud Firestore (' + self.cloudConfig.projectId + ')');
            }
            return;
          }
          const docData = snap.data() || {};
          self.lastSyncedAt = self.stampNowTime();
          self.setStatus('live', 'Live sync active (' + self.cloudConfig.projectId + ') at ' + self.lastSyncedAt);

          if (docData.clientInstanceId === self.clientInstanceId) return;
          if (docData.payload && typeof docData.payload === 'object') {
            try {
              localStorage.setItem(WORKSPACE_PREFIX + scopeId, JSON.stringify(docData.payload));
            } catch (e) {}
            if (typeof self.onRemoteWorkspace === 'function') {
              self.onRemoteWorkspace(scopeId, docData.payload, docData);
            }
          }
        },
        function(err) {
          self.setStatus('error', 'Firestore read blocked (' + String(err && err.code ? err.code : 'check Rules & Anonymous Auth') + ')');
        }
      );
    } catch (err) {
      self.setStatus('error', 'Scope listener failed: ' + String(err.message || err));
    }
  },

  pushRegistryNow: function(scopesList) {
    const self = this;
    if (!self.db || self.driver !== 'firestore') return Promise.resolve(false);
    try {
      return self.db.collection('portal_meta').doc('campus_registry').set({
        scopes: scopesList,
        updatedAtMs: Date.now(),
        updatedAtIso: new Date().toISOString(),
        clientInstanceId: self.clientInstanceId
      }).then(function() {
        self.lastSyncedAt = self.stampNowTime();
        self.setStatus('live', 'Registry synced (' + self.lastSyncedAt + ')');
        return true;
      }).catch(function(err) {
        self.setStatus('error', 'Registry write failed (' + String(err && err.code ? err.code : err) + ')');
        return false;
      });
    } catch (e) {
      self.setStatus('error', 'Registry push error');
      return Promise.resolve(false);
    }
  },

  pushScopeWorkspaceNow: function(scopeId, payload) {
    const self = this;
    if (!self.db || self.driver !== 'firestore' || !scopeId || !payload) return Promise.resolve(false);
    self.setStatus('syncing', 'Syncing ' + scopeId + ' to Cloud Firestore...');
    try {
      const cleanPayload = JSON.parse(JSON.stringify(payload));
      return self.db.collection('portal_workspaces').doc(scopeId).set({
        scopeId: scopeId,
        updatedAtMs: Date.now(),
        updatedAtIso: new Date().toISOString(),
        clientInstanceId: self.clientInstanceId,
        payload: cleanPayload
      }).then(function() {
        self.lastSyncedAt = self.stampNowTime();
        self.setStatus('live', 'Live sync active (' + self.cloudConfig.projectId + ') at ' + self.lastSyncedAt);
        return true;
      }).catch(function(err) {
        self.setStatus('error', 'Firestore write blocked (' + String(err && err.code ? err.code : 'check Rules') + ')');
        return false;
      });
    } catch (err) {
      self.setStatus('error', 'Cloud serialize error: ' + String(err.message || err));
      return Promise.resolve(false);
    }
  },

  pullScopeOnce: function(scopeId) {
    const self = this;
    if (!self.db || self.driver !== 'firestore') return Promise.resolve(false);
    return self.db.collection('portal_workspaces').doc(scopeId).get().then(function(snap) {
      if (snap.exists && snap.data() && snap.data().payload) {
        const p = snap.data().payload;
        try { localStorage.setItem(WORKSPACE_PREFIX + scopeId, JSON.stringify(p)); } catch (e) {}
        if (typeof self.onRemoteWorkspace === 'function') {
          self.onRemoteWorkspace(scopeId, p, snap.data());
        }
        self.lastSyncedAt = self.stampNowTime();
        self.setStatus('live', 'Pulled latest cloud snapshot at ' + self.lastSyncedAt);
        return true;
      }
      return false;
    }).catch(function(err) {
      self.setStatus('error', 'Cloud pull failed: ' + String(err && err.code ? err.code : err));
      return false;
    });
  },

  loadScopesRegistry: function() {
    try {
      const raw = localStorage.getItem(CAMPUS_REGISTRY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeAndEnsureDualScopes(parsed);
        }
      }
    } catch (err) {
      // Fallback to default scopes
    }
    return normalizeAndEnsureDualScopes(DEFAULT_PROJECT_SCOPES);
  },

  saveScopesRegistry: function(scopesList) {
    const norm = normalizeAndEnsureDualScopes(scopesList);
    try {
      localStorage.setItem(CAMPUS_REGISTRY_KEY, JSON.stringify(norm));
    } catch (err) {
      // Ignore storage quota errors
    }
    if (this.driver === 'firestore' && this.db) {
      this.pushRegistryNow(norm);
    }
  },

  loadScopeWorkspace: function(scopeId) {
    try {
      const raw = localStorage.getItem(WORKSPACE_PREFIX + scopeId);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      // Ignore storage read errors
    }
    return null;
  },

  saveScopeWorkspace: function(scopeId, payload) {
    const self = this;
    try {
      localStorage.setItem(WORKSPACE_PREFIX + scopeId, JSON.stringify(payload));
    } catch (err) {
      // Ignore storage write errors
    }
    if (self.driver === 'firestore' && self.db && scopeId) {
      if (self.saveTimers[scopeId]) clearTimeout(self.saveTimers[scopeId]);
      self.saveTimers[scopeId] = setTimeout(function() {
        self.pushScopeWorkspaceNow(scopeId, payload);
      }, 280);
    }
  },

  removeScopeWorkspace: function(scopeId) {
    try {
      localStorage.removeItem(WORKSPACE_PREFIX + scopeId);
    } catch (err) {
      // Ignore storage remove errors
    }
  },

  loadActiveSession: function() {
    try {
      const raw = sessionStorage.getItem(ACTIVE_SESSION_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      // Ignore sessionStorage errors
    }
    return null;
  },

  saveActiveSession: function(sess) {
    try {
      sessionStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sess));
    } catch (err) {
      // Ignore sessionStorage errors
    }
  },

  clearActiveSession: function() {
    try {
      sessionStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch (err) {
      // Ignore sessionStorage errors
    }
  }
};
