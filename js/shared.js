// =========================================================================
// GROUNDED PROJECT DATA, MULTI-CAMPUS AUTH & SHARED HELPERS (js/shared.js)
// =========================================================================
const BASE_ANCHOR_DATE = '2026-11-18';
const BASE_PLANNING_WEEK = 11;

const VARIANCE_CATEGORIES = [
  'Prerequisite / Handoff Delay',
  'Material / Equipment Delivery',
  'Coordination / Area Access',
  'Design / RFI / Submittal',
  'Manpower / Crew Availability',
  'Inspection / Testing Hold',
  'Scope / Sequence Adjustment'
];

const INITIAL_AREAS = [
  'Admin',
  'Data Hall 1',
  'Data Hall 2',
  'Data Hall 3',
  'Data Hall 4',
  'Data Hall 5',
  'Data Hall 6'
];

// All 27 JOBDATA Organizations with collision-free 3-letter PIN suffixes (zero '?' dashes)
const INITIAL_ORGANIZATIONS = [
  { code: 'McGough', pinCode: 'MCG', fullName: 'McGough Construction', color: '#991b1b', defaultForeman: 'McGough Supervision', isGC: true },
  { code: 'HPC', pinCode: 'HPC', fullName: 'HPC Industrial', color: '#15803d', defaultForeman: 'Noel', isGC: false },
  { code: 'ARCH Sales', pinCode: 'ARS', fullName: 'ARCH Sales', color: '#b45309', defaultForeman: '', isGC: false },
  { code: 'Wells', pinCode: 'WEL', fullName: 'Wells Concrete', color: '#ca8a04', defaultForeman: '', isGC: false },
  { code: 'Atkore', pinCode: 'ATK', fullName: 'Atkore', color: '#6b21a8', defaultForeman: '', isGC: false },
  { code: 'Matrix', pinCode: 'MTX', fullName: 'Matrix', color: '#3f6212', defaultForeman: '', isGC: false },
  { code: 'Magnum', pinCode: 'MAG', fullName: 'Magnum Electric', color: '#0284c7', defaultForeman: 'Paul', isGC: false },
  { code: 'Steinbrecher', pinCode: 'STE', fullName: 'Steinbrecher Painting', color: '#0ea5e9', defaultForeman: 'Broch', isGC: false },
  { code: 'Magnum Controls', pinCode: 'MGC', fullName: 'Magnum Controls', color: '#3b82f6', defaultForeman: '', isGC: false },
  { code: 'JCI', pinCode: 'JCI', fullName: 'Johnson Controls (JCI)', color: '#db2777', defaultForeman: '', isGC: false },
  { code: 'Nor-son', pinCode: 'NOR', fullName: 'Nor-son', color: '#0d9488', defaultForeman: 'Neil', isGC: false },
  { code: 'Webster', pinCode: 'WEB', fullName: 'Webster', color: '#0f766e', defaultForeman: '', isGC: false },
  { code: 'Superl', pinCode: 'SUP', fullName: 'Superl Firestopping', color: '#65a30d', defaultForeman: '', isGC: false },
  { code: 'Viking', pinCode: 'VIK', fullName: 'Viking Automatic Sprinkler', color: '#92400e', defaultForeman: 'Bob D', isGC: false },
  { code: 'ArchKey', pinCode: 'AKY', fullName: 'ArchKey Solutions', color: '#a16207', defaultForeman: '', isGC: false },
  { code: 'Custom Drywall', pinCode: 'CDW', fullName: 'Custom Drywall', color: '#1e3a8a', defaultForeman: 'Dan', isGC: false },
  { code: 'McFarlane', pinCode: 'MCF', fullName: 'McFarlane', color: '#2563eb', defaultForeman: '', isGC: false },
  { code: 'Carciofini', pinCode: 'CAR', fullName: 'Carciofini', color: '#4f46e5', defaultForeman: '', isGC: false },
  { code: 'Modern', pinCode: 'MOD', fullName: 'Modern Piping / Sheet Metal', color: '#334155', defaultForeman: 'AJ', isGC: false },
  { code: 'Smartt Construction', pinCode: 'SMT', fullName: 'Smartt Construction', color: '#1e293b', defaultForeman: '', isGC: false },
  { code: 'Acoustics Associates', pinCode: 'ACO', fullName: 'Acoustics Associates', color: '#0369a1', defaultForeman: '', isGC: false },
  { code: 'Architectural Arts', pinCode: 'ART', fullName: 'Architectural Arts', color: '#78350f', defaultForeman: '', isGC: false },
  { code: 'Divcon', pinCode: 'DIV', fullName: 'Divcon Controls', color: '#d97706', defaultForeman: '', isGC: false },
  { code: 'MatrixNDI', pinCode: 'MND', fullName: 'MatrixNDI', color: '#be123c', defaultForeman: '', isGC: false },
  { code: 'LoenBro', pinCode: 'LOE', fullName: 'LoenBro Mechanical', color: '#573b26', defaultForeman: 'Anthony Richison', isGC: false },
  { code: 'WL Hall', pinCode: 'WLH', fullName: 'WL Hall', color: '#ea580c', defaultForeman: 'Derek Torrey', isGC: false },
  { code: 'Accelevation', pinCode: 'ACC', fullName: 'Accelevation', color: '#ec4899', defaultForeman: 'Rosa', isGC: false }
];

const INITIAL_APPROVERS = [
  { id: 'app-1', name: 'Lead Superintendent', role: 'McGough Senior Field Approver', scope: 'All Areas & Trades' },
  { id: 'app-2', name: 'MEP Superintendent', role: 'McGough MEP & Commissioning Lead', scope: 'Data Halls 1-6 MEP' },
  { id: 'app-3', name: 'Area Superintendent (Interiors)', role: 'McGough Admin & Drywall/Ceilings', scope: 'Admin & Architectural' },
  { id: 'app-4', name: 'Senior Project Engineer', role: 'McGough WWP Scheduler', scope: 'Lookahead Gatekeeper' }
];

const INITIAL_FACOPS_APPROVERS = [
  { id: 'fop-1', name: 'Critical Facilities Ops Lead', role: 'Applied Digital Fac Ops', email: 'facops@applieddigital.com' },
  { id: 'fop-2', name: 'Operations Engineering Manager', role: 'Applied Digital Fac Ops', email: 'ops-eng@applieddigital.com' }
];

const INITIAL_CONST_REPS = [
  { id: 'con-1', name: 'Owner Construction Manager', role: 'Applied Digital Construction', email: 'construction@applieddigital.com' },
  { id: 'con-2', name: 'MEP Owner Representative', role: 'Applied Digital Construction', email: 'mep-const@applieddigital.com' }
];

    // Helper to generate weekday daily codes ('S', 'x', 'C') skipping Sunday (or keeping Saturday where marked on sheet)
    function buildPlanRange(startStr, endStr, opts) {
      const options = opts || {};
      const map = {};
      const cur = parseIsoDate(startStr);
      const end = parseIsoDate(endStr);
      while (cur <= end) {
        const iso = formatIsoDate(cur);
        const dow = cur.getDay(); // 0 = Sun, 6 = Sat
        const includeSat = options.includeSat !== false;
        if (dow !== 0 && (includeSat || dow !== 6)) {
          map[iso] = 'x';
        }
        cur.setDate(cur.getDate() + 1);
      }
      if (options.markStart && map[startStr]) map[startStr] = 'S';
      if (options.markComplete && map[endStr]) map[endStr] = 'C';
      if (options.overrides) {
        Object.keys(options.overrides).forEach(function(k) {
          map[k] = options.overrides[k];
        });
      }
      return map;
    }

    function parseIsoDate(str) {
      const parts = (str || BASE_ANCHOR_DATE).split('-');
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
    }

    function formatIsoDate(dateObj) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + d;
    }

    function addDaysIso(isoStr, days) {
      const d = parseIsoDate(isoStr);
      d.setDate(d.getDate() + Number(days));
      return formatIsoDate(d);
    }

    function diffDaysIso(startIso, endIso) {
      const a = parseIsoDate(startIso);
      const b = parseIsoDate(endIso);
      return Math.round((b - a) / 86400000);
    }

    function formatShortDate(isoStr) {
      if (!isoStr) return '-';
      const d = parseIsoDate(isoStr);
      return (d.getMonth() + 1) + '/' + d.getDate();
    }

    // All 44 Official WWP Tasks from the uploaded McGough WWP Sheet
    function createInitialTasks() {
      return [
        // ================= ADMIN (11 Tasks) =================
        {
          id: 't-101', wbs: '5', area: 'Admin',
          description: 'Cabinet install (waiting on delivery)',
          org: 'Nor-son', responsible: 'Neil', crew: 3,
          startDate: '2026-11-24', endDate: '2026-11-27', percentComplete: 0,
          dailyPlan: buildPlanRange('2026-11-24', '2026-11-27', { markStart: true }),
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: 'Waiting on cabinet material delivery confirmation', prerequisiteStatus: 'OPEN'
        },
        {
          id: 't-102', wbs: '5', area: 'Admin',
          description: 'Install Doors and Hardware (waiting until further finishes are in)',
          org: 'Nor-son', responsible: 'Neil', crew: 2,
          startDate: '2026-11-25', endDate: '2026-11-30', percentComplete: 0,
          dailyPlan: buildPlanRange('2026-11-25', '2026-11-30', { markStart: true }),
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: 'Waiting until prime/finish paint and adjacent wall finishes are complete', prerequisiteStatus: 'OPEN'
        },
        {
          id: 't-103', wbs: '6', area: 'Admin',
          description: 'Floor Boxes',
          org: 'Magnum', responsible: 'Paul', crew: 3,
          startDate: '2026-11-18', endDate: '2026-11-20', percentComplete: 85,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'x', '2026-11-20': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-104', wbs: '6', area: 'Admin',
          description: 'Overhead Rough ins',
          org: 'Magnum', responsible: 'Paul', crew: 5,
          startDate: '2026-11-18', endDate: '2026-11-24', percentComplete: 70,
          dailyPlan: { '2026-11-18': '70%', '2026-11-19': 'x', '2026-11-20': 'x', '2026-11-21': 'x', '2026-11-23': 'x', '2026-11-24': 'x' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-105', wbs: '6', area: 'Admin',
          description: 'Magnum - 4 Inch Jumpers (need core drills) (First Floor)',
          org: 'Magnum', responsible: 'Paul', crew: 4,
          startDate: '2026-11-20', endDate: '2026-11-23', percentComplete: 0,
          dailyPlan: { '2026-11-20': 'S', '2026-11-21': 'x', '2026-11-23': 'x' },
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: 'Need First Floor slab core drills laid out and completed prior to jumper pull', prerequisiteStatus: 'OPEN'
        },
        {
          id: 't-106', wbs: '8', area: 'Admin',
          description: 'Install TFO ductwork - E2',
          org: 'Modern', responsible: 'AJ', crew: 4,
          startDate: '2026-11-18', endDate: '2026-11-21', percentComplete: 80,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'x', '2026-11-20': 'x', '2026-11-21': '80%' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-107', wbs: '8', area: 'Admin',
          description: 'Soffit and ceiling framing',
          org: 'Custom Drywall', responsible: 'Dan', crew: 4,
          startDate: '2026-11-18', endDate: '2026-11-19', percentComplete: 20,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': '20%' },
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-108', wbs: '8', area: 'Admin',
          description: 'Shower ceiling rock and tape',
          org: 'Custom Drywall', responsible: 'Dan', crew: 3,
          startDate: '2026-11-18', endDate: '2026-11-19', percentComplete: 75,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': '75%' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-109', wbs: '8', area: 'Admin',
          description: 'Lvl 2 area E prime paint E2 (As far as they can)',
          org: 'Steinbrecher', responsible: 'Broch', crew: 3,
          startDate: '2026-11-18', endDate: '2026-11-20', percentComplete: 50,
          dailyPlan: { '2026-11-18': '50%', '2026-11-19': 'x', '2026-11-20': 'x' },
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-110', wbs: '8', area: 'Admin',
          description: 'Lvl 2 area F prime & finish paint (As far as they can)',
          org: 'Steinbrecher', responsible: 'Broch', crew: 3,
          startDate: '2026-11-18', endDate: '2026-11-20', percentComplete: 70,
          dailyPlan: { '2026-11-18': '70%', '2026-11-19': 'x', '2026-11-20': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-111', wbs: '-', area: 'Admin',
          description: 'Install Cage Material in POE/MMR Rooms',
          org: 'Accelevation', responsible: 'Rosa', crew: 4,
          startDate: '2026-11-18', endDate: '2026-11-18', percentComplete: 100,
          dailyPlan: { '2026-11-18': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },

        // ================= DATA HALL 1 (13 Tasks) =================
        {
          id: 't-201', wbs: '5', area: 'Data Hall 1',
          description: 'Install Firestopping Sleeves (ongoing as they can)',
          org: 'Superl', responsible: 'Superl Lead', crew: 2,
          startDate: '2026-11-18', endDate: '2026-11-18', percentComplete: 100,
          dailyPlan: { '2026-11-18': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-202', wbs: '8', area: 'Data Hall 1',
          description: 'Start high volume system flush (ongoing) Base Build 11/20 Complete',
          org: 'HPC', responsible: 'Noel', crew: 4,
          startDate: '2026-11-18', endDate: '2026-11-20', percentComplete: 65,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'x', '2026-11-20': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-203', wbs: '8', area: 'Data Hall 1',
          description: 'Start chemical Passivation on combined Base Build carbon piping',
          org: 'HPC', responsible: 'Noel', crew: 4,
          startDate: '2026-11-20', endDate: '2026-11-24', percentComplete: 0,
          dailyPlan: { '2026-11-20': 'S', '2026-11-21': 'x', '2026-11-23': 'x', '2026-11-24': 'C' },
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: 'High volume flush completion on 11/20', prerequisiteStatus: 'COORDINATED'
        },
        {
          id: 't-204', wbs: '8', area: 'Data Hall 1',
          description: 'Start laying out TFO Flush headers after CDUs are placed',
          org: 'HPC', responsible: 'Noel', crew: 3,
          startDate: '2026-11-23', endDate: '2026-11-26', percentComplete: 0,
          dailyPlan: buildPlanRange('2026-11-23', '2026-11-26', { markStart: true }),
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: 'Requires CDU Skids received and set in place by LoenBro', prerequisiteStatus: 'OPEN'
        },
        {
          id: 't-205', wbs: '8', area: 'Data Hall 1',
          description: 'Install Pipe DH1 (CHW Below Ceiling North)',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 6,
          startDate: '2026-11-18', endDate: '2026-11-24', percentComplete: 60,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'x', '2026-11-20': 'x', '2026-11-21': 'x', '2026-11-23': 'x', '2026-11-24': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-206', wbs: '8', area: 'Data Hall 1',
          description: 'Install Pipe DH1 (CHW Below Ceiling South)',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 6,
          startDate: '2026-11-18', endDate: '2026-11-24', percentComplete: 55,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'x', '2026-11-20': 'x', '2026-11-21': 'x', '2026-11-23': 'x', '2026-11-24': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-207', wbs: '8', area: 'Data Hall 1',
          description: 'Insulate DH1 (Waiting on blanket)',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 4,
          startDate: '2026-11-23', endDate: '2026-11-26', percentComplete: 0,
          dailyPlan: { '2026-11-23': 'S', '2026-11-24': 'x', '2026-11-25': 'x', '2026-11-26': 'x' },
          completedAsPlanned: 'NO', varianceCategory: 'Material / Equipment Delivery',
          prerequisite: 'Waiting on insulation blanket delivery to site', prerequisiteStatus: 'OPEN'
        },
        {
          id: 't-208', wbs: '8', area: 'Data Hall 1',
          description: 'Install Tech Water DH1',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 5,
          startDate: '2026-11-18', endDate: '2026-11-23', percentComplete: 75,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'x', '2026-11-20': 'x', '2026-11-21': 'x', '2026-11-23': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-209', wbs: '8', area: 'Data Hall 1',
          description: 'Receive CDU Skid',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 4,
          startDate: '2026-11-18', endDate: '2026-11-19', percentComplete: 80,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-210', wbs: '9', area: 'Data Hall 1',
          description: 'Structural ceiling grid installation - DH1 East Section',
          org: 'WL Hall', responsible: 'Derek Torrey', crew: 6,
          startDate: '2026-11-18', endDate: '2026-11-21', percentComplete: 65,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'x', '2026-11-20': 'x', '2026-11-21': 'x' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-211', wbs: '10', area: 'Data Hall 1',
          description: 'Fabrication DH1.7 Future Bypass Piping (2 Weeks Duration)',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 5,
          startDate: '2026-11-18', endDate: '2026-11-27', percentComplete: 50,
          dailyPlan: buildPlanRange('2026-11-18', '2026-11-27', { overrides: { '2026-11-18': '50%' } }),
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-212', wbs: '10', area: 'Data Hall 1',
          description: 'Pressure test DH1 piping',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 3,
          startDate: '2026-11-30', endDate: '2026-12-01', percentComplete: 0,
          dailyPlan: { '2026-11-30': 'S', '2026-12-01': 'C' },
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: 'Completion of DH1.7 & DH1.8 bypass weld inspection', prerequisiteStatus: 'COORDINATED'
        },
        {
          id: 't-213', wbs: '10', area: 'Data Hall 1',
          description: 'Fabrication DH1.8 Future Bypass Piping (1 Week Duration)',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 5,
          startDate: '2026-11-23', endDate: '2026-11-28', percentComplete: 0,
          dailyPlan: buildPlanRange('2026-11-23', '2026-11-28', { markStart: true, markComplete: true }),
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },

        // ================= DATA HALL 2 (8 Tasks) =================
        {
          id: 't-301', wbs: '6', area: 'Data Hall 2',
          description: 'WL Hall - Structural Ceiling Drop Rod Install',
          org: 'WL Hall', responsible: 'Derek Torrey', crew: 6,
          startDate: '2026-11-18', endDate: '2026-11-30', percentComplete: 45,
          dailyPlan: buildPlanRange('2026-11-18', '2026-11-30', { markComplete: true }),
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-302', wbs: '12', area: 'Data Hall 2',
          description: 'Structural Ceiling Grid Installation - DH2 East Section',
          org: 'WL Hall', responsible: 'Corey Harold', crew: 6,
          startDate: '2026-11-21', endDate: '2026-12-02', percentComplete: 0,
          dailyPlan: buildPlanRange('2026-11-21', '2026-12-02', { markStart: true, markComplete: true }),
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-303', wbs: '12', area: 'Data Hall 2',
          description: 'Structural Ceiling Grid Installation - DH2 Center Section',
          org: 'WL Hall', responsible: 'Corey Harold', crew: 6,
          startDate: '2026-11-27', endDate: '2026-12-03', percentComplete: 0,
          dailyPlan: buildPlanRange('2026-11-27', '2026-12-03', {}),
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-304', wbs: '7', area: 'Data Hall 2',
          description: 'Install Lower Fire Drops',
          org: 'Viking', responsible: 'Bob D', crew: 4,
          startDate: '2026-11-18', endDate: '2026-11-21', percentComplete: 75,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'x', '2026-11-20': 'x', '2026-11-21': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-305', wbs: '8', area: 'Data Hall 2',
          description: 'Pull panels for CRAH units (pull them as Wrigley needs them)',
          org: 'Custom Drywall', responsible: 'Dan', crew: 2,
          startDate: '2026-11-19', endDate: '2026-11-25', percentComplete: 25,
          dailyPlan: { '2026-11-19': 'x', '2026-11-21': 'x', '2026-11-24': 'x', '2026-11-25': 'x' },
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: 'Coordinate CRAH unit rigging sequence for panel removal windows', prerequisiteStatus: 'OPEN'
        },
        {
          id: 't-306', wbs: '9', area: 'Data Hall 2',
          description: 'Insulate DH2 piping runs',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 4,
          startDate: '2026-11-18', endDate: '2026-11-21', percentComplete: 50,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'x', '2026-11-20': 'x', '2026-11-21': 'x' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-307', wbs: '11', area: 'Data Hall 2',
          description: 'Install HAC Piping DH2',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 5,
          startDate: '2026-11-23', endDate: '2026-11-26', percentComplete: 0,
          dailyPlan: { '2026-11-23': 'S', '2026-11-24': 'x', '2026-11-25': 'x', '2026-11-26': 'x' },
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-308', wbs: '-', area: 'Data Hall 2',
          description: 'Containment Panels layout & install',
          org: 'Accelevation', responsible: 'Rosa', crew: 4,
          startDate: '2026-11-25', endDate: '2026-11-28', percentComplete: 0,
          dailyPlan: buildPlanRange('2026-11-25', '2026-11-28', { markStart: true }),
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: 'Overhead ceiling grid East section clearance', prerequisiteStatus: 'COORDINATED'
        },

        // ================= DATA HALL 3 (9 Tasks) =================
        {
          id: 't-401', wbs: '6', area: 'Data Hall 3',
          description: 'Upper RPP Conduit',
          org: 'Magnum', responsible: 'Paul', crew: 5,
          startDate: '2026-11-18', endDate: '2026-11-23', percentComplete: 65,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'x', '2026-11-20': 'x', '2026-11-21': 'x', '2026-11-23': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-402', wbs: '5', area: 'Data Hall 3',
          description: 'Install Firestopping Sleeves (ongoing as they can)',
          org: 'Superl', responsible: 'Superl Lead', crew: 2,
          startDate: '2026-11-18', endDate: '2026-11-25', percentComplete: 40,
          dailyPlan: buildPlanRange('2026-11-18', '2026-11-25', {}),
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-403', wbs: '7', area: 'Data Hall 3',
          description: 'Install Lower Drops',
          org: 'Viking', responsible: 'Bob D', crew: 4,
          startDate: '2026-11-18', endDate: '2026-11-28', percentComplete: 50,
          dailyPlan: buildPlanRange('2026-11-18', '2026-11-28', { markComplete: true, overrides: { '2026-11-21': '50%' } }),
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-404', wbs: '8', area: 'Data Hall 3',
          description: 'Remove Panels as Wrigley Needs',
          org: 'Custom Drywall', responsible: 'Dan', crew: 2,
          startDate: '2026-11-18', endDate: '2026-11-24', percentComplete: 30,
          dailyPlan: { '2026-11-18': 'x', '2026-11-20': 'x', '2026-11-23': 'x', '2026-11-24': 'x' },
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: 'On-call coordination with mechanical equipment move-in', prerequisiteStatus: 'OPEN'
        },
        {
          id: 't-405', wbs: '8', area: 'Data Hall 3',
          description: 'TFO cutouts for Raceways',
          org: 'Custom Drywall', responsible: 'Dan', crew: 3,
          startDate: '2026-11-18', endDate: '2026-11-19', percentComplete: 90,
          dailyPlan: { '2026-11-18': '90%', '2026-11-19': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-406', wbs: '10', area: 'Data Hall 3',
          description: 'Install Carbon Pipe DH3 (Above Ceiling) North',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 6,
          startDate: '2026-11-23', endDate: '2026-11-30', percentComplete: 0,
          dailyPlan: buildPlanRange('2026-11-23', '2026-11-30', { markComplete: true }),
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-407', wbs: '10', area: 'Data Hall 3',
          description: 'Install DH3 Bypass - North',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 5,
          startDate: '2026-11-18', endDate: '2026-11-23', percentComplete: 70,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'x', '2026-11-20': 'x', '2026-11-21': 'x', '2026-11-23': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-408', wbs: '11', area: 'Data Hall 3',
          description: 'Install Supports DH3 (Above Ceiling) South',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 4,
          startDate: '2026-11-18', endDate: '2026-11-23', percentComplete: 75,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'x', '2026-11-20': 'x', '2026-11-21': 'x', '2026-11-23': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },
        {
          id: 't-409', wbs: '11', area: 'Data Hall 3',
          description: 'Install DH3 Bypass - South',
          org: 'LoenBro', responsible: 'Anthony Richison', crew: 5,
          startDate: '2026-11-18', endDate: '2026-11-23', percentComplete: 65,
          dailyPlan: { '2026-11-18': 'x', '2026-11-19': 'x', '2026-11-20': 'x', '2026-11-21': 'x', '2026-11-23': 'C' },
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },

        // ================= DATA HALL 4 (1 Task) =================
        {
          id: 't-501', wbs: '8', area: 'Data Hall 4',
          description: 'Patch TFO conduits as needed for Magnum',
          org: 'Custom Drywall', responsible: 'Dan', crew: 3,
          startDate: '2026-11-23', endDate: '2026-12-02', percentComplete: 0,
          dailyPlan: { '2026-11-23': 'S', '2026-12-01': 'x', '2026-12-02': 'x' },
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: 'Requires Magnum TFO conduit penetrations complete in DH4', prerequisiteStatus: 'OPEN'
        },

        // ================= DATA HALL 5 (1 Task) =================
        {
          id: 't-601', wbs: '7', area: 'Data Hall 5',
          description: 'Install Upper Drops',
          org: 'Viking', responsible: 'Bob D', crew: 4,
          startDate: '2026-11-24', endDate: '2026-11-28', percentComplete: 0,
          dailyPlan: buildPlanRange('2026-11-24', '2026-11-28', { markStart: true }),
          completedAsPlanned: null, varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        },

        // ================= DATA HALL 6 (1 Task) =================
        {
          id: 't-701', wbs: '11', area: 'Data Hall 6',
          description: 'Install Upper Fire Drops',
          org: 'Viking', responsible: 'Bob D', crew: 4,
          startDate: '2026-11-18', endDate: '2026-11-28', percentComplete: 50,
          dailyPlan: buildPlanRange('2026-11-18', '2026-11-28', { markComplete: true, overrides: { '2026-11-21': '50%' } }),
          completedAsPlanned: 'YES', varianceCategory: '',
          prerequisite: '', prerequisiteStatus: 'CLEARED'
        }
      ];
    }

    // Initial Pending Trade Submissions (Badged Demo Staging so Queue is immediately testable)
    function createInitialPendingSubmissions() {
      return [
        {
          subId: 'sub-demo-1',
          isDemo: true,
          type: 'TASK_UPDATE',
          taskId: 't-105',
          org: 'Magnum',
          submittedBy: 'Paul',
          submittedAt: '2026-11-18 08:45 AM',
          area: 'Admin',
          wbs: '6',
          description: 'Magnum - 4 Inch Jumpers (need core drills) (First Floor)',
          proposedStartDate: '2026-11-23',
          proposedEndDate: '2026-11-25',
          proposedPercent: 0,
          proposedCrew: 4,
          proposedCompletedAsPlanned: 'NO',
          proposedVarianceCategory: 'Prerequisite / Handoff Delay',
          proposedPrerequisite: 'First Floor core drills layout verified; shifting start to Monday 11/23 once coring finishes Friday',
          comment: 'Requesting 2-workday shift so core drilling crew clears First Floor risers.'
        },
        {
          subId: 'sub-demo-2',
          isDemo: true,
          type: 'TASK_UPDATE',
          taskId: 't-209',
          org: 'LoenBro',
          submittedBy: 'Anthony Richison',
          submittedAt: '2026-11-18 09:10 AM',
          area: 'Data Hall 1',
          wbs: '8',
          description: 'Receive CDU Skid',
          proposedStartDate: '2026-11-18',
          proposedEndDate: '2026-11-19',
          proposedPercent: 100,
          proposedCrew: 4,
          proposedCompletedAsPlanned: 'YES',
          proposedVarianceCategory: '',
          proposedPrerequisite: '',
          comment: 'CDU skid offloaded and set on pads ahead of schedule - ready to release HPC TFO flush header layout.'
        },
        {
          subId: 'sub-demo-3',
          isDemo: true,
          type: 'NEW_TASK',
          taskId: null,
          org: 'WL Hall',
          submittedBy: 'Corey Harold',
          submittedAt: '2026-11-18 09:32 AM',
          area: 'Data Hall 2',
          wbs: '12',
          description: 'Structural Ceiling Grid Installation - DH2 West Section (Follow-on sequence)',
          proposedStartDate: '2026-12-01',
          proposedEndDate: '2026-12-05',
          proposedPercent: 0,
          proposedCrew: 6,
          proposedCompletedAsPlanned: null,
          proposedVarianceCategory: '',
          proposedPrerequisite: 'Drop rod inspection sign-off in DH2 West',
          comment: 'Adding 3-week lookahead continuation immediately following DH2 Center section.'
        },
        {
          subId: 'sub-demo-4',
          isDemo: true,
          type: 'TASK_UPDATE',
          taskId: 't-107',
          org: 'Custom Drywall',
          submittedBy: 'Dan',
          submittedAt: '2026-11-18 09:50 AM',
          area: 'Admin',
          wbs: '8',
          description: 'Soffit and ceiling framing',
          proposedStartDate: '2026-11-18',
          proposedEndDate: '2026-11-21',
          proposedPercent: 45,
          proposedCrew: 5,
          proposedCompletedAsPlanned: 'YES',
          proposedVarianceCategory: '',
          proposedPrerequisite: '',
          comment: 'Adding 1 framer Friday & Saturday to close out Admin East soffits before Steinbrecher prime paint.'
        }
      ];
    }


function createInitialMops(projectLabel) {
  const projName = projectLabel || 'Polaris Forge 1 - ELN04 - TFO';
  return [
    {
      mopId: 'MOP-2026-101',
      isSample: true,
      project: projName,
      discipline: 'Electrical MOP',
      org: 'Magnum',
      area: 'Data Hall 3',
      proposedStartDate: '2026-11-20',
      proposedStartTime: '07:00',
      risk: 'High',
      duration: '2 Days',
      actualStartDate: '',
      actualStartTime: '',
      actualCompletionDate: '',
      actualCompletionTime: '',
      workDescription: 'Upper RPP Conduit Tie-In & Panelboard LOTO Verification in Data Hall 3',
      workAreasRooms: 'DH3 North Electrical Alcove, RPP-3A / RPP-3B',
      escortsRequired: 'Yes',
      escortSteps: 'Steps 2-5',
      affectedSystems: 'DH3 North RPP feeder distribution; arc-flash boundary - upstream breaker LOTO isolation required prior to entry.',
      coreweaveEscortRequired: 'No',
      coreweaveEscortSteps: 'N/A',
      tradeReps: [
        { name: 'Paul', company: 'Magnum', phone: '(701) 555-0142', email: 'paul@magnum-elec.example' }
      ],
      steps: [
        { stepNo: 1, description: 'Conduct pre-task safety tailboard with McGough MEP Super and verify energized work boundary signage.', room: 'DH3-301', sub: 'Magnum' },
        { stepNo: 2, description: 'Perform zero-energy verification and apply personal LOTO locks on upstream switchgear breaker.', room: 'DH3-301', sub: 'Magnum' },
        { stepNo: 3, description: 'Complete Upper RPP conduit terminations and torque feeder lugs per spec.', room: 'DH3-North', sub: 'Magnum' },
        { stepNo: 4, description: 'Perform megger insulation test and phase rotation check prior to panel cover re-installation.', room: 'DH3-North', sub: 'Magnum' },
        { stepNo: 5, description: 'Remove LOTO locks in sequence and confirm normal panel status with McGough and Applied Digital Fac Ops.', room: 'DH3-301', sub: 'Magnum' }
      ],
      workflowStatus: 'SUBMITTED',
      mcgoughApproval: { status: 'PENDING', approverName: '', phone: '', email: '', approvedAt: '', note: '' },
      clientApproval: { status: 'PENDING', approverName: '', company: 'Applied Digital Fac Ops', phone: '', email: '', approvedAt: '', note: '', concerns: '' },
      constructionViews: [],
      approvalDate: '',
      createdAt: '2026-11-18 08:30 AM'
    },
    {
      mopId: 'MOP-2026-102',
      isSample: true,
      project: projName,
      discipline: 'Mechanical / Piping MOP',
      org: 'HPC',
      area: 'Data Hall 1',
      proposedStartDate: '2026-11-20',
      proposedStartTime: '08:00',
      risk: 'Medium',
      duration: '3 Days',
      actualStartDate: '',
      actualStartTime: '',
      actualCompletionDate: '',
      actualCompletionTime: '',
      workDescription: 'Chemical Passivation & High-Volume Flush Valve Switchover on Combined Base Build Carbon Piping',
      workAreasRooms: 'Data Hall 1 Mechanical Gallery & CDU Header Corridor',
      escortsRequired: 'Yes',
      escortSteps: 'Steps 1-4',
      affectedSystems: 'DH1 primary CHW / Tech Water carbon piping loop; temporary isolation of CDU branch headers & chemical containment.',
      coreweaveEscortRequired: 'Yes',
      coreweaveEscortSteps: 'Steps 3-4',
      tradeReps: [
        { name: 'Noel', company: 'HPC', phone: '(701) 555-0188', email: 'noel@hpc-piping.example' },
        { name: 'Anthony Richison', company: 'LoenBro', phone: '(701) 555-0194', email: 'arichison@loenbro.example' }
      ],
      steps: [
        { stepNo: 1, description: 'Verify base build high-volume flush strainer blowdown readings and set chemical spill containment berms.', room: 'DH1-Mech', sub: 'HPC' },
        { stepNo: 2, description: 'Isolate CDU branch isolation valves with LoenBro verification prior to passivation circulation.', room: 'DH1-Bay1', sub: 'LoenBro' },
        { stepNo: 3, description: 'Circulate passivation solution through combined carbon header loop and monitor pH / temperature logs.', room: 'DH1-Mech', sub: 'HPC' },
        { stepNo: 4, description: 'Neutralize, flush to verified conductivity target, and restore manifold lineup.', room: 'DH1-Mech', sub: 'HPC' }
      ],
      workflowStatus: 'SUBMITTED',
      mcgoughApproval: { status: 'APPROVED', approverName: 'MEP Superintendent (McGough)', phone: '', email: 'mep-super@mcgough.example', approvedAt: '2026-11-18 09:40 AM', note: 'Valve isolation sequence verified with LoenBro.' },
      clientApproval: { status: 'PENDING', approverName: '', company: 'Applied Digital Fac Ops', phone: '', email: '', approvedAt: '', note: '', concerns: '' },
      constructionViews: [
        { repName: 'Owner Construction Manager', role: 'Applied Digital Construction', viewedAt: '2026-11-18 10:15 AM' }
      ],
      approvalDate: '',
      createdAt: '2026-11-18 09:05 AM'
    }
  ];
}

// Global Scopes Registry + Current Scoped State
let projectScopes = StorageAdapter.loadScopesRegistry();
let loginSelectedScopeId = 'el-b4-tfo';
let loginAdSubRole = 'facops'; // 'facops' | 'construction'
let pendingBarConfirmAction = null;



function createInitialP6Activities() {
  const baseTasks = createInitialTasks();
  return baseTasks.map(function(t, idx) {
    const num = 1010 + (idx * 10);
    return {
      p6Id: 'P6-' + num,
      linkedTaskId: t.id,
      wbs: t.wbs || '-',
      area: t.area,
      org: t.org,
      activityName: t.description,
      p6Start: t.startDate,
      p6Finish: t.endDate,
      priorPercent: Math.max(0, Number(t.percentComplete || 0) - 10),
      p6Percent: Number(t.percentComplete || 0)
    };
  });
}

function createInitialP6History() {
  return [
    {
      snapId: 'snap-wk10',
      label: 'Planning Week 10 Baseline % Tracker (2026-11-11)',
      submittedAt: '2026-11-11 04:00 PM',
      submittedBy: 'Senior Project Engineer (McGough)',
      overallPercent: 32,
      activityCount: 44,
      items: createInitialTasks().map(function(t, idx) {
        return {
          p6Id: 'P6-' + (1010 + idx * 10),
          area: t.area,
          org: t.org,
          activityName: t.description,
          p6Start: t.startDate,
          p6Finish: t.endDate,
          p6Percent: Math.max(0, Number(t.percentComplete || 0) - 10)
        };
      })
    }
  ];
}

function createInitialPcos() {
  return [
    {
      pcoId: 'PCO-EL4T-001',
      isSample: true,
      org: 'Magnum',
      submittedBy: 'Paul',
      submittedAt: '2026-11-19 01:20 PM',
      area: 'Admin',
      room: 'First Floor Riser 102',
      title: 'Additional Core Drill Layout & Fire-Rated Sleeve Upsizing for 4-Inch Jumpers',
      reason: 'Field Condition / Coordination',
      romAmount: 6850,
      pricingBasis: 'T&M Not-to-Exceed',
      scheduleImpactType: 'SCHEDULE_IMPACT', // 'COST_ONLY' | 'SCHEDULE_IMPACT'
      impactedP6Id: 'P6-1050',
      impactedP6Name: 'Magnum - 4 Inch Jumpers (need core drills) (First Floor)',
      estimatedSlipDays: 2,
      status: 'PENDING_MCGOUGH', // 'PENDING_MCGOUGH' | 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED'
      mcgoughComments: [
        { author: 'MEP Superintendent (McGough)', timestamp: '2026-11-19 03:10 PM', visibility: 'SHARED', text: 'Verified slab thickness in Riser 102 - reviewing T&M hours breakdown.' }
      ],
      sharedWithAppliedDigital: false,
      sharedWithAdAt: '',
      sharedWithAdNote: ''
    }
  ];
}

function createInitialNotificationSettings() {
  return {
    wwpMeetingSchedule: 'Tuesdays at 2:00 PM CST',
    teamsWebhookUrl: '',
    emailWebhookUrl: '',
    contacts: [
      { id: 'nc-1', name: 'Jesse Lilley', group: 'MCGOUGH', email: 'Jesse.Lilley@McGough.com', phone: '', notifyWwp: true, notifyMop: true, notifyPco: true, notifyP6: true },
      { id: 'nc-2', name: 'MEP Superintendent', group: 'MCGOUGH', email: 'mep-super@mcgough.example', phone: '', notifyWwp: true, notifyMop: true, notifyPco: true, notifyP6: true },
      { id: 'nc-3', name: 'Critical Facilities Ops Lead', group: 'AD_FACOPS', email: 'facops@applieddigital.com', phone: '', notifyWwp: false, notifyMop: true, notifyPco: false, notifyP6: false },
      { id: 'nc-4', name: 'Owner Construction Manager', group: 'AD_CONST', email: 'construction@applieddigital.com', phone: '', notifyWwp: false, notifyMop: true, notifyPco: false, notifyP6: true },
      { id: 'nc-5', name: 'Paul (Magnum)', group: 'TRADE:Magnum', email: 'paul@magnum-elec.example', phone: '(701) 555-0142', notifyWwp: true, notifyMop: true, notifyPco: true, notifyP6: true },
      { id: 'nc-6', name: 'Anthony Richison (LoenBro)', group: 'TRADE:LoenBro', email: 'arichison@loenbro.example', phone: '(701) 555-0194', notifyWwp: true, notifyMop: true, notifyPco: true, notifyP6: true },
      { id: 'nc-7', name: 'Noel (HPC)', group: 'TRADE:HPC', email: 'noel@hpc-piping.example', phone: '(701) 555-0188', notifyWwp: true, notifyMop: true, notifyPco: true, notifyP6: true }
    ]
  };
}

function createInitialTradeSchedules() {
  return {
    'Magnum': {
      org: 'Magnum',
      updatedBy: 'Paul',
      updatedAt: '2026-11-18 08:15 AM',
      shiftPattern: 'Mon-Fri (5x10s)',
      shiftHours: '06:30 - 17:00',
      dailyCrew: 5,
      sat1Status: 'Working - Partial Crew',
      sat1Crew: 3,
      sun1Status: 'Off-Site',
      sun1Crew: 0,
      sat2Status: 'Off-Site',
      sat2Crew: 0,
      sun2Status: 'Off-Site',
      sun2Crew: 0,
      offSiteDates: [
        { date: '2026-11-26', reason: 'Thanksgiving Holiday - Off-Site' },
        { date: '2026-11-27', reason: 'Day After Thanksgiving - Off-Site' }
      ],
      notes: 'Available Saturday 11/21 for Admin overhead rough-in & DH3 RPP terminations.'
    },
    'LoenBro': {
      org: 'LoenBro',
      updatedBy: 'Anthony Richison',
      updatedAt: '2026-11-18 08:40 AM',
      shiftPattern: 'Mon-Sat (6x10s)',
      shiftHours: '07:00 - 17:30',
      dailyCrew: 16,
      sat1Status: 'Working - Full Crew',
      sat1Crew: 12,
      sun1Status: 'Off-Site',
      sun1Crew: 0,
      sat2Status: 'Working - Partial Crew',
      sat2Crew: 6,
      sun2Status: 'Off-Site',
      sun2Crew: 0,
      offSiteDates: [
        { date: '2026-11-26', reason: 'Thanksgiving Holiday - Off-Site' }
      ],
      notes: 'Welding & piping crews working Saturday 11/21 and Friday 11/27.'
    },
    'HPC': {
      org: 'HPC',
      updatedBy: 'Noel',
      updatedAt: '2026-11-18 09:00 AM',
      shiftPattern: 'Mon-Sat (6x10s)',
      shiftHours: '07:00 - 17:30',
      dailyCrew: 4,
      sat1Status: 'Working - Full Crew',
      sat1Crew: 4,
      sun1Status: 'Working - Partial Crew',
      sun1Crew: 2,
      sat2Status: 'Off-Site',
      sat2Crew: 0,
      sun2Status: 'Off-Site',
      sun2Crew: 0,
      offSiteDates: [
        { date: '2026-11-26', reason: 'Thanksgiving Holiday - Off-Site' },
        { date: '2026-11-27', reason: 'Holiday Weekend - Off-Site' }
      ],
      notes: 'Monitoring passivation circulation loop over weekend 11/21-11/22.'
    }
  };
}

function createFreshScopeState(scopeMeta) {
  const isSeeded = Boolean(scopeMeta && scopeMeta.hasBaselineSeed);
  return {
    scopeId: scopeMeta ? scopeMeta.scopeId : 'el-b4-tfo',
    portalMode: 'gc', // 'gc' | 'mop' | 'trade'
    gcTab: 'lookahead', // 'lookahead' | 'approvals' | 'roadblocks' | 'analytics'
    lookaheadStart: '2026-11-18',
    horizonDays: 16,
    displayMode: 'hybrid',
    collapsedAreas: {},
    areas: INITIAL_AREAS.slice(),
    organizations: JSON.parse(JSON.stringify(INITIAL_ORGANIZATIONS)),
    approvers: JSON.parse(JSON.stringify(INITIAL_APPROVERS)),
    activeApproverId: 'app-1',
    clientApprovers: JSON.parse(JSON.stringify(INITIAL_FACOPS_APPROVERS)),
    activeClientApproverId: 'fop-1',
    clientConstReps: JSON.parse(JSON.stringify(INITIAL_CONST_REPS)),
    activeClientConstId: 'con-1',
    officialTasks: isSeeded ? createInitialTasks() : [],
    pendingSubmissions: isSeeded ? createInitialPendingSubmissions() : [],
    mops: isSeeded ? createInitialMops(scopeMeta.label) : [],
    auditLog: [],
    wwpChangeLog: [],
    frozenBaseline: null,
    tradeWorkSchedules: isSeeded ? createInitialTradeSchedules() : {},
    p6Activities: isSeeded ? createInitialP6Activities() : [],
    p6TrackerHistory: isSeeded ? createInitialP6History() : [],
    showP6Overlay: true,
    pcos: isSeeded ? createInitialPcos() : [],
    notificationSettings: createInitialNotificationSettings(),
    notificationOutbox: [],
    showHiddenEarly: false,
    meetingMode: false,
    muteMeetingToasts: true,
    dismissedTeamsTip: false,
    // Suffix PIN digits (combined with Scope Prefix e.g. EL4T-2026)
    gcPasscodeSuffix: '2026',
    facOpsPasscodeSuffix: '2027',
    constPasscodeSuffix: '2028',
    mopSubTab: 'both',
    // Active tab session fields (populated from sessionStorage)
    authenticated: false,
    authRole: null, // 'mcgough' | 'client_facops' | 'client_const' | 'trade'
    gcAuthenticated: false,
    clientAuthenticated: false,
    selectedTradeOrg: 'Magnum',
    portalForeman: 'Paul',
    portalStagedItems: []
  };
}

let state = createFreshScopeState(projectScopes[0]);

let ganttDrag = {
  active: false,
  moved: false,
  mode: null,
  taskId: null,
  anchorIso: null,
  origStart: null,
  origEnd: null,
  origDailyPlan: null,
  suppressNextClick: false
};

let chartInstances = {
  area: null,
  trade: null,
  variance: null
};

function getScopeById(scopeId) {
  for (let i = 0; i < projectScopes.length; i++) {
    if (projectScopes[i].scopeId === scopeId) return projectScopes[i];
  }
  return projectScopes[0];
}

function getActiveScope() {
  return getScopeById(state.scopeId || loginSelectedScopeId);
}

function normalizePinToken(str) {
  return String(str || '').trim().toUpperCase().replace(/\s+/g, '');
}

function getExpectedMcGoughPin(scopeObj) {
  const sc = scopeObj || getActiveScope();
  return sc.prefix.toUpperCase() + '-' + (state.gcPasscodeSuffix || '2026').toUpperCase();
}

function getExpectedFacOpsPin(scopeObj) {
  const sc = scopeObj || getActiveScope();
  return sc.prefix.toUpperCase() + '-' + (state.facOpsPasscodeSuffix || '2027').toUpperCase();
}

function getExpectedConstPin(scopeObj) {
  const sc = scopeObj || getActiveScope();
  return sc.prefix.toUpperCase() + '-' + (state.constPasscodeSuffix || '2028').toUpperCase();
}

function getContractorPinSuffix(orgCode) {
  const orgObj = getOrgByCode(orgCode);
  if (orgObj && orgObj.pinCode) return orgObj.pinCode.toUpperCase();
  return String(orgCode || 'TRD').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 3).padEnd(3, 'X');
}

function getContractorAccessCode(orgCode, scopeObj) {
  const sc = scopeObj || getActiveScope();
  return sc.prefix.toUpperCase() + '-' + getContractorPinSuffix(orgCode);
}

function pinMatchesExpected(enteredRaw, expectedWithHyphen, autoFilledPrefix) {
  const rawClean = normalizePinToken(enteredRaw).replace(/-/g, '');
  const fullClean = normalizePinToken(expectedWithHyphen).replace(/-/g, '');
  if (!rawClean || !fullClean) return false;
  if (rawClean === fullClean) return true;
  // Since the project prefix (e.g. EL4T-) is auto-filled in the UI box, allow entering JUST the suffix (e.g. 2026 or MAG)!
  if (autoFilledPrefix) {
    const prefClean = normalizePinToken(autoFilledPrefix).replace(/-/g, '');
    if (prefClean && (prefClean + rawClean) === fullClean) return true;
  }
  return false;
}

function loadScopeIntoState(scopeId, preserveSession) {
  const scopeMeta = getScopeById(scopeId);
  loginSelectedScopeId = scopeMeta.scopeId;
  const base = createFreshScopeState(scopeMeta);
  const saved = StorageAdapter.loadScopeWorkspace(scopeMeta.scopeId);

  const prevAuth = {
    authenticated: state.authenticated,
    authRole: state.authRole,
    gcAuthenticated: state.gcAuthenticated,
    clientAuthenticated: state.clientAuthenticated,
    portalMode: state.portalMode,
    gcTab: state.gcTab,
    mopSubTab: state.mopSubTab,
    meetingMode: state.meetingMode,
    selectedTradeOrg: state.selectedTradeOrg,
    portalForeman: state.portalForeman,
    activeApproverId: state.activeApproverId,
    activeClientApproverId: state.activeClientApproverId,
    activeClientConstId: state.activeClientConstId
  };

  if (saved && typeof saved === 'object') {
    const cleanSaved = (typeof stripSessionFields === 'function') ? stripSessionFields(saved) : saved;
    state = Object.assign({}, base, cleanSaved);
    state.scopeId = scopeMeta.scopeId;
    // Upgrade legacy organizations so every org has its collision-free pinCode
    state.organizations = INITIAL_ORGANIZATIONS.map(function(defOrg) {
      const existing = (saved.organizations || []).find(function(x) { return x.code === defOrg.code; });
      return existing ? Object.assign({}, defOrg, existing, { pinCode: defOrg.pinCode }) : JSON.parse(JSON.stringify(defOrg));
    });
    (saved.organizations || []).forEach(function(customOrg) {
      if (!state.organizations.some(function(o) { return o.code === customOrg.code; })) {
        if (!customOrg.pinCode) {
          customOrg.pinCode = String(customOrg.code).replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 3).padEnd(3, 'X');
        }
        state.organizations.push(customOrg);
      }
    });
    if (!Array.isArray(state.clientConstReps) || state.clientConstReps.length === 0) {
      state.clientConstReps = JSON.parse(JSON.stringify(INITIAL_CONST_REPS));
    }
    if (!Array.isArray(state.wwpChangeLog)) state.wwpChangeLog = [];
    if (!Array.isArray(state.p6Activities) || (scopeMeta.hasBaselineSeed && state.p6Activities.length === 0)) {
      state.p6Activities = scopeMeta.hasBaselineSeed ? createInitialP6Activities() : [];
    }
    if (!Array.isArray(state.p6TrackerHistory)) {
      state.p6TrackerHistory = scopeMeta.hasBaselineSeed ? createInitialP6History() : [];
    }
    if (typeof state.showP6Overlay !== 'boolean') state.showP6Overlay = true;
    if (!Array.isArray(state.pcos)) {
      state.pcos = scopeMeta.hasBaselineSeed ? createInitialPcos() : [];
    }
    if (!state.notificationSettings || !Array.isArray(state.notificationSettings.contacts)) {
      state.notificationSettings = createInitialNotificationSettings();
    }
    if (!Array.isArray(state.notificationOutbox)) state.notificationOutbox = [];
    (state.mops || []).forEach(function(m) {
      if (!m.revision) m.revision = 1;
      if (!m.authorRole) m.authorRole = 'TRADE';
      if (!m.tradeSignOffs || typeof m.tradeSignOffs !== 'object') m.tradeSignOffs = {};
      if (!Array.isArray(m.revisionHistory)) m.revisionHistory = [];
    });
    if (!state.tradeWorkSchedules || typeof state.tradeWorkSchedules !== 'object') {
      state.tradeWorkSchedules = scopeMeta.hasBaselineSeed ? createInitialTradeSchedules() : {};
    }
    (state.mops || []).forEach(function(m) {
      if (!Array.isArray(m.constructionViews)) m.constructionViews = [];
      if (m.clientApproval && typeof m.clientApproval.concerns !== 'string') m.clientApproval.concerns = '';
    });
  } else {
    state = base;
  }

  if (preserveSession) {
    Object.assign(state, prevAuth);
  } else {
    state.authenticated = false;
    state.authRole = null;
    state.gcAuthenticated = false;
    state.clientAuthenticated = false;
  }
  if (StorageAdapter && typeof StorageAdapter.watchScope === 'function') {
    StorageAdapter.watchScope(scopeMeta.scopeId);
  }
}

function persistActiveTabViewToSession() {
  if (!state.authenticated || !state.authRole) return;
  const sess = StorageAdapter.loadActiveSession() || {};
  sess.authenticated = true;
  sess.scopeId = state.scopeId;
  sess.role = state.authRole;
  sess.portalMode = state.portalMode;
  sess.gcTab = state.gcTab;
  sess.mopSubTab = state.mopSubTab;
  sess.activeApproverId = state.activeApproverId;
  sess.activeClientApproverId = state.activeClientApproverId;
  sess.activeClientConstId = state.activeClientConstId;
  sess.selectedTradeOrg = state.selectedTradeOrg;
  StorageAdapter.saveActiveSession(sess);
}

function saveState() {
  persistActiveTabViewToSession();
  const copy = (typeof stripSessionFields === 'function') ? stripSessionFields(state) : Object.assign({}, state);
  StorageAdapter.saveScopeWorkspace(state.scopeId, copy);
}

function restoreSessionOnBoot() {
  projectScopes = StorageAdapter.loadScopesRegistry();
  const sess = StorageAdapter.loadActiveSession();
  if (sess && sess.authenticated && sess.scopeId && sess.role) {
    loadScopeIntoState(sess.scopeId, false);
    state.authenticated = true;
    state.authRole = sess.role;
    state.gcAuthenticated = sess.role === 'mcgough';
    state.clientAuthenticated = (sess.role === 'client_facops' || sess.role === 'client_const');
    if (sess.activeApproverId) state.activeApproverId = sess.activeApproverId;
    if (sess.activeClientApproverId) state.activeClientApproverId = sess.activeClientApproverId;
    if (sess.activeClientConstId) state.activeClientConstId = sess.activeClientConstId;
    if (sess.selectedTradeOrg) {
      state.selectedTradeOrg = sess.selectedTradeOrg;
      state.portalForeman = getOrgByCode(sess.selectedTradeOrg).defaultForeman || '';
    }
    if (sess.portalMode) state.portalMode = sess.portalMode;
    if (sess.gcTab) state.gcTab = sess.gcTab;
    if (sess.mopSubTab) state.mopSubTab = sess.mopSubTab;
    applyRoleDefaultView();
  } else {
    const defSc = projectScopes.find(function(s) { return s.scopeId === 'el-b4-tfo'; }) || projectScopes[0];
    loadScopeIntoState(defSc.scopeId, false);
  }
}

function applyRoleDefaultView() {
  if (state.authRole === 'client_facops') {
    state.portalMode = 'mop';
    state.mopSubTab = 'queue';
  } else if (state.authRole === 'client_const') {
    if (state.portalMode !== 'gc' && state.portalMode !== 'mop') {
      state.portalMode = 'mop';
    }
    state.mopSubTab = 'queue';
    state.gcTab = 'lookahead';
  } else if (state.authRole === 'trade') {
    if (['trade', 'mop', 'pco', 'p6_trade'].indexOf(state.portalMode) === -1) {
      state.portalMode = 'trade';
    }
  } else if (state.authRole === 'mcgough') {
    if (state.portalMode !== 'gc' && state.portalMode !== 'mop') {
      state.portalMode = 'gc';
    }
  }
}

function getExpectedPortalFileForRole(role) {
  if (role === 'mcgough') return 'mcgough.html';
  if (role === 'client_facops') return 'client-facops.html';
  if (role === 'client_const') return 'client-const.html';
  if (role === 'trade') return 'trade.html';
  return 'index.html';
}

// =========================================================================
// HELPERS (100% Pure 7-bit ASCII - Zero '?' Dropdown Glitches)
// =========================================================================
function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getOrgByCode(code) {
  for (let i = 0; i < state.organizations.length; i++) {
    if (state.organizations[i].code.toLowerCase() === String(code || '').toLowerCase()) {
      return state.organizations[i];
    }
  }
  return { code: code || 'Unassigned', pinCode: 'TRD', fullName: code || 'Unassigned', color: '#475569', defaultForeman: '' };
}

function getActiveApprover() {
  for (let i = 0; i < state.approvers.length; i++) {
    if (state.approvers[i].id === state.activeApproverId) return state.approvers[i];
  }
  return state.approvers[0] || { id: 'app-1', name: 'Lead Superintendent', role: 'McGough Approver', scope: 'All' };
}

function getActiveClientApprover() {
  for (let i = 0; i < state.clientApprovers.length; i++) {
    if (state.clientApprovers[i].id === state.activeClientApproverId) return state.clientApprovers[i];
  }
  return state.clientApprovers[0] || { id: 'fop-1', name: 'Critical Facilities Ops Lead', role: 'Applied Digital Fac Ops', email: '' };
}

function getActiveClientConstRep() {
  for (let i = 0; i < state.clientConstReps.length; i++) {
    if (state.clientConstReps[i].id === state.activeClientConstId) return state.clientConstReps[i];
  }
  return state.clientConstReps[0] || { id: 'con-1', name: 'Owner Construction Manager', role: 'Applied Digital Construction', email: '' };
}

function getTaskById(taskId) {
  for (let i = 0; i < state.officialTasks.length; i++) {
    if (state.officialTasks[i].id === taskId) return state.officialTasks[i];
  }
  return null;
}

function getPendingForTask(taskId) {
  const matches = [];
  for (let i = 0; i < state.pendingSubmissions.length; i++) {
    if (state.pendingSubmissions[i].taskId === taskId) {
      matches.push(state.pendingSubmissions[i]);
    }
  }
  return matches;
}

// Active MOP / LOTO Room Clash Detector (Co-Developer Addition #1)
function parseDurationDaysCount(durStr) {
  const m = String(durStr || '1').match(/(\d+)/);
  if (!m) return 1;
  const num = Number(m[1]) || 1;
  if (String(durStr || '').toLowerCase().indexOf('hour') !== -1) return 1;
  return Math.max(1, num);
}

function getActiveMopClashesForTask(task) {
  if (!task || !Array.isArray(state.mops)) return [];
  return state.mops.filter(function(m) {
    if (m.workflowStatus !== 'SUBMITTED' && m.workflowStatus !== 'FULLY_APPROVED') return false;
    if (m.area !== task.area) return false;
    const mopStart = m.proposedStartDate || BASE_ANCHOR_DATE;
    const spanDays = parseDurationDaysCount(m.duration);
    const mopEnd = addDaysIso(mopStart, spanDays - 1);
    return mopEnd >= task.startDate && mopStart <= task.endDate;
  });
}

function normalizeContractorGrouping() {
  const grouped = [];
  const seenTaskIds = {};
  state.areas.forEach(function(areaName) {
    const inArea = state.officialTasks.filter(function(t) { return t.area === areaName; });
    const orgOrder = [];
    inArea.forEach(function(t) {
      if (orgOrder.indexOf(t.org) === -1) orgOrder.push(t.org);
    });
    orgOrder.forEach(function(orgCode) {
      inArea.forEach(function(t) {
        if (t.org === orgCode && !seenTaskIds[t.id]) {
          grouped.push(t);
          seenTaskIds[t.id] = true;
        }
      });
    });
  });
  state.officialTasks.forEach(function(t) {
    if (!seenTaskIds[t.id]) {
      grouped.push(t);
      seenTaskIds[t.id] = true;
    }
  });
  state.officialTasks = grouped;
}

function insertTaskGroupedWithContractor(newTask) {
  let lastSameOrgInAreaIdx = -1;
  let lastInAreaIdx = -1;
  for (let i = 0; i < state.officialTasks.length; i++) {
    const cur = state.officialTasks[i];
    if (cur.area === newTask.area) {
      lastInAreaIdx = i;
      if (cur.org === newTask.org) {
        lastSameOrgInAreaIdx = i;
      }
    }
  }
  if (lastSameOrgInAreaIdx !== -1) {
    state.officialTasks.splice(lastSameOrgInAreaIdx + 1, 0, newTask);
  } else if (lastInAreaIdx !== -1) {
    state.officialTasks.splice(lastInAreaIdx + 1, 0, newTask);
  } else {
    state.officialTasks.push(newTask);
  }
  normalizeContractorGrouping();
}

function computePlanningWeekNumber(startIso) {
  const diff = diffDaysIso(BASE_ANCHOR_DATE, startIso);
  const weekOffset = Math.floor(diff / 7);
  return BASE_PLANNING_WEEK + weekOffset;
}

function recordWwpChange(category, opts) {
  const o = opts || {};
  if (!Array.isArray(state.wwpChangeLog)) state.wwpChangeLog = [];
  const nowStr = '11/20 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let actor = o.actor || '';
  if (!actor) {
    if (state.authRole === 'mcgough') actor = getActiveApprover().name + ' (McGough)';
    else if (state.authRole === 'trade') actor = (state.portalForeman || 'Foreman') + ' (' + state.selectedTradeOrg + ')';
    else actor = 'System';
  }
  state.wwpChangeLog.unshift({
    logId: 'chg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: nowStr,
    category: category, // 'TRADE_SUBMITTED' | 'MCGOUGH_APPROVED' | 'MCGOUGH_RETURNED' | 'LIVE_MCGOUGH_EDIT' | 'LIVE_ROW_INSERT' | 'TASK_UNDO' | 'BASELINE_FREEZE' | 'TRADE_SCHEDULE'
    actor: actor,
    org: o.org || '-',
    area: o.area || '-',
    taskDesc: o.taskDesc || '',
    beforeVal: o.beforeVal || '',
    afterVal: o.afterVal || '',
    postFreeze: Boolean(state.frozenBaseline && category !== 'BASELINE_FREEZE')
  });
  if (state.wwpChangeLog.length > 250) state.wwpChangeLog.pop();
}

function getContractorOffSiteReason(orgCode, isoDate) {
  const sched = state.tradeWorkSchedules && state.tradeWorkSchedules[orgCode];
  if (!sched) return '';
  if (Array.isArray(sched.offSiteDates)) {
    for (let i = 0; i < sched.offSiteDates.length; i++) {
      if (sched.offSiteDates[i].date === isoDate) {
        return sched.offSiteDates[i].reason || 'Planned Day Off-Site';
      }
    }
  }
  if (isoDate === '2026-11-21' && sched.sat1Status === 'Off-Site') return 'Saturday 11/21 Off-Site';
  if (isoDate === '2026-11-22' && sched.sun1Status === 'Off-Site') return 'Sunday 11/22 Off-Site';
  if (isoDate === '2026-11-28' && sched.sat2Status === 'Off-Site') return 'Saturday 11/28 Off-Site';
  if (isoDate === '2026-11-29' && sched.sun2Status === 'Off-Site') return 'Sunday 11/29 Off-Site';
  return '';
}

function printTabloidWwp() {
  const sc = getActiveScope();
  const wkNum = computePlanningWeekNumber(state.lookaheadStart);
  const winEnd = addDaysIso(state.lookaheadStart, state.horizonDays - 1);
  const ppc = typeof computePpcStats === 'function' ? computePpcStats() : { pct: 100 };
  const printBanner = document.getElementById('wwp-print-title-block');
  if (printBanner) {
    const freezeText = state.frozenBaseline
      ? ('FROZEN BASELINE (' + state.frozenBaseline.frozenAt + ' by ' + state.frozenBaseline.frozenBy + ')')
      : 'WORKING SCHEDULE';
    printBanner.innerHTML =
      '<div class="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-2 text-xs">' +
        '<div>' +
          '<div class="text-base font-bold text-slate-900">MCGOUGH OFFICIAL WEEKLY WORK PLAN (11x17 TABLOID LANDSCAPE) - ' + escapeHtml(sc.label) + '</div>' +
          '<div class="text-[11px] text-slate-700">Planning Week ' + wkNum + ' | Window: ' + formatShortDate(state.lookaheadStart) + ' to ' + formatShortDate(winEnd) + ' (' + state.horizonDays + ' Days) | Status: <strong>' + escapeHtml(freezeText) + '</strong></div>' +
        '</div>' +
        '<div class="text-right text-[11px] text-slate-700">' +
          '<div><strong>PPC Score:</strong> ' + ppc.pct + '% | <strong>Tasks:</strong> ' + state.officialTasks.filter(function(t) { return !t.hiddenEarly; }).length + '</div>' +
          '<div>Printed: 2026-11-20</div>' +
        '</div>' +
      '</div>';
  }
  document.body.classList.add('print-tabloid-11x17');
  setTimeout(function() {
    window.print();
    setTimeout(function() {
      document.body.classList.remove('print-tabloid-11x17');
    }, 600);
  }, 80);
}

function showToast(message, variant) {
  const tone = variant || 'success';
  if (state.meetingMode && state.muteMeetingToasts && tone !== 'error') {
    return;
  }
  const container = document.getElementById('toast-container');
  if (!container) return;
  const bgClass = tone === 'error'
    ? 'bg-rose-900 border-rose-700 text-white'
    : tone === 'info'
      ? 'bg-slate-900 border-slate-700 text-white'
      : 'bg-emerald-900 border-emerald-700 text-white';

  const el = document.createElement('div');
  el.className = 'pointer-events-auto px-4 py-3 rounded-xl border shadow-lg text-xs font-medium flex items-center gap-2.5 transition-all ' + bgClass;
  el.innerHTML = '<span class="w-2 h-2 rounded-full bg-current shrink-0"></span><span>' + escapeHtml(message) + '</span>';
  container.appendChild(el);
  setTimeout(function() {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 3800);
}

function copyTextSafe(text, successMsg) {
  const done = function() {
    showToast(successMsg || 'Copied to clipboard!', 'info');
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(function() {
      fallbackCopy(text, done);
    });
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, callback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    if (callback) callback();
  } catch (e) {
    showToast('Select text in modal to copy.', 'info');
  }
  document.body.removeChild(ta);
}

function countPendingMops() {
  return (state.mops || []).filter(function(m) {
    return m.workflowStatus === 'SUBMITTED' && (m.mcgoughApproval.status !== 'APPROVED' || m.clientApproval.status !== 'APPROVED');
  }).length;
}

// =========================================================================
// DEDICATED LOGIN GATE & MULTI-CAMPUS SCOPE SELECTOR (Blank PINs + Enter Key)
// =========================================================================
let loginSelectedGcApproverId = 'app-1';
let loginSelectedAdRepId = 'fop-1';
let loginSelectedTradeOrgCode = 'HPC';

function handleLoginGcApproverSelect(val) {
  if (val) loginSelectedGcApproverId = val;
}

function handleLoginAdRepSelect(val) {
  if (val) loginSelectedAdRepId = val;
}

function handleLoginTradeOrgSelect(val) {
  if (val) loginSelectedTradeOrgCode = val;
}

function populateLoginGateSelectors() {
  const campusSel = document.getElementById('login-campus-select');
  const projSel = document.getElementById('login-project-select');
  if (!campusSel || !projSel) return;

  const campuses = [];
  projectScopes.forEach(function(s) {
    if (campuses.indexOf(s.campus) === -1) campuses.push(s.campus);
  });

  const activeSc = getScopeById(loginSelectedScopeId);
  campusSel.innerHTML = campuses.map(function(c) {
    return '<option value="' + escapeHtml(c) + '"' + (c === activeSc.campus ? ' selected' : '') + '>' + escapeHtml(c) + '</option>';
  }).join('');

  let inCampus = projectScopes.filter(function(s) { return s.campus === activeSc.campus; });
  if (inCampus.length === 0) inCampus = projectScopes.slice();

  projSel.innerHTML = inCampus.map(function(s) {
    const projDisplay = s.building + ' (' + s.prefix + '-)';
    return '<option value="' + escapeHtml(s.scopeId) + '"' + (s.scopeId === activeSc.scopeId ? ' selected' : '') + '>' + escapeHtml(projDisplay) + '</option>';
  }).join('');

  const prefixBadge = document.getElementById('login-active-prefix-badge');
  if (prefixBadge) {
    prefixBadge.textContent = 'Active Project Identifier: ' + activeSc.prefix + '-';
  }

  // Load selected project's personnel & contractor roster without resetting user's dropdown pick!
  if (state.scopeId !== activeSc.scopeId) {
    loadScopeIntoState(activeSc.scopeId, state.authenticated);
  } else if (StorageAdapter && typeof StorageAdapter.watchScope === 'function') {
    StorageAdapter.watchScope(activeSc.scopeId);
  }

  const gcAppSel = document.getElementById('login-gc-approver');
  if (gcAppSel) {
    const curGc = gcAppSel.value || loginSelectedGcApproverId;
    const approverList = (Array.isArray(state.approvers) && state.approvers.length > 0) ? state.approvers : INITIAL_APPROVERS;
    if (approverList.some(function(a) { return a.id === curGc; })) {
      loginSelectedGcApproverId = curGc;
    } else if (approverList[0]) {
      loginSelectedGcApproverId = approverList[0].id;
    }
    gcAppSel.innerHTML = approverList.map(function(a) {
      return '<option value="' + escapeHtml(a.id) + '"' + (a.id === loginSelectedGcApproverId ? ' selected' : '') + '>' + escapeHtml(a.name + ' - ' + a.role) + '</option>';
    }).join('');
    gcAppSel.value = loginSelectedGcApproverId;
  }

  renderLoginAdRepOptions();

  const trOrgSel = document.getElementById('login-trade-org');
  if (trOrgSel) {
    const curTr = trOrgSel.value || loginSelectedTradeOrgCode;
    const orgSource = (Array.isArray(state.organizations) && state.organizations.length > 1) ? state.organizations : INITIAL_ORGANIZATIONS;
    const tradeOrgs = orgSource.filter(function(o) { return !o.isGC; });
    if (tradeOrgs.some(function(o) { return o.code === curTr; })) {
      loginSelectedTradeOrgCode = curTr;
    } else if (tradeOrgs[0]) {
      loginSelectedTradeOrgCode = tradeOrgs[0].code;
    }
    trOrgSel.innerHTML = tradeOrgs.map(function(o) {
      return '<option value="' + escapeHtml(o.code) + '"' + (o.code === loginSelectedTradeOrgCode ? ' selected' : '') + '>' + escapeHtml(o.code + ' - ' + o.fullName) + '</option>';
    }).join('');
    trOrgSel.value = loginSelectedTradeOrgCode;
  }

  // Update auto-filled prefix badges right inside all 3 PIN input boxes!
  const prefText = activeSc.prefix + '-';
  ['login-gc-prefix-addon', 'login-ad-prefix-addon', 'login-trade-prefix-addon'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = prefText;
  });

  const gcPinInp = document.getElementById('login-gc-pin');
  const adPinInp = document.getElementById('login-ad-pin');
  const trPinInp = document.getElementById('login-trade-pin');
  if (gcPinInp) gcPinInp.placeholder = 'XXXX digits (e.g. 2026)';
  if (adPinInp) adPinInp.placeholder = 'XXXX digits';
  if (trPinInp) trPinInp.placeholder = '3-letter code (e.g. MAG)';
}

function handleLoginCampusChange(campusName) {
  const firstMatch = projectScopes.find(function(s) { return s.campus === campusName; });
  if (firstMatch) {
    loginSelectedScopeId = firstMatch.scopeId;
    loadScopeIntoState(firstMatch.scopeId, state.authenticated);
    populateLoginGateSelectors();
  }
}

function handleLoginProjectChange(scopeId) {
  const found = projectScopes.find(function(s) { return s.scopeId === scopeId; });
  if (found) {
    loginSelectedScopeId = found.scopeId;
    loadScopeIntoState(found.scopeId, state.authenticated);
    populateLoginGateSelectors();
  }
}

function setLoginAdSubRole(subRole) {
  loginAdSubRole = subRole === 'construction' ? 'construction' : 'facops';
  const btnFac = document.getElementById('login-ad-btn-facops');
  const btnCon = document.getElementById('login-ad-btn-const');
  const descEl = document.getElementById('login-ad-role-desc');
  if (btnFac && btnCon) {
    btnFac.className = loginAdSubRole === 'facops'
      ? 'flex-1 py-1.5 px-2.5 rounded-md text-xs font-bold bg-indigo-600 text-white shadow-sm transition'
      : 'flex-1 py-1.5 px-2.5 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 transition';
    btnCon.className = loginAdSubRole === 'construction'
      ? 'flex-1 py-1.5 px-2.5 rounded-md text-xs font-bold bg-sky-700 text-white shadow-sm transition'
      : 'flex-1 py-1.5 px-2.5 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 transition';
  }
  if (descEl) {
    descEl.textContent = loginAdSubRole === 'facops'
      ? 'Fac Ops Portal: Opens MOP Approval Queue directly. Exclusive Gate 2 MOP sign-off authority.'
      : 'Construction Portal: View-Only MOP Tracker (logs Viewed indicator) + Read-Only Official WWP.';
  }
  renderLoginAdRepOptions();
}

function renderLoginAdRepOptions() {
  const sel = document.getElementById('login-ad-rep');
  if (!sel) return;
  const curVal = sel.value || loginSelectedAdRepId;
  if (loginAdSubRole === 'facops') {
    const list = (Array.isArray(state.clientApprovers) && state.clientApprovers.length > 0) ? state.clientApprovers : INITIAL_FACOPS_APPROVERS;
    if (list.some(function(c) { return c.id === curVal; })) loginSelectedAdRepId = curVal;
    else if (list[0]) loginSelectedAdRepId = list[0].id;
    sel.innerHTML = list.map(function(c) {
      return '<option value="' + escapeHtml(c.id) + '"' + (c.id === loginSelectedAdRepId ? ' selected' : '') + '>' + escapeHtml(c.name + ' (Fac Ops)') + '</option>';
    }).join('');
    sel.value = loginSelectedAdRepId;
  } else {
    const list = (Array.isArray(state.clientConstReps) && state.clientConstReps.length > 0) ? state.clientConstReps : INITIAL_CONST_REPS;
    if (list.some(function(c) { return c.id === curVal; })) loginSelectedAdRepId = curVal;
    else if (list[0]) loginSelectedAdRepId = list[0].id;
    sel.innerHTML = list.map(function(c) {
      return '<option value="' + escapeHtml(c.id) + '"' + (c.id === loginSelectedAdRepId ? ' selected' : '') + '>' + escapeHtml(c.name + ' (Construction)') + '</option>';
    }).join('');
    sel.value = loginSelectedAdRepId;
  }
}

// Press Enter inside ANY PIN box to submit immediately without mouse click
function handleLoginPinKeydown(event, roleTarget) {
  if (event && event.key === 'Enter') {
    event.preventDefault();
    if (roleTarget === 'mcgough') submitMcGoughLogin();
    else if (roleTarget === 'ad') submitAppliedDigitalLogin();
    else if (roleTarget === 'trade') submitTradePartnerLogin();
  }
}

function findOtherScopeMatchingPin(enteredRaw, roleType, orgCode) {
  // Only check explicit full-prefix entries (e.g. EL3B-2026) against other scopes
  const cleanEntered = normalizePinToken(enteredRaw).replace(/-/g, '');
  if (cleanEntered.length <= 4) return null;
  for (let i = 0; i < projectScopes.length; i++) {
    const sc = projectScopes[i];
    if (sc.scopeId === loginSelectedScopeId) continue;
    const saved = StorageAdapter.loadScopeWorkspace(sc.scopeId) || {};
    let candidate = '';
    if (roleType === 'mcgough') candidate = sc.prefix + '-' + (saved.gcPasscodeSuffix || '2026');
    else if (roleType === 'facops') candidate = sc.prefix + '-' + (saved.facOpsPasscodeSuffix || '2027');
    else if (roleType === 'construction') candidate = sc.prefix + '-' + (saved.constPasscodeSuffix || '2028');
    else if (roleType === 'trade') candidate = sc.prefix + '-' + getContractorPinSuffix(orgCode);
    if (pinMatchesExpected(enteredRaw, candidate, null)) return sc;
  }
  return null;
}

function submitMcGoughLogin() {
  const appSel = document.getElementById('login-gc-approver');
  const chosenApproverId = (appSel && appSel.value) ? appSel.value : loginSelectedGcApproverId;
  const scopeMeta = getScopeById(loginSelectedScopeId);
  loadScopeIntoState(scopeMeta.scopeId, false);
  const pinInp = document.getElementById('login-gc-pin');
  const entered = pinInp ? pinInp.value : '';
  const expected = getExpectedMcGoughPin(scopeMeta);

  if (!pinMatchesExpected(entered, expected, scopeMeta.prefix)) {
    const otherScope = findOtherScopeMatchingPin(entered, 'mcgough', null);
    if (otherScope) {
      showToast('That PIN belongs to ' + otherScope.label + '. Switch 2. Project above first.', 'error');
    } else {
      showToast('Invalid McGough PIN for ' + scopeMeta.label + '.', 'error');
    }
    return;
  }

  state.activeApproverId = chosenApproverId || state.activeApproverId;
  state.authenticated = true;
  state.authRole = 'mcgough';
  state.gcAuthenticated = true;
  state.clientAuthenticated = false;
  state.portalMode = 'gc';
  state.gcTab = 'lookahead';
  if (pinInp) pinInp.value = '';

  StorageAdapter.saveActiveSession({
    authenticated: true,
    scopeId: scopeMeta.scopeId,
    role: 'mcgough',
    portalMode: 'gc',
    gcTab: 'lookahead',
    activeApproverId: state.activeApproverId
  });
  saveState();

  if (window.MCGOUGH_MULTIPAGE && window.MCGOUGH_PAGE_ID !== 'mcgough') {
    window.location.href = 'mcgough.html';
    return;
  }
  renderAll();
  showToast('Signed in to ' + scopeMeta.label + ' as ' + getActiveApprover().name + '.', 'success');
}

function submitAppliedDigitalLogin() {
  const repSel = document.getElementById('login-ad-rep');
  const chosenRepId = (repSel && repSel.value) ? repSel.value : loginSelectedAdRepId;
  const scopeMeta = getScopeById(loginSelectedScopeId);
  loadScopeIntoState(scopeMeta.scopeId, false);
  const pinInp = document.getElementById('login-ad-pin');
  const entered = pinInp ? pinInp.value : '';

  if (loginAdSubRole === 'facops') {
    const expected = getExpectedFacOpsPin(scopeMeta);
    if (!pinMatchesExpected(entered, expected, scopeMeta.prefix)) {
      const otherScope = findOtherScopeMatchingPin(entered, 'facops', null);
      if (otherScope) {
        showToast('That Fac Ops PIN is for ' + otherScope.label + '. Switch 2. Project above first.', 'error');
      } else {
        showToast('Invalid Applied Digital Fac Ops PIN for ' + scopeMeta.label + '.', 'error');
      }
      return;
    }
    state.activeClientApproverId = chosenRepId || state.activeClientApproverId;
    state.authenticated = true;
    state.authRole = 'client_facops';
    state.clientAuthenticated = true;
    state.gcAuthenticated = false;
    state.portalMode = 'mop';
    state.mopSubTab = 'queue';
    if (pinInp) pinInp.value = '';

    StorageAdapter.saveActiveSession({
      authenticated: true,
      scopeId: scopeMeta.scopeId,
      role: 'client_facops',
      portalMode: 'mop',
      mopSubTab: 'queue',
      activeClientApproverId: state.activeClientApproverId
    });
    saveState();

    if (window.MCGOUGH_MULTIPAGE && window.MCGOUGH_PAGE_ID !== 'client_facops') {
      window.location.href = 'client-facops.html';
      return;
    }
    renderAll();
    showToast('Signed in as Applied Digital Fac Ops (' + getActiveClientApprover().name + ') - MOP Approval Queue.', 'success');
  } else {
    const expected = getExpectedConstPin(scopeMeta);
    if (!pinMatchesExpected(entered, expected, scopeMeta.prefix)) {
      const otherScope = findOtherScopeMatchingPin(entered, 'construction', null);
      if (otherScope) {
        showToast('That Construction PIN is for ' + otherScope.label + '. Switch 2. Project above first.', 'error');
      } else {
        showToast('Invalid Applied Digital Construction PIN for ' + scopeMeta.label + '.', 'error');
      }
      return;
    }
    state.activeClientConstId = chosenRepId || state.activeClientConstId;
    state.authenticated = true;
    state.authRole = 'client_const';
    state.clientAuthenticated = true;
    state.gcAuthenticated = false;
    state.portalMode = 'mop';
    state.mopSubTab = 'queue';
    state.gcTab = 'lookahead';
    if (pinInp) pinInp.value = '';

    StorageAdapter.saveActiveSession({
      authenticated: true,
      scopeId: scopeMeta.scopeId,
      role: 'client_const',
      portalMode: 'mop',
      gcTab: 'lookahead',
      activeClientConstId: state.activeClientConstId
    });
    saveState();

    if (window.MCGOUGH_MULTIPAGE && window.MCGOUGH_PAGE_ID !== 'client_const') {
      window.location.href = 'client-const.html';
      return;
    }
    renderAll();
    showToast('Signed in as Applied Digital Construction (' + getActiveClientConstRep().name + ').', 'info');
  }
}

function submitTradePartnerLogin() {
  const orgSel = document.getElementById('login-trade-org');
  const orgCode = (orgSel && orgSel.value) ? orgSel.value : (loginSelectedTradeOrgCode || 'Magnum');
  const scopeMeta = getScopeById(loginSelectedScopeId);
  loadScopeIntoState(scopeMeta.scopeId, false);
  const pinInp = document.getElementById('login-trade-pin');
  const entered = pinInp ? pinInp.value : '';
  const expected = getContractorAccessCode(orgCode, scopeMeta);

  if (!pinMatchesExpected(entered, expected, scopeMeta.prefix)) {
    const otherScope = findOtherScopeMatchingPin(entered, 'trade', orgCode);
    if (otherScope) {
      showToast('That code belongs to ' + otherScope.label + '. Switch 2. Project above first.', 'error');
    } else {
      showToast('Invalid Trade Access Code for ' + orgCode + ' on ' + scopeMeta.label + '.', 'error');
    }
    return;
  }

  state.selectedTradeOrg = orgCode;
  state.portalForeman = getOrgByCode(orgCode).defaultForeman || '';
  state.authenticated = true;
  state.authRole = 'trade';
  state.gcAuthenticated = false;
  state.clientAuthenticated = false;
  state.portalMode = 'trade';
  state.portalStagedItems = [];
  if (pinInp) pinInp.value = '';

  StorageAdapter.saveActiveSession({
    authenticated: true,
    scopeId: scopeMeta.scopeId,
    role: 'trade',
    portalMode: 'trade',
    selectedTradeOrg: orgCode
  });
  saveState();

  if (window.MCGOUGH_MULTIPAGE && window.MCGOUGH_PAGE_ID !== 'trade') {
    window.location.href = 'trade.html';
    return;
  }
  renderAll();
  showToast('Signed in to ' + orgCode + ' Portal (' + scopeMeta.label + ').', 'success');
}

function signOutPortalSession() {
  StorageAdapter.clearActiveSession();
  state.authenticated = false;
  state.authRole = null;
  state.gcAuthenticated = false;
  state.clientAuthenticated = false;
  closeModal();
  if (window.MCGOUGH_MULTIPAGE && window.MCGOUGH_PAGE_ID !== 'login') {
    window.location.replace('index.html');
    return;
  }
  populateLoginGateSelectors();
  renderAll();
  showToast('Signed out cleanly.', 'info');
}

// McGough In-Header Quick Project Scope Switcher
function handleMcGoughHeaderScopeSwitch(nextScopeId) {
  if (state.authRole !== 'mcgough') return;
  loadScopeIntoState(nextScopeId, true);
  StorageAdapter.saveActiveSession({
    authenticated: true,
    scopeId: nextScopeId,
    role: 'mcgough',
    activeApproverId: state.activeApproverId
  });
  renderAll();
  showToast('Switched active workspace to ' + getActiveScope().label, 'info');
}

// =========================================================================
// STRICT FOUR-PORTAL ISOLATION & MASTER RENDER DISPATCHER
// =========================================================================
function enforcePortalRouteGuard() {
  if (!state.authenticated || !state.authRole) {
    if (window.MCGOUGH_MULTIPAGE && window.MCGOUGH_PAGE_ID !== 'login') {
      window.location.replace('index.html');
      return true;
    }
    return false;
  }

  if (window.MCGOUGH_MULTIPAGE) {
    const expectedFile = getExpectedPortalFileForRole(state.authRole);
    const curId = window.MCGOUGH_PAGE_ID || '';
    const validMap = {
      mcgough: 'mcgough',
      client_facops: 'client_facops',
      client_const: 'client_const',
      trade: 'trade'
    };
    if (curId !== validMap[state.authRole]) {
      window.location.replace(expectedFile);
      return true;
    }
  }

  // Enforce role-level sub-mode locks
  if (state.authRole === 'client_facops') {
    state.portalMode = 'mop';
    state.mopSubTab = 'queue';
  } else if (state.authRole === 'client_const') {
    if (state.portalMode !== 'mop' && state.portalMode !== 'gc') {
      state.portalMode = 'mop';
    }
    state.mopSubTab = 'queue';
    state.gcTab = 'lookahead';
  } else if (state.authRole === 'trade') {
    if (['trade', 'mop', 'pco', 'p6_trade'].indexOf(state.portalMode) === -1) {
      state.portalMode = 'trade';
    }
  } else if (state.authRole === 'mcgough') {
    if (state.portalMode !== 'gc' && state.portalMode !== 'mop') {
      state.portalMode = 'gc';
    }
  }
  return false;
}

function renderAll() {
  if (enforcePortalRouteGuard()) return;

  const loginShell = document.getElementById('login-gate-shell');
  const portalHeader = document.getElementById('portal-header');
  const gcWs = document.getElementById('gc-workspace');
  const tradeWs = document.getElementById('trade-portal-workspace');
  const mopWs = document.getElementById('mop-workspace');
  const pcoWs = document.getElementById('pco-trade-workspace');
  const trP6Ws = document.getElementById('trade-p6-workspace');

  if (!state.authenticated || !state.authRole) {
    if (loginShell) loginShell.classList.remove('hidden');
    if (portalHeader) portalHeader.classList.add('hidden');
    if (gcWs) gcWs.classList.add('hidden');
    if (tradeWs) tradeWs.classList.add('hidden');
    if (mopWs) mopWs.classList.add('hidden');
    if (pcoWs) pcoWs.classList.add('hidden');
    if (trP6Ws) trP6Ws.classList.add('hidden');
    return;
  }

  if (loginShell) loginShell.classList.add('hidden');
  const inMeeting = Boolean(state.meetingMode && state.authRole === 'mcgough' && state.portalMode === 'gc');
  if (portalHeader) portalHeader.classList.toggle('hidden', inMeeting);
  const mmBar = document.getElementById('meeting-mode-bar');
  if (mmBar) {
    mmBar.classList.toggle('hidden', !inMeeting);
    if (inMeeting && typeof renderMeetingModeBar === 'function') renderMeetingModeBar();
  }

  const activeScope = getActiveScope();
  const wkNum = computePlanningWeekNumber(state.lookaheadStart);

  const titleEl = document.getElementById('header-portal-title');
  const scopeBadgeEl = document.getElementById('header-scope-badge');
  const wkLabel = document.getElementById('planning-week-label');
  if (wkLabel) wkLabel.textContent = 'Planning Week ' + wkNum;
  if (scopeBadgeEl) scopeBadgeEl.textContent = activeScope.prefix + ' | ' + activeScope.label;
  updateCloudSyncBadges();

  if (titleEl) {
    if (state.authRole === 'mcgough') titleEl.textContent = 'McGough Construction Portal';
    else if (state.authRole === 'client_facops') titleEl.textContent = 'Applied Digital - Fac Ops MOP Approval Portal';
    else if (state.authRole === 'client_const') titleEl.textContent = 'Applied Digital - Construction Review Portal';
    else titleEl.textContent = state.selectedTradeOrg + ' - Trade Partner Portal';
  }

  // McGough Quick Scope Switcher in Header
  const mcScopeWrap = document.getElementById('mcgough-scope-switcher-wrap');
  const mcScopeSel = document.getElementById('mcgough-header-scope-select');
  if (mcScopeWrap && mcScopeSel) {
    const isMc = state.authRole === 'mcgough';
    mcScopeWrap.classList.toggle('hidden', !isMc);
    if (isMc) {
      mcScopeSel.innerHTML = projectScopes.map(function(s) {
        return '<option value="' + escapeHtml(s.scopeId) + '"' + (s.scopeId === state.scopeId ? ' selected' : '') + '>' + escapeHtml(s.prefix + ' - ' + s.campus + ' | ' + s.building) + '</option>';
      }).join('');
    }
  }

  // Render strictly isolated center navigation pills & right action buttons per Role
  renderIsolatedHeaderControls();

  // Toggle McGough sub-nav bar inside gc-workspace (hidden for Applied Digital Construction Read-Only WWP!)
  const gcSubNav = document.getElementById('gc-subnav-bar');
  const gcEditToolbarBtns = document.getElementById('gc-edit-toolbar-actions');
  const gcHuddleHint = document.getElementById('gc-huddle-controls-hint');
  const isReadOnlyWwp = (state.authRole === 'client_const');
  if (gcSubNav) gcSubNav.classList.toggle('hidden', isReadOnlyWwp || inMeeting);
  const kpiStripEl = document.getElementById('lookahead-kpi-strip');
  if (kpiStripEl) kpiStripEl.classList.toggle('hidden', inMeeting);
  if (gcWs) {
    gcWs.className = inMeeting
      ? (state.portalMode === 'gc' ? 'flex flex-1 w-full px-2 py-2 flex-col gap-2' : 'hidden')
      : (state.portalMode === 'gc' ? 'flex flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-5 py-4 flex-col gap-4' : 'hidden');
  }
  const gridScrollEl = document.getElementById('lookahead-grid-container');
  if (gridScrollEl) {
    gridScrollEl.className = inMeeting
      ? 'schedule-scroll overflow-x-auto max-h-[calc(100vh-145px)]'
      : 'schedule-scroll overflow-x-auto max-h-[68vh]';
  }
  if (gcEditToolbarBtns) gcEditToolbarBtns.classList.toggle('hidden', isReadOnlyWwp);
  if (gcHuddleHint) {
    gcHuddleHint.textContent = isReadOnlyWwp
      ? 'Read-Only Construction View: Filter by Area, Contractor, or Date Window. Schedule edits are restricted to McGough.'
      : 'Live Controls: Drag bar or click -1d/+1d (opens verification prompt) | Click Undo on any modified row | Click cell for S/x/C.';
  }

  // Show ONLY the active workspace allowed for this role
  const curMode = state.portalMode;
  if (gcWs) {
    gcWs.classList.toggle('hidden', curMode !== 'gc');
    gcWs.classList.toggle('flex', curMode === 'gc');
  }
  if (tradeWs) {
    tradeWs.classList.toggle('hidden', curMode !== 'trade');
    tradeWs.classList.toggle('flex', curMode === 'trade');
  }
  if (mopWs) {
    mopWs.classList.toggle('hidden', curMode !== 'mop');
    mopWs.classList.toggle('flex', curMode === 'mop');
  }
  if (pcoWs) {
    pcoWs.classList.toggle('hidden', curMode !== 'pco');
    pcoWs.classList.toggle('flex', curMode === 'pco');
  }
  if (trP6Ws) {
    trP6Ws.classList.toggle('hidden', curMode !== 'p6_trade');
    trP6Ws.classList.toggle('flex', curMode === 'p6_trade');
  }

  const notifBadge = document.getElementById('notif-outbox-pill');
  if (notifBadge) notifBadge.textContent = String((state.notificationOutbox || []).length);

  if (curMode === 'gc' && gcWs && typeof renderActiveGcTab === 'function') {
    populateDropdownOptions();
    renderActiveGcTab();
  } else if (curMode === 'trade' && tradeWs && typeof renderTradePortal === 'function') {
    populatePortalDropdowns();
    renderTradePortal();
  } else if (curMode === 'mop' && mopWs && typeof renderMopWorkspace === 'function') {
    renderMopWorkspace();
  } else if (curMode === 'pco' && pcoWs && typeof renderTradePcoWorkspace === 'function') {
    renderTradePcoWorkspace();
  } else if (curMode === 'p6_trade' && trP6Ws && typeof renderTradeP6Workspace === 'function') {
    renderTradeP6Workspace();
  }
}

function renderIsolatedHeaderControls() {
  const navContainer = document.getElementById('role-center-nav');
  const adminBtns = document.getElementById('mcgough-admin-actions');
  const sessionPill = document.getElementById('active-session-role-pill');

  if (adminBtns) {
    adminBtns.classList.toggle('hidden', state.authRole !== 'mcgough');
  }

  const approverPill = document.getElementById('active-approver-pill');
  if (approverPill && state.authRole === 'mcgough') {
    approverPill.textContent = getActiveApprover().name;
  }

  if (sessionPill) {
    if (state.authRole === 'mcgough') {
      sessionPill.textContent = 'McGough: ' + getActiveApprover().name;
      sessionPill.className = 'px-2.5 py-1 rounded-lg bg-red-950/80 text-red-200 border border-red-700/60 text-xs font-semibold';
    } else if (state.authRole === 'client_facops') {
      sessionPill.textContent = 'AD Fac Ops: ' + getActiveClientApprover().name;
      sessionPill.className = 'px-2.5 py-1 rounded-lg bg-indigo-950/90 text-indigo-200 border border-indigo-500/50 text-xs font-semibold';
    } else if (state.authRole === 'client_const') {
      sessionPill.textContent = 'AD Construction: ' + getActiveClientConstRep().name;
      sessionPill.className = 'px-2.5 py-1 rounded-lg bg-sky-950/90 text-sky-200 border border-sky-500/50 text-xs font-semibold';
    } else {
      sessionPill.textContent = 'Trade: ' + state.selectedTradeOrg;
      sessionPill.className = 'px-2.5 py-1 rounded-lg bg-slate-800 text-sky-300 border border-sky-500/40 text-xs font-semibold';
    }
  }

  if (!navContainer) return;
  const pendingWwp = state.pendingSubmissions.length;
  const pendingMops = countPendingMops();

  if (state.authRole === 'mcgough') {
    const gcActive = state.portalMode === 'gc';
    const mopActive = state.portalMode === 'mop';
    navContainer.innerHTML =
      '<button type="button" onclick="switchPortalMode(\'gc\')" class="px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ' + (gcActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white') + '">' +
        '<span>Official WWP &amp; Queues</span>' +
        '<span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold ' + (pendingWwp > 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-300') + '">' + pendingWwp + '</span>' +
      '</button>' +
      '<button type="button" onclick="switchPortalMode(\'mop\')" class="px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ' + (mopActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white') + '">' +
        '<span>MOP Gate 1 &amp; Log</span>' +
        '<span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold ' + (pendingMops > 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-300') + '">' + pendingMops + '</span>' +
      '</button>';
  } else if (state.authRole === 'client_facops') {
    // Fac Ops sees MOP Approvals ONLY - zero other tabs!
    const needFacOps = (state.mops || []).filter(function(m) {
      return m.workflowStatus === 'SUBMITTED' && m.clientApproval.status !== 'APPROVED';
    }).length;
    navContainer.innerHTML =
      '<span class="px-3 py-1.5 rounded-md text-xs font-bold bg-indigo-600 text-white shadow-sm flex items-center gap-1.5">' +
        '<span>Gate 2 MOP Approvals Only</span>' +
        '<span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">' + needFacOps + ' Pending</span>' +
      '</span>';
  } else if (state.authRole === 'client_const') {
    // Construction sees View-Only MOPs + Read-Only Official WWP
    const mopActive = state.portalMode === 'mop';
    const wwpActive = state.portalMode === 'gc';
    navContainer.innerHTML =
      '<button type="button" onclick="switchPortalMode(\'mop\')" class="px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ' + (mopActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white') + '">' +
        '<span>MOP Tracker (View-Only)</span>' +
      '</button>' +
      '<button type="button" onclick="switchPortalMode(\'gc\')" class="px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ' + (wwpActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white') + '">' +
        '<span>Official WWP (Read-Only)</span>' +
      '</button>';
  } else if (state.authRole === 'trade') {
    const trActive = state.portalMode === 'trade';
    const mopActive = state.portalMode === 'mop';
    const p6Active = state.portalMode === 'p6_trade';
    const pcoActive = state.portalMode === 'pco';
    const myMops = (state.mops || []).filter(function(m) {
      return m.org === state.selectedTradeOrg || (m.tradeSignOffs && m.tradeSignOffs[state.selectedTradeOrg]);
    }).length;
    const myPcos = (state.pcos || []).filter(function(p) { return p.org === state.selectedTradeOrg; }).length;
    navContainer.innerHTML =
      '<button type="button" onclick="switchPortalMode(\'trade\')" class="px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ' + (trActive ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white') + '">' +
        '<span>My WWP</span>' +
      '</button>' +
      '<button type="button" onclick="switchPortalMode(\'p6_trade\')" class="px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ' + (p6Active ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white') + '">' +
        '<span>P6 Schedule</span>' +
      '</button>' +
      '<button type="button" onclick="switchPortalMode(\'mop\')" class="px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ' + (mopActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white') + '">' +
        '<span>MOPs (' + myMops + ')</span>' +
      '</button>' +
      '<button type="button" onclick="switchPortalMode(\'pco\')" class="px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ' + (pcoActive ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-300 hover:text-white') + '">' +
        '<span>My PCOs (' + myPcos + ')</span>' +
      '</button>';
  }
}

function switchPortalMode(mode) {
  if (!state.authenticated) return;
  if (state.authRole === 'client_facops' && mode !== 'mop') {
    showToast('Applied Digital Fac Ops access is strictly limited to MOP Approvals.', 'error');
    return;
  }
  if (state.authRole === 'client_const' && mode !== 'mop' && mode !== 'gc') {
    return;
  }
  if (state.authRole === 'trade' && mode === 'gc') {
    showToast('Official WWP editing is restricted to McGough.', 'error');
    return;
  }
  state.portalMode = mode;
  if (state.authRole === 'client_const' && mode === 'gc') {
    state.gcTab = 'lookahead';
  }
  if (state.authRole === 'trade' && mode === 'mop') {
    state.mopSubTab = 'both';
  }
  saveState();
  renderAll();
}

function switchGcTab(tab) {
  if (state.authRole !== 'mcgough') return;
  state.gcTab = tab;
  state.portalMode = 'gc';
  saveState();
  renderAll();
}

function renderActiveGcTab() {
  const tabs = ['lookahead', 'approvals', 'p6', 'pcos', 'roadblocks', 'analytics', 'changelog'];
  if (state.authRole === 'client_const') {
    state.gcTab = 'lookahead';
  }
  tabs.forEach(function(t) {
    const btn = document.getElementById('gc-tab-' + t);
    const sec = document.getElementById('view-' + t);
    if (btn) {
      btn.className = t === state.gcTab
        ? 'px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-2 bg-slate-900 text-white shadow-sm'
        : 'px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-2 text-slate-600 hover:bg-slate-100';
    }
    if (sec) {
      sec.classList.toggle('hidden', t !== state.gcTab);
      sec.classList.toggle('flex', t === state.gcTab);
    }
  });

  const badgeTab = document.getElementById('pending-badge-tab');
  if (badgeTab) badgeTab.textContent = String(state.pendingSubmissions.length);
  const openRbCount = state.officialTasks.filter(function(t) {
    return t.prerequisite && t.prerequisiteStatus !== 'CLEARED';
  }).length;
  const rbBadge = document.getElementById('roadblock-badge-tab');
  if (rbBadge) rbBadge.textContent = String(openRbCount);

  if (state.gcTab === 'lookahead' && typeof renderLookaheadView === 'function') renderLookaheadView();
  else if (state.gcTab === 'approvals' && typeof renderApprovalsView === 'function') renderApprovalsView();
  else if (state.gcTab === 'roadblocks' && typeof renderRoadblocksView === 'function') renderRoadblocksView();
  else if (state.gcTab === 'analytics' && typeof renderAnalyticsView === 'function') renderAnalyticsView();
  else if (state.gcTab === 'changelog' && typeof renderChangeLogView === 'function') renderChangeLogView();
  else if (state.gcTab === 'p6' && typeof renderMcGoughP6View === 'function') renderMcGoughP6View();
  else if (state.gcTab === 'pcos' && typeof renderMcGoughPcoView === 'function') renderMcGoughPcoView();
  const pcoTabBadge = document.getElementById('pco-badge-tab');
  if (pcoTabBadge) pcoTabBadge.textContent = String((state.pcos || []).filter(function(x) { return x.status === 'PENDING_MCGOUGH'; }).length);

  const clBadge = document.getElementById('changelog-badge-tab');
  if (clBadge) clBadge.textContent = String((state.wwpChangeLog || []).length);
}

function populateDropdownOptions() {
  const areaSel = document.getElementById('filter-area');
  if (areaSel) {
    const curArea = areaSel.value || 'ALL';
    areaSel.innerHTML = '<option value="ALL">All Project Areas (' + state.areas.length + ')</option>' +
      state.areas.map(function(a) {
        return '<option value="' + escapeHtml(a) + '">' + escapeHtml(a) + '</option>';
      }).join('');
    areaSel.value = state.areas.indexOf(curArea) !== -1 ? curArea : 'ALL';
  }

  const orgSel = document.getElementById('filter-org');
  if (orgSel) {
    const curOrg = orgSel.value || 'ALL';
    orgSel.innerHTML = '<option value="ALL">All Contractors (' + state.organizations.length + ' Orgs)</option>' +
      state.organizations.map(function(o) {
        const cnt = state.officialTasks.filter(function(t) { return t.org === o.code; }).length;
        return '<option value="' + escapeHtml(o.code) + '">' + escapeHtml(o.code) + (cnt > 0 ? ' (' + cnt + ' tasks)' : '') + '</option>';
      }).join('');
    orgSel.value = curOrg;
  }

  const appSel = document.getElementById('active-approver-select');
  if (appSel) {
    appSel.innerHTML = state.approvers.map(function(a) {
      return '<option value="' + escapeHtml(a.id) + '">' + escapeHtml(a.name) + ' - ' + escapeHtml(a.role) + '</option>';
    }).join('');
    appSel.value = state.activeApproverId;
  }

  const qOrg = document.getElementById('queue-filter-org');
  if (qOrg) {
    const prevQ = qOrg.value || 'ALL';
    const subOrgs = [];
    state.pendingSubmissions.forEach(function(s) {
      if (subOrgs.indexOf(s.org) === -1) subOrgs.push(s.org);
    });
    qOrg.innerHTML = '<option value="ALL">All Submitting Trades (' + subOrgs.length + ')</option>' +
      subOrgs.map(function(c) { return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>'; }).join('');
    qOrg.value = subOrgs.indexOf(prevQ) !== -1 ? prevQ : 'ALL';
  }

  const rbArea = document.getElementById('rb-filter-area');
  if (rbArea) {
    const prevRb = rbArea.value || 'ALL';
    rbArea.innerHTML = '<option value="ALL">All Areas</option>' +
      state.areas.map(function(a) { return '<option value="' + escapeHtml(a) + '">' + escapeHtml(a) + '</option>'; }).join('');
    rbArea.value = state.areas.indexOf(prevRb) !== -1 ? prevRb : 'ALL';
  }
}

// =========================================================================
// SHARED MODALS (McGough Task Editor, Campus/PIN Manager, Share Links, Export)
// =========================================================================
function openModal(innerHtml) {
  const backdrop = document.getElementById('modal-backdrop');
  const content = document.getElementById('modal-content');
  if (!backdrop || !content) return;
  content.innerHTML = innerHtml;
  backdrop.classList.remove('hidden');
}

function closeModal() {
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) backdrop.classList.add('hidden');
  pendingBarConfirmAction = null;
}

function handleBackdropClick(e) {
  if (e.target && e.target.id === 'modal-backdrop') {
    closeModal();
  }
}

function pushTaskUndoSnapshot(task, actionLabel) {
  if (!task) return;
  if (!Array.isArray(task.undoStack)) task.undoStack = [];
  task.undoStack.push({
    startDate: task.startDate,
    endDate: task.endDate,
    percentComplete: task.percentComplete,
    dailyPlan: JSON.parse(JSON.stringify(task.dailyPlan || {})),
    completedAsPlanned: task.completedAsPlanned,
    varianceCategory: task.varianceCategory || '',
    hiddenEarly: Boolean(task.hiddenEarly),
    actionLabel: actionLabel || 'Schedule Edit'
  });
  if (task.undoStack.length > 10) task.undoStack.shift();
}

function undoLastTaskChange(taskId) {
  if (state.authRole !== 'mcgough') return;
  const task = getTaskById(taskId);
  if (!task || !Array.isArray(task.undoStack) || task.undoStack.length === 0) return;
  const prev = task.undoStack.pop();
  task.startDate = prev.startDate;
  task.endDate = prev.endDate;
  task.percentComplete = prev.percentComplete;
  task.dailyPlan = prev.dailyPlan;
  task.completedAsPlanned = prev.completedAsPlanned;
  task.varianceCategory = prev.varianceCategory;
  task.hiddenEarly = prev.hiddenEarly;
  saveState();
  renderAll();
  recordWwpChange('TASK_UNDO', { org: task.org, area: task.area, taskDesc: task.description, beforeVal: 'Reverted step', afterVal: task.startDate + ' to ' + task.endDate + ' (' + task.percentComplete + '%)' });
  saveState();
  renderAll();
  showToast('Reverted last change on "' + task.description + '" (' + task.org + ').', 'info');
}

function toggleHideTaskEarly(taskId) {
  if (state.authRole !== 'mcgough') return;
  const task = getTaskById(taskId);
  if (!task) return;
  pushTaskUndoSnapshot(task, 'Hide Early Toggle');
  if (task.hiddenEarly) {
    task.hiddenEarly = false;
    saveState();
    renderAll();
    showToast('Restored "' + task.description + '" to active WWP view.', 'info');
  } else {
    task.hiddenEarly = true;
    task.percentComplete = 100;
    if (!task.completedAsPlanned) task.completedAsPlanned = 'YES';
    if (!task.dailyPlan) task.dailyPlan = {};
    task.dailyPlan[task.endDate] = 'C';
    saveState();
    renderAll();
    showToast('Completed early! Hidden "' + task.org + '" task (use Undo or Hidden Early to restore).', 'success');
  }
}

function openTaskModal(taskId, defaultArea) {
  if (state.authRole !== 'mcgough') return;
  const existing = taskId ? getTaskById(taskId) : null;
  const t = existing || {
    wbs: '8',
    area: defaultArea || state.areas[0],
    description: '',
    org: 'LoenBro',
    responsible: 'Anthony Richison',
    crew: 4,
    startDate: state.lookaheadStart,
    endDate: addDaysIso(state.lookaheadStart, 4),
    percentComplete: 0,
    completedAsPlanned: null,
    varianceCategory: '',
    prerequisite: '',
    prerequisiteStatus: 'OPEN'
  };

  const areaOpts = state.areas.map(function(a) {
    return '<option value="' + escapeHtml(a) + '"' + (a === t.area ? ' selected' : '') + '>' + escapeHtml(a) + '</option>';
  }).join('');

  const orgOpts = state.organizations.map(function(o) {
    return '<option value="' + escapeHtml(o.code) + '"' + (o.code === t.org ? ' selected' : '') + '>' + escapeHtml(o.code) + ' - ' + escapeHtml(o.fullName) + '</option>';
  }).join('');

  openModal(
    '<div class="p-5">' +
      '<div class="flex items-center justify-between pb-3 border-b border-slate-200">' +
        '<h3 class="text-base font-bold text-slate-900">' + (existing ? 'Edit Official WWP Task' : 'Add Official WWP Task') + '</h3>' +
        (existing
          ? '<div class="flex items-center gap-3">' +
              '<button type="button" onclick="closeModal(); toggleHideTaskEarly(\'' + existing.id + '\')" class="text-xs font-semibold text-emerald-700 hover:text-emerald-900">' + (existing.hiddenEarly ? 'Unhide Task' : 'Complete Early &amp; Hide') + '</button>' +
              '<button type="button" onclick="deleteOfficialTask(\'' + existing.id + '\')" class="text-xs font-semibold text-rose-600 hover:text-rose-800">Delete Task</button>' +
            '</div>'
          : '') +
      '</div>' +
      '<div class="grid grid-cols-1 sm:grid-cols-6 gap-3 mt-4 text-xs">' +
        '<div class="sm:col-span-3"><label class="block font-semibold text-slate-700 mb-1">Project Area</label><select id="tm-area" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white">' + areaOpts + '</select></div>' +
        '<div class="sm:col-span-1"><label class="block font-semibold text-slate-700 mb-1">WBS #</label><input id="tm-wbs" type="text" value="' + escapeHtml(t.wbs) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
        '<div class="sm:col-span-2"><label class="block font-semibold text-slate-700 mb-1">Crew Size</label><input id="tm-crew" type="number" min="1" max="99" value="' + Number(t.crew || 4) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
        '<div class="sm:col-span-4"><label class="block font-semibold text-slate-700 mb-1">Organization (JOBDATA)</label><select id="tm-org" onchange="autoFillForemanInModal(this.value)" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white">' + orgOpts + '</select></div>' +
        '<div class="sm:col-span-2"><label class="block font-semibold text-slate-700 mb-1">Responsible Person</label><input id="tm-resp" type="text" value="' + escapeHtml(t.responsible) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
        '<div class="sm:col-span-6"><label class="block font-semibold text-slate-700 mb-1">Assignment Description (How Many / Sequence) *</label><input id="tm-desc" type="text" value="' + escapeHtml(t.description) + '" class="w-full px-3 py-1.5 rounded-lg border border-slate-300" /></div>' +
        '<div class="sm:col-span-2"><label class="block font-semibold text-slate-700 mb-1">Start Date</label><input id="tm-start" type="date" value="' + escapeHtml(t.startDate) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
        '<div class="sm:col-span-2"><label class="block font-semibold text-slate-700 mb-1">End Date</label><input id="tm-end" type="date" value="' + escapeHtml(t.endDate) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
        '<div class="sm:col-span-2"><label class="block font-semibold text-slate-700 mb-1">% Complete</label><input id="tm-pct" type="number" min="0" max="100" value="' + Number(t.percentComplete) + '" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300" /></div>' +
        '<div class="sm:col-span-6"><label class="block font-semibold text-slate-700 mb-1">Required Prerequisite Work From Others (Roadblock)</label><input id="tm-prereq" type="text" value="' + escapeHtml(t.prerequisite || '') + '" placeholder="Optional handoff or delivery requirement" class="w-full px-3 py-1.5 rounded-lg border border-slate-300" /></div>' +
      '</div>' +
      '<div class="mt-5 flex justify-end gap-2">' +
        '<button type="button" onclick="closeModal()" class="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700">Cancel</button>' +
        '<button type="button" onclick="saveOfficialTaskModal(\'' + (existing ? existing.id : '') + '\')" class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold">Save Official Task</button>' +
      '</div>' +
    '</div>'
  );
}

function autoFillForemanInModal(orgCode) {
  const orgObj = getOrgByCode(orgCode);
  const respInp = document.getElementById('tm-resp');
  if (respInp && orgObj.defaultForeman) {
    respInp.value = orgObj.defaultForeman;
  }
}

function saveOfficialTaskModal(existingId) {
  if (state.authRole !== 'mcgough') return;
  const desc = document.getElementById('tm-desc').value.trim();
  const sDate = document.getElementById('tm-start').value;
  const eDate = document.getElementById('tm-end').value;
  if (!desc) {
    showToast('Please enter an assignment description.', 'error');
    return;
  }
  if (!sDate || !eDate || eDate < sDate) {
    showToast('End date must be on or after start date.', 'error');
    return;
  }
  const pct = Math.min(100, Math.max(0, Number(document.getElementById('tm-pct').value) || 0));
  const prereq = document.getElementById('tm-prereq').value.trim();

  if (existingId) {
    const t = getTaskById(existingId);
    if (t) {
      pushTaskUndoSnapshot(t, 'Modal Edit');
      const datesChanged = t.startDate !== sDate || t.endDate !== eDate;
      t.area = document.getElementById('tm-area').value;
      t.wbs = document.getElementById('tm-wbs').value.trim() || '-';
      t.crew = Math.max(1, Number(document.getElementById('tm-crew').value) || 4);
      t.org = document.getElementById('tm-org').value;
      t.responsible = document.getElementById('tm-resp').value.trim();
      t.description = desc;
      t.startDate = sDate;
      t.endDate = eDate;
      t.percentComplete = pct;
      if (datesChanged) {
        t.dailyPlan = buildPlanRange(sDate, eDate, { markComplete: pct >= 100 });
      }
      t.prerequisite = prereq;
      if (!prereq) t.prerequisiteStatus = 'CLEARED';
      else if (t.prerequisiteStatus === 'CLEARED') t.prerequisiteStatus = 'OPEN';
      normalizeContractorGrouping();
    }
  } else {
    insertTaskGroupedWithContractor({
      id: 't-' + Date.now(),
      area: document.getElementById('tm-area').value,
      wbs: document.getElementById('tm-wbs').value.trim() || '-',
      crew: Math.max(1, Number(document.getElementById('tm-crew').value) || 4),
      org: document.getElementById('tm-org').value,
      responsible: document.getElementById('tm-resp').value.trim(),
      description: desc,
      startDate: sDate,
      endDate: eDate,
      percentComplete: pct,
      dailyPlan: buildPlanRange(sDate, eDate, { markStart: true, markComplete: pct >= 100 }),
      completedAsPlanned: null,
      varianceCategory: '',
      prerequisite: prereq,
      prerequisiteStatus: prereq ? 'OPEN' : 'CLEARED',
      hiddenEarly: false,
      undoStack: []
    });
  }

  closeModal();
  saveState();
  renderAll();
  recordWwpChange(existingId ? 'LIVE_MCGOUGH_EDIT' : 'LIVE_ROW_INSERT', { org: document.getElementById('tm-org').value, area: document.getElementById('tm-area').value, taskDesc: desc, beforeVal: existingId ? 'Modal Task Edit' : 'New Task Modal', afterVal: sDate + ' to ' + eDate + ' (' + pct + '%)' });
  saveState();
  renderAll();
  showToast('Saved task to Official WWP.', 'success');
}

function deleteOfficialTask(taskId) {
  if (state.authRole !== 'mcgough') return;
  const delT = getTaskById(taskId);
  if (delT) recordWwpChange('LIVE_MCGOUGH_EDIT', { org: delT.org, area: delT.area, taskDesc: delT.description, beforeVal: delT.startDate + ' to ' + delT.endDate, afterVal: 'Deleted from Official WWP' });
  state.officialTasks = state.officialTasks.filter(function(t) { return t.id !== taskId; });
  closeModal();
  saveState();
  renderAll();
  showToast('Removed task from Official WWP.', 'info');
}

// Share Scoped Login Links & Reference Codes Modal (McGough Only)
function getBaseDirUrl() {
  const raw = (window.location.href || 'https://kissmydilley.github.io/WWP-TFO-4/index.html').split('#')[0].split('?')[0];
  const slashIdx = raw.lastIndexOf('/');
  return slashIdx !== -1 ? raw.slice(0, slashIdx + 1) : raw + '/';
}

function openPortalForContractor(orgCode) {
  copyContractorPortalLink(orgCode);
}

function copyContractorPortalLink(orgCode) {
  const sc = getActiveScope();
  const pin = getContractorAccessCode(orgCode, sc);
  const url = getBaseDirUrl() + 'index.html';
  copyTextSafe(
    orgCode + ' Portal (' + sc.label + ') - Login URL: ' + url + ' | Access PIN: ' + pin,
    'Copied ' + orgCode + ' login link & PIN (' + pin + ')!'
  );
}

function openShareLinkModal() {
  if (state.authRole !== 'mcgough') return;
  const sc = getActiveScope();
  const url = getBaseDirUrl() + 'index.html';
  const tradeRows = state.organizations.filter(function(o) { return !o.isGC; }).map(function(o) {
    const code = getContractorAccessCode(o.code, sc);
    return '<div class="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2">' +
      '<div><strong class="text-slate-900">' + escapeHtml(o.code) + '</strong> <span class="text-slate-500">(' + escapeHtml(o.fullName) + ')</span></div>' +
      '<div class="flex items-center gap-2">' +
        '<code class="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-mono font-bold">' + escapeHtml(code) + '</code>' +
        '<button type="button" onclick="copyContractorPortalLink(\'' + escapeHtml(o.code) + '\')" class="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px]">Copy Invite</button>' +
      '</div>' +
    '</div>';
  }).join('');

  openModal(
    '<div class="p-5 bg-slate-50 max-h-[85vh] overflow-y-auto text-xs">' +
      '<h3 class="text-base font-bold text-slate-900">Portal Links &amp; Scoped PIN Directory (' + escapeHtml(sc.label) + ')</h3>' +
      '<p class="text-slate-600 mt-1">All users sign in at <strong>' + escapeHtml(url) + '</strong> using the project prefix <strong>' + escapeHtml(sc.prefix + '-') + '</strong> so each portal stays strictly separated.</p>' +

      '<div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">' +
        '<div class="p-3 rounded-xl bg-white border border-red-200">' +
          '<div class="font-bold text-red-800">McGough GC PIN</div>' +
          '<div class="text-base font-mono font-bold text-slate-900 mt-0.5">' + escapeHtml(getExpectedMcGoughPin(sc)) + '</div>' +
          '<div class="text-[11px] text-slate-500">Full WWP, Gate 1 MOPs &amp; Admin</div>' +
        '</div>' +
        '<div class="p-3 rounded-xl bg-white border border-indigo-200">' +
          '<div class="font-bold text-indigo-800">Applied Digital - Fac Ops</div>' +
          '<div class="text-base font-mono font-bold text-slate-900 mt-0.5">' + escapeHtml(getExpectedFacOpsPin(sc)) + '</div>' +
          '<div class="text-[11px] text-slate-500">MOP Gate 2 Approvals ONLY</div>' +
        '</div>' +
        '<div class="p-3 rounded-xl bg-white border border-sky-200">' +
          '<div class="font-bold text-sky-800">Applied Digital - Construction</div>' +
          '<div class="text-base font-mono font-bold text-slate-900 mt-0.5">' + escapeHtml(getExpectedConstPin(sc)) + '</div>' +
          '<div class="text-[11px] text-slate-500">Read-Only WWP + View-Only MOPs</div>' +
        '</div>' +
      '</div>' +

      '<div class="mt-4">' +
        '<div class="font-bold text-slate-800 mb-2">26 Contractor Scoped Access PINs (' + escapeHtml(sc.prefix) + '-XXX)</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-60 overflow-y-auto">' + tradeRows + '</div>' +
      '</div>' +

      '<div class="mt-5 pt-3 border-t border-slate-200 flex justify-end">' +
        '<button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold">Done</button>' +
      '</div>' +
    '</div>'
  );
}

// Manage Campuses/Scopes, Approver Rosters & PIN Suffixes (McGough Only)
function openApproversModal() {
  if (state.authRole !== 'mcgough') return;
  const activeScope = getActiveScope();

  const scopeRows = projectScopes.map(function(s) {
    return '<div class="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs">' +
      '<div><strong class="font-mono text-red-800">' + escapeHtml(s.prefix) + '-</strong> <span class="font-semibold text-slate-900">' + escapeHtml(s.label) + '</span></div>' +
      (s.scopeId === state.scopeId
        ? '<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Active</span>'
        : '<button type="button" onclick="closeModal(); handleMcGoughHeaderScopeSwitch(\'' + escapeHtml(s.scopeId) + '\')" class="px-2 py-0.5 rounded bg-slate-800 text-white font-semibold text-[10px]">Switch Here</button>') +
    '</div>';
  }).join('');

  const mcRows = state.approvers.map(function(a) {
    return '<div class="p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-xs bg-white">' +
      '<div><div class="font-bold text-slate-900">' + escapeHtml(a.name) + '</div><div class="text-[11px] text-slate-500">' + escapeHtml(a.role) + ' | ' + escapeHtml(a.scope) + '</div></div>' +
      (state.approvers.length > 1 ? '<button type="button" onclick="removeApprover(\'' + a.id + '\')" class="text-rose-600 font-semibold">Remove</button>' : '') +
    '</div>';
  }).join('');

  const fopRows = state.clientApprovers.map(function(c) {
    return '<div class="p-2 rounded-lg border border-indigo-200 flex items-center justify-between gap-2 text-xs bg-white">' +
      '<div><div class="font-bold text-indigo-950">' + escapeHtml(c.name) + ' (Fac Ops)</div><div class="text-[11px] text-slate-500">' + escapeHtml(c.email || 'Gate 2 Approver') + '</div></div>' +
      (state.clientApprovers.length > 1 ? '<button type="button" onclick="removeClientApprover(\'' + c.id + '\')" class="text-rose-600 font-semibold">Remove</button>' : '') +
    '</div>';
  }).join('');

  const conRows = state.clientConstReps.map(function(c) {
    return '<div class="p-2 rounded-lg border border-sky-200 flex items-center justify-between gap-2 text-xs bg-white">' +
      '<div><div class="font-bold text-sky-950">' + escapeHtml(c.name) + ' (Construction)</div><div class="text-[11px] text-slate-500">' + escapeHtml(c.email || 'View-Only Rep') + '</div></div>' +
      (state.clientConstReps.length > 1 ? '<button type="button" onclick="removeClientConstRep(\'' + c.id + '\')" class="text-rose-600 font-semibold">Remove</button>' : '') +
    '</div>';
  }).join('');

  openModal(
    '<div class="p-5 bg-slate-50 max-h-[88vh] overflow-y-auto text-xs">' +
      '<h3 class="text-base font-bold text-slate-900">Campuses, Project Scopes, Approvers &amp; PINs</h3>' +
      '<p class="text-slate-600 mt-0.5">Active Scope: <strong>' + escapeHtml(activeScope.label) + ' (' + escapeHtml(activeScope.prefix) + '-)</strong></p>' +

      // Section 1: Multi-Campus & Project Builder
      '<div class="mt-4 p-3.5 rounded-xl border border-slate-300 bg-slate-100">' +
        '<div class="font-bold uppercase tracking-wider text-slate-800 mb-2">1. Campuses &amp; Projects (Polaris Forge 1 / ELN03 / ELN04)</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">' + scopeRows + '</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-300">' +
          '<input id="new-scope-campus" type="text" value="Polaris Forge 1" placeholder="Campus (e.g. Polaris Forge 1)" class="px-2.5 py-1.5 rounded border border-slate-300 bg-white" />' +
          '<input id="new-scope-bldg" type="text" placeholder="Project (e.g. ELN05 or ELN05 - TFO)" class="px-2.5 py-1.5 rounded border border-slate-300 bg-white" />' +
          '<div class="flex gap-1.5">' +
            '<input id="new-scope-prefix" type="text" placeholder="Prefix (EL5T)" class="w-28 px-2 py-1.5 rounded border border-slate-300 bg-white font-mono uppercase" />' +
            '<button type="button" onclick="addNewProjectScope()" class="flex-1 px-2.5 py-1.5 rounded bg-slate-900 text-white font-semibold">+ Add Project</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // Section 2: Approver Rosters
      '<div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">' +
        '<div class="p-3 rounded-xl border border-slate-300 bg-slate-100 flex flex-col gap-2">' +
          '<div class="font-bold uppercase tracking-wider text-red-800">McGough Personnel</div>' +
          '<div class="flex flex-col gap-1.5 max-h-36 overflow-y-auto">' + mcRows + '</div>' +
          '<input id="new-app-name" type="text" placeholder="Name" class="px-2 py-1.5 rounded border border-slate-300 bg-white" />' +
          '<input id="new-app-role" type="text" placeholder="Role / Title" class="px-2 py-1.5 rounded border border-slate-300 bg-white" />' +
          '<input id="new-app-scope" type="text" placeholder="Area Scope" class="px-2 py-1.5 rounded border border-slate-300 bg-white" />' +
          '<button type="button" onclick="addMcGoughApprover()" class="py-1.5 rounded bg-emerald-700 text-white font-semibold">+ Add McGough</button>' +
        '</div>' +

        '<div class="p-3 rounded-xl border border-indigo-200 bg-indigo-50/60 flex flex-col gap-2">' +
          '<div class="font-bold uppercase tracking-wider text-indigo-900">AD Fac Ops (Gate 2)</div>' +
          '<div class="flex flex-col gap-1.5 max-h-36 overflow-y-auto">' + fopRows + '</div>' +
          '<input id="new-capp-name" type="text" placeholder="Fac Ops Rep Name" class="px-2 py-1.5 rounded border border-slate-300 bg-white" />' +
          '<input id="new-capp-email" type="email" placeholder="Email" class="px-2 py-1.5 rounded border border-slate-300 bg-white" />' +
          '<button type="button" onclick="addClientApprover()" class="py-1.5 rounded bg-indigo-600 text-white font-semibold">+ Add Fac Ops Rep</button>' +
        '</div>' +

        '<div class="p-3 rounded-xl border border-sky-200 bg-sky-50/60 flex flex-col gap-2">' +
          '<div class="font-bold uppercase tracking-wider text-sky-900">AD Construction (View)</div>' +
          '<div class="flex flex-col gap-1.5 max-h-36 overflow-y-auto">' + conRows + '</div>' +
          '<input id="new-con-name" type="text" placeholder="Construction Rep Name" class="px-2 py-1.5 rounded border border-slate-300 bg-white" />' +
          '<input id="new-con-email" type="email" placeholder="Email" class="px-2 py-1.5 rounded border border-slate-300 bg-white" />' +
          '<button type="button" onclick="addClientConstRep()" class="py-1.5 rounded bg-sky-700 text-white font-semibold">+ Add Const Rep</button>' +
        '</div>' +
      '</div>' +

      // Section 3: PIN Suffix Settings for Active Scope
      '<div class="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">' +
        '<div class="flex flex-wrap items-center gap-3">' +
          '<div><label class="font-semibold text-slate-700 mr-1">McGough (' + escapeHtml(activeScope.prefix) + '-):</label><input id="approver-pin-setting" type="text" value="' + escapeHtml(state.gcPasscodeSuffix) + '" class="w-16 px-2 py-1 rounded border border-slate-300 bg-white font-mono" /></div>' +
          '<div><label class="font-semibold text-indigo-900 mr-1">Fac Ops (' + escapeHtml(activeScope.prefix) + '-):</label><input id="client-pin-setting" type="text" value="' + escapeHtml(state.facOpsPasscodeSuffix) + '" class="w-16 px-2 py-1 rounded border border-slate-300 bg-white font-mono" /></div>' +
          '<div><label class="font-semibold text-sky-900 mr-1">AD Const (' + escapeHtml(activeScope.prefix) + '-):</label><input id="const-pin-setting" type="text" value="' + escapeHtml(state.constPasscodeSuffix) + '" class="w-16 px-2 py-1 rounded border border-slate-300 bg-white font-mono" /></div>' +
          '<button type="button" onclick="updateScopePinSuffixes()" class="px-3 py-1 rounded bg-slate-800 text-white font-semibold">Save PINs</button>' +
        '</div>' +
        '<button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold">Close</button>' +
      '</div>' +
    '</div>'
  );
}

function addNewProjectScope() {
  const campus = (document.getElementById('new-scope-campus').value || '').trim();
  const bldg = (document.getElementById('new-scope-bldg').value || '').trim();
  const prefRaw = (document.getElementById('new-scope-prefix').value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!campus || !bldg || prefRaw.length < 2) {
    showToast('Enter Campus, Project name, and a 2-6 character PIN prefix (e.g. EL5T).', 'error');
    return;
  }
  if (projectScopes.some(function(s) { return s.prefix.toUpperCase() === prefRaw; })) {
    showToast('Prefix ' + prefRaw + ' already exists. Pick a unique prefix.', 'error');
    return;
  }
  const newId = prefRaw.toLowerCase() + '-' + Date.now();
  const entry = {
    scopeId: newId,
    campus: campus,
    campusCode: prefRaw.slice(0, 2),
    building: bldg,
    buildingCode: bldg,
    scopeType: '',
    prefix: prefRaw,
    label: campus + ' - ' + bldg,
    hasBaselineSeed: false
  };
  projectScopes.push(entry);
  projectScopes = normalizeAndEnsureDualScopes(projectScopes);
  StorageAdapter.saveScopesRegistry(projectScopes);
  openApproversModal();
  renderAll();
  showToast('Created isolated project workspace: ' + entry.label + ' (' + prefRaw + '-)', 'success');
}

function addMcGoughApprover() {
  const name = document.getElementById('new-app-name').value.trim();
  const role = document.getElementById('new-app-role').value.trim() || 'McGough Approver';
  const scope = document.getElementById('new-app-scope').value.trim() || 'All Areas';
  if (!name) {
    showToast('Enter the McGough approver name.', 'error');
    return;
  }
  const newId = 'app-' + Date.now();
  state.approvers.push({ id: newId, name: name, role: role, scope: scope });
  state.activeApproverId = newId;
  saveState();
  renderAll();
  openApproversModal();
}

function removeApprover(appId) {
  if (state.approvers.length <= 1) return;
  state.approvers = state.approvers.filter(function(a) { return a.id !== appId; });
  if (state.activeApproverId === appId) state.activeApproverId = state.approvers[0].id;
  saveState();
  renderAll();
  openApproversModal();
}

function addClientApprover() {
  const name = document.getElementById('new-capp-name').value.trim();
  const email = document.getElementById('new-capp-email').value.trim();
  if (!name) {
    showToast('Enter the Applied Digital Fac Ops representative name.', 'error');
    return;
  }
  const newId = 'fop-' + Date.now();
  state.clientApprovers.push({ id: newId, name: name, role: 'Applied Digital Fac Ops', email: email });
  state.activeClientApproverId = newId;
  saveState();
  openApproversModal();
}

function removeClientApprover(cId) {
  if (state.clientApprovers.length <= 1) return;
  state.clientApprovers = state.clientApprovers.filter(function(c) { return c.id !== cId; });
  if (state.activeClientApproverId === cId) state.activeClientApproverId = state.clientApprovers[0].id;
  saveState();
  openApproversModal();
}

function addClientConstRep() {
  const name = document.getElementById('new-con-name').value.trim();
  const email = document.getElementById('new-con-email').value.trim();
  if (!name) {
    showToast('Enter the Applied Digital Construction representative name.', 'error');
    return;
  }
  const newId = 'con-' + Date.now();
  state.clientConstReps.push({ id: newId, name: name, role: 'Applied Digital Construction', email: email });
  state.activeClientConstId = newId;
  saveState();
  openApproversModal();
}

function removeClientConstRep(cId) {
  if (state.clientConstReps.length <= 1) return;
  state.clientConstReps = state.clientConstReps.filter(function(c) { return c.id !== cId; });
  if (state.activeClientConstId === cId) state.activeClientConstId = state.clientConstReps[0].id;
  saveState();
  openApproversModal();
}

function updateScopePinSuffixes() {
  const v1 = (document.getElementById('approver-pin-setting').value || '').trim();
  const v2 = (document.getElementById('client-pin-setting').value || '').trim();
  const v3 = (document.getElementById('const-pin-setting').value || '').trim();
  if (!v1 || !v2 || !v3) {
    showToast('PIN suffixes cannot be empty.', 'error');
    return;
  }
  state.gcPasscodeSuffix = v1;
  state.facOpsPasscodeSuffix = v2;
  state.constPasscodeSuffix = v3;
  saveState();
  showToast('Updated PINs for ' + getActiveScope().label + '!', 'success');
}

function openAddContractorModal() {
  if (state.authRole !== 'mcgough') return;
  openModal(
    '<div class="p-5">' +
      '<h3 class="text-base font-bold text-slate-900">Add Contractor to JOBDATA Roster</h3>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Short Code *</label><input id="nc-code" type="text" placeholder="e.g., Gephart" class="w-full px-3 py-2 rounded-lg border border-slate-300" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">3-Letter PIN Code *</label><input id="nc-pin" type="text" maxlength="4" placeholder="e.g., GEP" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono uppercase" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Full Company Name</label><input id="nc-full" type="text" placeholder="e.g., Gephart Electric" class="w-full px-3 py-2 rounded-lg border border-slate-300" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Default Foreman</label><input id="nc-foreman" type="text" placeholder="Optional lead name" class="w-full px-3 py-2 rounded-lg border border-slate-300" /></div>' +
        '<div><label class="block font-semibold text-slate-700 mb-1">Badge Color</label><input id="nc-color" type="color" value="#0284c7" class="w-full h-9 rounded-lg border border-slate-300 p-1" /></div>' +
      '</div>' +
      '<div class="mt-5 flex justify-end gap-2">' +
        '<button type="button" onclick="closeModal()" class="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700">Cancel</button>' +
        '<button type="button" onclick="saveNewContractor()" class="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold">Add Contractor</button>' +
      '</div>' +
    '</div>'
  );
}

function saveNewContractor() {
  const code = document.getElementById('nc-code').value.trim();
  const pinRaw = document.getElementById('nc-pin').value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!code || pinRaw.length < 2) {
    showToast('Enter a short contractor name and unique 3-letter PIN suffix.', 'error');
    return;
  }
  state.organizations.push({
    code: code,
    pinCode: pinRaw,
    fullName: document.getElementById('nc-full').value.trim() || code,
    defaultForeman: document.getElementById('nc-foreman').value.trim(),
    color: document.getElementById('nc-color').value || '#0284c7',
    isGC: false
  });
  closeModal();
  saveState();
  renderAll();
  showToast('Added ' + code + ' (PIN: ' + getActiveScope().prefix + '-' + pinRaw + ')!', 'success');
}

function openExportDataModal() {
  if (state.authRole !== 'mcgough') return;
  openModal(
    '<div class="p-5">' +
      '<h3 class="text-base font-bold text-slate-900">Export, Import &amp; Field Huddle Tools</h3>' +
      '<p class="text-xs text-slate-500 mt-1">Export the Official WWP to CSV, import a Trade Partner JSON update packet, print for huddles, or reset baseline data.</p>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">' +
        '<button type="button" onclick="exportOfficialCsv(); closeModal();" class="p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 text-left bg-slate-50 hover:bg-white transition">' +
          '<div class="font-bold text-slate-900">Export Official WWP (.csv)</div>' +
          '<div class="text-slate-500 mt-0.5">Spreadsheet export with WBS, Area, Organization, Foreman, Dates, %, PPC &amp; Prerequisites.</div>' +
        '</button>' +
        '<button type="button" onclick="closeModal(); printTabloidWwp();" class="p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 text-left bg-slate-50 hover:bg-white transition">' +
          '<div class="font-bold text-slate-900">Print 11x17 (Tabloid Landscape) WWP</div>' +
          '<div class="text-slate-500 mt-0.5">Formatted specifically for 11x17 (17in x 11in Ledger Landscape) jobsite trailer plotters & printers.</div>' +
        '</button>' +
        '<button type="button" onclick="triggerJsonImport()" class="p-3.5 rounded-xl border border-sky-200 hover:border-sky-400 text-left bg-sky-50/50 hover:bg-sky-50 transition">' +
          '<div class="font-bold text-sky-900">Import Trade Update Packet (.json)</div>' +
          '<div class="text-slate-600 mt-0.5">Load a submission file sent by a Trade Partner into the Approval Queue.</div>' +
        '</button>' +
        '<button type="button" onclick="resetFullAppDefault()" class="p-3.5 rounded-xl border border-rose-200 hover:border-rose-400 text-left bg-rose-50/40 hover:bg-rose-50 transition">' +
          '<div class="font-bold text-rose-900">Reset Active Scope to Baseline</div>' +
          '<div class="text-slate-600 mt-0.5">Restores initial baseline data for ' + escapeHtml(getActiveScope().label) + '.</div>' +
        '</button>' +
      '</div>' +
      '<div class="mt-5 flex justify-end">' +
        '<button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold">Close</button>' +
      '</div>' +
    '</div>'
  );
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
}

function exportOfficialCsv() {
  const headers = ['WBS', 'Area', 'Assignment Description', 'Organization', 'Responsible Person', 'Crew Size', 'Start Date', 'End Date', 'Percent Complete', 'Completed As Planned', 'Variance Category', 'Required Prerequisite'];
  const rows = [headers.join(',')];
  state.officialTasks.forEach(function(t) {
    const vals = [
      t.wbs, t.area, t.description, t.org, t.responsible, t.crew || '',
      t.startDate, t.endDate, t.percentComplete + '%',
      t.completedAsPlanned || '', t.varianceCategory || '', t.prerequisite || ''
    ].map(function(v) {
      return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    });
    rows.push(vals.join(','));
  });
  const sc = getActiveScope();
  const wkNum = computePlanningWeekNumber(state.lookaheadStart);
  downloadBlob(rows.join('\n'), sc.prefix + '_Official_WWP_Week_' + wkNum + '.csv', 'text/csv;charset=utf-8;');
  showToast('Downloaded Official WWP CSV!', 'success');
}

function exportStagedPacketJson() {
  if (state.portalStagedItems.length === 0) {
    showToast('Stage at least one task update before downloading a packet.', 'error');
    return;
  }
  const payload = {
    packetType: 'MCGOUGH_TRADE_SUBMISSION',
    scopeId: state.scopeId,
    exportedAt: new Date().toISOString(),
    organization: state.selectedTradeOrg,
    submissions: state.portalStagedItems
  };
  downloadBlob(JSON.stringify(payload, null, 2), getActiveScope().prefix + '_' + state.selectedTradeOrg + '_WWP_Submission.json', 'application/json');
  showToast('Downloaded ' + state.selectedTradeOrg + ' WWP Submission Packet (.json)!', 'success');
}

function triggerJsonImport() {
  closeModal();
  const inp = document.getElementById('json-import-input');
  if (inp) {
    inp.value = '';
    inp.click();
  }
}

function handleJsonFileImport(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && parsed.packetType === 'MCGOUGH_TRADE_SUBMISSION' && Array.isArray(parsed.submissions)) {
        parsed.submissions.forEach(function(item) {
          item.subId = 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
          state.pendingSubmissions.unshift(item);
        });
        state.portalMode = 'gc';
        state.gcTab = 'approvals';
        saveState();
        renderAll();
        showToast('Imported ' + parsed.submissions.length + ' update(s) into McGough Approval Queue!', 'success');
      } else {
        showToast('Invalid WWP submission packet format.', 'error');
      }
    } catch (err) {
      showToast('Could not parse JSON file.', 'error');
    }
  };
  reader.readAsText(file);
}

function resetFullAppDefault() {
  const sc = getActiveScope();
  StorageAdapter.removeScopeWorkspace(sc.scopeId);
  loadScopeIntoState(sc.scopeId, true);
  normalizeContractorGrouping();
  closeModal();
  saveState();
  renderAll();
  showToast('Restored baseline data for ' + sc.label + '.', 'info');
}

let pendingRemoteRender = false;

function isUserTypingInField() {
  const el = document.activeElement;
  if (!el || !el.tagName) return false;
  if (el.id && el.id.indexOf('cloud-cfg-') === 0) return true;
  const tag = el.tagName.toUpperCase();
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') {
    const t = String(el.type || 'text').toLowerCase();
    return ['text', 'number', 'date', 'time', 'email', 'tel', 'password', 'search', 'url'].indexOf(t) !== -1;
  }
  return false;
}

document.addEventListener('focusout', function() {
  if (pendingRemoteRender) {
    setTimeout(function() {
      if (!isUserTypingInField() && pendingRemoteRender) {
        pendingRemoteRender = false;
        renderAll();
      }
    }, 120);
  }
});

function handleRemoteRegistrySync(remoteScopes) {
  projectScopes = remoteScopes;
  populateLoginGateSelectors();
  if (state.authenticated) renderAll();
}

function handleRemoteWorkspaceSync(scopeId, remotePayload) {
  const activeTargetId = state.authenticated ? state.scopeId : loginSelectedScopeId;
  if (scopeId !== activeTargetId) return;

  const keepPortalMode = state.portalMode;
  const keepMopSubTab = state.mopSubTab;
  const keepMeetingMode = state.meetingMode;
  const keepGcTab = state.gcTab;

  loadScopeIntoState(scopeId, state.authenticated);
  if (state.authenticated) {
    state.portalMode = keepPortalMode;
    state.mopSubTab = keepMopSubTab;
    state.meetingMode = keepMeetingMode;
    if (keepGcTab) state.gcTab = keepGcTab;
  }

  if (isUserTypingInField()) {
    pendingRemoteRender = true;
  } else {
    if (!state.authenticated) populateLoginGateSelectors();
    renderAll();
  }
}

function buildSeedWorkspacePayload(scopeId) {
  const sc = getScopeById(scopeId);
  const fresh = createFreshScopeState(sc);
  delete fresh.authenticated;
  delete fresh.authRole;
  delete fresh.gcAuthenticated;
  delete fresh.clientAuthenticated;
  delete fresh.meetingMode;
  return fresh;
}

function updateCloudSyncBadges() {
  const st = StorageAdapter.status || 'local';
  const loginBtn = document.getElementById('login-cloud-sync-btn');
  const hdrWrap = document.getElementById('header-cloud-sync-wrap');

  let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotClass = 'bg-slate-400';
  let labelText = 'Cloud Sync: Local Mode';

  if (st === 'live') {
    badgeClass = 'bg-emerald-900 text-emerald-200 border-emerald-600';
    dotClass = 'bg-emerald-400';
    labelText = 'Cloud Live' + (StorageAdapter.lastSyncedAt ? ' (' + StorageAdapter.lastSyncedAt + ')' : '');
  } else if (st === 'connecting' || st === 'syncing') {
    badgeClass = 'bg-amber-900 text-amber-200 border-amber-600';
    dotClass = 'bg-amber-400';
    labelText = st === 'connecting' ? 'Connecting Firestore...' : 'Syncing...';
  } else if (st === 'error') {
    badgeClass = 'bg-rose-900 text-rose-200 border-rose-600';
    dotClass = 'bg-rose-400';
    labelText = 'Cloud Check Needed';
  }

  if (loginBtn) {
    loginBtn.className = 'px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ' + badgeClass;
    loginBtn.innerHTML = '<span class="w-2 h-2 rounded-full ' + dotClass + '"></span><span>' + escapeHtml(st === 'local' ? 'Cloud Sync: Setup Firebase' : labelText) + '</span>';
  }

  if (hdrWrap) {
    if (state.authRole === 'mcgough') {
      hdrWrap.innerHTML =
        '<button type="button" onclick="openCloudSyncModal()" class="px-2.5 py-1 rounded-md border text-[11px] font-semibold flex items-center gap-1.5 transition ' + badgeClass + '" title="' + escapeHtml(StorageAdapter.statusDetail) + '">' +
          '<span class="w-2 h-2 rounded-full ' + dotClass + '"></span>' +
          '<span>' + escapeHtml(st === 'local' ? 'Cloud Sync: Local (Setup)' : labelText) + '</span>' +
        '</button>';
    } else {
      hdrWrap.innerHTML =
        '<span class="px-2 py-0.5 rounded border text-[11px] font-semibold inline-flex items-center gap-1.5 ' + badgeClass + '">' +
          '<span class="w-2 h-2 rounded-full ' + dotClass + '"></span>' +
          '<span>' + escapeHtml(st === 'live' ? 'Cloud Synced' : 'Local Storage') + '</span>' +
        '</span>';
    }
  }
}

function getFirestoreRulesTemplate() {
  return [
    "rules_version = '2';",
    "service cloud.firestore {",
    "  match /databases/{database}/documents {",
    "    // Requires Firebase Anonymous Auth enabled (blocks unauthenticated bots)",
    "    match /portal_meta/{docId} {",
    "      allow read, write: if request.auth != null;",
    "    }",
    "    match /portal_workspaces/{scopeId} {",
    "      allow read, write: if request.auth != null;",
    "    }",
    "  }",
    "}"
  ].join('\n');
}

function openCloudSyncModal() {
  if (state.authenticated && state.authRole !== 'mcgough') return;
  const activeCfg = StorageAdapter.cloudConfig || StorageAdapter.resolveFirebaseConfig();
  const cfgPretty = activeCfg ? JSON.stringify(activeCfg, null, 2) : '';
  const st = StorageAdapter.status;
  const statusBannerCls = st === 'live'
    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
    : (st === 'error' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-slate-100 border-slate-300 text-slate-800');

  openModal(
    '<div class="p-5 bg-slate-50 max-h-[88vh] overflow-y-auto text-xs flex flex-col gap-3.5">' +
      '<div class="flex items-start justify-between gap-3 border-b border-slate-300 pb-2.5">' +
        '<div>' +
          '<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold uppercase tracking-wider text-[10px]">Zero-Server Live Multi-Device Database</span>' +
          '<h3 class="text-base font-bold text-slate-900 mt-1">Google Firebase Cloud Firestore Live Sync</h3>' +
          '<p class="text-slate-600 mt-0.5">Connect your free Firebase Spark project so WWP tasks, MOP sign-offs, P6 % Tracker updates, and PCOs sync live across every phone, tablet, and laptop.</p>' +
        '</div>' +
        '<button type="button" onclick="closeModal()" class="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-700">Close</button>' +
      '</div>' +

      '<div class="p-3 rounded-xl border ' + statusBannerCls + ' flex flex-wrap items-center justify-between gap-2">' +
        '<div>' +
          '<div class="font-bold">Current Driver: ' + escapeHtml(StorageAdapter.driver === 'firestore' ? 'Google Cloud Firestore (Real-Time)' : 'Browser localStorage (Single Device)') + '</div>' +
          '<div class="text-[11px] mt-0.5">' + escapeHtml(StorageAdapter.statusDetail) + (StorageAdapter.authUid ? ' | Anonymous Auth UID: ' + escapeHtml(StorageAdapter.authUid.slice(0, 10)) + '...' : '') + '</div>' +
        '</div>' +
        '<div class="flex items-center gap-1.5">' +
          (StorageAdapter.driver === 'firestore'
            ? '<button type="button" onclick="pushCurrentScopeToCloudManual()" class="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold">Push Local to Cloud</button>' +
              '<button type="button" onclick="pullCurrentScopeFromCloudManual()" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold">Pull Latest</button>'
            : '') +
        '</div>' +
      '</div>' +

      '<div class="bg-white p-3.5 rounded-xl border border-slate-300 flex flex-col gap-2">' +
        '<label for="cloud-cfg-input" class="font-bold text-slate-900">1. Paste Your Firebase Web App Config (JS snippet or JSON from Firebase Console)</label>' +
        '<textarea id="cloud-cfg-input" rows="7" placeholder="Paste const firebaseConfig = { apiKey: &quot;...&quot;, authDomain: &quot;...&quot;, projectId: &quot;...&quot;, ... }; here" class="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-[11px] bg-slate-50 text-slate-900">' + escapeHtml(cfgPretty) + '</textarea>' +
        '<div class="flex flex-wrap items-center justify-between gap-2 pt-1">' +
          '<div class="flex flex-wrap items-center gap-2">' +
            '<button type="button" onclick="saveAndConnectFirebaseModal()" class="px-3.5 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold shadow-sm">Connect &amp; Sync Live Now</button>' +
            '<button type="button" onclick="copyReadyStorageJsSnippet()" class="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold">Copy DEFAULT_FIREBASE_CONFIG for js/storage.js</button>' +
          '</div>' +
          (StorageAdapter.configSource === 'browser'
            ? '<button type="button" onclick="disconnectFirebaseBrowserOverride()" class="px-2.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold">Disconnect Browser Test Config</button>'
            : '') +
        '</div>' +
        '<p class="text-[11px] text-slate-500">Tip: Clicking <strong>Connect &amp; Sync Live Now</strong> connects this browser immediately. To make every foreman and Applied Digital rep connect automatically on GitHub Pages, click <strong>Copy DEFAULT_FIREBASE_CONFIG for js/storage.js</strong> and paste it at the top of <code>js/storage.js</code> in your GitHub repo.</p>' +
      '</div>' +

      '<div class="bg-white p-3.5 rounded-xl border border-slate-300 flex flex-col gap-2">' +
        '<div class="flex items-center justify-between gap-2">' +
          '<span class="font-bold text-slate-900">2. Firestore Security Rules (Paste in Firebase Console -&gt; Firestore Database -&gt; Rules)</span>' +
          '<button type="button" onclick="copyFirestoreRulesSnippet()" class="px-2.5 py-1 rounded bg-indigo-700 hover:bg-indigo-800 text-white font-semibold">Copy firestore.rules</button>' +
        '</div>' +
        '<pre class="p-2.5 rounded-lg bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto">' + escapeHtml(getFirestoreRulesTemplate()) + '</pre>' +
      '</div>' +
    '</div>'
  );
}

function saveAndConnectFirebaseModal() {
  const inp = document.getElementById('cloud-cfg-input');
  const parsed = parseFirebaseConfigText(inp ? inp.value : '');
  if (!parsed) {
    showToast('Could not find apiKey and projectId. Paste the full firebaseConfig block from Firebase Console.', 'error');
    return;
  }
  StorageAdapter.saveBrowserFirebaseConfig(parsed);
  StorageAdapter.configSource = 'browser';
  const targetScope = state.authenticated ? state.scopeId : loginSelectedScopeId;
  StorageAdapter.connectFirestore(parsed, targetScope);
  updateCloudSyncBadges();
  showToast('Connecting to Cloud Firestore project: ' + parsed.projectId + '...', 'success');
  setTimeout(function() {
    if (!document.getElementById('modal-backdrop').classList.contains('hidden')) {
      openCloudSyncModal();
    }
  }, 900);
}

function copyReadyStorageJsSnippet() {
  const inp = document.getElementById('cloud-cfg-input');
  const parsed = parseFirebaseConfigText(inp ? inp.value : '') || StorageAdapter.cloudConfig;
  if (!parsed) {
    showToast('Paste your firebaseConfig in box 1 first so we can format it for js/storage.js.', 'error');
    return;
  }
  const snippet = 'const DEFAULT_FIREBASE_CONFIG = ' + JSON.stringify({
    apiKey: parsed.apiKey || '',
    authDomain: parsed.authDomain || (parsed.projectId + '.firebaseapp.com'),
    projectId: parsed.projectId || '',
    storageBucket: parsed.storageBucket || '',
    messagingSenderId: parsed.messagingSenderId || '',
    appId: parsed.appId || ''
  }, null, 2) + ';';
  copyTextSafe(snippet, 'Copied DEFAULT_FIREBASE_CONFIG block for js/storage.js!');
}

function copyFirestoreRulesSnippet() {
  copyTextSafe(getFirestoreRulesTemplate(), 'Copied Firestore Security Rules!');
}

function pushCurrentScopeToCloudManual() {
  const targetScope = state.authenticated ? state.scopeId : loginSelectedScopeId;
  saveState();
  StorageAdapter.pushRegistryNow(projectScopes);
  const copy = Object.assign({}, state);
  delete copy.authenticated;
  delete copy.authRole;
  delete copy.gcAuthenticated;
  delete copy.clientAuthenticated;
  delete copy.meetingMode;
  StorageAdapter.pushScopeWorkspaceNow(targetScope, copy).then(function(ok) {
    if (ok) {
      showToast('Pushed ' + getActiveScope().label + ' workspace to Cloud Firestore!', 'success');
      openCloudSyncModal();
    }
  });
}

function pullCurrentScopeFromCloudManual() {
  const targetScope = state.authenticated ? state.scopeId : loginSelectedScopeId;
  StorageAdapter.pullScopeOnce(targetScope).then(function(ok) {
    if (ok) {
      showToast('Pulled latest Cloud Firestore snapshot!', 'success');
      openCloudSyncModal();
    } else {
      showToast('No existing cloud snapshot found yet; click Push Local to Cloud to initialize.', 'info');
    }
  });
}

function disconnectFirebaseBrowserOverride() {
  StorageAdapter.clearBrowserFirebaseConfig();
  updateCloudSyncBadges();
  openCloudSyncModal();
  showToast('Returned to Local Browser Storage mode.', 'info');
}

window.addEventListener('DOMContentLoaded', function() {
  restoreSessionOnBoot();
  populateLoginGateSelectors();
  if (typeof initMopFormDefaults === 'function' && document.getElementById('mop-workspace')) {
    initMopFormDefaults();
  }
  StorageAdapter.initCloudSync({
    initialScopeId: state.authenticated ? state.scopeId : loginSelectedScopeId,
    onRemoteRegistry: handleRemoteRegistrySync,
    onRemoteWorkspace: handleRemoteWorkspaceSync,
    onStatusChange: function() { updateCloudSyncBadges(); },
    onSeedRequired: buildSeedWorkspacePayload
  });
  updateCloudSyncBadges();
  renderAll();
});
