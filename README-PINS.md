# WWP-TFO-4 Multi-Campus Portal - Sprint 3 Complete Platform & Scoped PIN Directory

## 1. GitHub Pages File Layout (`kissmydilley/WWP-TFO-4`)
Upload all files and folders directly into the root of your repository:
- `index.html` (Full-Screen Campus / Building / Scope Login Gate - blank PINs, Enter-key submit)
- `mcgough.html` (McGough Command Center: Official WWP + P6 Overlay + Meeting Mode + 11x17 Print, P6 Schedule & % Tracker with CSV/XLSX Drag-Drop + Weekly Archive, Trade PCOs, Multi-Trade & Rev 2 MOPs, Change Log, Email/SMS/Teams Pings)
- `client-facops.html` (Applied Digital Fac Ops: MOP Gate 2 Approvals ONLY + Concerns & Questions Box; zero WWP or PCO tabs)
- `client-const.html` (Applied Digital Construction: View-Only MOPs with Viewed Receipt + Read-Only WWP; zero PCO tabs)
- `trade.html` (Trade Partner Portal: Scoped WWP with Type-Ahead P6 Task Picker + Reminder Banner, Read-Only P6 Schedule, Work Schedule / Off-Site Days, MOPs & Multi-Trade Sign-Off, Private PCO Submittals)
- `css/styles.css` (100% self-contained compiled CSS - zero external Tailwind CDN needed, includes `@page { size: 17in 11in; }` print rules)
- `js/storage.js`, `js/shared.js`, `js/notifications.js`, `js/p6.js`, `js/pco.js`, `js/wwp.js`, `js/mop.js`, `js/trade-portal.js`

## 2. Default Pre-Loaded Project Prefixes
- `EL4T-` : Polaris Forge 1 - ELN04 - TFO (Pre-loaded with 44 Week 11 tasks & 2 MOPs)
- `EL4B-` : Polaris Forge 1 - ELN04
- `EL3T-` : Polaris Forge 1 - ELN03 - TFO
- `EL3B-` : Polaris Forge 1 - ELN03
*(McGough can add new Campuses, Buildings, and Prefixes anytime under Campuses & Approvers.)*

## 3. Scoped PIN Reference (Replace `EL4T` with `EL4B`, `EL3T`, or `EL3B` for other scopes)
### Management & Client Portals
- **McGough Construction**: `EL4T-2026`
- **Applied Digital - Fac Ops (MOP Approvals ONLY)**: `EL4T-2027`
- **Applied Digital - Construction (Read-Only WWP + View-Only MOPs)**: `EL4T-2028`

### All 26 Contractor Scoped PINs (100% Unique 3-Letter Codes)
| Contractor | PIN (Bldg 4 TFO) | PIN (Bldg 4 Base Build) | Default Lead |
| :--- | :--- | :--- | :--- |
| HPC | `EL4T-HPC` | `EL4B-HPC` | Noel |
| ARCH Sales | `EL4T-ARS` | `EL4B-ARS` | - |
| Wells | `EL4T-WEL` | `EL4B-WEL` | - |
| Atkore | `EL4T-ATK` | `EL4B-ATK` | - |
| Matrix | `EL4T-MTX` | `EL4B-MTX` | - |
| Magnum | `EL4T-MAG` | `EL4B-MAG` | Paul |
| Steinbrecher | `EL4T-STE` | `EL4B-STE` | Broch |
| Magnum Controls | `EL4T-MGC` | `EL4B-MGC` | - |
| JCI | `EL4T-JCI` | `EL4B-JCI` | - |
| Nor-son | `EL4T-NOR` | `EL4B-NOR` | Neil |
| Webster | `EL4T-WEB` | `EL4B-WEB` | - |
| Superl | `EL4T-SUP` | `EL4B-SUP` | - |
| Viking | `EL4T-VIK` | `EL4B-VIK` | Bob D |
| ArchKey | `EL4T-AKY` | `EL4B-AKY` | - |
| Custom Drywall | `EL4T-CDW` | `EL4B-CDW` | Dan |
| McFarlane | `EL4T-MCF` | `EL4B-MCF` | - |
| Carciofini | `EL4T-CAR` | `EL4B-CAR` | - |
| Modern | `EL4T-MOD` | `EL4B-MOD` | AJ |
| Smartt Construction | `EL4T-SMT` | `EL4B-SMT` | - |
| Acoustics Associates | `EL4T-ACO` | `EL4B-ACO` | - |
| Architectural Arts | `EL4T-ART` | `EL4B-ART` | - |
| Divcon | `EL4T-DIV` | `EL4B-DIV` | - |
| MatrixNDI | `EL4T-MND` | `EL4B-MND` | - |
| LoenBro | `EL4T-LOE` | `EL4B-LOE` | Anthony Richison |
| WL Hall | `EL4T-WLH` | `EL4B-WLH` | Derek Torrey |
| Accelevation | `EL4T-ACC` | `EL4B-ACC` | Rosa |
