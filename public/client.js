const BACKEND_URL =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://textic-chat.onrender.com";

const socket = io(BACKEND_URL);

const app = document.getElementById("app");
const toast = document.getElementById("toast");
const STORAGE_KEYS = {
  sessionId: "dobeyFrazu.sessionId",
  roomCode: "dobeyFrazu.roomCode",
  playerName: "dobeyFrazu.playerName"
};

const COPY = {
  appTitle: "Добей фразу",
  tagline: "игра для компании друзей",
  labels: {
    name: "Ваш ник",
    roomCode: "Код лобби",
    players: "Игроки",
    settings: "Настройки игры",
    progress: "Прогресс",
    roundVotes: "Результаты голосования",
    history: "Лучшие шутки",
    titles: "Титулы",
    finalTitle: "Финал"
  },
  buttons: {
    openCreate: "Собрать лобби",
    joinRoom: "Войти по коду",
    back: "Назад в меню",
    createRoom: "Создать комнату",
    copyCode: "Скопировать шифр",
    startGame: "Начать игру",
    submitPrompt: "Зафиксить начало",
    submitAnswer: "Отправить концовку",
    startVoting: "Перейти к голосованию",
    vote: "Отдать голос",
    ownAnswer: "Это ваша концовка",
    copyJoke: "Утащить шутку",
    copyBest: "Утащить топ",
    copy: "Скопировать",
    nextRound: "Еще раунд, и точно всё",
    final: "Показать финал",
    restart: "Вернуть всех в лобби",
    leaveRoom: "Выйти из комнаты",
    deleteRoom: "Удалить комнату"
  },
  screens: {
    home: "Заходите в игру",
    create: "Панель хоста",
    waiting: "Лобби готовится",
    prompting: (round) => `Раунд ${round}: кинь начало`,
    answering: "Добей фразу, пока не передумал",
    revealing: "Готовые шутки",
    voting: "Голосование",
    scoreboard: (round) => `После раунда ${round}: кто смешной`,
    bestSingle: "Топовая шутка раунда",
    bestMultiple: "Топовые шутки раунда",
    finished: "Финал игры"
  },
  placeholders: {
    name: "Например, Маша",
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
    sessionExpired: "Старая комната больше недоступна.",
    enterName: "Сначала введите ник.",
    enterCode: "Введите код комнаты.",
    promptSubmitted: "Начало отправлено. Ждем остальных.",
    answerSubmitted: "Концовка отправлена. Ждем остальных.",
    voteSubmitted: "Голос принят. Ждем остальных.",
    hostStartsVoting: "Ждем, пока хост запустит голосование.",
    hostDecision: "Ждем решение хоста.",
    hostCanRestart: "Хост может вернуть всех в лобби.",
    confirmLeave: "Вы уверены выйти?",
    confirmDelete: "Удалить комнату для всех игроков?",
    leftRoom: "Вы вышли из комнаты.",
    roomDeleted: "Комната удалена.",
    roomCreated: (code) => `Комната ${code} создана.`,
    joined: (code) => `Вы вошли в ${code}.`,
    reconnected: (code) => `Сессия в ${code} восстановлена.`,
    returned: (code) => `Вы вернулись в ${code}.`
  }
};

let currentRoom = null;
let currentScreen = "home";
let myName = localStorage.getItem(STORAGE_KEYS.playerName) || "";
let previousState = null;
let timerInterval = null;
let sessionId = getOrCreateSessionId();

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

function getPrompt(promptId) {
  return currentRoom?.prompts.find((prompt) => prompt.id === promptId);
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

function getRemainingSeconds() {
  if (!currentRoom?.timerEndsAt) return 0;
  return Math.max(0, Math.ceil((currentRoom.timerEndsAt - Date.now()) / 1000));
}

function startTimerView() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const node = document.getElementById("timerText");
    if (node && currentRoom?.timerEndsAt) {
      node.textContent = `Осталось: ${getRemainingSeconds()} сек.`;
    }
  }, 500);
}

function copyText(text) {
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
  playTone([
    { frequency: 523, start: 0, duration: 0.09 },
    { frequency: 659, start: 0.1, duration: 0.09 },
    { frequency: 784, start: 0.2, duration: 0.14 }
  ]);
}

function playWinSound() {
  if (!currentRoom?.settings.soundsEnabled) return;
  playTone([
    { frequency: 659, start: 0, duration: 0.12 },
    { frequency: 784, start: 0.14, duration: 0.12 },
    { frequency: 988, start: 0.28, duration: 0.22 }
  ]);
}

function renderHome() {
  app.innerHTML = `
    <h2 class="panel-title">${COPY.screens.home}</h2>
    <div class="grid">
      <label class="field">
        <span>${COPY.labels.name}</span>
        <input id="nameInput" maxlength="32" placeholder="${COPY.placeholders.name}" value="${escapeHtml(myName)}">
      </label>
      <label class="field">
        <span>${COPY.labels.roomCode}</span>
        <input id="roomCodeInput" maxlength="8" placeholder="${COPY.placeholders.roomCode}">
      </label>
    </div>
    <div class="actions">
      <button class="btn primary" data-action="open-create">${COPY.buttons.openCreate}</button>
      <button class="btn yellow" data-action="join-room">${COPY.buttons.joinRoom}</button>
    </div>
  `;
}

function renderCreateRoom() {
  app.innerHTML = `
    <h2 class="panel-title">${COPY.screens.create}</h2>
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
    </div>
    <div class="actions">
      <button class="btn ghost" data-action="home">${COPY.buttons.back}</button>
      <button class="btn primary" data-action="create-room">${COPY.buttons.createRoom}</button>
    </div>
  `;
}

function settingsSummary(room) {
  const promptMode = room.settings.promptMode === "auto" ? "сервер кидает начала" : "свои начала от игроков";
  const assignmentMode = room.settings.assignmentMode === "same" ? "одна фраза для всех" : "каждому чужая фраза";
  const anonymous = room.settings.anonymousMode ? "авторы скрыты до суда" : "авторы палятся сразу";
  return `
    <ul class="settings-list">
      <li>${room.maxRounds} раундов, максимум игроков: ${room.settings.maxPlayers}</li>
      <li>${promptMode}, ${assignmentMode}, ${anonymous}</li>
      <li>Таймеры: начало ${room.timers.promptSeconds}с, концовка ${room.timers.answerSeconds}с, голосование ${room.timers.voteSeconds}с</li>
    </ul>
  `;
}

function playersHtml() {
  return `
    <div class="players">
      ${currentRoom.players.map((player) => `
        <div class="pill ${player.connected ? "" : "disconnected"}">
          <span>${escapeHtml(player.name)} ${player.id === currentRoom.hostId ? '<span class="badge">хост</span>' : ""}</span>
          <span>${player.connected ? "в комнате" : "отключился"}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderWaiting() {
  const onlineCount = currentRoom.players.filter((player) => player.connected).length;
  app.innerHTML = `
    <h2 class="panel-title">${COPY.screens.waiting}</h2>
    <div class="lobby-bento">
      <section class="bento-card access-card">
        <span class="bento-kicker">access key</span>
        <div class="room-code">${currentRoom.code}</div>
        <div class="lobby-count">В лобби: ${onlineCount} из ${currentRoom.settings.maxPlayers}</div>
        <button class="btn ghost" data-action="copy-code">${COPY.buttons.copyCode}</button>
      </section>

      <section class="bento-card players-card">
        <h3 class="section-title">${COPY.labels.players}</h3>
        ${playersHtml()}
      </section>

      <section class="bento-card settings-card">
        <h3 class="section-title">${COPY.labels.settings}</h3>
        ${settingsSummary(currentRoom)}
      </section>

      <section class="bento-card host-card">
        <span class="bento-kicker">control room</span>
        <p class="meta">Хост запускает игру, когда все готовы.</p>
        ${isHost() ? `<button class="btn primary" data-action="start-game">${COPY.buttons.startGame}</button>` : `<p class="prompt-box">${COPY.messages.hostDecision}</p>`}
      </section>
    </div>
  `;
}

function roomControlsHtml() {
  if (!currentRoom) return "";

  return `
    <div class="room-controls">
      <button class="btn ghost danger-lite" data-action="leave-room">${COPY.buttons.leaveRoom}</button>
      ${isHost() ? `<button class="btn danger" data-action="delete-room">${COPY.buttons.deleteRoom}</button>` : ""}
    </div>
  `;
}

function renderPrompting() {
  const submitted = hasSubmittedPrompt();
  app.innerHTML = `
    <h2 class="panel-title">${COPY.screens.prompting(currentRoom.round)}</h2>
    ${timerHtml()}
    ${submitted ? `
      <p class="prompt-box">${COPY.messages.promptSubmitted}</p>
    ` : `
      <textarea id="promptInput" maxlength="160" placeholder="${COPY.placeholders.prompt}"></textarea>
      <div class="actions"><button class="btn primary" data-action="submit-prompt">${COPY.buttons.submitPrompt}</button></div>
    `}
    <h3 class="section-title">${COPY.labels.progress}</h3>
    <p class="meta">${currentRoom.prompts.length} из ${currentRoom.players.filter((p) => p.connected).length} кинули начало. ${randomWaitingMessage(currentRoom.prompts.length)}</p>
  `;
}

function renderAnswering() {
  const submitted = hasSubmittedAnswer();
  const promptId = currentRoom.assignments[getMyId()];
  const prompt = getPrompt(promptId);

  app.innerHTML = `
    <h2 class="panel-title">${COPY.screens.answering}</h2>
    ${timerHtml()}
    <div class="prompt-box">${escapeHtml(prompt?.text || COPY.empty.promptMissing)}</div>
    ${submitted ? `
      <p class="prompt-box">${COPY.messages.answerSubmitted}</p>
    ` : `
      <textarea id="answerInput" maxlength="180" placeholder="${COPY.placeholders.answer}"></textarea>
      <div class="actions"><button class="btn primary" data-action="submit-answer">${COPY.buttons.submitAnswer}</button></div>
    `}
    <h3 class="section-title">${COPY.labels.progress}</h3>
    <p class="meta">${currentRoom.answers.length} из ${currentRoom.players.filter((p) => p.connected).length} отправили концовку. ${randomWaitingMessage(currentRoom.answers.length + 2)}</p>
  `;
}

function jokeText(answer, revealAuthor) {
  const prompt = getPrompt(answer.promptId);
  const author = revealAuthor ? `\n\n- автор: ${getPlayerName(answer.authorId)}` : "";
  return `${prompt?.text || ""}\n${answer.text}${author}`;
}

function jokesHtml({ voting = false, revealAuthor = false } = {}) {
  return `
    <div class="jokes">
      ${currentRoom.answers.map((answer, index) => {
        const prompt = getPrompt(answer.promptId);
        const own = answer.authorId === getMyId();
        return `
          <article class="joke">
            <div class="meta">Шутка ${index + 1}${revealAuthor ? ` · автор: ${escapeHtml(getPlayerName(answer.authorId))}` : " · автор скрыт до итогов"}</div>
            <div class="joke-start">${escapeHtml(prompt?.text || "")}</div>
            <div class="joke-end">${escapeHtml(answer.text)}</div>
            <div class="actions">
              <button class="btn ghost" data-action="copy-joke" data-answer-id="${answer.id}" data-reveal-author="${revealAuthor ? "1" : "0"}">${COPY.buttons.copyJoke}</button>
              ${voting ? `<button class="btn primary" data-action="vote" data-answer-id="${answer.id}" ${own || hasVoted() ? "disabled" : ""}>${own ? COPY.buttons.ownAnswer : COPY.buttons.vote}</button>` : ""}
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderRevealing() {
  const revealAuthor = !currentRoom.settings.anonymousMode;
  app.innerHTML = `
    <h2 class="panel-title">${COPY.screens.revealing}</h2>
    ${jokesHtml({ revealAuthor })}
    <div class="actions">
      ${isHost() ? `<button class="btn green" data-action="start-voting">${COPY.buttons.startVoting}</button>` : `<p class="meta">${COPY.messages.hostStartsVoting}</p>`}
    </div>
  `;
}

function renderVoting() {
  const revealAuthor = !currentRoom.settings.anonymousMode;
  app.innerHTML = `
    <h2 class="panel-title">${COPY.screens.voting}</h2>
    ${timerHtml()}
    ${hasVoted() ? `<p class="prompt-box">${COPY.messages.voteSubmitted}</p>` : ""}
    ${jokesHtml({ voting: true, revealAuthor })}
  `;
}

function historyHtml() {
  if (!currentRoom.bestJokesHistory.length) {
    return `<p class="meta">${COPY.empty.history}</p>`;
  }

  return `
    <div class="history">
      ${currentRoom.bestJokesHistory.map((joke, index) => `
        <article class="history-item">
          <div class="meta">Раунд ${joke.round} · ${escapeHtml(joke.authorName)} · голосов: ${joke.votesCount}${joke.tied ? " · ничья в чате" : ""}</div>
          <div class="joke-start">${escapeHtml(joke.promptText)}</div>
          <div class="joke-end">${escapeHtml(joke.answerText)}</div>
          <div class="actions">
            <button class="btn ghost" data-action="copy-history" data-history-index="${index}">${COPY.buttons.copy}</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function scoresHtml() {
  return `
    <div class="scores">
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

  app.innerHTML = `
    <h2 class="panel-title">${COPY.screens.scoreboard(currentRoom.round)}</h2>
    ${scoresHtml()}
    <h3 class="section-title">${COPY.labels.roundVotes}</h3>
    ${tieText}
    <div class="jokes">
      ${currentRoom.lastRoundResults.map((result) => `
        <article class="joke ${result.isRoundWinner ? "winner-joke" : ""}">
          <div class="meta">Автор: ${escapeHtml(result.authorName)} · голосов: ${result.votesCount}${result.isRoundWinner ? " · лучшая шутка раунда" : ""}</div>
          <div class="joke-start">${escapeHtml(result.promptText)}</div>
          <div class="joke-end">${escapeHtml(result.answerText)}</div>
        </article>
      `).join("")}
    </div>
    <h3 class="section-title">${bestJokes.length > 1 ? COPY.screens.bestMultiple : COPY.screens.bestSingle}</h3>
    ${bestJokes.length ? `
      <div class="jokes">
        ${bestJokes.map((joke, index) => `
          <article class="joke winner-joke">
            <div class="meta">${escapeHtml(joke.authorName)} · голосов: ${joke.votesCount}${bestJokes.length > 1 ? " · ничья в чате" : ""}</div>
            <div class="joke-start">${escapeHtml(joke.promptText)}</div>
            <div class="joke-end">${escapeHtml(joke.answerText)}</div>
            <div class="actions"><button class="btn yellow" data-action="copy-best" data-best-index="${index}">${COPY.buttons.copyBest}</button></div>
          </article>
        `).join("")}
      </div>
    ` : `<p class="meta">${COPY.empty.best}</p>`}
    <h3 class="section-title">${COPY.labels.history}</h3>
    ${historyHtml()}
    <div class="actions">
      ${isHost() ? `<button class="btn green" data-action="next-round">${isFinalNext ? COPY.buttons.final : COPY.buttons.nextRound}</button>` : `<p class="meta">${COPY.messages.hostDecision}</p>`}
    </div>
  `;
}

function renderFinished() {
  const winner = [...currentRoom.players].sort((a, b) => b.score - a.score)[0];
  app.innerHTML = `
    <h2 class="panel-title">${COPY.screens.finished}</h2>
    <div class="prompt-box">Победитель: ${escapeHtml(winner?.name || COPY.empty.winnerMissing)} · титул: Главный клоун комнаты</div>
    ${scoresHtml()}
    <h3 class="section-title">${COPY.labels.titles}</h3>
    <div class="titles">
      ${currentRoom.titles.map((title) => `
        <div class="title-row">
          <span>${escapeHtml(title.title)} - ${escapeHtml(title.playerName)}</span>
          <span class="meta">${escapeHtml(title.note)}</span>
        </div>
      `).join("")}
    </div>
    <h3 class="section-title">${COPY.labels.history}</h3>
    ${historyHtml()}
    <div class="actions">
      ${isHost() ? `<button class="btn primary" data-action="restart-game">${COPY.buttons.restart}</button>` : `<p class="meta">${COPY.messages.hostCanRestart}</p>`}
    </div>
  `;
}

function render() {
  if (!currentRoom) {
    if (currentScreen === "create") renderCreateRoom();
    else renderHome();
    restartScreenAnimation();
    return;
  }

  const state = currentRoom.state;
  if (state === "waiting") renderWaiting();
  if (state === "prompting") renderPrompting();
  if (state === "answering") renderAnswering();
  if (state === "revealing") renderRevealing();
  if (state === "voting") renderVoting();
  if (state === "scoreboard") renderScoreboard();
  if (state === "finished") renderFinished();
  app.insertAdjacentHTML("beforeend", roomControlsHtml());
  startTimerView();
  restartScreenAnimation();
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
    maxRounds: document.getElementById("maxRounds").value,
    promptSeconds: document.getElementById("promptSeconds").value,
    answerSeconds: document.getElementById("answerSeconds").value,
    voteSeconds: document.getElementById("voteSeconds").value,
    anonymousMode: document.getElementById("anonymousMode").checked,
    soundsEnabled: document.getElementById("soundsEnabled").checked,
    promptMode: document.getElementById("promptMode").value,
    assignmentMode: document.getElementById("assignmentMode").value,
    maxPlayers: document.getElementById("maxPlayers").value
  };
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const action = button.dataset.action;

  if (action === "home") {
    currentScreen = "home";
    render();
  }

  if (action === "open-create") {
    if (!readName()) return showToast(COPY.messages.enterName);
    currentScreen = "create";
    render();
  }

  if (action === "create-room") {
    socket.emit("createRoom", { name: myName, sessionId, settings: readSettings() });
  }

  if (action === "join-room") {
    const name = readName();
    const code = document.getElementById("roomCodeInput").value.trim();
    if (!name) return showToast(COPY.messages.enterName);
    if (!code) return showToast(COPY.messages.enterCode);
    socket.emit("joinRoom", { name, code, sessionId });
  }

  if (action === "copy-code") copyText(currentRoom.code);
  if (action === "start-game") socket.emit("startGame");

  if (action === "submit-prompt") {
    socket.emit("submitPrompt", { text: document.getElementById("promptInput").value });
  }

  if (action === "submit-answer") {
    socket.emit("submitAnswer", { text: document.getElementById("answerInput").value });
  }

  if (action === "start-voting") socket.emit("startVoting");

  if (action === "vote") {
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
    copyText(`${joke.promptText}\n${joke.answerText}\n\n- автор: ${joke.authorName}`);
  }

  if (action === "copy-history") {
    const joke = currentRoom.bestJokesHistory[Number(button.dataset.historyIndex)];
    copyText(`${joke.promptText}\n${joke.answerText}\n\n- автор: ${joke.authorName}`);
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
  if (message) showToast(message);
  render();
}

socket.on("connect", () => {
  showToast(COPY.messages.connected);
  const savedCode = localStorage.getItem(STORAGE_KEYS.roomCode);
  const savedName = localStorage.getItem(STORAGE_KEYS.playerName);
  if (savedCode && savedName) {
    socket.emit("reconnectRoom", {
      code: savedCode,
      name: savedName,
      sessionId
    });
  }
});

socket.on("roomCreated", ({ code, sessionId: nextSessionId }) => {
  rememberSession(code, nextSessionId);
  showToast(COPY.messages.roomCreated(code));
});

socket.on("joinedRoom", ({ code, sessionId: nextSessionId, reconnected }) => {
  rememberSession(code, nextSessionId);
  showToast(reconnected ? COPY.messages.reconnected(code) : COPY.messages.joined(code));
});

socket.on("rejoinedRoom", ({ code, sessionId: nextSessionId }) => {
  rememberSession(code, nextSessionId);
  showToast(COPY.messages.returned(code));
});

socket.on("sessionExpired", () => {
  returnHomeFromRoom(COPY.messages.sessionExpired);
});

socket.on("roomUpdate", (room) => {
  currentRoom = room;

  if (previousState !== room.state) {
    if (room.state === "revealing") playRevealSound();
    if (room.state === "finished") playWinSound();
  }

  previousState = room.state;
  render();
});

socket.on("errorMessage", (message) => {
  showToast(message);
});

socket.on("roomNotice", ({ message }) => {
  showToast(message);
});

socket.on("leftRoom", () => {
  returnHomeFromRoom(COPY.messages.leftRoom);
});

socket.on("roomDeleted", ({ message } = {}) => {
  returnHomeFromRoom(message || COPY.messages.roomDeleted);
});

socket.on("disconnect", () => {
  showToast(COPY.messages.disconnected);
});

render();
