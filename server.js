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

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"]
  }
});

const AUTO_PROMPTS = [
  "Когда Давид сказал, что сделает сайт за вечер...",
  "Самое страшное на инфмате - это...",
  "Я понял, что сервер умер, когда...",
  "Если бы эту игру делали серьезно...",
  "Когда все уже готовы играть, но один человек...",
  "Лучший способ сломать проект - это...",
  "Когда ты открыл код спустя неделю и увидел...",
  "Если бы локальные шутки были валютой...",
  "Когда хост сказал \"последний раунд\"...",
  "Самая бесполезная суперспособность программиста - это..."
];

const rooms = {};

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(number)));
}

function cleanText(value, maxLength = 220) {
  return String(value || "").trim().slice(0, maxLength);
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
  return AUTO_PROMPTS[index % AUTO_PROMPTS.length];
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
      maxPlayers: clampNumber(raw.maxPlayers, 2, 12, 6)
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

function createPlayer(socket, name) {
  return {
    id: socket.id,
    name,
    score: 0,
    connected: true,
    totalVotesReceived: 0,
    bestSingleRoundVotes: 0
  };
}

function publicRoom(room) {
  const { timerHandle, emptyDeleteTimer, ...safeRoom } = room;
  return safeRoom;
}

function emitRoom(room) {
  io.to(room.code).emit("roomUpdate", publicRoom(room));
}

function emitError(socket, message) {
  socket.emit("errorMessage", message);
}

function ensureHost(socket, room) {
  if (!room || room.hostId !== socket.id) {
    emitError(socket, "Это может сделать только хост комнаты.");
    return false;
  }
  return true;
}

function resetRoundData(room) {
  room.prompts = [];
  room.sharedPrompt = null;
  room.assignments = {};
  room.answers = [];
  room.votes = [];
  room.lastRoundResults = [];
  room.lastBestJoke = null;
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
        text: "не успел придумать смешную концовку"
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
  return player ? player.name : "Игрок";
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
      votesCount
    };
  }).sort((a, b) => b.votesCount - a.votesCount);

  const best = room.lastRoundResults[0] || null;
  room.lastBestJoke = best;

  if (best) {
    room.bestJokesHistory.push({
      round: room.round,
      promptText: best.promptText,
      answerText: best.answerText,
      authorName: best.authorName,
      votesCount: best.votesCount
    });
  }

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

  return [
    {
      title: "Машина юмора",
      playerName: winner.name,
      note: "набрал больше всех очков"
    },
    {
      title: "Душнила раунда",
      playerName: leastVotes.name,
      note: "собрал меньше всего голосов за игру"
    },
    {
      title: "Гений локалок",
      playerName: bestSingle.name,
      note: `лучший разовый залп: ${bestSingle.bestSingleRoundVotes} голосов`
    },
    {
      title: "Украл шутку и победил",
      playerName: smallLead ? winner.name : second.name,
      note: smallLead ? "выиграл с минимальным отрывом" : "почти провернул подозрительно красивый камбэк"
    }
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
  socket.on("createRoom", ({ name, settings } = {}) => {
    const cleanName = cleanText(name, 32);
    if (!cleanName) return emitError(socket, "Введите ник.");

    const code = generateRoomCode();
    const normalized = normalizeSettings(settings);
    const room = {
      code,
      hostId: socket.id,
      state: "waiting",
      round: 1,
      maxRounds: normalized.maxRounds,
      timerEndsAt: null,
      timers: normalized.timers,
      settings: normalized.settings,
      players: [createPlayer(socket, cleanName)],
      prompts: [],
      sharedPrompt: null,
      assignments: {},
      answers: [],
      votes: [],
      lastRoundResults: [],
      lastBestJoke: null,
      bestJokesHistory: [],
      titles: [],
      timerHandle: null,
      emptyDeleteTimer: null
    };

    rooms[code] = room;
    socket.data.roomCode = code;
    socket.join(code);
    socket.emit("roomCreated", { code });
    emitRoom(room);
  });

  socket.on("joinRoom", ({ code, name } = {}) => {
    const cleanCode = cleanText(code, 8).toUpperCase();
    const cleanName = cleanText(name, 32);
    const room = rooms[cleanCode];

    if (!cleanName) return emitError(socket, "Введите ник.");
    if (!room) return emitError(socket, "Комната не найдена.");
    if (room.state !== "waiting") return emitError(socket, "Игра уже началась.");
    if (getConnectedPlayers(room).length >= room.settings.maxPlayers) {
      return emitError(socket, "Комната заполнена.");
    }

    room.players.push(createPlayer(socket, cleanName));
    socket.data.roomCode = cleanCode;
    socket.join(cleanCode);
    socket.emit("joinedRoom", { code: cleanCode });
    emitRoom(room);
  });

  socket.on("startGame", () => {
    const room = rooms[socket.data.roomCode];
    if (!ensureHost(socket, room)) return;
    if (getConnectedPlayers(room).length < 2) {
      return emitError(socket, "Нужно минимум 2 игрока.");
    }

    room.round = 1;
    room.players.forEach((player) => {
      player.score = 0;
      player.totalVotesReceived = 0;
      player.bestSingleRoundVotes = 0;
    });
    room.bestJokesHistory = [];
    startRound(room);
  });

  socket.on("submitPrompt", ({ text } = {}) => {
    const room = rooms[socket.data.roomCode];
    if (!room || room.state !== "prompting") return;

    const promptText = cleanText(text);
    if (!promptText) return emitError(socket, "Напишите начало фразы.");
    if (room.prompts.some((prompt) => prompt.authorId === socket.id)) return;

    room.prompts.push({
      id: makeId("prompt"),
      authorId: socket.id,
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
    if (!room || room.state !== "answering") return;

    const answerText = cleanText(text);
    if (!answerText) return emitError(socket, "Напишите концовку.");
    if (!room.assignments[socket.id]) return emitError(socket, "Вам не выдана фраза.");
    if (room.answers.some((answer) => answer.authorId === socket.id)) return;

    room.answers.push({
      id: makeId("answer"),
      promptId: room.assignments[socket.id],
      authorId: socket.id,
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
    if (!room || room.state !== "voting") return;
    if (room.votes.some((vote) => vote.voterId === socket.id)) return;

    const answer = room.answers.find((item) => item.id === answerId);
    if (!answer) return emitError(socket, "Шутка не найдена.");
    if (answer.authorId === socket.id) return emitError(socket, "За свою концовку голосовать нельзя.");

    room.votes.push({ voterId: socket.id, answerId });

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
  });

  socket.on("disconnect", () => {
    const room = rooms[socket.data.roomCode];
    if (!room) return;

    const player = room.players.find((item) => item.id === socket.id);
    if (player) player.connected = false;

    if (room.hostId === socket.id) {
      const newHost = getConnectedPlayers(room)[0];
      if (newHost) room.hostId = newHost.id;
    }

    if (getConnectedPlayers(room).length === 0) {
      room.emptyDeleteTimer = setTimeout(() => {
        const latest = rooms[room.code];
        if (latest && getConnectedPlayers(latest).length === 0) {
          clearRoomTimer(latest);
          delete rooms[room.code];
        }
      }, 15 * 60 * 1000);
    }

    emitRoom(room);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
