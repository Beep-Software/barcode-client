# barcode-client

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
# Caldwell Inventory Management System

A frontend-only Vue 3 demo application for a fictional water-tower welding and fabrication company's parts department. The app demonstrates barcode scanning, inventory workflows, job-based issuing, transaction history, purchase orders, low-stock management, light/dark themes, and mock persistence without requiring a backend, database, or local API server.

## Tech Stack

- Vue 3 + TypeScript + Vite
- Vue Router
- `@zxing/browser` for camera barcode scanning
- `@lucide/vue` for interface icons
- JSON seed data + `localStorage` demo persistence

## Project Setup

```sh
npm install
npm run dev
```

Build and type-check:

```sh
npm run build
```

This project inherits Vite's current Node requirement: Node `20.19+` or `22.12+`.

## Application Architecture

The UI is intentionally separated from data access so the mock provider can later be replaced by an external Caldwell API provider.

```text
Vue views and components
  -> reactive application store
  -> provider/service contract
  -> mock inventory provider
  -> JSON seed data + localStorage
```

Important files:

- [src/types/inventory.ts](src/types/inventory.ts): domain models and request/filter types.
- [src/services/inventoryProvider.ts](src/services/inventoryProvider.ts): API-ready data-provider interface.
- [src/mock/mockInventoryProvider.ts](src/mock/mockInventoryProvider.ts): local demo implementation with validation and persistence.
- [src/stores/inventoryStore.ts](src/stores/inventoryStore.ts): shared reactive application state used by views.
- [src/mock/data/seed.json](src/mock/data/seed.json): initial demo dataset.
- [src/config/api.ts](src/config/api.ts): future API base URL configuration point.

Views do not fetch JSON directly and do not manipulate `localStorage`. Inventory mutations flow through the provider contract so future HTTP-backed repositories can implement the same interface.

## Mock Data

The seed dataset includes:

- 152 realistic inventory records across welding consumables, abrasives, fasteners, steel, pipe, PPE, coatings, rigging, tools, and shop supplies.
- Items with realistic numeric barcodes and intentional non-barcoded items.
- 8 warehouse/shop/field locations with bin identifiers.
- 8 vendors, 10 employees, and 14 water-tower jobs.
- 128 historical inventory transactions.
- 6 purchase orders with line items and totals.

The seed JSON is generated from [scripts/generate-seed-data.mjs](scripts/generate-seed-data.mjs). Regenerate it with:

```sh
node scripts/generate-seed-data.mjs
```

## Demo Persistence

On first load, the mock provider copies [src/mock/data/seed.json](src/mock/data/seed.json) into `localStorage` under `caldwell-inventory-demo-data-v1`.

These actions update the persisted mock state:

- Issue inventory to a job.
- Receive inventory into a location.
- Transfer inventory between locations.
- Adjust inventory with a reason.
- Create a low-stock purchase order.
- Switch the current demo employee.

Refreshing the browser preserves those changes. The Settings page includes **Reset Demo Data**, which clears the persisted demo state and restores the original JSON seed data after confirmation.

## Main Workflows

- Dashboard: live metrics, low-stock inventory, active jobs, recent transactions, and quick actions.
- Scan: USB/manual barcode input plus mobile camera scanning through ZXing.
- Inventory: searchable/filterable responsive catalog with barcoded and non-barcoded parts.
- Part Detail: issue, receive, transfer, adjust, and view part-specific history.
- Jobs: project list and issued-material detail.
- Transactions: searchable/filterable transaction history.
- Purchase Orders: list/detail views and mock low-stock PO creation.
- Settings: current employee, light/dark theme, and demo reset.

## Future API Integration

When a real Caldwell API is available, create an API-backed provider that implements `InventoryDataProvider` from [src/services/inventoryProvider.ts](src/services/inventoryProvider.ts). Then swap the provider used by [src/stores/inventoryStore.ts](src/stores/inventoryStore.ts).

`VITE_CALDWELL_API_BASE_URL` is exposed in [src/config/api.ts](src/config/api.ts) as the future base URL configuration point. The demo does not require this variable and does not start or host a backend.
