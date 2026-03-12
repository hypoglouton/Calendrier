const MONTHS_FR = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
];
const DAYS_FR = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const PRESET_TEXTS = {
  rdv: { label: 'RDV', emoji: '📍' },
  appel: { label: 'APPEL', emoji: '📞' },
  travail: { label: 'TRAVAIL', emoji: '💼' },
  important: { label: 'IMPORTANT', emoji: '⚠️' },
  perso: { label: 'PERSO', emoji: '🏠' },
  sante: { label: 'SANTÉ', emoji: '🩺' }
};

const SAMPLE_EVENTS = {
  '2026-03-04': ['travail', 'appel'],
  '2026-03-07': ['perso'],
  '2026-03-12': ['rdv', 'important'],
  '2026-03-16': ['travail'],
  '2026-03-21': ['sante'],
  '2026-03-25': ['appel', 'perso'],
  '2026-04-02': ['rdv'],
  '2026-04-10': ['travail', 'important'],
  '2026-04-19': ['perso'],
  '2026-05-05': ['rdv', 'appel'],
  '2026-05-18': ['travail']
};

const scroller = document.getElementById('calendarScroller');
const template = document.getElementById('monthTemplate');
const currentTitle = document.getElementById('currentTitle');
const prevBtn = document.getElementById('prevMonth');
const nextBtn = document.getElementById('nextMonth');

let activeIndex = 0;

function pad(n) {
  return String(n).padStart(2, '0');
}

function keyFor(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function buildMonthList(count = 18) {
  const start = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    return { year: d.getFullYear(), monthIndex: d.getMonth() };
  });
}

function getMonthCells(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const mondayIndex = (first.getDay() + 6) % 7;
  const cells = [];

  for (let i = 0; i < mondayIndex; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function renderMonth(month, index) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.index = index;

  node.querySelector('.month-title').textContent = `${MONTHS_FR[month.monthIndex]} ${month.year}`;

  const weekdayRow = node.querySelector('.weekday-row');
  DAYS_FR.forEach((label) => {
    const el = document.createElement('div');
    el.className = 'weekday';
    el.textContent = label;
    weekdayRow.appendChild(el);
  });

  const grid = node.querySelector('.days-grid');
  const today = new Date();
  const cells = getMonthCells(month.year, month.monthIndex);

  cells.forEach((day) => {
    const cell = document.createElement('div');
    cell.className = `day-cell${day ? '' : ' empty'}`;

    if (day) {
      const head = document.createElement('div');
      head.className = 'day-head';

      const num = document.createElement('div');
      const isToday = today.getFullYear() === month.year && today.getMonth() === month.monthIndex && today.getDate() === day;
      num.className = `day-number${isToday ? ' today' : ''}`;
      num.textContent = day;
      head.appendChild(num);
      cell.appendChild(head);

      const stickersWrap = document.createElement('div');
      stickersWrap.className = 'stickers';

      const key = keyFor(month.year, month.monthIndex, day);
      const items = SAMPLE_EVENTS[key] || [];

      if (items.length) {
        items.forEach((type) => {
          const data = PRESET_TEXTS[type];
          if (!data) return;
          const tag = document.createElement('div');
          tag.className = `sticker ${type}`;
          tag.innerHTML = `<span>${data.emoji}</span><span>${data.label}</span>`;
          stickersWrap.appendChild(tag);
        });
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        placeholder.textContent = 'Espace vignette';
        stickersWrap.appendChild(placeholder);
      }

      cell.appendChild(stickersWrap);
    }

    grid.appendChild(cell);
  });

  return node;
}

const months = buildMonthList(18);
months.forEach((month, index) => scroller.appendChild(renderMonth(month, index)));

function updateTitle() {
  const month = months[activeIndex];
  currentTitle.textContent = `${MONTHS_FR[month.monthIndex]} ${month.year}`;
}

function scrollToIndex(index) {
  const safeIndex = Math.max(0, Math.min(months.length - 1, index));
  scroller.scrollTo({ top: safeIndex * scroller.clientHeight, behavior: 'smooth' });
  activeIndex = safeIndex;
  updateTitle();
}

scroller.addEventListener('scroll', () => {
  const page = Math.round(scroller.scrollTop / scroller.clientHeight);
  activeIndex = Math.max(0, Math.min(months.length - 1, page));
  updateTitle();
}, { passive: true });

prevBtn.addEventListener('click', () => scrollToIndex(activeIndex - 1));
nextBtn.addEventListener('click', () => scrollToIndex(activeIndex + 1));

updateTitle();
