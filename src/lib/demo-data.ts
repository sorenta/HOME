export type HouseholdMember = {
  id: string;
  name: string;
  role: string;
  aura: "low" | "steady" | "high";
};

export type FeedItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  quantity: string;
  status: "ok" | "warning" | "critical";
  expiry?: string;
};

export type BillItem = {
  id: string;
  label: string;
  amount: string;
  due: string;
  paid: boolean;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  countdown: string;
  style: "shared" | "personal";
};

export const householdMembers: HouseholdMember[] = [
  { id: "1", name: "Soren", role: "Partneris", aura: "steady" },
  { id: "2", name: "Anna", role: "Partneris", aura: "low" },
  { id: "3", name: "Leo", role: "Bērns", aura: "high" },
];

export const liveFeed: FeedItem[] = [
  {
    id: "f1",
    actor: "Anna",
    action: "samaksāja",
    target: "elektrības rēķinu",
    time: "pirms 12 min",
  },
  {
    id: "f2",
    actor: "Soren",
    action: "pievienoja grozam",
    target: "banānus un auzu pienu",
    time: "pirms 26 min",
  },
  {
    id: "f3",
    actor: "Leo",
    action: "atzīmēja",
    target: "vakara vitamīnus",
    time: "pirms 1 h",
  },
];

export const dashboardSnapshot = {
  householdName: "Mājas",
  resetScore: 74,
  pendingCount: 4,
  aiReady: true,
  adaptiveHint: "Flīžu secība pielāgojas biežāk lietotajiem moduļiem.",
};

export const kitchenInventory: InventoryItem[] = [
  { id: "k1", name: "Spināti", quantity: "1 iep.", status: "warning", expiry: "2 dienas" },
  { id: "k2", name: "Vistas fileja", quantity: "540 g", status: "warning", expiry: "šodien" },
  { id: "k3", name: "Auzu piens", quantity: "2 gab.", status: "ok", expiry: "7 dienas" },
  { id: "k4", name: "Banāni", quantity: "3 gab.", status: "critical", expiry: "beidzas" },
];

export const kitchenShoppingList = [
  "Olas",
  "Tomāti",
  "Pilngraudu tortilla",
  "Jogurts",
];

export const financeBills: BillItem[] = [
  { id: "b1", label: "Īre", amount: "650 €", due: "05 apr", paid: true },
  { id: "b2", label: "Elektrība", amount: "48 €", due: "07 apr", paid: true },
  { id: "b3", label: "Internets", amount: "19 €", due: "10 apr", paid: false },
  { id: "b4", label: "Netflix", amount: "12 €", due: "13 apr", paid: false },
];

export const financeSummary = {
  balance: "1 842 €",
  income: "+2 930 €",
  plannedSpend: "-1 088 €",
  aiInsight:
    "Šomēnes pārtikas grozs aug straujāk par plānoto. AI iesaka vienu kopīgu iepirkumu logu nedēļā.",
};

export const financeBuckets = [
  { id: "fb1", label: "Pārtika un māja", amount: "412 €", hint: "Šomēnes" },
  { id: "fb2", label: "Transports", amount: "128 €", hint: "Kopīgais auto" },
  { id: "fb3", label: "Bērni un skola", amount: "96 €", hint: "Mainīgie" },
] as const;

export const financeGoals = [
  {
    id: "fg1",
    label: "Kopīgais atvaļinājums",
    current: "820 €",
    target: "2 400 €",
    pct: 34,
  },
  {
    id: "fg2",
    label: "Jauns ledusskapis",
    current: "310 €",
    target: "900 €",
    pct: 55,
  },
] as const;

export const resetMetrics = [
  { label: "Soļi", value: "7 420", tone: "good" },
  { label: "Ekrāna laiks", value: "2 h 46 min", tone: "warn" },
  { label: "Miegs", value: "7 h 12 min", tone: "good" },
  { label: "Elpošana", value: "8 min", tone: "good" },
] as const;

export const pharmacyItems: InventoryItem[] = [
  { id: "p1", name: "Magnijs", quantity: "18 kaps.", status: "ok", expiry: "2026-11" },
  { id: "p2", name: "D vitamīns", quantity: "7 kaps.", status: "warning", expiry: "2026-07" },
  { id: "p3", name: "Ibuprofēns", quantity: "4 tabl.", status: "critical", expiry: "2026-04" },
];

export const pharmacyReminders = [
  "08:00 D vitamīns",
  "21:00 Magnijs",
  "Mēneša beigās pārbaudīt bērnu sīrupus",
];

export const eventsList: EventItem[] = [
  { id: "e1", title: "Annas dzimšanas diena", date: "24 apr", countdown: "pēc 23 dienām", style: "personal" },
  { id: "e2", title: "Kopīgā gadadiena", date: "05 mai", countdown: "pēc 34 dienām", style: "shared" },
  { id: "e3", title: "Mammas vārda diena", date: "22 mai", countdown: "pēc 51 dienām", style: "personal" },
];

export const profileSummary = {
  name: "Soren",
  role: "Partneris",
  household: "Mājas",
  streak: "12 dienas",
  resetPoints: 146,
  shoppingContributions: 28,
  financeActions: 9,
};

export const growthTips = [
  "Savieno Supabase Auth un profilus, lai personalizācija kļūtu īsta.",
  "Ieslēdz push paziņojumus fiksētajiem rēķiniem un vitamīnu atgādinājumiem.",
  "Pievieno savu Gemini API atslēgu, lai aktivizētu AI ieteikumus.",
];
