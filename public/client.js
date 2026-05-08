const BACKEND_URL =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://textic-chat.onrender.com";

const socket = io(BACKEND_URL);

const app = document.getElementById("app");
const toast = document.getElementById("toast");

let currentRoom = null;
let currentScreen = "home";
let myName = "";
let previousState = null;
let timerInterval = null;

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
  return currentRoom?.players.find((player) => player.id === socket.id);
}

function isHost() {
  return currentRoom?.hostId === socket.id;
}

function getPlayerName(id) {
  return currentRoom?.players.find((player) => player.id === id)?.name || "Игрок";
}

function getPrompt(promptId) {
  return currentRoom?.prompts.find((prompt) => prompt.id === promptId);
}

function hasSubmittedPrompt() {
  return currentRoom?.prompts.some((prompt) => prompt.authorId === socket.id);
}

function hasSubmittedAnswer() {
  return currentRoom?.answers.some((answer) => answer.authorId === socket.id);
}

function hasVoted() {
  return currentRoom?.votes.some((vote) => vote.voterId === socket.id);
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
    return navigator.clipboard.writeText(text).then(() => showToast("Скопировано"));
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
  showToast("Скопировано");
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
    <h2 class="panel-title">Залетай в комнату</h2>
    <div class="grid">
      <label class="field">
        <span>Ник</span>
        <input id="nameInput" maxlength="32" placeholder="Например, Давид" value="${escapeHtml(myName)}">
      </label>
      <label class="field">
        <span>Код комнаты</span>
        <input id="roomCodeInput" maxlength="8" placeholder="ABCD">
      </label>
    </div>
    <div class="actions">
      <button class="btn primary" data-action="open-create">Создать комнату</button>
      <button class="btn yellow" data-action="join-room">Войти в комнату</button>
    </div>
  `;
}

function renderCreateRoom() {
  app.innerHTML = `
    <h2 class="panel-title">Настройки комнаты</h2>
    <div class="grid">
      <label class="field"><span>Количество раундов</span><input id="maxRounds" type="number" min="1" max="20" value="5"></label>
      <label class="field"><span>Таймер начала, сек.</span><input id="promptSeconds" type="number" min="0" value="60"></label>
      <label class="field"><span>Таймер концовки, сек.</span><input id="answerSeconds" type="number" min="0" value="60"></label>
      <label class="field"><span>Таймер голосования, сек.</span><input id="voteSeconds" type="number" min="0" value="30"></label>
      <label class="field"><span>Режим начал</span>
        <select id="promptMode">
          <option value="manual">Игроки пишут начала сами</option>
          <option value="auto">Игра генерирует начала автоматически</option>
        </select>
      </label>
      <label class="field"><span>Раздача начал</span>
        <select id="assignmentMode">
          <option value="different">Каждый добивает чужую фразу</option>
          <option value="same">Все добивают одну и ту же фразу</option>
        </select>
      </label>
      <label class="field"><span>Максимум игроков</span><input id="maxPlayers" type="number" min="2" max="12" value="6"></label>
      <label class="check-row"><input id="anonymousMode" type="checkbox"> Анонимный режим</label>
      <label class="check-row"><input id="soundsEnabled" type="checkbox" checked> Звуки при раскрытии</label>
    </div>
    <div class="actions">
      <button class="btn ghost" data-action="home">Назад</button>
      <button class="btn primary" data-action="create-room">Создать</button>
    </div>
  `;
}

function settingsSummary(room) {
  const promptMode = room.settings.promptMode === "auto" ? "авто-начала" : "ручные начала";
  const assignmentMode = room.settings.assignmentMode === "same" ? "одна фраза для всех" : "чужая фраза каждому";
  const anonymous = room.settings.anonymousMode ? "анонимно" : "авторы видны";
  return `
    <ul class="settings-list">
      <li>${room.maxRounds} раундов, максимум ${room.settings.maxPlayers} игроков</li>
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
          <span>${player.connected ? "онлайн" : "отключился"}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderWaiting() {
  app.innerHTML = `
    <h2 class="panel-title">Лобби</h2>
    <div class="room-code">${currentRoom.code}</div>
    <div class="actions">
      <button class="btn yellow" data-action="copy-code">Скопировать код</button>
      ${isHost() ? '<button class="btn green" data-action="start-game">Начать игру</button>' : ""}
    </div>
    <h3 class="section-title">Игроки</h3>
    ${playersHtml()}
    <h3 class="section-title">Настройки</h3>
    ${settingsSummary(currentRoom)}
  `;
}

function renderPrompting() {
  const submitted = hasSubmittedPrompt();
  app.innerHTML = `
    <h2 class="panel-title">Раунд ${currentRoom.round}: напиши начало фразы</h2>
    ${timerHtml()}
    ${submitted ? `
      <p class="prompt-box">Начало принято. Ждем остальных.</p>
    ` : `
      <textarea id="promptInput" maxlength="220" placeholder="Когда хост сказал 'последний раунд'..."></textarea>
      <div class="actions"><button class="btn primary" data-action="submit-prompt">Отправить</button></div>
    `}
    <h3 class="section-title">Прогресс</h3>
    <p class="meta">${currentRoom.prompts.length} из ${currentRoom.players.filter((p) => p.connected).length} игроков отправили начало.</p>
  `;
}

function renderAnswering() {
  const submitted = hasSubmittedAnswer();
  const promptId = currentRoom.assignments[socket.id];
  const prompt = getPrompt(promptId);

  app.innerHTML = `
    <h2 class="panel-title">Добей фразу</h2>
    ${timerHtml()}
    <div class="prompt-box">${escapeHtml(prompt?.text || "Фраза появится через секунду")}</div>
    ${submitted ? `
      <p class="prompt-box">Концовка принята. Ждем остальных.</p>
    ` : `
      <textarea id="answerInput" maxlength="220" placeholder="...и тут стало слишком смешно для README."></textarea>
      <div class="actions"><button class="btn primary" data-action="submit-answer">Отправить</button></div>
    `}
    <h3 class="section-title">Прогресс</h3>
    <p class="meta">${currentRoom.answers.length} из ${currentRoom.players.filter((p) => p.connected).length} игроков отправили концовку.</p>
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
        const own = answer.authorId === socket.id;
        return `
          <article class="joke">
            <div class="meta">Шутка ${index + 1}${revealAuthor ? ` · автор: ${escapeHtml(getPlayerName(answer.authorId))}` : ""}</div>
            <div class="joke-start">${escapeHtml(prompt?.text || "")}</div>
            <div class="joke-end">${escapeHtml(answer.text)}</div>
            <div class="actions">
              <button class="btn ghost" data-action="copy-joke" data-answer-id="${answer.id}" data-reveal-author="${revealAuthor ? "1" : "0"}">Скопировать шутку</button>
              ${voting ? `<button class="btn primary" data-action="vote" data-answer-id="${answer.id}" ${own || hasVoted() ? "disabled" : ""}>${own ? "Твоя концовка" : "Голосовать"}</button>` : ""}
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
    <h2 class="panel-title">Готовые шутки</h2>
    ${jokesHtml({ revealAuthor })}
    <div class="actions">
      ${isHost() ? '<button class="btn green" data-action="start-voting">Перейти к голосованию</button>' : '<p class="meta">Ждем, пока хост запустит голосование.</p>'}
    </div>
  `;
}

function renderVoting() {
  const revealAuthor = !currentRoom.settings.anonymousMode;
  app.innerHTML = `
    <h2 class="panel-title">Голосование</h2>
    ${timerHtml()}
    ${hasVoted() ? '<p class="prompt-box">Голос принят. Ждем остальных.</p>' : ""}
    ${jokesHtml({ voting: true, revealAuthor })}
  `;
}

function historyHtml() {
  if (!currentRoom.bestJokesHistory.length) {
    return '<p class="meta">История пока пустая.</p>';
  }

  return `
    <div class="history">
      ${currentRoom.bestJokesHistory.map((joke, index) => `
        <article class="history-item">
          <div class="meta">Раунд ${joke.round} · ${escapeHtml(joke.authorName)} · голосов: ${joke.votesCount}</div>
          <div class="joke-start">${escapeHtml(joke.promptText)}</div>
          <div class="joke-end">${escapeHtml(joke.answerText)}</div>
          <div class="actions">
            <button class="btn ghost" data-action="copy-history" data-history-index="${index}">Скопировать</button>
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
  app.innerHTML = `
    <h2 class="panel-title">Счет после раунда ${currentRoom.round}</h2>
    ${scoresHtml()}
    <h3 class="section-title">Голоса за раунд</h3>
    <div class="jokes">
      ${currentRoom.lastRoundResults.map((result) => `
        <article class="joke">
          <div class="meta">Автор: ${escapeHtml(result.authorName)} · голосов: ${result.votesCount}</div>
          <div class="joke-start">${escapeHtml(result.promptText)}</div>
          <div class="joke-end">${escapeHtml(result.answerText)}</div>
        </article>
      `).join("")}
    </div>
    <h3 class="section-title">Лучшая шутка раунда</h3>
    ${currentRoom.lastBestJoke ? `
      <article class="joke">
        <div class="meta">${escapeHtml(currentRoom.lastBestJoke.authorName)} · голосов: ${currentRoom.lastBestJoke.votesCount}</div>
        <div class="joke-start">${escapeHtml(currentRoom.lastBestJoke.promptText)}</div>
        <div class="joke-end">${escapeHtml(currentRoom.lastBestJoke.answerText)}</div>
        <div class="actions"><button class="btn yellow" data-action="copy-best">Скопировать лучшую шутку</button></div>
      </article>
    ` : '<p class="meta">Лучшей шутки нет.</p>'}
    <h3 class="section-title">История лучших шуток</h3>
    ${historyHtml()}
    <div class="actions">
      ${isHost() ? `<button class="btn green" data-action="next-round">${isFinalNext ? "Финал" : "Следующий раунд"}</button>` : '<p class="meta">Ждем решение хоста.</p>'}
    </div>
  `;
}

function renderFinished() {
  const winner = [...currentRoom.players].sort((a, b) => b.score - a.score)[0];
  app.innerHTML = `
    <h2 class="panel-title">Финал</h2>
    <div class="prompt-box">Победитель: ${escapeHtml(winner?.name || "никто")} · титул: Главный клоун комнаты</div>
    ${scoresHtml()}
    <h3 class="section-title">Титулы</h3>
    <div class="titles">
      ${currentRoom.titles.map((title) => `
        <div class="title-row">
          <span>${escapeHtml(title.title)} - ${escapeHtml(title.playerName)}</span>
          <span class="meta">${escapeHtml(title.note)}</span>
        </div>
      `).join("")}
    </div>
    <h3 class="section-title">История лучших шуток</h3>
    ${historyHtml()}
    <div class="actions">
      ${isHost() ? '<button class="btn primary" data-action="restart-game">Вернуться в лобби</button>' : '<p class="meta">Хост может вернуть комнату в лобби.</p>'}
    </div>
  `;
}

function render() {
  if (!currentRoom) {
    if (currentScreen === "create") renderCreateRoom();
    else renderHome();
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
  startTimerView();
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
    if (!readName()) return showToast("Введите ник");
    currentScreen = "create";
    render();
  }

  if (action === "create-room") {
    socket.emit("createRoom", { name: myName, settings: readSettings() });
  }

  if (action === "join-room") {
    const name = readName();
    const code = document.getElementById("roomCodeInput").value.trim();
    if (!name) return showToast("Введите ник");
    if (!code) return showToast("Введите код комнаты");
    socket.emit("joinRoom", { name, code });
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

  if (action === "copy-best" && currentRoom.lastBestJoke) {
    const joke = currentRoom.lastBestJoke;
    copyText(`${joke.promptText}\n${joke.answerText}\n\n- автор: ${joke.authorName}`);
  }

  if (action === "copy-history") {
    const joke = currentRoom.bestJokesHistory[Number(button.dataset.historyIndex)];
    copyText(`${joke.promptText}\n${joke.answerText}\n\n- автор: ${joke.authorName}`);
  }

  if (action === "next-round") socket.emit("nextRound");
  if (action === "restart-game") socket.emit("restartGame");
});

socket.on("connect", () => {
  showToast("Подключено к серверу");
});

socket.on("roomCreated", ({ code }) => {
  showToast(`Комната ${code} создана`);
});

socket.on("joinedRoom", ({ code }) => {
  showToast(`Вы вошли в ${code}`);
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

socket.on("disconnect", () => {
  showToast("Соединение потеряно");
});

render();
