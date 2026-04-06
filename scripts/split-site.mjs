/**
 * Главная: hero, преимущества, программы, галерея, тарифы, тематические ссылки,
 * запись, контакты. Подстраницы: тренировка, тарифы, залы, услуги, галерея, команда, отзывы, FAQ.
 * Запуск: node scripts/split-site.mjs (из каталога sportfit)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
const monolithPath = path.join(root, "index.monolith.html");

/** Полная версия лендинга: при отсутствии файла создаётся из index.html (если это ещё «толстая» главная). */
if (!fs.existsSync(monolithPath)) {
  const raw = fs.readFileSync(indexPath, "utf8");
  if (!raw.includes("section-programs-flow")) {
    throw new Error(
      "Нет index.monolith.html и index.html не похож на полный лендинг. Восстановите полный HTML в index.monolith.html."
    );
  }
  fs.writeFileSync(monolithPath, raw, "utf8");
}

const lines = fs.readFileSync(monolithPath, "utf8").split(/\r?\n/);

function sliceLine(a, b) {
  return lines.slice(a - 1, b).join("\n");
}

function fixCrossPageLinks(html) {
  return html
    .replace(/href="#kontakt"/g, 'href="index.html#kontakt"')
    .replace(/href="#tarife"/g, 'href="tariffs.html"')
    .replace(/href="#zaly"/g, 'href="zaly.html"')
    .replace(/href="#uslugi"/g, 'href="uslugi.html"')
    .replace(/href="#galerie"/g, 'href="galerie.html"')
    .replace(/href="#programmy"/g, 'href="index.html#programmy"')
    .replace(/href="#fit-tools"/g, 'href="training.html#fit-tools"')
    .replace(/href="#faq"/g, 'href="faq.html"')
    .replace(/href="#komanda"/g, 'href="team.html"')
    .replace(/href="#otzyvy"/g, 'href="reviews.html#otzyvy"')
    .replace(/href="#zapis-trening"/g, 'href="index.html#zapis-trening"');
}

/** Ссылки внутри блока «Программы» на главной: залы/услуги — на страницы; тариф — якорь #tarife (полный блок на главной). */
function fixHomeLinks(html) {
  return html
    .replace(/href="#zaly"/g, 'href="zaly.html"')
    .replace(/href="#uslugi"/g, 'href="uslugi.html"');
}

const navHome = `        <nav
          class="site-nav"
          id="site-nav"
          aria-label="Основное меню"
          data-i18n-aria="navMain"
        >
          <a href="#preimushchestva" data-i18n="navPreim">Преимущества</a>
          <a href="#programmy" data-i18n="navProgram">Программы</a>
          <a href="training.html" data-i18n="navZapis">Тренировка</a>
          <a href="#tarife" data-i18n="navTarify">Тарифы</a>
          <a href="zaly.html" data-i18n="navZaly">Залы</a>
          <a href="uslugi.html" data-i18n="navUslugi">Услуги</a>
          <a href="#galerie" data-i18n="navGalerie">Галерея</a>
          <a href="team.html" data-i18n="navKomanda">Команда</a>
          <a href="reviews.html#otzyvy" data-i18n="navReviews">Отзывы</a>
          <a href="#zapis-trening" data-i18n="navSignup">Запись в клуб</a>
          <a href="faq.html" data-i18n="navFaq">FAQ</a>
          <a href="#kontakt" data-i18n="navKontakt">Контакты</a>
          <a class="nav-cta" href="#zapis-trening" data-i18n="navCta">Запись</a>
        </nav>`;

const navSub = `        <nav
          class="site-nav"
          id="site-nav"
          aria-label="Основное меню"
          data-i18n-aria="navMain"
        >
          <a href="index.html#preimushchestva" data-i18n="navPreim">Преимущества</a>
          <a href="index.html#programmy" data-i18n="navProgram">Программы</a>
          <a href="training.html" data-i18n="navZapis">Тренировка</a>
          <a href="index.html#tarife" data-i18n="navTarify">Тарифы</a>
          <a href="zaly.html" data-i18n="navZaly">Залы</a>
          <a href="uslugi.html" data-i18n="navUslugi">Услуги</a>
          <a href="index.html#galerie" data-i18n="navGalerie">Галерея</a>
          <a href="team.html" data-i18n="navKomanda">Команда</a>
          <a href="reviews.html#otzyvy" data-i18n="navReviews">Отзывы</a>
          <a href="index.html#zapis-trening" data-i18n="navSignup">Запись в клуб</a>
          <a href="faq.html" data-i18n="navFaq">FAQ</a>
          <a href="index.html#kontakt" data-i18n="navKontakt">Контакты</a>
          <a class="nav-cta" href="index.html#zapis-trening" data-i18n="navCta">Запись</a>
        </nav>`;

function headerBlock(logoHref, navHtml) {
  return (
    sliceLine(86, 88) +
    "\n        <a\n          class=\"logo\"\n          href=\"" +
    logoHref +
    "\"\n          aria-label=\"SportFit — на главную\"\n          data-i18n-aria=\"logoAria\"\n        >\n" +
    sliceLine(95, 104) +
    "\n" +
    sliceLine(105, 140) +
    "\n" +
    navHtml +
    "\n" +
    sliceLine(160, 161)
  );
}

const homeExplore = `      <section class="section section--xl home-explore" id="home-explore" aria-labelledby="home-explore-title">
        <div class="container">
          <header class="section-head section-head--wide reveal" data-reveal>
            <p class="eyebrow">
              <span class="eyebrow-num" aria-hidden="true">05</span>
              <span data-i18n="homeExploreEyebrow">Дальше по сайту</span>
            </p>
            <h2 id="home-explore-title" class="section-title-flow" data-i18n="homeExploreTitle">Клуб подробнее — по темам</h2>
            <p class="section-intro" data-i18n="homeExploreIntro">Залы, услуги, люди и справка — отдельные страницы, чтобы не смешивать всё в одну ленту.</p>
          </header>
          <div class="home-explore-grid">
            <div class="home-explore-group reveal" data-reveal>
              <h3 class="home-explore-group-title" data-i18n="homeExploreGroupClub">Залы и интерьер</h3>
              <ul class="home-explore-links">
                <li><a href="zaly.html" data-i18n="navZaly">Залы</a></li>
                <li><a href="uslugi.html" data-i18n="navUslugi">Услуги</a></li>
                <li><a href="#galerie" data-i18n="navGalerie">Галерея</a></li>
              </ul>
            </div>
            <div class="home-explore-group reveal" data-reveal>
              <h3 class="home-explore-group-title" data-i18n="homeExploreGroupTools">Инструменты</h3>
              <ul class="home-explore-links">
                <li><a href="training.html" data-i18n="homeExploreTrainingLink">Подбор тренировки и калории</a></li>
              </ul>
            </div>
            <div class="home-explore-group reveal" data-reveal>
              <h3 class="home-explore-group-title" data-i18n="homeExploreGroupPeople">Люди</h3>
              <ul class="home-explore-links">
                <li><a href="team.html" data-i18n="navKomanda">Команда</a></li>
                <li><a href="reviews.html#otzyvy" data-i18n="navReviews">Отзывы</a></li>
              </ul>
            </div>
            <div class="home-explore-group reveal" data-reveal>
              <h3 class="home-explore-group-title" data-i18n="homeExploreGroupFaq">Справка</h3>
              <ul class="home-explore-links">
                <li><a href="faq.html" data-i18n="navFaq">Частые вопросы</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>`;

const railHome = `    <nav
      class="section-rail"
      data-section-rail
      aria-label="Разделы страницы"
      data-i18n-aria="sectionRailAria"
    >
      <a class="section-rail-dot" href="#preimushchestva" title="Преимущества"
        ><span class="visually-hidden" data-i18n="navPreim">Преимущества</span></a
      >
      <a class="section-rail-dot" href="#programmy" title="Программы"
        ><span class="visually-hidden" data-i18n="navProgram">Программы</span></a
      >
      <a class="section-rail-dot" href="#galerie" title="Галерея"
        ><span class="visually-hidden" data-i18n="navGalerie">Галерея</span></a
      >
      <a class="section-rail-dot" href="#tarife" title="Тарифы"
        ><span class="visually-hidden" data-i18n="navTarify">Тарифы</span></a
      >
      <a class="section-rail-dot" href="#home-explore" title="Ещё разделы"
        ><span class="visually-hidden" data-i18n="homeExploreRail">Ещё разделы</span></a
      >
      <a class="section-rail-dot" href="#cta-tour" title="Тур и связь"
        ><span class="visually-hidden" data-i18n="ctaBannerRail">Тур и связь</span></a
      >
      <a class="section-rail-dot" href="#zapis-trening" title="Запись в клуб"
        ><span class="visually-hidden" data-i18n="navSignup">Запись в клуб</span></a
      >
      <a class="section-rail-dot" href="#kontakt" title="Контакты"
        ><span class="visually-hidden" data-i18n="navKontakt">Контакты</span></a
      >
    </nav>`;

const railGalerie = `    <nav
      class="section-rail"
      data-section-rail
      aria-label="Разделы страницы"
      data-i18n-aria="sectionRailAria"
    >
      <a class="section-rail-dot" href="#galerie" title="Галерея"
        ><span class="visually-hidden" data-i18n="navGalerie">Галерея</span></a
      >
      <a class="section-rail-dot" href="#club-building" title="Вход"
        ><span class="visually-hidden" data-i18n="homeExploreBuilding">Вход в клуб</span></a
      >
    </nav>`;

const railReviews = `    <nav
      class="section-rail"
      data-section-rail
      aria-label="Разделы страницы"
      data-i18n-aria="sectionRailAria"
    >
      <a class="section-rail-dot" href="#otzyvy" title="Отзывы"
        ><span class="visually-hidden" data-i18n="navReviews">Отзывы</span></a
      >
      <a class="section-rail-dot" href="#social" title="Соцсети"
        ><span class="visually-hidden" data-i18n="socialEyebrow">Соцсети</span></a
      >
    </nav>`;

const railTraining = `    <nav
      class="section-rail"
      data-section-rail
      aria-label="Разделы страницы"
      data-i18n-aria="sectionRailAria"
    >
      <a class="section-rail-dot" href="#fit-tools" title="Тренировка"
        ><span class="visually-hidden" data-i18n="navZapis">Тренировка</span></a
      >
      <a class="section-rail-dot" href="#cta-action" title="Действие"
        ><span class="visually-hidden" data-i18n="ctaActionTitle">Действие</span></a
      >
    </nav>`;

/* --- Build index main --- */
let heroBenefits = sliceLine(164, 325);
heroBenefits = heroBenefits
  .replace(/href="training\.html"/g, 'href="#programmy"')
  .replace(/href="#fit-tools"/g, 'href="#programmy"');

const programsBlock = fixHomeLinks(sliceLine(326, 425));

/** Галерея с главной монолитной страницы — сразу после программ. */
let galleryHome = sliceLine(935, 1364);
galleryHome = galleryHome.replace(
  /<span class="eyebrow-num" aria-hidden="true">07<\/span>/,
  '<span class="eyebrow-num" aria-hidden="true">03</span>'
);

/** Тарифы: в монолите уже 04 — на главной порядок: программы → галерея → тарифы. */
let fullPricingBlock = sliceLine(523, 680);

/** Баннер «тур / оставьте контакт» — на главной идёт перед формой записи. */
let ctaBanner = sliceLine(2044, 2081);
ctaBanner = ctaBanner.replace(
  '<section class="section cta-banner"',
  '<section class="section cta-banner" id="cta-tour"'
);

let zapis = sliceLine(1719, 1804);
zapis = zapis.replace(
  /<span class="eyebrow-num" aria-hidden="true">11<\/span>/,
  '<span class="eyebrow-num" aria-hidden="true">06</span>'
);

let kontaktOnly = sliceLine(2083, 2256);
kontaktOnly = kontaktOnly.replace(
  /<span class="eyebrow-num" aria-hidden="true">13<\/span>/,
  '<span class="eyebrow-num" aria-hidden="true">07</span>'
);

const indexMain =
  heroBenefits +
  "\n\n" +
  programsBlock +
  "\n\n" +
  galleryHome +
  "\n\n" +
  fullPricingBlock +
  "\n\n" +
  homeExplore +
  "\n\n" +
  ctaBanner +
  "\n\n" +
  zapis +
  "\n\n" +
  kontaktOnly;

const headerHomeHtml = headerBlock("#top", navHome);

const indexHtml =
  sliceLine(1, 85) +
  "\n" +
  headerHomeHtml +
  "\n" +
  "    <main id=\"main\">\n" +
  indexMain +
  "\n    </main>\n\n" +
  railHome +
  "\n\n" +
  sliceLine(2301, 2399) +
  "\n\n" +
  sliceLine(2401, 2411) +
  "\n\n" +
  sliceLine(2413, 2443);

const pages = [
  {
    file: "training.html",
    title: "SportFit — Тренировка и калории | Bad Hersfeld",
    slice: [427, 521],
    rail: railTraining,
    fabHref: "index.html#zapis-trening",
    footerBrandHref: "index.html",
  },
  {
    file: "tariffs.html",
    title: "SportFit — Тарифы | Bad Hersfeld",
    slice: [523, 680],
    rail: "",
    fabHref: "index.html#zapis-trening",
    footerBrandHref: "index.html",
  },
  {
    file: "zaly.html",
    title: "SportFit — Залы | Bad Hersfeld",
    slice: [682, 851],
    rail: "",
    fabHref: "index.html#zapis-trening",
    footerBrandHref: "index.html",
  },
  {
    file: "uslugi.html",
    title: "SportFit — Услуги | Bad Hersfeld",
    slice: [853, 933],
    rail: "",
    fabHref: "index.html#zapis-trening",
    footerBrandHref: "index.html",
  },
  {
    file: "galerie.html",
    title: "SportFit — Галерея | Bad Hersfeld",
    slice: [935, 1416],
    rail: railGalerie,
    fabHref: "index.html#zapis-trening",
    footerBrandHref: "index.html",
  },
  {
    file: "team.html",
    title: "SportFit — Команда | Bad Hersfeld",
    slice: [1418, 1492],
    rail: "",
    fabHref: "index.html#zapis-trening",
    footerBrandHref: "index.html",
  },
  {
    file: "reviews.html",
    title: "SportFit — Отзывы | Bad Hersfeld",
    slice: [1494, 1717],
    rail: railReviews,
    fabHref: "index.html#zapis-trening",
    footerBrandHref: "index.html",
  },
  {
    file: "faq.html",
    title: "SportFit — FAQ | Bad Hersfeld",
    slice: [1806, 2042],
    rail: "",
    fabHref: "index.html#zapis-trening",
    footerBrandHref: "index.html",
  },
];

fs.writeFileSync(indexPath, indexHtml, "utf8");

for (const p of pages) {
  let body = sliceLine(p.slice[0], p.slice[1]);
  body = fixCrossPageLinks(body);
  const hdr = headerBlock("index.html", navSub);
  const footerBlock = sliceLine(2301, 2399).replace(
    /href="#top"/g,
    'href="' + p.footerBrandHref + '"'
  );
  const fabBlock = sliceLine(2401, 2411).replace(
    /href="[^"]+"/,
    'href="' + p.fabHref + '"'
  );
  const out =
    sliceLine(1, 6) +
    "\n    <title>" +
    p.title +
    "</title>\n" +
    sliceLine(8, 85) +
    "\n" +
    hdr +
    "\n" +
    "    <main id=\"main\">\n" +
    body +
    "\n    </main>\n\n" +
    (p.rail ? p.rail + "\n\n" : "") +
    footerBlock +
    "\n\n" +
    fabBlock +
    "\n\n" +
    sliceLine(2413, 2443);
  fs.writeFileSync(path.join(root, p.file), out, "utf8");
}

console.log("split-site: wrote index.html +", pages.map((x) => x.file).join(", "));
