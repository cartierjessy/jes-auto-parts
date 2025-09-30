const yearSelect = document.getElementById('year');
const makeSelect = document.getElementById('make');
const modelSelect = document.getElementById('model');
const searchBtn = document.getElementById('searchBtn');
const helperPill = document.querySelector('.pill');

const vehicles = [
  { year: 2024, make: 'Chevrolet', model: 'Silverado 1500' },
  { year: 2024, make: 'Ford', model: 'F-150' },
  { year: 2023, make: 'Toyota', model: 'Camry' },
  { year: 2023, make: 'Toyota', model: 'RAV4' },
  { year: 2023, make: 'Honda', model: 'Civic' },
  { year: 2022, make: 'Honda', model: 'Accord' },
  { year: 2022, make: 'Ford', model: 'Explorer' },
  { year: 2021, make: 'Nissan', model: 'Rogue' },
  { year: 2021, make: 'Subaru', model: 'Outback' },
  { year: 2020, make: 'Toyota', model: 'Corolla' },
  { year: 2020, make: 'Ford', model: 'Escape' },
  { year: 2020, make: 'Chevrolet', model: 'Equinox' },
  { year: 2019, make: 'Honda', model: 'CR-V' },
  { year: 2019, make: 'Jeep', model: 'Wrangler' },
  { year: 2018, make: 'Toyota', model: 'Highlander' },
];

const unique = (arr) => Array.from(new Set(arr));

function populateYears() {
  const years = unique(vehicles.map((v) => v.year)).sort((a, b) => b - a);
  yearSelect.innerHTML = '<option value="">Select</option>' +
    years.map((y) => `<option value="${y}">${y}</option>`).join('');
}

function populateMakes(year) {
  const makes = unique(
    vehicles.filter((v) => !year || v.year === Number(year)).map((v) => v.make)
  ).sort();
  makeSelect.innerHTML = '<option value="">Select</option>' +
    makes.map((m) => `<option value="${m}">${m}</option>`).join('');
  modelSelect.innerHTML = '<option value="">Select</option>';
}

function populateModels(year, make) {
  const models = unique(
    vehicles
      .filter((v) => (!year || v.year === Number(year)) && (!make || v.make === make))
      .map((v) => v.model)
  ).sort();
  modelSelect.innerHTML = '<option value="">Select</option>' +
    models.map((m) => `<option value="${m}">${m}</option>`).join('');
}

function updateState() {
  const year = yearSelect.value;
  const make = makeSelect.value;
  const model = modelSelect.value;
  const ready = Boolean(year && make && model);
  searchBtn.disabled = !ready;
  helperPill.textContent = ready
    ? `${year} ${make} ${model}`
    : 'Select year / make / model';
}

yearSelect.addEventListener('change', (ev) => {
  populateMakes(ev.target.value);
  updateState();
});

makeSelect.addEventListener('change', (ev) => {
  populateModels(yearSelect.value, ev.target.value);
  updateState();
});

modelSelect.addEventListener('change', updateState);

searchBtn.addEventListener('click', () => {
  if (searchBtn.disabled) return;
  const year = yearSelect.value;
  const make = makeSelect.value;
  const model = modelSelect.value;
  const url = new URL('inventory.html', window.location.href);
  url.searchParams.set('year', year);
  url.searchParams.set('make', make);
  url.searchParams.set('model', model);
  window.location.href = url.toString();
});

populateYears();
populateMakes('');
updateState();
