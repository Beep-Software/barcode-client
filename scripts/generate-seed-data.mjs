import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const today = new Date('2026-09-03T12:00:00.000Z');
const isoDaysAgo = (days) => new Date(today.getTime() - days * 86400000).toISOString();
const dateDaysAgo = (days) => isoDaysAgo(days).slice(0, 10);
const money = (value) => Number(value.toFixed(2));
const pad = (value, size = 3) => String(value).padStart(size, '0');

const locations = [
  { id: 'loc-main-a01', name: 'Main Warehouse', code: 'MW', bin: 'A-01-01', description: 'Primary small-parts aisle near receiving' },
  { id: 'loc-main-a02', name: 'Main Warehouse', code: 'MW', bin: 'A-02-03', description: 'Fastener and hardware overflow storage' },
  { id: 'loc-weld-w01', name: 'Welding Shop', code: 'WS', bin: 'W-01', description: 'Welding consumables cage' },
  { id: 'loc-fab-f01', name: 'Fabrication Shop', code: 'FS', bin: 'F-01', description: 'Plate, layout, and fit-up supplies' },
  { id: 'loc-yard-y01', name: 'Outdoor Yard', code: 'YD', bin: 'Y-01', description: 'Structural steel and pipe racks' },
  { id: 'loc-paint-p01', name: 'Paint Shop', code: 'PS', bin: 'P-01', description: 'Coatings, solvents, and masking supplies' },
  { id: 'loc-truck-t01', name: 'Field Truck Storage', code: 'FT', bin: 'T-01', description: 'Field-ready kits and mobile stock' },
  { id: 'loc-rig-r01', name: 'Rigging Loft', code: 'RL', bin: 'R-01', description: 'Slings, shackles, clamps, and lifting hardware' },
];

const vendors = [
  { id: 'ven-airgas', name: 'Airgas Welding Supply', contactName: 'Nora Patel', phone: '502-555-0182', email: 'orders@airgas-demo.example' },
  { id: 'ven-grainger', name: 'Grainger Industrial Supply', contactName: 'Sam Erickson', phone: '502-555-0134', email: 'caldwell@grainger-demo.example' },
  { id: 'ven-mcmaster', name: 'McMaster-Carr', contactName: 'Inside Sales', phone: '630-555-0190', email: 'support@mcmaster-demo.example' },
  { id: 'ven-fastenal', name: 'Fastenal Louisville', contactName: 'Maya Klein', phone: '502-555-0175', email: 'louisville@fastenal-demo.example' },
  { id: 'ven-steel', name: 'Ohio Valley Steel Service', contactName: 'Frank Dolan', phone: '812-555-0168', email: 'quotes@ovsteel-demo.example' },
  { id: 'ven-sherwin', name: 'Sherwin-Williams Protective Coatings', contactName: 'Elena Torres', phone: '502-555-0126', email: 'industrial@sherwin-demo.example' },
  { id: 'ven-msa', name: 'MSA Safety Distributor', contactName: 'Chris Bowman', phone: '502-555-0141', email: 'ppe@msa-demo.example' },
  { id: 'ven-victor', name: 'Victor Gas & Cutting Supply', contactName: 'Andre Hill', phone: '502-555-0198', email: 'service@victor-demo.example' },
];

const employees = [
  { id: 'emp-mjohnson', name: 'Mike Johnson', role: 'Parts Manager' },
  { id: 'emp-agarcia', name: 'Alyssa Garcia', role: 'Warehouse Employee' },
  { id: 'emp-dreed', name: 'Darren Reed', role: 'Welder' },
  { id: 'emp-lnguyen', name: 'Linh Nguyen', role: 'Fabricator' },
  { id: 'emp-cmiller', name: 'Carla Miller', role: 'Project Manager' },
  { id: 'emp-rthomas', name: 'Renee Thomas', role: 'Shop Manager' },
  { id: 'emp-bwatson', name: 'Ben Watson', role: 'Purchasing Manager' },
  { id: 'emp-jprice', name: 'Jordan Price', role: 'Field Superintendent' },
  { id: 'emp-kowens', name: 'Kayla Owens', role: 'Paint Lead' },
  { id: 'emp-smorris', name: 'Sean Morris', role: 'Rigging Foreman' },
];

const jobs = [
  ['WT-2026-0142', 'Louisville Municipal Water Tower', 'Louisville Water District', 'Louisville, KY', '100,000 gallon elevated tank shell repair and ladder replacement', 'Active', 'emp-cmiller'],
  ['WT-2026-0157', 'Jeffersonville Standpipe Rehabilitation', 'Jeffersonville Utilities', 'Jeffersonville, IN', 'Interior lining removal, weld repair, and coating renewal', 'Active', 'emp-cmiller'],
  ['WT-2026-0161', 'Bluegrass Industrial Tank Access Upgrade', 'Bluegrass Industrial Park', 'Shelbyville, KY', 'Roof handrail, hatch, and platform fabrication package', 'Planning', 'emp-jprice'],
  ['WT-2026-0164', 'Bardstown Elevated Tank Cathodic Retrofit', 'Bardstown Public Works', 'Bardstown, KY', 'Anode bracket fabrication and field installation support', 'Active', 'emp-cmiller'],
  ['WT-2026-0172', 'River Ridge Clearwell Pipe Modifications', 'River Ridge Authority', 'Charlestown, IN', 'Stainless pipe spool fabrication and flange installation', 'On Hold', 'emp-jprice'],
  ['WT-2026-0175', 'Oldham County Tank Roof Vent Replacement', 'Oldham County Water', 'La Grange, KY', 'Fabricate and install screened roof vents and safety davit mounts', 'Active', 'emp-cmiller'],
  ['WT-2026-0180', 'Frankfort Bowl Patch Program', 'Frankfort Utilities', 'Frankfort, KY', 'Shell plate patches, grinding, and weld inspection support', 'Active', 'emp-jprice'],
  ['WT-2026-0184', 'New Albany Tower Paint Prep', 'New Albany Water', 'New Albany, IN', 'Containment hardware, masking, and coating prep material staging', 'Planning', 'emp-cmiller'],
  ['WT-2026-0188', 'Lexington Booster Station Pipe Rack', 'Kentucky American Water', 'Lexington, KY', 'Structural pipe rack fabrication for booster station expansion', 'Active', 'emp-jprice'],
  ['WT-2026-0190', 'Clarksville Tank Fall Protection', 'Town of Clarksville', 'Clarksville, IN', 'Cable grab, ladder rung, and rest platform installation', 'Active', 'emp-cmiller'],
  ['WT-2025-0211', 'Madison Standpipe Closeout', 'Madison Utilities', 'Madison, IN', 'Punch-list hardware and final paint repairs', 'Completed', 'emp-jprice'],
  ['WT-2026-0194', 'Shepherdsville Welded Nozzle Repair', 'Shepherdsville Water', 'Shepherdsville, KY', 'Nozzle reinforcement pad fabrication and pressure testing support', 'Active', 'emp-cmiller'],
  ['WT-2026-0199', 'Georgetown Tank Mixing System Supports', 'Georgetown Municipal Water', 'Georgetown, KY', 'Mixer support brackets, penetrations, and stainless fasteners', 'Planning', 'emp-jprice'],
  ['WT-2026-0203', 'Corydon Elevated Tank Emergency Patch', 'Corydon Water', 'Corydon, IN', 'Emergency shell patch materials and field welding support', 'Active', 'emp-cmiller'],
].map((job, index) => ({
  id: `job-${pad(index + 1)}`,
  jobNumber: job[0],
  projectName: job[1],
  customer: job[2],
  location: job[3],
  description: job[4],
  status: job[5],
  startDate: dateDaysAgo(90 - index * 4),
  expectedCompletionDate: dateDaysAgo(-30 - index * 6),
  projectManagerId: job[6],
  notes: index % 3 === 0 ? 'Coordinate material staging before field crew mobilization.' : 'Track issued consumables against job usage report.',
}));

const specs = [
  ['WEL', 'Welding Consumables', 'Stick Electrodes', 'Lincoln Electric', 'ED030584', 'E7018 H4R low-hydrogen welding rods 1/8 in 50 lb can', 'LB', 4.2, 180, 55, 120, 'loc-weld-w01', 'ven-airgas'],
  ['WEL', 'Welding Consumables', 'Stick Electrodes', 'Hobart', '770465', 'E6010 fast-freeze welding rods 5/32 in 50 lb can', 'LB', 3.85, 120, 40, 100, 'loc-weld-w01', 'ven-airgas'],
  ['WEL', 'Welding Consumables', 'MIG Wire', 'Lincoln Electric', 'ED023334', 'ER70S-6 MIG wire .035 in spool', 'SPOOL', 88, 18, 6, 12, 'loc-weld-w01', 'ven-airgas'],
  ['WEL', 'Welding Consumables', 'Flux Core Wire', 'ESAB', '245012982', 'E71T-1 flux-cored welding wire .045 in 33 lb spool', 'SPOOL', 112, 14, 5, 10, 'loc-weld-w01', 'ven-airgas'],
  ['WEL', 'Welding Consumables', 'TIG Filler', 'Blue Demon', 'ER308L-116-10T', 'ER308L stainless TIG filler rod 1/16 in 10 lb tube', 'LB', 9.6, 44, 12, 30, 'loc-weld-w01', 'ven-airgas'],
  ['WEL', 'Welding Consumables', 'Tips & Nozzles', 'Bernard', 'T-035', 'Centerfire contact tips .035 in package of 10', 'BOX', 18.5, 32, 8, 20, 'loc-weld-w01', 'ven-airgas'],
  ['WEL', 'Welding Consumables', 'Tips & Nozzles', 'Tweco', 'WS24A-62', 'MIG nozzle 5/8 in slip-on copper', 'EA', 9.4, 28, 8, 24, 'loc-weld-w01', 'ven-victor'],
  ['ABR', 'Abrasives', 'Grinding Wheels', 'Norton', '66252843612', 'Grinding wheel 4-1/2 x 1/4 x 7/8 A24R', 'EA', 3.1, 160, 50, 100, 'loc-fab-f01', 'ven-grainger'],
  ['ABR', 'Abrasives', 'Flap Discs', 'Walter', '15L503', 'Flap disc 4-1/2 in 40 grit zirconia', 'EA', 5.7, 96, 30, 80, 'loc-fab-f01', 'ven-grainger'],
  ['ABR', 'Abrasives', 'Cutoff Wheels', 'Pferd', '61792', 'Cutoff wheel 6 x .045 x 7/8 steel', 'EA', 2.9, 140, 45, 120, 'loc-fab-f01', 'ven-grainger'],
  ['ABR', 'Abrasives', 'Wire Wheels', 'Weiler', '13131', 'Stringer bead wire wheel 4 in 5/8-11', 'EA', 12.8, 36, 10, 24, 'loc-fab-f01', 'ven-grainger'],
  ['FST', 'Fasteners', 'Grade 8 Bolts', 'Fastenal', '11114523', '1/2-13 x 2 in Grade 8 hex bolt zinc yellow', 'EA', 0.46, 420, 120, 300, 'loc-main-a01', 'ven-fastenal'],
  ['FST', 'Fasteners', 'Structural Bolts', 'LeJeune Bolt', 'A325-075-250', '3/4 x 2-1/2 in A325 structural bolt with nut', 'EA', 2.85, 180, 60, 160, 'loc-main-a02', 'ven-fastenal'],
  ['FST', 'Fasteners', 'Washers', 'Fastenal', '33822', '1/2 in hardened flat washer USS yellow zinc', 'EA', 0.12, 900, 250, 500, 'loc-main-a01', 'ven-fastenal'],
  ['FST', 'Fasteners', 'Anchor Bolts', 'Portland Bolt', 'AB-075-12-GALV', '3/4 x 12 in galvanized anchor bolt with nuts', 'EA', 8.5, 64, 16, 40, 'loc-yard-y01', 'ven-fastenal'],
  ['STL', 'Steel & Structural Materials', 'Plate', 'Ohio Valley Steel', 'PL-0250-A36', 'A36 steel plate 1/4 in x 48 in x 96 in', 'SHEET', 242, 12, 4, 8, 'loc-yard-y01', 'ven-steel'],
  ['STL', 'Steel & Structural Materials', 'Angle', 'Ohio Valley Steel', 'ANG-3X3X025', 'A36 angle iron 3 x 3 x 1/4 in 20 ft', 'FT', 6.8, 240, 80, 160, 'loc-yard-y01', 'ven-steel'],
  ['STL', 'Steel & Structural Materials', 'Flat Bar', 'Ohio Valley Steel', 'FB-2X025', 'A36 flat bar 2 in x 1/4 in 20 ft', 'FT', 3.25, 300, 100, 200, 'loc-yard-y01', 'ven-steel'],
  ['STL', 'Steel & Structural Materials', 'Tubing', 'Ohio Valley Steel', 'HSS-2X2X188', 'HSS square tubing 2 x 2 x 3/16 in', 'FT', 8.9, 160, 60, 120, 'loc-yard-y01', 'ven-steel'],
  ['PIP', 'Pipe & Fittings', 'Pipe', 'Wheatland Tube', 'SCH40-2-BLK', '2 in Schedule 40 black steel pipe', 'FT', 12.4, 180, 60, 120, 'loc-yard-y01', 'ven-steel'],
  ['PIP', 'Pipe & Fittings', 'Flanges', 'Smith-Cooper', '150FLG-3', '3 in 150 lb raised-face weld neck flange', 'EA', 48, 18, 6, 12, 'loc-main-a02', 'ven-mcmaster'],
  ['PIP', 'Pipe & Fittings', 'Elbows', 'Ward', '90EL-2-BLK', '2 in black malleable 90 degree elbow', 'EA', 13.5, 42, 12, 30, 'loc-main-a02', 'ven-mcmaster'],
  ['GSK', 'Gaskets & Seals', 'Gaskets', 'Garlock', '3000-3-150', '3 in 150 lb full-face compressed fiber gasket', 'EA', 7.6, 38, 12, 30, 'loc-main-a02', 'ven-mcmaster'],
  ['GSK', 'Gaskets & Seals', 'Sealants', 'Loctite', '565-483630', 'Thread sealant 565 PST 250 ml tube', 'EA', 28.5, 15, 6, 12, 'loc-main-a01', 'ven-grainger'],
  ['EQP', 'Welding Equipment', 'Torch Parts', 'Victor', '0387-0176', 'Cutting tip 1-101 size 1 acetylene', 'EA', 15.75, 22, 8, 18, 'loc-weld-w01', 'ven-victor'],
  ['GAS', 'Gas & Welding Supplies', 'Shielding Gas', 'Airgas', 'CYL-75-25-300', 'C25 shielding gas cylinder 300 cf', 'EA', 72, 10, 3, 8, 'loc-weld-w01', 'ven-airgas'],
  ['ELE', 'Electrical', 'Cord & Plugs', 'Hubbell', 'HBL5266C', 'Industrial straight-blade plug 15A 125V', 'EA', 11.2, 26, 8, 20, 'loc-main-a01', 'ven-grainger'],
  ['TLS', 'Hand Tools', 'Drill Bits', 'Norseman', '44170', 'Cobalt drill bit 1/2 in split point', 'EA', 14.35, 34, 10, 24, 'loc-main-a01', 'ven-grainger'],
  ['RIG', 'Rigging', 'Shackles', 'Crosby', 'G2130-075', '3/4 in galvanized screw pin anchor shackle', 'EA', 22.4, 30, 10, 20, 'loc-rig-r01', 'ven-grainger'],
  ['RIG', 'Rigging', 'Slings', 'Lift-All', 'EE2802NFX10', '2 in x 10 ft eye-and-eye nylon sling', 'EA', 31, 18, 6, 12, 'loc-rig-r01', 'ven-grainger'],
  ['PPE', 'PPE', 'Gloves', 'Tillman', '850L', 'Premium elk skin welding gloves large', 'PAIR', 18.9, 48, 15, 36, 'loc-truck-t01', 'ven-msa'],
  ['PPE', 'PPE', 'Eye Protection', '3M', 'SF401AF', 'Anti-fog clear safety glasses', 'EA', 5.25, 72, 24, 60, 'loc-truck-t01', 'ven-msa'],
  ['PPE', 'PPE', 'Respirators', '3M', '6502QL', 'Half-face respirator quick latch medium', 'EA', 34, 16, 6, 12, 'loc-truck-t01', 'ven-msa'],
  ['PNT', 'Paint & Coatings', 'Primer', 'Sherwin-Williams', 'B67A5', 'Macropoxy 646 fast cure epoxy primer gray', 'GAL', 64, 42, 12, 30, 'loc-paint-p01', 'ven-sherwin'],
  ['PNT', 'Paint & Coatings', 'Topcoat', 'Sherwin-Williams', 'B65W611', 'Acrolon 218 HS polyurethane safety white', 'GAL', 82, 36, 10, 24, 'loc-paint-p01', 'ven-sherwin'],
  ['SHP', 'General Shop Supplies', 'Markers', 'Markal', '96006', 'Valve-action paint marker yellow', 'EA', 3.9, 55, 20, 48, 'loc-main-a01', 'ven-grainger'],
  ['SHP', 'General Shop Supplies', 'Solvents', 'CRC', '05089', 'Brake and parts cleaner aerosol 19 oz', 'EA', 6.75, 44, 16, 36, 'loc-paint-p01', 'ven-grainger'],
  ['SHP', 'General Shop Supplies', 'Shop Towels', 'WypAll', '41055', 'Heavy-duty shop towels jumbo roll', 'ROLL', 19.6, 20, 8, 16, 'loc-main-a01', 'ven-grainger'],
];

const multipliers = [0.55, 0.82, 1, 1.35];
const suffixes = ['standard stock', 'field kit stock', 'bulk reserve', 'inspection hold'];
const inventory = [];
let sequence = 1;
for (const spec of specs) {
  for (let variant = 0; variant < 4; variant += 1) {
    const [prefix, category, subcategory, manufacturer, manufacturerPartNumber, description, unit, cost, quantity, minimumQuantity, reorderQuantity, locationId, vendorId] = spec;
    const id = `item-${pad(sequence)}`;
    const quantityValue = unit === 'LB' || unit === 'FT' || unit === 'GAL'
      ? Number((quantity * multipliers[variant]).toFixed(1))
      : Math.round(quantity * multipliers[variant]);
    const lowStockVariant = sequence % 13 === 0;
    const outOfStockVariant = sequence % 47 === 0;
    const finalQuantity = outOfStockVariant ? 0 : lowStockVariant ? Math.max(1, Math.round(minimumQuantity * 0.75)) : quantityValue;
    const hasBarcode = sequence % 5 !== 0;
    inventory.push({
      id,
      partNumber: `${prefix}-${pad(sequence, 5)}`,
      manufacturer,
      manufacturerPartNumber: `${manufacturerPartNumber}-${variant + 1}`,
      description: variant === 0 ? description : `${description} - ${suffixes[variant]}`,
      category,
      subcategory,
      barcode: hasBarcode ? `${String(852194700000 + sequence * 37).padStart(12, '0')}` : undefined,
      unit,
      quantity: finalQuantity,
      minimumQuantity: unit === 'LB' || unit === 'FT' || unit === 'GAL' ? Number((minimumQuantity * multipliers[Math.min(variant, 2)]).toFixed(1)) : Math.round(minimumQuantity * multipliers[Math.min(variant, 2)]),
      reorderQuantity: unit === 'LB' || unit === 'FT' || unit === 'GAL' ? Number((reorderQuantity * multipliers[Math.min(variant, 2)]).toFixed(1)) : Math.round(reorderQuantity * multipliers[Math.min(variant, 2)]),
      locationId: variant === 1 ? 'loc-truck-t01' : variant === 2 ? locationId : variant === 3 ? 'loc-main-a02' : locationId,
      vendorId,
      cost: money(cost * (1 + variant * 0.035)),
      status: sequence % 61 === 0 ? 'Inactive' : 'Active',
      notes: hasBarcode ? 'Barcode identifies the stocked part type.' : 'No barcode assigned; locate by part number, description, category, or bin.',
      createdAt: isoDaysAgo(180 - (sequence % 60)),
      updatedAt: isoDaysAgo(sequence % 21),
    });
    sequence += 1;
  }
}

const transactions = [];
const activeJobs = jobs.filter((job) => job.status === 'Active');
for (let index = 0; index < 128; index += 1) {
  const item = inventory[(index * 7) % inventory.length];
  const employee = employees[(index * 3) % employees.length];
  const job = activeJobs[index % activeJobs.length];
  const typeCycle = index % 10;
  const type = typeCycle < 4 ? 'ISSUE' : typeCycle < 7 ? 'RECEIVE' : typeCycle < 9 ? 'TRANSFER' : 'ADJUSTMENT';
  const baseQuantity = item.unit === 'EA' || item.unit === 'BOX' || item.unit === 'PAIR' || item.unit === 'SET' || item.unit === 'ROLL' || item.unit === 'SHEET' ? (index % 8) + 1 : Number((((index % 9) + 1) * 2.5).toFixed(1));
  transactions.push({
    id: `txn-${pad(index + 1)}`,
    type,
    itemId: item.id,
    quantity: type === 'ADJUSTMENT' && index % 2 === 0 ? -baseQuantity : baseQuantity,
    unit: item.unit,
    sourceLocationId: type === 'ISSUE' || type === 'TRANSFER' ? item.locationId : undefined,
    destinationLocationId: type === 'RECEIVE' ? item.locationId : type === 'TRANSFER' ? locations[(index + 2) % locations.length].id : undefined,
    jobId: type === 'ISSUE' ? job.id : undefined,
    employeeId: employee.id,
    timestamp: isoDaysAgo(index % 45),
    notes: type === 'ISSUE' ? `Issued to ${job.jobNumber} for field/fabrication use.` : type === 'RECEIVE' ? 'Received against demo replenishment workflow.' : type === 'TRANSFER' ? 'Moved stock to support upcoming work.' : 'Cycle count correction entered by parts department.',
    referenceNumber: type === 'RECEIVE' ? `RCV-${pad(index + 500)}` : type === 'ISSUE' ? job.jobNumber : type === 'TRANSFER' ? `XFER-${pad(index + 200)}` : `ADJ-${pad(index + 300)}`,
    reason: type === 'ADJUSTMENT' ? (index % 2 === 0 ? 'Counting error' : 'Found inventory') : undefined,
  });
}

const purchaseOrders = [
  { vendorId: 'ven-airgas', status: 'Ordered', notes: 'Monthly welding consumables replenishment.', itemIndexes: [0, 2, 3, 5] },
  { vendorId: 'ven-fastenal', status: 'Submitted', notes: 'Fastener restock for fall repair jobs.', itemIndexes: [44, 45, 48, 52] },
  { vendorId: 'ven-steel', status: 'Partially Received', notes: 'Structural stock for pipe rack and shell patch work.', itemIndexes: [60, 64, 68, 72] },
  { vendorId: 'ven-sherwin', status: 'Draft', notes: 'Paint shop reorder awaiting final quantities.', itemIndexes: [132, 136] },
  { vendorId: 'ven-grainger', status: 'Received', notes: 'Abrasives and shop supply blanket order.', itemIndexes: [28, 32, 36, 148] },
  { vendorId: 'ven-msa', status: 'Ordered', notes: 'PPE replenishment for field crews.', itemIndexes: [120, 124, 128] },
].map((po, index) => ({
  id: `po-${pad(index + 1)}`,
  poNumber: `PO-2026-${pad(index + 421)}`,
  vendorId: po.vendorId,
  date: dateDaysAgo(18 - index * 2),
  status: po.status,
  lineItems: po.itemIndexes.map((itemIndex, lineIndex) => {
    const item = inventory[itemIndex % inventory.length];
    return {
      id: `pol-${pad(index + 1)}-${lineIndex + 1}`,
      itemId: item.id,
      quantity: item.reorderQuantity,
      unitCost: item.cost,
    };
  }),
  notes: po.notes,
}));

const data = {
  inventory,
  locations,
  vendors,
  employees,
  jobs,
  transactions,
  purchaseOrders,
  currentUserId: 'emp-mjohnson',
};

const outputPath = resolve('src/mock/data/seed.json');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${inventory.length} inventory records, ${transactions.length} transactions, ${jobs.length} jobs to ${outputPath}`);
