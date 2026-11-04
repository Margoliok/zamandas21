// Настройки сайта. Всё, что помечено TODO, нужно заполнить данными фонда.
export const CONFIG = {
  siteUrl: 'https://margoliok.github.io/zamandas21/',
  instagram: 'zamandas21',
  // TODO: номер WhatsApp в международном формате без «+», например '77011234567'.
  // Пока пусто — заявка копируется в буфер и открывается Instagram Direct.
  whatsapp: '',
  // TODO: URL вебхука (Telegram-бот / Google Apps Script → Google Таблица). Если задан — форма отправляется туда.
  formEndpoint: '',
  // TODO: ссылка на документ на Google Диске со списком педагогов
  teachersDoc: 'https://drive.google.com/',
  // TODO: ссылка на папку Google Диска с актуальным расписанием
  scheduleFolder: 'https://drive.google.com/',
  // TODO: ссылка на виджет ленты Instagram (Behold.so, LightWidget, SnapWidget, Elfsight) — iframe src.
  instagramWidget: '',
  // Реквизиты: TODO — заполнить после получения от фонда
  requisites: {
    name: 'ОФ «Замандас 21»',
    bin: '',
    iik: '',
    bank: '',
    bik: '',
    kbe: '',
  },
  kaspiQr: '', // путь к картинке QR Kaspi, например 'assets/kaspi-qr.png'
  statsDate: { kk: '2026 жылғы маусым', ru: 'июнь 2026', en: 'June 2026' },
};
