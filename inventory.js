const STORAGE_KEY = 'jes-auto-parts.inventory';
const seedParts = [
  {
    id: crypto.randomUUID(),
    title: 'Camry Radiator Support (Steel)',
    sku: 'TY-CAM-RADSPT-18',
    price: 249.99,
    condition: 'Used - Good',
    category: 'Body',
    make: 'Toyota',
    model: 'Camry',
    yearFrom: 2018,
    yearTo: 2022,
    notes: 'Pulled from low-mileage vehicle',
  },
  {
    id: crypto.randomUUID(),
    title: 'F-150 LED Headlamp — LH',
    sku: 'FD-F150-HDL-21',
    price: 499.0,
    condition: 'Used - Like New',
    category: 'Lighting',
    make: 'Ford',
    model: 'F-150',
    yearFrom: 2021,
    yearTo: 2024,
    notes: 'OEM take-off',
  },
  {
    id: crypto.randomUUID(),
    title: 'Civic Front Strut Assembly',
    sku: 'HN-CVC-STRUT-20',
    price: 189.5,
    condition: 'Refurbished',
    category: 'Suspension',
    make: 'Honda',
    model: 'Civic',
    yearFrom: 2020,
    yearTo: 2023,
    notes: 'Pair available — sold individually',
  },
  {
    id: crypto.randomUUID(),
    title: 'Silverado Weather Mats (Set)',
    sku: 'GM-SLV-MAT-24',
    price: 129.99,
    condition: 'New (Other)',
    category: 'Accessories',
    make: 'Chevrolet',
    model: 'Silverado 1500',
    yearFrom: 2022,
    yearTo: 2024,
    notes: 'Open-box dealership return',
  },
];

const state = {
  parts: [],
  vehicleFilter: null,
  query: '',
  sort: 'sku',
};

const els = {
  list: document.getElementById('invList'),
  empty: document.getElementById('invEmpty'),
  q: document.getElementById('q'),
  sort: document.getElementById('sort'),
  saveBtn: document.getElementById('saveBtn'),
  clearBtn: document.getElementById('clearBtn'),
  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  importFile: document.getElementById('importFile'),
  validationMsg: document.getElementById('validationMsg'),
  vehBanner: document.getElementById('vehBanner'),
  vehLabel: document.getElementById('vehLabel'),
  clearVeh: document.getElementById('clearVeh'),
};

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch (err) {
    console.warn('Failed to read inventory', err);
    return null;
  }
}

function writeStorage(parts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
}

function ensureSeedData() {
  if (!state.parts.length) {
    state.parts = seedParts;
    writeStorage(state.parts);
  }
}

function loadState() {
  const stored = readStorage();
  state.parts = stored && stored.length ? stored : [];
  ensureSeedData();
}

function parseVehicleFilter() {
  const params = new URLSearchParams(window.location.search);
  const year = params.get('year');
  const make = params.get('make');
  const model = params.get('model');
  if (year && make && model) {
    state.vehicleFilter = {
      year: Number(year),
      make,
      model,
    };
    els.vehBanner.hidden = false;
    els.vehLabel.textContent = `${year} ${make} ${model}`;
  } else {
    els.vehBanner.hidden = true;
    state.vehicleFilter = null;
  }
}

function clearVehicleFilter() {
  window.location.href = 'inventory.html';
}

function getFormValues() {
  return {
    title: document.getElementById('f_title').value.trim(),
    sku: document.getElementById('f_sku').value.trim(),
    price: document.getElementById('f_price').value.trim(),
    condition: document.getElementById('f_condition').value,
    category: document.getElementById('f_category').value,
    make: document.getElementById('f_make').value.trim(),
    model: document.getElementById('f_model').value.trim(),
    yearFrom: document.getElementById('f_yfrom').value.trim(),
    yearTo: document.getElementById('f_yto').value.trim(),
  };
}

function resetForm() {
  document.getElementById('f_title').value = '';
  document.getElementById('f_sku').value = '';
  document.getElementById('f_price').value = '';
  document.getElementById('f_condition').selectedIndex = 3;
  document.getElementById('f_category').selectedIndex = 0;
  document.getElementById('f_make').value = '';
  document.getElementById('f_model').value = '';
  document.getElementById('f_yfrom').value = '';
  document.getElementById('f_yto').value = '';
  els.validationMsg.textContent = '';
}

function validate(form) {
  if (!form.title || !form.sku || !form.price || !form.make || !form.model || !form.yearFrom) {
    return 'Fill in required fields (title, SKU, price, make, model, year from).';
  }
  const price = Number(form.price);
  if (Number.isNaN(price) || price <= 0) {
    return 'Enter a valid price.';
  }
  const yearFrom = Number(form.yearFrom);
  const yearTo = form.yearTo ? Number(form.yearTo) : undefined;
  if (Number.isNaN(yearFrom) || yearFrom < 1900) {
    return 'Enter a valid starting year.';
  }
  if (yearTo && (Number.isNaN(yearTo) || yearTo < yearFrom)) {
    return 'Year To must be greater than or equal to Year From.';
  }
  return null;
}

function savePart() {
  const form = getFormValues();
  const error = validate(form);
  if (error) {
    els.validationMsg.textContent = error;
    els.validationMsg.style.color = 'var(--danger)';
    return;
  }
  const part = {
    id: crypto.randomUUID(),
    title: form.title,
    sku: form.sku.toUpperCase(),
    price: Number(form.price),
    condition: form.condition,
    category: form.category,
    make: form.make,
    model: form.model,
    yearFrom: Number(form.yearFrom),
    yearTo: form.yearTo ? Number(form.yearTo) : null,
    createdAt: Date.now(),
  };
  state.parts = [...state.parts, part];
  writeStorage(state.parts);
  els.validationMsg.textContent = 'Saved!';
  els.validationMsg.style.color = 'var(--ok)';
  resetForm();
  render();
}

function deletePart(id) {
  if (!confirm('Remove this part from inventory?')) return;
  state.parts = state.parts.filter((part) => part.id !== id);
  writeStorage(state.parts);
  render();
}

function matchesVehicle(part) {
  if (!state.vehicleFilter) return true;
  const { year, make, model } = state.vehicleFilter;
  const fitsYear = year >= part.yearFrom && (!part.yearTo || year <= part.yearTo);
  return (
    fitsYear &&
    part.make.toLowerCase() === make.toLowerCase() &&
    part.model.toLowerCase() === model.toLowerCase()
  );
}

function matchesQuery(part) {
  if (!state.query) return true;
  const q = state.query.toLowerCase();
  return [part.title, part.sku, part.category, part.make, part.model]
    .some((field) => field && field.toLowerCase().includes(q));
}

function sortParts(parts) {
  const sorted = [...parts];
  const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
  if (state.sort === 'title') {
    sorted.sort((a, b) => collator.compare(a.title, b.title));
  } else {
    sorted.sort((a, b) => collator.compare(a.sku, b.sku));
  }
  return sorted;
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function render() {
  const filtered = state.parts.filter((part) => matchesVehicle(part) && matchesQuery(part));
  const parts = sortParts(filtered);
  els.list.innerHTML = '';
  if (!parts.length) {
    els.empty.hidden = false;
    return;
  }
  els.empty.hidden = true;
  const fragment = document.createDocumentFragment();
  parts.forEach((part) => {
    const item = document.createElement('article');
    item.className = 'part';
    item.innerHTML = `
      <div class="row" style="align-items:flex-start">
        <div>
          <strong>${part.title}</strong>
          <div class="muted mono">${part.sku}</div>
        </div>
        <span class="right">${formatPrice(part.price)}</span>
      </div>
      <div class="muted">${part.condition} • ${part.category}</div>
      <div>${part.make} ${part.model} • ${part.yearFrom}${part.yearTo ? '–' + part.yearTo : '+'}</div>
      <div class="row" style="justify-content: flex-end; gap:6px">
        <button class="btn danger" data-id="${part.id}">Delete</button>
      </div>
    `;
    fragment.appendChild(item);
  });
  els.list.appendChild(fragment);
}

function handleListClick(event) {
  const target = event.target;
  if (target.matches('button[data-id]')) {
    deletePart(target.getAttribute('data-id'));
  }
}

function handleExport() {
  const blob = new Blob([JSON.stringify(state.parts, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory.json';
  a.click();
  URL.revokeObjectURL(url);
}

function handleImport(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) throw new Error('Invalid file format');
      const valid = parsed.filter((part) => part && part.sku && part.title);
      if (!valid.length) throw new Error('No valid parts found');
      valid.forEach((part) => {
        part.id = part.id || crypto.randomUUID();
      });
      state.parts = valid;
      writeStorage(state.parts);
      render();
    } catch (err) {
      alert('Import failed: ' + err.message);
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

function init() {
  loadState();
  parseVehicleFilter();
  state.query = '';
  state.sort = els.sort.value;
  els.q.addEventListener('input', (ev) => {
    state.query = ev.target.value;
    render();
  });
  els.sort.addEventListener('change', (ev) => {
    state.sort = ev.target.value;
    render();
  });
  els.saveBtn.addEventListener('click', savePart);
  els.clearBtn.addEventListener('click', resetForm);
  els.list.addEventListener('click', handleListClick);
  els.exportBtn.addEventListener('click', handleExport);
  els.importBtn.addEventListener('click', () => els.importFile.click());
  els.importFile.addEventListener('change', handleImport);
  els.clearVeh.addEventListener('click', clearVehicleFilter);
  render();
}

init();
