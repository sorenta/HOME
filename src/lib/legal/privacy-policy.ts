/** Versija jāsakrīt ar `legal_consents.privacy_policy_version`. */
export const PRIVACY_POLICY_VERSION = "2026-04-02";

export type LegalLocale = "lv" | "en";

export type PrivacySection = {
  id: string;
  title: string;
  paragraphs: string[];
};

const LV: PrivacySection[] = [
  {
    id: "controller",
    title: "1. Pārzinis un kontakti",
    paragraphs: [
      "Personas datu pārzinis ir HOME:OS lietotnes operators (Pārzinis). Juridiskais nosaukums un adrese jānorāda jūsu izvietošanas dokumentācijā.",
      "Kontaktpersona datu jautājumos: e-pasts, kas norādīts lietotnes iestatījumos (maināms caur NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL), vai cita jūsu norādītā saziņas adrese.",
    ],
  },
  {
    id: "scope",
    title: "2. Darbības joma un vecums",
    paragraphs: [
      "Politika attiecas uz HOME:OS tīmekļa/PWA lietotni un saistītajiem pakalpojumiem.",
      "Pakalpojums nav paredzēts personām jaunākām par 16 gadiem (GDPR 8. pants).",
    ],
  },
  {
    id: "categories",
    title: "3. Datu kategorijas",
    paragraphs: [
      "Konts un profils: e-pasts, autentifikācijas dati (apstrādā Supabase Auth), segvārds, iestatījumi, mājsaimniecības saistība, moduļu ieraksti mākonī.",
      "RESET un veselība: check-in, signāli, privātās piezīmes (pirms mākoņa — šifrētas ierīcē, kur ieslēgta šī funkcija).",
      "Ierīcē lokāli: tikai lietotnes iestatījumi un šifrēšanas atslēgas; BYOK atslēgas glabājas serverī (Supabase Vault).",
      "Pēc izvēles: Google Fit u.c. integrācijas — attiecīgā trešās puses noteikumi papildus.",
    ],
  },
  {
    id: "purposes",
    title: "4. Mērķi un tiesiskais pamats (GDPR 6. pants)",
    paragraphs: [
      "Līgums: konta izveide, autentifikācija, datu sinhronizācija.",
      "Likumīgā interese: drošība, kļūdu diagnostika, saprātīga pakalpojuma uzlabošana.",
      "Piekrišana: neobligātas sīkdatnes / analītika, ja tās ieslēdzat.",
      "Likums: ja piemērojams uzglabāšanas vai ziņošanas pienākums.",
    ],
  },
  {
    id: "processors",
    title: "5. Apstrādātāji un pārsūtīšana",
    paragraphs: [
      "Supabase: hosting un datubāze. Starp jums un Supabase jābūt datu apstrādes līgumam (DPA) atbilstoši izvietošanai.",
      "Trešās puses AI: ja lietojat ar savām atslēgām, piemērojami to noteikumi.",
      "Pārsūtīšana ārpus EEZ: piemērojami piemēroti drošības līdzekļi (piem., standartklauzulas).",
    ],
  },
  {
    id: "retention",
    title: "6. Glabāšana",
    paragraphs: [
      "Kamēr konts ir aktīvs; pēc dzēšanas — dzēšana vai anonimizācija atbilstoši sniedzēja un jūsu konfigurācijai.",
      "Žurnāli — saprātīgs termiņš atbilstoši operacionālajām vajadzībām.",
    ],
  },
  {
    id: "rights",
    title: "7. Jūsu tiesības",
    paragraphs: [
      "Piekļuve, labošana, dzēšana, ierobežošana, iebildums, pārnesamība (kur piemērojams), piekrišanas atsaukšana.",
      "Sūdzības tiesība Datu valsts inspekcijā: https://www.dvi.gov.lv",
      "Pieprasījumus sūtiet uz Pārziņa kontaktpunktu; atbilde parasti viena mēneša laikā (sarežģītos gadījumos līdz diviem ar pamatojumu).",
    ],
  },
  {
    id: "security",
    title: "8. Drošība",
    paragraphs: [
      "HTTPS, datubāzes RLS, sensitīvu piezīmju šifrēšana klientā pirms augšupielādes (kur implementēts).",
      "Lietojiet spēcīgu paroli un nekopīgojiet kontu.",
    ],
  },
  {
    id: "changes",
    title: "9. Izmaiņas",
    paragraphs: [
      "Politiku var atjaunināt; par būtiskām izmaiņām paziņosim lietotnē vai e-pastā. Aktuālā versija ir šīs lapas augšā.",
    ],
  },
];

const EN: PrivacySection[] = [
  {
    id: "controller",
    title: "1. Controller and contact",
    paragraphs: [
      "The controller is the operator of the HOME:OS app. Legal name and address should be stated in your deployment documentation.",
      "Contact for data matters: email shown in app settings (via NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL) or another address you publish.",
    ],
  },
  {
    id: "scope",
    title: "2. Scope and age",
    paragraphs: [
      "This policy covers the HOME:OS web/PWA and related services.",
      "The service is not intended for users under 16 (GDPR Art. 8).",
    ],
  },
  {
    id: "categories",
    title: "3. Categories of data",
    paragraphs: [
      "Account/profile: email, auth data (Supabase Auth), display name, settings, household membership, cloud module data.",
      "RESET/health: check-ins, signals, private notes (encrypted on device before cloud where enabled).",
      "On device: local preferences and encryption keys only; BYOK keys are stored server-side (Supabase Vault).",
      "Optional: Google Fit etc. — third-party terms apply in addition.",
    ],
  },
  {
    id: "purposes",
    title: "4. Purposes and legal bases (GDPR Art. 6)",
    paragraphs: [
      "Contract: account, authentication, sync.",
      "Legitimate interests: security, diagnostics, proportionate improvement.",
      "Consent: optional cookies/analytics if you enable them.",
      "Legal obligation: where applicable.",
    ],
  },
  {
    id: "processors",
    title: "5. Processors and transfers",
    paragraphs: [
      "Supabase: hosting and database. A DPA with Supabase should be in place for your deployment.",
      "Third-party AI with your keys: their terms apply.",
      "Transfers outside the EEA: appropriate safeguards where required.",
    ],
  },
  {
    id: "retention",
    title: "6. Retention",
    paragraphs: [
      "While the account is active; after deletion, erasure or anonymisation per provider and configuration.",
      "Logs: kept only as long as reasonably necessary.",
    ],
  },
  {
    id: "rights",
    title: "7. Your rights",
    paragraphs: [
      "Access, rectification, erasure, restriction, objection, portability where applicable, withdrawal of consent.",
      "Right to complain to a supervisory authority (in Latvia: https://www.dvi.gov.lv).",
      "Requests to the Controller’s contact; response usually within one month (up to two if complex, with reasons).",
    ],
  },
  {
    id: "security",
    title: "8. Security",
    paragraphs: [
      "HTTPS, database RLS, client-side encryption of sensitive notes before upload where implemented.",
      "Use a strong password and do not share your account.",
    ],
  },
  {
    id: "changes",
    title: "9. Changes",
    paragraphs: [
      "We may update this policy; material changes will be notified in-app or by email. The current version is shown at the top of this page.",
    ],
  },
];

export function getPrivacySections(locale: LegalLocale): PrivacySection[] {
  return locale === "en" ? EN : LV;
}
