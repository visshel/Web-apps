/* ---------------------------
   PAGE NAVIGATION
--------------------------- */
const pages = document.querySelectorAll('.page');
const routeLinks = document.querySelectorAll('[data-route]');
const mainNav = document.getElementById('mainNav');
const mobileToggle = document.getElementById('mobileToggle');

function openPage(pageName) {
  const allowedPages = ['home', 'calculator', 'timing', 'strategy', 'cars', 'car-detail'];

  if (!allowedPages.includes(pageName)) {
    pageName = 'home';
  }

  pages.forEach(function(page) {
    page.classList.toggle('active', page.dataset.page === pageName);
  });

  document.querySelectorAll('.main-nav [data-route], .tool-strip [data-route]').forEach(function(link) {
    link.classList.toggle('active', link.dataset.route === pageName);
  });

  mainNav.classList.remove('open');
  window.scrollTo(0, 0);
}

function routeFromHash() {
  const pageName = location.hash.replace('#/', '') || 'home';
  openPage(pageName);
}

routeLinks.forEach(function(element) {
  if (element.tagName === 'BUTTON' || element.classList.contains('route-card')) {
    element.addEventListener('click', function() {
      location.hash = '#/' + element.dataset.route;
    });
  }
});

mobileToggle.onclick = function() {
  mainNav.classList.toggle('open');
};

document.getElementById('homeHeaderButton').onclick = function() {
  location.hash = '#/home';
};

window.addEventListener('hashchange', routeFromHash);
routeFromHash();


/* ---------------------------
   LAB 3: MOCK COLLECTION + DETAIL VIEW
   Данные приходят из локального mock API Node-сервера.
--------------------------- */
const carGrid = document.getElementById('carGrid');
const carSearch = document.getElementById('carSearch');
const carTeamFilter = document.getElementById('carTeamFilter');
const carCount = document.getElementById('carCount');
const collectionStatus = document.getElementById('collectionStatus');
const carDetailContent = document.getElementById('carDetailContent');
const mockFallbackCars = [
  {id:1, name:'Mercedes-AMG F1 W15', season:2024, number:'44', driver:'Lewis Hamilton', team:'Mercedes-AMG PETRONAS', engine:'Mercedes-AMG F1 M15 E Performance', description:'Болид сезона 2024 года, созданный для борьбы за позиции в чемпионате. Карточка использует демонстрационные данные для учебной коллекции.', color:'PETRONAS Black / Teal', status:'Архив'},
  {id:2, name:'Mercedes-AMG F1 W14', season:2023, number:'63', driver:'George Russell', team:'Mercedes-AMG PETRONAS', engine:'Mercedes-AMG F1 M14 E Performance', description:'Модель сезона 2023 года. В подробной карточке собраны основные mock-поля: сезон, пилот, команда и силовая установка.', color:'Black / PETRONAS Teal', status:'Архив'},
  {id:3, name:'Mercedes-AMG F1 W13', season:2022, number:'44', driver:'Lewis Hamilton', team:'Mercedes-AMG PETRONAS', engine:'Mercedes-AMG F1 M13 E Performance', description:'Болид сезона 2022 года. Запись нужна для демонстрации фильтрации и навигации к отдельной странице объекта.', color:'Silver / Black', status:'Архив'},
  {id:4, name:'Mercedes-AMG F1 W15 · #63', season:2024, number:'63', driver:'George Russell', team:'Mercedes-AMG PETRONAS', engine:'Mercedes-AMG F1 M15 E Performance', description:'Вариант карточки W15 с данными второго пилота команды. Все значения являются частью локального набора mock-объектов.', color:'PETRONAS Black / Teal', status:'Коллекция'}
];
let cars = [];
let nextCarId = 100;
let selectedCarId = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function(char) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]);
  });
}

async function loadCars() {
  try {
    const response = await fetch('/api/cars');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    cars = Array.isArray(data) ? data : mockFallbackCars.slice();
    collectionStatus.textContent = 'Источник данных: GET /api/cars · mock collection';
  } catch (error) {
    cars = mockFallbackCars.slice();
    collectionStatus.textContent = 'Mock API недоступен — используется резервная коллекция в браузере.';
  }
  nextCarId = Math.max(100, ...cars.map(function(car) { return Number(car.id) || 0; })) + 1;
  renderCars();
}

function getFilteredCars() {
  const query = carSearch.value.trim().toLowerCase();
  const season = carTeamFilter.value;
  return cars.filter(function(car) {
    const matchesText = !query || [car.name, car.driver, car.team].join(' ').toLowerCase().includes(query);
    const matchesSeason = season === 'all' || String(car.season) === season;
    return matchesText && matchesSeason;
  });
}

function renderCars() {
  const filtered = getFilteredCars();
  carCount.textContent = 'Показано: ' + filtered.length + ' / ' + cars.length;
  carGrid.innerHTML = '';

  if (!filtered.length) {
    carGrid.innerHTML = '<div class="empty-collection">По заданным параметрам ничего не найдено. Измените фильтр или поисковый запрос.</div>';
    return;
  }

  filtered.forEach(function(car) {
    const card = document.createElement('article');
    card.className = 'car-card';
    card.innerHTML = `
      <div class="car-card-top">
        <div class="car-number">${escapeHtml(car.number || '—')}</div>
        <span class="car-badge">${escapeHtml(car.season)} · ${escapeHtml(car.status || 'Mock')}</span>
      </div>
      <div class="car-card-body">
        <h3>${escapeHtml(car.name)}</h3>
        <p>${escapeHtml(car.description)}</p>
        <div class="car-specs">
          <div class="car-spec"><span>Пилот</span><strong>${escapeHtml(car.driver)}</strong></div>
          <div class="car-spec"><span>Сезон</span><strong>${escapeHtml(car.season)}</strong></div>
        </div>
        <div class="car-card-actions">
          <button class="lab-btn" type="button" data-car-details="${car.id}">Подробнее ↗</button>
          <button class="lab-btn danger" type="button" data-car-delete="${car.id}">Удалить</button>
        </div>
      </div>`;
    carGrid.appendChild(card);
  });
}

function showCarDetails(carId) {
  const car = cars.find(function(item) { return Number(item.id) === Number(carId); });
  if (!car) return;
  selectedCarId = car.id;
  carDetailContent.innerHTML = `
    <div class="detail-visual">
      <span class="eyebrow">Mercedes-AMG PETRONAS · ${escapeHtml(car.season)}</span>
      <div class="car-number">${escapeHtml(car.number || '—')}</div>
      <span class="car-badge">${escapeHtml(car.status || 'Mock object')}</span>
    </div>
    <div class="detail-content">
      <span class="eyebrow">Карточка объекта #${escapeHtml(car.id)}</span>
      <h2>${escapeHtml(car.name)}</h2>
      <p>${escapeHtml(car.description)}</p>
      <div class="detail-specs">
        <div class="car-spec"><span>Пилот</span><strong>${escapeHtml(car.driver)}</strong></div>
        <div class="car-spec"><span>Сезон</span><strong>${escapeHtml(car.season)}</strong></div>
        <div class="car-spec"><span>Команда</span><strong>${escapeHtml(car.team)}</strong></div>
        <div class="car-spec"><span>Силовая установка</span><strong>${escapeHtml(car.engine)}</strong></div>
        <div class="car-spec"><span>Оформление</span><strong>${escapeHtml(car.color || 'PETRONAS')}</strong></div>
        <div class="car-spec"><span>Источник</span><strong>Mock object</strong></div>
      </div>
      <div class="detail-actions">
        <button class="lab-btn secondary" id="detailBackButton" type="button">← К списку</button>
        <button class="lab-btn danger" id="detailDeleteButton" type="button">Удалить карточку</button>
      </div>
    </div>`;
  location.hash = '#/car-detail';
}

function deleteCar(carId) {
  const car = cars.find(function(item) { return Number(item.id) === Number(carId); });
  if (!car) return;
  cars = cars.filter(function(item) { return Number(item.id) !== Number(carId); });
  collectionStatus.textContent = 'Карточка «' + car.name + '» удалена из текущей коллекции.';
  if (Number(selectedCarId) === Number(carId)) {
    selectedCarId = null;
    location.hash = '#/cars';
  }
  renderCars();
}

function addCarCopy() {
  if (!cars.length) {
    collectionStatus.textContent = 'Коллекция пуста: нечего копировать.';
    return;
  }
  const copy = {...cars[0], id: nextCarId++, name: cars[0].name + ' · КОПИЯ', status:'Добавлено'};
  cars.unshift(copy);
  carSearch.value = '';
  carTeamFilter.value = 'all';
  collectionStatus.textContent = 'Создана копия первой карточки. ID новой записи: ' + copy.id + '.';
  renderCars();
}

carSearch.addEventListener('input', renderCars);
carTeamFilter.addEventListener('change', renderCars);
document.getElementById('addCarButton').addEventListener('click', addCarCopy);
document.getElementById('backToCarsButton').addEventListener('click', function() {
  location.hash = '#/cars';
});
carGrid.addEventListener('click', function(event) {
  const detailsButton = event.target.closest('[data-car-details]');
  const deleteButton = event.target.closest('[data-car-delete]');
  if (detailsButton) showCarDetails(Number(detailsButton.dataset.carDetails));
  if (deleteButton) deleteCar(Number(deleteButton.dataset.carDelete));
});
carDetailContent.addEventListener('click', function(event) {
  if (event.target.closest('#detailBackButton')) location.hash = '#/cars';
  if (event.target.closest('#detailDeleteButton') && selectedCarId !== null) deleteCar(selectedCarId);
});

loadCars();


/* ---------------------------
   CALCULATOR
--------------------------- */
const calcDisplay = document.getElementById('calcDisplay');
const calcExpression = document.getElementById('calcExpression');
const calcStatus = document.getElementById('calcStatus');
const historyList = document.getElementById('historyList');

let displayValue = '0';
let firstValue = null;
let selectedOperation = null;
let waitingForSecond = false;
let calculationHistory = [];

function formatNumber(value) {
  if (!Number.isFinite(value)) return 'Ошибка';

  const rounded = Math.round((value + Number.EPSILON) * 100000000) / 100000000;
  return String(rounded);
}

function operationLabel(operation) {
  if (operation === '*') return '×';
  if (operation === '/') return '÷';
  if (operation === 'avg') return 'V AVG';
  return operation;
}

function renderCalculator() {
  calcDisplay.textContent = displayValue;
}

function inputDigit(digit) {
  if (waitingForSecond) {
    displayValue = digit;
    waitingForSecond = false;
  } else if (displayValue === '0') {
    displayValue = digit;
  } else if (displayValue.length < 16) {
    displayValue += digit;
  }

  calcStatus.textContent = 'Ввод';
  renderCalculator();
}

function inputDecimal() {
  if (waitingForSecond) {
    displayValue = '0.';
    waitingForSecond = false;
  } else if (!displayValue.includes('.')) {
    displayValue += '.';
  }

  renderCalculator();
}

function chooseOperation(operation) {
  firstValue = Number(displayValue);
  selectedOperation = operation;
  waitingForSecond = true;
  calcExpression.textContent = formatNumber(firstValue) + ' ' + operationLabel(operation);
  calcStatus.textContent = operation === 'avg' ? 'Дистанция → время' : 'Операция выбрана';
}

function calculateValues(a, b, operation) {
  switch (operation) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? null : a / b;
    case 'avg':
      return b === 0 ? null : a / b * 3600;
    default:
      return null;
  }
}

function addHistory(text) {
  calculationHistory.unshift(text);
  calculationHistory = calculationHistory.slice(0, 6);

  historyList.innerHTML = '';

  calculationHistory.forEach(function(item) {
    const row = document.createElement('div');
    row.className = 'history-row';
    row.textContent = item;
    historyList.appendChild(row);
  });
}

function handleEquals() {
  if (selectedOperation === null || firstValue === null || waitingForSecond) return;

  const secondValue = Number(displayValue);
  const result = calculateValues(firstValue, secondValue, selectedOperation);

  if (result === null || !Number.isFinite(result)) {
    calcStatus.textContent = 'Ошибка';
    calcDisplay.textContent = 'Ошибка';
    return;
  }

  const operationText = operationLabel(selectedOperation);
  const resultText = formatNumber(result);
  const expressionText = formatNumber(firstValue) + ' ' + operationText + ' ' + formatNumber(secondValue) + ' =';

  calcExpression.textContent = expressionText;
  displayValue = resultText;

  if (selectedOperation === 'avg') {
    addHistory(expressionText + ' ' + resultText + ' км/ч');
    calcStatus.textContent = 'км/ч';
  } else {
    addHistory(expressionText + ' ' + resultText);
    calcStatus.textContent = 'Результат';
  }

  firstValue = null;
  selectedOperation = null;
  waitingForSecond = false;
  renderCalculator();
}

function handleClear() {
  displayValue = '0';
  firstValue = null;
  selectedOperation = null;
  waitingForSecond = false;
  calcExpression.innerHTML = '&nbsp;';
  calcStatus.textContent = 'Готов';
  renderCalculator();
}

function handleBackspace() {
  if (waitingForSecond) return;

  if (displayValue.length > 1) {
    displayValue = displayValue.slice(0, -1);
  } else {
    displayValue = '0';
  }

  renderCalculator();
}

function toggleSign() {
  const value = Number(displayValue);

  if (value !== 0) {
    displayValue = formatNumber(value * -1);
    renderCalculator();
  }
}

function makePercent() {
  displayValue = formatNumber(Number(displayValue) / 100);
  calcStatus.textContent = 'Процент';
  renderCalculator();
}

document.querySelectorAll('.digit').forEach(function(button) {
  button.onclick = function() {
    inputDigit(button.dataset.digit);
  };
});

document.querySelectorAll('[data-operation]').forEach(function(button) {
  button.onclick = function() {
    chooseOperation(button.dataset.operation);
  };
});

document.getElementById('decimalBtn').onclick = inputDecimal;
document.getElementById('equalsBtn').onclick = handleEquals;
document.getElementById('clearBtn').onclick = handleClear;
document.getElementById('deleteBtn').onclick = handleBackspace;
document.getElementById('signBtn').onclick = toggleSign;
document.getElementById('percentBtn').onclick = makePercent;
document.getElementById('avgSpeedBtn').onclick = function() {
  chooseOperation('avg');
};

function flashKeyboardButton(button) {
  if (!button) return;

  button.classList.add('keyboard-active');

  setTimeout(function() {
    button.classList.remove('keyboard-active');
  }, 110);
}

document.addEventListener('keydown', function(event) {
  const target = event.target;

  if (target.matches('input, textarea, select') || target.isContentEditable) return;
  if (document.querySelector('[data-page="calculator"]').classList.contains('active') === false) return;

  let button = null;
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
    button = document.querySelector('.digit[data-digit="' + key + '"]');
  } else if (key === '.' || key === ',') {
    inputDecimal();
    button = document.getElementById('decimalBtn');
  } else if (['+', '-', '*', '/'].includes(key)) {
    chooseOperation(key);
    button = document.querySelector('[data-operation="' + key + '"]');
  } else if (key === 'Enter' || key === '=') {
    handleEquals();
    button = document.getElementById('equalsBtn');
  } else if (key === 'Backspace' || key === 'Delete') {
    handleBackspace();
    button = document.getElementById('deleteBtn');
  } else if (key === 'Escape') {
    handleClear();
    button = document.getElementById('clearBtn');
  } else {
    return;
  }

  event.preventDefault();
  flashKeyboardButton(button);
});

/* ---------------------------
   LAP TIMER
--------------------------- */
const timerValue = document.getElementById('timerValue');
const timerStart = document.getElementById('timerStart');
const timerLap = document.getElementById('timerLap');
const timerReset = document.getElementById('timerReset');
const lapList = document.getElementById('lapList');

let timerInterval = null;
let timerStartedAt = 0;
let timerElapsed = 0;
let lapTimes = [];

function formatTime(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds));
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const ms = total % 1000;

  return String(minutes).padStart(2, '0') + ':' +
         String(seconds).padStart(2, '0') + '.' +
         String(ms).padStart(3, '0');
}

function renderTimer() {
  timerValue.textContent = formatTime(timerElapsed);
}

function startStopTimer() {
  if (timerInterval === null) {
    timerStartedAt = performance.now() - timerElapsed;

    timerInterval = setInterval(function() {
      timerElapsed = performance.now() - timerStartedAt;
      renderTimer();
    }, 25);

    timerStart.textContent = 'Стоп';
    timerValue.classList.add('running');
  } else {
    clearInterval(timerInterval);
    timerInterval = null;
    timerStart.textContent = 'Старт';
    timerValue.classList.remove('running');
  }
}

function recordLap() {
  if (timerElapsed <= 0) return;

  const previousTotal = lapTimes.length ? lapTimes[lapTimes.length - 1].total : 0;
  const lapDuration = timerElapsed - previousTotal;

  lapTimes.push({
    total: timerElapsed,
    lap: lapDuration
  });

  renderLaps();
}

function renderLaps() {
  lapList.innerHTML = '';

  if (lapTimes.length === 0) {
    lapList.innerHTML = '<span class="empty-state">Запустите таймер и зафиксируйте круг.</span>';
    return;
  }

  let bestTime = Math.min.apply(null, lapTimes.map(function(item) {
    return item.lap;
  }));

  lapTimes.slice().reverse().forEach(function(item, reverseIndex) {
    const originalIndex = lapTimes.length - reverseIndex;
    const row = document.createElement('div');
    row.className = 'lap-row';

    if (item.lap === bestTime) {
      row.classList.add('best');
    }

    row.innerHTML =
      '<span>КРУГ ' + String(originalIndex).padStart(2, '0') + '</span>' +
      '<strong>' + formatTime(item.lap) + '</strong>' +
      '<em>' + (item.lap === bestTime ? 'ЛУЧШИЙ' : '') + '</em>';

    lapList.appendChild(row);
  });
}

function resetTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  timerElapsed = 0;
  lapTimes = [];
  timerStart.textContent = 'Старт';
  timerValue.classList.remove('running');
  renderTimer();
  renderLaps();
}

timerStart.onclick = startStopTimer;
timerLap.onclick = recordLap;
timerReset.onclick = resetTimer;

/* ---------------------------
   STRATEGY
--------------------------- */
const raceLaps = document.getElementById('raceLaps');
const lapSeconds = document.getElementById('lapSeconds');
const pitLoss = document.getElementById('pitLoss');
const fuelRange = document.getElementById('fuelRange');
const fuelValue = document.getElementById('fuelValue');

const outFuel = document.getElementById('outFuel');
const outStops = document.getElementById('outStops');
const outWindow = document.getElementById('outWindow');
const outTime = document.getElementById('outTime');

let selectedCompound = 'medium';

function tyreLife(compound) {
  if (compound === 'soft') return 18;
  if (compound === 'hard') return 36;
  return 26;
}

function formatRaceTime(totalSeconds) {
  const total = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return hours + ':' +
         String(minutes).padStart(2, '0') + ':' +
         String(seconds).padStart(2, '0');
}

function calculateStrategy() {
  const laps = Math.max(1, Number(raceLaps.value) || 1);
  const averageLap = Math.max(1, Number(lapSeconds.value) || 1);
  const pitSeconds = Math.max(0, Number(pitLoss.value) || 0);
  const fuelPerLap = Number(fuelRange.value);

  const stintLife = tyreLife(selectedCompound);
  const stops = Math.max(0, Math.ceil(laps / stintLife) - 1);
  const pitWindow = stops === 0 ? 'Без пит-стопа' : 'Круг ' + Math.round(laps / (stops + 1));
  const fuel = laps * fuelPerLap;
  const raceTime = laps * averageLap + stops * pitSeconds;

  outFuel.textContent = fuel.toFixed(1) + ' кг';
  outStops.textContent = String(stops);
  outWindow.textContent = pitWindow;
  outTime.textContent = formatRaceTime(raceTime);
}

fuelRange.oninput = function() {
  fuelValue.textContent = Number(fuelRange.value).toFixed(2);
  calculateStrategy();
};

document.querySelectorAll('.compound').forEach(function(button) {
  button.onclick = function() {
    selectedCompound = button.dataset.compound;

    document.querySelectorAll('.compound').forEach(function(item) {
      item.classList.toggle('active', item === button);
    });

    calculateStrategy();
  };
});

document.getElementById('strategyCalc').onclick = calculateStrategy;
raceLaps.oninput = calculateStrategy;
lapSeconds.oninput = calculateStrategy;
pitLoss.oninput = calculateStrategy;

calculateStrategy();
renderCalculator();
renderTimer();
