<template>
  <div class="app-shell">
    <aside class="sidebar" aria-label="Primary navigation">
      <RouterLink class="brand" to="/dashboard">
        <Factory :size="28" />
        <span>Caldwell IMS</span>
      </RouterLink>
      <nav>
        <RouterLink v-for="item in navigation" :key="item.to" :to="item.to">
          <component :is="item.icon" :size="19" />
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <div class="main-shell">
      <header class="topbar">
        <nav class="mobile-nav" aria-label="Mobile navigation">
          <RouterLink v-for="item in mobileNavigation" :key="item.to" :to="item.to" :aria-label="item.label">
            <component :is="item.icon" :size="20" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
        <div class="topbar-status">
          <span v-if="store.currentUser.value">{{ store.currentUser.value.name }} - {{ store.currentUser.value.role }}</span>
          <button class="icon-button" type="button" :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`" @click="toggleTheme">
            <Sun v-if="theme === 'dark'" :size="19" />
            <Moon v-else :size="19" />
          </button>
        </div>
      </header>

      <main>
        <div v-if="store.state.notice" class="toast success" role="status">
          <CircleCheck :size="18" /> {{ store.state.notice }}
          <button type="button" @click="store.clearMessages">Dismiss</button>
        </div>
        <div v-if="store.state.error" class="toast error" role="alert">
          <CircleAlert :size="18" /> {{ store.state.error }}
          <button type="button" @click="store.clearMessages">Dismiss</button>
        </div>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { markRaw, onMounted } from 'vue';
import { BriefcaseBusiness, CircleAlert, CircleCheck, ClipboardList, Factory, History, Moon, PackageSearch, ScanLine, Settings, Sun } from '@lucide/vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useThemeStore } from '@/stores/themeStore';

const store = useInventoryStore();
const { theme, applyTheme, toggleTheme } = useThemeStore();

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: markRaw(ClipboardList) },
  { to: '/scan', label: 'Scan', icon: markRaw(ScanLine) },
  { to: '/inventory', label: 'Inventory', icon: markRaw(PackageSearch) },
  { to: '/jobs', label: 'Jobs', icon: markRaw(BriefcaseBusiness) },
  { to: '/transactions', label: 'Transactions', icon: markRaw(History) },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: markRaw(Factory) },
  { to: '/settings', label: 'Settings', icon: markRaw(Settings) },
];

const mobileNavigation = navigation.filter((item) => ['Dashboard', 'Scan', 'Inventory', 'Jobs', 'Transactions'].includes(item.label));

onMounted(async () => {
  applyTheme();
  await store.load();
});
</script>

<style>
:root {
  font-family: Avenir Next, Avenir, Segoe UI, sans-serif;
  color: #172018;
  background: #eef1ec;
  --bg: #eef1ec;
  --panel: #fbfcf8;
  --panel-muted: #f2f4ef;
  --text: #172018;
  --muted: #647064;
  --line: #d8ddd2;
  --primary: #2e6f4e;
  --primary-strong: #17482f;
  --accent: #c57a20;
  --danger: #b33b2e;
  --warning: #a86513;
  --success: #257148;
  --info: #2f6675;
  --shadow: 0 18px 45px rgba(27, 38, 27, 0.12);
}

:root[data-theme='dark'] {
  color: #eef3ea;
  background: #121713;
  --bg: #121713;
  --panel: #1b221d;
  --panel-muted: #232c25;
  --text: #eef3ea;
  --muted: #aeb8ad;
  --line: #344036;
  --primary: #6bb58d;
  --primary-strong: #9bd0b2;
  --accent: #df9a3d;
  --danger: #ee8274;
  --warning: #e4a650;
  --success: #75c99c;
  --info: #7eb6c4;
  --shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
}

* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; background: radial-gradient(circle at top left, rgba(197, 122, 32, .12), transparent 28rem), var(--bg); color: var(--text); }
button, input, select, textarea { font: inherit; }
a { color: inherit; }

.app-shell { min-height: 100vh; display: grid; grid-template-columns: 260px minmax(0, 1fr); }
.sidebar { position: sticky; top: 0; height: 100vh; padding: 22px; background: #172018; color: #edf5ea; border-right: 1px solid rgba(255,255,255,.08); }
.brand { display: flex; align-items: center; gap: 12px; min-height: 52px; color: white; text-decoration: none; font-weight: 800; font-size: 1.1rem; }
.sidebar nav { display: grid; gap: 8px; margin-top: 28px; }
.sidebar a:not(.brand), .mobile-nav a { display: flex; align-items: center; gap: 10px; border-radius: 8px; padding: 12px; text-decoration: none; color: inherit; }
.sidebar a.router-link-active:not(.brand), .mobile-nav a.router-link-active { background: rgba(107,181,141,.18); color: #9bd0b2; }
.main-shell { min-width: 0; }
.topbar { position: sticky; top: 0; z-index: 10; min-height: 64px; display: flex; justify-content: flex-end; align-items: center; padding: 12px 28px; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(16px); border-bottom: 1px solid var(--line); }
.topbar-status { display: flex; align-items: center; gap: 14px; color: var(--muted); }
.mobile-nav { display: none; }
main { padding: 28px; }
.page-stack { display: grid; gap: 22px; }
.page-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }
.page-heading.compact { align-items: center; }
h1, h2, h3, p { margin-top: 0; }
h1 { font-size: clamp(2rem, 4vw, 3.6rem); line-height: 1; margin-bottom: 12px; }
h2 { font-size: 1.2rem; }
.eyebrow { color: var(--accent); text-transform: uppercase; letter-spacing: .08em; font-size: .78rem; font-weight: 800; margin-bottom: 8px; }
.muted, .page-heading p, .section-header span { color: var(--muted); }
.button, button.button, .text-link { min-height: 42px; border-radius: 8px; border: 1px solid var(--line); background: var(--panel); color: var(--text); display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 9px 14px; text-decoration: none; cursor: pointer; }
.button.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
:root[data-theme='dark'] .button.primary { color: #102016; }
.button.ghost { background: transparent; }
.button:disabled { opacity: .6; cursor: not-allowed; }
.danger-button { background: var(--danger); border-color: var(--danger); color: white; }
.icon-button { width: 40px; height: 40px; border-radius: 8px; border: 1px solid var(--line); background: var(--panel); color: var(--text); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.quick-actions, .button-row, .detail-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.panel, .metric-card, .job-card, .inventory-card { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; box-shadow: var(--shadow); }
.panel { padding: 20px; }
.metric-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; }
.metric-card { padding: 18px; display: grid; gap: 8px; }
.metric-card span { color: var(--muted); font-size: .9rem; }
.metric-card strong { font-size: 1.6rem; }
.metric-card.danger svg { color: var(--warning); }
.content-grid { display: grid; gap: 18px; }
.two-one { grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr); }
.halves { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.section-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.activity-list, .compact-table { display: grid; gap: 10px; }
.activity-row, .compact-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 12px; border-radius: 8px; background: var(--panel-muted); text-decoration: none; }
.activity-row p, .compact-row span, .inventory-card p { margin: 3px 0 0; color: var(--muted); }
.status-pill { display: inline-flex; align-items: center; width: fit-content; min-height: 26px; border-radius: 999px; padding: 4px 9px; font-size: .75rem; font-weight: 800; background: var(--panel-muted); color: var(--muted); }
.status-pill.success { color: var(--success); background: color-mix(in srgb, var(--success) 14%, transparent); }
.status-pill.warning { color: var(--warning); background: color-mix(in srgb, var(--warning) 15%, transparent); }
.status-pill.danger { color: var(--danger); background: color-mix(in srgb, var(--danger) 15%, transparent); }
.status-pill.info { color: var(--info); background: color-mix(in srgb, var(--info) 15%, transparent); }
.filter-panel { display: grid; grid-template-columns: repeat(4, minmax(160px, 1fr)); gap: 14px; }
label { display: grid; gap: 7px; color: var(--muted); font-weight: 700; }
input, select, textarea { width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; background: var(--panel); color: var(--text); }
input:focus, select:focus, textarea:focus, button:focus-visible, a:focus-visible { outline: 3px solid color-mix(in srgb, var(--primary) 45%, transparent); outline-offset: 2px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
.data-table th { color: var(--muted); font-size: .78rem; text-transform: uppercase; }
.data-table tr { cursor: pointer; }
.data-table td span { display: block; color: var(--muted); margin-top: 3px; }
.table-panel { overflow-x: auto; }
.mobile-card-list { display: none; }
.empty-state { min-height: 230px; display: grid; place-items: center; align-content: center; text-align: center; gap: 8px; color: var(--muted); }
.detail-hero { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; padding: 28px; border-radius: 8px; background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, var(--panel)), var(--panel)); border: 1px solid var(--line); }
.hero-meta { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; color: var(--muted); }
.detail-list { display: grid; gap: 13px; }
.detail-list div, .inventory-card dl div, .job-card dl div { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 10px; }
dt { color: var(--muted); font-weight: 800; }
dd { margin: 0; }
.stock-panel strong { display: block; font-size: 2.4rem; margin: 10px 0 2px; }
.dialog-backdrop { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 18px; background: rgba(8, 12, 9, .62); }
.dialog { width: min(720px, 100%); max-height: min(90vh, 860px); overflow: auto; background: var(--panel); color: var(--text); border: 1px solid var(--line); border-radius: 8px; padding: 22px; box-shadow: var(--shadow); }
.dialog-header { display: flex; justify-content: space-between; gap: 12px; }
.dialog-summary { display: flex; justify-content: space-between; gap: 12px; padding: 12px; margin: 10px 0 18px; background: var(--panel-muted); border-radius: 8px; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.span-all { grid-column: 1 / -1; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
.form-error { color: var(--danger); font-weight: 700; }
.toast { position: fixed; right: 22px; bottom: 22px; z-index: 80; display: flex; align-items: center; gap: 10px; max-width: min(440px, calc(100vw - 44px)); padding: 14px; border-radius: 8px; background: var(--panel); border: 1px solid var(--line); box-shadow: var(--shadow); }
.toast.success svg { color: var(--success); }
.toast.error svg { color: var(--danger); }
.toast button { margin-left: auto; border: none; background: transparent; color: var(--muted); cursor: pointer; }
.scan-form { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: end; }
.scan-form label { grid-column: 1 / -1; }
.scanner-video { width: 100%; min-height: 260px; margin-top: 12px; background: #050705; border-radius: 8px; object-fit: cover; }
.resolved-card dl, .inventory-card dl, .job-card dl { display: grid; gap: 10px; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.job-card, .inventory-card { display: grid; gap: 12px; padding: 18px; text-decoration: none; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1100px) {
  .app-shell { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .topbar { justify-content: space-between; padding: 8px 12px; }
  .mobile-nav { display: flex; gap: 4px; overflow-x: auto; }
  .mobile-nav a { min-width: 70px; justify-content: center; flex-direction: column; font-size: .72rem; padding: 8px; }
  main { padding: 18px; padding-bottom: 84px; }
  .metric-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .two-one, .halves { grid-template-columns: 1fr; }
}

@media (max-width: 760px) {
  h1 { font-size: 2.1rem; }
  .page-heading, .detail-hero { align-items: stretch; flex-direction: column; }
  .metric-grid, .filter-panel, .form-grid { grid-template-columns: 1fr; }
  .data-table.inventory-table { display: none; }
  .mobile-card-list { display: grid; gap: 12px; }
  .activity-row, .compact-row { grid-template-columns: 1fr; }
  .detail-list div, .inventory-card dl div, .job-card dl div { grid-template-columns: 1fr; }
  .scan-form { grid-template-columns: 1fr; }
  .dialog-summary { flex-direction: column; }
}
</style>