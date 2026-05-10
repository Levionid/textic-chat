const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://exitserial.pages.dev"
];

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "POST"]
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (request, response) => {
  response.sendFile(path.join(__dirname, "public", "index.html"));
});

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"]
  }
});

const COPY = {
  autoPrompts: [
    "Когда Давид сказал, что это фикс на пять минут...",
    "Самое опасное слово в проекте - это...",
    "Я понял, что деплой пошел не туда, когда...",
    "Если бы наш чат был языком программирования...",
    "Когда хост сказал \"ну последний раунд\"...",
    "Главный признак сильного программиста - это...",
    "Когда ты открыл свой код через неделю и увидел...",
    "Если бы локальные шутки можно было пушить в Git...",
    "В любой компании выживает тот, кто...",
    "Когда баг исчез сам, все поняли, что...",
    "Когда кто-то сказал \"это же очевидно\"...",
    "Самый честный комментарий в коде звучит так...",
    "Если бы дедлайн был человеком, он бы...",
    "Когда созвон начался со слов \"быстро обсудим\"...",
    "Лучший способ проверить прод - это...",
    "Когда сервер молчит, но ты чувствуешь...",
    "Если бы поле ввода умело говорить, оно бы сказало...",
    "Когда в проекте появился файл final_final_2...",
    "Когда встреча внезапно стала слишком серьезной...",
    "Когда npm install занял вечность, мы решили...",
    "Если бы наш Git был семейным чатом...",
    "Когда кто-то сказал \"я ничего не трогал\"...",
    "Главный враг ночного кодинга - это...",
    "Когда локально работает, а на Render нет...",
    "Если бы баги получали зарплату...",
    "Когда ты поставил console.log и он решил проблему...",
    "Самая дорогая фраза в любом проекте - это...",
    "Когда коммит называется \"fix\" в пятый раз...",
    "Если бы дедлайны можно было закрывать стикерами...",
    "Когда один человек в лобби все еще выбирает ник...",
    "Главная суперсила хоста - это...",
    "Когда README понял больше, чем команда...",
    "Если бы внутренние шутки стали официальной валютой...",
    "Когда pull request выглядит как признание вины...",
    "На третьем раунде все поняли, что юмор...",
    "Когда сервер перезапустился и сделал вид, что так и надо...",
    "Если бы ошибки в консоли были гороскопом...",
    "Когда кто-то предложил переписать все с нуля...",
    "Главный закон маленькой команды: если работает...",
    "Когда в чате написали \"го на 5 минут\"...",
    "Если бы наш проект сдавали как арт-объект...",
    "Когда ты понял, что проблема была в одной запятой...",
    "Самый стабильный модуль проекта - это...",
    "Когда тесты прошли, но стало только страшнее...",
    "Если бы бессонница умела писать JavaScript...",
    "Когда хост копирует код лобби как секретный архив..."
  ],
  errors: {
    hostOnly: "Это может сделать только хост лобби.",
    emptyName: "Введите ник",
    roomMissing: "Лобби не найдено",
    gameStarted: "Игра уже началась. Новых игроков больше нельзя добавить в это лобби.",
    roomFull: "Лобби уже забито. Стульев больше нет.",
    minPlayers: "Нужно минимум 2 игрока.",
    emptyPrompt: "Напишите начало фразы.",
    emptyAnswer: "Напишите концовку.",
    noAssignment: "Вам еще не выдана фраза. Попробуйте обновить страницу.",
    jokeMissing: "Шутка не найдена.",
    selfVote: "За себя голосовать нельзя. Даже если ты гений."
  },
  fallbackAnswer: "не успел придумать смешную концовку",
  fallbackPlayer: "аноним из оперативки",
  notices: {
    joined: (name) => `${name} присоединился к лобби.`,
    returned: (name) => `${name} вернулся в лобби.`,
    hostChanged: (name) => `${name} теперь хост лобби.`,
    disconnected: (name) => `${name} отключился.`,
    left: (name) => `${name} вышел из лобби.`,
    deleted: "Хост удалил лобби."
  },
  titles: [
    { title: "Машина юмора", note: "набрал больше всех очков" },
    { title: "Душнила раунда", note: "собрал меньше всего голосов, зато стабильно" },
    { title: "Гений локалок", note: "получил больше всех голосов за одну шутку" },
    { title: "Украл шутку и победил", note: "выиграл с минимальным отрывом" },
    { title: "Мастер короткой фразы", note: "сказал мало, но попал точно" },
    { title: "Архитектор шутки", note: "собрал хорошую концовку из ничего" },
    { title: "Инженер смешного", note: "подошел к юмору системно" },
    { title: "Главный по внутренним шуткам", note: "лучше всех чувствует компанию" },
    { title: "Редактор настроения", note: "делает смешнее даже обычные фразы" },
    { title: "Баг, который всем понравился", note: "получилось странно, но удачно" },
    { title: "Специалист по паузам", note: "держал интригу до последнего" },
    { title: "Спокойный хост", note: "сделал вид, что все под контролем" },
    { title: "Коммит без сообщения", note: "таинственный, но почему-то смешной" }
  ]
};

const rooms = {};
const PROMPT_MAX_LENGTH = 160;
const ANSWER_MAX_LENGTH = 180;
const RECONNECT_GRACE_MS = 6000;

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(number)));
}

function cleanText(value, maxLength = 220) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanSessionId(value) {
  return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  do {
    code = "";
    for (let i = 0; i < 4; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  } while (rooms[code]);

  return code;
}

function pickAutoPrompt(index = 0) {
  return COPY.autoPrompts[index % COPY.autoPrompts.length];
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getConnectedPlayers(room) {
  return room.players.filter((player) => player.connected);
}

function normalizeSettings(raw = {}) {
  return {
    maxRounds: clampNumber(raw.maxRounds, 1, 20, 5),
    timers: {
      promptSeconds: clampNumber(raw.promptSeconds, 0, 3600, 60),
      answerSeconds: clampNumber(raw.answerSeconds, 0, 3600, 60),
      voteSeconds: clampNumber(raw.voteSeconds, 0, 3600, 30)
    },
    settings: {
      anonymousMode: Boolean(raw.anonymousMode),
      soundsEnabled: raw.soundsEnabled !== false,
      promptMode: raw.promptMode === "auto" ? "auto" : "manual",
      assignmentMode: raw.assignmentMode === "same" ? "same" : "different",
      maxPlayers: clampNumber(raw.maxPlayers, 2, 12, 6),
      publicLobby: raw.publicLobby !== false
    }
  };
}

function clearRoomTimer(room) {
  if (room.timerHandle) clearTimeout(room.timerHandle);
  room.timerHandle = null;
}

function setStageTimer(room, seconds, callback) {
  clearRoomTimer(room);

  if (!seconds) {
    room.timerEndsAt = null;
    return;
  }

  room.timerEndsAt = Date.now() + seconds * 1000;
  room.timerHandle = setTimeout(callback, seconds * 1000 + 150);
}

function createPlayer(socket, name, sessionId) {
  return {
    id: sessionId,
    socketId: socket.id,
    name,
    score: 0,
    connected: true,
    totalVotesReceived: 0,
    bestSingleRoundVotes: 0
  };
}

function publicRoom(room) {
  const { timerHandle, emptyDeleteTimer, ...safeRoom } = room;
  return {
    ...safeRoom,
    players: room.players.map(({ socketId, disconnectTimer, ...player }) => player)
  };
}

function emitRoom(room) {
  io.to(room.code).emit("roomUpdate", publicRoom(room));
}

function getOpenRooms() {
  return Object.values(rooms)
    .filter((room) => room.state === "waiting" && room.settings.publicLobby)
    .map((room) => ({
      code: room.code,
      hostName: getPlayerName(room, room.hostId),
      playersCount: getConnectedPlayers(room).length,
      maxPlayers: room.settings.maxPlayers,
      maxRounds: room.maxRounds,
      promptMode: room.settings.promptMode,
      assignmentMode: room.settings.assignmentMode
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

function emitOpenRooms() {
  io.emit("openRoomsUpdate", getOpenRooms());
}

function emitError(socket, message) {
  socket.emit("errorMessage", message);
}

function ensureHost(socket, room) {
  if (!room || room.hostId !== socket.data.playerId) {
    emitError(socket, COPY.errors.hostOnly);
    return false;
  }
  return true;
}

function emitNotice(room, message, type = "info", exceptSocket = null) {
  const payload = {
    message,
    type,
    createdAt: Date.now()
  };

  if (exceptSocket) {
    exceptSocket.to(room.code).emit("roomNotice", payload);
  } else {
    io.to(room.code).emit("roomNotice", payload);
  }
}

function attachPlayerToSocket(socket, room, player) {
  if (player.disconnectTimer) {
    clearTimeout(player.disconnectTimer);
    player.disconnectTimer = null;
  }
  if (room.emptyDeleteTimer) {
    clearTimeout(room.emptyDeleteTimer);
    room.emptyDeleteTimer = null;
  }

  player.socketId = socket.id;
  player.connected = true;
  socket.data.roomCode = room.code;
  socket.data.playerId = player.id;
  socket.join(room.code);
}

function scheduleEmptyRoomCleanup(room) {
  if (getConnectedPlayers(room).length > 0 || room.emptyDeleteTimer) return;

  room.emptyDeleteTimer = setTimeout(() => {
    const latest = rooms[room.code];
    if (latest && getConnectedPlayers(latest).length === 0) {
      clearRoomTimer(latest);
      delete rooms[room.code];
      emitOpenRooms();
    }
  }, 15 * 60 * 1000);
}

function assignNewHostIfNeeded(room, leavingPlayerId = null) {
  if (room.hostId !== leavingPlayerId) return null;

  const newHost = getConnectedPlayers(room)[0];
  if (newHost) {
    room.hostId = newHost.id;
    return newHost;
  }

  return null;
}

function maybeAdvanceAfterPlayerLeave(room) {
  const connectedPlayers = getConnectedPlayers(room);
  if (connectedPlayers.length === 0) return;

  if (room.state === "prompting" && connectedPlayers.every((player) => {
    return room.prompts.some((prompt) => prompt.authorId === player.id);
  })) {
    moveToAnswering(room);
    return;
  }

  if (room.state === "answering" && connectedPlayers.every((player) => {
    return room.answers.some((answer) => answer.authorId === player.id);
  })) {
    moveToRevealing(room);
    return;
  }

  if (room.state === "voting" && connectedPlayers.every((player) => {
    const ownOnly = room.answers.every((answerItem) => answerItem.authorId === player.id);
    return ownOnly || room.votes.some((vote) => vote.voterId === player.id);
  })) {
    finishVoting(room);
  }
}

function leaveRoom(socket, notifySelf = true) {
  const room = rooms[socket.data.roomCode];
  const playerId = socket.data.playerId;
  if (!room || !playerId) return;

  const player = room.players.find((item) => item.id === playerId);
  if (!player) return;

  if (player.disconnectTimer) {
    clearTimeout(player.disconnectTimer);
    player.disconnectTimer = null;
  }

  socket.leave(room.code);
  socket.data.roomCode = null;
  socket.data.playerId = null;

  if (room.state === "waiting") {
    room.players = room.players.filter((item) => item.id !== playerId);
  } else {
    player.connected = false;
    player.socketId = null;
  }

  const newHost = assignNewHostIfNeeded(room, playerId);

  if (notifySelf) {
    socket.emit("leftRoom");
  }

  if (room.players.length === 0 || getConnectedPlayers(room).length === 0) {
    clearRoomTimer(room);
    delete rooms[room.code];
    emitOpenRooms();
    return;
  }

  emitRoom(room);
  emitOpenRooms();
  emitNotice(room, COPY.notices.left(player.name), "leave");
  if (newHost) {
    emitNotice(room, COPY.notices.hostChanged(newHost.name), "host");
  }
  maybeAdvanceAfterPlayerLeave(room);
}

function resetRoundData(room) {
  room.prompts = [];
  room.sharedPrompt = null;
  room.assignments = {};
  room.answers = [];
  room.votes = [];
  room.lastRoundResults = [];
  room.lastBestJoke = null;
  room.lastBestJokes = [];
  room.lastRoundTie = null;
  room.titles = [];
  clearRoomTimer(room);
}

function startRound(room) {
  resetRoundData(room);

  if (room.settings.promptMode === "auto") {
    buildAssignments(room);
    room.state = "answering";
    setStageTimer(room, room.timers.answerSeconds, () => expireAnswering(room.code));
    emitRoom(room);
    return;
  }

  room.state = "prompting";
  setStageTimer(room, room.timers.promptSeconds, () => expirePrompting(room.code));
  emitRoom(room);
}

function startGameCountdown(room) {
  clearRoomTimer(room);
  room.state = "starting";
  room.timerEndsAt = Date.now() + 5000;
  room.timerHandle = setTimeout(() => {
    const latest = rooms[room.code];
    if (!latest || latest.state !== "starting") return;
    startRound(latest);
  }, 5150);
  emitRoom(room);
}

function buildAssignments(room) {
  const players = getConnectedPlayers(room);
  room.assignments = {};

  if (room.settings.assignmentMode === "same") {
    let prompt = null;

    if (room.settings.promptMode === "manual" && room.prompts.length > 0) {
      prompt = randomItem(room.prompts);
    } else {
      prompt = {
        id: makeId("prompt"),
        authorId: null,
        text: pickAutoPrompt(room.round + Date.now())
      };
      room.prompts.push(prompt);
    }

    room.sharedPrompt = prompt.id;
    players.forEach((player) => {
      room.assignments[player.id] = prompt.id;
    });
    return;
  }

  if (room.settings.promptMode === "auto") {
    players.forEach((player, index) => {
      const prompt = {
        id: makeId("prompt"),
        authorId: null,
        text: pickAutoPrompt(room.round + index)
      };
      room.prompts.push(prompt);
      room.assignments[player.id] = prompt.id;
    });
    return;
  }

  const promptByAuthor = new Map(room.prompts.map((prompt) => [prompt.authorId, prompt]));
  players.forEach((player, index) => {
    const nextPlayer = players[(index + 1) % players.length];
    const prompt = promptByAuthor.get(nextPlayer.id) || room.prompts[index % room.prompts.length];
    if (prompt) room.assignments[player.id] = prompt.id;
  });
}

function fillMissingPrompts(room) {
  const submitted = new Set(room.prompts.map((prompt) => prompt.authorId));
  getConnectedPlayers(room).forEach((player, index) => {
    if (!submitted.has(player.id)) {
      room.prompts.push({
        id: makeId("prompt"),
        authorId: player.id,
        text: pickAutoPrompt(room.round + index)
      });
    }
  });
}

function moveToAnswering(room) {
  clearRoomTimer(room);
  fillMissingPrompts(room);
  buildAssignments(room);
  room.state = "answering";
  setStageTimer(room, room.timers.answerSeconds, () => expireAnswering(room.code));
  emitRoom(room);
}

function expirePrompting(code) {
  const room = rooms[code];
  if (!room || room.state !== "prompting") return;
  moveToAnswering(room);
}

function fillMissingAnswers(room) {
  const answered = new Set(room.answers.map((answer) => answer.authorId));
  getConnectedPlayers(room).forEach((player) => {
    if (!answered.has(player.id) && room.assignments[player.id]) {
      room.answers.push({
        id: makeId("answer"),
        promptId: room.assignments[player.id],
        authorId: player.id,
        text: COPY.fallbackAnswer
      });
    }
  });
}

function moveToRevealing(room) {
  clearRoomTimer(room);
  fillMissingAnswers(room);
  room.state = "revealing";
  room.timerEndsAt = null;
  emitRoom(room);
}

function expireAnswering(code) {
  const room = rooms[code];
  if (!room || room.state !== "answering") return;
  moveToRevealing(room);
}

function moveToVoting(room) {
  room.state = "voting";
  room.votes = [];
  setStageTimer(room, room.timers.voteSeconds, () => expireVoting(room.code));
  emitRoom(room);
}

function expireVoting(code) {
  const room = rooms[code];
  if (!room || room.state !== "voting") return;
  finishVoting(room);
}

function getPromptText(room, promptId) {
  const prompt = room.prompts.find((item) => item.id === promptId);
  return prompt ? prompt.text : "";
}

function getPlayerName(room, playerId) {
  const player = room.players.find((item) => item.id === playerId);
  return player ? player.name : COPY.fallbackPlayer;
}

function finishVoting(room) {
  clearRoomTimer(room);

  const votesByAnswer = new Map();
  room.answers.forEach((answer) => votesByAnswer.set(answer.id, 0));
  room.votes.forEach((vote) => {
    votesByAnswer.set(vote.answerId, (votesByAnswer.get(vote.answerId) || 0) + 1);
  });

  room.lastRoundResults = room.answers.map((answer) => {
    const votesCount = votesByAnswer.get(answer.id) || 0;
    const author = room.players.find((player) => player.id === answer.authorId);

    if (author) {
      author.score += votesCount;
      author.totalVotesReceived += votesCount;
      author.bestSingleRoundVotes = Math.max(author.bestSingleRoundVotes, votesCount);
    }

    return {
      answerId: answer.id,
      promptText: getPromptText(room, answer.promptId),
      answerText: answer.text,
      authorId: answer.authorId,
      authorName: getPlayerName(room, answer.authorId),
      votesCount,
      isRoundWinner: false
    };
  }).sort((a, b) => b.votesCount - a.votesCount);

  const bestVotes = room.lastRoundResults[0]?.votesCount || 0;
  const bestJokes = room.lastRoundResults.filter((result) => result.votesCount === bestVotes);
  bestJokes.forEach((result) => {
    result.isRoundWinner = true;
  });

  room.lastBestJokes = bestJokes;
  room.lastBestJoke = bestJokes[0] || null;
  room.lastRoundTie = bestJokes.length > 1 ? {
    votesCount: bestVotes,
    winnersCount: bestJokes.length,
    answerIds: bestJokes.map((result) => result.answerId)
  } : null;

  bestJokes.forEach((best) => {
    room.bestJokesHistory.push({
      round: room.round,
      promptText: best.promptText,
      answerText: best.answerText,
      authorName: best.authorName,
      votesCount: best.votesCount,
      tied: bestJokes.length > 1
    });
  });

  room.state = "scoreboard";
  room.timerEndsAt = null;
  emitRoom(room);
}

function buildTitles(room) {
  const players = [...room.players].sort((a, b) => b.score - a.score);
  if (players.length === 0) return [];

  const winner = players[0];
  const leastVotes = [...room.players].sort((a, b) => a.totalVotesReceived - b.totalVotesReceived)[0];
  const bestSingle = [...room.players].sort((a, b) => b.bestSingleRoundVotes - a.bestSingleRoundVotes)[0];
  const second = players[1] || winner;
  const smallLead = players[1] && winner.score - players[1].score <= 1;
  const extraPlayers = [...room.players].sort((a, b) => {
    if (a.id === winner.id) return 1;
    if (b.id === winner.id) return -1;
    return a.name.localeCompare(b.name, "ru");
  });
  const playerForExtra = (index) => extraPlayers[index % extraPlayers.length] || winner;

  return [
    {
      title: COPY.titles[0].title,
      playerName: winner.name,
      note: COPY.titles[0].note
    },
    {
      title: COPY.titles[1].title,
      playerName: leastVotes.name,
      note: COPY.titles[1].note
    },
    {
      title: COPY.titles[2].title,
      playerName: bestSingle.name,
      note: `${COPY.titles[2].note}: ${bestSingle.bestSingleRoundVotes} голосов`
    },
    {
      title: COPY.titles[3].title,
      playerName: smallLead ? winner.name : second.name,
      note: smallLead ? COPY.titles[3].note : "был близко к победе"
    },
    ...COPY.titles.slice(4).map((title, index) => ({
      title: title.title,
      playerName: playerForExtra(index).name,
      note: title.note
    }))
  ];
}

function finishGame(room) {
  clearRoomTimer(room);
  room.state = "finished";
  room.timerEndsAt = null;
  room.titles = buildTitles(room);
  emitRoom(room);
}

io.on("connection", (socket) => {
  socket.on("createRoom", ({ name, settings, sessionId } = {}) => {
    const cleanName = cleanText(name, 32);
    const cleanSession = cleanSessionId(sessionId) || makeId("player");
    if (!cleanName) return emitError(socket, COPY.errors.emptyName);

    const code = generateRoomCode();
    const normalized = normalizeSettings(settings);
    const room = {
      code,
      hostId: cleanSession,
      state: "waiting",
      round: 1,
      maxRounds: normalized.maxRounds,
      timerEndsAt: null,
      timers: normalized.timers,
      settings: normalized.settings,
      players: [createPlayer(socket, cleanName, cleanSession)],
      prompts: [],
      sharedPrompt: null,
      assignments: {},
      answers: [],
      votes: [],
      lastRoundResults: [],
      lastBestJoke: null,
      lastBestJokes: [],
      lastRoundTie: null,
      bestJokesHistory: [],
      titles: [],
      timerHandle: null,
      emptyDeleteTimer: null
    };

    rooms[code] = room;
    attachPlayerToSocket(socket, room, room.players[0]);
    socket.emit("roomCreated", { code, sessionId: cleanSession });
    emitRoom(room);
    emitOpenRooms();
  });

  socket.on("joinRoom", ({ code, name, sessionId } = {}) => {
    const cleanCode = cleanText(code, 8).toUpperCase();
    const cleanName = cleanText(name, 32);
    const cleanSession = cleanSessionId(sessionId) || makeId("player");
    const room = rooms[cleanCode];

    if (!cleanName) return emitError(socket, COPY.errors.emptyName);
    if (!room) return emitError(socket, COPY.errors.roomMissing);

    const existingPlayer = room.players.find((player) => player.id === cleanSession);
    if (existingPlayer) {
      const wasDisconnected = !existingPlayer.connected;
      existingPlayer.name = cleanName;
      attachPlayerToSocket(socket, room, existingPlayer);
      socket.emit("joinedRoom", { code: cleanCode, sessionId: cleanSession, reconnected: true });
      emitRoom(room);
      emitOpenRooms();
      if (wasDisconnected) {
        emitNotice(room, COPY.notices.returned(existingPlayer.name), "reconnect", socket);
      }
      return;
    }

    if (room.state !== "waiting") return emitError(socket, COPY.errors.gameStarted);
    if (getConnectedPlayers(room).length >= room.settings.maxPlayers) {
      return emitError(socket, COPY.errors.roomFull);
    }

    const player = createPlayer(socket, cleanName, cleanSession);
    room.players.push(player);
    attachPlayerToSocket(socket, room, player);
    socket.emit("joinedRoom", { code: cleanCode, sessionId: cleanSession, reconnected: false });
    emitRoom(room);
    emitNotice(room, COPY.notices.joined(cleanName), "join", socket);
    emitOpenRooms();
  });

  socket.on("listOpenRooms", () => {
    socket.emit("openRoomsUpdate", getOpenRooms());
  });

  socket.on("updateRoomSettings", ({ settings } = {}) => {
    const room = rooms[socket.data.roomCode];
    if (!ensureHost(socket, room)) return;
    if (room.state !== "waiting") return;

    const normalized = normalizeSettings(settings);
    const connectedCount = getConnectedPlayers(room).length;
    normalized.settings.maxPlayers = Math.max(normalized.settings.maxPlayers, connectedCount, 2);

    room.maxRounds = normalized.maxRounds;
    room.timers = normalized.timers;
    room.settings = normalized.settings;
    emitRoom(room);
    emitOpenRooms();
  });

  socket.on("updateName", ({ name } = {}) => {
    const room = rooms[socket.data.roomCode];
    const playerId = socket.data.playerId;
    const cleanName = cleanText(name, 32);
    if (!cleanName) return emitError(socket, COPY.errors.emptyName);
    if (!room || !playerId) return emitError(socket, COPY.errors.roomMissing);

    const player = room.players.find((item) => item.id === playerId);
    if (!player) return emitError(socket, COPY.errors.roomMissing);

    player.name = cleanName;
    emitRoom(room);
    emitOpenRooms();
  });

  socket.on("reconnectRoom", ({ code, name, sessionId } = {}) => {
    const cleanCode = cleanText(code, 8).toUpperCase();
    const cleanSession = cleanSessionId(sessionId);
    const cleanName = cleanText(name, 32);
    const room = rooms[cleanCode];
    const player = room?.players.find((item) => item.id === cleanSession);

    if (!room || !player) {
      socket.emit("sessionExpired");
      return;
    }

    const wasDisconnected = !player.connected;
    if (cleanName) player.name = cleanName;
    attachPlayerToSocket(socket, room, player);
    socket.emit("rejoinedRoom", { code: cleanCode, sessionId: cleanSession });
    emitRoom(room);
    if (wasDisconnected) {
      emitNotice(room, COPY.notices.returned(player.name), "reconnect", socket);
    }
  });

  socket.on("startGame", () => {
    const room = rooms[socket.data.roomCode];
    if (!ensureHost(socket, room)) return;
    if (getConnectedPlayers(room).length < 2) {
      return emitError(socket, COPY.errors.minPlayers);
    }

    room.round = 1;
    room.players.forEach((player) => {
      player.score = 0;
      player.totalVotesReceived = 0;
      player.bestSingleRoundVotes = 0;
    });
    room.bestJokesHistory = [];
    startGameCountdown(room);
    emitOpenRooms();
  });

  socket.on("submitPrompt", ({ text } = {}) => {
    const room = rooms[socket.data.roomCode];
    const playerId = socket.data.playerId;
    if (!room || room.state !== "prompting") return;

    const promptText = cleanText(text, PROMPT_MAX_LENGTH);
    if (!promptText) return emitError(socket, COPY.errors.emptyPrompt);
    if (room.prompts.some((prompt) => prompt.authorId === playerId)) return;

    room.prompts.push({
      id: makeId("prompt"),
      authorId: playerId,
      text: promptText
    });

    if (getConnectedPlayers(room).every((player) => room.prompts.some((prompt) => prompt.authorId === player.id))) {
      moveToAnswering(room);
    } else {
      emitRoom(room);
    }
  });

  socket.on("submitAnswer", ({ text } = {}) => {
    const room = rooms[socket.data.roomCode];
    const playerId = socket.data.playerId;
    if (!room || room.state !== "answering") return;

    const answerText = cleanText(text, ANSWER_MAX_LENGTH);
    if (!answerText) return emitError(socket, COPY.errors.emptyAnswer);
    if (!room.assignments[playerId]) return emitError(socket, COPY.errors.noAssignment);
    if (room.answers.some((answer) => answer.authorId === playerId)) return;

    room.answers.push({
      id: makeId("answer"),
      promptId: room.assignments[playerId],
      authorId: playerId,
      text: answerText
    });

    if (getConnectedPlayers(room).every((player) => room.answers.some((answer) => answer.authorId === player.id))) {
      moveToRevealing(room);
    } else {
      emitRoom(room);
    }
  });

  socket.on("startVoting", () => {
    const room = rooms[socket.data.roomCode];
    if (!ensureHost(socket, room)) return;
    if (room.state !== "revealing") return;
    moveToVoting(room);
  });

  socket.on("submitVote", ({ answerId } = {}) => {
    const room = rooms[socket.data.roomCode];
    const playerId = socket.data.playerId;
    if (!room || room.state !== "voting") return;
    if (room.votes.some((vote) => vote.voterId === playerId)) return;

    const answer = room.answers.find((item) => item.id === answerId);
    if (!answer) return emitError(socket, COPY.errors.jokeMissing);
    if (answer.authorId === playerId) return emitError(socket, COPY.errors.selfVote);

    room.votes.push({ voterId: playerId, answerId });

    if (getConnectedPlayers(room).every((player) => {
      const ownOnly = room.answers.every((answerItem) => answerItem.authorId === player.id);
      return ownOnly || room.votes.some((vote) => vote.voterId === player.id);
    })) {
      finishVoting(room);
    } else {
      emitRoom(room);
    }
  });

  socket.on("nextRound", () => {
    const room = rooms[socket.data.roomCode];
    if (!ensureHost(socket, room)) return;
    if (room.state !== "scoreboard") return;

    if (room.round >= room.maxRounds) {
      finishGame(room);
    } else {
      room.round += 1;
      startRound(room);
    }
  });

  socket.on("restartGame", () => {
    const room = rooms[socket.data.roomCode];
    if (!ensureHost(socket, room)) return;

    clearRoomTimer(room);
    room.state = "waiting";
    room.round = 1;
    room.timerEndsAt = null;
    room.players.forEach((player) => {
      player.score = 0;
      player.totalVotesReceived = 0;
      player.bestSingleRoundVotes = 0;
    });
    resetRoundData(room);
    room.bestJokesHistory = [];
    room.titles = [];
    emitRoom(room);
    emitOpenRooms();
  });

  socket.on("leaveRoom", () => {
    leaveRoom(socket);
  });

  socket.on("deleteRoom", () => {
    const room = rooms[socket.data.roomCode];
    if (!ensureHost(socket, room)) return;

    clearRoomTimer(room);
    io.to(room.code).emit("roomDeleted", { message: COPY.notices.deleted });
    io.in(room.code).socketsLeave(room.code);
    delete rooms[room.code];
    emitOpenRooms();
  });

  socket.on("disconnect", () => {
    const room = rooms[socket.data.roomCode];
    const playerId = socket.data.playerId;
    if (!room) return;

    const player = room.players.find((item) => item.id === playerId);
    if (!player) return;

    if (player.disconnectTimer) clearTimeout(player.disconnectTimer);

    player.disconnectTimer = setTimeout(() => {
      const latest = rooms[room.code];
      if (!latest) return;

      const latestPlayer = latest.players.find((item) => item.id === playerId);
      if (!latestPlayer || latestPlayer.socketId !== socket.id) return;

      latestPlayer.connected = false;
      latestPlayer.socketId = null;
      latestPlayer.disconnectTimer = null;

      let newHost = null;
      if (latest.hostId === playerId) {
        newHost = getConnectedPlayers(latest)[0];
        if (newHost) {
          latest.hostId = newHost.id;
        }
      }

      scheduleEmptyRoomCleanup(latest);
      emitRoom(latest);
      if (newHost) {
        emitNotice(latest, COPY.notices.hostChanged(newHost.name), "host");
      }
      emitNotice(latest, COPY.notices.disconnected(latestPlayer.name), "leave");
    }, RECONNECT_GRACE_MS);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
