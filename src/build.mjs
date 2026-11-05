// Генератор статического сайта «Замандас 21»: node src/build.mjs → docs/
import { mkdirSync, writeFileSync, copyFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG } from './config.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, 'docs');
const LANGS = ['kk', 'ru', 'en'];
const PREFIX = { kk: '', ru: 'ru/', en: 'en/' };
const LANG_LABEL = { kk: 'ҚАЗ', ru: 'РУС', en: 'ENG' };
const HTML_LANG = { kk: 'kk', ru: 'ru', en: 'en' };

let LANG = 'kk';
const t = (kk, ru, en) => ({ kk, ru, en, toString() { return this[LANG] ?? this.ru; } });
const T = x => (x && typeof x === 'object' && 'ru' in x ? (x[LANG] ?? x.ru) : x ?? '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------------- Icons (24×24, stroke) ---------------- */
const ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.3"/>',
  star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8Z"/>',
  sprout: '<path d="M12 21v-9"/><path d="M12 12c0-4 2.8-6.5 7.5-6.5 0 4.2-2.8 6.5-7.5 6.5Z"/><path d="M12 14.5c0-3.2-2.3-5.2-6.5-5.2 0 3.4 2.3 5.2 6.5 5.2Z"/>',
  puzzle: '<path d="M10 4h4v2.2a1.8 1.8 0 1 0 3.6 0V4H20v6h-2.2a1.8 1.8 0 1 0 0 3.6H20V20h-6v-2.2a1.8 1.8 0 1 0-3.6 0V20H4v-6.4h2.2a1.8 1.8 0 1 0 0-3.6H4V4h6Z"/>',
  family: '<circle cx="7.5" cy="6.5" r="2.3"/><circle cx="16.5" cy="6.5" r="2.3"/><circle cx="12" cy="12.3" r="1.8"/><path d="M3.5 20v-4.5a4 4 0 0 1 8 0"/><path d="M12.5 15.5a4 4 0 0 1 8 0V20"/><path d="M9.5 20v-2a2.5 2.5 0 0 1 5 0v2"/>',
  chess: '<path d="M8 20h8"/><path d="M9 20c0-3 .5-5 1.5-7l-2-1.5L10 7l3-3 1.5 2c2 1.5 2.5 4 1.5 7-.5 1.5-.5 4-.5 7"/><circle cx="12.5" cy="8" r=".6"/>',
  music: '<path d="M9 18.5V6l10-2v12.5"/><circle cx="6.5" cy="18.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
  ball: '<circle cx="12" cy="12" r="8.5"/><path d="m12 7.5 3.5 2.6-1.3 4.1H9.8L8.5 10.1Z"/><path d="M12 3.5v4M15.5 10.1l4-1.3M14.2 14.2l2.4 3.6M9.8 14.2l-2.4 3.6M8.5 10.1l-4-1.3"/>',
  book: '<path d="M4 5.5A2 2 0 0 1 6 4h5v15H6a2 2 0 0 0-2 1.5Z"/><path d="M20 5.5A2 2 0 0 0 18 4h-5v15h5a2 2 0 0 1 2 1.5Z"/>',
  pin: '<path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  hand: '<path d="M7 11V5.8a1.5 1.5 0 0 1 3 0V10"/><path d="M10 9V4.5a1.5 1.5 0 0 1 3 0V10"/><path d="M13 9.5V5.8a1.5 1.5 0 0 1 3 0v6"/><path d="M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-4.6-2.2L4 15.3a1.6 1.6 0 0 1 2.4-2l.6.7"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h2M14 14h2M8 17h2"/>',
  megaphone: '<path d="M4 10v4h3l7 4V6L7 10Z"/><path d="M17.5 9a4 4 0 0 1 0 6"/><path d="M7 14l1.5 5h2.5l-1-4.5"/>',
  shield: '<path d="M12 3.5 19 6v5.5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6Z"/><path d="m9 12 2 2 4-4"/>',
  phone: '<path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z"/>',
  insta: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.3"/><path d="M15.5 14.3A4.5 4.5 0 0 1 21 18.5"/>',
  brain: '<path d="M9 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1.5V6a2.5 2.5 0 0 0-3-1.5Z"/><path d="M15 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1.5"/>',
  chat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5Z"/><path d="M8.5 9h7M8.5 12h4.5"/>',
  palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.4-1.3-1.6-1.3-2.9 0-1 .8-1.6 1.9-1.6h2.1a3.5 3.5 0 0 0 3.5-3.5c0-4-3.6-7.3-8-7.3Z"/><circle cx="8" cy="10" r="1"/><circle cx="11.5" cy="7.3" r="1"/><circle cx="15.5" cy="8.5" r="1"/>',
  needle: '<path d="M19.5 4.5 7 17"/><path d="M17 4.5h3v3"/><path d="M7 17c-1.5 1.5-3.5 2.5-3.5 2.5s1-2 2.5-3.5"/><path d="M14 4c-5 0-9 3-9 7"/>',
  laptop: '<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 19h18l-2-4H5Z"/>',
  hockey: '<path d="M6 3.5 13 16h6.5a1.5 1.5 0 0 1 0 3H12a1.5 1.5 0 0 1-1.3-.8L4 5"/><ellipse cx="6" cy="19" rx="2.5" ry="1.3"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11"/><path d="M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9c2 0 5.5 0 5.5-1.5S13.5 5.5 12 9Z"/>',
  building: '<path d="M4 20.5V6l8-3 8 3v14.5"/><path d="M2.5 20.5h19"/><path d="M8.5 9h1M14.5 9h1M8.5 12.5h1M14.5 12.5h1M10.5 20.5v-4h3v4"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M9 8.5h6M9 11h6M12 11v5.5"/>',
  doc: '<path d="M6.5 3.5h7l4 4v13h-11Z"/><path d="M13.5 3.5v4h4M9 12h6M9 15.5h6"/>',
  mask: '<path d="M4 5.5c5 1.5 11 1.5 16 0v6a8 8 0 0 1-16 0Z"/><path d="M8 10.5c.8-.6 1.7-.6 2.5 0M13.5 10.5c.8-.6 1.7-.6 2.5 0"/><path d="M9 14.5c1.8 1.5 4.2 1.5 6 0"/>',
  dombra: '<path d="M19.5 3.5 11 12"/><path d="M18 3l3 3"/><path d="M11 12a4.5 4.5 0 1 0-1.4 6.6c2-1.1 3-3.4 1.4-6.6Z"/><circle cx="7.6" cy="15.4" r="1"/>',
  robot: '<rect x="5" y="8" width="14" height="10" rx="3"/><path d="M12 4.5V8M9.5 12.5h0M14.5 12.5h0M9.5 15.5h5"/><circle cx="12" cy="4" r="1"/><circle cx="9.5" cy="12.5" r="1" fill="currentColor"/><circle cx="14.5" cy="12.5" r="1" fill="currentColor"/>',
  whatsapp: '<path d="M4.5 19.5 5.6 16a8 8 0 1 1 2.9 2.7Z"/><path d="M9.3 8.7c.3 2.8 2.4 5.2 5.3 5.8l1-1.2-1.8-1-.9.8a4 4 0 0 1-2-2l.8-.9-1-1.8Z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V7.5A1.5 1.5 0 0 1 5.5 6H10"/>',
};
const icon = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.star}</svg>`;

/* Ornament «қошқар мүйіз» (ram horns) */
const ORN_PATH = 'M100 186V118C100 82 70 64 46 76 24 87 26 118 48 124 64 128 74 112 64 102 58 96 50 100 52 106M100 118C100 82 130 64 154 76 176 87 174 118 152 124 136 128 126 112 136 102 142 96 150 100 148 106M100 118V60C100 40 84 26 68 32M100 60C100 40 116 26 132 32M100 14v18M86 22h28';
const ornament = (cls = '') => `<svg class="${cls}" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ORN_PATH}"/></svg>`;
const patternSvg = id => `<svg class="art__pattern" aria-hidden="true"><defs><pattern id="p${id}" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(8)"><path d="M35 62V42c0-11-9-16-16-12-6 3-6 12 0 14 5 1 8-4 5-7M35 42c0-11 9-16 16-12 6 3 6 12 0 14-5 1-8-4-5-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></pattern></defs><rect width="100%" height="100%" fill="url(#p${id})"/></svg>`;

let artId = 0;
const art = (ic, tone = 'sun', cap = '') => {
  artId++;
  return `<div class="art art--${tone}" role="img" aria-label="${esc(T(cap) || ic)}">${patternSvg(artId)}<span class="art__blob1"></span><span class="art__blob2"></span><span class="art__dot"></span><span class="art__icon">${icon(ic)}</span>${cap ? `<span class="art__cap">${esc(T(cap))}</span>` : ''}</div>`;
};

const logoImg = rel => `<img class="logo__img" src="${rel}assets/logo-128.png" srcset="${rel}assets/logo-128.png 2x, ${rel}assets/logo-256.png 3x" width="56" height="56" alt="" decoding="async">`;

/* ---------------- Shared copy ---------------- */
const UI = {
  brand: t('Замандас 21', 'Замандас 21', 'Zamandas 21'),
  brandSub: t('Отбасылық аула клубы', 'Семейный дворовый клуб', 'Family yard club'),
  enroll: t('Баланы жазу', 'Записать ребёнка', 'Enrol a child'),
  donate: t('Қорды қолдау', 'Поддержать фонд', 'Support us'),
  findClub: t('Жақын клубты табу', 'Найти клуб рядом', 'Find a club nearby'),
  partner: t('Серіктес болу', 'Стать партнёром', 'Become a partner'),
  volunteer: t('Ерікті болу', 'Стать волонтёром', 'Volunteer'),
  more: t('Толығырақ', 'Подробнее', 'Learn more'),
  menu: t('Мәзір', 'Меню', 'Menu'),
  skip: t('Мазмұнға өту', 'Перейти к содержанию', 'Skip to content'),
  home: t('Басты бет', 'Главная', 'Home'),
  photoSoon: t('Фото қордан', 'Фото от фонда', 'Photo from the fund'),
  copy: t('Көшіру', 'Копировать', 'Copy'),
  pending: t('қордан нақтыланады', 'уточняется у фонда', 'to be confirmed'),
  sources: t('Дереккөз', 'Источник', 'Source'),
  statsAsOf: t('Деректер', 'Данные на', 'Data as of'),
};

const NAV = [
  { slug: '', label: t('Басты бет', 'Главная', 'Home') },
  { slug: 'about/', label: t('Қор туралы', 'О фонде', 'About') },
  { slug: 'clubs/', label: t('Клубтар', 'О клубах', 'Clubs') },
  { slug: 'family/', label: t('Бақытты отбасы', 'Счастливая семья', 'Happy Family') },
  { slug: 'news/', label: t('Жаңалықтар', 'Новости', 'News') },
  { slug: 'charity/', label: t('Қайырымдылық', 'Благотворительность', 'Charity') },
];

const CLUBS = [
  { id: 'c1', name: t('Қошқарбаев клубы', 'Клуб на Кошкарбаева', 'Koshkarbayev St club'), addr: t('Қошқарбаев көшесі, 44', 'ул. Кошкарбаева, 44', '44 Koshkarbayev St'), q: 'Кошкарбаева 44', tone: 'sun', ic: 'home' },
  { id: 'c2', name: t('Абай клубы', 'Клуб на Абая', 'Abay Ave club'), addr: t('Абай даңғылы, 92/2', 'пр. Абая, 92/2', '92/2 Abay Ave'), q: 'проспект Абая 92/2', tone: 'terra', ic: 'music' },
  { id: 'c3', name: t('Құдайбердіұлы клубы', 'Клуб на Кудайбердыулы', 'Kudaiberdyuly Ave club'), addr: t('Құдайбердіұлы даңғылы, 28', 'пр. Кудайбердыулы, 28', '28 Kudaiberdyuly Ave'), q: 'Кудайбердыулы 28', tone: 'teal', ic: 'chess' },
  { id: 'c4', name: t('Шалкөде клубы', 'Клуб на Шалкоде', 'Shalkode St club'), addr: t('Шалкөде көшесі, 2', 'ул. Шалкоде, 2', '2 Shalkode St'), q: 'Шалкоде 2', tone: 'sun', ic: 'ball' },
  { id: 'c5', name: t('Сарыадыр клубы', 'Клуб на Сарыадыр', 'Saryadyr St club'), addr: t('Сарыадыр көшесі, 3', 'ул. Сарыадыр, 3', '3 Saryadyr St'), q: 'Сарыадыр 3', tone: 'terra', ic: 'palette' },
  { id: 'c6', name: t('Досмұхамедұлы клубы', 'Клуб на Досмухамедулы', 'Dosmukhameduly St club'), addr: t('Жаһанша Досмұхамедұлы көшесі, 2', 'ул. Жаханши Досмухамедулы, 2', '2 Zhakhansha Dosmukhameduly St'), q: 'Жаханши Досмухамедулы 2', tone: 'teal', ic: 'robot' },
  { id: 'c7', name: t('«Замандас» жастар коворкингі', 'Молодёжный коворкинг «Замандас»', '“Zamandas” youth coworking'), addr: t('Бөгенбай батыр даңғылы, 52 (кітапхана жанында)', 'пр. Богенбай батыра, 52 (при библиотеке)', '52 Bogenbay Batyr Ave (at the library)'), q: 'Богенбай батыра 52', tone: 'night', ic: 'laptop', youth: true },
];

const CIRCLES = {
  art: { title: t('Шығармашылық', 'Творчество', 'Creativity'), items: [t('Би', 'Танцы', 'Dance'), t('Брейк-данс', 'Брейк-данс', 'Breakdance'), t('Зумба', 'Зумба', 'Zumba'), t('Театр', 'Театр и актёрское мастерство', 'Theatre & acting'), t('Вокал', 'Вокал', 'Vocals'), t('Домбыра', 'Домбра', 'Dombra'), t('Гитара', 'Гитара', 'Guitar'), t('Арт-терапия', 'Арт-терапия', 'Art therapy'), t('Халық қолөнері', 'Народные ремёсла', 'Folk crafts')] },
  mind: { title: t('Зияткерлік және тілдер', 'Интеллект и языки', 'Mind & languages'), items: [t('Шахмат', 'Шахматы', 'Chess'), t('Тоғызқұмалақ', 'Тогызкумалак', 'Togyzkumalak'), t('Робототехника', 'Робототехника', 'Robotics'), t('Авиамодельдеу', 'Авиамоделирование', 'Model aircraft'), t('Ағылшын тілі', 'Английский', 'English'), t('Қазақ тілі', 'Казахский', 'Kazakh'), t('Шешендік өнер', 'Ораторское мастерство', 'Public speaking')] },
  sport: { title: t('Спорт', 'Спорт', 'Sport'), items: [t('Карате', 'Карате', 'Karate'), t('Қоян-қолтық ұрыс', 'Рукопашный бой', 'Hand-to-hand combat'), t('Джиу-джитсу', 'Джиу-джитсу', 'Jiu-jitsu'), t('Қазақ күресі', 'Қазақ күресі', 'Kazakh wrestling'), t('Футбол', 'Футбол', 'Football'), t('Хоккей', 'Хоккей', 'Hockey')] },
};

/* ---------------- Layout ---------------- */
function head(page) {
  const url = l => CONFIG.siteUrl + PREFIX[l] + page.slug;
  const alt = LANGS.map(l => `<link rel="alternate" hreflang="${HTML_LANG[l]}" href="${url(l)}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${url('kk')}">`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'NGO', name: 'ОФ «Замандас 21»', alternateName: 'Семейный дворовый клуб «Замандас»',
    url: CONFIG.siteUrl, logo: CONFIG.siteUrl + 'assets/logo-512.png', foundingDate: '2011', founder: { '@type': 'Person', name: 'Ляззат Алшинова' },
    areaServed: 'Astana, Kazakhstan', sameAs: [`https://www.instagram.com/${CONFIG.instagram}/`],
    location: CLUBS.map(c => ({ '@type': 'Place', name: c.name.ru, address: { '@type': 'PostalAddress', streetAddress: c.addr.ru, addressLocality: 'Астана', addressCountry: 'KZ' } })),
  };
  return `<!doctype html>
<html lang="${HTML_LANG[LANG]}">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(T(page.title))}</title>
<meta name="description" content="${esc(T(page.desc))}">
<link rel="canonical" href="${url(LANG)}">
${alt}
<meta property="og:type" content="website"><meta property="og:title" content="${esc(T(page.title))}"><meta property="og:description" content="${esc(T(page.desc))}"><meta property="og:url" content="${url(LANG)}"><meta property="og:locale" content="${{ kk: 'kk_KZ', ru: 'ru_RU', en: 'en_US' }[LANG]}">
<meta name="theme-color" content="#FFF6E5">
<link rel="icon" href="${page.rel}assets/favicon-32.png" sizes="32x32" type="image/png"><link rel="icon" href="${page.rel}assets/favicon-48.png" sizes="48x48" type="image/png"><link rel="apple-touch-icon" href="${page.rel}assets/apple-touch-icon.png">
<meta property="og:image" content="${CONFIG.siteUrl}assets/og-image.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Unbounded:wght@500;600;700;800&display=swap&subset=cyrillic-ext" rel="stylesheet">
<link rel="stylesheet" href="${page.rel}assets/styles.css">
${page.slug === '' ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : ''}
</head>`;
}

function header(page) {
  const href = (l, slug) => page.rel + PREFIX[l] + slug;
  return `<a class="skip" href="#main">${T(UI.skip)}</a>
<header class="header"><div class="wrap"><div class="header__bar">
  <a class="logo" href="${href(LANG, '')}" aria-label="${esc(T(UI.brand))} — ${esc(T(UI.home))}">${logoImg(page.rel)}<span class="logo__text">${T(UI.brand)}<small>${T(UI.brandSub)}</small></span></a>
  <nav class="nav" id="nav" aria-label="${esc(T(UI.menu))}">${NAV.map(n => `<a href="${href(LANG, n.slug)}"${n.slug === page.slug ? ' aria-current="page"' : ''}>${T(n.label)}</a>`).join('')}</nav>
  <div class="lang" role="group" aria-label="Language">${LANGS.map(l => `<a href="${href(l, page.slug)}" hreflang="${l}" lang="${l}"${l === LANG ? ' aria-current="true"' : ''}>${LANG_LABEL[l]}</a>`).join('')}</div>
  <button class="btn btn--sm header__cta" data-enroll>${T(UI.enroll)}</button>
  <button class="burger" aria-expanded="false" aria-controls="nav" aria-label="${esc(T(UI.menu))}"><span></span><span></span><span></span></button>
</div></div></header>`;
}

function footer(page) {
  const href = slug => page.rel + PREFIX[LANG] + slug;
  return `<footer class="footer"><div class="wrap">
  <div class="footer__grid">
    <div>
      <a class="logo" href="${href('')}">${logoImg(page.rel)}<span class="logo__text">${T(UI.brand)}<small>${T(UI.brandSub)}</small></span></a>
      <p style="margin-top:18px;max-width:30em">${T(t('2011 жылдан бері Астанада балаларға тегін үйірмелер мен ата-аналарға қолдау көрсетеміз.', 'С 2011 года — бесплатные кружки для детей и поддержка для родителей в Астане.', 'Since 2011: free activities for children and support for parents in Astana.'))}</p>
      <div class="actions"><button class="btn btn--sun btn--sm" data-enroll>${T(UI.enroll)}</button><a class="btn btn--ghost btn--sm" href="${href('charity/')}">${T(UI.donate)}</a></div>
    </div>
    <div><h2 class="footer__h">${T(t('Бөлімдер', 'Разделы', 'Sections'))}</h2><ul>${NAV.map(n => `<li><a href="${href(n.slug)}">${T(n.label)}</a></li>`).join('')}</ul></div>
    <div><h2 class="footer__h">${T(t('Байланыс', 'Контакты', 'Contacts'))}</h2><ul>
      <li><a href="https://www.instagram.com/${CONFIG.instagram}/" target="_blank" rel="noopener">Instagram @${CONFIG.instagram}</a></li>
      ${CONFIG.whatsapp ? `<li><a href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li>` : ''}
      <li>${T(t('Астана, Қазақстан', 'Астана, Казахстан', 'Astana, Kazakhstan'))}</li>
      <li><a href="${href('clubs/')}">${T(t('7 клубтың мекенжайы', 'Адреса 7 клубов', 'Addresses of 7 clubs'))}</a></li>
    </ul></div>
  </div>
  <div class="footer__bottom"><span>© 2011–2026 ${T(t('«Замандас 21» қоғамдық қоры', 'Общественный фонд «Замандас 21»', 'Zamandas 21 Public Foundation'))}</span><span>${T(t('Балалардың фотосуреттері тек ата-ананың жазбаша келісімімен жарияланады.', 'Фото детей публикуются только с письменного согласия родителей.', 'Children’s photos are published only with written parental consent.'))}</span></div>
</div></footer>
<div class="mcta"><button class="btn" data-enroll>${icon('hand')}${T(UI.enroll)}</button><a class="btn btn--ghost" href="${href('charity/')}" aria-label="${esc(T(UI.donate))}">${icon('heart')}</a></div>`;
}

function enrollModal() {
  const ages = Array.from({ length: 15 }, (_, i) => i + 3);
  return `<div class="modal" id="enroll" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="enroll-title">
  <div class="modal__bg" data-close></div>
  <div class="modal__card">
    <button class="modal__close" data-close aria-label="${esc(T(t('Жабу', 'Закрыть', 'Close')))}">×</button>
    <span class="kicker">${T(t('Тегін', 'Бесплатно', 'Free'))} · 3 ${T(t('өріс', 'поля', 'fields'))}</span>
    <h2 id="enroll-title">${T(UI.enroll)}</h2>
    <p class="muted" style="font-size:15px">${T(t('Клуб әкімшісі сізге хабарласып, үйірме мен сабақ уақытын таңдауға көмектеседі.', 'Администратор клуба свяжется с вами и поможет выбрать кружок и время занятий.', 'A club administrator will contact you to help choose an activity and a time.'))}</p>
    <form class="form" id="enroll-form" novalidate>
      <div class="field"><label for="f-name">${T(t('Атыңыз', 'Ваше имя', 'Your name'))}</label><input id="f-name" name="name" autocomplete="name" required></div>
      <div class="row2">
        <div class="field"><label for="f-phone">${T(t('Телефон', 'Телефон', 'Phone'))}</label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 7__ ___ __ __" required></div>
        <div class="field"><label for="f-age">${T(t('Баланың жасы', 'Возраст ребёнка', 'Child’s age'))}</label><select id="f-age" name="age" required><option value="">—</option>${ages.map(a => `<option>${a}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label for="f-club">${T(t('Клуб', 'Клуб', 'Club'))} <small>(${T(t('міндетті емес', 'необязательно', 'optional'))})</small></label><select id="f-club" name="club"><option value="">${T(t('Кез келген / жақын', 'Любой / ближайший', 'Any / nearest'))}</option>${CLUBS.map(c => `<option value="${esc(T(c.addr))}">${esc(T(c.addr))}</option>`).join('')}</select></div>
      <div class="field"><label for="f-circle">${T(t('Қандай үйірме қызық', 'Какой кружок интересен', 'Which activity interests you'))} <small>(${T(t('міндетті емес', 'необязательно', 'optional'))})</small></label><input id="f-circle" name="circle" list="circles"><datalist id="circles">${Object.values(CIRCLES).flatMap(g => g.items).map(i => `<option value="${esc(T(i))}">`).join('')}</datalist></div>
      <label class="consent"><input type="checkbox" name="consent" required><span>${T(t('«Дербес деректер және оларды қорғау туралы» ҚР Заңына сәйкес деректерімді өңдеуге келісемін.', 'Согласен(на) на обработку персональных данных по Закону РК «О персональных данных и их защите».', 'I consent to the processing of my personal data under the Law of the Republic of Kazakhstan on Personal Data.'))}</span></label>
      <div class="form__msg" role="status" aria-live="polite"></div>
      <button class="btn" type="submit">${T(t('Өтінім жіберу', 'Отправить заявку', 'Send request'))}${icon('arrow')}</button>
    </form>
  </div>
</div>`;
}

function scripts(page) {
  const i18n = {
    required: T(t('Атыңызды, телефонды және баланың жасын толтырыңыз.', 'Заполните имя, телефон и возраст ребёнка.', 'Please fill in your name, phone and the child’s age.')),
    consent: T(t('Деректерді өңдеуге келісім қажет.', 'Нужно согласие на обработку данных.', 'Consent to data processing is required.')),
    ok: T(t('Өтінім жіберілді. Клуб әкімшісі 2 жұмыс күні ішінде хабарласып, сабақ уақытын таңдауға көмектеседі.', 'Заявка отправлена. Администратор клуба позвонит вам в течение 2 рабочих дней и подберёт время занятий.', 'Request sent. A club administrator will call you within 2 working days to pick a time.')),
    okWa: T(t('WhatsApp ашылды — хабарламаны жіберіңіз. Әкімші хабарласып, сабақ уақытын таңдауға көмектеседі.', 'Открылся WhatsApp — отправьте сообщение. Администратор свяжется с вами и подберёт время занятий.', 'WhatsApp has opened — just send the message. An administrator will get back to you.')),
    okIg: T(t('Өтінім мәтіні көшірілді. Instagram Direct ашылды — мәтінді қойып, жіберіңіз.', 'Текст заявки скопирован. Открылся Instagram Direct — вставьте текст и отправьте.', 'Your request text is copied. Instagram Direct has opened — paste it and send.')),
    err: T(t('Өтінім жіберілмеді. Интернетті тексеріп, қайталап көріңіз немесе Instagram-ға жазыңыз.', 'Не удалось отправить заявку. Проверьте интернет и попробуйте ещё раз или напишите нам в Instagram.', 'Could not send the request. Check your connection and try again, or message us on Instagram.')),
    msgHead: T(t('Сәлеметсіз бе! Баланы «Замандас» клубына жазғым келеді.', 'Здравствуйте! Хочу записать ребёнка в клуб «Замандас».', 'Hello! I would like to enrol my child at Zamandas club.')),
    fName: T(t('Аты', 'Имя', 'Name')), fPhone: T(t('Телефон', 'Телефон', 'Phone')), fAge: T(t('Баланың жасы', 'Возраст ребёнка', 'Child’s age')), fClub: T(t('Клуб', 'Клуб', 'Club')), fCircle: T(t('Үйірме', 'Кружок', 'Activity')),
    copied: T(t('Көшірілді ✓', 'Скопировано ✓', 'Copied ✓')),
  };
  return `<script>window.ZAMANDAS=${JSON.stringify({ whatsapp: CONFIG.whatsapp, instagram: CONFIG.instagram, formEndpoint: CONFIG.formEndpoint, i18n })};</script>
<script src="${page.rel}assets/app.js" defer></script>`;
}

const pageHero = (page, { kicker, title, lead, tone = '' }) => `<section class="phero"><div class="wrap"><div class="phero__box ${tone} reveal">
  ${ornament('phero__orn')}
  <div class="crumbs"><a href="${page.rel + PREFIX[LANG]}">${T(UI.home)}</a><span aria-hidden="true">/</span><span>${T(kicker)}</span></div>
  <h1>${T(title)}</h1>
  <p class="phero__lead">${T(lead)}</p>
</div></div></section>`;

const feature = (n, { id, ic, tone, cap, kicker, title, body }) => `<article class="feature reveal"${id ? ` id="${id}"` : ''}>
  <div class="feature__media"><span class="feature__num" aria-hidden="true">${String(n).padStart(2, '0')}</span>${art(ic, tone, cap || UI.photoSoon)}</div>
  <div class="feature__body">${kicker ? `<span class="kicker">${T(kicker)}</span>` : ''}<h2>${T(title)}</h2>${T(body)}</div>
</article>`;

const callout = (page, { title, text, tone = '' }) => `<section class="section section--tight"><div class="wrap"><div class="callout ${tone} reveal">${ornament('callout__orn')}
  <div><h2>${T(title)}</h2><p>${T(text)}</p></div>
  <div class="actions"><button class="btn ${tone ? 'btn--sun' : ''}" data-enroll>${T(UI.enroll)}</button><a class="btn btn--ghost" href="${page.rel + PREFIX[LANG]}charity/">${T(UI.donate)}</a></div>
</div></div></section>`;

const chips = (items, cls = '') => `<ul class="chips">${items.map(i => `<li class="chip ${cls}">${esc(T(i))}</li>`).join('')}</ul>`;
const ticks = items => `<ul class="ticks">${items.map(i => `<li>${T(i)}</li>`).join('')}</ul>`;

/* ================= PAGES ================= */
const PAGES = [];

/* ---------- ГЛАВНАЯ ---------- */
PAGES.push({
  slug: '',
  title: t('Замандас 21 — Астанадағы балаларға тегін үйірмелер | Отбасылық аула клубы', 'Замандас 21 — бесплатные кружки для детей в Астане | Семейный дворовый клуб', 'Zamandas 21 — free activities for children in Astana | Family yard club'),
  desc: t('Астанадағы 7 отбасылық клуб: 22 үйірме, психолог және ата-аналарға курстар. Көпбалалы және толық емес отбасылардың балаларына тегін. Онлайн жазылыңыз.', '7 семейных клубов в Астане: 22 кружка, психолог и курсы для родителей. Бесплатно для детей из многодетных и неполных семей. Запишитесь онлайн.', '7 family clubs in Astana: 22 activities, a psychologist and courses for parents. Free for children from large and single-parent families. Enrol online.'),
  render: page => {
    const r = page.rel + PREFIX[LANG];
    const all = Object.values(CIRCLES).flatMap(g => g.items).map(T);
    return `
<section class="hero"><div class="wrap hero__grid">
  <div>
    <span class="eyebrow reveal" style="--d:0"><i></i>${T(t('2011 жылдан бері · Астана', 'С 2011 года · Астана', 'Since 2011 · Astana'))}</span>
    <h1 class="reveal" style="--d:1">${T(t('Бүкіл отбасы <span class="mark">өсетін</span> аула', 'Двор, где растёт <span class="mark">вся семья</span>', 'A yard where the <span class="mark">whole family</span> grows'))}</h1>
    <p class="hero__lead reveal" style="--d:2">${T(t('Астанадағы 7 клубта балаларға <strong>тегін үйірмелер</strong> және ата-аналарға қолдау — жыл бойы, жазда да.', '<strong>Бесплатные кружки</strong> для детей и поддержка для родителей в 7 клубах Астаны — круглый год, даже летом.', '<strong>Free activities</strong> for children and support for parents in 7 clubs across Astana — all year round, even in summer.'))}</p>
    <div class="hero__actions reveal" style="--d:3">
      <button class="btn" data-enroll>${icon('hand')}${T(UI.enroll)}</button>
      <a class="btn btn--ghost" href="${r}clubs/">${icon('pin')}${T(UI.findClub)}</a>
    </div>
    <p class="hero__note reveal" style="--d:4">${icon('shield')}<span>${T(t('Көпбалалы, толық емес және аз қамтылған отбасылардың, мүгедектігі бар балалар мен ата-ана қамқорлығынсыз қалған балалар үшін тегін.', 'Бесплатно для детей из многодетных, неполных и малообеспеченных семей, детей с инвалидностью и детей без попечения родителей.', 'Free for children from large, single-parent and low-income families, children with disabilities and children without parental care.'))}</span></p>
  </div>
  <div class="collage reveal" style="--d:2" aria-hidden="true">
    <div class="tile t1">${art('family', 'sun')}</div>
    <div class="tile t2">${art('music', 'teal')}</div>
    <div class="tile t3">${art('ball', 'terra')}</div>
    <div class="sticker sticker--free"><svg class="ring" viewBox="0 0 128 128"><defs><path id="circ" d="M64 64m-52 0a52 52 0 1 1 104 0a52 52 0 1 1-104 0"/></defs><text><textPath href="#circ">тегін · бесплатно · free · тегін · бесплатно · free ·</textPath></text></svg><div><b>0 ₸</b><span>${T(t('сабақ', 'занятия', 'classes'))}</span></div></div>
    <div class="sticker sticker--years"><b>15</b>${T(t('жыл<br>есігіміз ашық', 'лет<br>двери открыты', 'years<br>doors open'))}</div>
  </div>
</div></section>

<div class="marquee-wrap"><div class="marquee" aria-hidden="true"><div class="marquee__track">${[...all, ...all].map(x => `<span>${esc(x)}</span>`).join('')}</div></div></div>

<section class="section band" style="margin-top:70px"><div class="wrap">
  <div class="section__head" style="margin-bottom:0"><span class="kicker" style="color:var(--sun)">${T(t('Сандармен', 'В цифрах', 'In numbers'))}</span><h2>${T(t('15 жыл бойы Астана балаларына есігіміз ашық', '15 лет открываем двери детям Астаны', '15 years of open doors for Astana’s children'))}</h2></div>
  <div class="stats">
    <div class="stat reveal"><b data-count="15">15</b><span>${T(t('жыл жұмыс (2011 жылдан)', 'лет работы (с 2011 года)', 'years of work (since 2011)'))}</span></div>
    <div class="stat reveal"><b data-count="5000" data-pre="≈">${LANG === 'en' ? '≈5,000' : '≈5 000'}</b><span>${T(t('тәрбиеленуші', 'воспитанников', 'children'))}</span></div>
    <div class="stat reveal"><b data-count="7">7</b><span>${T(t('қаладағы клуб', 'клубов в городе', 'clubs in the city'))}</span></div>
    <div class="stat reveal"><b data-count="22">22</b><span>${T(t('үйірме мен секция', 'кружка и секции', 'activities & sections'))}</span></div>
    <div class="stat reveal"><b>0 ₸</b><span>${T(t('осал отбасылардың балаларына', 'для детей из уязвимых семей', 'for children from vulnerable families'))}</span></div>
  </div>
  <p class="band__foot">${T(UI.statsAsOf)}: ${CONFIG.statsDate[LANG]}</p>
</div></section>

<section class="section"><div class="wrap">
  <div class="section__head center reveal"><span class="kicker">${T(t('Жоба туралы', 'О проекте', 'About the project'))}</span><h2>${T(t('Бала мен ата-ана бірге өсетін орын', 'Место, где ребёнок и родители растут вместе', 'A place where children and parents grow together'))}</h2></div>
  <div class="features">
  ${feature(1, { ic: 'home', tone: 'sun', kicker: t('Негізгі ақпарат', 'Основная информация', 'Key facts'), title: t('Аула клубы — үйдің жанында', 'Дворовый клуб — рядом с домом', 'A yard club next door'),
    body: t(
      '<p class="lead">«Замандас 21» — Астанадағы отбасылық аула клубтарының желісі. Бірінші клуб 2011 жылы Абылай хан көшесіндегі жертөледе 5 үйірмемен және 100-ге жуық баламен ашылды.</p><p>Бүгін бізде 7 клуб, 22 үйірме және 5 000-ға жуық тәрбиеленуші бар. Сабақтар жыл бойы, жазда да өтеді. Қордың директоры және аула клубтары идеясының авторы — Ләззат Алшынова.</p>',
      '<p class="lead">«Замандас 21» — сеть семейных дворовых клубов в Астане. Первый клуб открылся в 2011 году в подвале на улице Абылай хана: 5 кружков и около 100 детей.</p><p>Сегодня это 7 клубов, 22 кружка и почти 5 000 воспитанников. Занятия идут круглый год, включая лето. Директор фонда и автор идеи семейных дворовых клубов — Ляззат Алшинова.</p>',
      '<p class="lead">Zamandas 21 is a network of family yard clubs in Astana. The first club opened in 2011 in a basement on Abylai Khan Street, with 5 activities and about 100 children.</p><p>Today there are 7 clubs, 22 activities and almost 5,000 children. Classes run all year round, including summer. The founder of the family yard club idea and director of the foundation is Lyazzat Alshinova.</p>') + `<a class="link-arrow" href="${r}about/">${T(UI.more)}</a>` })}
  ${feature(2, { ic: 'target', tone: 'terra', kicker: t('Мақсаттар мен міндеттер', 'Цели и задачи', 'Goals and objectives'), title: t('Әр балаға мүмкіндік беру', 'Дать шанс каждому ребёнку', 'A chance for every child'),
    body: ticks([
      t('<strong>Қолжетімді даму.</strong> Осал отбасылардың балаларына сапалы үйірмелерді тегін ұсыну.', '<strong>Доступное развитие.</strong> Дать детям из уязвимых семей качественные кружки бесплатно.', '<strong>Accessible development.</strong> Quality activities free of charge for children from vulnerable families.'),
      t('<strong>Отбасын нығайту.</strong> Ата-аналарға психологиялық қолдау, курстар мен тренингтер.', '<strong>Крепкая семья.</strong> Психологическая поддержка, курсы и тренинги для родителей.', '<strong>Strong families.</strong> Psychological support, courses and training for parents.'),
      t('<strong>Қауіпсіз орта.</strong> Бала мектептен кейін көшеде емес, қамқор ересектердің қасында болады.', '<strong>Безопасная среда.</strong> После школы ребёнок не на улице, а рядом с заботливыми взрослыми.', '<strong>A safe place.</strong> After school, children are with caring adults rather than on the street.'),
      t('<strong>Жастарды қолдау.</strong> 14–35 жастағыларға коворкинг, тренингтер және психолог.', '<strong>Поддержка молодёжи.</strong> Коворкинг, тренинги и психолог для 14–35 лет.', '<strong>Youth support.</strong> Coworking, training and a psychologist for ages 14–35.'),
    ]) })}
  ${feature(3, { ic: 'heart', tone: 'teal', kicker: t('Миссия', 'Миссия', 'Mission'), title: t('Отбасымен бірге баланың болашағын құру', 'Строить будущее ребёнка вместе с семьёй', 'Building a child’s future together with the family'),
    body: t('<p class="quote">Әр бала үйінің жанында дамуға, дос табуға және өзіне сенуге мүмкіндік алуы керек.</p>', '<p class="quote">Каждый ребёнок должен иметь возможность развиваться, находить друзей и верить в себя — прямо у себя во дворе.</p>', '<p class="quote">Every child deserves a chance to grow, make friends and believe in themselves — right in their own yard.</p>') +
      `<div class="principles">${[
        [t('Қолжетімділік', 'Доступность', 'Accessibility'), t('ақшаға тәуелсіз', 'без барьера денег', 'no money barrier')],
        [t('Еріктілік', 'Добровольность', 'Voluntariness'), t('бала өзі таңдайды', 'ребёнок выбирает сам', 'the child chooses')],
        [t('Сенім', 'Доверие', 'Trust'), t('отбасымен ашық қарым-қатынас', 'открыто с семьёй', 'open with families')],
        [t('Мейірімділік', 'Доброжелательность', 'Kindness'), t('әркімге жылы шырай', 'тепло к каждому', 'warmth for everyone')],
      ].map(([a, b]) => `<div class="principle"><b>${T(a)}</b><span>${T(b)}</span></div>`).join('')}</div>` })}
  ${feature(4, { ic: 'puzzle', tone: 'sun', kicker: t('Жұмыс түрлері', 'Формы работы', 'How we work'), title: t('Балаларға да, ересектерге де', 'Для детей и для взрослых', 'For children and adults'),
    body: ticks([
      t('<strong>Үйірмелер мен секциялар</strong> — шығармашылық, зияткерлік, тілдер, спорт.', '<strong>Кружки и секции</strong> — творчество, интеллект, языки, спорт.', '<strong>Activities and sections</strong> — arts, mind games, languages, sport.'),
      t('<strong>Психологиялық қызмет</strong> — балаларға, жасөспірімдерге және ата-аналарға, анонимді түрде де.', '<strong>Психологическая служба</strong> — для детей, подростков и родителей, в том числе анонимно.', '<strong>Psychological service</strong> — for children, teens and parents, including anonymously.'),
      t('<strong>«Бақытты отбасы» клубы</strong> — диагностика, семинарлар, тәрбие курстары.', '<strong>Клуб «Счастливая семья»</strong> — диагностика, семинары, курсы о воспитании.', '<strong>“Happy Family” club</strong> — assessment, seminars, parenting courses.'),
      t('<strong>Аналарға мамандық</strong> — тігін, аспаздық және тағы 7 мамандық.', '<strong>Профессии для мам</strong> — шитьё, кулинария и ещё 7 профессий.', '<strong>Skills for mothers</strong> — sewing, cooking and 7 more professions.'),
      t('<strong>Жобалар</strong> — аула хоккей лигасы, буллингке қарсы, жастар коворкингі.', '<strong>Проекты</strong> — дворовая хоккейная лига, против буллинга, молодёжный коворкинг.', '<strong>Projects</strong> — yard hockey league, anti-bullying, youth coworking.'),
    ]) })}
  ${feature(5, { ic: 'star', tone: 'terra', kicker: t('Жобаның бірегейлігі', 'Уникальность проекта', 'What makes us unique'), title: t('Біз тек баламен емес, бүкіл отбасымен жұмыс істейміз', 'Мы работаем не только с ребёнком, а со всей семьёй', 'We work with the whole family, not just the child'),
    body: t('<p class="lead">Бала үйірмеде жүргенде, ата-анасы психологпен сөйлесе алады, тренингке қатыса алады немесе жаңа мамандық үйрене алады.</p>', '<p class="lead">Пока ребёнок на кружке, мама или папа могут поговорить с психологом, прийти на тренинг или освоить новую профессию.</p>', '<p class="lead">While a child is at an activity, their parent can talk to a psychologist, join a training session or learn a new profession.</p>') +
      `<div class="kpis">${[
        ['0 ₸', t('осал отбасыларға', 'для уязвимых семей', 'for vulnerable families')],
        ['365', t('жыл бойы, жазда да', 'дней в году, и летом', 'days a year, summer too')],
        ['7', t('клуб — үйдің жанында', 'клубов у дома', 'clubs near home')],
        ['15', t('жыл тәжірибе', 'лет опыта', 'years of experience')],
      ].map(([a, b]) => `<div class="kpi"><b>${a}</b><span>${T(b)}</span></div>`).join('')}</div>` })}
  </div>
</div></section>

<section class="section section--tight"><div class="wrap">
  <div class="section__head reveal"><span class="kicker">${T(t('Үйірмелер', 'Кружки', 'Activities'))}</span><h2>${T(t('22 үйірме: әр балаға өз ісі', '22 кружка: у каждого ребёнка своё', '22 activities: something for every child'))}</h2></div>
  <div class="grid grid--3">
    ${[['art', 'palette', 'sun'], ['mind', 'chess', 'teal'], ['sport', 'ball', 'terra']].map(([k, ic, tone]) => `<article class="card reveal">${art(ic, tone)}<div class="card__body"><h3>${T(CIRCLES[k].title)}</h3>${chips(CIRCLES[k].items, 'chip--' + tone)}</div></article>`).join('')}
  </div>
</div></section>

${callout(page, { title: t('Балаңызды бүгін жазыңыз', 'Запишите ребёнка уже сегодня', 'Enrol your child today'), text: t('Өтінім 1 минут алады. Клуб әкімшісі хабарласып, жақын клуб пен ыңғайлы уақытты таңдайды.', 'Заявка занимает минуту. Администратор перезвонит и подберёт ближайший клуб и удобное время.', 'It takes a minute. An administrator will call back and pick the nearest club and a convenient time.') })}
`;
  },
});

/* ---------- О ФОНДЕ ---------- */
PAGES.push({
  slug: 'about/',
  title: t('Қор туралы — «Замандас 21»', 'О фонде — «Замандас 21»', 'About the foundation — Zamandas 21'),
  desc: t('«Замандас 21» қорының басшысы, педагогтары, тарихы, жүзеге асырылған жобалары, көрсеткіштері мен серіктестері.', 'Руководитель и педагоги, история 2011–2026, реализованные проекты, показатели и партнёры фонда «Замандас 21».', 'Leadership and teachers, history 2011–2026, projects, key figures and partners of Zamandas 21.'),
  render: page => `
${pageHero(page, { kicker: t('Қор туралы', 'О фонде', 'About'), title: t('15 жыл — бір ауладан бастап', '15 лет — начиная с одного двора', '15 years — starting from one yard'), lead: t('2011 жылы жертөледегі бір клубтан басталған іс бүгін Астанадағы 7 клубқа және 5 000-ға жуық балаға айналды.', 'Начиналось с одного клуба в подвале в 2011 году. Сегодня — 7 клубов в Астане и почти 5 000 воспитанников.', 'It began with one basement club in 2011. Today: 7 clubs in Astana and almost 5,000 children.') })}
<section class="section section--tight"><div class="wrap"><div class="features">
  ${feature(1, { ic: 'people', tone: 'sun', kicker: t('Басшы және педагогтар', 'Руководитель и педагоги', 'Leadership and teachers'), title: t('Ләззат Алшынова', 'Ляззат Алшинова', 'Lyazzat Alshinova'),
    body: t('<p class="lead">Қор директоры және отбасылық аула клубтары идеясының авторы.</p><p>Біздің педагогтар — бапкерлер, музыканттар, ұстаздар және психологтар. Олардың көбі еріктілер ретінде бастады: ағылшын тілі мұғалімі де алдымен ерікті болған, ал тағы бір ерікті — тіл тасушы — балалармен аптасына екі рет айналысады.</p>', '<p class="lead">Директор фонда и автор идеи семейных дворовых клубов.</p><p>Наши педагоги — тренеры, музыканты, учителя и психологи. Многие начинали волонтёрами: преподаватель английского пришла в клуб как волонтёр, а ещё один волонтёр — носитель языка — занимается с детьми дважды в неделю.</p>', '<p class="lead">Director of the foundation and author of the family yard club idea.</p><p>Our teachers are coaches, musicians, educators and psychologists. Many started as volunteers: our English teacher first came as a volunteer, and a native-speaker volunteer works with the children twice a week.</p>') +
      `<div class="actions"><a class="btn btn--teal" href="${CONFIG.teachersDoc}" target="_blank" rel="noopener">${icon('doc')}${T(t('Педагогтар тізімі', 'Список педагогов', 'List of teachers'))}</a></div>` })}
  ${feature(2, { ic: 'calendar', tone: 'terra', kicker: t('Тарих', 'История', 'History'), title: t('2011-ден 2026-ға дейін', 'От 2011 до 2026', 'From 2011 to 2026'),
    body: `<ol class="timeline">${[
      ['2011', t('Абылай хан көшесіндегі жертөледе «Бота» қорының қатысуымен алғашқы клуб: 5 үйірме, 100-ге жуық бала.', 'Первый клуб в подвале на Абылай хана, открыт при участии фонда «Бота». 5 кружков, около 100 детей.', 'First club in a basement on Abylai Khan St, opened with the Bota Foundation. 5 activities, about 100 children.')],
      ['2018', t('Samruk-Kazyna Trust серіктес болды; бірге Отбасы күніне қалалық мереке өткіздік.', 'Samruk-Kazyna Trust — партнёр фонда; вместе проводим городской праздник ко Дню семьи.', 'Samruk-Kazyna Trust becomes a partner; together we hold a city Family Day festival.')],
      ['2021', t('5 клуб, 2 500-ге жуық бала, 30+ үйірме. Карантинде сабақтар онлайн өтті.', '5 клубов, около 2 500 детей, 30+ кружков. В карантин занятия перешли в онлайн.', '5 clubs, about 2,500 children, 30+ activities. Classes moved online during lockdown.')],
      ['2024', t('6 клуб, 3 000+ бала. Қыркүйекте 14–35 жастағыларға жастар коворкингі ашылды.', '6 клубов, 3 000+ детей. В сентябре открыт молодёжный коворкинг для 14–35 лет.', '6 clubs, 3,000+ children. In September a youth coworking space for ages 14–35 opened.')],
      ['2025', t('7 клуб, 3 500+ бала. Негізгі демеуші қаржыландыруды тоқтатты; бірнеше ай клубтар педагогтар мен еріктілердің арқасында жұмыс істеді.', '7 клубов, 3 500+ детей. Основной спонсор прекратил финансирование — несколько месяцев клубы держались на педагогах и волонтёрах.', '7 clubs, 3,500+ children. The main sponsor ended funding; for months the clubs were kept going by teachers and volunteers.')],
      ['2026', t('15 жыл, 5 000-ға жуық тәрбиеленуші, 22 үйірме.', '15 лет работы, почти 5 000 воспитанников, 22 кружка.', '15 years, almost 5,000 children, 22 activities.')],
    ].map(([y, e]) => `<li><span class="yr">${y}</span><div class="ev">${T(e)}</div></li>`).join('')}</ol>` })}
  ${feature(3, { ic: 'sprout', tone: 'teal', kicker: t('Жүзеге асырылған жобалар', 'Реализованные проекты', 'Completed projects'), title: t('Кружоктардан да көп', 'Больше, чем кружки', 'More than activities'),
    body: ticks([
      t('<strong>Жастар коворкингі</strong> — 2024 жылдан 14–35 жастағыларға тегін кеңістік: тренингтер, шешендік клубтар, коучинг, психолог.', '<strong>Молодёжный коворкинг</strong> — с 2024 года бесплатное пространство для 14–35 лет: тренинги, ораторские клубы, коучинг, психолог.', '<strong>Youth coworking</strong> — since 2024, a free space for ages 14–35: training, speaking clubs, coaching, a psychologist.'),
      t('<strong>Мектептердегі буллингке қарсы</strong> — Чехия Елшілігімен: Қазақстан бойынша 90 психолог оқытылды, 4 мектепте жұмыс.', '<strong>Против буллинга в школах</strong> — с Посольством Чехии: онлайн обучены 90 психологов со всего Казахстана, работа в 4 школах.', '<strong>Anti-bullying in schools</strong> — with the Czech Embassy: 90 psychologists from across Kazakhstan trained online, work in 4 schools.'),
      t('<strong>Аула хоккей лигасы</strong> — 9 жыл; грант бойынша 100 бала жабдықталды, матчтар №32 мектеп ауласындағы мұз айдынында.', '<strong>Дворовая хоккейная лига</strong> — 9 лет; по гранту экипированы 100 детей, матчи на катке во дворе школы № 32.', '<strong>Yard hockey league</strong> — 9 years; 100 children equipped through a grant, matches at the rink of School No. 32.'),
      t('<strong>Әйелдерге мамандық</strong> — АҚҚО-мен бірге 9 мамандыққа оқыту; түлектердің бір бөлігі өз ісін ашты.', '<strong>Профессии для женщин</strong> — с ЦПГИ обучение 9 профессиям; часть выпускниц открыли своё дело.', '<strong>Skills for women</strong> — training in 9 professions with the Civic Initiatives Support Centre; some graduates started businesses.'),
    ]) })}
  ${feature(4, { ic: 'star', tone: 'sun', kicker: t('Негізгі көрсеткіштер', 'Основные показатели', 'Key figures'), title: t('Нәтижелер сандармен', 'Результаты в цифрах', 'Results in numbers'),
    body: `<div class="kpis">${[
      [LANG === 'en' ? '≈5,000' : '≈5 000', t('тәрбиеленуші', 'воспитанников', 'children')], ['7', t('клуб', 'клубов', 'clubs')],
      ['22', t('үйірме', 'кружка', 'activities')], ['90', t('психолог оқытылды', 'психологов обучено', 'psychologists trained')],
      ['100', t('хоккейші жабдықталды', 'хоккеистов экипировано', 'hockey players equipped')], ['9', t('мамандық аналарға', 'профессий для мам', 'professions for mothers')],
    ].map(([a, b]) => `<div class="kpi"><b>${a}</b><span>${T(b)}</span></div>`).join('')}</div>` +
      t('<p>Түлектер арасында карате, қоян-қолтық ұрыс және дзюдодан әлем турнирлерінің чемпиондары мен спорт шеберлері бар. Тәрбиеленушілер «Жамбыл. Жаңа дәуір» және «Селфи с предками» фильмдеріне түсті.</p>', '<p>Среди выпускников — чемпионы мировых турниров и мастера спорта по карате, рукопашному бою и дзюдо. Воспитанники снимались в фильмах «Жамбыл. Жаңа дәуір» и «Селфи с предками», играли в спектакле «Алтын елке аңызы».</p>', '<p>Graduates include world tournament champions and masters of sport in karate, hand-to-hand combat and judo. Our children have acted in the films “Zhambyl. Zhana dauir” and “Selfie with Ancestors”.</p>') +
      `<p class="muted" style="font-size:14px">${T(UI.statsAsOf)}: ${CONFIG.statsDate[LANG]}</p>` })}
  ${feature(5, { ic: 'hand', tone: 'terra', kicker: t('Демеушілік тарихы', 'История спонсорства', 'Sponsorship history'), title: t('Бізге сенгендер', 'Те, кто в нас поверил', 'Those who believed in us'),
    body: `<div class="sponsors">${[
      ['Б', t('«Бота» қоры', 'Фонд «Бота»', 'Bota Foundation'), t('Алғашқы клубты құру', 'Создание первого клуба', 'Founding the first club'), '2011'],
      ['SK', t('Samruk-Kazyna Trust', 'Samruk-Kazyna Trust', 'Samruk-Kazyna Trust'), t('Көп жылғы негізгі демеуші: клубтар мен коворкинг', 'Многолетний основной спонсор: клубы и коворкинг', 'Long-time main sponsor: clubs and coworking'), '2018–2025'],
      ['А', t('Астана әкімдігі', 'Акимат Астаны', 'Astana Akimat'), t('Үй-жайлардың бір бөлігі, бюджеттік қаржыландыру', 'Часть помещений, бюджетное финансирование', 'Some premises, budget funding'), t('қазір', 'сейчас', 'now')],
      ['CZ', t('Чехия Республикасының Елшілігі', 'Посольство Чешской Республики', 'Embassy of the Czech Republic'), t('Буллингке қарсы жоба', 'Проект против буллинга', 'Anti-bullying project'), '2025'],
      ['АҚ', t('Азаматтық бастамаларды қолдау орталығы', 'Центр поддержки гражданских инициатив', 'Civic Initiatives Support Centre'), t('Әйелдерді мамандыққа оқыту', 'Обучение женщин профессиям', 'Vocational training for women'), '2025'],
    ].map(([m, n, r, y]) => `<div class="sponsor"><span class="sponsor__mono">${m}</span><div><b>${T(n)}</b><span>${T(r)}</span></div><em>${T(y)}</em></div>`).join('')}</div>` })}
</div></div></section>
${callout(page, { tone: 'callout--teal', title: t('Келесі тарауды бірге жазайық', 'Давайте напишем следующую главу вместе', 'Let’s write the next chapter together'), text: t('2025 жылы негізгі демеуші кетті. Жаңа серіктестер мен донорлар клубтардың жұмысын жалғастыруға көмектеседі.', 'В 2025 году ушёл основной спонсор. Новые партнёры и доноры помогут клубам продолжить работу.', 'In 2025 the main sponsor left. New partners and donors will help the clubs keep going.') })}`,
});

/* ---------- О КЛУБАХ ---------- */
PAGES.push({
  slug: 'clubs/',
  title: t('Клубтар мекенжайы мен кестесі — «Замандас 21», Астана', 'Клубы: адреса и расписание — «Замандас 21», Астана', 'Clubs: addresses and schedule — Zamandas 21, Astana'),
  desc: t('Астанадағы 7 «Замандас» клубы: мекенжайлар, байланыс, үйірмелер мен кесте. Жақын клубты табыңыз.', '7 клубов «Замандас» в Астане на карте: адреса, контакты, кружки и расписание. Найдите клуб рядом с домом.', '7 Zamandas clubs in Astana on the map: addresses, contacts, activities and schedule.'),
  render: page => {
    const mapSrc = `https://yandex.kz/map-widget/v1/?ll=71.4304%2C51.1282&z=11&mode=search&text=${encodeURIComponent('Замандас 21 Астана')}`;
    return `
${pageHero(page, { tone: 'sun', kicker: t('Клубтар', 'О клубах', 'Clubs'), title: t('Үйіңізге жақын 7 клуб', '7 клубов рядом с домом', '7 clubs close to home'), lead: t('Картадан жақын клубты тауып, баланы тегін үйірмеге жазыңыз.', 'Найдите ближайший клуб на карте и запишите ребёнка на бесплатный кружок.', 'Find the nearest club on the map and enrol your child in a free activity.') })}
<section class="section section--tight" style="padding-top:0"><div class="wrap">
  <div class="mapbox reveal">
    <div class="map"><iframe src="${mapSrc}" title="${esc(T(t('Клубтар картасы', 'Карта клубов', 'Clubs map')))}" loading="lazy" allowfullscreen></iframe></div>
    <div class="maplist">${CLUBS.map((c, i) => `<a href="#${c.id}"><span class="n"><b>${i + 1}</b></span><span><strong>${esc(T(c.name))}</strong><small>${esc(T(c.addr))}</small></span></a>`).join('')}
      <a class="btn btn--teal" href="${CONFIG.scheduleFolder}" target="_blank" rel="noopener">${icon('calendar')}${T(t('Сабақ кестесі', 'Расписание занятий', 'Class schedule'))}</a>
    </div>
  </div>
  <p class="muted" style="font-size:14px;margin-top:14px">${T(t('Мекенжайлар 2015–2021 жылдардағы жарияланымдар бойынша; өзекті тізімді қор нақтылайды.', 'Адреса — по публикациям 2015–2021 годов; актуальный список уточняется у фонда.', 'Addresses are based on 2015–2021 publications; the current list is being confirmed with the foundation.'))}</p>
</div></section>

<section class="section section--tight"><div class="wrap"><div class="features">
${CLUBS.map((c, i) => feature(i + 1, { id: c.id, ic: c.ic, tone: c.tone, kicker: c.youth ? t('14–35 жас', '14–35 лет', 'Ages 14–35') : t(`№${i + 1} клуб`, `Клуб №${i + 1}`, `Club No. ${i + 1}`), title: c.name,
  body: `<div class="club-meta">
      <div>${icon('pin')}<span><b>${T(t('Мекенжай', 'Адрес', 'Address'))}:</b> ${esc(T(c.addr))}, ${T(t('Астана', 'Астана', 'Astana'))}</span></div>
      <div>${icon('phone')}<span><b>${T(t('Байланыс', 'Контакты', 'Contacts'))}:</b> ${CONFIG.whatsapp ? `<a href="https://wa.me/${CONFIG.whatsapp}">WhatsApp</a> · ` : ''}<a href="https://www.instagram.com/${CONFIG.instagram}/" target="_blank" rel="noopener">@${CONFIG.instagram}</a> <span class="muted">(${T(t('клуб телефоны — ', 'телефон клуба — ', 'club phone — '))}${T(UI.pending)})</span></span></div>
      <div>${icon('clock')}<span><b>${T(t('Жұмыс уақыты', 'Режим', 'Hours'))}:</b> ${T(t('жыл бойы, жазда да', 'круглый год, включая лето', 'all year round, including summer'))}</span></div>
    </div>
    <p><b style="color:var(--teal-dark)">${T(c.youth ? t('Бағыттар', 'Направления', 'Programmes') : t('Үйірмелер мен секциялар', 'Кружки и секции', 'Activities'))}:</b></p>
    ${c.youth ? chips([t('Тренингтер', 'Тренинги', 'Training'), t('Сөйлесу клубтары', 'Разговорные клубы', 'Conversation clubs'), t('Шешендік клуб', 'Ораторский клуб', 'Speaking club'), t('Коучинг', 'Коучинг', 'Coaching'), t('Психолог 15–21 жас', 'Психолог 15–21 лет', 'Psychologist 15–21')], 'chip--teal')
      : `<p class="muted" style="font-size:15px">${T(t('Осы клубтағы үйірмелер тізімі мен жас топтары — кестеде. Барлық бағыттар: шығармашылық, зияткерлік және тілдер, спорт.', 'Список кружков этого клуба и возрастные группы — в расписании. Направления сети: творчество, интеллект и языки, спорт.', 'This club’s activities and age groups are in the schedule. Network-wide: arts, mind & languages, sport.'))}</p>`}
    <div class="actions"><button class="btn btn--sm" data-enroll="${esc(T(c.addr))}">${T(UI.enroll)}</button><a class="btn btn--ghost btn--sm" href="https://2gis.kz/astana/search/${encodeURIComponent(c.q)}" target="_blank" rel="noopener">${icon('pin')}2GIS</a><a class="btn btn--ghost btn--sm" href="${CONFIG.scheduleFolder}" target="_blank" rel="noopener">${icon('calendar')}${T(t('Кесте', 'Расписание', 'Schedule'))}</a></div>` })).join('')}
</div></div></section>

<section class="section section--tight"><div class="wrap">
  <div class="section__head reveal"><span class="kicker">${T(t('Барлық бағыттар', 'Все направления', 'All programmes'))}</span><h2>${T(t('Үйірмелер каталогы', 'Каталог кружков', 'Activity catalogue'))}</h2></div>
  <div class="grid grid--3">${[['art', 'palette', 'sun'], ['mind', 'robot', 'teal'], ['sport', 'hockey', 'terra']].map(([k, ic, tone]) => `<article class="card reveal">${art(ic, tone)}<div class="card__body"><h3>${T(CIRCLES[k].title)}</h3>${chips(CIRCLES[k].items, 'chip--' + tone)}</div></article>`).join('')}</div>
</div></section>
${callout(page, { title: t('Қай клуб жақын екенін білмейсіз бе?', 'Не знаете, какой клуб ближе?', 'Not sure which club is closest?'), text: t('Өтінім қалдырыңыз — әкімші мекенжайыңызға қарай клуб пен топты таңдайды.', 'Оставьте заявку — администратор подберёт клуб и группу по вашему адресу и возрасту ребёнка.', 'Leave a request — an administrator will match a club and group to your address and your child’s age.') })}`;
  },
});

/* ---------- СЧАСТЛИВАЯ СЕМЬЯ ---------- */
const SPECIALISTS = [
  ['brain', 'sun', t('Психолог-диагност', 'Психолог-диагност', 'Assessment psychologist'), t('Баланың және отбасының психологиялық диагностикасы', 'Психологическая диагностика ребёнка и семьи', 'Psychological assessment of child and family')],
  ['family', 'terra', t('Отбасы психологы', 'Семейный психолог', 'Family psychologist'), t('Ата-ана мен бала арасындағы қарым-қатынас', 'Отношения между родителями и детьми', 'Parent–child relationships')],
  ['heart', 'teal', t('Балалар психологы', 'Детский психолог', 'Child psychologist'), t('Эмоциялар, бейімделу, мектеп', 'Эмоции, адаптация, школа', 'Emotions, adjustment, school')],
  ['chat', 'sun', t('Жасөспірімдер психологы', 'Психолог для подростков', 'Teen psychologist'), t('15–21 жас, анонимді түрде де', '15–21 год, в том числе анонимно', 'Ages 15–21, anonymous if needed')],
  ['palette', 'terra', t('Арт-терапевт', 'Арт-терапевт', 'Art therapist'), t('Шығармашылық арқылы қолдау', 'Поддержка через творчество', 'Support through creativity')],
  ['people', 'teal', t('Ата-аналар тренингтерінің жүргізушісі', 'Ведущий тренингов для родителей', 'Parent training facilitator'), t('Тәрбие стилі туралы курстар', 'Курсы о стиле воспитания', 'Parenting style courses')],
  ['shield', 'sun', t('«Нағыз ер азаматтар мектебінің» тәлімгері', 'Наставник «Школы настоящих мужчин»', '“School of Real Men” mentor'), t('Толық емес отбасылардың ұлдарына', 'Для мальчиков из неполных семей', 'For boys from single-parent families')],
  ['needle', 'terra', t('Аналарға арналған курстар шебері', 'Мастер курсов для мам', 'Mothers’ course instructor'), t('Мамандық пен табыс', 'Профессия и доход', 'Profession and income')],
];
PAGES.push({
  slug: 'family/',
  title: t('«Бақытты отбасы» — бүкіл отбасымен жұмыс | Замандас 21', '«Счастливая семья» — работа со всей семьёй | Замандас 21', '“Happy Family” — working with the whole family | Zamandas 21'),
  desc: t('Балаларға, жасөспірімдерге және ата-аналарға тегін психолог, семинарлар, тәрбие курстары, «Нағыз ер азаматтар мектебі».', 'Бесплатный психолог для детей, подростков и родителей, семинары, курсы о воспитании и «Школа настоящих мужчин» в Астане.', 'Free psychologist for children, teens and parents, seminars, parenting courses and the “School of Real Men” in Astana.'),
  render: page => `
${pageHero(page, { tone: 'terra', kicker: t('Бақытты отбасы', 'Счастливая семья', 'Happy Family'), title: t('Бүкіл отбасымен жұмыс', 'Работа со всей семьёй', 'Working with the whole family'), lead: t('Бала өскенде отбасы да өседі. Ата-аналар клубы, психологиялық қызмет, курстар мен тренингтер — тегін және мейірімді.', 'Когда растёт ребёнок, растёт и семья. Клуб для родителей, психологическая служба, курсы и тренинги — бесплатно и бережно.', 'When a child grows, the family grows too. A parents’ club, psychological service, courses and training — free and caring.') })}
<section class="section section--tight"><div class="wrap">
  <div class="section__head reveal"><span class="kicker">${T(t('Біздің мамандар', 'Наши специалисты', 'Our specialists'))}</span><h2>${T(t('Сізге көмектесетін адамдар', 'Люди, которые помогут', 'People who will help'))}</h2><p class="lead">${T(t('Мамандардың аты-жөні мен фотосуреттері келісілгеннен кейін қосылады.', 'Имена и фото специалистов будут добавлены после согласования с фондом.', 'Names and photos will be added once approved by the foundation.'))}</p></div>
  <div class="grid grid--4">${SPECIALISTS.map(([ic, tone, role, d]) => `<article class="card person reveal">${art(ic, tone)}<div class="card__body"><span class="role">${T(role)}</span><p>${T(d)}</p></div></article>`).join('')}</div>
</div></section>
<section class="section"><div class="wrap">
  <div class="section__head center reveal"><span class="kicker">${T(t('Жұмыс түрлері', 'Формы работы', 'Forms of work'))}</span><h2>${T(t('Отбасыны қалай қолдаймыз', 'Как мы поддерживаем семью', 'How we support families'))}</h2></div>
  <div class="features">
  ${feature(1, { ic: 'brain', tone: 'sun', kicker: t('Диагностика', 'Диагностика', 'Assessment'), title: t('Психологиялық диагностика', 'Психологическая диагностика', 'Psychological assessment'), body: t('<p class="lead">Баланың мінезі мен қажеттіліктерін түсінуге көмектесеміз.</p><p>Нәтижелерін ата-анамен бірге талқылап, келесі қадамдарды ұсынамыз.</p>', '<p class="lead">Помогаем понять характер и потребности ребёнка.</p><p>Результаты обсуждаем с родителями и вместе намечаем следующие шаги.</p>', '<p class="lead">We help you understand your child’s character and needs.</p><p>We discuss the results with parents and plan next steps together.</p>') })}
  ${feature(2, { ic: 'people', tone: 'terra', kicker: t('«Бақытты отбасы» клубы', 'Клуб «Счастливая семья»', '“Happy Family” club'), title: t('Ата-аналарға семинарлар', 'Семинары для родителей', 'Seminars for parents'), body: t('<p class="lead">Балалармен қарым-қатынас туралы кездесулер.</p><p>Шекаралар, жасөспірімдік кезең, мектептегі қиындықтар, отбасындағы дау — тәжірибемен бөлісіп, бір-бірімізді қолдаймыз.</p>', '<p class="lead">Встречи об отношениях с детьми.</p><p>Границы, подростковый возраст, трудности в школе, конфликты в семье — делимся опытом и поддерживаем друг друга.</p>', '<p class="lead">Meetings about relationships with children.</p><p>Boundaries, adolescence, school difficulties, family conflict — we share experience and support each other.</p>') })}
  ${feature(3, { ic: 'chat', tone: 'teal', kicker: t('Психологиялық қызмет', 'Психологическая служба', 'Psychological service'), title: t('Жеке және анонимді кеңес', 'Индивидуальные и анонимные консультации', 'Individual and anonymous counselling'), body: t('<p class="lead">Балаларға, жасөспірімдерге және ата-аналарға.</p><p>Қажет болса — атыңызды айтпай-ақ. Жастар коворкингінде 15–21 жастағыларға жеке психолог бар.</p>', '<p class="lead">Для детей, подростков и родителей.</p><p>Если нужно — анонимно, без имени. В молодёжном коворкинге есть отдельный психолог для 15–21 года.</p>', '<p class="lead">For children, teens and parents.</p><p>Anonymous if you prefer. The youth coworking has a dedicated psychologist for ages 15–21.</p>') + `<div class="actions"><button class="btn btn--sm" data-enroll>${T(t('Кеңеске жазылу', 'Записаться на консультацию', 'Book a consultation'))}</button></div>` })}
  ${feature(4, { ic: 'book', tone: 'sun', kicker: t('Курстар', 'Курсы', 'Courses'), title: t('Тәрбие стилі туралы курстар мен тренингтер', 'Курсы и тренинги о стиле воспитания', 'Parenting style courses and training'), body: t('<p class="lead">Жазасыз және айқайсыз тәрбиелеуге үйренеміз.</p><p>Сонымен қатар аналарға — Азаматтық бастамаларды қолдау орталығымен бірге 9 мамандық бойынша курстар: тігін, аспаздық, жеміс букеттері және т.б. Түлектердің бір бөлігі өз ісін ашты.</p>', '<p class="lead">Учимся воспитывать без крика и наказаний.</p><p>А для мам — курсы девяти профессий вместе с Центром поддержки гражданских инициатив: шитьё, кулинария, фруктовые букеты и другие. Часть выпускниц открыли своё дело, одна из мам руководит социальной мастерской.</p>', '<p class="lead">Learning to raise children without shouting or punishment.</p><p>For mothers: courses in nine professions with the Civic Initiatives Support Centre — sewing, cooking, fruit bouquets and more. Some graduates started their own business; one now runs a social workshop.</p>') })}
  ${feature(5, { ic: 'shield', tone: 'terra', kicker: t('Ұлдарға', 'Для мальчиков', 'For boys'), title: t('«Нағыз ер азаматтар мектебі»', '«Школа настоящих мужчин»', '“School of Real Men”'), body: t('<p class="lead">Толық емес отбасылардың ұлдарына арналған бағдарлама.</p><p>Ер тәлімгерлер жауапкершілікке, еңбекке және бір-біріне құрметпен қарауға үйретеді.</p>', '<p class="lead">Программа для мальчиков из неполных семей.</p><p>Наставники-мужчины учат ответственности, трудолюбию и уважению друг к другу.</p>', '<p class="lead">A programme for boys from single-parent families.</p><p>Male mentors teach responsibility, hard work and respect for one another.</p>') })}
  </div>
</div></section>
${callout(page, { tone: 'callout--teal', title: t('Сөйлесу керек пе?', 'Нужно поговорить?', 'Need to talk?'), text: t('Психологқа жазылу тегін. Анонимді түрде де болады.', 'Запись к психологу бесплатна. Можно анонимно.', 'Booking a psychologist is free. Anonymous is fine.') })}`,
});

/* ---------- НОВОСТИ ---------- */
const NEWS = [
  { date: t('2026 ж. маусым', 'Июнь 2026', 'June 2026'), src: '24KZ', ic: 'star', tone: 'sun', url: 'https://24.kz/ru/news/social/771856-zamandas-21-kak-dvorovyj-klub-stal-tsentrom-semejnogo-dosuga-v-astane',
    title: t('«Замандас 21»: аула клубы отбасылық демалыс орталығына айналды', '«Замандас 21»: как дворовый клуб стал центром семейного досуга', 'Zamandas 21: how a yard club became a family leisure centre'), text: t('15 жыл, 5 000-ға жуық тәрбиеленуші және 22 үйірме.', '15 лет, почти 5 000 воспитанников и 22 кружка.', '15 years, almost 5,000 children and 22 activities.') },
  { date: t('2025 ж. сәуір', 'Апрель 2025', 'April 2025'), src: t('Қазақстанская правда', 'Казахстанская правда', 'Kazakhstanskaya Pravda'), ic: 'heart', tone: 'terra', url: 'https://kazpravda.kz/n/zamandas-21-tam-gde-tsaryat-lyubov-i-zabota/',
    title: t('«Замандас 21»: махаббат пен қамқорлық бар жер', '«Замандас 21»: там, где царят любовь и забота', 'Zamandas 21: where love and care reign'), text: t('7 клуб және 3 500-ден астам бала.', '7 клубов и более 3 500 детей.', '7 clubs and more than 3,500 children.') },
  { date: t('2024 ж. қыркүйек', 'Сентябрь 2024', 'September 2024'), src: 'NewTimes.kz', ic: 'laptop', tone: 'teal', url: 'https://newtimes.kz/obshchestvo/193967-molodezhnyi-klub-otkryli-v-astane',
    title: t('Астанада жастар клубы ашылды', 'Молодёжный клуб открыли в Астане', 'A youth club opened in Astana'), text: t('14–35 жастағыларға тегін коворкинг.', 'Бесплатный коворкинг для 14–35 лет.', 'A free coworking space for ages 14–35.') },
  { date: t('2024 ж. мамыр', 'Май 2024', 'May 2024'), src: 'Azattyq Ruhy', ic: 'people', tone: 'sun', url: 'https://rus.azattyq-ruhy.kz/society/66262-kazakhstanka-izmenila-zhizni-bolshe-trekh-tysiach-detei',
    title: t('Қазақстандық әйел үш мыңнан астам баланың өмірін өзгертті', 'Казахстанка изменила жизни больше трёх тысяч детей', 'A Kazakh woman changed the lives of over 3,000 children'), text: t('Ләззат Алшынова және клубтың төрт қағидасы.', 'О Ляззат Алшиновой и четырёх принципах клуба.', 'About Lyazzat Alshinova and the club’s four principles.') },
  { date: t('2021 ж. мамыр', 'Май 2021', 'May 2021'), src: 'Sputnik', ic: 'sprout', tone: 'terra', url: 'https://ru.sputnik.kz/20210518/Chem-zanyat-detey-na-kanikulakh-17090862.html',
    title: t('Каникулда балаларды немен айналыстыруға болады: 5 тегін аула клубы', 'Чем занять детей на каникулах: 5 бесплатных дворовых клубов', 'Keeping kids busy in the holidays: 5 free yard clubs'), text: t('5 клуб, 2 500 бала, 30+ үйірме.', '5 клубов, 2 500 детей, 30+ кружков.', '5 clubs, 2,500 children, 30+ activities.') },
  { date: t('2018 ж. қыркүйек', 'Сентябрь 2018', 'September 2018'), src: t('Караван', 'Караван', 'Caravan'), ic: 'family', tone: 'teal', url: 'https://www.caravan.kz/news/semya-ehto-vazhno-479794/',
    title: t('Отбасы — бұл маңызды', 'Семья — это важно', 'Family matters'), text: t('Samruk-Kazyna Trust-пен бірге Отбасы күні мерекесі.', 'Праздник ко Дню семьи вместе с Samruk-Kazyna Trust.', 'A Family Day festival with Samruk-Kazyna Trust.') },
];
PAGES.push({
  slug: 'news/',
  title: t('Жаңалықтар — «Замандас 21»', 'Новости — «Замандас 21»', 'News — Zamandas 21'),
  desc: t('«Замандас 21» клубтарының жаңалықтары, Instagram жарияланымдары және БАҚ-тағы материалдар.', 'Новости клубов «Замандас 21», публикации в Instagram и материалы СМИ о фонде.', 'News from Zamandas 21 family clubs in Astana: events, Instagram posts and media coverage of the foundation.'),
  render: page => `
${pageHero(page, { kicker: t('Жаңалықтар', 'Новости', 'News'), title: t('Аулада не болып жатыр', 'Что нового во дворе', 'What’s new in the yard'), lead: t('Клубтардағы оқиғалар, мерекелер мен жетістіктер — Instagram-да және БАҚ-та.', 'События, праздники и победы наших воспитанников — в Instagram и в СМИ.', 'Events, celebrations and achievements — on Instagram and in the media.') })}
<section class="section section--tight" style="padding-top:0"><div class="wrap">
  ${CONFIG.instagramWidget
    ? `<div class="insta-widget reveal"><iframe src="${CONFIG.instagramWidget}" title="Instagram" loading="lazy"></iframe></div>`
    : `<div class="insta reveal">
    <div><span class="kicker">Instagram</span><h2>@${CONFIG.instagram}</h2><p class="lead">${T(t('Ең жаңа жаңалықтар — біздің Instagram-да. Жазылыңыз, сабақтардан фото мен анонстарды бірінші көресіз.', 'Самые свежие новости — в нашем Instagram. Подпишитесь, чтобы первыми видеть фото с занятий и анонсы.', 'The freshest news is on our Instagram. Follow us to see class photos and announcements first.'))}</p>
      <div class="actions"><a class="btn" href="https://www.instagram.com/${CONFIG.instagram}/" target="_blank" rel="noopener">${icon('insta')}${T(t('Жазылу', 'Подписаться', 'Follow'))}</a></div></div>
    <div class="insta__grid" aria-hidden="true">${[['music', 'sun'], ['ball', 'terra'], ['chess', 'teal'], ['palette', 'terra'], ['family', 'teal'], ['hockey', 'sun']].map(([i, tn]) => art(i, tn)).join('')}</div>
  </div>`}
</div></section>
<section class="section section--tight"><div class="wrap">
  <div class="section__head reveal"><span class="kicker">${T(t('БАҚ біз туралы', 'СМИ о нас', 'Media about us'))}</span><h2>${T(t('Жарияланымдар', 'Публикации', 'Publications'))}</h2></div>
  <div class="grid grid--3">${NEWS.map(n => `<article class="card news-card reveal">${art(n.ic, n.tone)}<div class="card__body"><time>${T(n.date)} · ${T(n.src)}</time><h3>${T(n.title)}</h3><p>${T(n.text)}</p><div class="card__foot"><a class="link-arrow" href="${n.url}" target="_blank" rel="noopener">${T(t('Оқу', 'Читать', 'Read'))}</a></div></div></article>`).join('')}</div>
</div></section>`,
});

/* ---------- БЛАГОТВОРИТЕЛЬНОСТЬ ---------- */
PAGES.push({
  slug: 'charity/',
  title: t('Қайырымдылық — балаларға көмектесу | Замандас 21', 'Благотворительность — помочь детям Астаны | Замандас 21', 'Charity — help children in Astana | Zamandas 21'),
  desc: t('«Замандас 21» қорын қолдаңыз: Kaspi, реквизиттер, корпоративтік серіктестік. Әр теңге балалардың тегін сабақтарына жұмсалады.', 'Поддержите фонд «Замандас 21»: Kaspi, реквизиты, корпоративное партнёрство. Деньги идут на бесплатные занятия детей.', 'Support Zamandas 21: Kaspi, bank details, corporate partnership. Donations fund free classes for children.'),
  render: page => {
    const R = CONFIG.requisites;
    const row = (k, v) => `<div><dt>${T(k)}</dt><dd>${v ? `<span>${esc(v)}</span><button class="copy" type="button" data-copy="${esc(v)}">${T(UI.copy)}</button>` : `<span class="pending">${T(UI.pending)}</span>`}</dd></div>`;
    return `
${pageHero(page, { tone: 'terra', kicker: t('Қайырымдылық', 'Благотворительность', 'Charity'), title: t('Аулада балалар үшін жарық жағып тұрыңыз', 'Помогите свету в окнах клуба не гаснуть', 'Help keep the club lights on'), lead: t('Сіздің қолдауыңыз — бір балаға бір ай үйірме, педагогтың жалақысы, жылы бөлме және спорт жабдығы.', 'Ваша поддержка — это месяц кружка для ребёнка, зарплата педагога, тёплое помещение и спортивная форма.', 'Your support means a month of activities for a child, a teacher’s salary, a warm room and sports kit.') })}
<section class="section section--tight"><div class="wrap"><div class="features">
  ${feature(1, { ic: 'heart', tone: 'sun', kicker: t('Негізгі ақпарат', 'Основная информация', 'Key information'), title: t('Неге қазір маңызды', 'Почему это важно сейчас', 'Why it matters now'),
    body: t('<p class="lead">2025 жылы көп жылғы негізгі демеуші қаржыландыруды тоқтатты, ал бюджеттік қаражат кешікті.</p><p>Бірнеше ай бойы клубтар тек педагогтар мен еріктілердің арқасында жұмыс істеді. Сіздің жарнаңыз 5 000-ға жуық балаға тегін сабақтарды сақтап қалуға көмектеседі.</p>', '<p class="lead">В 2025 году многолетний основной спонсор прекратил финансирование, а бюджетные деньги задержались.</p><p>Несколько месяцев клубы держались только на педагогах и волонтёрах. Ваш вклад помогает сохранить бесплатные занятия для почти 5 000 детей.</p>', '<p class="lead">In 2025 our long-time main sponsor ended funding and budget money was delayed.</p><p>For months the clubs ran on teachers and volunteers alone. Your gift helps keep classes free for almost 5,000 children.</p>') +
      ticks([t('Педагогтардың еңбекақысы', 'Оплата труда педагогов', 'Teachers’ pay'), t('Үй-жайды жалға алу және коммуналдық төлемдер', 'Аренда и коммунальные платежи', 'Rent and utilities'), t('Спорт жабдығы, музыкалық аспаптар, материалдар', 'Спортивная форма, инструменты, материалы', 'Sports kit, instruments, materials')]) +
      `<p class="muted" style="font-size:14.5px">${T(t('Есептер мен жарғы «Құжаттар» бөлімінде жарияланады.', 'Отчёты и устав будут опубликованы в разделе «Документы».', 'Reports and the charter will be published in the Documents section.'))}</p>` })}
  ${feature(2, { ic: 'gift', tone: 'terra', kicker: t('Біздің акциялар', 'Наши акции', 'Our campaigns'), title: t('Қалай көмектесуге болады', 'Чем можно помочь', 'Ways to help'),
    body: `<div class="grid" style="gap:12px">${[
      ['coin', t('«Бір балаға бір ай»', '«Месяц кружка для ребёнка»', '“A month for one child”'), t('Тұрақты ай сайынғы жарна — бір баланың сабақтары.', 'Ежемесячный взнос — занятия одного ребёнка.', 'A monthly gift covers one child’s classes.')],
      ['hockey', t('Аула хоккей лигасы', 'Дворовая хоккейная лига', 'Yard hockey league'), t('Коньки мен жабдық келесі маусымға.', 'Коньки и экипировка к новому сезону.', 'Skates and kit for the new season.')],
      ['building', t('Компанияларға', 'Для компаний', 'For companies'), t('ӘЖЖ аясындағы серіктестік, клуб немесе бағыт қамқоршысы.', 'Партнёрство в рамках КСО: попечитель клуба или направления.', 'CSR partnership: sponsor a club or a programme.')],
      ['hand', t('Еріктілік', 'Волонтёрство', 'Volunteering'), t('Шебер-класс өткізіңіз, тіл үйретіңіз, мерекеге көмектесіңіз.', 'Проведите мастер-класс, позанимайтесь языком, помогите с праздником.', 'Run a workshop, teach a language, help with an event.')],
    ].map(([i, a, b]) => `<div class="sponsor" style="grid-template-columns:56px 1fr"><span class="sponsor__mono">${icon(i).replace('class=""', 'style="width:26px;height:26px"')}</span><div><b>${T(a)}</b><span>${T(b)}</span></div></div>`).join('')}</div>
      <div class="actions" style="margin-top:16px"><a class="btn btn--teal btn--sm" href="https://www.instagram.com/${CONFIG.instagram}/" target="_blank" rel="noopener">${T(UI.partner)}</a><a class="btn btn--ghost btn--sm" href="https://www.instagram.com/${CONFIG.instagram}/" target="_blank" rel="noopener">${T(UI.volunteer)}</a></div>` })}
  ${feature(3, { ic: 'doc', tone: 'teal', kicker: t('Реквизиттер', 'Реквизиты', 'Bank details'), title: t('Аудару деректері', 'Данные для перевода', 'Transfer details'),
    body: `<dl class="req">${row(t('Атауы', 'Получатель', 'Recipient'), R.name)}${row(t('БСН', 'БИН', 'BIN'), R.bin)}${row(t('ЖСК', 'ИИК', 'IBAN'), R.iik)}${row(t('Банк', 'Банк', 'Bank'), R.bank)}${row(t('БСК', 'БИК', 'BIC'), R.bik)}${row('Кбе', R.kbe)}${row(t('Төлем мақсаты', 'Назначение', 'Purpose'), T(t('Қайырымдылық жарна', 'Благотворительный взнос', 'Charitable donation')))}</dl>
      <div class="qr">${CONFIG.kaspiQr ? `<img src="${page.rel}${CONFIG.kaspiQr}" alt="Kaspi QR" width="130" height="130" style="border-radius:18px">` : `<div class="qr__box"><span>Kaspi QR<br>${T(t('жақында', 'скоро', 'soon'))}</span></div>`}<p>${T(t('Kaspi QR кодын сканерлеп, кез келген соманы аударыңыз. Ай сайынғы жазылым мен картамен төлем жақында қосылады.', 'Отсканируйте Kaspi QR и переведите любую сумму. Ежемесячная подписка и оплата картой появятся в ближайшее время.', 'Scan the Kaspi QR and send any amount. Monthly giving and card payments are coming soon.'))}</p></div>` })}
</div></div></section>
${callout(page, { tone: 'callout--teal', title: t('Рахмет!', 'Спасибо!', 'Thank you!'), text: t('Әр көмек — аулада бір күлкі. Сұрақтарыңыз болса, Instagram-ға жазыңыз.', 'Каждая помощь — это чья-то улыбка во дворе. Вопросы — пишите нам в Instagram.', 'Every gift is a smile in the yard. Questions? Message us on Instagram.') })}`;
  },
});

/* ---------------- Build ---------------- */
if (existsSync(OUT)) rmSync(OUT, { recursive: true });
for (const lang of LANGS) {
  LANG = lang;
  for (const p of PAGES) {
    const depth = (PREFIX[lang] ? 1 : 0) + (p.slug ? 1 : 0);
    const page = { ...p, rel: '../'.repeat(depth) };
    artId = 0;
    const html = `${head(page)}
<body>
${header(page)}
<main id="main">
${p.render(page)}
</main>
${footer(page)}
${enrollModal()}
${scripts(page)}
</body>
</html>
`;
    const dir = join(OUT, PREFIX[lang], p.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), html);
  }
}
mkdirSync(join(OUT, 'assets'), { recursive: true });
for (const f of readdirSync(join(ROOT, 'src/assets'))) copyFileSync(join(ROOT, 'src/assets', f), join(OUT, 'assets', f));
writeFileSync(join(OUT, '.nojekyll'), '');
writeFileSync(join(OUT, '404.html'), `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/zamandas21/"><title>Замандас 21</title><a href="/zamandas21/">Замандас 21</a>`);
const urls = LANGS.flatMap(l => PAGES.map(p => CONFIG.siteUrl + PREFIX[l] + p.slug));
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${u}</loc></url>`).join('')}</urlset>\n`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${CONFIG.siteUrl}sitemap.xml\n`);
console.log(`Built ${LANGS.length * PAGES.length} pages → docs/`);
