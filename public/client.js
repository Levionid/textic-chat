const BACKEND_URL =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://textic-chat.onrender.com";

const socket = io(BACKEND_URL);

const app = document.getElementById("app");
const toast = document.getElementById("toast");
const controlsRoot = document.getElementById("roomControlsRoot") || (() => {
  const node = document.createElement("div");
  node.id = "roomControlsRoot";
  document.body.appendChild(node);
  return node;
})();
const STORAGE_KEYS = {
  sessionId: "dobeyFrazu.sessionId",
  roomCode: "dobeyFrazu.roomCode",
  playerName: "dobeyFrazu.playerName",
  customPromptPacks: "dobeyFrazu.customPromptPacks"
};

const ROUTES = {
  home: "/",
  create: "/create",
  join: "/join-game",
  lobbies: "/lobbies",
  code: "/join-code",
  watch: "/watch"
};

const DEFAULT_ROOM_SETTINGS = {
  maxRounds: 5,
  promptSeconds: 60,
  answerSeconds: 60,
  voteSeconds: 30,
  anonymousMode: false,
  soundsEnabled: true,
  promptMode: "manual",
  promptPack: "mixed",
  spectatorMode: true,
  spectatorVoting: "off",
  maxPlayers: 6,
  publicLobby: true
};


const GAME_MODES = {
  classic_pairs: {
    id: "classic_pairs",
    title: "Классика связок",
    shortTitle: "Классика",
    description: "Игроки пишут начала, затем каждый добивает чужую фразу.",
    minPlayers: 2,
    tags: ["связки", "база", "2+ игрока"],
    enabled: true
  },
  shared_prompt: {
    id: "shared_prompt",
    title: "Одна фраза на всех",
    shortTitle: "Одна фраза",
    description: "Каждый пишет начало, потом каждое начало становится раундом для всех.",
    minPlayers: 2,
    tags: ["баттл", "одинаковая фраза", "2+ игрока"],
    enabled: true
  },
  duel_tournament: {
    id: "duel_tournament",
    title: "Дуэльный турнир",
    shortTitle: "Дуэль",
    description: "Дуэли и трио-бои по сетке. Начала для боя пишут игроки вне текущей дуэли.",
    minPlayers: 3,
    tags: ["турнир", "сетка", "3+ игрока"],
    enabled: true
  },
  guess_author: {
    id: "guess_author",
    title: "Угадай автора",
    shortTitle: "Угадай автора",
    description: "Сначала угадываем автора начала/концовки, потом голосуем за шутку.",
    minPlayers: 3,
    tags: ["угадайка", "анонимно", "3+ игрока"],
    enabled: true
  },
  chaos_chain: {
    id: "chaos_chain",
    title: "Цепочка хаоса",
    shortTitle: "Цепочка",
    description: "Каждый видит только предыдущий кусок истории и продолжает вслепую.",
    minPlayers: 3,
    tags: ["история", "хаос", "3+ игрока"],
    enabled: true
  },
  story_chain: {
    id: "story_chain",
    title: "Шутка с продолжением",
    shortTitle: "История",
    description: "История собирается по частям, каждый видит весь предыдущий контекст.",
    minPlayers: 3,
    tags: ["история", "контекст", "3+ игрока"],
    enabled: true
  }
};

function gameModeInfo(modeId) {
  return GAME_MODES[modeId] || GAME_MODES.classic_pairs;
}

function gameModeTitle(modeId) {
  return gameModeInfo(modeId).title;
}


function gameModeIconSvg(modeId) {
  const icons = {
    classic_pairs: `
      <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <path class="mode-icon-shadow" d="M22 24h38c10 0 18 7 18 17s-8 17-18 17H43L29 70v-12h-7c-10 0-18-7-18-17s8-17 18-17Z"/>
        <path class="mode-icon-main" d="M24 19h39c11 0 20 8 20 19s-9 19-20 19H46L31 70V57h-7C13 57 5 49 5 38s8-19 19-19Z"/>
        <path class="mode-icon-line" d="M25 34h38M25 44h25"/>
        <path class="mode-icon-accent" d="M67 54l9 9 11-18"/>
      </svg>`,
    shared_prompt: `
      <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <circle class="mode-icon-shadow" cx="48" cy="48" r="28"/>
        <path class="mode-icon-main" d="M48 15c16 0 29 11 29 25 0 16-14 28-32 28h-4L24 80l5-17c-7-5-10-12-10-20 0-15 13-28 29-28Z"/>
        <path class="mode-icon-accent" d="M48 28v28M34 42h28"/>
        <circle class="mode-icon-dot" cx="23" cy="25" r="6"/>
        <circle class="mode-icon-dot" cx="75" cy="67" r="6"/>
      </svg>`,
    duel_tournament: `
      <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <path class="mode-icon-shadow" d="M25 22l49 49M71 22L22 71"/>
        <path class="mode-icon-main" d="M20 18l54 54 8-8-54-54-8 8Z"/>
        <path class="mode-icon-main alt" d="M76 18 22 72l-8-8 54-54 8 8Z"/>
        <path class="mode-icon-accent" d="M48 10l6 13 14 2-10 10 3 14-13-7-13 7 3-14-10-10 14-2 6-13Z"/>
      </svg>`,
    guess_author: `
      <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <circle class="mode-icon-main" cx="40" cy="39" r="24"/>
        <path class="mode-icon-line" d="M56 57l22 22"/>
        <path class="mode-icon-accent" d="M32 36c1-8 16-8 17 0 1 9-9 9-9 16"/>
        <circle class="mode-icon-dot" cx="40" cy="61" r="4"/>
        <path class="mode-icon-shadow" d="M69 66l10 10"/>
      </svg>`,
    chaos_chain: `
      <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <path class="mode-icon-shadow" d="M15 50c8-18 23-18 33 0s25 18 33 0"/>
        <path class="mode-icon-main" d="M15 34h22l-9 14h20L31 74l6-20H17l-2-20Z"/>
        <path class="mode-icon-main alt" d="M56 21h24L67 43h16L58 76l8-25H49l7-30Z"/>
        <path class="mode-icon-accent" d="M21 72c12-8 20-8 31 0s19 8 29 0"/>
      </svg>`,
    story_chain: `
      <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <path class="mode-icon-shadow" d="M18 22h42c10 0 18 8 18 18v36H33c-8 0-15-7-15-15V22Z"/>
        <path class="mode-icon-main" d="M18 18h43c10 0 18 8 18 18v39H35c-9 0-17-8-17-17V18Z"/>
        <path class="mode-icon-line" d="M32 35h31M32 47h28M32 59h20"/>
        <path class="mode-icon-accent" d="M70 16v22l8-6 8 6V16"/>
      </svg>`
  };
  return icons[modeId] || icons.classic_pairs;
}

const SOUND_FILES = {
  click: "/sounds/ui-click.mp3",
  copy: "/sounds/copy.mp3",
  join: "/sounds/join.mp3",
  leave: "/sounds/leave.mp3",
  reveal: "/sounds/reveal.mp3",
  vote: "/sounds/vote.mp3",
  win: "/sounds/win.mp3",
  error: "/sounds/error.mp3"
};

const MAX_AUDIO_BYTES = 20 * 1024 * 1024;
const MAX_RECORDING_MS = 60 * 1000;
const AUDIO_ACCEPT = "audio/*,video/webm,video/mp4,.mp3,.wav,.ogg,.webm,.m4a,.aac,.flac";
const CUSTOM_PROMPT_PACK_LIMIT = 2;
const CUSTOM_PROMPTS_PER_PACK_LIMIT = 80;
const CUSTOM_PACK_NAME_LIMIT = 36;


const COPY = {
  appTitle: "Textic Chat",
  tagline: "игра для компании друзей",
  labels: {
    name: "Ваш ник",
    roomCode: "Код лобби",
    players: "Игроки",
    settings: "Настройки игры",
    openRooms: "Открытые лобби",
    openRoomsLead: "Выберите лобби из списка.",
    progress: "Прогресс",
    roundVotes: "Результаты голосования",
    history: "Лучшие шутки",
    titles: "Титулы",
    finalTitle: "Финал",
    grandVoting: "Шутка вечера",
    personalPodium: "Личный подиум",
    pairAwards: "Лучшие связки",
    trioAwards: "Трио вечера",
    otherPlayers: "Остальные игроки",
    specialRoles: "Особые роли"
  },
  buttons: {
    openCreate: "Собрать лобби",
    browseRooms: "Смотреть игры",
    refreshRooms: "Обновить список",
    joinRoom: "Войти",
    back: "Назад в меню",
    createRoom: "Создать лобби",
    copyCode: "Скопировать код",
    copyInvite: "Скопировать ссылку",
    copyWatch: "Ссылка зрителя",
    becomeSpectator: "Стать зрителем",
    becomePlayer: "Вернуться игроком",
    moveToSpectator: "В зрители",
    moveToPlayer: "В игроки",
    giveChoice: "Дать выбор",
    kickPlayer: "Кик",
    banPlayer: "Бан",
    transferHost: "Сделать хостом",
    shareInvite: "Поделиться",
    shareCard: "Share-картинка",
    joinSpectator: "Войти зрителем",
    editSettings: "Изменить настройки",
    saveSettings: "Сохранить",
    cancelSettings: "Отмена",
    createPromptPack: "Создать свой пак",
    savePromptPack: "Сохранить пак",
    deletePromptPack: "Удалить пак",
    startGame: "Начать игру",
    submitPrompt: "Зафиксить начало",
    updatePrompt: "Обновить начало",
    submitAnswer: "Отправить концовку",
    updateAnswer: "Обновить концовку",
    editSubmission: "Изменить",
    recordAudio: "Записать голосом",
    stopRecording: "Остановить",
    chooseAudio: "Прикрепить аудио",
    removeAudio: "Убрать аудио",
    startVoting: "Перейти к голосованию",
    vote: "Отдать голос",
    grandVote: "Выбрать шутку вечера",
    ownAnswer: "Это ваша концовка",
    copyJoke: "Утащить шутку",
    copyBest: "Скопировать шутку",
    copy: "Скопировать",
    nextRound: "Еще раунд, и точно всё",
    final: "Выбрать шутку вечера",
    restart: "Вернуть всех в лобби",
    editName: "Сменить ник",
    leaveRoom: "Выйти",
    deleteRoom: "Удалить лобби"
  },
  screens: {
    home: "Заходите в игру",
    lobbies: "Открытые лобби",
    create: "Настройки лобби",
    waiting: "Лобби готовится",
    prompting: (round) => `Раунд ${round}: кинь начало`,
    answering: "Добей фразу, пока не передумал",
    revealing: "Готовые шутки",
    guessing: "Угадай автора",
    voting: "Голосование",
    starting: "Игра начинается",
    scoreboard: (round) => `Раунд ${round} · Итоги`,
    bestSingle: "Лучшая шутка раунда",
    bestMultiple: "Лучшие шутки раунда",
    finished: "Финал игры",
    grandVoting: "Выберите шутку вечера"
  },
  placeholders: {
    name: "Например, Артур",
    roomCode: "ABCD",
    prompt: "Когда хост сказал 'быстро сыграем один раунд'...",
    answer: "...и все поняли, что вечер только начинается.",
    chaosStart: "Начни странную историю одним куском...",
    chaosContinue: "Продолжи этот кусок так, будто знаешь, что происходит..."
  },
  settings: {
    rounds: "Количество раундов",
    promptTimer: "Таймер на начало, сек.",
    answerTimer: "Таймер на концовку, сек.",
    voteTimer: "Таймер голосования, сек.",
    promptMode: "Режим начал",
    promptManual: "Игроки сами кидают начала",
    promptAuto: "Игра предлагает начала автоматически",
    promptMixed: "Игроки + готовые начала",
    promptPack: "Пак готовых начал с никами",
    customPacks: "Свои паки начал",
    customPacksClosedHint: "Создать или изменить свой пак",
    customPacksHint: "До 2 паков на этом устройстве. Каждое начало — с новой строки. {{player}} — случайный игрок, {{player2}} и {{player3}} — второй/третий разные игроки для шаблонов с несколькими никами, {{host}} — хост, {{me}} — автор автоначала.",
    packCustomOnly: "Только свой пак",
    packMixed: "Микс под компанию",
    packUniversal: "Универсальные",
    packFriends: "Для друзей",
    packSchool: "Школа / универ",
    packWork: "Работа / офис",
    packGaming: "Игры / Discord",
    packParty: "Вечеринка",
    packFamily: "Семья",
    packAbsurd: "Абсурд",
    packKz: "Казахстан / локальные",
    packSoftRoast: "Мягкий roast",
    spectatorMode: "Разрешить режим зрителя",
    spectatorVoting: "Голос зрителей",
    spectatorOff: "Зрители только смотрят",
    spectatorReactions: "Зрители ставят реакции",
    spectatorGrandOnly: "Зрители голосуют только в финале",
    fixedGameMode: "Режим игры",
    fixedGameModeHint: "Режим нельзя изменить после создания лобби. Чтобы выбрать другой режим, создай новое лобби.",
    sharedRoundsHint: "Если начала пишут игроки, количество раундов будет равно количеству отправленных начал.",
    maxPlayers: "Максимум игроков",
    publicLobby: "Показывать лобби в списке открытых",
    anonymous: "Скрывать авторов до итогов раунда",
    sounds: "Звуки при раскрытии"
  },
  status: [
    "Ждем, пока остальные допишут свои варианты...",
    "Кто-то еще думает над шуткой...",
    "Почти готово, осталось дождаться пары ответов...",
    "Игра ждет последних игроков...",
    "Собираем ответы перед следующим шагом...",
    "Проверяем, не ушел ли хост за чаем...",
    "Шутки уже почти готовы...",
    "Кто-то ищет самую удачную формулировку...",
    "Еще немного ожидания...",
    "Остался последний штрих."
  ],
  empty: {
    history: "История пока пустая. Лучшие шутки появятся после первого раунда.",
    best: "Лучшей шутки пока нет.",
    promptMissing: "Фраза скоро появится.",
    winnerMissing: "Победитель не найден."
  },
  messages: {
    copied: "Скопировано.",
    connected: "Подключение восстановлено.",
    disconnected: "Соединение потеряно. Пробуем переподключиться.",
    sessionExpired: "Старое лобби больше недоступно.",
    enterName: "Введите ник",
    enterCode: "Введите код лобби",
    noOpenRooms: "Пока открытых лобби нет",
    noOpenRoomsHint: "Создай первое лобби и позови друзей",
    loadingRooms: "Обновляем список...",
    roomsRefreshFailed: "Не получилось обновить список. Попробуйте ещё раз.",
    promptSubmitted: "Начало отправлено. Ждем остальных.",
    answerSubmitted: "Концовка отправлена. Ждем остальных.",
    audioTooLarge: "Аудио должно быть не больше 20 МБ.",
    audioUnsupported: "Выберите аудио: mp3, wav, ogg, webm, m4a, aac, flac или запись webm/mp4.",
    audioReady: "Аудио добавлено.",
    audioRemoved: "Аудио убрано.",
    customPackLimit: "Можно создать максимум 2 своих пака на этом устройстве.",
    customPackSaved: "Пак сохранён.",
    customPackDeleted: "Пак удалён.",
    customPackEmpty: "Добавь название и хотя бы одно начало.",
    customPackRequired: "Для режима «Только свой пак» создай хотя бы один свой пак или выбери другой пак.",
    recordingStarted: "Запись началась. Максимум 1 минута.",
    recordingLimit: "Запись остановлена: максимум 1 минута.",
    micDenied: "Не получилось включить микрофон. Проверьте разрешения браузера.",
    fileReadFailed: "Не получилось прочитать аудиофайл.",
    voteSubmitted: "Голос принят. Ждем остальных.",
    grandVoteSubmitted: "Финальный голос принят. Собираем итоги вечера.",
    spectatorJoined: "Вы вошли зрителем. Можно смотреть, реагировать и не занимать место игрока.",
    shareFailed: "Не получилось открыть системное меню. Скачал картинку.",
    shareReady: "Share-картинка готова.",
    roleChanged: "Роль изменена.",
    kicked: "Вас кикнули из лобби.",
    banned: "Вас забанили в этом лобби.",
    hostStartsVoting: "Ждем, пока хост запустит голосование.",
    hostDecision: "Хост выбирает следующий шаг.",
    hostCanRestart: "Хост может вернуть всех в лобби.",
    confirmLeave: "Вы уверены выйти?",
    confirmDelete: "Удалить лобби для всех игроков?",
    leftRoom: "Вы вышли из лобби.",
    roomDeleted: "Лобби удалено.",
    gameStartedTitle: "Игра уже началась",
    gameStartedText: "Новые игроки больше не могут присоединиться к этому лобби.",
    lobbyMissingTitle: "Лобби не найдено",
    lobbyMissingText: "Такого лобби нет. Возможно, его удалили или код написан с ошибкой.",
    routeMissingTitle: "Такой страницы нет",
    routeMissingText: "Похоже, ссылка написана неправильно.",
    roomCreated: (code) => `Лобби ${code} создано.`,
    joined: (code) => `Вы вошли в ${code}.`,
    reconnected: (code) => `Сессия в ${code} восстановлена.`,
    returned: (code) => `Вы вернулись в ${code}.`
  }
};

let currentRoom = null;
let viewerMode = /^\/watch\//.test(location.pathname);
let currentScreen = screenFromPath(location.pathname);
let myName = localStorage.getItem(STORAGE_KEYS.playerName) || "";
let previousState = null;
let timerInterval = null;
let sessionId = getOrCreateSessionId();
let openRooms = [];
let lobbySettingsOpen = false;
let settingsModalInitialSignature = null;
let openRoomsLoading = false;
let openRoomsTimer = null;
let pendingNameAction = null;
let routeRoomCode = roomCodeFromPath(location.pathname);
let inviteJoinRequestedFor = null;
const inputDrafts = {
  prompts: {},
  answers: {}
};
const audioDrafts = {
  prompts: {},
  answers: {}
};
let promptEditMode = false;
let answerEditMode = false;
let activeRecording = null;
let recordingTicker = null;
let historyOpen = false;
let serverTimeOffset = 0;
let lobbySecretHidden = false;

function screenFromPath(pathname) {
  if (pathname === ROUTES.home) return "home";
  if (pathname === "/create-lobby") return "create";
  if (pathname === ROUTES.create) return "create";
  if (pathname === ROUTES.join) return "join";
  if (pathname === ROUTES.lobbies) return "lobbies";
  if (pathname === ROUTES.code) return "code";
  if (/^\/watch\/[a-zA-Z0-9]{4,8}\/?$/.test(pathname)) return "watch";
  if (/^\/(?:join|lobby|game)\/[a-zA-Z0-9]{4,8}\/?$/.test(pathname)) return "invite";
  if (pathname === "/game-started") return "inviteBlocked";
  if (pathname === "/lobby-not-found") return "lobbyMissing";
  return "notFound";
}

function roomCodeFromPath(pathname) {
  const match = pathname.match(/^\/(?:join|lobby|game|watch)\/([a-zA-Z0-9]{4,8})\/?$/);
  return match ? match[1].toUpperCase() : null;
}

function navigateTo(screen, { replace = false } = {}) {
  viewerMode = screen === "watch";
  currentScreen = screen;
  routeRoomCode = roomCodeFromPath(location.pathname);
  const path = ROUTES[screen] || ROUTES.home;
  if (location.pathname !== path) {
    const method = replace ? "replaceState" : "pushState";
    history[method]({ screen }, "", path);
  }
  routeRoomCode = roomCodeFromPath(location.pathname);
  if (screen === "lobbies") requestOpenRooms();
  render();
}

function setRoute(path, { replace = false } = {}) {
  if (location.pathname === path) return;
  const method = replace ? "replaceState" : "pushState";
  history[method]({ screen: screenFromPath(path) }, "", path);
  currentScreen = screenFromPath(path);
  viewerMode = currentScreen === "watch";
  routeRoomCode = roomCodeFromPath(path);
}

function pathForRoom(room) {
  if (!room) return ROUTES.home;
  return room.state === "waiting" ? `/lobby/${room.code}` : `/game/${room.code}`;
}

function inviteLink(code) {
  return `${location.origin}/join/${code}`;
}

function watchLink(code) {
  return `${location.origin}/watch/${code}`;
}

function qrUrl(value, size = 220) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(value)}`;
}

function lobbyMaskedCode(code = "") {
  const length = Math.max(4, String(code || "").length || 4);
  return "•".repeat(length);
}

function lobbyCodeHtml(code, className = "") {
  const display = lobbySecretHidden ? lobbyMaskedCode(code) : escapeHtml(code);
  return `<button class="room-code secret-toggle ${className} ${lobbySecretHidden ? "is-secret-hidden" : ""}" data-action="toggle-lobby-secret" type="button" title="Скрыть/показать код и QR">${display}</button>`;
}

function inviteUrlHtml(value) {
  return `<div class="invite-url ${lobbySecretHidden ? "is-secret-hidden" : ""}">${lobbySecretHidden ? "ссылка скрыта на экране" : escapeHtml(value)}</div>`;
}

function qrImageHtml(value, label = "QR для входа") {
  const safeValue = escapeHtml(value);
  return `
    <button class="qr-card secret-toggle ${lobbySecretHidden ? "is-secret-hidden" : ""}" data-action="toggle-lobby-secret" type="button" title="Скрыть/показать код и QR">
      <img class="qr-image" src="${qrUrl(value)}" alt="${escapeHtml(label)}" loading="lazy">
      <div>
        <span class="bento-kicker">${escapeHtml(label)}</span>
        <p class="meta">Наведи камеру телефона — ссылка откроет лобби.</p>
        <div class="qr-url">${lobbySecretHidden ? "QR скрыт на экране" : safeValue}</div>
      </div>
    </button>
  `;
}

function getOrCreateSessionId() {
  const saved = localStorage.getItem(STORAGE_KEYS.sessionId);
  if (saved) return saved;

  const next = crypto.randomUUID
    ? crypto.randomUUID()
    : `player-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(STORAGE_KEYS.sessionId, next);
  return next;
}

function rememberSession(code, nextSessionId = sessionId) {
  sessionId = nextSessionId;
  localStorage.setItem(STORAGE_KEYS.sessionId, sessionId);
  localStorage.setItem(STORAGE_KEYS.roomCode, code);
  if (myName) localStorage.setItem(STORAGE_KEYS.playerName, myName);
}

function clearSavedRoom() {
  localStorage.removeItem(STORAGE_KEYS.roomCode);
}

function getMyId() {
  return sessionId;
}

function getMyPlayer() {
  return currentRoom?.players?.find((player) => player.id === getMyId()) || null;
}

function isSelfSpectator() {
  return getMyPlayer()?.role === "spectator";
}

function isSpectatorView() {
  return viewerMode || isSelfSpectator();
}

function activeLobbyPlayers(room = currentRoom) {
  return (room?.players || []).filter((player) => player.role !== "spectator");
}

function lobbySpectators(room = currentRoom) {
  return (room?.players || []).filter((player) => player.role === "spectator");
}

function randomWaitingMessage(seed = 0) {
  const index = Math.abs(seed + (currentRoom?.round || 0)) % COPY.status.length;
  return COPY.status[index];
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => {
    toast.hidden = true;
  }, 2600);
}

function playSound(name, { respectRoomSetting = false, fallback = null } = {}) {
  if (respectRoomSetting && currentRoom?.settings.soundsEnabled === false) return;
  const src = SOUND_FILES[name];
  if (!src) {
    fallback?.();
    return;
  }

  const audio = new Audio(src);
  audio.volume = 0.55;
  audio.play().catch(() => {
    fallback?.();
  });
}

function requestOpenRooms() {
  openRoomsLoading = true;
  if (openRoomsTimer) clearTimeout(openRoomsTimer);
  openRoomsTimer = setTimeout(() => {
    if (!openRoomsLoading) return;
    openRoomsLoading = false;
    if (!currentRoom && currentScreen === "lobbies") render();
    showToast(COPY.messages.roomsRefreshFailed);
  }, 5000);
  socket.emit("listOpenRooms");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizePackId(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 32);
}

function createPromptPackId() {
  return `pack_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function parsePromptLines(value = "") {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, CUSTOM_PROMPTS_PER_PACK_LIMIT);
}

function sanitizeCustomPromptPack(pack, index = 0) {
  const id = normalizePackId(pack?.id) || createPromptPackId();
  const name = String(pack?.name || `Свой пак ${index + 1}`).trim().slice(0, CUSTOM_PACK_NAME_LIMIT);
  const prompts = Array.isArray(pack?.prompts)
    ? pack.prompts.map((line) => String(line || "").trim()).filter(Boolean).slice(0, CUSTOM_PROMPTS_PER_PACK_LIMIT)
    : parsePromptLines(pack?.promptsText || "");
  if (!name || !prompts.length) return null;
  return { id, name, prompts };
}

function loadCustomPromptPacks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.customPromptPacks) || "[]");
    const packs = Array.isArray(parsed) ? parsed : [];
    return packs
      .slice(0, CUSTOM_PROMPT_PACK_LIMIT)
      .map((pack, index) => sanitizeCustomPromptPack(pack, index))
      .filter(Boolean);
  } catch (error) {
    return [];
  }
}

function saveCustomPromptPacks(packs) {
  const clean = (Array.isArray(packs) ? packs : [])
    .slice(0, CUSTOM_PROMPT_PACK_LIMIT)
    .map((pack, index) => sanitizeCustomPromptPack(pack, index))
    .filter(Boolean);
  localStorage.setItem(STORAGE_KEYS.customPromptPacks, JSON.stringify(clean));
  return clean;
}

function customPromptPackById(id) {
  return loadCustomPromptPacks().find((pack) => pack.id === normalizePackId(id));
}

function customPromptPacksHtml() {
  const packs = loadCustomPromptPacks();
  const cards = packs.map((pack, index) => `
    <article class="custom-pack-card" data-pack-id="${escapeHtml(pack.id)}">
      <div class="custom-pack-head">
        <div>
          <strong>Пак ${index + 1}</strong>
          <p class="meta">${pack.prompts.length} начал</p>
        </div>
        <button class="btn ghost mini-btn" data-action="delete-custom-pack" data-pack-id="${escapeHtml(pack.id)}" type="button">${COPY.buttons.deletePromptPack}</button>
      </div>
      <label class="field"><span>Название</span><input data-custom-pack-name="${escapeHtml(pack.id)}" maxlength="${CUSTOM_PACK_NAME_LIMIT}" value="${escapeHtml(pack.name)}"></label>
      <label class="field"><span>Начала фраз</span><textarea class="custom-pack-textarea" data-custom-pack-prompts="${escapeHtml(pack.id)}" rows="5">${escapeHtml(pack.prompts.join("\n"))}</textarea></label>
      <button class="btn secondary compact-btn" data-action="save-custom-pack" data-pack-id="${escapeHtml(pack.id)}" type="button">${COPY.buttons.savePromptPack}</button>
    </article>
  `).join("");

  const createDisabled = packs.length >= CUSTOM_PROMPT_PACK_LIMIT;
  return `
    <details class="custom-packs-panel">
      <summary class="custom-packs-summary">
        <div class="custom-packs-title">
          <div>
            <h3>${COPY.settings.customPacks}</h3>
            <p class="meta">${COPY.settings.customPacksClosedHint}</p>
          </div>
          <span class="mini-badge">${packs.length}/${CUSTOM_PROMPT_PACK_LIMIT}</span>
        </div>
      </summary>
      <div class="custom-packs-body">
        <p class="meta">${COPY.settings.customPacksHint}</p>
        ${cards || `<p class="meta">Своих паков пока нет.</p>`}
        ${createDisabled ? "" : `
          <div class="custom-pack-create">
            <label class="field"><span>Название нового пака</span><input id="newCustomPackName" maxlength="${CUSTOM_PACK_NAME_LIMIT}" placeholder="Например, Наши локалки"></label>
            <label class="field"><span>Начала нового пака</span><textarea id="newCustomPackPrompts" class="custom-pack-textarea" rows="5" placeholder="${escapeHtml("Когда {{player}} сказал, что всё под контролем...\nЕсли бы {{player2}} был хостом, то...")}"></textarea></label>
            <button class="btn primary compact-btn" data-action="create-custom-pack" type="button">${COPY.buttons.createPromptPack}</button>
          </div>
        `}
      </div>
    </details>
  `;
}

function getMe() {
  return currentRoom?.players.find((player) => player.id === getMyId());
}

function isHost() {
  return currentRoom?.hostId === getMyId();
}

function isDuelMode() {
  return currentRoom?.gameMode === "duel_tournament";
}

function currentDuelBattle() {
  return isDuelMode() ? currentRoom?.duel?.currentBattle : null;
}

function duelParticipantIds() {
  return new Set(currentDuelBattle()?.participantIds || []);
}

function isDuelParticipant(playerId = getMyId()) {
  return duelParticipantIds().has(playerId);
}

function duelPromptAuthors() {
  const participants = duelParticipantIds();
  return activeLobbyPlayers().filter((player) => player.connected && !participants.has(player.id));
}

function isDuelPromptAuthor(playerId = getMyId()) {
  if (!isDuelMode() || currentRoom?.state !== "prompting") return true;
  return duelPromptAuthors().some((player) => player.id === playerId);
}

function expectedPromptCount() {
  if (isDuelMode() && currentRoom?.state === "prompting") return duelPromptAuthors().length;
  return activeLobbyPlayers().filter((player) => player.connected).length;
}

function expectedAnswerers() {
  if (isDuelMode() && currentDuelBattle()) {
    const participants = duelParticipantIds();
    return activeLobbyPlayers().filter((player) => player.connected && participants.has(player.id));
  }
  return activeLobbyPlayers().filter((player) => player.connected);
}

function expectedVoters() {
  if (isDuelMode() && currentDuelBattle()) {
    const participants = duelParticipantIds();
    const judges = activeLobbyPlayers().filter((player) => player.connected && !participants.has(player.id));
    return judges.length ? judges : activeLobbyPlayers().filter((player) => player.connected);
  }
  return activeLobbyPlayers().filter((player) => player.connected);
}

function canVoteCurrentRound() {
  if (!isDuelMode() || !currentDuelBattle()) return true;
  return expectedVoters().some((player) => player.id === getMyId());
}

function duelBattleNames() {
  const battle = currentDuelBattle();
  return (battle?.participantIds || []).map((id) => getPlayerName(id)).join(" vs ");
}

function duelBattleTitle() {
  if (!isDuelMode()) return "Дуэльный турнир";
  const stage = currentRoom?.duel?.stageName || "Бой";
  const names = duelBattleNames();
  return names ? `${stage} · ${names}` : stage;
}

function getPlayerName(id) {
  return currentRoom?.players.find((player) => player.id === id)?.name || "аноним из оперативки";
}

function getInitial(name) {
  return String(name || "?").trim().slice(0, 1).toUpperCase() || "?";
}

function getPrompt(promptId) {
  return currentRoom?.prompts.find((prompt) => prompt.id === promptId);
}

function getMyPrompt() {
  return currentRoom?.prompts.find((prompt) => prompt.authorId === getMyId());
}

function getMyAnswer() {
  return currentRoom?.answers.find((answer) => answer.authorId === getMyId());
}

function hasSubmittedPrompt() {
  return currentRoom?.prompts.some((prompt) => prompt.authorId === getMyId());
}

function hasSubmittedAnswer() {
  return currentRoom?.answers.some((answer) => answer.authorId === getMyId());
}

function hasVoted() {
  return currentRoom?.votes.some((vote) => vote.voterId === getMyId());
}

function hasGrandVoted() {
  return currentRoom?.grandFinal?.votes?.some((vote) => vote.voterId === getMyId());
}

function canVoteGrandJoke(joke) {
  const candidates = currentRoom?.grandFinal?.candidates || [];
  const available = candidates.filter((item) => item.promptAuthorId !== getMyId() && item.answerAuthorId !== getMyId());
  if (!available.length) return true;
  return joke.promptAuthorId !== getMyId() && joke.answerAuthorId !== getMyId();
}

function timerHtml() {
  if (!currentRoom?.timerEndsAt) return "";
  return `<div class="timer" id="timerText">Осталось: ${getRemainingSeconds()} сек.</div>`;
}

function syncedNow() {
  return Date.now() + serverTimeOffset;
}

function getRemainingSeconds() {
  if (!currentRoom?.timerEndsAt) return 0;
  return Math.max(0, Math.ceil((currentRoom.timerEndsAt - syncedNow()) / 1000));
}

function getStartingCountdownSeconds() {
  if (!currentRoom?.timerEndsAt) return 5;
  const seconds = Math.ceil((currentRoom.timerEndsAt - syncedNow()) / 1000);
  return Math.max(1, Math.min(5, seconds));
}

function captureTypingFocus() {
  const active = document.activeElement;
  if (!active || !["promptInput", "answerInput"].includes(active.id)) return null;
  return {
    id: active.id,
    value: active.value,
    selectionStart: active.selectionStart,
    selectionEnd: active.selectionEnd,
    scrollTop: active.scrollTop
  };
}

function restoreTypingFocus(focusState) {
  if (!focusState) return;
  const restore = () => {
    const input = document.getElementById(focusState.id);
    if (!input) return;
    input.focus({ preventScroll: true });
    if (typeof focusState.selectionStart === "number" && typeof focusState.selectionEnd === "number") {
      const max = input.value.length;
      input.setSelectionRange(Math.min(focusState.selectionStart, max), Math.min(focusState.selectionEnd, max));
    }
    if (typeof focusState.scrollTop === "number") input.scrollTop = focusState.scrollTop;
  };
  requestAnimationFrame(() => {
    restore();
    setTimeout(restore, 30);
  });
}

function promptDraftKey(room = currentRoom) {
  return room ? `${room.code}:${room.round}:${getMyId()}` : "";
}

function answerDraftKey(room = currentRoom) {
  return room ? `${room.code}:${room.round}:${getMyId()}` : "";
}

function getPromptDraft() {
  const key = promptDraftKey();
  if (Object.prototype.hasOwnProperty.call(inputDrafts.prompts, key)) return inputDrafts.prompts[key];
  return getMyPrompt()?.text || "";
}

function getAnswerDraft() {
  const key = answerDraftKey();
  if (Object.prototype.hasOwnProperty.call(inputDrafts.answers, key)) return inputDrafts.answers[key];
  return getMyAnswer()?.text || "";
}

function getPromptAudioDraft() {
  const key = promptDraftKey();
  if (Object.prototype.hasOwnProperty.call(audioDrafts.prompts, key)) return audioDrafts.prompts[key];
  return getMyPrompt()?.audio || null;
}

function getAnswerAudioDraft() {
  const key = answerDraftKey();
  if (Object.prototype.hasOwnProperty.call(audioDrafts.answers, key)) return audioDrafts.answers[key];
  return getMyAnswer()?.audio || null;
}

function setAudioDraft(type, audio) {
  const key = type === "prompt" ? promptDraftKey() : answerDraftKey();
  if (!key) return;
  if (type === "prompt") audioDrafts.prompts[key] = audio;
  else audioDrafts.answers[key] = audio;
}

function getAudioDraft(type) {
  return type === "prompt" ? getPromptAudioDraft() : getAnswerAudioDraft();
}

function isAllowedAudioFile(file) {
  if (!file) return false;
  const type = String(file.type || "").toLowerCase().split(";")[0];
  const name = String(file.name || "").toLowerCase();
  const allowedExtension = /\.(mp3|wav|ogg|webm|m4a|aac|flac)$/i.test(name);
  const allowedContainer = ["video/webm", "video/mp4", "application/ogg"].includes(type);
  return type.startsWith("audio/") || allowedExtension || allowedContainer;
}

function recordingExtensionFromMime(mime = "") {
  const clean = String(mime || "").toLowerCase();
  if (clean.includes("mpeg") || clean.includes("mp3")) return "mp3";
  if (clean.includes("mp4")) return "m4a";
  if (clean.includes("ogg")) return "ogg";
  return "webm";
}

function recordingDisplayType(mime = "") {
  const clean = String(mime || "").toLowerCase();
  if (clean.includes("mpeg") || clean.includes("mp3")) return "audio/mpeg";
  if (clean.includes("mp4")) return "audio/mp4";
  if (clean.includes("ogg")) return "audio/ogg";
  if (clean.includes("webm")) return "audio/webm";
  return clean || "audio/webm";
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("file read failed"));
    reader.readAsDataURL(blob);
  });
}

function getAudioDurationFromUrl(url) {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const durationMs = Number.isFinite(audio.duration) ? Math.round(audio.duration * 1000) : 0;
      URL.revokeObjectURL(url);
      resolve(durationMs);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    audio.src = url;
  });
}

async function getFileAudioDurationMs(file) {
  try {
    const url = URL.createObjectURL(file);
    return await getAudioDurationFromUrl(url);
  } catch (error) {
    return 0;
  }
}

async function fileToAudioPayload(file, fallbackName = "voice.webm", source = "uploaded", durationMs = null) {
  if (!file) return null;
  if (file.size > MAX_AUDIO_BYTES) throw new Error("audio-too-large");
  if (!isAllowedAudioFile(file)) throw new Error("audio-unsupported");
  const dataUrl = await blobToDataUrl(file);
  const resolvedDurationMs = Number.isFinite(durationMs) && durationMs !== null
    ? Math.max(0, Math.round(durationMs))
    : await getFileAudioDurationMs(file);
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `audio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(file.name || fallbackName).slice(0, 120),
    type: file.type || "audio/webm",
    size: file.size,
    source,
    durationMs: resolvedDurationMs,
    dataUrl
  };
}

async function applyAudioFile(type, file) {
  try {
    const payload = await fileToAudioPayload(file, file.name || "audio-file", "uploaded");
    setAudioDraft(type, payload);
    showToast(COPY.messages.audioReady);
    render();
  } catch (error) {
    showToast(error.message === "audio-too-large" ? COPY.messages.audioTooLarge : COPY.messages.audioUnsupported);
  }
}

function formatAudioTime(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  const rest = String(safe % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function voiceBarsHtml(count = 36) {
  const pattern = [9, 18, 13, 24, 12, 29, 16, 21, 11, 26, 15, 31, 18, 23, 10, 28, 14, 20, 12, 25, 17, 30, 13, 22, 9, 27, 16, 24, 11, 19, 14, 29, 18, 21, 12, 26, 15, 30, 10, 23, 17, 28, 13, 20, 11, 25, 16, 31, 14, 22, 9, 27, 18, 24, 12, 29, 15, 21, 10, 26];
  return Array.from({ length: count }, (_, index) => {
    const height = pattern[index % pattern.length];
    return `<span style="--i:${index};--bar-h:${height}px"></span>`;
  }).join("");
}

function audioPlayerHtml(audio, { compact = false } = {}) {
  if (!audio?.dataUrl) return "";
  const safeSrc = escapeHtml(audio.dataUrl);
  const bars = voiceBarsHtml(compact ? 28 : 48);
  return `
    <div class="voice-message ${compact ? "voice-message-compact" : ""}">
      <button class="voice-play" type="button" data-action="toggle-audio" aria-label="Воспроизвести аудио">▶</button>
      <div class="voice-body">
        <div class="voice-wave" data-voice-seek role="slider" aria-label="Перемотать аудио" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">${bars}</div>
        <div class="voice-meta-row">
          <span class="voice-time">0:00 / 0:00</span>
          <span class="voice-kind">голосовое</span>
        </div>
      </div>
      <audio preload="metadata" src="${safeSrc}"></audio>
    </div>
  `;
}

function audioInputHtml(type) {
  const audio = getAudioDraft(type);
  const isRecording = activeRecording?.type === type;
  const label = type === "prompt" ? "голосовое начало" : "голосовая концовка";
  return `
    <div class="audio-tools ${isRecording ? "is-recording" : ""}" data-audio-drop="${type}">
      <div class="audio-tools-head">
        <div>
          <span class="audio-tools-title">Голос или аудио</span>
          <p class="meta audio-tools-note">Можно написать текстом, записать голосом, прикрепить или перетащить аудиофайл до 20 МБ.</p>
        </div>
        <span class="audio-limit">20 МБ</span>
      </div>
      ${audio ? `
        <div class="audio-current">
          ${audioPlayerHtml(audio)}
          <button class="inline-edit audio-remove-link" data-action="remove-audio-${type}" type="button">${COPY.buttons.removeAudio}</button>
        </div>
      ` : isRecording ? `
        <div class="recording-preview" aria-live="polite">
          <div class="recording-dot"></div>
          <div class="recording-wave" aria-hidden="true">${voiceBarsHtml(42)}</div>
          <span class="recording-time" data-recording-time>0:00</span>
        </div>
      ` : `
        <div class="audio-empty-card">
          <span class="audio-empty-icon">🎙</span>
          <span>Аудио пока не добавлено</span>
        </div>
      `}
      <div class="audio-tool-actions">
        <button class="btn ghost compact-btn record-btn" type="button" data-action="${isRecording ? `stop-recording-${type}` : `start-recording-${type}`}">${isRecording ? COPY.buttons.stopRecording : COPY.buttons.recordAudio}</button>
        <label class="btn ghost compact-btn audio-file-label">
          ${COPY.buttons.chooseAudio}
          <input class="sr-only" type="file" accept="${AUDIO_ACCEPT}" data-audio-input="${type}" aria-label="Прикрепить ${label}">
        </label>
      </div>
    </div>
  `;
}

async function startAudioRecording(type) {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    showToast("Браузер не поддерживает запись с микрофона.");
    return;
  }

  if (activeRecording) {
    stopAudioRecording();
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const preferredTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/mp4;codecs=mp4a.40.2",
      "audio/mp4",
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "video/webm;codecs=opus",
      "video/webm"
    ];
    const mimeType = preferredTypes.find((item) => MediaRecorder.isTypeSupported?.(item));
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks = [];

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data?.size) chunks.push(event.data);
    });

    recorder.addEventListener("stop", async () => {
      if (activeRecording?.stopTimer) {
        clearTimeout(activeRecording.stopTimer);
        activeRecording.stopTimer = null;
      }
      stream.getTracks().forEach((track) => track.stop());
      const rawMime = recorder.mimeType || "audio/webm";
      const displayType = recordingDisplayType(rawMime);
      const blob = new Blob(chunks, { type: displayType });
      const ext = recordingExtensionFromMime(displayType);
      const fileName = `voice-${Date.now()}.${ext}`;
      activeRecording = null;
      stopRecordingTicker();
      try {
        const durationMs = activeRecording?.startedAt ? Math.min(MAX_RECORDING_MS, Date.now() - activeRecording.startedAt) : 0;
        const payload = await fileToAudioPayload(new File([blob], fileName, { type: displayType }), fileName, "recorded", durationMs);
        setAudioDraft(type, payload);
        showToast(COPY.messages.audioReady);
      } catch (error) {
        showToast(error.message === "audio-too-large" ? COPY.messages.audioTooLarge : COPY.messages.fileReadFailed);
      }
      render();
    });

    activeRecording = { type, recorder, stream, startedAt: Date.now(), stopTimer: null };
    activeRecording.stopTimer = setTimeout(() => {
      if (!activeRecording || activeRecording.recorder !== recorder) return;
      showToast(COPY.messages.recordingLimit);
      stopAudioRecording();
    }, MAX_RECORDING_MS);
    recorder.start();
    showToast(COPY.messages.recordingStarted);
    render();
    startRecordingTicker();
  } catch (error) {
    showToast(COPY.messages.micDenied);
  }
}

function updateRecordingTimer() {
  if (!activeRecording?.startedAt) return;
  const elapsed = Math.min(MAX_RECORDING_MS / 1000, (Date.now() - activeRecording.startedAt) / 1000);
  document.querySelectorAll("[data-recording-time]").forEach((node) => {
    node.textContent = formatAudioTime(elapsed);
  });
}

function startRecordingTicker() {
  if (recordingTicker) clearInterval(recordingTicker);
  updateRecordingTimer();
  recordingTicker = setInterval(updateRecordingTimer, 250);
}

function stopRecordingTicker() {
  if (recordingTicker) clearInterval(recordingTicker);
  recordingTicker = null;
}

function stopAudioRecording() {
  if (!activeRecording) return;
  if (activeRecording.stopTimer) {
    clearTimeout(activeRecording.stopTimer);
    activeRecording.stopTimer = null;
  }
  if (activeRecording.recorder.state !== "inactive") {
    activeRecording.recorder.stop();
  }
}

function updateVoiceWaveProgress(voice, audio) {
  if (!voice || !audio) return;
  const wave = voice.querySelector(".voice-wave");
  if (!wave) return;
  const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
  const progress = duration ? Math.max(0, Math.min(1, (audio.currentTime || 0) / duration)) : 0;
  wave.style.setProperty("--voice-progress", `${Math.round(progress * 100)}%`);
  wave.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
  const bars = Array.from(wave.querySelectorAll("span"));
  const activeCount = Math.round(progress * bars.length);
  bars.forEach((bar, index) => bar.classList.toggle("is-active", index < activeCount));
}

function updateVoiceMessageTime(voice, audio) {
  if (!voice || !audio) return;
  const timeNode = voice.querySelector(".voice-time");
  if (timeNode) {
    const current = formatAudioTime(audio.currentTime || 0);
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? formatAudioTime(audio.duration) : "0:00";
    timeNode.textContent = `${current} / ${duration}`;
  }
  updateVoiceWaveProgress(voice, audio);
}

function seekVoiceFromPointer(voice, audio, event) {
  const wave = voice?.querySelector(".voice-wave");
  if (!wave || !audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
  const rect = wave.getBoundingClientRect();
  const clientX = event.clientX ?? event.touches?.[0]?.clientX;
  if (typeof clientX !== "number") return;
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  audio.currentTime = ratio * audio.duration;
  updateVoiceMessageTime(voice, audio);
}

function bindVoiceSeek(voice, audio) {
  const wave = voice.querySelector(".voice-wave");
  if (!wave || wave.dataset.boundSeek === "1") return;
  wave.dataset.boundSeek = "1";
  let seeking = false;
  wave.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    seeking = true;
    wave.setPointerCapture?.(event.pointerId);
    seekVoiceFromPointer(voice, audio, event);
  });
  wave.addEventListener("pointermove", (event) => {
    if (!seeking) return;
    event.preventDefault();
    seekVoiceFromPointer(voice, audio, event);
  });
  const finishSeek = (event) => {
    if (!seeking) return;
    seeking = false;
    wave.releasePointerCapture?.(event.pointerId);
  };
  wave.addEventListener("pointerup", finishSeek);
  wave.addEventListener("pointercancel", finishSeek);
}

function initializeVoiceMessages() {
  document.querySelectorAll(".voice-message").forEach((voice) => {
    const audio = voice.querySelector("audio");
    if (!audio) return;
    bindVoiceSeek(voice, audio);
    if (audio.dataset.boundVoiceUi === "1") {
      updateVoiceMessageTime(voice, audio);
      return;
    }

    audio.dataset.boundVoiceUi = "1";
    audio.addEventListener("loadedmetadata", () => updateVoiceMessageTime(voice, audio));
    audio.addEventListener("timeupdate", () => updateVoiceMessageTime(voice, audio));
    audio.addEventListener("durationchange", () => updateVoiceMessageTime(voice, audio));
    audio.addEventListener("play", () => voice.classList.add("is-playing"));
    audio.addEventListener("pause", () => voice.classList.remove("is-playing"));
    audio.addEventListener("ended", () => voice.classList.remove("is-playing"));
    updateVoiceMessageTime(voice, audio);
  });
}

function clearDraftForState(state, room = currentRoom) {
  if (!room) return;
  const promptKey = `${room.code}:${room.round}:${getMyId()}`;
  const answerKey = `${room.code}:${room.round}:${getMyId()}`;
  if (!["prompting", "collectingSharedPrompts"].includes(state)) {
    delete inputDrafts.prompts[promptKey];
    delete audioDrafts.prompts[promptKey];
    promptEditMode = false;
  }
  if (state !== "answering") {
    delete inputDrafts.answers[answerKey];
    delete audioDrafts.answers[answerKey];
    answerEditMode = false;
  }
}

function startTimerView() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const remaining = getRemainingSeconds();
    const node = document.getElementById("timerText");
    if (node && currentRoom?.timerEndsAt) {
      node.textContent = `Осталось: ${remaining} сек.`;
    }

    const countdownNode = document.querySelector(".countdown-number");
    if (countdownNode && currentRoom?.timerEndsAt) {
      countdownNode.textContent = getStartingCountdownSeconds();
    }
  }, 500);
}

function copyText(text) {
  playSound("copy");

  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => showToast(COPY.messages.copied));
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  showToast(COPY.messages.copied);
  return Promise.resolve();
}

function copyWithButtonFeedback(text, button) {
  const originalText = button?.textContent;
  return copyText(text).then(() => {
    if (!button || !originalText) return;
    button.textContent = "Скопировано";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 1700);
  });
}


function findGrandJoke(jokeId) {
  const summaryWinners = currentRoom?.finalSummary?.grandFinal?.winners || [];
  const grandWinners = currentRoom?.grandFinal?.winners || [];
  const candidates = currentRoom?.grandFinal?.candidates || [];
  return [...summaryWinners, ...grandWinners, ...candidates].find((joke) => joke.jokeId === jokeId || joke.answerId === jokeId) || null;
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 8) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  const clipped = lines.slice(0, maxLines);
  if (lines.length > maxLines) clipped[maxLines - 1] = `${clipped[maxLines - 1].replace(/\.{3}$/g, "")}...`;
  clipped.forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight));
  return y + clipped.length * lineHeight;
}

function buildShareCanvas(joke, { label = "Шутка вечера" } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#231724");
  gradient.addColorStop(0.55, "#101017");
  gradient.addColorStop(1, "#12313a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 107, 107, 0.18)";
  ctx.beginPath(); ctx.arc(120, 120, 260, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(78, 205, 196, 0.14)";
  ctx.beginPath(); ctx.arc(970, 120, 240, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255, 209, 102, 0.10)";
  ctx.beginPath(); ctx.arc(540, 1760, 340, 0, Math.PI * 2); ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "900 82px Arial, sans-serif";
  ctx.fillText("Textic Chat", 540, 185);

  ctx.font = "800 34px Arial, sans-serif";
  ctx.fillStyle = "#ffd166";
  ctx.fillText(label, 540, 255);

  const cardX = 90;
  const cardY = 390;
  const cardW = 900;
  const cardH = 960;
  ctx.fillStyle = "rgba(30, 30, 42, 0.92)";
  ctx.strokeStyle = "rgba(247, 241, 232, 0.16)";
  ctx.lineWidth = 3;
  roundRect(ctx, cardX, cardY, cardW, cardH, 46, true, true);

  ctx.textAlign = "left";
  ctx.fillStyle = "#aaa4b5";
  ctx.font = "800 28px Arial, sans-serif";
  ctx.fillText(`Раунд ${joke.round || ""}`, cardX + 58, cardY + 80);

  ctx.fillStyle = "#f7f1e8";
  ctx.font = "900 48px Arial, sans-serif";
  let y = cardY + 165;
  y = wrapCanvasText(ctx, joke.promptText || (joke.promptAudio ? "[голосовое начало]" : "Голосовое начало"), cardX + 58, y, cardW - 116, 62, 7) + 34;

  ctx.strokeStyle = "#ff6b6b";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(cardX + 62, y + 6);
  ctx.lineTo(cardX + 62, y + 150);
  ctx.stroke();

  ctx.fillStyle = "#f7f1e8";
  ctx.font = "500 38px Arial, sans-serif";
  y = wrapCanvasText(ctx, joke.answerText || (joke.answerAudio ? "[голосовая концовка]" : "Голосовая концовка"), cardX + 90, y + 48, cardW - 150, 52, 9);

  const author = joke.authorName || [joke.promptAuthorName, joke.answerAuthorName].filter(Boolean).join(" + ") || "компания друзей";
  ctx.fillStyle = "rgba(255, 209, 102, 0.12)";
  roundRect(ctx, 160, 1455, 760, 104, 52, true, false);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffdca0";
  ctx.font = "800 34px Arial, sans-serif";
  ctx.fillText(author, 540, 1520);

  ctx.fillStyle = "#aaa4b5";
  ctx.font = "700 28px Arial, sans-serif";
  ctx.fillText("textic-chat.onrender.com", 540, 1735);
  return canvas;
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

async function shareJokeCard(joke, options = {}) {
  try {
    const canvas = buildShareCanvas(joke, options);
    const blob = await canvasToBlob(canvas);
    if (!blob) throw new Error("empty image");
    const file = new File([blob], "textic-chat-share.png", { type: "image/png" });
    const shareData = {
      title: "Textic Chat",
      text: "Шутка из игры Textic Chat",
      files: [file]
    };
    if (navigator.canShare?.(shareData) && navigator.share) {
      await navigator.share(shareData);
      showToast(COPY.messages.shareReady);
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "textic-chat-share.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(COPY.messages.shareFailed);
  } catch (error) {
    showToast(COPY.messages.shareFailed);
  }
}

async function shareInviteLink(code) {
  const url = inviteLink(code);
  if (navigator.share) {
    try {
      await navigator.share({ title: "Textic Chat", text: "Заходи в лобби", url });
      return;
    } catch (error) {
      // fallback below
    }
  }
  copyText(url);
}

function ensureNameThen(action) {
  if (myName) {
    action();
    return;
  }

  pendingNameAction = action;
  renderNameModal();
}

function closeNameModal() {
  pendingNameAction = null;
  document.getElementById("nameModal")?.remove();
}

function normalizeSettingsSignature(settings) {
  return JSON.stringify({
    maxRounds: String(settings.maxRounds ?? ""),
    promptSeconds: String(settings.promptSeconds ?? ""),
    answerSeconds: String(settings.answerSeconds ?? ""),
    voteSeconds: String(settings.voteSeconds ?? ""),
    promptMode: String(settings.promptMode ?? ""),
    promptPack: String(settings.promptPack ?? ""),
    spectatorVoting: String(settings.spectatorVoting ?? ""),
    maxPlayers: String(settings.maxPlayers ?? ""),
    anonymousMode: Boolean(settings.anonymousMode),
    soundsEnabled: Boolean(settings.soundsEnabled),
    publicLobby: Boolean(settings.publicLobby),
    spectatorMode: Boolean(settings.spectatorMode)
  });
}

function currentSettingsSignature() {
  return normalizeSettingsSignature(readSettings());
}

function closeSettingsModal() {
  lobbySettingsOpen = false;
  settingsModalInitialSignature = null;
  document.getElementById("settingsModal")?.remove();
  document.getElementById("settingsDiscardConfirm")?.remove();
}

function hasUnsavedSettingsChanges() {
  return Boolean(lobbySettingsOpen && settingsModalInitialSignature && currentSettingsSignature() !== settingsModalInitialSignature);
}

function renderSettingsDiscardConfirm() {
  document.getElementById("settingsDiscardConfirm")?.remove();
  document.body.insertAdjacentHTML("beforeend", `
    <div class="discard-backdrop" id="settingsDiscardConfirm">
      <section class="discard-modal" role="dialog" aria-modal="true" aria-labelledby="settingsDiscardTitle">
        <h3 id="settingsDiscardTitle">Есть несохранённые изменения</h3>
        <p class="meta">Если закрыть настройки сейчас, изменения не сохранятся.</p>
        <div class="modal-actions">
          <button class="btn primary" data-action="discard-settings-changes">Закрыть без сохранения</button>
          <button class="btn ghost" data-action="continue-settings-edit">Продолжить редактировать</button>
        </div>
      </section>
    </div>
  `);
}

function requestCloseSettingsModal() {
  if (hasUnsavedSettingsChanges()) {
    renderSettingsDiscardConfirm();
    return;
  }
  closeSettingsModal();
}

function openSettingsModal() {
  lobbySettingsOpen = true;
  settingsModalInitialSignature = null;
  renderSettingsModal();
}

function renderNameModal({ title = "Введите ник", note = "Он будет виден друзьям в лобби.", buttonText = "Продолжить" } = {}) {
  document.getElementById("nameModal")?.remove();
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" id="nameModal">
      <section class="name-modal" role="dialog" aria-modal="true" aria-labelledby="nameModalTitle">
        <h2 id="nameModalTitle">${escapeHtml(title)}</h2>
        <p class="meta">${escapeHtml(note)}</p>
        <input id="modalNameInput" maxlength="32" placeholder="${COPY.placeholders.name}" value="${escapeHtml(myName)}" autocomplete="nickname">
        <div class="modal-actions">
          <button class="btn primary" data-action="confirm-name">${escapeHtml(buttonText)}</button>
          <button class="btn ghost" data-action="cancel-name">Отмена</button>
        </div>
      </section>
    </div>
  `);
  document.getElementById("modalNameInput")?.focus();
}

function renderSettingsModal() {
  document.getElementById("settingsModal")?.remove();
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" id="settingsModal">
      <section class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settingsModalTitle">
        <div class="section-row settings-modal-head">
          <h2 id="settingsModalTitle" class="section-title">Настройки игры</h2>
          <button class="modal-close" data-action="close-settings" aria-label="Закрыть настройки">×</button>
        </div>
        ${roomSettingsFormHtml(currentRoom)}
      </section>
    </div>
  `);
  updateModeSettingsUi();
  if (!settingsModalInitialSignature) {
    settingsModalInitialSignature = currentSettingsSignature();
  }
}

function updateModeSettingsUi() {
  const modeId = currentRoom?.gameMode || "classic_pairs";
  const promptMode = document.getElementById("promptMode")?.value || DEFAULT_ROOM_SETTINGS.promptMode;
  const hideRounds = modeId === "duel_tournament" || modeId === "chaos_chain" || modeId === "story_chain" || (modeId === "shared_prompt" && promptMode === "manual");
  document.querySelectorAll(".rounds-field").forEach((field) => {
    field.classList.toggle("is-hidden-by-mode", hideRounds);
  });
  document.querySelectorAll(".shared-rounds-hint").forEach((hint) => {
    hint.textContent = modeId === "duel_tournament"
      ? "Дуэльный турнир сам строит сетку по количеству игроков."
      : (modeId === "chaos_chain"
        ? "Цепочка хаоса идёт одной историей: игрок видит только предыдущий кусок."
        : (modeId === "story_chain"
          ? "Шутка с продолжением идёт одной историей: игрок видит весь предыдущий контекст."
          : (modeId === "shared_prompt" ? COPY.settings.sharedRoundsHint : "")));
  });
}

function playTone(notes) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = note.frequency;
      osc.type = "square";
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + note.start);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + note.start + note.duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + note.start);
      osc.stop(ctx.currentTime + note.start + note.duration + 0.02);
    });
    setTimeout(() => ctx.close(), 900);
  } catch (error) {
    // Browsers may block audio before the first user gesture.
  }
}

function playRevealSound() {
  if (!currentRoom?.settings.soundsEnabled) return;
  playSound("reveal", {
    respectRoomSetting: true,
    fallback: () => playTone([
      { frequency: 523, start: 0, duration: 0.09 },
      { frequency: 659, start: 0.1, duration: 0.09 },
      { frequency: 784, start: 0.2, duration: 0.14 }
    ])
  });
}

function playWinSound() {
  if (!currentRoom?.settings.soundsEnabled) return;
  playSound("win", {
    respectRoomSetting: true,
    fallback: () => playTone([
      { frequency: 659, start: 0, duration: 0.12 },
      { frequency: 784, start: 0.14, duration: 0.12 },
      { frequency: 988, start: 0.28, duration: 0.22 }
    ])
  });
}

function renderHome() {
  app.classList.add("plain-menu-card");
  app.innerHTML = `
    <div class="simple-menu party-home-menu">
      <button class="btn primary menu-btn" data-route="create">Создать игру</button>
      <button class="btn primary menu-btn" data-route="join">Войти в игру</button>
    </div>
  `;
}

function renderJoinMenu() {
  app.classList.add("plain-menu-card");
  app.innerHTML = `
    <h2 class="panel-title menu-title">Войти в игру</h2>
    <div class="simple-menu">
      <button class="btn primary menu-btn" data-route="lobbies">Список серверов</button>
      <button class="btn primary menu-btn" data-route="code">Войти по коду</button>
      <button class="btn ghost menu-btn" data-route="home">Назад</button>
    </div>
  `;
}

function renderCodeJoin() {
  app.classList.add("plain-menu-card", "code-join-card");
  app.innerHTML = `
    <h2 class="panel-title">Войти по коду</h2>
    <section class="home-panel code-panel">
      <label class="field">
        <span>${COPY.labels.roomCode}</span>
        <input id="roomCodeInput" maxlength="8" placeholder="${COPY.placeholders.roomCode}" autocomplete="off">
      </label>
      <div class="actions">
        <button class="btn primary" data-action="join-room">${COPY.buttons.joinRoom}</button>
        <button class="btn ghost" data-route="join">Назад</button>
      </div>
    </section>
  `;
}

function renderInviteJoin() {
  const code = routeRoomCode || "";
  app.classList.add("plain-menu-card", "code-join-card");
  app.innerHTML = `
    <h2 class="panel-title">Вход в лобби</h2>
    <section class="home-panel code-panel">
      <div class="invite-route-code">
        <span class="bento-kicker">код лобби</span>
        <span class="room-code">${escapeHtml(code)}</span>
      </div>
      <p class="meta centered-meta">Сейчас попросим ник и добавим вас в лобби, если игра еще не началась.</p>
      <div class="actions">
        <button class="btn primary" data-action="join-invite">${myName ? "Войти в лобби" : "Ввести ник"}</button>
        <button class="btn ghost" data-route="home">Назад</button>
      </div>
    </section>
  `;
}


function renderWatchJoin() {
  const code = routeRoomCode || "";
  app.classList.add("plain-menu-card", "code-join-card");
  app.innerHTML = `
    <h2 class="panel-title">Режим зрителя</h2>
    <section class="home-panel code-panel spectator-entry-card">
      <div class="invite-route-code">
        <span class="bento-kicker">код лобби</span>
        <span class="room-code">${escapeHtml(code)}</span>
      </div>
      <p class="meta centered-meta">Зритель смотрит игру, видит финал и реакции, но не занимает место игрока.</p>
      <div class="actions">
        <button class="btn primary" data-action="join-spectator">${myName ? COPY.buttons.joinSpectator : "Ввести ник"}</button>
        <button class="btn ghost" data-route="home">Назад</button>
      </div>
    </section>
  `;
}

function renderInviteBlocked() {
  app.classList.add("plain-menu-card", "code-join-card");
  app.innerHTML = `
    <h2 class="panel-title">${COPY.messages.gameStartedTitle}</h2>
    <section class="home-panel code-panel">
      <p class="meta centered-meta">${COPY.messages.gameStartedText}</p>
      <div class="actions">
        <button class="btn primary" data-route="home">В главное меню</button>
        <button class="btn ghost" data-route="lobbies">Смотреть открытые игры</button>
      </div>
    </section>
  `;
}

function renderInfoScreen({ title, text, primaryText = "В главное меню", primaryRoute = "home", secondaryText = "Смотреть открытые игры", secondaryRoute = "lobbies" }) {
  app.classList.add("plain-menu-card", "code-join-card");
  app.innerHTML = `
    <h2 class="panel-title">${escapeHtml(title)}</h2>
    <section class="home-panel code-panel">
      <p class="meta centered-meta">${escapeHtml(text)}</p>
      <div class="actions">
        <button class="btn primary" data-route="${escapeHtml(primaryRoute)}">${escapeHtml(primaryText)}</button>
        <button class="btn ghost" data-route="${escapeHtml(secondaryRoute)}">${escapeHtml(secondaryText)}</button>
      </div>
    </section>
  `;
}

function renderLobbyMissing() {
  renderInfoScreen({
    title: COPY.messages.lobbyMissingTitle,
    text: COPY.messages.lobbyMissingText,
    primaryText: "В главное меню",
    primaryRoute: "home",
    secondaryText: "Смотреть открытые игры",
    secondaryRoute: "lobbies"
  });
}

function renderNotFound() {
  renderInfoScreen({
    title: COPY.messages.routeMissingTitle,
    text: COPY.messages.routeMissingText,
    primaryText: "В главное меню",
    primaryRoute: "home",
    secondaryText: "Смотреть открытые игры",
    secondaryRoute: "lobbies"
  });
}

function requestInviteJoin() {
  const code = routeRoomCode;
  if (!code) return navigateTo("home", { replace: true });
  ensureNameThen(() => {
    const key = `${code}:${sessionId}:${myName}`;
    if (inviteJoinRequestedFor === key) return;
    inviteJoinRequestedFor = key;
    socket.emit("joinRoom", { name: myName, code, sessionId });
  });
}


function requestSpectatorJoin() {
  const code = routeRoomCode;
  if (!code) return navigateTo("home", { replace: true });
  ensureNameThen(() => {
    viewerMode = true;
    socket.emit("joinSpectator", { name: myName, code, sessionId });
  });
}

function filteredOpenRooms() {
  const query = lobbySearchQuery.trim().toLowerCase();
  return openRooms.filter((room) => {
    const modeOk = lobbyModeFilter === "all" || room.gameMode === lobbyModeFilter;
    const searchText = `${room.code} ${room.hostName || ""} ${room.gameModeTitle || ""}`.toLowerCase();
    const queryOk = !query || searchText.includes(query);
    return modeOk && queryOk;
  });
}

function lobbyModeFilterOptionsHtml() {
  const options = [["all", "Все режимы"], ...Object.values(GAME_MODES).map((mode) => [mode.id, mode.shortTitle])];
  return options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${lobbyModeFilter === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
}

function openRoomsHtml({ compact = false } = {}) {
  if (openRoomsLoading) {
    return `
      <div class="empty-lobbies">
        <div class="empty-icon">...</div>
        <h3 class="section-title">${COPY.messages.loadingRooms}</h3>
      </div>
    `;
  }

  const rooms = filteredOpenRooms();

  if (!rooms.length) {
    return `
      <div class="empty-lobbies">
        <div class="empty-icon">+</div>
        <h3 class="section-title">${COPY.messages.noOpenRooms}</h3>
        <p class="meta">${COPY.messages.noOpenRoomsHint}</p>
        <div class="empty-actions">
          <button class="btn primary" data-route="create">Создать игру</button>
          <button class="btn ghost" data-action="refresh-lobbies">${COPY.buttons.refreshRooms}</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="open-rooms ${compact ? "open-rooms-compact" : ""}">
      ${rooms.map((room) => {
        const mode = gameModeInfo(room.gameMode);
        const full = room.isFull || room.playersCount >= room.maxPlayers;
        return `
          <article class="open-room ${full ? "is-full" : ""}" ${full ? "" : `data-action="join-open-room" data-room-code="${escapeHtml(room.code)}" tabindex="0" role="button"`} aria-label="Лобби ${escapeHtml(room.code)}">
            <div class="open-room-main">
              <div class="open-room-host">Лобби ${escapeHtml(room.hostName)}</div>
              <div class="open-room-code">${escapeHtml(room.code)}</div>
              <p class="meta">${escapeHtml(mode.title)} · код ${escapeHtml(room.code)}</p>
            </div>
            <div class="open-room-stats">
              <span>${room.playersCount}/${room.maxPlayers} игроков</span>
              ${room.spectatorsCount ? `<span>${room.spectatorsCount} зр.</span>` : ""}
              ${full ? `<span class="full-badge">заполнено</span>` : ""}
            </div>
            <button class="btn primary compact-btn" data-action="join-open-room" data-room-code="${escapeHtml(room.code)}" ${full ? "disabled" : ""}>${full ? "Нет мест" : "Войти"}</button>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderLobbyBrowser() {
  const rooms = filteredOpenRooms();
  app.classList.add("server-list-card");
  app.innerHTML = `
    <h2 class="panel-title centered-title lobby-browser-title">${COPY.screens.lobbies}</h2>
    <section class="lobby-browser-panel">
      <div class="lobby-browser-toolbar">
        <div class="lobby-browser-count">${rooms.length} из ${openRooms.length} лобби</div>
        <div class="actions">
          <button class="btn ghost icon-btn" data-action="refresh-lobbies" title="${COPY.buttons.refreshRooms}" aria-label="${COPY.buttons.refreshRooms}">↻</button>
          <button class="btn ghost icon-btn" data-route="join" title="Назад" aria-label="Назад">←</button>
        </div>
      </div>
      <div class="lobby-filters">
        <input id="lobbySearchInput" class="lobby-search-input" type="search" placeholder="Поиск по коду, хосту или режиму" value="${escapeHtml(lobbySearchQuery)}">
        <select id="lobbyModeFilter" class="lobby-mode-filter">${lobbyModeFilterOptionsHtml()}</select>
      </div>
      <p class="meta lobby-sort-note">Сначала показываются почти заполненные лобби. Полные комнаты уходят вниз и недоступны для входа.</p>
      <div class="rooms-frame">${openRoomsHtml()}</div>
    </section>
  `;
}


function promptPackOptionsHtml(selected = "mixed") {
  const options = [
    ["mixed", COPY.settings.packMixed],
    ["customOnly", COPY.settings.packCustomOnly],
    ["universal", COPY.settings.packUniversal],
    ["friends", COPY.settings.packFriends],
    ["school", COPY.settings.packSchool],
    ["work", COPY.settings.packWork],
    ["gaming", COPY.settings.packGaming],
    ["party", COPY.settings.packParty],
    ["family", COPY.settings.packFamily],
    ["absurd", COPY.settings.packAbsurd],
    ["kz", COPY.settings.packKz],
    ["softRoast", COPY.settings.packSoftRoast]
  ];
  const builtIn = options.map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  const custom = loadCustomPromptPacks()
    .map((pack) => {
      const value = `custom:${pack.id}`;
      return `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>Свой: ${escapeHtml(pack.name)}</option>`;
    })
    .join("");
  return builtIn + custom;
}

function renderCreateRoom() {
  app.classList.add("create-game-card", "mode-select-card");
  const modes = Object.values(GAME_MODES);
  app.innerHTML = `
    <h2 class="panel-title centered-title">Выбери режим игры</h2>
    <p class="meta centered-meta mode-select-lead">Карточки работают как пресеты: выбираешь механику, а детали меняешь уже в лобби.</p>
    <section class="mode-select-stage" aria-label="Выбор режима игры">
      <div class="mode-stage-head">
        <span class="mode-stage-tab is-active">Режимы</span>
        <span class="mode-stage-tab">Настройки будут в лобби</span>
      </div>
      <div class="mode-grid">
        ${modes.map((mode) => `
          <article
            class="mode-card ${mode.enabled ? "" : "disabled-mode"}"
            data-action="create-mode-room"
            data-mode="${escapeHtml(mode.id)}"
            role="button"
            tabindex="0"
            aria-disabled="${mode.enabled ? "false" : "true"}"
          >
            <div class="mode-illustration">${gameModeIconSvg(mode.id)}</div>
            <div class="mode-card-body">
              <div class="mode-card-top">
                <span class="mode-min">${mode.minPlayers}+ игрока</span>
                <span class="mode-pick">Выбрать</span>
              </div>
              <h3>${escapeHtml(mode.title)}</h3>
              <p class="mode-description">${escapeHtml(mode.description)}</p>
            </div>
            <div class="mode-tags">${mode.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
          </article>
        `).join("")}
      </div>
    </section>
    <div class="actions create-actions">
      <button class="btn ghost" data-route="home">Назад</button>
    </div>
  `;
}

function roomSettingsFormHtml(room = null) {
  const mode = gameModeInfo(room?.gameMode || "classic_pairs");
  const maxRounds = room?.maxRounds ?? DEFAULT_ROOM_SETTINGS.maxRounds;
  const timers = room?.timers || DEFAULT_ROOM_SETTINGS;
  const settings = room?.settings || DEFAULT_ROOM_SETTINGS;
  const isShared = mode.id === "shared_prompt";

  return `
    <div class="settings-editor">
      <div class="mode-readonly-card">
        <span class="bento-kicker">${COPY.settings.fixedGameMode}</span>
        <strong>${escapeHtml(mode.title)}</strong>
        <p class="meta">${COPY.settings.fixedGameModeHint}</p>
      </div>

      <div class="grid compact-grid">
        <label class="field rounds-field"><span>${COPY.settings.rounds}</span><input id="maxRounds" type="number" min="1" max="20" value="${maxRounds}"><small class="field-hint shared-rounds-hint">${isShared ? COPY.settings.sharedRoundsHint : ""}</small></label>
        <label class="field"><span>${COPY.settings.maxPlayers}</span><input id="maxPlayers" type="number" min="2" max="12" value="${settings.maxPlayers}"></label>
        <label class="field"><span>${COPY.settings.promptTimer}</span><input id="promptSeconds" type="number" min="0" value="${timers.promptSeconds}"></label>
        <label class="field"><span>${COPY.settings.answerTimer}</span><input id="answerSeconds" type="number" min="0" value="${timers.answerSeconds}"></label>
        <label class="field"><span>${COPY.settings.voteTimer}</span><input id="voteSeconds" type="number" min="0" value="${timers.voteSeconds}"></label>
        <label class="field"><span>${COPY.settings.promptMode}</span>
          <select id="promptMode">
            <option value="manual" ${settings.promptMode === "manual" ? "selected" : ""}>${COPY.settings.promptManual}</option>
            <option value="auto" ${settings.promptMode === "auto" ? "selected" : ""}>${COPY.settings.promptAuto}</option>
          </select>
        </label>
        <label class="field"><span>${COPY.settings.promptPack}</span><select id="promptPack">${promptPackOptionsHtml(settings.promptPack || "mixed")}</select></label>
        <div class="grid-span-all">${customPromptPacksHtml()}</div>
        <label class="field"><span>${COPY.settings.spectatorVoting}</span>
          <select id="spectatorVoting">
            <option value="off" ${settings.spectatorVoting === "off" ? "selected" : ""}>${COPY.settings.spectatorOff}</option>
            <option value="reactions" ${settings.spectatorVoting === "reactions" ? "selected" : ""}>${COPY.settings.spectatorReactions}</option>
            <option value="grandFinalOnly" ${settings.spectatorVoting === "grandFinalOnly" ? "selected" : ""}>${COPY.settings.spectatorGrandOnly}</option>
          </select>
        </label>
      </div>
      <div class="settings-checks">
        <label class="check-row"><input id="anonymousMode" type="checkbox" ${settings.anonymousMode ? "checked" : ""}> ${COPY.settings.anonymous}</label>
        <label class="check-row"><input id="soundsEnabled" type="checkbox" ${settings.soundsEnabled ? "checked" : ""}> ${COPY.settings.sounds}</label>
        <label class="check-row"><input id="publicLobby" type="checkbox" ${settings.publicLobby ? "checked" : ""}> ${COPY.settings.publicLobby}</label>
        <label class="check-row"><input id="spectatorMode" type="checkbox" ${settings.spectatorMode !== false ? "checked" : ""}> ${COPY.settings.spectatorMode}</label>
      </div>
      <div class="settings-editor-actions">
        <button class="btn primary compact-btn" data-action="save-lobby-settings">${COPY.buttons.saveSettings}</button>
        <button class="btn ghost compact-btn" data-action="toggle-settings">${COPY.buttons.cancelSettings}</button>
      </div>
    </div>
  `;
}


function promptPackLabel(value) {
  if (value === "customOnly") return COPY.settings.packCustomOnly;
  const labels = {
    mixed: COPY.settings.packMixed,
    universal: COPY.settings.packUniversal,
    friends: COPY.settings.packFriends,
    school: COPY.settings.packSchool,
    work: COPY.settings.packWork,
    gaming: COPY.settings.packGaming,
    party: COPY.settings.packParty,
    family: COPY.settings.packFamily,
    absurd: COPY.settings.packAbsurd,
    kz: COPY.settings.packKz,
    softRoast: COPY.settings.packSoftRoast
  };
  const customId = String(value || "").match(/^custom:([a-z0-9_-]+)$/i)?.[1];
  if (customId) {
    const pack = customPromptPackById(customId);
    return pack ? `Свой: ${pack.name}` : "Свой пак";
  }
  return labels[value] || labels.mixed;
}

function settingsSummary(room) {
  const mode = gameModeInfo(room.gameMode);
  const promptMode = room.settings.promptMode === "auto" ? "готовые начала" : "начала от игроков";
  const roundsText = room.gameMode === "shared_prompt" && room.settings.promptMode === "manual"
    ? `${room.sharedPromptCollectionComplete ? room.maxRounds : "по количеству начал"} раундов · максимум игроков: ${room.settings.maxPlayers}`
    : `${room.maxRounds} раундов · максимум игроков: ${room.settings.maxPlayers}`;
  return `
    <ul class="settings-list">
      <li><strong>Режим:</strong> ${escapeHtml(mode.title)}</li>
      <li>${roundsText}</li>
      <li>Источник начал: ${promptMode}</li>
      <li>Пак начал: ${escapeHtml(promptPackLabel(room.settings.promptPack || "mixed"))} · зрители: ${room.settings.spectatorMode === false ? "выкл" : "вкл"}</li>
      <li>Таймеры: начало ${room.timers.promptSeconds}с · концовка ${room.timers.answerSeconds}с · голосование ${room.timers.voteSeconds}с</li>
    </ul>
  `;
}

function playerAdminActionsHtml(player) {
  if (!isHost() || !currentRoom || player.id === getMyId()) return "";
  const targetRole = player.role === "spectator" ? "player" : "spectator";
  return `
    <div class="player-admin-actions">
      <button class="mini-action" data-action="set-player-role" data-player-id="${escapeHtml(player.id)}" data-role="${targetRole}">${targetRole === "spectator" ? COPY.buttons.moveToSpectator : COPY.buttons.moveToPlayer}</button>
      ${player.roleLocked ? `<button class="mini-action" data-action="unlock-role-choice" data-player-id="${escapeHtml(player.id)}">${COPY.buttons.giveChoice}</button>` : ""}
      <button class="mini-action" data-action="transfer-host" data-player-id="${escapeHtml(player.id)}">${COPY.buttons.transferHost}</button>
      <button class="mini-action danger" data-action="kick-player" data-player-id="${escapeHtml(player.id)}">${COPY.buttons.kickPlayer}</button>
      <button class="mini-action danger" data-action="ban-player" data-player-id="${escapeHtml(player.id)}">${COPY.buttons.banPlayer}</button>
    </div>
  `;
}

function playerPillHtml(player, role) {
  const hostBadge = player.id === currentRoom.hostId ? '<span class="badge">хост</span>' : "";
  const lockedBadge = player.roleLocked ? '<span class="badge muted-badge">роль задана хостом</span>' : "";
  return `
    <div class="pill player-pill ${player.connected ? "" : "disconnected"} ${player.role === "spectator" ? "spectator-pill" : ""}" draggable="${isHost() && player.id !== getMyId() ? "true" : "false"}" data-player-id="${escapeHtml(player.id)}" data-role="${role}">
      <span class="player-name">
        <span class="avatar">${escapeHtml(getInitial(player.name))}</span>
        <span class="player-name-text">${escapeHtml(player.name)}</span>
        ${player.id === getMyId() ? `<button class="name-edit-inline" data-action="edit-name">Изменить ник</button>` : ""}
        ${hostBadge}
        ${lockedBadge}
      </span>
      <span class="player-status">${player.connected ? (player.role === "spectator" ? "зритель" : "в лобби") : "отключился"}</span>
      ${playerAdminActionsHtml(player)}
    </div>
  `;
}

function playersHtml() {
  const active = activeLobbyPlayers();
  const spectators = lobbySpectators();
  const canChoose = currentRoom?.settings?.spectatorMode !== false && currentRoom?.state === "waiting" && !getMyPlayer()?.roleLocked;
  return `
    <div class="role-lists">
      <div class="role-list role-drop-zone" data-drop-role="player">
        <div class="role-list-head"><span>Игроки</span><span>${active.filter((player) => player.connected).length}/${currentRoom.settings.maxPlayers}</span></div>
        <div class="players">
          ${active.length ? active.map((player) => playerPillHtml(player, "player")).join("") : `<p class="meta empty-role">Пока нет игроков.</p>`}
        </div>
      </div>
      <div class="role-list role-drop-zone" data-drop-role="spectator">
        <div class="role-list-head"><span>Зрители</span><span>${spectators.filter((player) => player.connected).length}</span></div>
        <div class="players spectators-list">
          ${spectators.length ? spectators.map((player) => playerPillHtml(player, "spectator")).join("") : `<p class="meta empty-role">${isHost() ? "Можно перетащить игрока сюда." : "Зрителей нет."}</p>`}
        </div>
      </div>
      ${canChoose ? `
        <div class="actions role-self-actions">
          ${isSelfSpectator()
            ? `<button class="btn ghost compact-btn" data-action="choose-role" data-role="player">${COPY.buttons.becomePlayer}</button>`
            : `<button class="btn ghost compact-btn" data-action="choose-role" data-role="spectator">${COPY.buttons.becomeSpectator}</button>`}
        </div>
      ` : ""}
    </div>
  `;
}


function hostManageControlsHtml() {
  if (!isHost() || !currentRoom || currentRoom.state === "waiting") return "";
  return `
    <details class="host-manage-menu">
      <summary>Игроки</summary>
      <div class="host-manage-list">
        ${currentRoom.players.map((player) => `
          <div class="host-manage-row">
            <span>${escapeHtml(player.name)}${player.id === currentRoom.hostId ? " · хост" : ""}${player.role === "spectator" ? " · зритель" : ""}</span>
            ${playerAdminActionsHtml(player)}
          </div>
        `).join("")}
      </div>
    </details>
  `;
}

function renderWaiting() {
  const onlineCount = activeLobbyPlayers().filter((player) => player.connected).length;
  const link = inviteLink(currentRoom.code);
  app.classList.add("waiting-room-card");
  app.innerHTML = `
    <div class="lobby-shell waiting-room">
      <header class="waiting-header">
        <h2 class="panel-title">${COPY.screens.waiting}</h2>
      </header>

      <section class="invite-panel">
        <div class="invite-code-block">
          <span class="bento-kicker">Код лобби</span>
          ${lobbyCodeHtml(currentRoom.code)}
          <p class="meta">Друг может войти по коду или по ссылке.</p>
        </div>
        <div class="invite-link-block">
          <div class="section-row">
            <span class="bento-kicker">Ссылка для друзей</span>
            <span class="lobby-count">${onlineCount}/${currentRoom.settings.maxPlayers}</span>
          </div>
          ${inviteUrlHtml(link)}
          <div class="actions invite-actions">
            <button class="btn primary compact-btn" data-action="copy-invite-link">${COPY.buttons.copyInvite}</button>
            <button class="btn ghost compact-btn" data-action="share-invite-link">${COPY.buttons.shareInvite}</button>
            <button class="btn ghost compact-btn" data-action="copy-code">${COPY.buttons.copyCode}</button>
          </div>
        </div>
      </section>

      <section class="lobby-qr-grid single-qr-grid">
        ${qrImageHtml(link, "QR для входа")}
      </section>

      <div class="waiting-grid">
        <section class="bento-card players-card lobby-players-card waiting-players">
          <div class="section-row">
            <h3 class="section-title">${COPY.labels.players}</h3>
            <span class="lobby-count">${onlineCount}/${currentRoom.settings.maxPlayers}</span>
          </div>
          ${playersHtml()}
          ${onlineCount < currentRoom.settings.maxPlayers ? `<p class="meta wait-hint">Ждём остальных игроков…</p>` : ""}
        </section>

        <aside class="waiting-side">
          <section class="bento-card settings-card lobby-settings-card compact-settings-card">
            <div class="section-row">
              <h3 class="section-title">${COPY.labels.settings}</h3>
              ${isHost() ? `<button class="btn ghost compact-btn" data-action="toggle-settings">${COPY.buttons.editSettings}</button>` : ""}
            </div>
            ${settingsSummary(currentRoom)}
          </section>
        </aside>
      </div>
    </div>
  `;
  if (isHost() && lobbySettingsOpen) renderSettingsModal();
}

function roomControlsHtml() {
  if (!currentRoom) return "";
  if (isSpectatorView()) {
    const me = getMyPlayer();
    const canBecomePlayer = currentRoom.state === "waiting" && currentRoom.settings.spectatorMode !== false && !me?.roleLocked && activeLobbyPlayers().filter((player) => player.connected).length < currentRoom.settings.maxPlayers;
    const spectatorPrimary = currentRoom.state === "waiting" && isHost()
      ? `<button class="btn primary" data-action="start-game">${COPY.buttons.startGame}</button>`
      : (canBecomePlayer ? `<button class="btn primary" data-action="choose-role" data-role="player">${COPY.buttons.becomePlayer}</button>` : `<span class="meta room-controls-note">Вы смотрите игру как зритель.</span>`);
    return `
      <div class="room-controls spectator-controls">
        <div class="room-controls-left">${spectatorPrimary}</div>
        <div class="room-controls-right"><button class="btn ghost danger-lite" data-action="leave-room">${COPY.buttons.leaveRoom}</button></div>
      </div>
    `;
  }
  const onlineCount = activeLobbyPlayers().filter((player) => player.connected).length;
  const showLeaveButton = !(currentRoom.state === "waiting" && onlineCount <= 1);

  let primaryAction = "";
  let statusNote = "";

  if (currentRoom.state === "waiting" && isHost()) {
    primaryAction = `<button class="btn primary" data-action="start-game">${COPY.buttons.startGame}</button>`;
  }

  if (currentRoom.state === "waiting" && !isHost()) {
    statusNote = `<span class="meta room-controls-note">${COPY.messages.hostDecision}</span>`;
  }

  if (["prompting", "collectingSharedPrompts"].includes(currentRoom.state)) {
    const submitted = hasSubmittedPrompt();
    if (isDuelMode() && !isDuelPromptAuthor()) {
      statusNote = `<span class="meta room-controls-note">Сейчас бьются: ${escapeHtml(duelBattleNames())}. Ждём начало от игроков вне боя.</span>`;
    } else if (!submitted || promptEditMode) {
      const promptButtonText = currentRoom.gameMode === "duel_tournament"
        ? (submitted ? "Обновить начало боя" : "Дать начало для боя")
        : (["chaos_chain", "story_chain"].includes(currentRoom.gameMode)
          ? (submitted ? "Обновить начало истории" : "Начать историю")
          : (submitted ? COPY.buttons.updatePrompt : COPY.buttons.submitPrompt));
      primaryAction = `<button class="btn primary" data-action="submit-prompt">${promptButtonText}</button>`;
    } else {
      statusNote = `<span class="meta room-controls-note">Начало отправлено. Можно изменить, пока идёт таймер.</span>`;
    }
  }

  if (currentRoom.state === "answering") {
    const submitted = hasSubmittedAnswer();
    if (isDuelMode() && !currentRoom.assignments?.[getMyId()]) {
      statusNote = `<span class="meta room-controls-note">Ты судья этого боя. Ждём ответы дуэлянтов.</span>`;
    } else if (!submitted || answerEditMode) {
      const answerButtonText = currentRoom.gameMode === "duel_tournament"
        ? (submitted ? "Обновить ответ" : "Ответить в бою")
        : (["chaos_chain", "story_chain"].includes(currentRoom.gameMode)
          ? (submitted ? "Обновить кусок" : "Продолжить историю")
          : (submitted ? COPY.buttons.updateAnswer : COPY.buttons.submitAnswer));
      primaryAction = `<button class="btn primary" data-action="submit-answer">${answerButtonText}</button>`;
    } else {
      statusNote = `<span class="meta room-controls-note">${["chaos_chain", "story_chain"].includes(currentRoom.gameMode) ? "Кусок отправлен" : "Ответ отправлен"}. Можно изменить, пока идёт таймер.</span>`;
    }
  }

  if (currentRoom.state === "revealing") {
    primaryAction = isHost()
      ? `<button class="btn primary" data-action="start-voting">${COPY.buttons.startVoting}</button>`
      : `<span class="meta room-controls-note">${COPY.messages.hostStartsVoting}</span>`;
  }

  if (currentRoom.state === "guessing") {
    primaryAction = hasSubmittedGuesses()
      ? `<span class="meta room-controls-note">Ответы отправлены. Ждём остальных.</span>`
      : `<button class="btn primary" data-action="submit-guesses">Отправить догадки</button>`;
  }

  if (currentRoom.state === "grandVoting") {
    primaryAction = hasGrandVoted()
      ? `<span class="meta room-controls-note">${COPY.messages.grandVoteSubmitted}</span>`
      : `<span class="meta room-controls-note">Выберите шутку вечера.</span>`;
  }

  if (currentRoom.state === "scoreboard") {
    const isFinalNext = currentRoom.round >= currentRoom.maxRounds;
    const duelNextText = isDuelMode() ? (currentRoom.duel?.complete ? "Финал турнира" : "Следующий бой") : null;
    primaryAction = isHost()
      ? `<button class="btn primary" data-action="next-round">${duelNextText || (isFinalNext ? COPY.buttons.final : COPY.buttons.nextRound)}</button>`
      : `<span class="meta room-controls-note">${COPY.messages.hostDecision}</span>`;
  }

  if (currentRoom.state === "finished") {
    primaryAction = isHost()
      ? `<button class="btn primary" data-action="restart-game">${COPY.buttons.restart}</button>`
      : `<span class="meta room-controls-note">${COPY.messages.hostCanRestart}</span>`;
  }

  return `
    <div class="room-controls">
      <div class="room-controls-left">
        ${primaryAction}
        ${statusNote}
      </div>
      ${hostManageControlsHtml()}
      <div class="room-controls-right">
        ${showLeaveButton ? `<button class="btn ghost danger-lite" data-action="leave-room">${COPY.buttons.leaveRoom}</button>` : ""}
        ${isHost() ? `<button class="btn danger" data-action="delete-room">${COPY.buttons.deleteRoom}</button>` : ""}
      </div>
    </div>
  `;
}

function renderRoomControlsRoot() {
  if (!controlsRoot) return;
  controlsRoot.innerHTML = currentRoom ? roomControlsHtml() : "";
}

function clearRoomControlsRoot() {
  if (controlsRoot) controlsRoot.innerHTML = "";
}

function stageTitle(title, eyebrow = "") {
  return `
    <header class="game-stage-header">
      ${eyebrow ? `<p class="eyebrow stage-eyebrow">${escapeHtml(eyebrow)}</p>` : ""}
      <h2 class="game-stage-title">${escapeHtml(title)}</h2>
    </header>
  `;
}

function renderStarting() {
  app.classList.add("game-stage-card", "compact-game-stage-card");
  app.innerHTML = `
    <div class="game-stage countdown-stage">
      ${stageTitle(COPY.screens.starting, "раунд скоро начнётся")}
      <section class="stage-panel countdown-panel">
        <div class="countdown-number">${getStartingCountdownSeconds()}</div>
        <p class="meta centered-meta">Приготовьтесь добивать фразы</p>
      </section>
    </div>
  `;
}

function submittedBlockHtml({ type, text, audio }) {
  const title = type === "prompt" ? "Начало отправлено" : "Концовка отправлена";
  const emptyLabel = type === "prompt" ? "Голосовое начало" : "Голосовая концовка";
  const editAction = type === "prompt" ? "edit-prompt-draft" : "edit-answer-draft";
  const cardClasses = ["submitted-draft-card"];
  if (audio) cardClasses.push("has-audio");
  if (text) cardClasses.push("has-text");
  if (audio && !text) cardClasses.push("only-audio");

  return `
    <div class="${cardClasses.join(" ")}">
      <div class="submitted-draft-top">
        <span class="submitted-draft-label">${title}</span>
        <button class="inline-edit" type="button" data-action="${editAction}">${COPY.buttons.editSubmission}</button>
      </div>
      <div class="submitted-draft-content">
        <div class="submitted-draft-text">${escapeHtml(text || (audio ? emptyLabel : "Пока пусто"))}</div>
        ${audioPlayerHtml(audio, { compact: true })}
      </div>
    </div>
  `;
}


function spectatorStateText() {
  const state = currentRoom?.state;
  const map = {
    waiting: "Лобби собирается. Можно показать QR друзьям или ждать старта.",
    starting: "Игра скоро начнётся. Зритель смотрит, но не занимает место игрока.",
    prompting: currentRoom?.gameMode === "duel_tournament" ? "Игроки вне боя пишут начало для дуэли." : (currentRoom?.gameMode === "chaos_chain" ? "Игроки начинают свои цепочки хаоса." : (currentRoom?.gameMode === "story_chain" ? "Игроки начинают истории с продолжением." : "Игроки придумывают начала фраз.")),
    collectingSharedPrompts: "Каждый игрок пишет одно начало. Потом каждое начало станет отдельным раундом.",
    answering: currentRoom?.gameMode === "duel_tournament" ? "Участники боя добивают фразу, остальные ждут голосования." : (currentRoom?.gameMode === "chaos_chain" ? "Игроки продолжают цепочки, видя только прошлый кусок." : (currentRoom?.gameMode === "story_chain" ? "Игроки продолжают историю, видя весь контекст." : "Игроки добивают фразы.")),
    revealing: "Шутки раскрываются.",
    guessing: "Игроки угадывают авторов шуток.",
    voting: "Игроки голосуют за смешные варианты.",
    scoreboard: "Идут итоги раунда.",
    grandVoting: "Игроки выбирают шутку вечера.",
    finished: "Финал готов."
  };
  return map[state] || "Игра идёт.";
}

function renderSpectator() {
  const onlineCount = currentRoom.players.filter((player) => player.connected).length;
  app.classList.add("game-stage-card", "compact-game-stage-card", "spectator-stage-card");
  const latest = currentRoom.bestJokesHistory?.at?.(-1);
  app.innerHTML = `
    <div class="game-stage spectator-stage">
      ${stageTitle("Режим зрителя", `лобби ${currentRoom.code}`)}
      <section class="stage-panel spectator-panel">
        <div class="section-row">
          <h3 class="section-title">${escapeHtml(spectatorStateText())}</h3>
          <span class="lobby-count">${onlineCount}/${currentRoom.settings.maxPlayers}</span>
        </div>
        <p class="meta">Зрители видят игру и могут реагировать, но не влияют на очки.</p>
        <div class="spectator-reactions">
          ${["😂", "🔥", "💀", "👏", "🤯", "👀"].map((emoji) => `<button class="reaction-btn" data-action="spectator-reaction" data-emoji="${emoji}">${emoji}</button>`).join("")}
        </div>
      </section>
      ${currentRoom.state === "waiting" ? `
        <section class="lobby-qr-grid spectator-qr-grid">
          ${qrImageHtml(inviteLink(currentRoom.code), "QR игрока")}
        </section>
      ` : ""}
      ${["revealing", "voting", "scoreboard"].includes(currentRoom.state) ? jokesHtml({ revealAuthor: currentRoom.state !== "voting" }) : ""}
      ${currentRoom.state === "scoreboard" ? historyHtml() : ""}
      ${latest && !["revealing", "voting", "scoreboard"].includes(currentRoom.state) ? `
        <section class="stage-section">
          <h3 class="section-title centered-title">Последняя лучшая шутка</h3>
          <div class="jokes stage-jokes">${jokeCardHtml({
            meta: `Раунд ${latest.round} · ${latest.authorName} · голосов: ${latest.votesCount}`,
            promptText: latest.promptText,
            answerText: latest.answerText,
            promptAudio: latest.promptAudio || null,
            answerAudio: latest.answerAudio || null,
            compact: true
          })}</div>
        </section>
      ` : ""}
    </div>
  `;
}

function renderPrompting({ sharedCollection = false } = {}) {
  const submitted = hasSubmittedPrompt();
  const myPrompt = getMyPrompt();
  const draft = getPromptDraft();
  const audio = getPromptAudioDraft();
  const connectedCount = activeLobbyPlayers().filter((p) => p.connected).length;
  const isEditing = !submitted || promptEditMode;
  const isDuel = currentRoom.gameMode === "duel_tournament";
  const isChaos = currentRoom.gameMode === "chaos_chain";
  const isStory = currentRoom.gameMode === "story_chain";
  const isChain = isChaos || isStory;
  const canWriteDuelPrompt = !isDuel || isDuelPromptAuthor();
  const title = isDuel ? `${duelBattleTitle()} · начало` : (isChaos ? "Цепочка хаоса · начало" : (isStory ? "Шутка с продолжением · начало" : (sharedCollection ? "Собираем начала" : `Раунд ${currentRoom.round} · Кинь начало`)));
  const lead = isDuel
    ? "Игроки вне текущего боя пишут начало. Потом дуэлянты будут добивать выбранную фразу."
    : (isChaos
      ? "Напиши первый кусок истории. Дальше другие игроки будут продолжать цепочку, видя только последний кусок."
      : (isStory
        ? "Напиши первый кусок истории. Дальше игроки будут продолжать её, видя весь накопленный контекст."
        : (sharedCollection
          ? "Каждый пишет одно начало. Потом каждое начало станет отдельным раундом, и все будут добивать его по очереди."
          : "Придумайте начало фразы для другого игрока.")));
  app.classList.add("game-stage-card", "compact-game-stage-card");
  app.innerHTML = `
    <div class="game-stage input-stage">
      ${stageTitle(title, isDuel ? "режим: дуэльный турнир" : (isChaos ? "режим: цепочка хаоса" : (isStory ? "режим: шутка с продолжением" : (sharedCollection ? "режим: одна фраза на всех" : ""))))}
      <section class="input-stage-panel no-shell-panel">
        ${timerHtml()}
        <p class="meta centered-meta shared-mode-lead">${escapeHtml(lead)}</p>
        ${isDuel && !canWriteDuelPrompt ? `
          <div class="prompt-box stage-message centered-meta">Ты участник боя или ждёшь своей очереди. Начало для этого боя пишут судьи вне дуэли.</div>
        ` : (isEditing ? `
          <textarea id="promptInput" maxlength="160" placeholder="${isChain ? COPY.placeholders.chaosStart : COPY.placeholders.prompt}">${escapeHtml(draft)}</textarea>
          ${audioInputHtml("prompt")}
        ` : submittedBlockHtml({ type: "prompt", text: myPrompt?.text || "", audio: myPrompt?.audio || null }))}
        <div class="progress-card">
          <h3 class="section-title">${COPY.labels.progress}</h3>
          <p class="meta">${currentRoom.prompts.length} из ${isDuel ? expectedPromptCount() : connectedCount} отправили начало. ${isDuel ? `Бой: ${escapeHtml(duelBattleNames())}.` : (isChaos ? "Собираем первые куски цепочек." : (isStory ? "Собираем первые куски историй." : (sharedCollection ? `Раундов будет: ${Math.max(1, currentRoom.prompts.length)}.` : randomWaitingMessage(currentRoom.prompts.length))))}</p>
        </div>
      </section>
    </div>
  `;
}

function renderAnswering() {
  const submitted = hasSubmittedAnswer();
  const myAnswer = getMyAnswer();
  const promptId = currentRoom.assignments[getMyId()];
  const prompt = getPrompt(promptId);
  const draft = getAnswerDraft();
  const audio = getAnswerAudioDraft();
  const connectedCount = currentRoom.players.filter((p) => p.connected).length;
  const isEditing = !submitted || answerEditMode;

  const duelMode = currentRoom.gameMode === "duel_tournament";
  const sharedMode = currentRoom.gameMode === "shared_prompt";
  const chaosMode = currentRoom.gameMode === "chaos_chain";
  const storyMode = currentRoom.gameMode === "story_chain";
  const chainMode = chaosMode || storyMode;
  const stageName = duelMode ? duelBattleTitle() : (chaosMode ? `Цепочка хаоса · шаг ${currentRoom.chaosStep || 2}` : (storyMode ? `Шутка с продолжением · шаг ${currentRoom.chaosStep || 2}` : (sharedMode ? `Раунд ${currentRoom.round} · Все добивают` : "Добей фразу")));
  const eyebrow = duelMode ? "дуэльный турнир" : (chaosMode ? "виден только предыдущий кусок" : (storyMode ? "виден весь контекст истории" : (sharedMode ? "одна фраза на всех" : "")));
  app.classList.add("game-stage-card", "compact-game-stage-card");
  if (duelMode && !currentRoom.assignments?.[getMyId()]) {
    app.innerHTML = `
      <div class="game-stage input-stage">
        ${stageTitle(stageName, eyebrow)}
        <section class="input-stage-panel no-shell-panel">
          ${timerHtml()}
          <div class="prompt-box stage-prompt">${escapeHtml(prompt?.text || "Начало боя уже выбрано")}${audioPlayerHtml(prompt?.audio || null, { compact: true })}</div>
          <div class="progress-card">
            <h3 class="section-title">Ты судья этого боя</h3>
            <p class="meta">Участники пишут ответы. После этого ты сможешь проголосовать за победителя боя.</p>
          </div>
        </section>
      </div>
    `;
    return;
  }
  app.innerHTML = `
    <div class="game-stage input-stage">
      ${stageTitle(stageName, eyebrow)}
      <section class="input-stage-panel no-shell-panel">
        ${timerHtml()}
        <div class="prompt-box stage-prompt ${chainMode ? "chain-context-box" : ""}">
          ${chaosMode ? `<span class="chain-piece-label">Предыдущий кусок</span>` : ""}
          ${storyMode ? `<span class="chain-piece-label">История до тебя</span>` : ""}
          ${storyMode && Array.isArray(prompt?.chainPreviewSegments) ? chainSegmentsHtml(prompt.chainPreviewSegments) : escapeHtml(prompt?.text || (prompt?.audio ? "Голосовое начало" : COPY.empty.promptMissing))}
          ${!storyMode ? audioPlayerHtml(prompt?.audio || null, { compact: true }) : ""}
        </div>
        ${isEditing ? `
          <textarea id="answerInput" maxlength="180" placeholder="${chainMode ? COPY.placeholders.chaosContinue : COPY.placeholders.answer}">${escapeHtml(draft)}</textarea>
          ${audioInputHtml("answer")}
        ` : submittedBlockHtml({ type: "answer", text: myAnswer?.text || "", audio: myAnswer?.audio || null })}
        <div class="progress-card">
          <h3 class="section-title">${COPY.labels.progress}</h3>
          <p class="meta">${currentRoom.answers.length} из ${duelMode ? expectedAnswerers().length : connectedCount} отправили ${chainMode ? "продолжение" : (duelMode ? "ответ в бою" : "концовку")}. ${duelMode ? "Ждём ответы участников боя." : (chaosMode ? "Цепочка ждёт последние куски." : (storyMode ? "История ждёт продолжения." : randomWaitingMessage(currentRoom.answers.length + 2)))}</p>
        </div>
      </section>
    </div>
  `;
}

function jokeText(answer, revealAuthor) {
  const prompt = getPrompt(answer.promptId);
  const promptLine = prompt?.text || (prompt?.audio ? "[голосовое начало]" : "");
  const answerLine = answer?.text || (answer?.audio ? "[голосовая концовка]" : "");
  const author = revealAuthor ? `\n\n- автор: ${getPlayerName(answer.authorId)}` : "";
  return `${promptLine}\n${answerLine}${author}`;
}

function chainSegmentsHtml(segments = []) {
  if (!Array.isArray(segments) || !segments.length) return "";
  return `
    <div class="chain-story-list">
      ${segments.map((segment, index) => `
        <div class="chain-story-piece">
          <div class="meta">Кусок ${index + 1}${segment.authorId ? ` · ${escapeHtml(getPlayerName(segment.authorId))}` : ""}</div>
          <div class="chain-story-text">${escapeHtml(segment.text || (segment.audio ? "Голосовой кусок" : "..."))}</div>
          ${audioPlayerHtml(segment.audio || null, { compact: true })}
        </div>
      `).join("")}
    </div>
  `;
}

function jokeCardHtml({ meta, promptText, answerText, promptAudio = null, answerAudio = null, chainSegments = null, actions = "", winner = false, compact = false }) {
  return `
    <article class="joke game-joke-card ${winner ? "winner-joke" : ""} ${compact ? "compact-joke" : ""} ${chainSegments ? "chain-joke-card" : ""}">
      <div class="meta joke-meta">${escapeHtml(meta)}</div>
      ${chainSegments ? chainSegmentsHtml(chainSegments) : `
        <div class="joke-start">${escapeHtml(promptText || (promptAudio ? "Голосовое начало" : ""))}</div>
        ${audioPlayerHtml(promptAudio, { compact: true })}
        <div class="joke-end">${escapeHtml(answerText || (answerAudio ? "Голосовая концовка" : ""))}</div>
        ${audioPlayerHtml(answerAudio, { compact: true })}
      `}
      ${actions ? `<div class="actions joke-actions">${actions}</div>` : ""}
    </article>
  `;
}

function jokesHtml({ voting = false, revealAuthor = false } = {}) {
  return `
    <div class="jokes stage-jokes">
      ${currentRoom.answers.map((answer, index) => {
        const prompt = getPrompt(answer.promptId);
        const own = answer.authorId === getMyId();
        const meta = `Шутка ${index + 1}${revealAuthor ? ` · автор: ${getPlayerName(answer.authorId)}` : ""}`;
        const actions = `
          <button class="btn ghost" data-action="copy-joke" data-answer-id="${answer.id}" data-reveal-author="${revealAuthor ? "1" : "0"}">${COPY.buttons.copyJoke}</button>
          ${voting ? `<button class="btn primary" data-action="vote" data-answer-id="${answer.id}" ${own || hasVoted() || !canVoteCurrentRound() ? "disabled" : ""}>${own ? COPY.buttons.ownAnswer : (!canVoteCurrentRound() ? "Ждём судей" : COPY.buttons.vote)}</button>` : ""}
        `;
        return jokeCardHtml({
          meta,
          promptText: prompt?.text || "",
          answerText: answer.text || "",
          promptAudio: prompt?.audio || null,
          answerAudio: answer.audio || null,
          chainSegments: answer.chainSegments || null,
          actions
        });
      }).join("")}
    </div>
  `;
}

function renderRevealing() {
  const revealAuthor = !currentRoom.settings.anonymousMode;
  app.classList.add("game-stage-card", "compact-game-stage-card");
  app.innerHTML = `
    <div class="game-stage reveal-stage">
      ${stageTitle(currentRoom.gameMode === "duel_tournament" ? `${duelBattleTitle()} · ответы готовы` : (currentRoom.gameMode === "chaos_chain" ? "Цепочка хаоса · готовые истории" : (currentRoom.gameMode === "story_chain" ? "Шутка с продолжением · готовые истории" : `Раунд ${currentRoom.round} · Готовые шутки`)))}
      ${jokesHtml({ revealAuthor })}
    </div>
  `;
}

function hasSubmittedGuesses() {
  return Boolean(currentRoom?.guesses?.some((entry) => entry.playerId === getMyId()));
}

function guessSelectHtml(answerId, field, selected = "") {
  const options = [`<option value="">Не знаю</option>`].concat(
    currentRoom.players.map((player) => `<option value="${escapeHtml(player.id)}" ${selected === player.id ? "selected" : ""}>${escapeHtml(player.name)}</option>`)
  ).join("");
  return `<select class="guess-select" data-answer-id="${escapeHtml(answerId)}" data-guess-field="${escapeHtml(field)}">${options}</select>`;
}

function renderGuessing() {
  const submitted = hasSubmittedGuesses();
  app.classList.add("game-stage-card", "compact-game-stage-card");
  const guessCards = currentRoom.answers.map((answer, index) => {
    const prompt = getPrompt(answer.promptId);
    const actions = submitted ? "" : `
      <div class="guess-fields" data-guess-card="${escapeHtml(answer.id)}">
        <label>
          <span>Кто написал начало?</span>
          ${guessSelectHtml(answer.id, "prompt")}
        </label>
        <label>
          <span>Кто добил?</span>
          ${guessSelectHtml(answer.id, "answer")}
        </label>
      </div>
    `;
    return jokeCardHtml({
      meta: `Шутка ${index + 1} · авторы скрыты`,
      promptText: prompt?.text || "",
      answerText: answer.text || "",
      promptAudio: prompt?.audio || null,
      answerAudio: answer.audio || null,
      actions
    });
  }).join("");

  app.innerHTML = `
    <div class="game-stage guess-stage">
      ${stageTitle(`Раунд ${currentRoom.round} · Угадай автора`)}
      <div class="stage-timer-row">${timerHtml()}</div>
      <p class="prompt-box stage-message centered-meta">Сначала попробуйте угадать, кто написал начало и кто добил. Потом будет обычное голосование за лучшую шутку.</p>
      ${submitted ? `<p class="prompt-box stage-message centered-meta">Ответы отправлены. Ждём остальных игроков.</p>` : ""}
      <div class="jokes stage-jokes guess-jokes">${guessCards}</div>
    </div>
  `;
}

function renderVoting() {
  const revealAuthor = currentRoom.gameMode === "guess_author" ? false : !currentRoom.settings.anonymousMode;
  app.classList.add("game-stage-card", "compact-game-stage-card");
  app.innerHTML = `
    <div class="game-stage reveal-stage">
      ${stageTitle(currentRoom.gameMode === "duel_tournament" ? `${duelBattleTitle()} · голосование` : (currentRoom.gameMode === "chaos_chain" ? "Цепочка хаоса · голосование" : (currentRoom.gameMode === "story_chain" ? "Шутка с продолжением · голосование" : `Раунд ${currentRoom.round} · Голосование`)))}
      <div class="stage-timer-row">${timerHtml()}</div>
      ${hasVoted() ? `<p class="prompt-box stage-message centered-meta">${COPY.messages.voteSubmitted}</p>` : (isDuelMode() && !canVoteCurrentRound() ? `<p class="prompt-box stage-message centered-meta">Ты участник этого боя. Голосуют судьи вне дуэли.</p>` : "")}
      ${jokesHtml({ voting: true, revealAuthor })}
    </div>
  `;
}

function historyHtml() {
  const count = currentRoom.bestJokesHistory.length;
  if (!count) {
    return `
      <section class="history-disclosure">
        <button class="history-summary" type="button" disabled>
          <span>${COPY.labels.history}</span>
          <span class="history-count">0</span>
        </button>
        <div class="history-body">
          <p class="meta history-empty">${COPY.empty.history}</p>
        </div>
      </section>
    `;
  }

  const latestIndex = count - 1;
  const latest = currentRoom.bestJokesHistory[latestIndex];
  const rest = currentRoom.bestJokesHistory
    .map((joke, index) => ({ joke, index }))
    .filter((item) => item.index !== latestIndex)
    .reverse();

  return `
    <section class="history-disclosure ${historyOpen ? "is-open" : ""}">
      <button class="history-summary" type="button" data-action="toggle-history" aria-expanded="${historyOpen ? "true" : "false"}">
        <span>${COPY.labels.history}</span>
        <span class="history-count">${count}</span>
      </button>

      <div class="history-body">
        <div class="history-preview">
          ${jokeCardHtml({
            meta: `Последняя · Раунд ${latest.round} · ${latest.authorName} · голосов: ${latest.votesCount}${latest.tied ? " · ничья" : ""}`,
            promptText: latest.promptText,
            answerText: latest.answerText,
            promptAudio: latest.promptAudio || null,
            answerAudio: latest.answerAudio || null,
            chainSegments: latest.chainSegments || null,
            compact: true,
            actions: `<button class="btn ghost compact-btn" data-action="copy-history" data-history-index="${latestIndex}">${COPY.buttons.copy}</button><button class="btn ghost compact-btn" data-action="share-history" data-history-index="${latestIndex}">${COPY.buttons.shareCard}</button>`
          })}
        </div>

        ${historyOpen && rest.length ? `
          <div class="history compact-history">
            ${rest.map(({ joke, index }) => jokeCardHtml({
              meta: `Раунд ${joke.round} · ${joke.authorName} · голосов: ${joke.votesCount}${joke.tied ? " · ничья" : ""}`,
              promptText: joke.promptText,
              answerText: joke.answerText,
              promptAudio: joke.promptAudio || null,
              answerAudio: joke.answerAudio || null,
              chainSegments: joke.chainSegments || null,
              compact: true,
              actions: `<button class="btn ghost compact-btn" data-action="copy-history" data-history-index="${index}">${COPY.buttons.copy}</button><button class="btn ghost compact-btn" data-action="share-history" data-history-index="${index}">${COPY.buttons.shareCard}</button>`
            })).join("")}
          </div>
        ` : ""}
      </div>
    </section>
  `;
}

function scoresHtml() {
  return `
    <div class="scores stage-scores">
      ${[...currentRoom.players].sort((a, b) => b.score - a.score).map((player) => `
        <div class="score-row">
          <span>${escapeHtml(player.name)}</span>
          <span>${player.score} очк.</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderScoreboard() {
  const isFinalNext = currentRoom.round >= currentRoom.maxRounds;
  const bestJokes = currentRoom.lastBestJokes?.length
    ? currentRoom.lastBestJokes
    : (currentRoom.lastBestJoke ? [currentRoom.lastBestJoke] : []);
  const tieText = currentRoom.lastRoundTie
    ? `<div class="tie-banner">Ничья: ${currentRoom.lastRoundTie.winnersCount} шутки набрали по ${currentRoom.lastRoundTie.votesCount} голос.</div>`
    : "";

  app.classList.add("game-stage-card", "scoreboard-stage-card");
  app.innerHTML = `
    <div class="game-stage scoreboard-stage">
      ${stageTitle(currentRoom.gameMode === "duel_tournament" ? `${duelBattleTitle()} · итоги боя` : COPY.screens.scoreboard(currentRoom.round))}
      ${scoresHtml()}

      <section class="stage-section">
        <h3 class="section-title centered-title">${COPY.labels.roundVotes}</h3>
        ${tieText}
        <div class="jokes stage-jokes">
          ${currentRoom.lastRoundResults.map((result) => jokeCardHtml({
            meta: `Автор: ${result.authorName} · голосов: ${result.votesCount}${result.isRoundWinner ? " · лучшая шутка раунда" : ""}`,
            promptText: result.promptText,
            answerText: result.answerText,
            promptAudio: result.promptAudio || null,
            answerAudio: result.answerAudio || null,
            chainSegments: result.chainSegments || null,
            winner: result.isRoundWinner
          })).join("")}
        </div>
      </section>

      <section class="stage-section">
        <h3 class="section-title centered-title">${bestJokes.length > 1 ? COPY.screens.bestMultiple : COPY.screens.bestSingle}</h3>
        ${bestJokes.length ? `
          <div class="jokes stage-jokes">
            ${bestJokes.map((joke, index) => jokeCardHtml({
              meta: `${joke.authorName} · голосов: ${joke.votesCount}${bestJokes.length > 1 ? " · ничья" : ""}`,
              promptText: joke.promptText,
              answerText: joke.answerText,
              promptAudio: joke.promptAudio || null,
              answerAudio: joke.answerAudio || null,
              chainSegments: joke.chainSegments || null,
              winner: true,
              actions: `<button class="btn yellow" data-action="copy-best" data-best-index="${index}">${COPY.buttons.copyBest}</button>`
            })).join("")}
          </div>
        ` : `<p class="meta centered-meta">${COPY.empty.best}</p>`}
      </section>

      ${historyHtml()}
    </div>
  `;
}


function grandFinalCandidatesHtml({ finished = false } = {}) {
  const candidates = currentRoom.grandFinal?.candidates || [];
  const winners = currentRoom.grandFinal?.winners || [];
  const winnerIds = new Set(winners.map((item) => item.jokeId));
  if (!candidates.length) return `<p class="meta centered-meta">Финальных шуток пока нет.</p>`;
  return `
    <div class="jokes stage-jokes grand-jokes">
      ${candidates.map((joke) => {
        const isWinner = winnerIds.has(joke.jokeId);
        const disabled = hasGrandVoted() || !canVoteGrandJoke(joke);
        const metaParts = [
          `Раунд ${joke.round}`,
          `${joke.promptAuthorName || "Игра"} + ${joke.answerAuthorName || joke.authorName || "аноним"}`,
          finished ? `${joke.finalVotes || 0} фин. голосов` : `${joke.votesCount || 0} голосов в раунде`
        ];
        return jokeCardHtml({
          meta: metaParts.join(" · "),
          promptText: joke.promptText,
          answerText: joke.answerText,
          promptAudio: joke.promptAudio || null,
          answerAudio: joke.answerAudio || null,
          chainSegments: joke.chainSegments || null,
          winner: isWinner,
          actions: finished
            ? `<button class="btn ghost compact-btn" data-action="share-grand-joke" data-joke-id="${escapeHtml(joke.jokeId)}">${COPY.buttons.shareCard}</button>`
            : `<button class="btn primary" data-action="grand-vote" data-joke-id="${escapeHtml(joke.jokeId)}" ${disabled ? "disabled" : ""}>${disabled && !hasGrandVoted() ? "Вы участник этой шутки" : COPY.buttons.grandVote}</button>`
        });
      }).join("")}
    </div>
  `;
}

function renderGrandVoting() {
  app.classList.add("game-stage-card", "scoreboard-stage-card");
  app.innerHTML = `
    <div class="game-stage scoreboard-stage grand-voting-stage">
      ${stageTitle(COPY.screens.grandVoting, "финальное голосование")}
      <div class="stage-timer-row">${timerHtml()}</div>
      <p class="prompt-box stage-message centered-meta">Выберите лучшую шутку из победителей раундов. За свою связку голосовать нельзя, если есть другие варианты.</p>
      ${hasGrandVoted() ? `<p class="prompt-box stage-message centered-meta">${COPY.messages.grandVoteSubmitted}</p>` : ""}
      ${grandFinalCandidatesHtml()}
    </div>
  `;
}

function awardRarityLabel(rarity = "common") {
  const labels = {
    common: "обычный титул",
    rare: "редкий титул",
    epic: "эпический титул",
    legendary: "легендарный титул"
  };
  return labels[rarity] || labels.common;
}

function personalAwardCardHtml(player, { compact = false } = {}) {
  return `
    <article class="final-award-card ${compact ? "final-award-compact" : ""}">
      <div class="final-award-place">${player.place} место</div>
      <h3>${escapeHtml(player.name)}</h3>
      <p class="final-score">${player.score} ${player.score === 1 ? "очко" : "очк."}</p>
      <div class="crafted-title ${escapeHtml(player.title?.rarity || "common")}">${escapeHtml(player.title?.title || "Участник хаоса")}</div>
      <p class="meta">${escapeHtml(player.title?.description || "Был в игре и внёс свою часть беспорядка.")}</p>
      ${player.statsPreview?.length ? `<div class="award-chips">${player.statsPreview.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
    </article>
  `;
}

function pairAwardCardHtml(pair) {
  return `
    <article class="final-award-card pair-award-card">
      <div class="final-award-place">${pair.place} место · связка</div>
      <h3>${pair.players.map((player) => escapeHtml(player.name)).join(" + ")}</h3>
      <div class="crafted-title ${escapeHtml(pair.title?.rarity || "common")}">${escapeHtml(pair.title?.title || "Лучшая парочка")}</div>
      <p class="meta">${escapeHtml(pair.title?.description || "Один закинул, второй добил — и вместе они собрали реакцию.")}</p>
      ${pair.statsPreview?.length ? `<div class="award-chips">${pair.statsPreview.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
    </article>
  `;
}

function trioAwardCardHtml(trio) {
  return `
    <article class="final-award-card trio-award-card">
      <div class="final-award-place">трио</div>
      <h3>${trio.players.map((player) => escapeHtml(player.name)).join(" + ")}</h3>
      <div class="crafted-title ${escapeHtml(trio.title?.rarity || "epic")}">${escapeHtml(trio.title?.title || "Трио вечера")}</div>
      <p class="meta">${escapeHtml(trio.title?.description || trio.description || "Эта тройка заметно повлияла на игру.")}</p>
      ${trio.statsPreview?.length ? `<div class="award-chips">${trio.statsPreview.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
    </article>
  `;
}

function renderFinalSummary() {
  const summary = currentRoom.finalSummary;
  if (!summary) return null;
  const grandWinners = summary.grandFinal?.winners || [];
  return `
    ${grandWinners.length ? `
      <section class="stage-section final-section">
        <h3 class="section-title centered-title">${grandWinners.length > 1 ? "Шутки вечера" : "Шутка вечера"}</h3>
        <div class="jokes stage-jokes">
          ${grandWinners.map((joke) => jokeCardHtml({
            meta: `Раунд ${joke.round} · ${joke.promptAuthorName || "Игра"} + ${joke.answerAuthorName || joke.authorName || "аноним"} · фин. голосов: ${joke.finalVotes || 0}`,
            promptText: joke.promptText,
            answerText: joke.answerText,
            promptAudio: joke.promptAudio || null,
            answerAudio: joke.answerAudio || null,
            chainSegments: joke.chainSegments || null,
            winner: true,
            actions: `<button class="btn ghost compact-btn" data-action="share-grand-joke" data-joke-id="${escapeHtml(joke.jokeId)}">${COPY.buttons.shareCard}</button>`
          })).join("")}
        </div>
      </section>
    ` : ""}

    <section class="stage-section final-section">
      <h3 class="section-title centered-title">${COPY.labels.personalPodium}</h3>
      <div class="final-awards-grid personal-podium-grid podium-count-${Math.min((summary.podium || []).length, 3)}">
        ${(summary.podium || []).map((player) => personalAwardCardHtml(player)).join("")}
      </div>
    </section>

    ${(summary.pairs?.podium || []).length ? `
      <section class="stage-section final-section">
        <h3 class="section-title centered-title">${COPY.labels.pairAwards}</h3>
        <div class="final-awards-grid pair-awards-grid">
          ${summary.pairs.podium.slice(0, 3).map(pairAwardCardHtml).join("")}
        </div>
        ${summary.pairs.others?.length ? `
          <details class="final-details">
            <summary>Показать остальные связки · ${summary.pairs.others.length}</summary>
            <div class="final-compact-list">
              ${summary.pairs.others.map((pair) => `<div class="score-row"><span>${pair.players.map((p) => escapeHtml(p.name)).join(" + ")} · ${escapeHtml(pair.title.title)}</span><span>${pair.totalVotes} голосов</span></div>`).join("")}
            </div>
          </details>
        ` : ""}
      </section>
    ` : ""}

    ${(summary.trios || []).length ? `
      <section class="stage-section final-section">
        <h3 class="section-title centered-title">${COPY.labels.trioAwards}</h3>
        <div class="final-awards-grid pair-awards-grid">
          ${summary.trios.map(trioAwardCardHtml).join("")}
        </div>
      </section>
    ` : ""}

    ${(summary.otherPlayers || []).length ? `
      <section class="stage-section final-section">
        <h3 class="section-title centered-title">${COPY.labels.otherPlayers}</h3>
        <div class="final-compact-list">
          ${summary.otherPlayers.map((player) => personalAwardCardHtml(player, { compact: true })).join("")}
        </div>
      </section>
    ` : ""}

    ${(summary.specialRoles || []).length ? `
      <section class="stage-section final-section">
        <h3 class="section-title centered-title">${COPY.labels.specialRoles}</h3>
        <div class="titles">
          ${summary.specialRoles.map((role) => `
            <div class="title-row">
              <span>${escapeHtml(role.title)} — ${escapeHtml(role.playerName)}</span>
              <span class="meta">${escapeHtml(role.description)}</span>
            </div>
          `).join("")}
        </div>
      </section>
    ` : ""}
  `;
}

function renderFinished() {
  const winner = [...currentRoom.players].sort((a, b) => b.score - a.score)[0];
  const summaryHtml = renderFinalSummary();
  app.classList.add("game-stage-card", "scoreboard-stage-card");
  app.innerHTML = `
    <div class="game-stage scoreboard-stage final-stage">
      ${stageTitle(COPY.screens.finished)}
      ${summaryHtml || `
        <div class="prompt-box stage-message centered-meta">Победитель: ${escapeHtml(winner?.name || COPY.empty.winnerMissing)} · титул: Главный клоун лобби</div>
        ${scoresHtml()}
        <section class="stage-section">
          <h3 class="section-title centered-title">${COPY.labels.titles}</h3>
          <div class="titles">
            ${currentRoom.titles.map((title) => `
              <div class="title-row">
                <span>${escapeHtml(title.title)} - ${escapeHtml(title.playerName)}</span>
                <span class="meta">${escapeHtml(title.note)}</span>
              </div>
            `).join("")}
          </div>
        </section>
      `}
      ${historyHtml()}
    </div>
  `;
}

function render() {
  const focusState = captureTypingFocus();
  if (!currentRoom || currentRoom.state !== "waiting" || !lobbySettingsOpen) {
    closeSettingsModal();
  }
  app.classList.remove("plain-menu-card", "code-join-card", "server-list-card", "create-game-card", "waiting-room-card", "game-stage-card", "compact-game-stage-card", "scoreboard-stage-card");
  document.body.classList.toggle("home-screen", !currentRoom && currentScreen === "home");
  document.body.classList.toggle(
    "simple-screen",
    !currentRoom && ["home", "join", "code", "create", "lobbies", "invite", "inviteBlocked", "lobbyMissing", "notFound"].includes(currentScreen)
  );
  document.body.classList.toggle("create-screen", !currentRoom && currentScreen === "create");
  document.body.classList.toggle("waiting-screen", Boolean(currentRoom && currentRoom.state === "waiting"));
  document.body.classList.toggle("stage-screen", Boolean(currentRoom && ["starting", "collectingSharedPrompts", "prompting", "answering", "revealing", "guessing", "voting"].includes(currentRoom.state)));
  document.body.classList.toggle("scoreboard-screen", Boolean(currentRoom && ["scoreboard", "grandVoting", "finished"].includes(currentRoom.state)));
  document.body.classList.toggle("has-room-controls", Boolean(currentRoom));
  if (!currentRoom) {
    if (currentScreen === "create") renderCreateRoom();
    else if (currentScreen === "join") renderJoinMenu();
    else if (currentScreen === "lobbies") renderLobbyBrowser();
    else if (currentScreen === "code") renderCodeJoin();
    else if (currentScreen === "watch") {
      renderWatchJoin();
      setTimeout(() => {
        if (viewerMode && !currentRoom) requestSpectatorJoin();
      }, 0);
    }
    else if (currentScreen === "invite") {
      renderInviteJoin();
      setTimeout(requestInviteJoin, 0);
    }
    else if (currentScreen === "inviteBlocked") renderInviteBlocked();
    else if (currentScreen === "lobbyMissing") renderLobbyMissing();
    else if (currentScreen === "notFound") renderNotFound();
    else renderHome();
    clearRoomControlsRoot();
    restartScreenAnimation();
    restoreTypingFocus(focusState);
    initializeVoiceMessages();
    updateRecordingTimer();
    return;
  }

  const state = currentRoom.state;
  if (isSpectatorView() && state !== "finished" && state !== "waiting") {
    renderSpectator();
    renderRoomControlsRoot();
    startTimerView();
    restartScreenAnimation();
    initializeVoiceMessages();
    updateRecordingTimer();
    return;
  }
  if (state === "waiting") renderWaiting();
  if (state === "starting") renderStarting();
  if (state === "collectingSharedPrompts") renderPrompting({ sharedCollection: true });
  if (state === "prompting") renderPrompting();
  if (state === "answering") renderAnswering();
  if (state === "revealing") renderRevealing();
  if (state === "guessing") renderGuessing();
  if (state === "voting") renderVoting();
  if (state === "scoreboard") renderScoreboard();
  if (state === "grandVoting") renderGrandVoting();
  if (state === "finished") renderFinished();
  renderRoomControlsRoot();
  startTimerView();
  restartScreenAnimation();
  restoreTypingFocus(focusState);
  initializeVoiceMessages();
  updateRecordingTimer();
}

function restartScreenAnimation() {
  app.classList.remove("screen-pop");
  requestAnimationFrame(() => {
    app.classList.add("screen-pop");
  });
}

function readName() {
  const input = document.getElementById("nameInput");
  myName = input?.value.trim() || myName;
  return myName;
}

function validateSettingsForSubmit(settings) {
  if (settings?.promptPack === "customOnly" && !safeArray(settings.customPromptPacks).length) {
    showToast(COPY.messages.customPackRequired);
    return false;
  }
  return true;
}

function readSettings() {
  return {
    maxRounds: document.getElementById("maxRounds")?.value ?? DEFAULT_ROOM_SETTINGS.maxRounds,
    promptSeconds: document.getElementById("promptSeconds")?.value ?? DEFAULT_ROOM_SETTINGS.promptSeconds,
    answerSeconds: document.getElementById("answerSeconds")?.value ?? DEFAULT_ROOM_SETTINGS.answerSeconds,
    voteSeconds: document.getElementById("voteSeconds")?.value ?? DEFAULT_ROOM_SETTINGS.voteSeconds,
    anonymousMode: document.getElementById("anonymousMode")?.checked ?? DEFAULT_ROOM_SETTINGS.anonymousMode,
    soundsEnabled: document.getElementById("soundsEnabled")?.checked ?? DEFAULT_ROOM_SETTINGS.soundsEnabled,
    promptMode: document.getElementById("promptMode")?.value ?? DEFAULT_ROOM_SETTINGS.promptMode,
    promptPack: document.getElementById("promptPack")?.value ?? DEFAULT_ROOM_SETTINGS.promptPack,
    customPromptPacks: loadCustomPromptPacks(),
    spectatorMode: document.getElementById("spectatorMode")?.checked ?? DEFAULT_ROOM_SETTINGS.spectatorMode,
    spectatorVoting: document.getElementById("spectatorVoting")?.value ?? DEFAULT_ROOM_SETTINGS.spectatorVoting,
    maxPlayers: document.getElementById("maxPlayers")?.value ?? DEFAULT_ROOM_SETTINGS.maxPlayers,
    publicLobby: document.getElementById("publicLobby")?.checked ?? DEFAULT_ROOM_SETTINGS.publicLobby
  };
}


document.addEventListener("input", (event) => {
  if (event.target?.id === "lobbySearchInput") {
    lobbySearchQuery = event.target.value || "";
    render();
    return;
  }
  if (!currentRoom) return;
  if (event.target?.id === "promptInput") {
    inputDrafts.prompts[promptDraftKey()] = event.target.value;
  }
  if (event.target?.id === "answerInput") {
    inputDrafts.answers[answerDraftKey()] = event.target.value;
  }
});

document.addEventListener("change", async (event) => {
  const input = event.target?.closest?.("[data-audio-input]");
  if (!input) return;
  const type = input.dataset.audioInput;
  const file = input.files?.[0];
  if (!file) return;

  try {
    await applyAudioFile(type, file);
  } finally {
    input.value = "";
  }
});


function audioDropZoneFromEvent(event) {
  return event.target?.closest?.("[data-audio-drop]");
}

function hasDraggedFiles(event) {
  return Array.from(event.dataTransfer?.types || []).includes("Files");
}

document.addEventListener("dragover", (event) => {
  if (!hasDraggedFiles(event)) return;
  event.preventDefault();
  const zone = audioDropZoneFromEvent(event);
  document.querySelectorAll(".audio-tools.is-dragover").forEach((item) => {
    if (item !== zone) item.classList.remove("is-dragover");
  });
  if (zone) zone.classList.add("is-dragover");
});

document.addEventListener("dragleave", (event) => {
  const zone = audioDropZoneFromEvent(event);
  if (!zone || zone.contains(event.relatedTarget)) return;
  zone.classList.remove("is-dragover");
});

document.addEventListener("drop", async (event) => {
  if (!hasDraggedFiles(event)) return;
  event.preventDefault();
  const zone = audioDropZoneFromEvent(event);
  document.querySelectorAll(".audio-tools.is-dragover").forEach((item) => item.classList.remove("is-dragover"));
  if (!zone) return;
  const type = zone.dataset.audioDrop;
  const file = Array.from(event.dataTransfer?.files || []).find(isAllowedAudioFile) || event.dataTransfer?.files?.[0];
  if (!file) return showToast(COPY.messages.audioUnsupported);
  await applyAudioFile(type, file);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  const routeButton = event.target.closest("[data-route]");
  const clickable = event.target.closest("button, [role='button'], .open-room");

  const action = button?.dataset.action;
  const isDisabled =
    clickable?.disabled ||
    clickable?.getAttribute?.("aria-disabled") === "true";

  const actionsWithOwnSound = [
    "copy-code",
    "copy-invite-link",
    "copy-watch-link",
    "share-invite-link",
    "share-history",
    "share-grand-joke",
    "copy-joke",
    "copy-best",
    "copy-history",

    "create-mode-room",
    "join-room",
    "join-open-room",
    "join-invite",

    "toggle-audio",
    "start-recording-prompt",
    "stop-recording-prompt",
    "start-recording-answer",
    "stop-recording-answer",
    "remove-audio-prompt",
    "remove-audio-answer",

    "vote",
    "grand-vote",
    "leave-room",
    "delete-room",
    "choose-role",
    "set-player-role",
    "unlock-role-choice",
    "transfer-host",
    "kick-player",
    "ban-player"
  ];

  const shouldPlayGenericClick =
    clickable &&
    !isDisabled &&
    !actionsWithOwnSound.includes(action);

  if (shouldPlayGenericClick) {
    playSound("click");
  }

  if (event.target?.id === "settingsModal") {
    requestCloseSettingsModal();
    return;
  }

  if (event.target?.id === "settingsDiscardConfirm") {
    document.getElementById("settingsDiscardConfirm")?.remove();
    return;
  }

  if (routeButton) {
    const targetScreen = routeButton.dataset.route;
    navigateTo(targetScreen);
    return;
  }

  if (!button) return;

  if (action === "toggle-audio") {
    const voice = button.closest(".voice-message");
    const audio = voice?.querySelector("audio");
    if (!audio) return;
    document.querySelectorAll(".voice-message audio").forEach((item) => {
      if (item !== audio) {
        item.pause();
        const otherButton = item.closest(".voice-message")?.querySelector(".voice-play");
        if (otherButton) otherButton.textContent = "▶";
      }
    });
    if (audio.paused) {
      audio.play().then(() => {
        button.textContent = "Ⅱ";
        voice.classList.add("is-playing");
        updateVoiceMessageTime(voice, audio);
      }).catch(() => showToast(COPY.messages.audioUnsupported));
      audio.onended = () => {
        button.textContent = "▶";
        voice.classList.remove("is-playing");
        updateVoiceMessageTime(voice, audio);
      };
      audio.onpause = () => {
        button.textContent = "▶";
        voice.classList.remove("is-playing");
        updateVoiceMessageTime(voice, audio);
      };
    } else {
      audio.pause();
      button.textContent = "▶";
      voice.classList.remove("is-playing");
      updateVoiceMessageTime(voice, audio);
    }
    return;
  }

  if (action === "home") {
    navigateTo("home");
  }

  if (action === "open-create") {
    navigateTo("create");
  }

  if (action === "open-lobbies") {
    navigateTo("lobbies");
  }

  if (action === "refresh-lobbies") {
    requestOpenRooms();
    render();
  }

  if (action === "toggle-lobby-secret") {
    lobbySecretHidden = !lobbySecretHidden;
    render();
    return;
  }

  if (action === "spectator-reaction") {
    socket.emit("spectatorReaction", { emoji: button.dataset.emoji });
  }

  if (action === "toggle-history") {
    historyOpen = !historyOpen;
    render();
  }

  if (action === "edit-prompt-draft") {
    promptEditMode = true;
    const prompt = getMyPrompt();
    inputDrafts.prompts[promptDraftKey()] = prompt?.text || "";
    audioDrafts.prompts[promptDraftKey()] = prompt?.audio || null;
    render();
  }

  if (action === "edit-answer-draft") {
    answerEditMode = true;
    const answer = getMyAnswer();
    inputDrafts.answers[answerDraftKey()] = answer?.text || "";
    audioDrafts.answers[answerDraftKey()] = answer?.audio || null;
    render();
  }

  if (action === "start-recording-prompt") startAudioRecording("prompt");
  if (action === "stop-recording-prompt") stopAudioRecording();
  if (action === "remove-audio-prompt") {
    setAudioDraft("prompt", null);
    showToast(COPY.messages.audioRemoved);
    render();
  }

  if (action === "start-recording-answer") startAudioRecording("answer");
  if (action === "stop-recording-answer") stopAudioRecording();
  if (action === "remove-audio-answer") {
    setAudioDraft("answer", null);
    showToast(COPY.messages.audioRemoved);
    render();
  }

  if (action === "create-custom-pack") {
    const packs = loadCustomPromptPacks();
    if (packs.length >= CUSTOM_PROMPT_PACK_LIMIT) return showToast(COPY.messages.customPackLimit);
    const name = document.getElementById("newCustomPackName")?.value.trim();
    const prompts = parsePromptLines(document.getElementById("newCustomPackPrompts")?.value || "");
    const pack = sanitizeCustomPromptPack({ id: createPromptPackId(), name, prompts }, packs.length);
    if (!pack) return showToast(COPY.messages.customPackEmpty);
    saveCustomPromptPacks([...packs, pack]);
    showToast(COPY.messages.customPackSaved);
    if (lobbySettingsOpen) renderSettingsModal();
    else render();
    return;
  }

  if (action === "save-custom-pack") {
    const packId = normalizePackId(button.dataset.packId);
    const packs = loadCustomPromptPacks();
    const index = packs.findIndex((pack) => pack.id === packId);
    if (index === -1) return;
    const name = document.querySelector(`[data-custom-pack-name="${packId}"]`)?.value.trim();
    const prompts = parsePromptLines(document.querySelector(`[data-custom-pack-prompts="${packId}"]`)?.value || "");
    const pack = sanitizeCustomPromptPack({ id: packId, name, prompts }, index);
    if (!pack) return showToast(COPY.messages.customPackEmpty);
    packs[index] = pack;
    saveCustomPromptPacks(packs);
    showToast(COPY.messages.customPackSaved);
    if (lobbySettingsOpen) renderSettingsModal();
    else render();
    return;
  }

  if (action === "delete-custom-pack") {
    const packId = normalizePackId(button.dataset.packId);
    const packs = loadCustomPromptPacks().filter((pack) => pack.id !== packId);
    saveCustomPromptPacks(packs);
    const select = document.getElementById("promptPack");
    if (select?.value === `custom:${packId}`) select.value = "mixed";
    showToast(COPY.messages.customPackDeleted);
    if (lobbySettingsOpen) renderSettingsModal();
    else render();
    return;
  }

  if (action === "create-mode-room") {
    const modeId = button.dataset.mode || "classic_pairs";
    const mode = gameModeInfo(modeId);
    if (!mode.enabled) return showToast("Этот режим будет в следующем патче.");
    const settings = { ...DEFAULT_ROOM_SETTINGS, customPromptPacks: loadCustomPromptPacks() };
    ensureNameThen(() => {
      socket.emit("createRoom", { name: myName, sessionId, gameMode: modeId, settings });
    });
  }

  if (action === "toggle-settings") {
    if (lobbySettingsOpen) requestCloseSettingsModal();
    else openSettingsModal();
  }

  if (action === "close-settings") {
    requestCloseSettingsModal();
  }

  if (action === "continue-settings-edit") {
    document.getElementById("settingsDiscardConfirm")?.remove();
  }

  if (action === "discard-settings-changes") {
    closeSettingsModal();
  }

  if (action === "save-lobby-settings") {
    const settings = readSettings();
    if (!validateSettingsForSubmit(settings)) return;
    socket.emit("updateRoomSettings", { settings });
    closeSettingsModal();
  }

  if (action === "join-room") {
    const code = document.getElementById("roomCodeInput")?.value.trim();
    if (!code) return showToast(COPY.messages.enterCode);
    ensureNameThen(() => {
      socket.emit("joinRoom", { name: myName, code, sessionId });
    });
  }

  if (action === "join-open-room") {
    if (button.disabled) return;
    const code = button.dataset.roomCode;
    const room = openRooms.find((item) => item.code === code);
    if (room?.isFull || (room && room.playersCount >= room.maxPlayers)) return showToast("Лобби заполнено.");
    ensureNameThen(() => {
      socket.emit("joinRoom", { name: myName, code, sessionId });
    });
  }

  if (action === "join-invite") {
    viewerMode = false;
    inviteJoinRequestedFor = null;
    requestInviteJoin();
  }

  if (action === "join-spectator-route") {
    const code = routeRoomCode;
    if (!code) return;
    viewerMode = true;
    setRoute(`/watch/${code}`);
    requestSpectatorJoin();
  }

  if (action === "join-spectator") {
    requestSpectatorJoin();
  }

  if (action === "confirm-name") {
    const input = document.getElementById("modalNameInput");
    const nextName = input?.value.trim();
    if (!nextName) return showToast(COPY.messages.enterName);
    myName = nextName;
    localStorage.setItem(STORAGE_KEYS.playerName, myName);
    const actionToRun = pendingNameAction;
    closeNameModal();
    actionToRun?.();
  }

  if (action === "cancel-name") {
    closeNameModal();
  }

  if (action === "edit-name") {
    pendingNameAction = () => {
      socket.emit("updateName", { name: myName });
    };
    renderNameModal({
      title: "Сменить ник",
      note: "Новое имя сразу увидят игроки в лобби.",
      buttonText: "Сохранить"
    });
  }

  if (action === "copy-code") copyWithButtonFeedback(currentRoom.code, button);
  if (action === "copy-invite-link") copyWithButtonFeedback(inviteLink(currentRoom.code), button);
  if (action === "copy-watch-link") copyWithButtonFeedback(watchLink(currentRoom.code), button);
  if (action === "share-invite-link") shareInviteLink(currentRoom.code);
  if (action === "start-game") socket.emit("startGame");

  if (action === "choose-role") {
    socket.emit("chooseRole", { role: button.dataset.role });
  }

  if (action === "set-player-role") {
    socket.emit("setPlayerRole", { playerId: button.dataset.playerId, role: button.dataset.role, locked: true });
  }

  if (action === "unlock-role-choice") {
    socket.emit("unlockRoleChoice", { playerId: button.dataset.playerId });
  }

  if (action === "transfer-host") {
    if (!window.confirm("Передать роль хоста этому игроку?")) return;
    socket.emit("transferHost", { playerId: button.dataset.playerId });
  }

  if (action === "kick-player") {
    if (!window.confirm("Кикнуть игрока из лобби?")) return;
    socket.emit("kickPlayer", { playerId: button.dataset.playerId });
  }

  if (action === "ban-player") {
    if (!window.confirm("Забанить игрока в этом лобби?")) return;
    socket.emit("banPlayer", { playerId: button.dataset.playerId });
  }

  if (action === "submit-prompt") {
    const text = document.getElementById("promptInput")?.value || "";
    const audio = getPromptAudioDraft();
    if (!text.trim() && !audio) return showToast(currentRoom?.gameMode === "duel_tournament" ? "Напишите начало для боя или добавьте аудио" : (["chaos_chain", "story_chain"].includes(currentRoom?.gameMode) ? "Напишите начало истории или добавьте аудио" : "Напишите начало фразы или добавьте аудио"));
    promptEditMode = false;
    socket.emit("submitPrompt", { text, audio });
  }

  if (action === "submit-answer") {
    const text = document.getElementById("answerInput")?.value || "";
    const audio = getAnswerAudioDraft();
    if (!text.trim() && !audio) return showToast(currentRoom?.gameMode === "duel_tournament" ? "Напишите ответ в бою или добавьте аудио" : (["chaos_chain", "story_chain"].includes(currentRoom?.gameMode) ? "Продолжите историю или добавьте аудио" : "Напишите концовку или добавьте аудио"));
    answerEditMode = false;
    socket.emit("submitAnswer", { text, audio });
  }

  if (action === "submit-guesses") {
    const guessesByAnswer = new Map();
    document.querySelectorAll(".guess-select[data-answer-id]").forEach((select) => {
      const answerId = select.dataset.answerId;
      const field = select.dataset.guessField;
      if (!guessesByAnswer.has(answerId)) guessesByAnswer.set(answerId, { answerId, promptAuthorId: "", answerAuthorId: "" });
      const item = guessesByAnswer.get(answerId);
      if (field === "prompt") item.promptAuthorId = select.value;
      if (field === "answer") item.answerAuthorId = select.value;
    });
    const guesses = [...guessesByAnswer.values()].filter((guess) => guess.promptAuthorId || guess.answerAuthorId);
    if (!guesses.length) return showToast("Выберите хотя бы одного автора");
    socket.emit("submitGuesses", { guesses });
  }

  if (action === "start-voting") socket.emit("startVoting");

  if (action === "vote") {
    playSound("vote");
    socket.emit("submitVote", { answerId: button.dataset.answerId });
  }

  if (action === "grand-vote") {
    playSound("vote");
    socket.emit("submitGrandVote", { jokeId: button.dataset.jokeId });
  }

  if (action === "copy-joke") {
    const answer = currentRoom.answers.find((item) => item.id === button.dataset.answerId);
    copyText(jokeText(answer, button.dataset.revealAuthor === "1"));
  }

  if (action === "copy-best") {
    const bestJokes = currentRoom.lastBestJokes?.length
      ? currentRoom.lastBestJokes
      : (currentRoom.lastBestJoke ? [currentRoom.lastBestJoke] : []);
    const joke = bestJokes[Number(button.dataset.bestIndex || 0)];
    if (!joke) return;
    copyText(`${joke.promptText || (joke.promptAudio ? "[голосовое начало]" : "")}\n${joke.answerText || (joke.answerAudio ? "[голосовая концовка]" : "")}\n\n- автор: ${joke.authorName}`);
  }

  if (action === "copy-history") {
    const joke = currentRoom.bestJokesHistory[Number(button.dataset.historyIndex)];
    copyText(`${joke.promptText || (joke.promptAudio ? "[голосовое начало]" : "")}\n${joke.answerText || (joke.answerAudio ? "[голосовая концовка]" : "")}\n\n- автор: ${joke.authorName}`);
  }

  if (action === "next-round") socket.emit("nextRound");
  if (action === "restart-game") socket.emit("restartGame");

  if (action === "leave-room") {
    if (!window.confirm(COPY.messages.confirmLeave)) return;
    socket.emit("leaveRoom");
  }

  if (action === "delete-room") {
    if (!window.confirm(COPY.messages.confirmDelete)) return;
    socket.emit("deleteRoom");
  }
});

document.addEventListener("dragstart", (event) => {
  const pill = event.target.closest(".player-pill[draggable='true']");
  if (!pill || !isHost()) return;
  event.dataTransfer.setData("text/plain", pill.dataset.playerId);
  event.dataTransfer.effectAllowed = "move";
  pill.classList.add("dragging");
});

document.addEventListener("dragend", (event) => {
  event.target.closest(".player-pill")?.classList.remove("dragging");
  document.querySelectorAll(".role-drop-zone.is-drag-over").forEach((zone) => zone.classList.remove("is-drag-over"));
});

document.addEventListener("dragover", (event) => {
  const zone = event.target.closest(".role-drop-zone");
  if (!zone || !isHost()) return;
  event.preventDefault();
  zone.classList.add("is-drag-over");
  event.dataTransfer.dropEffect = "move";
});

document.addEventListener("dragleave", (event) => {
  const zone = event.target.closest(".role-drop-zone");
  if (!zone) return;
  if (!zone.contains(event.relatedTarget)) zone.classList.remove("is-drag-over");
});

document.addEventListener("drop", (event) => {
  const zone = event.target.closest(".role-drop-zone");
  if (!zone || !isHost()) return;
  event.preventDefault();
  zone.classList.remove("is-drag-over");
  const playerId = event.dataTransfer.getData("text/plain");
  const role = zone.dataset.dropRole;
  if (!playerId || !role) return;
  socket.emit("setPlayerRole", { playerId, role, locked: true });
});

function returnHomeFromRoom(message) {
  clearSavedRoom();
  currentRoom = null;
  previousState = null;
  currentScreen = "home";
  routeRoomCode = null;
  inviteJoinRequestedFor = null;
  setRoute(ROUTES.home, { replace: true });
  if (message) showToast(message);
  render();
}

socket.on("connect", () => {
  showToast(COPY.messages.connected);
  requestOpenRooms();
  const savedCode = localStorage.getItem(STORAGE_KEYS.roomCode);
  const savedName = localStorage.getItem(STORAGE_KEYS.playerName);
  if (savedCode && savedName && (!routeRoomCode || savedCode === routeRoomCode)) {
    socket.emit("reconnectRoom", {
      code: savedCode,
      name: savedName,
      sessionId
    });
  }
});

socket.on("roomCreated", ({ code, sessionId: nextSessionId }) => {
  lobbySettingsOpen = false;
  viewerMode = false;
  lobbySecretHidden = false;
  rememberSession(code, nextSessionId);
  playSound("join");
  setRoute(`/lobby/${code}`);
  showToast(COPY.messages.roomCreated(code));
});

socket.on("joinedSpectator", ({ code, sessionId: nextSessionId }) => {
  viewerMode = true;
  lobbySecretHidden = false;
  rememberSession(code, nextSessionId);
  setRoute(`/watch/${code}`, { replace: true });
  showToast(COPY.messages.spectatorJoined);
});

socket.on("joinedRoom", ({ code, sessionId: nextSessionId, reconnected }) => {
  lobbySettingsOpen = false;
  viewerMode = false;
  lobbySecretHidden = false;
  rememberSession(code, nextSessionId);
  playSound("join");
  setRoute(`/lobby/${code}`, { replace: currentScreen === "invite" });
  showToast(reconnected ? COPY.messages.reconnected(code) : COPY.messages.joined(code));
});

socket.on("rejoinedRoom", ({ code, sessionId: nextSessionId }) => {
  viewerMode = false;
  lobbySecretHidden = false;
  rememberSession(code, nextSessionId);
  playSound("join");
  showToast(COPY.messages.returned(code));
});

socket.on("sessionExpired", () => {
  returnHomeFromRoom(COPY.messages.sessionExpired);
});

socket.on("roomUpdate", (room) => {
  const oldState = previousState;
  if (typeof room.serverNow === "number") {
    serverTimeOffset = room.serverNow - Date.now();
  }
  currentRoom = room;
  if (viewerMode) setRoute(`/watch/${room.code}`, { replace: true });
  else setRoute(pathForRoom(room), { replace: true });

  if (oldState && oldState !== room.state) {
    clearDraftForState(room.state, room);
    if (room.state === "finished") historyOpen = false;
    pendingNameAction = null;
    closeNameModal();
    closeSettingsModal();
  }

  if (oldState !== room.state) {
    if (room.state === "starting") playSound("reveal", { respectRoomSetting: true });
    if (room.state === "revealing") playRevealSound();
    if (room.state === "finished") playWinSound();
  }

  previousState = room.state;
  render();
});

socket.on("errorMessage", (message) => {
  playSound("error");

  const normalized = String(message || "").toLowerCase();

  if (normalized.includes("игра уже началась")) {
    currentRoom = null;
    previousState = null;
    currentScreen = "inviteBlocked";
    setRoute("/game-started", { replace: true });
    render();
    return;
  }

  if (
    normalized.includes("лобби не найден") ||
    normalized.includes("комната не найдена") ||
    normalized.includes("room not found") ||
    normalized.includes("not found")
  ) {
    clearSavedRoom();
    currentRoom = null;
    previousState = null;
    currentScreen = "lobbyMissing";
    routeRoomCode = null;
    inviteJoinRequestedFor = null;
    setRoute("/lobby-not-found", { replace: true });
    render();
    return;
  }

  showToast(message);
});

socket.on("roomNotice", ({ message }) => {
  showToast(message);
});

socket.on("openRoomsUpdate", (rooms) => {
  openRoomsLoading = false;
  if (openRoomsTimer) {
    clearTimeout(openRoomsTimer);
    openRoomsTimer = null;
  }
  openRooms = rooms || [];
  if (!currentRoom && currentScreen === "lobbies") {
    render();
  }
});

socket.on("leftRoom", () => {
  playSound("leave");
  returnHomeFromRoom(COPY.messages.leftRoom);
});

socket.on("roomDeleted", ({ message } = {}) => {
  playSound("leave");
  returnHomeFromRoom(message || COPY.messages.roomDeleted);
});

socket.on("kickedFromRoom", ({ message } = {}) => {
  playSound("leave");
  returnHomeFromRoom(message || COPY.messages.kicked);
});

socket.on("bannedFromRoom", ({ message } = {}) => {
  playSound("leave");
  returnHomeFromRoom(message || COPY.messages.banned);
});

socket.on("disconnect", () => {
  showToast(COPY.messages.disconnected);
});

window.addEventListener("popstate", () => {
  currentScreen = screenFromPath(location.pathname);
  routeRoomCode = roomCodeFromPath(location.pathname);
  inviteJoinRequestedFor = null;
  if (currentRoom) {
    setRoute(pathForRoom(currentRoom), { replace: true });
    render();
    return;
  }
  if (!currentRoom && currentScreen === "lobbies") requestOpenRooms();
  render();
});

if (currentScreen === "lobbies") requestOpenRooms();

render();
