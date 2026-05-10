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
  playerName: "dobeyFrazu.playerName"
};

const ROUTES = {
  home: "/",
  create: "/create",
  join: "/join-game",
  lobbies: "/lobbies",
  code: "/join-code"
};

const DEFAULT_ROOM_SETTINGS = {
  maxRounds: 5,
  promptSeconds: 60,
  answerSeconds: 60,
  voteSeconds: 30,
  anonymousMode: false,
  soundsEnabled: true,
  promptMode: "manual",
  assignmentMode: "different",
  maxPlayers: 6,
  publicLobby: true
};

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
const AUDIO_ACCEPT = "audio/*,video/webm,video/mp4,.mp3,.wav,.ogg,.webm,.m4a,.aac,.flac";


const COPY = {
  appTitle: "Добей фразу",
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
    finalTitle: "Финал"
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
    editSettings: "Изменить настройки",
    saveSettings: "Сохранить",
    cancelSettings: "Отмена",
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
    ownAnswer: "Это ваша концовка",
    copyJoke: "Утащить шутку",
    copyBest: "Скопировать шутку",
    copy: "Скопировать",
    nextRound: "Еще раунд, и точно всё",
    final: "Показать финал",
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
    voting: "Голосование",
    starting: "Игра начинается",
    scoreboard: (round) => `Раунд ${round} · Итоги`,
    bestSingle: "Лучшая шутка раунда",
    bestMultiple: "Лучшие шутки раунда",
    finished: "Финал игры"
  },
  placeholders: {
    name: "Например, Артур",
    roomCode: "ABCD",
    prompt: "Когда хост сказал 'быстро сыграем один раунд'...",
    answer: "...и все поняли, что вечер только начинается."
  },
  settings: {
    rounds: "Количество раундов",
    promptTimer: "Таймер на начало, сек.",
    answerTimer: "Таймер на концовку, сек.",
    voteTimer: "Таймер голосования, сек.",
    promptMode: "Режим начал",
    promptManual: "Игроки сами кидают начала",
    promptAuto: "Игра предлагает начала автоматически",
    assignmentMode: "Как раздаем фразы",
    assignmentDifferent: "Каждый добивает чужую фразу",
    assignmentSame: "Все добивают одну и ту же фразу",
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
    recordingStarted: "Запись началась. Нажмите «Остановить», когда закончите.",
    micDenied: "Не получилось включить микрофон. Проверьте разрешения браузера.",
    fileReadFailed: "Не получилось прочитать аудиофайл.",
    voteSubmitted: "Голос принят. Ждем остальных.",
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
let currentScreen = screenFromPath(location.pathname);
let myName = localStorage.getItem(STORAGE_KEYS.playerName) || "";
let previousState = null;
let timerInterval = null;
let sessionId = getOrCreateSessionId();
let openRooms = [];
let lobbySettingsOpen = false;
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

function screenFromPath(pathname) {
  if (pathname === ROUTES.home) return "home";
  if (pathname === "/create-lobby") return "create";
  if (pathname === ROUTES.create) return "create";
  if (pathname === ROUTES.join) return "join";
  if (pathname === ROUTES.lobbies) return "lobbies";
  if (pathname === ROUTES.code) return "code";
  if (/^\/(?:join|lobby|game)\/[a-zA-Z0-9]{4,8}\/?$/.test(pathname)) return "invite";
  if (pathname === "/game-started") return "inviteBlocked";
  if (pathname === "/lobby-not-found") return "lobbyMissing";
  return "notFound";
}

function roomCodeFromPath(pathname) {
  const match = pathname.match(/^\/(?:join|lobby|game)\/([a-zA-Z0-9]{4,8})\/?$/);
  return match ? match[1].toUpperCase() : null;
}

function navigateTo(screen, { replace = false } = {}) {
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
  routeRoomCode = roomCodeFromPath(path);
}

function pathForRoom(room) {
  if (!room) return ROUTES.home;
  return room.state === "waiting" ? `/lobby/${room.code}` : `/game/${room.code}`;
}

function inviteLink(code) {
  return `${location.origin}/join/${code}`;
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

function getMe() {
  return currentRoom?.players.find((player) => player.id === getMyId());
}

function isHost() {
  return currentRoom?.hostId === getMyId();
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

async function fileToAudioPayload(file, fallbackName = "voice.webm") {
  if (!file) return null;
  if (file.size > MAX_AUDIO_BYTES) throw new Error("audio-too-large");
  if (!isAllowedAudioFile(file)) throw new Error("audio-unsupported");
  const dataUrl = await blobToDataUrl(file);
  return {
    name: String(file.name || fallbackName).slice(0, 120),
    type: file.type || "audio/webm",
    size: file.size,
    dataUrl
  };
}

function formatAudioTime(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  const rest = String(safe % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function voiceBarsHtml(count = 36) {
  return Array.from({ length: count }, (_, index) => `<span style="--i:${index}"></span>`).join("");
}

function audioPlayerHtml(audio, { compact = false } = {}) {
  if (!audio?.dataUrl) return "";
  const safeSrc = escapeHtml(audio.dataUrl);
  const bars = voiceBarsHtml(compact ? 24 : 38);
  return `
    <div class="voice-message ${compact ? "voice-message-compact" : ""}">
      <button class="voice-play" type="button" data-action="toggle-audio" aria-label="Воспроизвести аудио">▶</button>
      <div class="voice-body">
        <div class="voice-wave" aria-hidden="true">${bars}</div>
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
    <div class="audio-tools ${isRecording ? "is-recording" : ""}">
      <div class="audio-tools-head">
        <div>
          <span class="audio-tools-title">Голос или аудио</span>
          <p class="meta audio-tools-note">Можно написать текстом, записать голосом или прикрепить файл до 20 МБ.</p>
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
      stream.getTracks().forEach((track) => track.stop());
      const rawMime = recorder.mimeType || "audio/webm";
      const displayType = recordingDisplayType(rawMime);
      const blob = new Blob(chunks, { type: displayType });
      const ext = recordingExtensionFromMime(displayType);
      const fileName = `voice-${Date.now()}.${ext}`;
      activeRecording = null;
      stopRecordingTicker();
      try {
        const payload = await fileToAudioPayload(new File([blob], fileName, { type: displayType }), fileName);
        setAudioDraft(type, payload);
        showToast(COPY.messages.audioReady);
      } catch (error) {
        showToast(error.message === "audio-too-large" ? COPY.messages.audioTooLarge : COPY.messages.fileReadFailed);
      }
      render();
    });

    activeRecording = { type, recorder, stream, startedAt: Date.now() };
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
  const elapsed = (Date.now() - activeRecording.startedAt) / 1000;
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
  if (activeRecording.recorder.state !== "inactive") {
    activeRecording.recorder.stop();
  }
}

function updateVoiceMessageTime(voice, audio) {
  if (!voice || !audio) return;
  const timeNode = voice.querySelector(".voice-time");
  if (!timeNode) return;
  const current = formatAudioTime(audio.currentTime || 0);
  const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? formatAudioTime(audio.duration) : "0:00";
  timeNode.textContent = `${current} / ${duration}`;
}

function initializeVoiceMessages() {
  document.querySelectorAll(".voice-message").forEach((voice) => {
    const audio = voice.querySelector("audio");
    if (!audio || audio.dataset.boundVoiceUi === "1") {
      if (audio) updateVoiceMessageTime(voice, audio);
      return;
    }

    audio.dataset.boundVoiceUi = "1";
    audio.addEventListener("loadedmetadata", () => updateVoiceMessageTime(voice, audio));
    audio.addEventListener("timeupdate", () => updateVoiceMessageTime(voice, audio));
    audio.addEventListener("durationchange", () => updateVoiceMessageTime(voice, audio));
    updateVoiceMessageTime(voice, audio);
  });
}

function clearDraftForState(state, room = currentRoom) {
  if (!room) return;
  const promptKey = `${room.code}:${room.round}:${getMyId()}`;
  const answerKey = `${room.code}:${room.round}:${getMyId()}`;
  if (state !== "prompting") {
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

function closeSettingsModal() {
  lobbySettingsOpen = false;
  document.getElementById("settingsModal")?.remove();
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
        <div class="section-row">
          <h2 id="settingsModalTitle" class="section-title">Настройки игры</h2>
          <button class="modal-close" data-action="toggle-settings" aria-label="Закрыть настройки">×</button>
        </div>
        ${roomSettingsFormHtml(currentRoom)}
      </section>
    </div>
  `);
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
    <div class="simple-menu">
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

function openRoomsHtml({ compact = false } = {}) {
  if (openRoomsLoading) {
    return `
      <div class="empty-lobbies">
        <div class="empty-icon">...</div>
        <h3 class="section-title">${COPY.messages.loadingRooms}</h3>
      </div>
    `;
  }

  if (!openRooms.length) {
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
      ${openRooms.map((room) => `
        <article class="open-room" data-action="join-open-room" data-room-code="${escapeHtml(room.code)}" tabindex="0" role="button" aria-label="Войти в лобби ${escapeHtml(room.code)}">
          <div class="open-room-main">
            <div class="open-room-host">Лобби ${escapeHtml(room.hostName)}</div>
            <div class="open-room-code">${escapeHtml(room.code)}</div>
            <p class="meta">Код: ${escapeHtml(room.code)}</p>
          </div>
          <div class="open-room-stats">
            <span>${room.playersCount}/${room.maxPlayers} игроков</span>
          </div>
          <button class="btn primary compact-btn" data-action="join-open-room" data-room-code="${escapeHtml(room.code)}">Войти</button>
        </article>
      `).join("")}
    </div>
  `;
}

function renderLobbyBrowser() {
  app.classList.add("server-list-card");
  app.innerHTML = `
    <h2 class="panel-title centered-title lobby-browser-title">${COPY.screens.lobbies}</h2>
    <section class="lobby-browser-panel">
      <div class="lobby-browser-toolbar">
        <div class="lobby-browser-count">${openRooms.length} лобби</div>
        <div class="actions">
          <button class="btn ghost icon-btn" data-action="refresh-lobbies" title="${COPY.buttons.refreshRooms}" aria-label="${COPY.buttons.refreshRooms}">↻</button>
          <button class="btn ghost icon-btn" data-route="join" title="Назад" aria-label="Назад">←</button>
        </div>
      </div>
      <div class="rooms-frame">${openRoomsHtml()}</div>
    </section>
  `;
}

function renderCreateRoom() {
  app.classList.add("create-game-card");
  app.innerHTML = `
    <h2 class="panel-title centered-title">Создать игру</h2>
    <div class="grid">
      <label class="field"><span>${COPY.settings.rounds}</span><input id="maxRounds" type="number" min="1" max="20" value="5"></label>
      <label class="field"><span>${COPY.settings.promptTimer}</span><input id="promptSeconds" type="number" min="0" value="60"></label>
      <label class="field"><span>${COPY.settings.answerTimer}</span><input id="answerSeconds" type="number" min="0" value="60"></label>
      <label class="field"><span>${COPY.settings.voteTimer}</span><input id="voteSeconds" type="number" min="0" value="30"></label>
      <label class="field"><span>${COPY.settings.promptMode}</span>
        <select id="promptMode">
          <option value="manual">${COPY.settings.promptManual}</option>
          <option value="auto">${COPY.settings.promptAuto}</option>
        </select>
      </label>
      <label class="field"><span>${COPY.settings.assignmentMode}</span>
        <select id="assignmentMode">
          <option value="different">${COPY.settings.assignmentDifferent}</option>
          <option value="same">${COPY.settings.assignmentSame}</option>
        </select>
      </label>
      <label class="field"><span>${COPY.settings.maxPlayers}</span><input id="maxPlayers" type="number" min="2" max="12" value="6"></label>
      <label class="check-row"><input id="anonymousMode" type="checkbox"> ${COPY.settings.anonymous}</label>
      <label class="check-row"><input id="soundsEnabled" type="checkbox" checked> ${COPY.settings.sounds}</label>
      <label class="check-row"><input id="publicLobby" type="checkbox" checked> ${COPY.settings.publicLobby}</label>
    </div>
    <div class="actions create-actions">
      <button class="btn primary" data-action="create-room">Создать лобби</button>
      <button class="btn ghost" data-route="home">Назад</button>
    </div>
  `;
}

function roomSettingsFormHtml(room = null) {
  const maxRounds = room?.maxRounds ?? DEFAULT_ROOM_SETTINGS.maxRounds;
  const timers = room?.timers || DEFAULT_ROOM_SETTINGS;
  const settings = room?.settings || DEFAULT_ROOM_SETTINGS;

  return `
    <div class="settings-editor">
      <div class="grid compact-grid">
        <label class="field"><span>${COPY.settings.rounds}</span><input id="maxRounds" type="number" min="1" max="20" value="${maxRounds}"></label>
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
        <label class="field"><span>${COPY.settings.assignmentMode}</span>
          <select id="assignmentMode">
            <option value="different" ${settings.assignmentMode === "different" ? "selected" : ""}>${COPY.settings.assignmentDifferent}</option>
            <option value="same" ${settings.assignmentMode === "same" ? "selected" : ""}>${COPY.settings.assignmentSame}</option>
          </select>
        </label>
      </div>
      <div class="settings-checks">
        <label class="check-row"><input id="anonymousMode" type="checkbox" ${settings.anonymousMode ? "checked" : ""}> ${COPY.settings.anonymous}</label>
        <label class="check-row"><input id="soundsEnabled" type="checkbox" ${settings.soundsEnabled ? "checked" : ""}> ${COPY.settings.sounds}</label>
        <label class="check-row"><input id="publicLobby" type="checkbox" ${settings.publicLobby ? "checked" : ""}> ${COPY.settings.publicLobby}</label>
      </div>
      <div class="settings-editor-actions">
        <button class="btn primary compact-btn" data-action="save-lobby-settings">${COPY.buttons.saveSettings}</button>
        <button class="btn ghost compact-btn" data-action="toggle-settings">${COPY.buttons.cancelSettings}</button>
      </div>
    </div>
  `;
}

function settingsSummary(room) {
  const promptMode = room.settings.promptMode === "auto" ? "Игра предлагает начала" : "Свои начала от игроков";
  const assignmentMode = room.settings.assignmentMode === "same" ? "все добивают одну фразу" : "каждый добивает чужую фразу";
  return `
    <ul class="settings-list">
      <li>${room.maxRounds} раундов · максимум игроков: ${room.settings.maxPlayers}</li>
      <li>${promptMode} · ${assignmentMode}</li>
      <li>Таймеры: начало ${room.timers.promptSeconds}с · концовка ${room.timers.answerSeconds}с · голосование ${room.timers.voteSeconds}с</li>
    </ul>
  `;
}

function playersHtml() {
  return `
    <div class="players">
      ${currentRoom.players.map((player) => `
        <div class="pill ${player.connected ? "" : "disconnected"}">
          <span class="player-name">
            <span class="avatar">${escapeHtml(getInitial(player.name))}</span>
            ${escapeHtml(player.name)}
            ${player.id === getMyId() ? `<button class="name-edit-inline" data-action="edit-name">Изменить ник</button>` : ""}
            ${player.id === currentRoom.hostId ? '<span class="badge">хост</span>' : ""}
          </span>
          <span class="player-status">${player.connected ? "в лобби" : "отключился"}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderWaiting() {
  const onlineCount = currentRoom.players.filter((player) => player.connected).length;
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
          <span class="room-code">${currentRoom.code}</span>
          <p class="meta">Друг может войти по коду или по ссылке.</p>
        </div>
        <div class="invite-link-block">
          <div class="section-row">
            <span class="bento-kicker">Ссылка для друзей</span>
            <span class="lobby-count">${onlineCount}/${currentRoom.settings.maxPlayers}</span>
          </div>
          <div class="invite-url">${escapeHtml(link)}</div>
          <div class="actions invite-actions">
            <button class="btn primary compact-btn" data-action="copy-invite-link">${COPY.buttons.copyInvite}</button>
            <button class="btn ghost compact-btn" data-action="copy-code">${COPY.buttons.copyCode}</button>
          </div>
        </div>
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
  const onlineCount = currentRoom.players.filter((player) => player.connected).length;
  const showLeaveButton = !(currentRoom.state === "waiting" && onlineCount <= 1);

  let primaryAction = "";
  let statusNote = "";

  if (currentRoom.state === "waiting" && isHost()) {
    primaryAction = `<button class="btn primary" data-action="start-game">${COPY.buttons.startGame}</button>`;
  }

  if (currentRoom.state === "waiting" && !isHost()) {
    statusNote = `<span class="meta room-controls-note">${COPY.messages.hostDecision}</span>`;
  }

  if (currentRoom.state === "prompting") {
    const submitted = hasSubmittedPrompt();
    if (!submitted || promptEditMode) {
      primaryAction = `<button class="btn primary" data-action="submit-prompt">${submitted ? COPY.buttons.updatePrompt : COPY.buttons.submitPrompt}</button>`;
    } else {
      statusNote = `<span class="meta room-controls-note">Начало отправлено. Можно изменить, пока идёт таймер.</span>`;
    }
  }

  if (currentRoom.state === "answering") {
    const submitted = hasSubmittedAnswer();
    if (!submitted || answerEditMode) {
      primaryAction = `<button class="btn primary" data-action="submit-answer">${submitted ? COPY.buttons.updateAnswer : COPY.buttons.submitAnswer}</button>`;
    } else {
      statusNote = `<span class="meta room-controls-note">Концовка отправлена. Можно изменить, пока идёт таймер.</span>`;
    }
  }

  if (currentRoom.state === "revealing") {
    primaryAction = isHost()
      ? `<button class="btn primary" data-action="start-voting">${COPY.buttons.startVoting}</button>`
      : `<span class="meta room-controls-note">${COPY.messages.hostStartsVoting}</span>`;
  }

  if (currentRoom.state === "scoreboard") {
    const isFinalNext = currentRoom.round >= currentRoom.maxRounds;
    primaryAction = isHost()
      ? `<button class="btn primary" data-action="next-round">${isFinalNext ? COPY.buttons.final : COPY.buttons.nextRound}</button>`
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
  return `
    <div class="submitted-draft-card">
      <div class="submitted-draft-top">
        <span class="submitted-draft-label">${title}</span>
        <button class="inline-edit" type="button" data-action="${editAction}">${COPY.buttons.editSubmission}</button>
      </div>
      <div class="submitted-draft-text">${escapeHtml(text || (audio ? emptyLabel : "Пока пусто"))}</div>
      ${audioPlayerHtml(audio)}
    </div>
  `;
}

function renderPrompting() {
  const submitted = hasSubmittedPrompt();
  const myPrompt = getMyPrompt();
  const draft = getPromptDraft();
  const audio = getPromptAudioDraft();
  const connectedCount = currentRoom.players.filter((p) => p.connected).length;
  const isEditing = !submitted || promptEditMode;
  app.classList.add("game-stage-card", "compact-game-stage-card");
  app.innerHTML = `
    <div class="game-stage input-stage">
      ${stageTitle(`Раунд ${currentRoom.round} · Кинь начало`)}
      <section class="input-stage-panel no-shell-panel">
        ${timerHtml()}
        ${isEditing ? `
          <textarea id="promptInput" maxlength="160" placeholder="${COPY.placeholders.prompt}">${escapeHtml(draft)}</textarea>
          ${audioInputHtml("prompt")}
        ` : submittedBlockHtml({ type: "prompt", text: myPrompt?.text || "", audio: myPrompt?.audio || null })}
        <div class="progress-card">
          <h3 class="section-title">${COPY.labels.progress}</h3>
          <p class="meta">${currentRoom.prompts.length} из ${connectedCount} кинули начало. ${randomWaitingMessage(currentRoom.prompts.length)}</p>
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

  app.classList.add("game-stage-card", "compact-game-stage-card");
  app.innerHTML = `
    <div class="game-stage input-stage">
      ${stageTitle("Добей фразу")}
      <section class="input-stage-panel no-shell-panel">
        ${timerHtml()}
        <div class="prompt-box stage-prompt">
          ${escapeHtml(prompt?.text || (prompt?.audio ? "Голосовое начало" : COPY.empty.promptMissing))}
          ${audioPlayerHtml(prompt?.audio || null, { compact: true })}
        </div>
        ${isEditing ? `
          <textarea id="answerInput" maxlength="180" placeholder="${COPY.placeholders.answer}">${escapeHtml(draft)}</textarea>
          ${audioInputHtml("answer")}
        ` : submittedBlockHtml({ type: "answer", text: myAnswer?.text || "", audio: myAnswer?.audio || null })}
        <div class="progress-card">
          <h3 class="section-title">${COPY.labels.progress}</h3>
          <p class="meta">${currentRoom.answers.length} из ${connectedCount} отправили концовку. ${randomWaitingMessage(currentRoom.answers.length + 2)}</p>
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

function jokeCardHtml({ meta, promptText, answerText, promptAudio = null, answerAudio = null, actions = "", winner = false, compact = false }) {
  return `
    <article class="joke game-joke-card ${winner ? "winner-joke" : ""} ${compact ? "compact-joke" : ""}">
      <div class="meta joke-meta">${escapeHtml(meta)}</div>
      <div class="joke-start">${escapeHtml(promptText || (promptAudio ? "Голосовое начало" : ""))}</div>
      ${audioPlayerHtml(promptAudio, { compact: true })}
      <div class="joke-end">${escapeHtml(answerText || (answerAudio ? "Голосовая концовка" : ""))}</div>
      ${audioPlayerHtml(answerAudio, { compact: true })}
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
          ${voting ? `<button class="btn primary" data-action="vote" data-answer-id="${answer.id}" ${own || hasVoted() ? "disabled" : ""}>${own ? COPY.buttons.ownAnswer : COPY.buttons.vote}</button>` : ""}
        `;
        return jokeCardHtml({
          meta,
          promptText: prompt?.text || "",
          answerText: answer.text || "",
          promptAudio: prompt?.audio || null,
          answerAudio: answer.audio || null,
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
      ${stageTitle(`Раунд ${currentRoom.round} · Готовые шутки`)}
      ${jokesHtml({ revealAuthor })}
    </div>
  `;
}

function renderVoting() {
  const revealAuthor = !currentRoom.settings.anonymousMode;
  app.classList.add("game-stage-card", "compact-game-stage-card");
  app.innerHTML = `
    <div class="game-stage reveal-stage">
      ${stageTitle(`Раунд ${currentRoom.round} · Голосование`)}
      <div class="stage-timer-row">${timerHtml()}</div>
      ${hasVoted() ? `<p class="prompt-box stage-message centered-meta">${COPY.messages.voteSubmitted}</p>` : ""}
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
            compact: true,
            actions: `<button class="btn ghost compact-btn" data-action="copy-history" data-history-index="${latestIndex}">${COPY.buttons.copy}</button>`
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
              compact: true,
              actions: `<button class="btn ghost compact-btn" data-action="copy-history" data-history-index="${index}">${COPY.buttons.copy}</button>`
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
      ${stageTitle(COPY.screens.scoreboard(currentRoom.round))}
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

function renderFinished() {
  const winner = [...currentRoom.players].sort((a, b) => b.score - a.score)[0];
  app.classList.add("game-stage-card", "scoreboard-stage-card");
  app.innerHTML = `
    <div class="game-stage scoreboard-stage">
      ${stageTitle(COPY.screens.finished)}
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
  document.body.classList.toggle("waiting-screen", Boolean(currentRoom && currentRoom.state === "waiting"));
  document.body.classList.toggle("stage-screen", Boolean(currentRoom && ["starting", "prompting", "answering", "revealing", "voting"].includes(currentRoom.state)));
  document.body.classList.toggle("scoreboard-screen", Boolean(currentRoom && ["scoreboard", "finished"].includes(currentRoom.state)));
  document.body.classList.toggle("has-room-controls", Boolean(currentRoom));
  if (!currentRoom) {
    if (currentScreen === "create") renderCreateRoom();
    else if (currentScreen === "join") renderJoinMenu();
    else if (currentScreen === "lobbies") renderLobbyBrowser();
    else if (currentScreen === "code") renderCodeJoin();
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
  if (state === "waiting") renderWaiting();
  if (state === "starting") renderStarting();
  if (state === "prompting") renderPrompting();
  if (state === "answering") renderAnswering();
  if (state === "revealing") renderRevealing();
  if (state === "voting") renderVoting();
  if (state === "scoreboard") renderScoreboard();
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

function readSettings() {
  return {
    maxRounds: document.getElementById("maxRounds")?.value ?? DEFAULT_ROOM_SETTINGS.maxRounds,
    promptSeconds: document.getElementById("promptSeconds")?.value ?? DEFAULT_ROOM_SETTINGS.promptSeconds,
    answerSeconds: document.getElementById("answerSeconds")?.value ?? DEFAULT_ROOM_SETTINGS.answerSeconds,
    voteSeconds: document.getElementById("voteSeconds")?.value ?? DEFAULT_ROOM_SETTINGS.voteSeconds,
    anonymousMode: document.getElementById("anonymousMode")?.checked ?? DEFAULT_ROOM_SETTINGS.anonymousMode,
    soundsEnabled: document.getElementById("soundsEnabled")?.checked ?? DEFAULT_ROOM_SETTINGS.soundsEnabled,
    promptMode: document.getElementById("promptMode")?.value ?? DEFAULT_ROOM_SETTINGS.promptMode,
    assignmentMode: document.getElementById("assignmentMode")?.value ?? DEFAULT_ROOM_SETTINGS.assignmentMode,
    maxPlayers: document.getElementById("maxPlayers")?.value ?? DEFAULT_ROOM_SETTINGS.maxPlayers,
    publicLobby: document.getElementById("publicLobby")?.checked ?? DEFAULT_ROOM_SETTINGS.publicLobby
  };
}


document.addEventListener("input", (event) => {
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
    const payload = await fileToAudioPayload(file);
    setAudioDraft(type, payload);
    showToast(COPY.messages.audioReady);
    render();
  } catch (error) {
    showToast(error.message === "audio-too-large" ? COPY.messages.audioTooLarge : COPY.messages.audioUnsupported);
  } finally {
    input.value = "";
  }
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
    "copy-joke",
    "copy-best",
    "copy-history",

    "create-room",
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
    "leave-room",
    "delete-room"
  ];

  const shouldPlayGenericClick =
    clickable &&
    !isDisabled &&
    !actionsWithOwnSound.includes(action);

  if (shouldPlayGenericClick) {
    playSound("click");
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

  if (action === "create-room") {
    ensureNameThen(() => {
      socket.emit("createRoom", { name: myName, sessionId, settings: readSettings() });
    });
  }

  if (action === "toggle-settings") {
    lobbySettingsOpen = !lobbySettingsOpen;
    if (lobbySettingsOpen) renderSettingsModal();
    else closeSettingsModal();
  }

  if (action === "save-lobby-settings") {
    socket.emit("updateRoomSettings", { settings: readSettings() });
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
    const code = button.dataset.roomCode;
    ensureNameThen(() => {
      socket.emit("joinRoom", { name: myName, code, sessionId });
    });
  }

  if (action === "join-invite") {
    inviteJoinRequestedFor = null;
    requestInviteJoin();
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
  if (action === "start-game") socket.emit("startGame");

  if (action === "submit-prompt") {
    const text = document.getElementById("promptInput")?.value || "";
    const audio = getPromptAudioDraft();
    if (!text.trim() && !audio) return showToast("Напишите начало фразы или добавьте аудио");
    promptEditMode = false;
    socket.emit("submitPrompt", { text, audio });
  }

  if (action === "submit-answer") {
    const text = document.getElementById("answerInput")?.value || "";
    const audio = getAnswerAudioDraft();
    if (!text.trim() && !audio) return showToast("Напишите концовку или добавьте аудио");
    answerEditMode = false;
    socket.emit("submitAnswer", { text, audio });
  }

  if (action === "start-voting") socket.emit("startVoting");

  if (action === "vote") {
    playSound("vote");
    socket.emit("submitVote", { answerId: button.dataset.answerId });
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
  rememberSession(code, nextSessionId);
  playSound("join");
  setRoute(`/lobby/${code}`);
  showToast(COPY.messages.roomCreated(code));
});

socket.on("joinedRoom", ({ code, sessionId: nextSessionId, reconnected }) => {
  lobbySettingsOpen = false;
  rememberSession(code, nextSessionId);
  playSound("join");
  setRoute(`/lobby/${code}`, { replace: currentScreen === "invite" });
  showToast(reconnected ? COPY.messages.reconnected(code) : COPY.messages.joined(code));
});

socket.on("rejoinedRoom", ({ code, sessionId: nextSessionId }) => {
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
  setRoute(pathForRoom(room), { replace: true });

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
