const THEMES = {
  lucent: {
    name: "Lucent",
    glyph: "✦",
    label: "Kokvilnas maigums",
    blurb: "Viegls, gaisīgs un kluss noklusējuma ritms.",
  },
  hive: {
    name: "Hive",
    glyph: "⬢",
    label: "Bites darba plūsma",
    blurb: "Silts household ritms ar skaidrām kopīgajām zonām.",
  },
  pulse: {
    name: "Pulse",
    glyph: "⚡",
    label: "Komiksa enerģija",
    blurb: "Spilgts, drukāts un raksturīgs pop-art slānis.",
  },
  forge: {
    name: "Forge",
    glyph: "⛭",
    label: "RS-mode panelis",
    blurb: "Tehnisks, disciplinēts un skaidri fokusēts panelis.",
  },
  botanical: {
    name: "Botanical",
    glyph: "❋",
    label: "Dabas ritms",
    blurb: "Mierīgs, zemēts un plūstošs meža vaibs.",
  },
};

const VIEW_META = {
  dashboard: { label: "Sākums", title: "Dashboard" },
  events: { label: "Kalendārs", title: "Events" },
  kitchen: { label: "Virtuve", title: "Kitchen" },
  finance: { label: "Finanses", title: "Finance" },
  pharmacy: { label: "Aptieciņa", title: "Pharmacy" },
  reset: { label: "RESET", title: "RESET" },
  settings: { label: "Iestatījumi", title: "Settings" },
};

const calendarMatrix = [
  ["31", "1", "2", "3", "4", "5", "6"],
  ["7", "8", "9", "10", "11", "12", "13"],
  ["14", "15", "16", "17", "18", "19", "20"],
  ["21", "22", "23", "24", "25", "26", "27"],
  ["28", "29", "30", "1", "2", "3", "4"],
];

const inventoryRows = [
  { name: "Piens", meta: "2 gab. · termiņš rīt" },
  { name: "Spināti", meta: "1 iep. · jāizlieto šovakar" },
  { name: "Olas", meta: "10 gab. · ledusskapī" },
];

const screenContent = document.getElementById("screen-content");
const settingsThemeSwitcher = document.getElementById("settings-theme-switcher");
const quickViewButtons = Array.from(document.querySelectorAll("[data-view-jump]"));
const quickThemeButtons = Array.from(document.querySelectorAll("[data-theme-jump]"));
const navButtons = Array.from(document.querySelectorAll(".nav-item[data-view-jump]"));
const iconSlots = Array.from(document.querySelectorAll("[data-icon]"));

const state = {
  theme: "lucent",
  view: "dashboard",
};

function appMark(size = "sm") {
  return `<span class="app-mark app-mark--${size}" aria-label="H:O">H:O</span>`;
}

function themeBadge(theme = state.theme, variant = "default") {
  const meta = THEMES[theme];
  return `
    <span class="theme-badge theme-badge--${variant}" data-theme-token="${theme}" aria-hidden="true">
      <span>${meta.glyph}</span>
    </span>
  `;
}

function sectionIcon(sectionId, extraClass = "") {
  const cls = `section-icon ${extraClass}`.trim();

  switch (sectionId) {
    case "home":
      return `
        <svg viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4.5 10.5 12 4l7.5 6.5"></path>
          <path d="M6.5 9.5V19a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9.5"></path>
          <path d="M10 20v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20"></path>
        </svg>
      `;
    case "calendar":
      return `
        <svg viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="4" y="5.5" width="16" height="14.5" rx="2.5"></rect>
          <path d="M8 4v3M16 4v3M4 9.5h16"></path>
          <path d="M8 13h3M13 13h3M8 16.5h3"></path>
        </svg>
      `;
    case "kitchen":
      return `
        <svg viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7 4.5v6.2M9 4.5v6.2M8 10.7v8.8"></path>
          <path d="M15.5 4.5c1.7 1.3 2.5 3 2.5 5.1 0 2.1-.8 3.8-2.5 5.1V20"></path>
          <path d="M13.5 4.5v7.2c0 1.2.8 2.1 2 2.1"></path>
        </svg>
      `;
    case "finance":
      return `
        <svg viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4.5 8.5h15a1.5 1.5 0 0 1 1.5 1.5v7.5A2.5 2.5 0 0 1 18.5 20h-12A2.5 2.5 0 0 1 4 17.5V10a1.5 1.5 0 0 1 .5-1.5Z"></path>
          <path d="M4.5 11h16"></path>
          <circle cx="16.5" cy="15.5" r="1.8"></circle>
          <path d="M16.5 13.7v3.6"></path>
        </svg>
      `;
    case "pharmacy":
      return `
        <svg viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 5.5h6"></path>
          <path d="M8 7.5h8v11A1.5 1.5 0 0 1 14.5 20h-5A1.5 1.5 0 0 1 8 18.5v-11Z"></path>
          <path d="M12 10.5v5M9.5 13h5"></path>
          <path d="M16 9h1.5A1.5 1.5 0 0 1 19 10.5v6A1.5 1.5 0 0 1 17.5 18H16"></path>
        </svg>
      `;
    case "reset":
      return `
        <svg viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="6.2"></circle>
          <path d="M12 8.2v7.6M8.2 12h7.6"></path>
          <path d="m18.2 5.8.8-1.8m.2 4.2 1.8-.8M5.8 18.2 4 19m1.8-13.2L5 4"></path>
        </svg>
      `;
    case "settings":
      return `
        <svg viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 7.5h8M15.5 7.5H19M10 7.5a1.5 1.5 0 1 0 0 0Zm-5 9h4M11 16.5h8M9.5 16.5a1.5 1.5 0 1 0 0 0Z"></path>
        </svg>
      `;
    default:
      return "";
  }
}

function moduleHeader({ title, description, sectionId, actionLabel = "", actionView = "" }) {
  const action = actionLabel
    ? `<button class="module-action" type="button" data-view-jump="${actionView || "dashboard"}">${actionLabel}</button>`
    : "";

  return `
    <header class="module-header">
      <button class="back-button" type="button" data-view-jump="dashboard" aria-label="Atpakaļ">
        ←
      </button>
      <div class="module-header__copy">
        <div class="module-header__chips">
          ${appMark("sm")}
          ${themeBadge(state.theme, "chip")}
          <span class="section-chip" aria-hidden="true">${sectionIcon(sectionId, "section-icon--chip")}</span>
        </div>
        <h1 class="module-title">${title}</h1>
        <p class="module-description">${description}</p>
      </div>
      ${action}
    </header>
  `;
}

function tile({ sectionId, title, featured = false, attention = false }) {
  return `
    <button
      class="module-tile ${featured ? "module-tile--featured" : ""} ${attention ? "module-tile--attention" : ""}"
      type="button"
      data-view-jump="${sectionToView(sectionId)}"
    >
      <span class="module-tile__icon">${sectionIcon(sectionId, "section-icon--tile")}</span>
      <span class="module-tile__title">${title}</span>
      ${state.theme === "pulse" && featured ? '<span class="module-tile__burst">Pow</span>' : ""}
      ${state.theme === "forge" && featured ? '<span class="module-tile__forge-line"></span>' : ""}
    </button>
  `;
}

function sectionToView(sectionId) {
  if (sectionId === "calendar") return "events";
  return sectionId;
}

function dashboardHero() {
  const badgeText =
    state.theme === "lucent"
      ? "Plūsma ieslēgta"
      : state.theme === "pulse"
        ? "Pop režīms"
        : state.theme === "botanical"
          ? "Mierīgā taka"
          : "Household focus";

  return `
    <section class="surface-panel hero-panel hero-panel--${state.theme}">
      <div class="hero-panel__glow" aria-hidden="true"></div>
      <div class="hero-panel__head">
        <div class="hero-panel__copy">
          ${appMark("sm")}
          <p class="section-kicker">Sākuma ekrāns</p>
          <h1 class="hero-title">Sveiks, Elīna</h1>
          <p class="hero-body">
            Tavs mājas ritma centrs šodienai: prioritātes, moduļi un īsākais
            ceļš uz nākamo soli.
          </p>
        </div>
        <span class="hero-badge">${badgeText}</span>
      </div>

      <div class="hero-actions">
        <button class="hero-action hero-action--primary" type="button" data-view-jump="reset">Atvērt RESET</button>
        <button class="hero-action" type="button" data-view-jump="events">Kalendārs</button>
        <button class="hero-action" type="button" data-view-jump="kitchen">Virtuve</button>
      </div>
    </section>
  `;
}

function modulesSection() {
  const title =
    state.theme === "forge"
      ? "Galvenās sistēmas"
      : state.theme === "botanical"
        ? "Takas pieturas"
        : state.theme === "lucent"
          ? "Maigie ceļi"
          : state.theme === "hive"
            ? "Ātrā piekļuve"
            : "Ātrā piekļuve";

  const detail =
    state.theme === "forge"
      ? "Primārās darbības bez lieka trokšņa"
      : state.theme === "botanical"
        ? "Mierīga dienas plūsma caur mājas zonām"
        : state.theme === "lucent"
          ? "Gaisīga, klusa pāreja starp svarīgo"
          : "Viss svarīgākais vienā vietā";

  return `
    <section class="dashboard-section">
      <div class="section-head">
        <div>
          <p class="section-kicker">Moduļi</p>
          <h2 class="section-title">${title}</h2>
        </div>
        <p class="section-detail">${detail}</p>
      </div>
      <div class="tiles-grid tiles-grid--${state.theme}">
        ${tile({ sectionId: "reset", title: "RESET", featured: true, attention: true })}
        ${tile({ sectionId: "calendar", title: "Kalendārs", attention: true })}
        ${tile({ sectionId: "kitchen", title: "Virtuve", attention: true })}
        ${tile({ sectionId: "finance", title: "Finanses" })}
        ${tile({ sectionId: "pharmacy", title: "Aptieciņa" })}
      </div>
    </section>
  `;
}

function triageSection() {
  return `
    <div class="dashboard-stack">
      <section class="surface-panel surface-panel--soft">
        <p class="section-kicker">Dienas ritms</p>
        <div class="notice-card">
          <h3 class="card-title">Vakara atgādinājums</h3>
          <p class="card-copy">RESET check-in vēl gaida. Pabeidz to, pirms diena aizslīd tālāk.</p>
        </div>
      </section>

      <section class="surface-panel">
        <p class="section-kicker">Šodien svarīgākais</p>
        <div class="list-stack">
          <button class="list-item" type="button" data-view-jump="reset">
            <div>
              <p class="list-item__title">RESET check-in nav izdarīts</p>
              <p class="list-item__body">Pabeidz šodienas check-in, lai noturētu ritmu.</p>
            </div>
            <span class="count-pill">1</span>
          </button>
          <button class="list-item" type="button" data-view-jump="events">
            <div>
              <p class="list-item__title">Neaizvērti uzdevumi: 3</p>
              <p class="list-item__body">Termiņi tuvojas nākamajās 3 dienās.</p>
            </div>
            <span class="count-pill">2</span>
          </button>
          <button class="list-item" type="button" data-view-jump="kitchen">
            <div>
              <p class="list-item__title">Steidzami produkti: 2</p>
              <p class="list-item__body">Piens un spināti prasa uzmanību jau šovakar.</p>
            </div>
            <span class="count-pill">3</span>
          </button>
        </div>
      </section>
    </div>
  `;
}

function metricsSection() {
  return `
    <section class="metrics-grid metrics-grid--${state.theme}">
      <article class="metric-card">
        <span class="metric-label">Atvērtie uzdevumi</span>
        <strong class="metric-value">3</strong>
        <span class="metric-hint">Nākamās 3 dienas</span>
      </article>
      <article class="metric-card">
        <span class="metric-label">Iepirkumu ieraksti</span>
        <strong class="metric-value">4</strong>
        <span class="metric-hint">Atvērtais grozs</span>
      </article>
      <article class="metric-card">
        <span class="metric-label">Steidzamie produkti</span>
        <strong class="metric-value">2</strong>
        <span class="metric-hint">Derīgums vai atlikums</span>
      </article>
      <article class="metric-card">
        <span class="metric-label">Mājsaimniecība</span>
        <strong class="metric-value">2</strong>
        <span class="metric-hint">Aktīvie biedri</span>
      </article>
    </section>
  `;
}

function partnerSection() {
  const badge =
    state.theme === "forge"
      ? "SYS"
      : state.theme === "botanical"
        ? "PATH"
        : state.theme === "lucent"
          ? "AIR"
          : state.theme === "pulse"
            ? "POP"
            : "+";

  return `
    <section class="surface-panel">
      <div class="section-head section-head--compact">
        <div>
          <p class="section-kicker">Biedra noskaņojums</p>
          <h2 class="section-title">Mīksts atgādinājums</h2>
        </div>
        <span class="count-pill">${badge}</span>
      </div>

      <div class="spotlight-card">
        <p class="spotlight-title">Mārtiņam var būt vajadzīgs mazs atbalsts.</p>
        <p class="spotlight-copy">Pajautā, kā pagāja diena, un piedāvā 10 minūtes mieram.</p>
      </div>

      <div class="mini-grid">
        <div class="mini-stat">
          <span>Biedri</span>
          <strong>2</strong>
        </div>
        <div class="mini-stat">
          <span>Plūsma</span>
          <strong>3</strong>
        </div>
      </div>
    </section>
  `;
}

function waterSection() {
  return `
    <section class="surface-panel water-card">
      <div class="section-head section-head--compact">
        <div>
          <p class="section-kicker">Ūdens logs</p>
          <h2 class="section-title">Mājas ūdens ritms</h2>
        </div>
        <span class="count-pill">74%</span>
      </div>
      <div class="water-bar">
        <span class="water-bar__fill" style="width:74%"></span>
      </div>
      <div class="water-members">
        <div class="water-member">
          <strong>Elīna</strong>
          <span>1.6l / 2.0l</span>
        </div>
        <div class="water-member">
          <strong>Mārtiņš</strong>
          <span>1.3l / 2.0l</span>
        </div>
      </div>
    </section>
  `;
}

function challengeSection() {
  return `
    <section class="surface-panel">
      <p class="section-kicker">Izaicinājums</p>
      <h2 class="section-title">Šodienas izaicinājums: 10 min klusais brīdis</h2>
      <p class="card-copy">
        Atver RESET un piefiksē savas sajūtas, lai noslēgtu dienu ar skaidru fokusu.
      </p>
      <button class="hero-action hero-action--inline" type="button" data-view-jump="reset">Skatīt RESET</button>
    </section>
  `;
}

function feedSection() {
  return `
    <div class="dashboard-stack">
      <section class="surface-panel">
        <div class="section-head section-head--compact">
          <div>
            <p class="section-kicker">Mājas plūsma</p>
            <h2 class="section-title">Pēdējās aktivitātes</h2>
          </div>
          <span class="count-pill">3</span>
        </div>
        <ul class="feed-list">
          <li class="feed-item">
            <span>Anna pievienoja 3 preces grozam.</span>
            <time>pirms 8m</time>
          </li>
          <li class="feed-item">
            <span>RESET check-in saglabāts.</span>
            <time>pirms 1h</time>
          </li>
          <li class="feed-item">
            <span>Kalendārā pievienota zobārsta vizīte uz 16:00.</span>
            <time>vakar</time>
          </li>
        </ul>
      </section>

      <section class="surface-panel">
        <div class="section-head section-head--compact">
          <div>
            <p class="section-kicker">Iepirkumu grozs</p>
            <h2 class="section-title">Kas vēl jāpaņem</h2>
          </div>
          <button class="inline-link" type="button" data-view-jump="kitchen">Atvērt</button>
        </div>
        <ul class="feed-list">
          <li class="feed-item feed-item--simple"><span>Krējums</span></li>
          <li class="feed-item feed-item--simple"><span>Maize</span></li>
          <li class="feed-item feed-item--simple"><span>Banāni</span></li>
        </ul>
      </section>
    </div>
  `;
}

function renderDashboard() {
  const header = dashboardHero();
  const modules = modulesSection();
  const triage = triageSection();
  const metrics = metricsSection();
  const partner = partnerSection();
  const water = waterSection();
  const challenge = challengeSection();
  const feed = feedSection();

  if (state.theme === "forge") {
    return `
      <div class="screen-inner dashboard-layout dashboard-layout--forge">
        <div class="dashboard-deck">${header}</div>
        <section class="dashboard-shell">${modules}</section>
        <div class="dashboard-stack dashboard-stack--ops">
          ${triage}
          <div class="dashboard-shell">${metrics}</div>
        </div>
        <div class="dashboard-shell">${partner}</div>
        ${water}
        <div class="dashboard-shell dashboard-shell--sleeve">${challenge}</div>
        <div class="dashboard-shell dashboard-shell--sleeve">${feed}</div>
      </div>
    `;
  }

  if (state.theme === "botanical") {
    return `
      <div class="screen-inner dashboard-layout dashboard-layout--botanical">
        ${header}
        <section class="shelf-block">
          <p class="shelf-label">Moduļi un šodiena</p>
          <div class="shelf-grid">
            <div class="shelf-plate">${modules}</div>
            <div class="shelf-plate">${triage}</div>
          </div>
        </section>
        <section class="shelf-block">
          <p class="shelf-label">Ūdens un rādītāji</p>
          <div class="shelf-grid">
            <div class="shelf-plate">${water}</div>
            <div class="shelf-plate">${metrics}</div>
          </div>
        </section>
        <section class="shelf-block">
          <p class="shelf-label">Mājsaimniecība</p>
          <div class="shelf-grid">
            <div class="shelf-plate">${partner}</div>
            <div class="shelf-plate">${challenge}</div>
          </div>
        </section>
        <section class="shelf-block">
          <p class="shelf-label">Plūsma</p>
          <div class="shelf-plate">${feed}</div>
        </section>
      </div>
    `;
  }

  if (state.theme === "pulse") {
    return `
      <div class="screen-inner dashboard-layout dashboard-layout--pulse">
        <div class="pulse-frame">${header}</div>
        <div class="pulse-grid">
          <section class="pulse-frame">${modules}</section>
          <section class="pulse-frame">${triage}</section>
        </div>
        <div class="pulse-grid pulse-grid--wide">
          <section class="pulse-frame">${metrics}</section>
          <section class="pulse-frame">${partner}</section>
        </div>
        ${water}
        <div class="pulse-grid">
          <section class="pulse-frame">${challenge}</section>
          <section class="pulse-frame">${feed}</section>
        </div>
      </div>
    `;
  }

  if (state.theme === "lucent") {
    return `
      <div class="screen-inner dashboard-layout dashboard-layout--lucent">
        ${header}
        <div class="dashboard-shell">${modules}</div>
        <div class="dashboard-shell">${metrics}</div>
        <div class="lucent-stack">
          ${triage}
          ${partner}
        </div>
        ${water}
        <div class="lucent-float">${challenge}</div>
        ${feed}
      </div>
    `;
  }

  return `
    <div class="screen-inner dashboard-layout dashboard-layout--hive">
      ${header}
      <div class="dashboard-shell">${modules}</div>
      <div class="dashboard-shell dashboard-shell--honey">${metrics}</div>
      <div class="dashboard-shell">${triage}</div>
      <div class="dashboard-shell">${partner}</div>
      ${water}
      <div class="dashboard-shell">${challenge}</div>
      <div class="dashboard-shell">${feed}</div>
    </div>
  `;
}

function renderEvents() {
  const calendarCells = calendarMatrix
    .map(
      (week, weekIndex) => `
        <div class="calendar-row">
          ${week
            .map((day, dayIndex) => {
              const isActive = weekIndex === 2 && dayIndex === 2;
              const hasDot =
                (weekIndex === 2 && dayIndex === 2) ||
                (weekIndex === 2 && dayIndex === 5) ||
                (weekIndex === 3 && dayIndex === 0);
              return `
                <button class="calendar-cell ${isActive ? "calendar-cell--active" : ""}" type="button">
                  <span>${day}</span>
                  ${hasDot ? '<i class="calendar-cell__dot"></i>' : ""}
                </button>
              `;
            })
            .join("")}
        </div>
      `,
    )
    .join("");

  return `
    <div class="screen-inner module-shell-screen">
      ${moduleHeader({
        title: "Kalendārs",
        description: "Kopīgais timeline, tuvākie notikumi un skaidrs dienas plāns vienā vietā.",
        sectionId: "calendar",
      })}

      <div class="module-content">
        <section class="surface-panel">
          <p class="section-kicker">Tuvākais notikums</p>
          <h2 class="section-title">Zobārsta vizīte pēc 2 dienām</h2>
          <div class="chip-row">
            <span class="info-chip">16. aprīlis</span>
            <span class="info-chip">Personīgs</span>
            <span class="info-chip">Pēc 2 dienām</span>
          </div>
          <p class="card-copy">Atgādinājums ir skaidri redzams, lai tuvākie datumi nepazūd starp visām pārējām lietām.</p>
        </section>

        <section class="surface-panel">
          <div class="section-head section-head--compact">
            <div>
              <p class="section-kicker">Aprīlis</p>
              <h2 class="section-title">Mēneša režģis</h2>
            </div>
            <div class="chip-row chip-row--tight">
              <span class="info-chip">3 notikumi</span>
              <span class="info-chip">2 darbi</span>
            </div>
          </div>
          <div class="calendar-grid">
            <div class="calendar-weekdays">
              <span>P</span><span>O</span><span>T</span><span>C</span><span>Pk</span><span>S</span><span>Sv</span>
            </div>
            ${calendarCells}
          </div>
        </section>

        <section class="surface-panel">
          <div class="section-head section-head--compact">
            <div>
              <p class="section-kicker">16. aprīlis</p>
              <h2 class="section-title">Dienas detaļas</h2>
            </div>
            <button class="inline-link" type="button">Pievienot</button>
          </div>
          <div class="list-stack">
            <div class="list-item list-item--static">
              <div>
                <p class="list-item__title">Zobārsta vizīte</p>
                <p class="list-item__body">Visa diena · personīgs notikums</p>
              </div>
            </div>
            <div class="list-item list-item--static">
              <div>
                <p class="list-item__title">Rēķinu diena</p>
                <p class="list-item__body">Līdz dienas beigām · kopīgs darbs</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderKitchen() {
  return `
    <div class="screen-inner module-shell-screen">
      ${moduleHeader({
        title: "Virtuve",
        description: "Skaties, kas pietrūkst, kas jāizlieto un ko pievienot nākamajam pirkumam.",
        sectionId: "kitchen",
      })}

      <div class="module-content">
        <section class="surface-panel">
          <div class="section-head section-head--compact">
            <div>
              <p class="section-kicker">Inventory + AI</p>
              <h2 class="section-title">No tā, kas mājās ir, līdz vakariņām</h2>
            </div>
            <span class="info-chip">BYOK active</span>
          </div>
          <div class="action-grid">
            <button class="utility-button" type="button">+ Inventāram</button>
            <button class="utility-button" type="button">+ Grozam</button>
            <button class="utility-button" type="button">Pārcelt</button>
            <button class="utility-button" type="button">Atzīmēt</button>
          </div>
        </section>

        <section class="surface-panel">
          <p class="section-kicker">Steidzamais</p>
          <div class="list-stack">
            <div class="list-item list-item--static">
              <div>
                <p class="list-item__title">Piens</p>
                <p class="list-item__body">Termiņš rīt · ledusskapis</p>
              </div>
              <span class="status-pill status-pill--warn">Rīt</span>
            </div>
            <div class="list-item list-item--static">
              <div>
                <p class="list-item__title">Spināti</p>
                <p class="list-item__body">Jāizlieto šovakar</p>
              </div>
              <span class="status-pill status-pill--critical">Tagad</span>
            </div>
          </div>
        </section>

        <section class="two-up">
          <article class="surface-panel">
            <p class="section-kicker">Inventārs</p>
            <h2 class="section-title">Virtuves saturs</h2>
            <ul class="feed-list">
              ${inventoryRows
                .map(
                  (row) => `
                    <li class="feed-item feed-item--simple">
                      <span>
                        <strong>${row.name}</strong><br />
                        <small>${row.meta}</small>
                      </span>
                    </li>
                  `,
                )
                .join("")}
            </ul>
          </article>

          <article class="surface-panel">
            <p class="section-kicker">Grozs</p>
            <h2 class="section-title">Kas jāpaņem</h2>
            <ul class="feed-list">
              <li class="feed-item feed-item--simple"><span>Krējums · 1</span></li>
              <li class="feed-item feed-item--simple"><span>Maize · 1</span></li>
              <li class="feed-item feed-item--simple"><span>Banāni · 6</span></li>
            </ul>
          </article>
        </section>

        <section class="surface-panel">
          <p class="section-kicker">AI pavārs</p>
          <h2 class="section-title">Ieteikums no esošā inventory</h2>
          <p class="card-copy">Spinātu frittata, jo olas, spināti un siers jau ir mājās. Pietrūkst tikai krējuma.</p>
          <div class="chip-row">
            <span class="info-chip">20 min</span>
            <span class="info-chip">1 pietrūkstoša sastāvdaļa</span>
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderFinance() {
  return `
    <div class="screen-inner module-shell-screen">
      ${moduleHeader({
        title: "Finanses",
        description: "Rēķini, plūsma un mājas naudas ritms vienā pārskatāmā skatā.",
        sectionId: "finance",
      })}

      <div class="module-content">
        <section class="surface-panel wallet-panel">
          <p class="section-kicker">Mūsu maciņš</p>
          <h2 class="wallet-total">€2 380</h2>
          <p class="card-copy">Mierīgs kopskats par mājas naudas ritmu.</p>
          <div class="wallet-split">
            <div>
              <span>Ienākumi</span>
              <strong>€4 120</strong>
            </div>
            <div>
              <span>Plūsma</span>
              <strong>€1 740</strong>
            </div>
          </div>
        </section>

        <section class="surface-panel">
          <div class="action-grid">
            <button class="utility-button" type="button">+ Izdevums</button>
            <button class="utility-button" type="button">+ Maksājums</button>
            <button class="utility-button" type="button">Atzīmēt samaksu</button>
            <button class="utility-button" type="button">Rediģēt</button>
          </div>
        </section>

        <section class="surface-panel">
          <p class="section-kicker">Tuvākie maksājumi</p>
          <div class="list-stack">
            <div class="list-item list-item--static">
              <div>
                <p class="list-item__title">Internets</p>
                <p class="list-item__body">€29 · rīt · komunālie</p>
              </div>
              <span class="status-pill status-pill--warn">Rīt</span>
            </div>
            <div class="list-item list-item--static">
              <div>
                <p class="list-item__title">Bērnudārzs</p>
                <p class="list-item__body">€180 · pēc 4 dienām</p>
              </div>
              <span class="status-pill">4d</span>
            </div>
          </div>
        </section>

        <section class="surface-panel">
          <p class="section-kicker">Plānotie maksājumi</p>
          <div class="list-stack">
            <div class="list-item list-item--static">
              <div>
                <p class="list-item__title">Spotify</p>
                <p class="list-item__body">€9.99 · pēc 11 dienām</p>
              </div>
            </div>
            <div class="list-item list-item--static">
              <div>
                <p class="list-item__title">Atvaļinājums</p>
                <p class="list-item__body">Krājumu mērķis 740 / 1500</p>
              </div>
              <span class="status-pill status-pill--good">49%</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderPharmacy() {
  return `
    <div class="screen-inner module-shell-screen">
      ${moduleHeader({
        title: "Aptieciņa",
        description: "Svarīgākie krājumi, termiņi un papildināšana vienkāršā, tīrā skatā.",
        sectionId: "pharmacy",
      })}

      <div class="module-content">
        <section class="surface-panel">
          <p class="section-kicker">Krājumi</p>
          <h2 class="section-title">Pievienot jaunu ierakstu</h2>
          <div class="form-grid">
            <label class="field">
              <span>Nosaukums</span>
              <input type="text" value="D vitamīns" readonly />
            </label>
            <label class="field">
              <span>Daudzums</span>
              <input type="text" value="2" readonly />
            </label>
            <label class="field">
              <span>Vienība</span>
              <input type="text" value="iepakojumi" readonly />
            </label>
            <label class="field">
              <span>Termiņš</span>
              <input type="text" value="2026-05-18" readonly />
            </label>
          </div>
          <button class="wide-button" type="button">Saglabāt</button>
        </section>

        <section class="surface-panel">
          <p class="section-kicker">Atgādinājumi</p>
          <div class="list-stack">
            <div class="list-item list-item--static">
              <div>
                <p class="list-item__title">Ibuprofēns</p>
                <p class="list-item__body">Drīz jāpapildina · atlikušas 3 tabletes</p>
              </div>
              <span class="status-pill status-pill--warn">Zems</span>
            </div>
            <div class="list-item list-item--static">
              <div>
                <p class="list-item__title">D vitamīns</p>
                <p class="list-item__body">Termiņš pēc 12 dienām</p>
              </div>
              <span class="status-pill status-pill--critical">Termiņš</span>
            </div>
          </div>
        </section>

        <section class="surface-panel">
          <p class="section-kicker">AI savietojamība</p>
          <h2 class="section-title">Premium slānis</h2>
          <p class="card-copy">Pašlaik šī daļa ir pieejama premium plānam, lai pārbaudītu iespējamās mijiedarbības un piezīmes.</p>
        </section>
      </div>
    </div>
  `;
}

function renderReset() {
  return `
    <div class="screen-inner module-shell-screen">
      ${moduleHeader({
        title: "RESET",
        description: "Privāts labsajūtas centrs ar mierīgu pārskatu, check-in un ritma atbalstu.",
        sectionId: "reset",
      })}

      <div class="module-content">
        <section class="surface-panel">
          <p class="section-kicker">RESET quick intro</p>
          <h2 class="section-title">Sāksim ar īsu anketu</h2>
          <p class="card-copy">Atbildi uz 5 jautājumiem, lai RESET sadaļa pielāgotos tieši tev: mērķiem, ritmam un ikdienas paradumiem.</p>
          <div class="mini-grid mini-grid--three">
            <div class="mini-card">
              <span>1</span>
              <strong>Skaidrs sākums</strong>
              <small>~1 min anketa</small>
            </div>
            <div class="mini-card">
              <span>2</span>
              <strong>Personisks ritms</strong>
              <small>Mērķi tavā tempā</small>
            </div>
            <div class="mini-card">
              <span>3</span>
              <strong>Pielāgots dashboard</strong>
              <small>Ieteikumi pēc atbildēm</small>
            </div>
          </div>
        </section>

        <section class="two-up">
          <article class="surface-panel">
            <p class="section-kicker">Today</p>
            <h2 class="section-title">Mood 74%</h2>
            <ul class="feed-list">
              <li class="feed-item feed-item--simple"><span>Soļi · 7 240</span></li>
              <li class="feed-item feed-item--simple"><span>Miegs · 7h 12m</span></li>
              <li class="feed-item feed-item--simple"><span>Ūdens · 1.6l</span></li>
            </ul>
          </article>
          <article class="surface-panel">
            <p class="section-kicker">Breathing</p>
            <h2 class="section-title">60 sekunžu pauze</h2>
            <div class="breathing-orb" aria-hidden="true"></div>
            <p class="card-copy">Īsais vingrinājums, ko atvērt vakarā pirms pilnā check-in.</p>
          </article>
        </section>

        <section class="surface-panel">
          <p class="section-kicker">Trend</p>
          <h2 class="section-title">Noskaņojums šonedēļ</h2>
          <div class="trend-bars">
            <span style="height:58%"></span>
            <span style="height:66%"></span>
            <span style="height:61%"></span>
            <span style="height:72%"></span>
            <span style="height:48%"></span>
            <span style="height:74%"></span>
            <span style="height:68%"></span>
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderSettings() {
  const themeRows = Object.keys(THEMES)
    .map((id) => {
      const active = state.theme === id;
      return `
        <button class="theme-row ${active ? "theme-row--active" : ""}" type="button" data-theme-select="${id}">
          <span class="theme-row__left">
            ${themeBadge(id, active ? "active" : "inactive")}
            <span class="theme-row__copy">
              <strong>${THEMES[id].name}</strong>
              <small>${THEMES[id].label}</small>
            </span>
          </span>
          ${active ? '<span class="status-pill status-pill--good">Aktīvs</span>' : ""}
        </button>
      `;
    })
    .join("");

  return `
    <div class="screen-inner module-shell-screen">
      ${moduleHeader({
        title: "Iestatījumi",
        description: "Izskats, valoda, paziņojumi un AI atslēgas vienuviet.",
        sectionId: "settings",
        actionLabel: "Profils",
        actionView: "settings",
      })}

      <div class="module-content">
        <section class="surface-panel">
          <p class="section-kicker">Atdalīts no profila</p>
          <h2 class="section-title">Profila dati ir savā vietā</h2>
          <p class="card-copy">
            Vārds, īpašie datumi un household informācija tagad ir profilā.
            Iestatījumos paliek tikai lietotnes uzvedība.
          </p>
          <button class="hero-action hero-action--inline" type="button">Atvērt profilu</button>
        </section>

        <section class="surface-panel">
          <p class="section-kicker">Izskats</p>
          <h2 class="section-title">Motīvs</h2>
          <p class="card-copy">${THEMES[state.theme].blurb}</p>
          <div class="theme-list">
            ${themeRows}
          </div>
          <div class="language-grid">
            <button class="language-pill language-pill--active" type="button">Latviešu</button>
            <button class="language-pill" type="button">English</button>
          </div>
        </section>

        <section class="surface-panel">
          <p class="section-kicker">Paziņojumi</p>
          <div class="list-stack">
            <div class="list-item list-item--static">
              <div>
                <p class="list-item__title">Finanšu termiņi</p>
                <p class="list-item__body">Rēķinu un maksājumu atgādinājumi</p>
              </div>
              <span class="status-pill status-pill--good">ON</span>
            </div>
            <div class="list-item list-item--static">
              <div>
                <p class="list-item__title">Aptieciņas brīdinājumi</p>
                <p class="list-item__body">Termiņš un zems atlikums</p>
              </div>
              <span class="status-pill status-pill--good">ON</span>
            </div>
          </div>
        </section>

        <section class="surface-panel">
          <p class="section-kicker">AI</p>
          <h2 class="section-title">BYOK atslēgas</h2>
          <p class="card-copy">Atslēgas tiek glabātas lokāli šajā ierīcē. Kitchen AI aktivizējas tikai tad, kad atslēga ir saglabāta un derīga.</p>
          <div class="provider-stack">
            <div class="provider-card">
              <div>
                <strong>Gemini</strong>
                <p>Nav saglabāta</p>
              </div>
              <span class="status-pill">Not saved</span>
            </div>
            <div class="provider-card">
              <div>
                <strong>OpenAI</strong>
                <p>Saglabāta lokāli · sk-••••82AX</p>
              </div>
              <span class="status-pill status-pill--good">Saved</span>
            </div>
          </div>
        </section>

        <section class="surface-panel">
          <p class="section-kicker">Sesija</p>
          <h2 class="section-title">Konta darbības</h2>
          <p class="card-copy">elina@homeos.lv</p>
          <button class="wide-button wide-button--ghost" type="button">Izrakstīties</button>
        </section>
      </div>
    </div>
  `;
}

function renderSettingsThemeSwitcher() {
  if (state.view !== "settings") return "";
  return `
    <div class="floating-theme-switcher" aria-label="Theme switcher">
      ${Object.keys(THEMES)
        .map((theme) => {
          const active = state.theme === theme;
          return `
            <button
              class="floating-theme-switcher__button ${active ? "is-active" : ""}"
              type="button"
              data-theme-select="${theme}"
              aria-label="${THEMES[theme].name}"
              title="${THEMES[theme].name}"
            >
              <span>${THEMES[theme].glyph}</span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderView() {
  switch (state.view) {
    case "dashboard":
      return renderDashboard();
    case "events":
      return renderEvents();
    case "kitchen":
      return renderKitchen();
    case "finance":
      return renderFinance();
    case "pharmacy":
      return renderPharmacy();
    case "reset":
      return renderReset();
    case "settings":
      return renderSettings();
    default:
      return renderDashboard();
  }
}

function applyHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return;
  const params = new URLSearchParams(hash);
  const theme = params.get("theme");
  const view = params.get("view");

  if (theme && THEMES[theme]) {
    state.theme = theme;
  }

  if (view && VIEW_META[view]) {
    state.view = view;
  }
}

function syncHash() {
  const params = new URLSearchParams();
  params.set("theme", state.theme);
  params.set("view", state.view);
  const nextHash = `#${params.toString()}`;
  if (window.location.hash !== nextHash) {
    history.replaceState(null, "", nextHash);
  }
}

function updateActiveButtons() {
  document.body.setAttribute("data-theme", state.theme);
  document.body.setAttribute("data-view", state.view);

  quickViewButtons.forEach((button) => {
    const targetView = button.getAttribute("data-view-jump");
    button.classList.toggle("is-active", targetView === state.view);
  });

  navButtons.forEach((button) => {
    const targetView = button.getAttribute("data-view-jump");
    button.classList.toggle("is-active", targetView === state.view);
  });

  quickThemeButtons.forEach((button) => {
    const targetTheme = button.getAttribute("data-theme-jump");
    button.classList.toggle("is-active", targetTheme === state.theme);
  });
}

function render() {
  screenContent.innerHTML = renderView();
  settingsThemeSwitcher.innerHTML = renderSettingsThemeSwitcher();
  updateActiveButtons();
  syncHash();
  screenContent.scrollTop = 0;
}

function setView(view) {
  if (!VIEW_META[view]) return;
  state.view = view;
  render();
}

function setTheme(theme) {
  if (!THEMES[theme]) return;
  state.theme = theme;
  render();
}

function handleDelegatedClick(event) {
  const viewTarget = event.target.closest("[data-view-jump]");
  if (viewTarget) {
    const nextView = viewTarget.getAttribute("data-view-jump");
    if (nextView) {
      setView(nextView);
      return;
    }
  }

  const themeTarget = event.target.closest("[data-theme-select], [data-theme-jump]");
  if (themeTarget) {
    const nextTheme = themeTarget.getAttribute("data-theme-select") || themeTarget.getAttribute("data-theme-jump");
    if (nextTheme) {
      setTheme(nextTheme);
    }
  }
}

iconSlots.forEach((slot) => {
  const icon = slot.getAttribute("data-icon");
  if (!icon) return;
  slot.innerHTML = sectionIcon(icon, "section-icon--nav");
});

applyHash();
document.addEventListener("click", handleDelegatedClick);
window.addEventListener("hashchange", () => {
  applyHash();
  render();
});
render();
