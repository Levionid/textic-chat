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
app.use(express.json({ limit: "25mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (request, response) => {
  response.sendFile(path.join(__dirname, "public", "index.html"));
});

const io = new Server(server, {
  maxHttpBufferSize: 25 * 1024 * 1024,
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
    modeNotImplemented: "Этот режим уже есть в меню, но его игровой цикл будет в следующем патче.",
    minPlayers: "Нужно минимум 2 игрока.",
    emptyPrompt: "Напишите начало фразы или добавьте аудио.",
    emptyAnswer: "Напишите концовку или добавьте аудио.",
    audioTooLarge: "Аудио должно быть не больше 20 МБ.",
    audioUnsupported: "Неподдерживаемый аудиофайл.",
    noAssignment: "Вам еще не выдана фраза. Попробуйте обновить страницу.",
    jokeMissing: "Шутка не найдена.",
    selfVote: "За себя голосовать нельзя. Даже если ты гений.",
    grandSelfVote: "За свою финальную шутку голосовать нельзя. Даже если это шутка вечера.",
    banned: "Вы забанены в этом лобби.",
    targetMissing: "Игрок не найден.",
    cannotKickHost: "Сначала передайте роль хоста другому игроку.",
    cannotBanHost: "Хоста нельзя забанить. Сначала передайте хоста.",
    roleLocked: "Хост пока не дал возможность менять роль.",
    activePlayersFull: "Свободных мест игрока нет.",
    noSharedPrompts: "Нужно хотя бы одно начало для режима «Все добивают одну фразу».",
    noChaosChain: "Цепочка хаоса не смогла собрать истории. Попробуйте начать заново."
  },
  fallbackAnswer: "не успел придумать смешную концовку",
  fallbackPlayer: "аноним из оперативки",
  notices: {
    joined: (name) => `${name} присоединился к лобби.`,
    returned: (name) => `${name} вернулся в лобби.`,
    hostChanged: (name) => `${name} теперь хост лобби.`,
    disconnected: (name) => `${name} отключился.`,
    left: (name) => `${name} вышел из лобби.`,
    deleted: "Хост удалил лобби.",
    kicked: "Вас кикнули из лобби.",
    banned: "Вас забанили в этом лобби.",
    movedToSpectator: (name) => `${name} теперь наблюдатель.`,
    movedToPlayer: (name) => `${name} теперь игрок.`,
    choiceUnlocked: (name) => `${name} снова может выбрать роль.`,
    kickedPlayer: (name) => `${name} кикнут из лобби.`,
    bannedPlayer: (name) => `${name} забанен в лобби.`
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


const PROMPT_PACKS = {
  universal: [
    "Я понял, что вечер пошёл не туда, когда...",
    "Самое опасное слово в компании — это...",
    "Если бы наш чат был городом, то...",
    "Никто не ожидал, что именно он...",
    "Всё было нормально, пока кто-то не сказал...",
    "Если бы лень была профессией, то...",
    "Самая странная причина опоздания — это...",
    "В тот момент все поняли, что план провалился, потому что...",
    "Самая честная фраза вечера звучала так...",
    "Если бы этот день был мемом, подпись была бы..."
  ],
  friends: [
    "В нашей компании всегда есть человек, который...",
    "Если бы у нас был общий дневник, первая запись была бы...",
    "Самый подозрительный друг — это тот, кто...",
    "Мы договорились вести себя нормально, но...",
    "Когда все говорят “один раунд и всё”, на самом деле...",
    "Если бы нашу компанию снимали как сериал, название серии было бы...",
    "У каждого друга есть суперспособность, и у него это...",
    "В нашей компании нельзя доверять человеку, который...",
    "Самая опасная фраза перед прогулкой — это...",
    "Если бы нас оставили одних на час, мы бы..."
  ],
  school: [
    "Преподаватель понял, что группа не готова, когда...",
    "Самая честная причина не сделать домашку — это...",
    "Если бы контрольная могла говорить, она бы сказала...",
    "На паре всегда есть человек, который...",
    "Когда учитель говорит “это будет легко”, значит...",
    "Самый опасный момент на уроке — это...",
    "Экзамен начался нормально, пока...",
    "Группа замолчала, когда преподаватель спросил...",
    "Если бы шпаргалка была искусством, то...",
    "В журнале не хватало только записи..."
  ],
  work: [
    "Созвон пошёл не туда, когда...",
    "Самая страшная фраза в рабочем чате — это...",
    "Если бы дедлайн был человеком, он бы...",
    "На совещании всегда есть человек, который...",
    "Когда начальник говорит “быстро обсудим”, это значит...",
    "Самое подозрительное письмо начинается со слов...",
    "Офис понял, что день будет тяжёлым, когда...",
    "Если бы Excel мог плакать, он бы заплакал из-за...",
    "Рабочий день закончился бы раньше, если бы...",
    "Корпоративная легенда гласит, что однажды сотрудник..."
  ],
  gaming: [
    "Катка была выиграна, пока кто-то не...",
    "Самый опасный тиммейт — это тот, кто...",
    "В Discord стало тихо, когда...",
    "Если бы наш голосовой чат записывали, нас бы...",
    "Он сказал “я сейчас зайду”, и через...",
    "Самый страшный звук в игре — это...",
    "Когда друг говорит “я умею играть”, значит...",
    "Команда поняла, что всё плохо, когда...",
    "Если бы лаги были оправданием, то...",
    "Перед поражением всегда кто-то говорит..."
  ],
  party: [
    "Вечеринка началась спокойно, пока...",
    "Самый опасный человек на тусовке — это тот, кто...",
    "Когда кто-то сказал “давайте поиграем”, все...",
    "На кухне всегда происходит...",
    "Если бы диван мог говорить, он бы рассказал...",
    "Самый неожиданный гость принёс с собой...",
    "Вечер стал легендарным после фразы...",
    "Когда музыка выключилась, все услышали...",
    "План был простой: посидеть спокойно, но...",
    "Никто не понял правила, но все..."
  ],
  family: [
    "Семейный ужин пошёл не туда, когда...",
    "Самая опасная фраза родственников — это...",
    "Когда бабушка сказала “я немного приготовила”, оказалось...",
    "Если бы семейный чат был фильмом, он назывался бы...",
    "Все молчали, пока один родственник не спросил...",
    "На семейных встречах всегда есть человек, который...",
    "Никто не спорил, пока тема не дошла до...",
    "Если бы дедушка вёл блог, первый пост был бы...",
    "Семья поняла, что праздник удался, когда...",
    "Самая странная семейная традиция — это..."
  ],
  absurd: [
    "Если бы холодильник стал президентом, первым указом было бы...",
    "Лифт остановился и сказал...",
    "Кошка посмотрела на меня так, будто...",
    "Если бы носки исчезали не просто так, то...",
    "Пельмени собрались на совещание, чтобы...",
    "В параллельной вселенной будильник...",
    "Когда чайник закипел, он прошептал...",
    "Самый умный предмет в комнате — это...",
    "Если бы стены реально слышали, они бы...",
    "Однажды Wi‑Fi решил отомстить и..."
  ],
  kz: [
    "Всё было нормально, пока кто-то не сказал “щас быстро”...",
    "Когда такси уже рядом, всегда происходит...",
    "Самая казахстанская причина опоздать — это...",
    "Если бы очередь в ЦОНе была сериалом, она бы называлась...",
    "Когда родственники спрашивают “когда уже”, хочется...",
    "На дастархане нельзя отказываться от...",
    "Если бы пробки могли говорить, они бы сказали...",
    "Все поняли, что поездка будет долгой, когда...",
    "Когда сказали “рядом”, оказалось...",
    "Самая опасная фраза в гостях — это “ещё чуть-чуть”..."
  ],
  softRoast: [
    "Этот человек настолько уверен в себе, что...",
    "Если бы он был приложением, его бы удалили за...",
    "Его суперспособность — это...",
    "Он зашёл в комнату и сразу...",
    "Если бы оправдания были валютой, он бы...",
    "Когда он говорит “я всё понял”, значит...",
    "Его главный талант — это...",
    "Если бы он был погодой, то...",
    "Он так долго думал, что...",
    "Даже таймер устал ждать, пока он..."
  ]
};

const PLAYER_PROMPT_PACKS = {
  universal: [
    "Когда {{player}} сказал {{player2}}, что всё под контролем...",
    "Если бы {{player}} и {{player2}} открыли бизнес, он назывался бы...",
    "{{player}} понял, что вечер пошёл не туда, когда {{player2}}...",
    "Самая опасная фраза от {{player}} звучит так...",
    "Если бы {{player}} был главным героем вечера, первая сцена была бы...",
    "{{player}} и {{player2}} договорились вести себя нормально, но...",
    "В комнате стало тихо, когда {{player}} посмотрел на {{player2}} и сказал...",
    "Если бы {{player}} отвечал за план, {{player2}} уже бы...",
    "{{player}} случайно доказал, что дружба — это...",
    "Когда {{host}} сказал, что всё честно, {{player}} сразу..."
  ],
  friends: [
    "В нашей компании {{player}} всегда тот человек, который...",
    "{{player}} и {{player2}} вместе опасны, потому что...",
    "Если {{player}} говорит “я быстро”, {{player2}} уже понимает, что...",
    "Главная суперспособность {{player}} — это...",
    "{{player2}} больше всего боится, когда {{player}} начинает фразу со слов...",
    "Если бы {{player}} был админом нашего чата, первое правило было бы...",
    "{{player}} однажды зашёл слишком далеко и...",
    "Когда {{player}} зовёт гулять, {{player2}} проверяет...",
    "В нашей компании нельзя оставлять {{player}} и {{player2}} одних, потому что...",
    "{{player}} хотел сказать что-то умное, но {{player2}}..."
  ],
  school: [
    "Преподаватель понял, что {{player}} не готов, когда...",
    "{{player}} списывал так уверенно, что {{player2}}...",
    "Если бы {{player}} был старостой, группа бы...",
    "На паре {{player}} молчал до момента, пока {{player2}}...",
    "{{player}} объяснил домашку так, что...",
    "Когда спросили {{player}}, вся группа...",
    "{{player2}} понял, что контрольная будет сложной, когда {{player}}...",
    "Если бы экзамен принимал {{player}}, первым вопросом было бы..."
  ],
  work: [
    "На созвоне {{player}} сказал “коротко”, и {{player2}} сразу...",
    "Если бы {{player}} был дедлайном, он бы...",
    "Рабочий чат замер, когда {{player}} отправил...",
    "{{player}} предложил оптимизировать процесс, и через минуту {{player2}}...",
    "Когда {{host}} сказал “быстро обсудим”, {{player}} уже...",
    "Если бы {{player}} вел протокол встречи, там было бы написано...",
    "{{player}} открыл Excel, и офис понял, что...",
    "Самое подозрительное письмо от {{player}} начинается со слов..."
  ],
  gaming: [
    "Катка закончилась, когда {{player}} сказал {{player2}}, что он умеет играть...",
    "В Discord стало тихо, когда {{player}} включил микрофон и...",
    "{{player}} пикнул героя, и {{player2}} сразу...",
    "Команда поверила {{player}} ровно до момента, когда...",
    "Если {{player}} говорит “я сейчас зайду”, значит...",
    "{{player2}} понял, что катка проиграна, когда {{player}}...",
    "Самый опасный тиммейт — это {{player}}, потому что...",
    "Когда {{player}} сказал “изи”, игра..."
  ],
  party: [
    "Вечеринка стала легендарной, когда {{player}} и {{player2}}...",
    "На кухне {{player}} сказал фразу, после которой...",
    "{{player}} пришёл просто посидеть, но через час...",
    "Когда музыка выключилась, все услышали, как {{player}}...",
    "{{player2}} понял, что вечер удался, когда {{player}}...",
    "План был спокойный, пока {{player}} не предложил...",
    "Если бы диван мог говорить, он бы рассказал про {{player}}...",
    "{{player}} сказал “я ненадолго”, и это закончилось тем, что..."
  ],
  family: [
    "Семейный ужин пошёл не туда, когда {{player}} спросил...",
    "Родственники замолчали, когда {{player}} сказал...",
    "Если бы семейный чат вёл {{player}}, там бы каждый день было...",
    "{{player2}} понял, что спор начался, когда {{player}}...",
    "На дастархане {{player}} отказался от добавки, и...",
    "Когда {{player}} сказал “я объясню”, семья...",
    "Самая опасная семейная фраза от {{player}} — это..."
  ],
  absurd: [
    "Если бы {{player}} был холодильником, {{player2}} первым делом...",
    "Кошка посмотрела на {{player}} так, будто...",
    "В параллельной вселенной {{player}} и {{player2}} работают...",
    "Когда чайник увидел {{player}}, он прошептал...",
    "Если бы носки исчезали из-за {{player}}, причина была бы...",
    "{{player}} случайно стал президентом лифта и первым указом...",
    "Самый умный предмет в комнате посмотрел на {{player}} и..."
  ],
  kz: [
    "{{player}} сказал “щас быстро”, и {{player2}} понял, что...",
    "Когда такси уже рядом, {{player}} обязательно...",
    "{{player}} объяснил слово “рядом” так, что {{player2}}...",
    "На дастархане {{player}} сделал ошибку: он...",
    "Если бы очередь в ЦОНе вёл {{player}}, она бы...",
    "{{player2}} понял, что поездка будет долгой, когда {{player}}...",
    "Самая казахстанская причина опоздания у {{player}} — это..."
  ],
  softRoast: [
    "{{player}} настолько уверен в себе, что {{player2}} уже...",
    "Если бы {{player}} был приложением, {{player2}} удалил бы его за...",
    "Главный талант {{player}} — это...",
    "Когда {{player}} говорит “я всё понял”, {{player2}}...",
    "{{player}} так долго думал, что {{player2}} успел...",
    "Если бы оправдания были валютой, {{player}} бы...",
    "{{player}} зашёл в комнату и сразу...",
    "Даже таймер устал ждать, пока {{player}}..."
  ]
};

const CUSTOM_PROMPT_PACK_LIMIT = 2;
const CUSTOM_PROMPTS_PER_PACK_LIMIT = 80;
const CUSTOM_PACK_NAME_LIMIT = 36;

function normalizePackId(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 32);
}

function sanitizeCustomPromptPacks(raw = []) {
  const seen = new Set();
  return safeArray(raw)
    .slice(0, CUSTOM_PROMPT_PACK_LIMIT)
    .map((pack, index) => {
      const baseId = normalizePackId(pack?.id) || `custom_${index + 1}`;
      let id = baseId;
      let suffix = 2;
      while (seen.has(id)) {
        id = normalizePackId(`${baseId}_${suffix}`);
        suffix += 1;
      }
      seen.add(id);

      const name = cleanText(pack?.name || `Свой пак ${index + 1}`, CUSTOM_PACK_NAME_LIMIT) || `Свой пак ${index + 1}`;
      const prompts = safeArray(pack?.prompts)
        .map((line) => cleanText(line, PROMPT_MAX_LENGTH))
        .filter(Boolean)
        .slice(0, CUSTOM_PROMPTS_PER_PACK_LIMIT);

      return prompts.length ? { id, name, prompts } : null;
    })
    .filter(Boolean);
}

function getCustomPromptPack(room, packName = "") {
  const match = String(packName || "").match(/^custom:([a-z0-9_-]+)$/i);
  if (!match) return null;
  const id = normalizePackId(match[1]);
  return safeArray(room?.settings?.customPromptPacks).find((pack) => pack.id === id) || null;
}

function getPromptPackList(packName = "mixed", room = null) {
  const customPack = getCustomPromptPack(room, packName);
  const customPrompts = safeArray(room?.settings?.customPromptPacks).flatMap((pack) => safeArray(pack.prompts));
  if (customPack) return customPack.prompts;
  if (packName === "customOnly") return customPrompts;
  if (packName && packName !== "mixed" && PROMPT_PACKS[packName]) return PROMPT_PACKS[packName];
  return [
    ...Object.values(PROMPT_PACKS).flat(),
    ...customPrompts
  ];
}

function getPlayerPromptPackList(packName = "mixed", room = null) {
  const customPack = getCustomPromptPack(room, packName);
  if (customPack || packName === "customOnly") return [];
  if (packName && packName !== "mixed" && PLAYER_PROMPT_PACKS[packName]) return PLAYER_PROMPT_PACKS[packName];
  return Object.values(PLAYER_PROMPT_PACKS).flat();
}

function pickBySeed(items, seed = 0) {
  if (!items.length) return null;
  const safeSeed = Math.abs(Math.floor(Number(seed) || 0));
  return items[safeSeed % items.length];
}

function promptName(player, fallback = "кто-то из лобби") {
  if (!player) return fallback;
  return cleanText(player.name, 28) || fallback;
}

function renderPlayerPromptTemplate(template, room, seed = 0, options = {}) {
  const players = room?.players ? getConnectedPlayers(room) : [];
  if (!players.length) return String(template || "");

  const focusPlayer = options.playerId ? getPlayer(room, options.playerId) : null;
  const first = focusPlayer || pickBySeed(players, seed) || players[0];
  const withoutFirst = players.filter((player) => player.id !== first.id);
  const second = pickBySeed(withoutFirst, seed + 7) || first;
  const withoutFirstSecond = players.filter((player) => player.id !== first.id && player.id !== second.id);
  const third = pickBySeed(withoutFirstSecond, seed + 13) || second || first;
  const host = getPlayer(room, room?.hostId) || players[0];

  const values = {
    player: promptName(first),
    random: promptName(first),
    me: promptName(focusPlayer || first),
    player2: promptName(second),
    another: promptName(second),
    player3: promptName(third),
    host: promptName(host, "хост")
  };

  return String(template || "").replace(/\{\{\s*(player|player2|player3|random|another|me|host)\s*\}\}/gi, (_, key) => {
    return values[String(key).toLowerCase()] || "кто-то из лобби";
  });
}


const GAME_MODES = {
  classic_pairs: {
    id: "classic_pairs",
    title: "Классика связок",
    shortTitle: "Классика",
    description: "Игроки пишут начала, затем каждый добивает чужую фразу.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true
  },
  shared_prompt: {
    id: "shared_prompt",
    title: "Одна фраза на всех",
    shortTitle: "Одна фраза",
    description: "Каждый пишет начало, потом каждое начало становится раундом для всех.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true
  },
  duel_tournament: {
    id: "duel_tournament",
    title: "Дуэльный турнир",
    shortTitle: "Дуэль",
    description: "Игроки проходят сетку дуэлей и трио-боёв до финала.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true
  },
  guess_author: {
    id: "guess_author",
    title: "Угадай автора",
    shortTitle: "Угадай автора",
    description: "Сначала угадываем авторов шуток, потом голосуем за лучшие.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true
  },
  chaos_chain: {
    id: "chaos_chain",
    title: "Цепочка хаоса",
    shortTitle: "Цепочка",
    description: "Каждый продолжает историю, видя только предыдущий кусок.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true
  },
  story_chain: {
    id: "story_chain",
    title: "Шутка с продолжением",
    shortTitle: "История",
    description: "История собирается по частям, все видят предыдущий контекст.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true
  }
};

function normalizeGameMode(value) {
  const id = String(value || "classic_pairs");
  return GAME_MODES[id] ? id : "classic_pairs";
}

function getGameMode(roomOrMode) {
  const id = typeof roomOrMode === "string" ? roomOrMode : roomOrMode?.gameMode;
  return GAME_MODES[normalizeGameMode(id)] || GAME_MODES.classic_pairs;
}

const rooms = {};
const PROMPT_MAX_LENGTH = 160;
const ANSWER_MAX_LENGTH = 180;
const AUDIO_MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
  "audio/x-m4a",
  "audio/flac",
  "audio/x-flac",
  "video/webm",
  "video/mp4",
  "application/ogg"
]);
const RECONNECT_GRACE_MS = 6000;

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(number)));
}

function cleanText(value, maxLength = 220) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function estimateBase64Bytes(base64) {
  const clean = String(base64 || "").replace(/=+$/, "");
  return Math.floor((clean.length * 3) / 4);
}

function cleanAudio(raw) {
  if (!raw) return { audio: null };

  const name = cleanText(raw.name, 120) || "voice.webm";
  const type = String(raw.type || "audio/webm").toLowerCase().split(";")[0];
  const dataUrl = String(raw.dataUrl || "");
  const match = dataUrl.match(/^data:([^;,]+);base64,([a-zA-Z0-9+/=]+)$/);

  if (!match) return { error: COPY.errors.audioUnsupported };

  const dataType = match[1].toLowerCase();
  const base64 = match[2];
  const bytes = Math.max(Number(raw.size) || 0, estimateBase64Bytes(base64));

  const allowedByName = /\.(mp3|wav|ogg|webm|m4a|aac|flac)$/i.test(name);
  const allowedContainerType = ["video/webm", "video/mp4", "application/ogg"].includes(type);
  const allowedContainerDataType = ["video/webm", "video/mp4", "application/ogg"].includes(dataType);
  const allowedByType =
    ALLOWED_AUDIO_TYPES.has(type) ||
    ALLOWED_AUDIO_TYPES.has(dataType) ||
    type.startsWith("audio/") ||
    dataType.startsWith("audio/") ||
    ((allowedContainerType || allowedContainerDataType) && allowedByName);

  if (!allowedByType && !allowedByName) return { error: COPY.errors.audioUnsupported };
  if (bytes > AUDIO_MAX_BYTES) return { error: COPY.errors.audioTooLarge };

  const rawSource = String(raw.source || "").toLowerCase();
  const inferredSource = rawSource === "recorded" || rawSource === "uploaded"
    ? rawSource
    : (/^voice-/.test(name) ? "recorded" : "uploaded");
  const durationMs = Math.max(0, Math.min(60 * 60 * 1000, Number(raw.durationMs) || 0));

  return {
    audio: {
      id: cleanText(raw.id, 80) || makeId("audio"),
      name,
      type: ALLOWED_AUDIO_TYPES.has(type) || type.startsWith("audio/") ? type : dataType,
      size: bytes,
      durationMs,
      source: inferredSource,
      dataUrl
    }
  };
}


function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getStageElapsedMs(room) {
  if (!room?.stageStartedAt) return 0;
  return Math.max(0, Date.now() - room.stageStartedAt);
}

function setRoomStage(room, state) {
  room.state = state;
  room.stageStartedAt = Date.now();
}

function logEvent(room, type, playerId = null, payload = {}) {
  if (!room) return null;
  if (!Array.isArray(room.events)) room.events = [];
  const event = {
    id: makeId("event"),
    type,
    playerId,
    round: room.round,
    state: room.state,
    createdAt: Date.now(),
    elapsedMs: getStageElapsedMs(room),
    payload
  };
  room.events.push(event);
  if (room.events.length > 2000) room.events.splice(0, room.events.length - 2000);
  return event;
}

function getPlayer(room, playerId) {
  return room?.players.find((player) => player.id === playerId) || null;
}

function incrementPlayerStat(room, playerId, key, amount = 1) {
  const player = getPlayer(room, playerId);
  if (!player) return;
  if (!player.stats) player.stats = {};
  player.stats[key] = (Number(player.stats[key]) || 0) + amount;
}

function textEditDistance(a = "", b = "") {
  const left = String(a || "");
  const right = String(b || "");
  const m = left.length;
  const n = right.length;
  if (!m) return n;
  if (!n) return m;
  const prev = Array.from({ length: n + 1 }, (_, index) => index);
  const curr = Array(n + 1).fill(0);
  for (let i = 1; i <= m; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= n; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j += 1) prev[j] = curr[j];
  }
  return prev[n];
}

function classifyTextChange(previousText = "", nextText = "") {
  const before = String(previousText || "");
  const after = String(nextText || "");
  const distance = textEditDistance(before, after);
  const base = Math.max(before.length, after.length, 1);
  const changeRatio = distance / base;
  let type = "initial";
  if (before) {
    if (changeRatio < 0.15) type = "minor_edit";
    else if (changeRatio < 0.45) type = "edit";
    else if (changeRatio < 0.75) type = "rewrite";
    else type = "full_rewrite";
  }
  return {
    type,
    editDistance: distance,
    changeRatio,
    beforeLength: before.length,
    afterLength: after.length,
    lengthDelta: after.length - before.length
  };
}

function audioSignature(audio) {
  if (!audio) return "none";
  return `${audio.name || "audio"}:${audio.size || 0}:${audio.type || ""}:${audio.durationMs || 0}`;
}

function classifyAudioChange(previousAudio, nextAudio) {
  if (!previousAudio && !nextAudio) return { action: "none", durationDelta: 0, sourceChanged: false };
  if (!previousAudio && nextAudio) return { action: "added", durationDelta: Number(nextAudio.durationMs) || 0, sourceChanged: false };
  if (previousAudio && !nextAudio) return { action: "removed", durationDelta: -(Number(previousAudio.durationMs) || 0), sourceChanged: false };
  const sourceChanged = previousAudio.source !== nextAudio.source;
  const durationDelta = (Number(nextAudio.durationMs) || 0) - (Number(previousAudio.durationMs) || 0);
  const same = audioSignature(previousAudio) === audioSignature(nextAudio);
  if (same) return { action: "none", durationDelta: 0, sourceChanged: false };
  if (previousAudio.source === "recorded" && nextAudio.source === "recorded") return { action: "rerecorded", durationDelta, sourceChanged };
  return { action: "replaced", durationDelta, sourceChanged };
}

function makeSubmissionVersion({ room, item, text, audio, source = "manual" }) {
  const previous = item ? safeArray(item.versions).at(-1) : null;
  const previousText = previous?.text ?? item?.text ?? "";
  const previousAudio = previous?.audio ?? item?.audio ?? null;
  const textChange = classifyTextChange(previousText, text);
  const audioChange = classifyAudioChange(previousAudio, audio);
  return {
    version: previous ? previous.version + 1 : 1,
    text,
    textLength: String(text || "").length,
    audio: audio || null,
    audioMeta: audio ? {
      id: audio.id,
      name: audio.name,
      type: audio.type,
      size: audio.size,
      durationMs: audio.durationMs || 0,
      source: audio.source || "uploaded"
    } : null,
    source: audio?.source || source,
    createdAt: Date.now(),
    elapsedMs: getStageElapsedMs(room),
    change: {
      ...textChange,
      audioAction: audioChange.action,
      audioDurationDelta: audioChange.durationDelta,
      audioSourceChanged: audioChange.sourceChanged
    }
  };
}

function applySubmissionStats(room, playerId, version, kind, isUpdate) {
  if (kind === "prompt") incrementPlayerStat(room, playerId, isUpdate ? "promptUpdates" : "promptsSubmitted");
  if (kind === "answer") incrementPlayerStat(room, playerId, isUpdate ? "answerUpdates" : "answersSubmitted");
  if (isUpdate) incrementPlayerStat(room, playerId, "textEdits");
  if (version.change.type === "minor_edit") incrementPlayerStat(room, playerId, "minorEdits");
  if (["rewrite", "full_rewrite"].includes(version.change.type)) incrementPlayerStat(room, playerId, "majorRewrites");
  if (version.audioMeta?.source === "recorded") incrementPlayerStat(room, playerId, "audioRecorded");
  if (version.audioMeta?.source === "uploaded") incrementPlayerStat(room, playerId, "audioUploaded");
  const audioAction = version.change.audioAction;
  if (audioAction === "added") incrementPlayerStat(room, playerId, "audioAdded");
  if (audioAction === "removed") incrementPlayerStat(room, playerId, "audioRemoved");
  if (audioAction === "replaced") incrementPlayerStat(room, playerId, "audioReplaced");
  if (audioAction === "rerecorded") incrementPlayerStat(room, playerId, "audioRerecorded");
}

function snapshotSubmission(item) {
  return {
    id: item.id,
    authorId: item.authorId,
    text: item.text || "",
    audio: item.audio || null,
    versions: safeArray(item.versions).map((version) => ({
      version: version.version,
      textLength: version.textLength,
      source: version.source,
      elapsedMs: version.elapsedMs,
      change: version.change,
      audioMeta: version.audioMeta
    }))
  };
}

function denseRank(items, valueGetter) {
  let lastValue = null;
  let place = 0;
  return [...items].sort((a, b) => valueGetter(b) - valueGetter(a)).map((item) => {
    const value = valueGetter(item);
    if (lastValue === null || value !== lastValue) {
      place += 1;
      lastValue = value;
    }
    return { ...item, place };
  });
}

function formatScoreWord(score) {
  const value = Math.abs(Number(score) || 0) % 100;
  const last = value % 10;
  if (value >= 11 && value <= 14) return "очков";
  if (last === 1) return "очко";
  if (last >= 2 && last <= 4) return "очка";
  return "очков";
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

function pickAutoPrompt(index = 0, room = null, options = {}) {
  const packName = room?.settings?.promptPack || "mixed";
  const staticPack = getPromptPackList(packName, room);
  const playerPack = room ? getPlayerPromptPackList(packName, room) : [];
  const connectedPlayers = room ? getConnectedPlayers(room) : [];

  // Если в лобби есть игроки, даём динамическим шаблонам больший вес:
  // так банк начал чаще использует реальные ники, но обычные заготовки тоже остаются.
  const merged = connectedPlayers.length > 0
    ? [...playerPack, ...playerPack, ...staticPack, ...COPY.autoPrompts]
    : [...staticPack, ...COPY.autoPrompts];

  const safeMerged = merged.length ? merged : COPY.autoPrompts;
  const template = safeMerged[Math.abs(Math.floor(Number(index) || 0)) % safeMerged.length];
  return cleanText(renderPlayerPromptTemplate(template, room, index, options), PROMPT_MAX_LENGTH);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function validateNormalizedSettings(normalized) {
  const promptPack = normalized?.settings?.promptPack;
  const customPromptPacks = safeArray(normalized?.settings?.customPromptPacks);
  if (promptPack === "customOnly" && !customPromptPacks.length) {
    return "Для режима «Только свой пак» нужно создать хотя бы один свой пак или выбрать другой пак.";
  }
  return null;
}

function getConnectedParticipants(room) {
  return safeArray(room.players).filter((player) => player.connected);
}

function getConnectedPlayers(room) {
  return safeArray(room.players).filter((player) => player.connected && player.role !== "spectator" && !player.banned);
}

function getRoomPlayer(room, playerId) {
  return safeArray(room.players).find((player) => player.id === playerId);
}

function roomHasBan(room, sessionId) {
  return safeArray(room.bannedSessionIds).includes(sessionId);
}

function getConnectedSpectators(room) {
  return safeArray(room.spectators).filter((spectator) => spectator.connected);
}

function normalizeSettings(raw = {}) {
  const customPromptPacks = sanitizeCustomPromptPacks(raw.customPromptPacks);
  const rawPackName = String(raw.promptPack || "mixed");
  const customPackId = rawPackName.match(/^custom:([a-z0-9_-]+)$/i)?.[1];
  const hasCustomPack = customPackId && customPromptPacks.some((pack) => pack.id === normalizePackId(customPackId));
  const promptPack = PROMPT_PACKS[rawPackName] || rawPackName === "mixed" || rawPackName === "customOnly" || hasCustomPack ? rawPackName : "mixed";

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
      promptMode: raw.promptMode === "auto" || raw.promptMode === "mixed" ? raw.promptMode : "manual",
      promptPack,
      customPromptPacks,
      spectatorMode: raw.spectatorMode === false ? false : true,
      spectatorVoting: ["off", "reactions", "grandFinalOnly"].includes(raw.spectatorVoting) ? raw.spectatorVoting : "off",
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
    role: "player",
    roleLocked: false,
    banned: false,
    totalVotesReceived: 0,
    bestSingleRoundVotes: 0,
    stats: {
      promptsSubmitted: 0,
      answersSubmitted: 0,
      votesGiven: 0,
      missedPrompts: 0,
      missedAnswers: 0,
      missedVotes: 0,
      disconnects: 0,
      leaves: 0,
      reconnects: 0,
      textEdits: 0,
      majorRewrites: 0,
      minorEdits: 0,
      audioAdded: 0,
      audioRemoved: 0,
      audioReplaced: 0,
      audioRerecorded: 0,
      audioUploaded: 0,
      audioRecorded: 0
    }
  };
}

function publicRoom(room) {
  const { timerHandle, emptyDeleteTimer, events, jokeArchive, ...safeRoom } = room;
  return {
    ...safeRoom,
    serverNow: Date.now(),
    players: room.players.map(({ socketId, disconnectTimer, ...player }) => player),
    spectators: safeArray(room.spectators).map(({ socketId, ...spectator }) => spectator)
  };
}

function emitRoom(room) {
  io.to(room.code).emit("roomUpdate", publicRoom(room));
}

function getOpenRooms() {
  return Object.values(rooms)
    .filter((room) => room.state === "waiting" && room.settings.publicLobby)
    .map((room) => {
      const playersCount = getConnectedPlayers(room).length;
      const maxPlayers = room.settings.maxPlayers;
      const mode = getGameMode(room);
      return {
        code: room.code,
        hostName: getPlayerName(room, room.hostId),
        playersCount,
        spectatorsCount: getConnectedSpectators(room).length,
        maxPlayers,
        isFull: playersCount >= maxPlayers,
        occupancy: maxPlayers ? playersCount / maxPlayers : 0,
        maxRounds: room.maxRounds,
        promptMode: room.settings.promptMode,
        gameMode: mode.id,
        gameModeTitle: mode.title,
        sharedRounds: room.sharedPromptQueue?.length || 0
      };
    })
    .sort((a, b) => {
      if (a.isFull !== b.isFull) return a.isFull ? 1 : -1;
      if (b.occupancy !== a.occupancy) return b.occupancy - a.occupancy;
      return a.code.localeCompare(b.code);
    });
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
  if (getConnectedParticipants(room).length > 0 || room.emptyDeleteTimer) return;

  room.emptyDeleteTimer = setTimeout(() => {
    const latest = rooms[room.code];
    if (latest && getConnectedParticipants(latest).length === 0) {
      clearRoomTimer(latest);
      delete rooms[room.code];
      emitOpenRooms();
    }
  }, 15 * 60 * 1000);
}

function assignNewHostIfNeeded(room, leavingPlayerId = null) {
  if (room.hostId !== leavingPlayerId) return null;

  const newHost = getConnectedParticipants(room).find((item) => !item.banned);
  if (newHost) {
    room.hostId = newHost.id;
    return newHost;
  }

  return null;
}

function maybeAdvanceAfterPlayerLeave(room) {
  const connectedPlayers = getConnectedPlayers(room);
  if (connectedPlayers.length === 0) return;

  if (room.state === "collectingSharedPrompts" && connectedPlayers.every((player) => {
    return room.prompts.some((prompt) => prompt.authorId === player.id);
  })) {
    finalizeSharedPromptCollection(room);
    return;
  }

  if (room.state === "prompting" && getExpectedPromptAuthors(room).every((player) => {
    return room.prompts.some((prompt) => prompt.authorId === player.id);
  })) {
    moveToAnswering(room);
    return;
  }

  if (room.state === "answering" && getExpectedAnswerers(room).every((player) => {
    return room.answers.some((answer) => answer.authorId === player.id);
  })) {
    moveToRevealing(room);
    return;
  }

  if (room.state === "guessing" && connectedPlayers.every((player) => {
    return room.guesses.some((guess) => guess.playerId === player.id);
  })) {
    finishGuessing(room);
    return;
  }

  if (room.state === "voting" && getExpectedVoters(room).every((player) => {
    return room.votes.some((vote) => vote.voterId === player.id);
  })) {
    finishVoting(room);
  }
}

function leaveRoom(socket, notifySelf = true) {
  const room = rooms[socket.data.roomCode];
  const playerId = socket.data.playerId;
  const spectatorId = socket.data.spectatorId;
  if (room && spectatorId && !playerId) {
    room.spectators = safeArray(room.spectators).filter((item) => item.id !== spectatorId);
    socket.leave(room.code);
    socket.data.roomCode = null;
    socket.data.spectatorId = null;
    if (notifySelf) socket.emit("leftRoom");
    emitRoom(room);
    return;
  }
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
    incrementPlayerStat(room, playerId, "leaves");
    logEvent(room, "leave", playerId, {});
    socket.emit("leftRoom");
  }

  if (room.players.length === 0 || getConnectedParticipants(room).length === 0) {
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
  room.assignmentMeta = {};
  room.answers = [];
  room.votes = [];
  room.guesses = [];
  room.guessResults = [];
  room.lastRoundResults = [];
  room.lastBestJoke = null;
  room.lastBestJokes = [];
  room.lastRoundTie = null;
  room.titles = [];
  clearRoomTimer(room);
}

function resetChaosData(room) {
  room.chaosChains = [];
  room.chaosStep = 1;
  room.chaosTotalSteps = 0;
  room.chaosActive = false;
}

function resetDuelData(room) {
  room.duel = {
    active: false,
    stage: 0,
    stageName: "",
    stageParticipants: [],
    battles: [],
    currentBattleIndex: 0,
    currentBattle: null,
    stageWinners: [],
    completedBattles: [],
    championId: null,
    complete: false
  };
}

function makeAutoChaosPrompt(room, player = null, index = 0) {
  const text = pickAutoPrompt(room.round + index + Date.now(), room, { playerId: player?.id || null });
  return {
    id: makeId("prompt"),
    round: room.round,
    authorId: player?.id || null,
    text,
    audio: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    submittedAtMs: 0,
    versions: [{
      version: 1,
      text,
      textLength: text.length,
      audio: null,
      audioMeta: null,
      source: "auto",
      createdAt: Date.now(),
      elapsedMs: 0,
      change: { type: "auto_fallback", editDistance: 0, changeRatio: 0, beforeLength: 0, afterLength: text.length, lengthDelta: text.length, audioAction: "none", audioDurationDelta: 0, audioSourceChanged: false }
    }]
  };
}

function fillMissingChaosPrompts(room) {
  const submitted = new Set(room.prompts.map((prompt) => prompt.authorId).filter(Boolean));
  const players = getConnectedPlayers(room);
  players.forEach((player, index) => {
    if (!submitted.has(player.id)) {
      incrementPlayerStat(room, player.id, "missedPrompts");
      logEvent(room, "miss_chaos_start", player.id, { fallback: "auto_chaos_start" });
      room.prompts.push(makeAutoChaosPrompt(room, player, index));
    }
  });
  if (!room.prompts.length) {
    room.prompts.push(makeAutoChaosPrompt(room, players[0] || null, 0));
  }
}

function segmentFromSubmission(item, step, chainId) {
  return {
    id: item.id || makeId("segment"),
    chainId,
    step,
    authorId: item.authorId || null,
    text: item.text || "",
    audio: item.audio || null,
    createdAt: item.createdAt || Date.now(),
    submittedAtMs: item.submittedAtMs || 0,
    snapshot: snapshotSubmission(item)
  };
}

function startChaosOpening(room) {
  resetRoundData(room);
  resetChaosData(room);
  room.round = 1;
  room.maxRounds = 1;
  room.chaosStep = 1;
  room.chaosActive = true;
  setRoomStage(room, "prompting");
  setStageTimer(room, room.timers.promptSeconds, () => expirePrompting(room.code));
  emitRoom(room);
}

function startChaosFromPrompts(room) {
  clearRoomTimer(room);
  fillMissingChaosPrompts(room);
  const players = getConnectedPlayers(room);
  const prompts = safeArray(room.prompts).filter((prompt) => prompt.text || prompt.audio);
  const participantCount = players.length || prompts.length || 2;
  const totalSteps = isStoryChainMode(room)
    ? Math.min(5, Math.max(3, participantCount))
    : (participantCount <= 3 ? 2 : 3);
  room.chaosTotalSteps = totalSteps;
  room.chaosStep = 2;
  room.chaosActive = true;
  room.chaosChains = prompts.map((prompt, index) => ({
    id: makeId("chain"),
    originPromptId: prompt.id,
    originAuthorId: prompt.authorId || null,
    index,
    segments: [segmentFromSubmission(prompt, 1, null)]
  }));
  room.chaosChains.forEach((chain) => {
    chain.segments[0].chainId = chain.id;
  });
  logEvent(room, "chaos_chain_start", null, { chains: room.chaosChains.length, totalSteps });
  startChaosWritingStep(room);
}

function startChaosWritingStep(room) {
  const players = getConnectedPlayers(room);
  const chains = safeArray(room.chaosChains);
  const storyMode = isStoryChainMode(room);
  room.prompts = [];
  room.answers = [];
  room.votes = [];
  room.assignments = {};
  room.assignmentMeta = {};
  if (!players.length || !chains.length) {
    startChaosReveal(room);
    return;
  }

  const offset = Math.max(1, (room.chaosStep || 2) - 1);
  players.forEach((player, index) => {
    const chain = chains[(index + offset) % chains.length] || chains[index % chains.length];
    const previous = safeArray(chain.segments).at(-1);
    if (!chain || !previous) return;
    const prompt = {
      id: makeId(storyMode ? "story-prompt" : "chaos-prompt"),
      round: room.round,
      authorId: previous.authorId || null,
      text: storyMode ? chainStoryText(chain) : (previous.text || ""),
      audio: storyMode ? null : (previous.audio || null),
      chainId: chain.id,
      previousSegmentId: previous.id,
      chainPreviewSegments: storyMode ? safeArray(chain.segments) : [previous],
      versions: []
    };
    room.prompts.push(prompt);
    room.assignments[player.id] = prompt.id;
    room.assignmentMeta[player.id] = {
      chaos: true,
      chainId: chain.id,
      step: room.chaosStep,
      previousSegmentId: previous.id
    };
  });

  logEvent(room, "chaos_chain_step", null, { step: room.chaosStep, totalSteps: room.chaosTotalSteps });
  setRoomStage(room, "answering");
  setStageTimer(room, room.timers.answerSeconds, () => expireAnswering(room.code));
  emitRoom(room);
}

function completeChaosStep(room) {
  clearRoomTimer(room);
  fillMissingAnswers(room);
  safeArray(room.answers).forEach((answer) => {
    const meta = room.assignmentMeta?.[answer.authorId];
    const chain = safeArray(room.chaosChains).find((item) => item.id === meta?.chainId);
    if (!chain) return;
    chain.segments.push(segmentFromSubmission(answer, meta.step || room.chaosStep || 2, chain.id));
  });

  if ((room.chaosStep || 2) >= (room.chaosTotalSteps || 2)) {
    startChaosReveal(room);
    return;
  }

  room.chaosStep += 1;
  startChaosWritingStep(room);
}

function chainStoryText(chain) {
  return safeArray(chain.segments)
    .map((segment, index) => `${index + 1}. ${segment.text || (segment.audio ? "[голосовой кусок]" : "...")}`)
    .join("\n");
}

function startChaosReveal(room) {
  clearRoomTimer(room);
  const chains = safeArray(room.chaosChains).filter((chain) => safeArray(chain.segments).length);
  if (!chains.length) {
    finishGame(room);
    return;
  }

  room.prompts = [];
  room.answers = [];
  room.assignments = {};
  room.assignmentMeta = {};
  room.votes = [];

  chains.forEach((chain, index) => {
    const segments = safeArray(chain.segments);
    const first = segments[0];
    const rest = segments.slice(1);
    const prompt = {
      id: first.id || makeId("prompt"),
      round: room.round,
      authorId: first.authorId || null,
      text: first.text || "",
      audio: first.audio || null,
      chainId: chain.id,
      versions: first.snapshot?.versions || []
    };
    const finalAuthor = rest.at(-1)?.authorId || first.authorId || null;
    const answer = {
      id: makeId("answer"),
      round: room.round,
      promptId: prompt.id,
      authorId: finalAuthor,
      text: rest.map((segment) => segment.text || (segment.audio ? "[голосовой кусок]" : "...")).join("\n"),
      audio: rest.find((segment) => segment.audio)?.audio || null,
      chainId: chain.id,
      chainSegments: segments,
      storyText: chainStoryText(chain),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      submittedAtMs: 0,
      versions: [{
        version: 1,
        text: chainStoryText(chain),
        textLength: chainStoryText(chain).length,
        audio: null,
        audioMeta: null,
        source: "chaos_chain",
        createdAt: Date.now(),
        elapsedMs: getStageElapsedMs(room),
        change: { type: "chain_complete", editDistance: 0, changeRatio: 0, beforeLength: 0, afterLength: chainStoryText(chain).length, lengthDelta: chainStoryText(chain).length, audioAction: "none", audioDurationDelta: 0, audioSourceChanged: false }
      }]
    };
    room.prompts.push(prompt);
    room.answers.push(answer);
  });

  setRoomStage(room, "revealing");
  room.timerEndsAt = null;
  emitRoom(room);
}


function shuffleItems(items) {
  const result = [...safeArray(items)];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function isSharedPromptMode(room) {
  return normalizeGameMode(room?.gameMode) === "shared_prompt";
}

function isChaosChainMode(room) {
  return normalizeGameMode(room?.gameMode) === "chaos_chain";
}

function isStoryChainMode(room) {
  return normalizeGameMode(room?.gameMode) === "story_chain";
}

function isGuessAuthorMode(room) {
  return normalizeGameMode(room?.gameMode) === "guess_author";
}

function isDuelTournamentMode(room) {
  return normalizeGameMode(room?.gameMode) === "duel_tournament";
}

function isChainStoryMode(room) {
  return isChaosChainMode(room) || isStoryChainMode(room);
}

function makeAutoSharedPrompt(room, player = null, index = 0) {
  const text = pickAutoPrompt(room.round + index + Date.now(), room, { playerId: player?.id || null });
  return {
    id: makeId("prompt"),
    round: room.round,
    authorId: player?.id || null,
    text,
    audio: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    submittedAtMs: 0,
    versions: [{
      version: 1,
      text,
      textLength: text.length,
      audio: null,
      audioMeta: null,
      source: "auto",
      createdAt: Date.now(),
      elapsedMs: 0,
      change: { type: "auto_fallback", editDistance: 0, changeRatio: 0, beforeLength: 0, afterLength: text.length, lengthDelta: text.length, audioAction: "none", audioDurationDelta: 0, audioSourceChanged: false }
    }]
  };
}

function buildAutoSharedPromptQueue(room) {
  const players = getConnectedPlayers(room);
  const count = Math.max(1, players.length);
  return Array.from({ length: count }, (_, index) => makeAutoSharedPrompt(room, players[index] || null, index));
}

function startCollectingSharedPrompts(room) {
  resetRoundData(room);
  room.round = 1;
  room.sharedPromptQueue = [];
  room.currentSharedPromptIndex = 0;
  room.sharedPromptCollectionComplete = false;
  setRoomStage(room, "collectingSharedPrompts");
  setStageTimer(room, room.timers.promptSeconds, () => expireSharedPromptCollection(room.code));
  emitRoom(room);
}

function finalizeSharedPromptCollection(room) {
  clearRoomTimer(room);
  if (!isSharedPromptMode(room)) return startRound(room);

  let queue = safeArray(room.prompts).filter((prompt) => prompt.text || prompt.audio);
  if (!queue.length) {
    // Чтобы игра не зависла, если никто не отправил начало, берём одно автоначало из выбранного пака.
    queue = [makeAutoSharedPrompt(room, getConnectedPlayers(room)[0] || null, 0)];
  }

  room.sharedPromptQueue = shuffleItems(queue).map((prompt, index) => ({
    ...prompt,
    queueIndex: index,
    originalRound: prompt.round || 1
  }));
  room.maxRounds = room.sharedPromptQueue.length;
  room.currentSharedPromptIndex = 0;
  room.sharedPromptCollectionComplete = true;
  room.round = 1;
  startSharedPromptRound(room);
}

function expireSharedPromptCollection(code) {
  const room = rooms[code];
  if (!room || room.state !== "collectingSharedPrompts") return;
  finalizeSharedPromptCollection(room);
}

function startSharedPromptRound(room) {
  resetRoundData(room);
  const queue = safeArray(room.sharedPromptQueue);
  const prompt = queue[room.currentSharedPromptIndex];
  if (!prompt) {
    startGrandVoting(room);
    return;
  }

  const roundPrompt = {
    ...prompt,
    round: room.round,
    id: prompt.id || makeId("prompt")
  };

  room.prompts = [roundPrompt];
  room.sharedPrompt = roundPrompt.id;
  room.assignments = {};
  getConnectedPlayers(room).forEach((player) => {
    room.assignments[player.id] = roundPrompt.id;
  });

  logEvent(room, "shared_prompt_round_start", roundPrompt.authorId, {
    promptId: roundPrompt.id,
    queueIndex: room.currentSharedPromptIndex,
    round: room.round
  });

  setRoomStage(room, "answering");
  setStageTimer(room, room.timers.answerSeconds, () => expireAnswering(room.code));
  emitRoom(room);
}


function getDuelBattle(room) {
  return isDuelTournamentMode(room) ? room?.duel?.currentBattle : null;
}

function getDuelParticipantIds(room) {
  return new Set(safeArray(getDuelBattle(room)?.participantIds));
}

function getDuelPromptAuthors(room) {
  const participants = getDuelParticipantIds(room);
  return getConnectedPlayers(room).filter((player) => !participants.has(player.id));
}

function getExpectedAnswerers(room) {
  if (isDuelTournamentMode(room) && getDuelBattle(room)) {
    const participants = getDuelParticipantIds(room);
    return getConnectedPlayers(room).filter((player) => participants.has(player.id) && room.assignments[player.id]);
  }
  return getConnectedPlayers(room).filter((player) => !room.assignments || room.assignments[player.id]);
}

function getExpectedVoters(room) {
  const players = getConnectedPlayers(room);
  if (isDuelTournamentMode(room) && getDuelBattle(room)) {
    const participants = getDuelParticipantIds(room);
    const judges = players.filter((player) => !participants.has(player.id));
    return judges.length ? judges : players;
  }
  return players.filter((player) => {
    if (isChainStoryMode(room)) return true;
    return !room.answers.every((answerItem) => answerItem.authorId === player.id);
  });
}

function canVoteInCurrentRound(room, playerId) {
  if (isDuelTournamentMode(room) && getDuelBattle(room)) {
    const expected = getExpectedVoters(room).map((player) => player.id);
    return expected.includes(playerId);
  }
  return true;
}

function duelStageName(count) {
  if (count <= 3) return "Финал";
  if (count <= 6) return "Полуфинал";
  if (count <= 12) return "Отбор";
  return "Турнир";
}

function makeDuelBattles(participantIds, stage) {
  const ids = shuffleItems(participantIds);
  const battles = [];
  if (ids.length <= 3) {
    battles.push({ id: makeId("battle"), stage, index: 0, type: ids.length === 3 ? "trio" : "duel", participantIds: ids, result: null });
    return battles;
  }
  let cursor = 0;
  if (ids.length % 2 === 1) {
    battles.push({ id: makeId("battle"), stage, index: battles.length, type: "trio", participantIds: ids.slice(0, 3), result: null });
    cursor = 3;
  }
  for (let index = cursor; index < ids.length; index += 2) {
    battles.push({ id: makeId("battle"), stage, index: battles.length, type: "duel", participantIds: ids.slice(index, index + 2), result: null });
  }
  return battles;
}

function prepareDuelStage(room, participantIds) {
  if (!room.duel) resetDuelData(room);
  room.duel.stage += 1;
  room.duel.stageParticipants = [...participantIds];
  room.duel.stageName = duelStageName(participantIds.length);
  room.duel.battles = makeDuelBattles(participantIds, room.duel.stage);
  room.duel.currentBattleIndex = 0;
  room.duel.currentBattle = null;
  room.duel.stageWinners = [];
}

function duelBattleLabel(room, battle = getDuelBattle(room)) {
  if (!battle) return "Дуэльный турнир";
  const names = safeArray(battle.participantIds).map((id) => getPlayerName(room, id)).join(" vs ");
  return `${room.duel?.stageName || "Бой"} · ${names}`;
}

function makeAutoDuelPrompt(room, battle = getDuelBattle(room)) {
  const focusId = safeArray(battle?.participantIds)[0] || null;
  const text = pickAutoPrompt(room.round + Date.now(), room, { playerId: focusId });
  return {
    id: makeId("prompt"),
    round: room.round,
    authorId: null,
    text,
    audio: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    submittedAtMs: 0,
    versions: [{
      version: 1,
      text,
      textLength: text.length,
      audio: null,
      audioMeta: null,
      source: "auto",
      createdAt: Date.now(),
      elapsedMs: 0,
      change: { type: "auto_fallback", editDistance: 0, changeRatio: 0, beforeLength: 0, afterLength: text.length, lengthDelta: text.length, audioAction: "none", audioDurationDelta: 0, audioSourceChanged: false }
    }]
  };
}

function startDuelTournament(room) {
  resetRoundData(room);
  resetChaosData(room);
  resetDuelData(room);
  room.round = 1;
  room.maxRounds = 999;
  room.duel.active = true;
  const participantIds = getConnectedPlayers(room).map((player) => player.id);
  prepareDuelStage(room, participantIds);
  logEvent(room, "duel_tournament_start", null, { players: participantIds.length });
  startCurrentDuelBattle(room);
}

function startCurrentDuelBattle(room) {
  const battle = room.duel?.battles?.[room.duel.currentBattleIndex];
  if (!battle) return completeDuelStage(room);
  resetRoundData(room);
  room.duel.currentBattle = battle;
  room.round = safeArray(room.duel.completedBattles).length + 1;
  const promptAuthors = getDuelPromptAuthors(room);
  logEvent(room, "duel_battle_start", null, { battleId: battle.id, participantIds: battle.participantIds, promptAuthors: promptAuthors.map((player) => player.id) });

  if (!promptAuthors.length || room.settings.promptMode === "auto") {
    room.prompts = [makeAutoDuelPrompt(room, battle)];
    startDuelAnswering(room);
    return;
  }

  setRoomStage(room, "prompting");
  setStageTimer(room, room.timers.promptSeconds, () => expirePrompting(room.code));
  emitRoom(room);
}

function startDuelAnswering(room) {
  clearRoomTimer(room);
  const battle = getDuelBattle(room);
  if (!battle) return completeDuelStage(room);
  const participantIds = new Set(battle.participantIds);
  const promptAuthors = getDuelPromptAuthors(room);
  const submittedAuthors = new Set(room.prompts.map((prompt) => prompt.authorId).filter(Boolean));
  promptAuthors.forEach((player) => {
    if (!submittedAuthors.has(player.id)) {
      incrementPlayerStat(room, player.id, "missedPrompts");
      logEvent(room, "miss_duel_prompt", player.id, { battleId: battle.id });
    }
  });

  let candidates = safeArray(room.prompts).filter((prompt) => !prompt.authorId || !participantIds.has(prompt.authorId));
  if (!candidates.length) candidates = [makeAutoDuelPrompt(room, battle)];
  const selected = randomItem(candidates);
  room.prompts = [{ ...selected, round: room.round, id: selected.id || makeId("prompt") }];
  const promptId = room.prompts[0].id;
  room.assignments = {};
  room.assignmentMeta = {};
  battle.participantIds.forEach((playerId) => {
    room.assignments[playerId] = promptId;
    room.assignmentMeta[playerId] = { duel: true, battleId: battle.id, participantIds: battle.participantIds };
  });
  if (selected.authorId) incrementPlayerStat(room, selected.authorId, "duelPromptsSelected");
  logEvent(room, "duel_battle_prompt_selected", selected.authorId || null, { battleId: battle.id, promptId });
  setRoomStage(room, "answering");
  setStageTimer(room, room.timers.answerSeconds, () => expireAnswering(room.code));
  emitRoom(room);
}

function settleDuelBattle(room) {
  const battle = getDuelBattle(room);
  if (!isDuelTournamentMode(room) || !battle || battle.result) return;
  const participantIds = new Set(battle.participantIds);
  const participantResults = safeArray(room.lastRoundResults).filter((result) => participantIds.has(result.answerAuthorId));
  let winnerResult = participantResults[0] || null;
  let tiedResults = [];
  if (winnerResult) {
    const bestVotes = winnerResult.votesCount || 0;
    tiedResults = participantResults.filter((result) => (result.votesCount || 0) === bestVotes);
    if (tiedResults.length > 1) {
      const bestScore = Math.max(...tiedResults.map((result) => getPlayer(room, result.answerAuthorId)?.score || 0));
      const scoreTied = tiedResults.filter((result) => (getPlayer(room, result.answerAuthorId)?.score || 0) === bestScore);
      winnerResult = randomItem(scoreTied);
    }
  }
  const winnerId = winnerResult?.answerAuthorId || battle.participantIds[0];
  const winner = getPlayer(room, winnerId);
  battle.result = {
    winnerId,
    winnerName: winner?.name || getPlayerName(room, winnerId),
    answerId: winnerResult?.answerId || null,
    votesCount: winnerResult?.votesCount || 0,
    tieResolved: tiedResults.length > 1,
    tiedPlayerIds: tiedResults.map((result) => result.answerAuthorId)
  };
  room.duel.stageWinners.push(winnerId);
  room.duel.completedBattles.push({ ...battle, result: battle.result });
  incrementPlayerStat(room, winnerId, "duelWins");
  if (room.duel.stageName === "Финал") incrementPlayerStat(room, winnerId, "duelFinalWins");
  logEvent(room, "duel_battle_finished", winnerId, { battleId: battle.id, result: battle.result });
}

function completeDuelStage(room) {
  const winners = [...new Set(safeArray(room.duel?.stageWinners))];
  if (winners.length <= 1) {
    room.duel.complete = true;
    room.duel.championId = winners[0] || room.duel.completedBattles.at(-1)?.result?.winnerId || null;
    if (room.duel.championId) incrementPlayerStat(room, room.duel.championId, "duelChampion");
    logEvent(room, "duel_tournament_finished", room.duel.championId, { championId: room.duel.championId });
    if (safeArray(room.bestJokesHistory).length >= 2) startGrandVoting(room);
    else finishGame(room);
    return;
  }
  prepareDuelStage(room, winners);
  startCurrentDuelBattle(room);
}

function advanceDuelAfterScoreboard(room) {
  settleDuelBattle(room);
  if (!room.duel || room.duel.complete) {
    if (safeArray(room.bestJokesHistory).length >= 2) startGrandVoting(room);
    else finishGame(room);
    return;
  }
  room.duel.currentBattleIndex += 1;
  if (room.duel.currentBattleIndex < room.duel.battles.length) {
    startCurrentDuelBattle(room);
  } else {
    completeDuelStage(room);
  }
}

function startRound(room) {
  if (isSharedPromptMode(room) && room.sharedPromptCollectionComplete) {
    startSharedPromptRound(room);
    return;
  }

  resetRoundData(room);

  if (room.settings.promptMode === "auto") {
    buildAssignments(room);
    setRoomStage(room, "answering");
    setStageTimer(room, room.timers.answerSeconds, () => expireAnswering(room.code));
    emitRoom(room);
    return;
  }

  setRoomStage(room, "prompting");
  setStageTimer(room, room.timers.promptSeconds, () => expirePrompting(room.code));
  emitRoom(room);
}

function startGameCountdown(room) {
  clearRoomTimer(room);
  setRoomStage(room, "starting");
  room.timerEndsAt = Date.now() + 5200;
  room.timerHandle = setTimeout(() => {
    const latest = rooms[room.code];
    if (!latest || latest.state !== "starting") return;
    if (isDuelTournamentMode(latest)) {
      startDuelTournament(latest);
    } else if (isChainStoryMode(latest)) {
      startChaosOpening(latest);
    } else if (isSharedPromptMode(latest)) {
      if (latest.settings.promptMode === "auto") {
        latest.sharedPromptQueue = buildAutoSharedPromptQueue(latest);
        latest.maxRounds = latest.sharedPromptQueue.length;
        latest.currentSharedPromptIndex = 0;
        latest.sharedPromptCollectionComplete = true;
        latest.round = 1;
        startSharedPromptRound(latest);
      } else {
        startCollectingSharedPrompts(latest);
      }
    } else {
      startRound(latest);
    }
  }, 5200);
  emitRoom(room);
}

function buildAssignments(room) {
  const players = getConnectedPlayers(room);
  room.assignments = {};
  room.assignmentMeta = {};
  if (!players.length) return;

  if (room.settings.promptMode === "auto") {
    players.forEach((player, index) => {
      const prompt = {
        id: makeId("prompt"),
        round: room.round,
        authorId: null,
        text: pickAutoPrompt(room.round + index, room, { playerId: player.id }),
        audio: null,
        versions: []
      };
      room.prompts.push(prompt);
      room.assignments[player.id] = prompt.id;
      room.assignmentMeta[player.id] = { reused: false, auto: true };
    });
    return;
  }

  if (!room.prompts.length) {
    const fallbackPrompt = {
      id: makeId("prompt"),
      round: room.round,
      authorId: null,
      text: pickAutoPrompt(room.round + Date.now(), room),
      audio: null,
      versions: []
    };
    room.prompts.push(fallbackPrompt);
  }

  const roundUsage = {};
  if (!room.assignmentHistory) room.assignmentHistory = {};

  players.forEach((player) => {
    const foreignPrompts = room.prompts.filter((prompt) => !prompt.authorId || prompt.authorId !== player.id);
    const candidates = foreignPrompts.length ? foreignPrompts : room.prompts;

    const scored = candidates.map((prompt) => {
      const usageCount = roundUsage[prompt.id] || 0;
      const pairKey = `${prompt.authorId || "auto"}->${player.id}`;
      const pairRepeats = room.assignmentHistory[pairKey] || 0;
      return {
        prompt,
        score: usageCount * 1000 + pairRepeats * 25 + Math.random()
      };
    }).sort((a, b) => a.score - b.score);

    const selected = scored[0]?.prompt;
    if (!selected) return;

    const wasReused = (roundUsage[selected.id] || 0) > 0;
    room.assignments[player.id] = selected.id;
    room.assignmentMeta[player.id] = { reused: wasReused, auto: !selected.authorId };
    roundUsage[selected.id] = (roundUsage[selected.id] || 0) + 1;

    const pairKey = `${selected.authorId || "auto"}->${player.id}`;
    room.assignmentHistory[pairKey] = (room.assignmentHistory[pairKey] || 0) + 1;
    if (wasReused) {
      logEvent(room, "prompt_reused", player.id, { promptId: selected.id, promptAuthorId: selected.authorId || null });
    }
  });
}

function fillMissingPrompts(room) {
  const submitted = new Set(room.prompts.map((prompt) => prompt.authorId).filter(Boolean));
  getConnectedPlayers(room).forEach((player) => {
    if (!submitted.has(player.id)) {
      incrementPlayerStat(room, player.id, "missedPrompts");
      logEvent(room, "miss_prompt", player.id, { fallback: room.prompts.length ? "reuse_foreign_prompt" : "auto_prompt" });
    }
  });

  if (!room.prompts.length) {
    const fallbackText = pickAutoPrompt(room.round + Date.now(), room);
    room.prompts.push({
      id: makeId("prompt"),
      round: room.round,
      authorId: null,
      text: fallbackText,
      audio: null,
      versions: [{
        version: 1,
        text: fallbackText,
        textLength: fallbackText.length,
        audio: null,
        audioMeta: null,
        source: "auto",
        createdAt: Date.now(),
        elapsedMs: getStageElapsedMs(room),
        change: { type: "auto_fallback", editDistance: 0, changeRatio: 0, beforeLength: 0, afterLength: fallbackText.length, lengthDelta: fallbackText.length, audioAction: "none", audioDurationDelta: 0, audioSourceChanged: false }
      }]
    });
  }
}

function moveToAnswering(room) {
  clearRoomTimer(room);
  if (isDuelTournamentMode(room)) {
    startDuelAnswering(room);
    return;
  }
  if (isChainStoryMode(room)) {
    startChaosFromPrompts(room);
    return;
  }
  fillMissingPrompts(room);
  buildAssignments(room);
  setRoomStage(room, "answering");
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
      incrementPlayerStat(room, player.id, "missedAnswers");
      logEvent(room, "miss_answer", player.id, { promptId: room.assignments[player.id] });
      room.answers.push({
        id: makeId("answer"),
        round: room.round,
        promptId: room.assignments[player.id],
        authorId: player.id,
        text: COPY.fallbackAnswer,
        audio: null,
        versions: [{
          version: 1,
          text: COPY.fallbackAnswer,
          textLength: COPY.fallbackAnswer.length,
          audio: null,
          audioMeta: null,
          source: "auto",
          createdAt: Date.now(),
          elapsedMs: getStageElapsedMs(room),
          change: { type: "auto_fallback", editDistance: 0, changeRatio: 0, beforeLength: 0, afterLength: COPY.fallbackAnswer.length, lengthDelta: COPY.fallbackAnswer.length, audioAction: "none", audioDurationDelta: 0, audioSourceChanged: false }
        }]
      });
    }
  });
}

function startGuessing(room) {
  room.guesses = [];
  room.guessResults = [];
  setRoomStage(room, "guessing");
  setStageTimer(room, room.timers.voteSeconds || 30, () => expireGuessing(room.code));
  emitRoom(room);
}

function normalizeGuessValue(value) {
  const clean = cleanSessionId(value);
  return clean || null;
}

function finishGuessing(room) {
  clearRoomTimer(room);
  const promptsById = new Map(safeArray(room.prompts).map((prompt) => [prompt.id, prompt]));
  const results = [];
  safeArray(room.guesses).forEach((entry) => {
    safeArray(entry.guesses).forEach((guess) => {
      const answer = safeArray(room.answers).find((item) => item.id === guess.answerId);
      if (!answer) return;
      const prompt = promptsById.get(answer.promptId);
      const correctPrompt = Boolean(prompt?.authorId && guess.promptAuthorId === prompt.authorId);
      const correctAnswer = Boolean(answer.authorId && guess.answerAuthorId === answer.authorId);
      const fullCorrect = correctPrompt && correctAnswer;
      const result = {
        round: room.round,
        answerId: answer.id,
        promptId: answer.promptId,
        guesserId: entry.playerId,
        promptAuthorId: prompt?.authorId || null,
        answerAuthorId: answer.authorId || null,
        guessedPromptAuthorId: guess.promptAuthorId || null,
        guessedAnswerAuthorId: guess.answerAuthorId || null,
        correctPrompt,
        correctAnswer,
        fullCorrect,
        createdAt: entry.createdAt || Date.now()
      };
      results.push(result);
      if (correctPrompt) incrementPlayerStat(room, entry.playerId, "correctPromptGuesses");
      if (correctAnswer) incrementPlayerStat(room, entry.playerId, "correctAnswerGuesses");
      if (fullCorrect) incrementPlayerStat(room, entry.playerId, "fullPairGuesses");
    });
  });
  room.guessResults = results;
  if (!Array.isArray(room.guessArchive)) room.guessArchive = [];
  room.guessArchive.push(...results);
  logEvent(room, "finish_guessing", null, { results: results.length });
  moveToVoting(room);
}

function expireGuessing(code) {
  const room = rooms[code];
  if (!room || room.state !== "guessing") return;
  finishGuessing(room);
}

function moveToRevealing(room) {
  clearRoomTimer(room);
  if (isChainStoryMode(room) && room.chaosActive) {
    completeChaosStep(room);
    return;
  }
  fillMissingAnswers(room);
  if (isGuessAuthorMode(room)) {
    startGuessing(room);
    return;
  }
  setRoomStage(room, "revealing");
  room.timerEndsAt = null;
  emitRoom(room);
}

function expireAnswering(code) {
  const room = rooms[code];
  if (!room || room.state !== "answering") return;
  moveToRevealing(room);
}

function moveToVoting(room) {
  setRoomStage(room, "voting");
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

function getPromptAudio(room, promptId) {
  const prompt = room.prompts.find((item) => item.id === promptId);
  return prompt?.audio || null;
}

function getPlayerName(room, playerId) {
  const player = room.players.find((item) => item.id === playerId);
  return player ? player.name : COPY.fallbackPlayer;
}

function finishVoting(room) {
  clearRoomTimer(room);

  const voters = new Set(room.votes.map((vote) => vote.voterId));
  getExpectedVoters(room).forEach((player) => {
    if (!voters.has(player.id)) {
      incrementPlayerStat(room, player.id, "missedVotes");
      logEvent(room, "miss_vote", player.id, {});
    }
  });

  const votesByAnswer = new Map();
  room.answers.forEach((answer) => votesByAnswer.set(answer.id, 0));
  room.votes.forEach((vote) => {
    votesByAnswer.set(vote.answerId, (votesByAnswer.get(vote.answerId) || 0) + 1);
  });

  room.lastRoundResults = room.answers.map((answer) => {
    const votesCount = votesByAnswer.get(answer.id) || 0;
    const author = room.players.find((player) => player.id === answer.authorId);
    const prompt = room.prompts.find((item) => item.id === answer.promptId);

    if (isChainStoryMode(room) && answer.chainSegments?.length) {
      const authors = [...new Set(answer.chainSegments.map((segment) => segment.authorId).filter(Boolean))];
      authors.forEach((authorId) => {
        const chainAuthor = room.players.find((player) => player.id === authorId);
        if (!chainAuthor) return;
        chainAuthor.score += votesCount;
        chainAuthor.totalVotesReceived += votesCount;
        chainAuthor.bestSingleRoundVotes = Math.max(chainAuthor.bestSingleRoundVotes, votesCount);
      });
    } else if (author) {
      author.score += votesCount;
      author.totalVotesReceived += votesCount;
      author.bestSingleRoundVotes = Math.max(author.bestSingleRoundVotes, votesCount);
    }

    return {
      jokeId: answer.id,
      answerId: answer.id,
      promptId: answer.promptId,
      round: room.round,
      promptText: getPromptText(room, answer.promptId),
      answerText: answer.text,
      promptAudio: getPromptAudio(room, answer.promptId),
      answerAudio: answer.audio || null,
      promptAuthorId: prompt?.authorId || null,
      promptAuthorName: prompt?.authorId ? getPlayerName(room, prompt.authorId) : "Игра",
      answerAuthorId: answer.authorId,
      answerAuthorName: getPlayerName(room, answer.authorId),
      authorId: answer.authorId,
      authorName: getPlayerName(room, answer.authorId),
      votesCount,
      voters: room.votes.filter((vote) => vote.answerId === answer.id).map((vote) => vote.voterId),
      promptSnapshot: prompt ? snapshotSubmission(prompt) : null,
      answerSnapshot: snapshotSubmission(answer),
      chainSegments: answer.chainSegments || null,
      storyText: answer.storyText || null,
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

  if (isDuelTournamentMode(room)) settleDuelBattle(room);

  bestJokes.forEach((best) => {
    room.bestJokesHistory.push({
      jokeId: best.jokeId,
      answerId: best.answerId,
      promptId: best.promptId,
      round: room.round,
      promptText: best.promptText,
      answerText: best.answerText,
      promptAudio: best.promptAudio || null,
      answerAudio: best.answerAudio || null,
      chainSegments: best.chainSegments || null,
      storyText: best.storyText || null,
      promptAuthorId: best.promptAuthorId,
      promptAuthorName: best.promptAuthorName,
      answerAuthorId: best.answerAuthorId,
      answerAuthorName: best.answerAuthorName,
      authorName: best.authorName,
      votesCount: best.votesCount,
      tied: bestJokes.length > 1
    });
  });

  if (!Array.isArray(room.jokeArchive)) room.jokeArchive = [];
  room.jokeArchive.push(...room.lastRoundResults.map((result) => ({ ...result })));

  setRoomStage(room, "scoreboard");
  room.timerEndsAt = null;
  emitRoom(room);
}

function titleObject(id, title, tag, description, rarity = "common") {
  return { id, title, tag, description, rarity };
}

const PERSONAL_FALLBACK_TITLES = [
  titleObject("chaos_participant", "Участник хаоса", "chaos", "Был в игре и внёс свою часть беспорядка."),
  titleObject("mood_player", "Игрок настроения", "stable", "Поддерживал темп и не дал лобби развалиться."),
  titleObject("joke_witness", "Свидетель шуток", "judge", "Видел всё, что здесь происходило, и теперь с этим живёт.")
];

function buildPlayerStats(room) {
  const archived = safeArray(room.jokeArchive);
  const events = safeArray(room.events);
  return room.players.map((player) => {
    const answers = archived.filter((joke) => joke.answerAuthorId === player.id);
    const prompts = archived.filter((joke) => joke.promptAuthorId === player.id);
    const promptVoteMap = new Map();
    prompts.forEach((joke) => promptVoteMap.set(joke.promptId, (promptVoteMap.get(joke.promptId) || 0) + (joke.votesCount || 0)));
    const promptsSubmittedEvents = events.filter((event) => ["submit_prompt", "submit_shared_prompt"].includes(event.type) && event.playerId === player.id).length;
    const totalVotesOnOwnPrompts = [...promptVoteMap.values()].reduce((sum, value) => sum + value, 0);
    const bestPromptRoundVotes = Math.max(0, ...promptVoteMap.values());
    const votesGiven = events.filter((event) => ["vote_round", "vote_grand"].includes(event.type) && event.playerId === player.id);
    const edits = events.filter((event) => ["update_prompt", "update_answer"].includes(event.type) && event.playerId === player.id);
    const audioEvents = events.filter((event) => ["submit_prompt", "update_prompt", "submit_answer", "update_answer"].includes(event.type) && event.playerId === player.id && event.payload?.audio);
    const missedPrompts = events.filter((event) => event.type === "miss_prompt" && event.playerId === player.id).length;
    const missedAnswers = events.filter((event) => event.type === "miss_answer" && event.playerId === player.id).length;
    const missedVotes = events.filter((event) => event.type === "miss_vote" && event.playerId === player.id).length;
    const recordedAudioCount = audioEvents.filter((event) => event.payload.audio?.source === "recorded").length;
    const uploadedAudioCount = audioEvents.filter((event) => event.payload.audio?.source === "uploaded").length;
    const majorRewrites = edits.filter((event) => ["rewrite", "full_rewrite"].includes(event.payload?.change?.type)).length;
    const minorEdits = edits.filter((event) => event.payload?.change?.type === "minor_edit").length;
    const audioRerecords = edits.filter((event) => event.payload?.change?.audioAction === "rerecorded").length;
    const audioRemoved = edits.filter((event) => event.payload?.change?.audioAction === "removed").length;
    const textLengths = answers.map((joke) => String(joke.answerText || "").length);
    const averageAnswerLength = textLengths.length ? textLengths.reduce((a, b) => a + b, 0) / textLengths.length : 0;
    const roundsWithVotes = new Set(answers.filter((joke) => joke.votesCount > 0).map((joke) => joke.round)).size;
    const zeroVoteAnswers = answers.filter((joke) => joke.votesCount === 0).length;
    const roundWins = answers.filter((joke) => joke.isRoundWinner).length;
    const grandWins = safeArray(room.grandFinal?.winners).filter((joke) => joke.answerAuthorId === player.id || joke.promptAuthorId === player.id).length;
    const finalVotesForOwnJokes = safeArray(room.grandFinal?.votes).filter((vote) => {
      const joke = safeArray(room.grandFinal?.candidates).find((item) => item.jokeId === vote.jokeId);
      return joke && (joke.answerAuthorId === player.id || joke.promptAuthorId === player.id);
    }).length;
    const votesForWinners = safeArray(room.grandFinal?.votes).filter((vote) => vote.voterId === player.id && safeArray(room.grandFinal?.winners).some((winner) => winner.jokeId === vote.jokeId)).length;
    const guessArchive = safeArray(room.guessArchive);
    const playerGuessResults = guessArchive.filter((guess) => guess.guesserId === player.id);
    const correctPromptGuesses = playerGuessResults.filter((guess) => guess.correctPrompt).length;
    const correctAnswerGuesses = playerGuessResults.filter((guess) => guess.correctAnswer).length;
    const fullPairGuesses = playerGuessResults.filter((guess) => guess.fullCorrect).length;
    const authoredGuessTargets = guessArchive.filter((guess) => guess.promptAuthorId === player.id || guess.answerAuthorId === player.id);
    const correctlyGuessedAsAuthor = authoredGuessTargets.filter((guess) => (guess.promptAuthorId === player.id && guess.correctPrompt) || (guess.answerAuthorId === player.id && guess.correctAnswer)).length;
    const wronglyAccused = guessArchive.filter((guess) => {
      return (guess.guessedPromptAuthorId === player.id && guess.promptAuthorId !== player.id) ||
        (guess.guessedAnswerAuthorId === player.id && guess.answerAuthorId !== player.id);
    }).length;

    return {
      id: player.id,
      name: player.name,
      score: player.score,
      connected: player.connected,
      totalVotesReceived: player.totalVotesReceived,
      bestSingleRoundVotes: player.bestSingleRoundVotes,
      answersSubmitted: answers.length,
      promptsSubmitted: promptsSubmittedEvents,
      totalVotesOnOwnPrompts,
      bestPromptRoundVotes,
      promptsThatLedToVotes: prompts.filter((joke) => joke.votesCount > 0).length,
      promptsThatLedToWinningAnswers: prompts.filter((joke) => joke.isRoundWinner).length,
      votesGiven: votesGiven.length,
      recordedAudioCount,
      uploadedAudioCount,
      audioCount: recordedAudioCount + uploadedAudioCount,
      audioRerecords,
      audioRemoved,
      editsCount: edits.length,
      majorRewrites,
      minorEdits,
      averageAnswerLength,
      roundsWithVotes,
      zeroVoteAnswers,
      roundWins,
      grandWins,
      finalVotesForOwnJokes,
      votesForWinners,
      correctPromptGuesses,
      correctAnswerGuesses,
      fullPairGuesses,
      correctlyGuessedAsAuthor,
      authoredGuessTargets: authoredGuessTargets.length,
      wronglyAccused,
      duelWins: Number(player.stats?.duelWins) || 0,
      duelFinalWins: Number(player.stats?.duelFinalWins) || 0,
      duelChampion: Number(player.stats?.duelChampion) || 0,
      duelPromptsSelected: Number(player.stats?.duelPromptsSelected) || 0,
      missedPrompts,
      missedAnswers,
      missedVotes,
      disconnects: events.filter((event) => event.type === "disconnect" && event.playerId === player.id).length,
      left: events.some((event) => event.type === "leave" && event.playerId === player.id)
    };
  });
}

function selectPersonalTitle(stat, allStats, place, topScore) {
  const maxScore = Math.max(...allStats.map((item) => item.score), 0);
  const maxVotes = Math.max(...allStats.map((item) => item.totalVotesReceived), 0);
  const maxRecorded = Math.max(...allStats.map((item) => item.recordedAudioCount), 0);
  const maxUploaded = Math.max(...allStats.map((item) => item.uploadedAudioCount), 0);
  const maxEdits = Math.max(...allStats.map((item) => item.editsCount), 0);
  const maxMissed = Math.max(...allStats.map((item) => item.missedPrompts + item.missedAnswers + item.missedVotes), 0);
  const maxFullPairGuesses = Math.max(...allStats.map((item) => item.fullPairGuesses || 0), 0);
  const maxCorrectGuesses = Math.max(...allStats.map((item) => (item.correctPromptGuesses || 0) + (item.correctAnswerGuesses || 0)), 0);
  const maxWronglyAccused = Math.max(...allStats.map((item) => item.wronglyAccused || 0), 0);
  const missed = stat.missedPrompts + stat.missedAnswers + stat.missedVotes;
  const candidates = [];
  const add = (score, title) => candidates.push({ score, title });

  if ((stat.duelChampion || 0) > 0) add(130, titleObject("duel_champion", "Чемпион сетки", "winner", "Прошёл турнирную сетку и остался последним в бою.", "legendary"));
  if ((stat.duelFinalWins || 0) > 0) add(118, titleObject("final_puncher", "Финальный панчер", "winner", "Забрал решающий бой турнира.", "epic"));
  if ((stat.duelWins || 0) >= 2) add(104, titleObject("battle_grinder", "Прошёл через мясорубку", "winner", "Выиграл несколько боёв подряд и дожил до поздней стадии.", "epic"));
  if ((stat.duelPromptsSelected || 0) >= 1) add(86, titleObject("duel_writer", "Дуэльный сценарист", "creator", "Его начало выбрали для чужого боя.", "rare"));

  if ((stat.fullPairGuesses || 0) > 0 && stat.fullPairGuesses === maxFullPairGuesses) add(119, titleObject("pair_detective", "Раскрыл связку", "detective", "Лучше всех угадывал, кто дал начало и кто добил шутку.", "legendary"));
  if (((stat.correctPromptGuesses || 0) + (stat.correctAnswerGuesses || 0)) > 0 && ((stat.correctPromptGuesses || 0) + (stat.correctAnswerGuesses || 0)) === maxCorrectGuesses) add(107, titleObject("author_detective", "Следователь", "detective", "Чаще остальных узнавал авторов по стилю и подаче.", "epic"));
  if ((stat.authoredGuessTargets || 0) >= 2 && (stat.correctlyGuessedAsAuthor || 0) === 0) add(101, titleObject("perfect_mask", "Идеальная маска", "mask", "Писал так, что комнатe было сложно понять, где его стиль.", "epic"));
  if ((stat.wronglyAccused || 0) > 0 && stat.wronglyAccused === maxWronglyAccused) add(83, titleObject("false_trace", "Ложный след", "detective", "Его часто подозревали в чужих шутках.", "rare"));
  if (stat.grandWins > 0) add(125, titleObject("joke_of_the_night", "Шутка вечера", "winner", "Стал соавтором шутки, которую выбрали уже после всех раундов.", "legendary"));
  if (place === 1 && stat.score === topScore && allStats.filter((item) => item.score === topScore).length > 1) add(112, titleObject("shared_crown", "Двойная корона", "winner", "Разделил первое место — комната не смогла выбрать одного главного.", "legendary"));
  if (place === 1 && stat.score === maxScore) add(105, titleObject("punchline_king", "Король панчлайна", "winner", "Чаще всех забирал голоса и стабильно попадал в настроение комнаты.", "legendary"));
  if (stat.editsCount >= 2 && stat.roundWins > 0) add(97, titleObject("editor_of_victory", "Редактор победы", "editor", "Правил шутки перед отправкой — и финальная версия забрала голоса.", "epic"));
  if (stat.majorRewrites >= 1 && (stat.roundWins > 0 || stat.grandWins > 0)) add(96, titleObject("rewrote_fate", "Переписал судьбу", "rewriter", "Сильно переделал шутку, и именно новая версия сработала.", "epic"));
  if (stat.recordedAudioCount >= 2 && stat.recordedAudioCount === maxRecorded) add(92, titleObject("voice_of_night", "Голос вечера", "voice", "Чаще других записывал голосовые прямо в игре.", "epic"));
  if (stat.uploadedAudioCount >= 2 && stat.uploadedAudioCount === maxUploaded && stat.uploadedAudioCount >= stat.recordedAudioCount) add(90, titleObject("file_dj", "Файловый диджей", "uploader", "Не записывал с микрофона — приносил готовые звуки как вложения.", "epic"));
  if (stat.audioRerecords >= 2) add(89, titleObject("rerecorded_reality", "Перезаписал реальность", "voice", "Перезаписывал голосовые, пока не нашёл нужную подачу.", "rare"));
  if (stat.audioRemoved >= 2) add(82, titleObject("changed_mind_sound", "Передумал звучать", "editor", "Добавлял аудио, потом убирал и возвращался к тексту.", "rare"));
  if (stat.totalVotesReceived === maxVotes && maxVotes > 0) add(86, titleObject("humor_machine", "Машина юмора", "stable", "Набрал больше всего реакции за игру.", "epic"));
  if (stat.answersSubmitted >= 2 && stat.roundsWithVotes >= Math.ceil(stat.answersSubmitted * 0.6)) add(78, titleObject("stable_funny", "Стабильный смешной", "stable", "Не всегда забирал раунд, но почти всегда собирал реакцию.", "rare"));
  if (stat.averageAnswerLength <= 35 && stat.totalVotesReceived > 0) add(72, titleObject("short_master", "Мастер короткой фразы", "short", "Сказал мало, но этого хватило.", "rare"));
  if (stat.averageAnswerLength >= 95) add(68, titleObject("long_author", "Автор простыней", "long", "Не жалел символов и превращал концовки в мини-истории.", "rare"));
  if (stat.promptsSubmitted > 0 && stat.totalVotesOnOwnPrompts >= Math.max(2, maxVotes)) add(93, titleObject("setup_supplier", "Поставщик ситуаций", "creator", "Давал такие начала, на которых вся комната разгонялась сильнее всего.", "epic"));
  if (stat.promptsThatLedToWinningAnswers > 0 && stat.bestPromptRoundVotes >= 2) add(91, titleObject("evening_starter", "Разгонщик вечера", "creator", "Его начало стало площадкой для победной добивки раунда.", "epic"));
  if (stat.promptsThatLedToWinningAnswers > 0) add(84, titleObject("joke_architect", "Архитектор шуток", "creator", "Кидал такие начала, из которых другим было легко делать смешно.", "epic"));
  if (stat.votesForWinners > 0 && stat.votesGiven > 0 && stat.votesForWinners / stat.votesGiven >= 0.6) add(70, titleObject("people_vote", "Голос народа", "people_vote", "Часто выбирал то, что потом выбирала вся комната.", "rare"));
  if (stat.answersSubmitted === 0 && stat.votesGiven > 0) add(76, titleObject("judge_without_pen", "Судья без пера", "judge", "Сам почти не писал, зато внимательно выбирал чужие шутки.", "rare"));
  if (stat.answersSubmitted > 0 && stat.votesGiven === 0) add(74, titleObject("author_without_court", "Автор без суда", "judge", "Шутки писал, но чужие оценивать не спешил.", "rare"));
  if (missed >= 4 || (missed === maxMissed && missed >= 2)) add(88, titleObject("loading_screen", "Человек-загрузка", "afk", "Периодически появлялся, но игра всё равно ждала его ответа.", "rare"));
  if (stat.answersSubmitted === 0 && stat.votesGiven === 0 && missed >= 2) add(100, titleObject("lobby_ghost", "Призрак лобби", "afk", "В списке игроков был. В игре — вопрос спорный.", "epic"));
  if (stat.audioCount === 0 && stat.answersSubmitted > 0) add(52, titleObject("dry_text", "Сухой текст", "short", "Ни разу не использовал аудио, но держался текстом.", "common"));
  if (stat.editsCount === 0 && stat.totalVotesReceived > 0) add(58, titleObject("one_take", "Один дубль", "stable", "Отправлял без правок — и всё равно попадал.", "rare"));
  if (stat.editsCount === maxEdits && maxEdits >= 2) add(66, titleObject("panic_editor", "Редактор в панике", "editor", "Правил часто и заметно, будто шутка собиралась прямо на лету.", "rare"));

  if (!candidates.length) {
    const index = Math.abs(stat.name.length + stat.score) % PERSONAL_FALLBACK_TITLES.length;
    return PERSONAL_FALLBACK_TITLES[index];
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].title;
}

function buildPlayerAwards(room) {
  const stats = buildPlayerStats(room);
  const ranked = denseRank(stats, (item) => item.score);
  const topScore = Math.max(...ranked.map((item) => item.score), 0);
  return ranked.map((stat) => {
    const title = selectPersonalTitle(stat, ranked, stat.place, topScore);
    return {
      ...stat,
      title,
      statsPreview: [
        `${stat.score} ${formatScoreWord(stat.score)}`,
        stat.totalVotesReceived ? `${stat.totalVotesReceived} голосов получил` : "голоса не собрал",
        stat.editsCount ? `${stat.editsCount} правок` : "без правок",
        stat.audioCount ? `${stat.audioCount} аудио` : "только текст"
      ]
    };
  });
}

function pairKey(a, b) {
  return [a, b].sort().join("::");
}

function makePairRecipeKey(tagA, tagB) {
  return [tagA || "stable", tagB || "stable"].sort().join("+");
}

const PAIR_RECIPES = {
  "winner+winner": ["Два трона — один панчлайн", "Оба привыкли забирать внимание, и в этой связке никто не был слабым звеном.", "legendary"],
  "voice+winner": ["Голос короны", "Победный юмор получил ещё и подачу.", "legendary"],
  "uploader+voice": ["Файл и микрофон", "Один приносил звук файлом, другой держал подачу.", "epic"],
  "editor+winner": ["Отредактированная корона", "Победный стиль встретился с человеком последней версии.", "epic"],
  "rewriter+winner": ["Корона второй версии", "Один тащил, другой переписывал реальность до смешного.", "epic"],
  "editor+editor": ["Редакционный дуэт", "Они не просто делали шутки — они доводили их до финальной версии.", "epic"],
  "rewriter+rewriter": ["Пара второй версии", "С первого раза не остановились — и, кажется, правильно сделали.", "epic"],
  "niche+winner": ["Король андеграунда", "Победный юмор смешался со странным вкусом — и это сработало.", "legendary"],
  "fast+slow": ["Контрастный тайминг", "Один стрелял быстро, второй думал дольше. Вместе они нашли рабочий ритм.", "rare"],
  "long+short": ["Разгон и удар", "Один строил заход, второй ставил точку.", "rare"],
  "long+long": ["Сценаристы лобби", "Они не писали шутки — они строили целые истории.", "rare"],
  "short+short": ["Две точки", "Минимум текста, максимум попытки попасть сразу в смешное.", "rare"],
  "niche+niche": ["Андеграундный союз", "Их юмор был не для всех. Но, кажется, им это даже помогало.", "epic"],
  "chaos+chaos": ["Двойной хаос", "Эта связка не объясняла шутки. Она просто выпускала их в комнату.", "rare"],
  "afk+winner": ["Чемпион и тень", "Один тащил, второй появлялся как редкий бонусный персонаж.", "rare"],
  "afk+afk": ["Дуэт ожидания", "Эту связку чаще ждали, чем слышали. Но технически она существовала.", "rare"],
  "judge+niche": ["Критик андеграунда", "Эта связка будто сама выбирала, что считать смешным.", "rare"],
  "judge+winner": ["Судья и чемпион", "Один хорошо чувствовал чужие шутки, второй умел делать свои.", "rare"]
};

function buildPairStats(room) {
  const map = new Map();
  safeArray(room.jokeArchive).forEach((joke) => {
    if (!joke.promptAuthorId || !joke.answerAuthorId || joke.promptAuthorId === joke.answerAuthorId) return;
    const key = pairKey(joke.promptAuthorId, joke.answerAuthorId);
    if (!map.has(key)) {
      map.set(key, {
        key,
        playerIds: key.split("::"),
        totalJokes: 0,
        totalVotes: 0,
        roundWins: 0,
        grandFinalWins: 0,
        bestSingleJokeVotes: 0,
        voiceJokes: 0,
        uploadedAudioJokes: 0,
        textEdits: 0,
        majorRewrites: 0,
        audioEdits: 0,
        audioRerecords: 0,
        bothDirections: new Set(),
        jokes: []
      });
    }
    const pair = map.get(key);
    const promptVersions = safeArray(joke.promptSnapshot?.versions);
    const answerVersions = safeArray(joke.answerSnapshot?.versions);
    const versions = [...promptVersions, ...answerVersions];
    pair.totalJokes += 1;
    pair.totalVotes += joke.votesCount || 0;
    pair.roundWins += joke.isRoundWinner ? 1 : 0;
    pair.bestSingleJokeVotes = Math.max(pair.bestSingleJokeVotes, joke.votesCount || 0);
    pair.voiceJokes += (joke.promptAudio || joke.answerAudio) ? 1 : 0;
    pair.uploadedAudioJokes += [joke.promptAudio, joke.answerAudio].filter((audio) => audio?.source === "uploaded").length;
    pair.textEdits += Math.max(0, promptVersions.length - 1) + Math.max(0, answerVersions.length - 1);
    pair.majorRewrites += versions.filter((version) => ["rewrite", "full_rewrite"].includes(version.change?.type)).length;
    pair.audioEdits += versions.filter((version) => version.change?.audioAction && version.change.audioAction !== "none").length;
    pair.audioRerecords += versions.filter((version) => version.change?.audioAction === "rerecorded").length;
    pair.bothDirections.add(`${joke.promptAuthorId}->${joke.answerAuthorId}`);
    pair.jokes.push(joke);
  });

  safeArray(room.grandFinal?.winners).forEach((winner) => {
    if (!winner.promptAuthorId || !winner.answerAuthorId || winner.promptAuthorId === winner.answerAuthorId) return;
    const key = pairKey(winner.promptAuthorId, winner.answerAuthorId);
    if (map.has(key)) map.get(key).grandFinalWins += 1;
  });

  return [...map.values()].map((pair) => {
    const avgVotesPerJoke = pair.totalJokes ? pair.totalVotes / pair.totalJokes : 0;
    const bothDirectionsWorked = pair.bothDirections.size >= 2;
    const power = pair.totalVotes * 10 + pair.roundWins * 20 + pair.grandFinalWins * 35 + avgVotesPerJoke * 8 + pair.bestSingleJokeVotes * 5 + (bothDirectionsWorked ? 10 : 0) + (pair.majorRewrites ? 8 : 0) + (pair.voiceJokes ? 5 : 0);
    return { ...pair, avgVotesPerJoke, bothDirectionsWorked, power };
  }).sort((a, b) => b.power - a.power);
}

function selectPairTitle(pair, playerAwardById, place, tiedCount = 1) {
  if (pair.grandFinalWins > 0) return titleObject("main_pair_of_night", "Главная связка вечера", "pair", "Их шутка победила в финальном голосовании.", "legendary");
  if (tiedCount >= 3 && place === 1) return titleObject("council_of_punchlines", "Совет панчлайнов", "pair", "Трон пришлось делить. Слишком много связок решили играть как чемпионы.", "legendary");
  if (tiedCount === 2 && place === 1) return titleObject("double_pair_crown", "Двойная корона связок", "pair", "Сразу две связки забрали вершину. Лобби не смогло выбрать одну.", "legendary");
  if (pair.majorRewrites > 0 && pair.roundWins > 0) return titleObject("draft_became_legend", "Черновик стал легендой", "rewriter", "Их шутка заметно изменилась перед тем, как забрала голоса.", "epic");
  if (pair.textEdits >= 2 && pair.totalVotes > 0) return titleObject("editorial_duo", "Редакционный дуэт", "editor", "Они не просто сделали шутку — они довели её до финальной версии.", "epic");
  if (pair.audioRerecords >= 2) return titleObject("rerecording_studio", "Студия перезаписи", "voice", "В этой связке голосовые переписывались чаще, чем некоторые шутки писались.", "epic");
  if (pair.uploadedAudioJokes > 0 && pair.voiceJokes > 0) return titleObject("file_and_voice", "Файл и микрофон", "voice", "В этой связке работали и вложения, и голосовая подача.", "rare");

  const [a, b] = pair.playerIds;
  const tagA = playerAwardById.get(a)?.title?.tag || "stable";
  const tagB = playerAwardById.get(b)?.title?.tag || "stable";
  const recipe = PAIR_RECIPES[makePairRecipeKey(tagA, tagB)];
  if (recipe) return titleObject(`pair_${makePairRecipeKey(tagA, tagB)}`, recipe[0], "pair", recipe[1], recipe[2]);

  if (pair.bothDirectionsWorked) return titleObject("lobby_chemistry", "Химия лобби", "pair", "Неважно, кто начинал, а кто добивал — вместе у них всё равно получалось смешно.", "rare");
  if (pair.avgVotesPerJoke >= 2) return titleObject("sniper_pair", "Снайперская связка", "pair", "Мало попыток, но высокий урон.", "rare");
  return titleObject("best_pair", "Лучшая парочка", "pair", "Один закинул, второй добил — и вместе они собрали реакцию.", "common");
}

function buildPairAwards(room, playerAwards) {
  const stats = buildPairStats(room);
  const ranked = denseRank(stats, (item) => Math.round(item.power * 1000));
  const playerAwardById = new Map(playerAwards.map((award) => [award.id, award]));
  return ranked.map((pair) => {
    const tiedCount = ranked.filter((item) => item.place === pair.place).length;
    const title = selectPairTitle(pair, playerAwardById, pair.place, tiedCount);
    return {
      key: pair.key,
      playerIds: pair.playerIds,
      place: pair.place,
      totalJokes: pair.totalJokes,
      totalVotes: pair.totalVotes,
      roundWins: pair.roundWins,
      grandFinalWins: pair.grandFinalWins,
      bestSingleJokeVotes: pair.bestSingleJokeVotes,
      textEdits: pair.textEdits,
      majorRewrites: pair.majorRewrites,
      audioEdits: pair.audioEdits,
      audioRerecords: pair.audioRerecords,
      voiceJokes: pair.voiceJokes,
      uploadedAudioJokes: pair.uploadedAudioJokes,
      avgVotesPerJoke: pair.avgVotesPerJoke,
      power: pair.power,
      title,
      players: pair.playerIds.map((id) => ({ id, name: getPlayerName(room, id), title: playerAwardById.get(id)?.title })),
      statsPreview: [
        `${pair.totalVotes} голосов`,
        `${pair.totalJokes} совместн. шуток`,
        pair.roundWins ? `${pair.roundWins} побед раунда` : "без побед раунда",
        pair.textEdits ? `${pair.textEdits} правок` : "без правок"
      ]
    };
  });
}

function buildTrioAwards(room, pairAwards) {
  const players = room.players.map((player) => player.id);
  if (players.length < 3) return [];
  const pairByKey = new Map(pairAwards.map((pair) => [pair.key, pair]));
  const trios = [];
  for (let i = 0; i < players.length; i += 1) {
    for (let j = i + 1; j < players.length; j += 1) {
      for (let k = j + 1; k < players.length; k += 1) {
        const ids = [players[i], players[j], players[k]];
        const insidePairs = [pairKey(ids[0], ids[1]), pairKey(ids[0], ids[2]), pairKey(ids[1], ids[2])].map((key) => pairByKey.get(key)).filter(Boolean);
        if (!insidePairs.length) continue;
        const totalPairVotesInside = insidePairs.reduce((sum, pair) => sum + pair.totalVotes, 0);
        const roundWinsInside = insidePairs.reduce((sum, pair) => sum + pair.roundWins, 0);
        const grandFinalWinsInside = insidePairs.reduce((sum, pair) => sum + pair.grandFinalWins, 0);
        const totalEdits = insidePairs.reduce((sum, pair) => sum + pair.textEdits + pair.majorRewrites, 0);
        const totalAudio = insidePairs.reduce((sum, pair) => sum + pair.voiceJokes + pair.audioRerecords + pair.uploadedAudioJokes, 0);
        const triangleCompleted = insidePairs.length === 3 && insidePairs.every((pair) => pair.totalVotes > 0);
        const power = totalPairVotesInside * 8 + roundWinsInside * 15 + grandFinalWinsInside * 30 + (triangleCompleted ? 20 : 0) + (totalEdits >= 4 ? 12 : 0) + (totalAudio >= 3 ? 10 : 0);
        if (power < 24) continue;
        let title = titleObject("punchline_triangle", "Треугольник панчлайна", "trio", "Каждый в этом трио успел быть частью чужой шутки — и круг замкнулся.", "epic");
        if (grandFinalWinsInside) title = titleObject("night_joke_triangle", "Трио шутки вечера", "trio", "Их связки дошли до финального выбора шутки вечера.", "legendary");
        else if (totalEdits >= 4) title = titleObject("editorial_council", "Редакционный совет", "trio", "Три игрока чаще остальных правили, переписывали и доводили шутки до финального вида.", "epic");
        else if (totalAudio >= 3) title = titleObject("recording_studio", "Студия звукозаписи", "trio", "Это трио чаще всех записывало, перезаписывало и прикрепляло аудио.", "epic");
        trios.push({
          playerIds: ids,
          players: ids.map((id) => ({ id, name: getPlayerName(room, id) })),
          title,
          power,
          statsPreview: [`${totalPairVotesInside} голосов внутри`, `${insidePairs.length} связки`, totalEdits ? `${totalEdits} правок` : "без правок"]
        });
      }
    }
  }
  return trios.sort((a, b) => b.power - a.power).slice(0, 2);
}

function buildSpecialRoles(playerAwards) {
  return playerAwards
    .filter((award) => ["afk", "judge", "niche", "editor", "voice", "uploader"].includes(award.title.tag))
    .slice(0, 3)
    .map((award) => ({ playerId: award.id, playerName: award.name, title: award.title.title, description: award.title.description }));
}

function startGrandVoting(room) {
  clearRoomTimer(room);
  const candidates = safeArray(room.bestJokesHistory).map((joke, index) => ({
    ...joke,
    jokeId: joke.jokeId || joke.answerId || `best-${index}`,
    finalVotes: 0,
    finalVoters: []
  }));

  if (!candidates.length || getConnectedPlayers(room).length < 2) {
    finishGame(room);
    return;
  }

  setRoomStage(room, "grandVoting");
  room.timerEndsAt = null;
  room.grandFinal = {
    candidates,
    votes: [],
    winners: [],
    tie: null
  };
  setStageTimer(room, room.timers.voteSeconds || 30, () => {
    const latest = rooms[room.code];
    if (!latest || latest.state !== "grandVoting") return;
    finishGrandVoting(latest);
  });
  emitRoom(room);
}

function finishGrandVoting(room) {
  if (!room?.grandFinal) return finishGame(room);
  const votesByJoke = new Map(room.grandFinal.candidates.map((joke) => [joke.jokeId, 0]));
  room.grandFinal.votes.forEach((vote) => {
    votesByJoke.set(vote.jokeId, (votesByJoke.get(vote.jokeId) || 0) + 1);
  });
  const candidates = room.grandFinal.candidates.map((joke) => ({
    ...joke,
    finalVotes: votesByJoke.get(joke.jokeId) || 0,
    finalVoters: room.grandFinal.votes.filter((vote) => vote.jokeId === joke.jokeId).map((vote) => vote.voterId)
  })).sort((a, b) => b.finalVotes - a.finalVotes || b.votesCount - a.votesCount);
  let bestVotes = candidates[0]?.finalVotes || 0;
  let winners = candidates.filter((joke) => joke.finalVotes === bestVotes);
  if (bestVotes === 0) {
    const bestOriginalVotes = Math.max(...candidates.map((joke) => joke.votesCount || 0), 0);
    winners = candidates.filter((joke) => (joke.votesCount || 0) === bestOriginalVotes);
  }
  room.grandFinal.candidates = candidates;
  room.grandFinal.winners = winners;
  room.grandFinal.tie = winners.length > 1 ? { finalVotes: bestVotes, winnersCount: winners.length, jokeIds: winners.map((joke) => joke.jokeId) } : null;
  finishGame(room);
}

function canPlayerVoteGrand(playerId, candidates) {
  const available = candidates.filter((joke) => joke.promptAuthorId !== playerId && joke.answerAuthorId !== playerId);
  return available.length > 0 ? available : candidates;
}

function buildFinalSummary(room) {
  const playerAwards = buildPlayerAwards(room);
  const pairAwards = buildPairAwards(room, playerAwards);
  const trioAwards = buildTrioAwards(room, pairAwards);
  const podium = playerAwards.filter((award) => award.place <= 3);
  const otherPlayers = playerAwards.filter((award) => award.place > 3);
  return {
    generatedAt: Date.now(),
    grandFinal: room.grandFinal || null,
    podium,
    otherPlayers,
    players: playerAwards,
    pairs: {
      podium: pairAwards.filter((award) => award.place <= 3).slice(0, 6),
      others: pairAwards.filter((award) => award.place > 3).slice(0, 12)
    },
    trios: trioAwards,
    specialRoles: buildSpecialRoles(playerAwards),
    bestJokes: safeArray(room.bestJokesHistory)
  };
}

function buildTitles(room) {
  const summary = room.finalSummary || buildFinalSummary(room);
  return safeArray(summary.players).map((player) => ({
    title: player.title.title,
    playerName: player.name,
    note: player.title.description
  }));
}

function finishGame(room) {
  clearRoomTimer(room);
  setRoomStage(room, "finished");
  room.timerEndsAt = null;
  room.finalSummary = buildFinalSummary(room);
  room.titles = buildTitles(room);
  emitRoom(room);
}

io.on("connection", (socket) => {
  socket.on("createRoom", ({ name, settings, sessionId, gameMode } = {}) => {
    const cleanName = cleanText(name, 32);
    const cleanSession = cleanSessionId(sessionId) || makeId("player");
    if (!cleanName) return emitError(socket, COPY.errors.emptyName);

    const code = generateRoomCode();
    const cleanGameMode = normalizeGameMode(gameMode);
    const mode = getGameMode(cleanGameMode);
    if (!mode.implemented) return emitError(socket, COPY.errors.modeNotImplemented);
    const normalized = normalizeSettings(settings);
    const settingsError = validateNormalizedSettings(normalized);
    if (settingsError) return emitError(socket, settingsError);
    const room = {
      code,
      hostId: cleanSession,
      gameMode: cleanGameMode,
      state: "waiting",
      round: 1,
      maxRounds: normalized.maxRounds,
      timerEndsAt: null,
      stageStartedAt: Date.now(),
      timers: normalized.timers,
      settings: normalized.settings,
      players: [createPlayer(socket, cleanName, cleanSession)],
      spectators: [],
      bannedSessionIds: [],
      promptCursor: 0,
      sharedPromptQueue: [],
      currentSharedPromptIndex: 0,
      sharedPromptCollectionComplete: false,
      chaosChains: [],
      chaosStep: 1,
      chaosTotalSteps: 0,
      chaosActive: false,
      duel: { active: false, stage: 0, stageName: "", stageParticipants: [], battles: [], currentBattleIndex: 0, currentBattle: null, stageWinners: [], completedBattles: [], championId: null, complete: false },
      prompts: [],
      sharedPrompt: null,
      assignments: {},
      assignmentMeta: {},
      assignmentHistory: {},
      answers: [],
      votes: [],
      guesses: [],
      guessResults: [],
      guessArchive: [],
      lastRoundResults: [],
      lastBestJoke: null,
      lastBestJokes: [],
      lastRoundTie: null,
      bestJokesHistory: [],
      jokeArchive: [],
      events: [],
      grandFinal: null,
      finalSummary: null,
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

  socket.on("joinSpectator", ({ code, name, sessionId } = {}) => {
    const cleanCode = cleanText(code, 8).toUpperCase();
    const cleanName = cleanText(name, 32) || "зритель";
    const cleanSession = cleanSessionId(sessionId) || makeId("spectator");
    const room = rooms[cleanCode];

    if (!room) return emitError(socket, COPY.errors.roomMissing);
    if (room.settings.spectatorMode === false) return emitError(socket, "Режим зрителя выключен в этом лобби.");

    if (!Array.isArray(room.spectators)) room.spectators = [];
    let spectator = room.spectators.find((item) => item.id === cleanSession);
    if (!spectator) {
      spectator = { id: cleanSession, socketId: socket.id, name: cleanName, connected: true, joinedAt: Date.now(), reactions: [] };
      room.spectators.push(spectator);
    } else {
      spectator.name = cleanName;
      spectator.socketId = socket.id;
      spectator.connected = true;
    }

    socket.data.roomCode = room.code;
    socket.data.spectatorId = spectator.id;
    socket.data.playerId = null;
    socket.join(room.code);
    socket.emit("joinedSpectator", { code: cleanCode, sessionId: cleanSession });
    emitRoom(room);
  });

  socket.on("joinRoom", ({ code, name, sessionId } = {}) => {
    const cleanCode = cleanText(code, 8).toUpperCase();
    const cleanName = cleanText(name, 32);
    const cleanSession = cleanSessionId(sessionId) || makeId("player");
    const room = rooms[cleanCode];

    if (!cleanName) return emitError(socket, COPY.errors.emptyName);
    if (!room) return emitError(socket, COPY.errors.roomMissing);
    if (roomHasBan(room, cleanSession)) return emitError(socket, COPY.errors.banned);

    const existingPlayer = room.players.find((player) => player.id === cleanSession);
    if (existingPlayer) {
      if (existingPlayer.banned || roomHasBan(room, existingPlayer.id)) return emitError(socket, COPY.errors.banned);
      const wasDisconnected = !existingPlayer.connected;
      existingPlayer.name = cleanName;
      attachPlayerToSocket(socket, room, existingPlayer);
      socket.emit("joinedRoom", { code: cleanCode, sessionId: cleanSession, reconnected: true });
      emitRoom(room);
      emitOpenRooms();
      if (wasDisconnected) {
        incrementPlayerStat(room, existingPlayer.id, "reconnects");
        logEvent(room, "reconnect", existingPlayer.id, {});
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
    const settingsError = validateNormalizedSettings(normalized);
    if (settingsError) return emitError(socket, settingsError);
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
    const mode = getGameMode(room);
    if (!mode.implemented) return emitError(socket, COPY.errors.modeNotImplemented);
    if (getConnectedPlayers(room).length < mode.minPlayers) {
      return emitError(socket, `Для режима «${mode.title}» нужно минимум ${mode.minPlayers} игрока.`);
    }

    room.round = 1;
    room.players.forEach((player) => {
      player.score = 0;
      player.totalVotesReceived = 0;
      player.bestSingleRoundVotes = 0;
    });
    room.bestJokesHistory = [];
    room.jokeArchive = [];
    room.guesses = [];
    room.guessResults = [];
    room.guessArchive = [];
    room.sharedPromptQueue = [];
    room.currentSharedPromptIndex = 0;
    room.sharedPromptCollectionComplete = false;
    room.assignmentHistory = {};
    room.events = [];
    room.grandFinal = null;
    room.finalSummary = null;
    room.titles = [];
    resetChaosData(room);
    resetDuelData(room);
    logEvent(room, "start_game", socket.data.playerId, {});
    startGameCountdown(room);
    emitOpenRooms();
  });

  socket.on("submitPrompt", ({ text, audio } = {}) => {
    const room = rooms[socket.data.roomCode];
    const playerId = socket.data.playerId;
    if (!room || !["prompting", "collectingSharedPrompts"].includes(room.state)) return;
    if (isDuelTournamentMode(room) && room.state === "prompting" && !getDuelPromptAuthors(room).some((player) => player.id === playerId)) {
      return emitError(socket, "В этом бою начало пишут только игроки вне дуэли.");
    }

    const isSharedCollection = room.state === "collectingSharedPrompts";
    const promptText = cleanText(text, PROMPT_MAX_LENGTH);
    const cleanedAudio = cleanAudio(audio);
    if (cleanedAudio.error) return emitError(socket, cleanedAudio.error);
    if (!promptText && !cleanedAudio.audio) return emitError(socket, COPY.errors.emptyPrompt);

    const existingPrompt = room.prompts.find((prompt) => prompt.authorId === playerId);
    const version = makeSubmissionVersion({ room, item: existingPrompt, text: promptText, audio: cleanedAudio.audio, source: "manual" });

    if (existingPrompt) {
      existingPrompt.text = promptText;
      existingPrompt.audio = cleanedAudio.audio;
      existingPrompt.updatedAt = Date.now();
      existingPrompt.versions = safeArray(existingPrompt.versions);
      existingPrompt.versions.push(version);
      applySubmissionStats(room, playerId, version, "prompt", true);
      logEvent(room, isSharedCollection ? "update_shared_prompt" : "update_prompt", playerId, { promptId: existingPrompt.id, version: version.version, change: version.change });
      emitRoom(room);
      return;
    }

    const prompt = {
      id: makeId("prompt"),
      round: room.round,
      authorId: playerId,
      text: promptText,
      audio: cleanedAudio.audio,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      submittedAtMs: getStageElapsedMs(room),
      versions: [version]
    };
    room.prompts.push(prompt);
    applySubmissionStats(room, playerId, version, "prompt", false);
    logEvent(room, isSharedCollection ? "submit_shared_prompt" : "submit_prompt", playerId, { promptId: prompt.id, version: 1, textLength: promptText.length, audio: version.audioMeta });

    const expectedPromptAuthors = isSharedCollection ? getConnectedPlayers(room) : getExpectedPromptAuthors(room);
    if (expectedPromptAuthors.every((player) => room.prompts.some((prompt) => prompt.authorId === player.id))) {
      if (isSharedCollection) finalizeSharedPromptCollection(room);
      else moveToAnswering(room);
    } else {
      emitRoom(room);
    }
  });

  socket.on("submitAnswer", ({ text, audio } = {}) => {
    const room = rooms[socket.data.roomCode];
    const playerId = socket.data.playerId;
    if (!room || room.state !== "answering") return;

    const answerText = cleanText(text, ANSWER_MAX_LENGTH);
    const cleanedAudio = cleanAudio(audio);
    if (cleanedAudio.error) return emitError(socket, cleanedAudio.error);
    if (!answerText && !cleanedAudio.audio) return emitError(socket, COPY.errors.emptyAnswer);
    if (!room.assignments[playerId]) return emitError(socket, COPY.errors.noAssignment);

    const existingAnswer = room.answers.find((answer) => answer.authorId === playerId);
    const version = makeSubmissionVersion({ room, item: existingAnswer, text: answerText, audio: cleanedAudio.audio, source: "manual" });

    if (existingAnswer) {
      existingAnswer.text = answerText;
      existingAnswer.audio = cleanedAudio.audio;
      existingAnswer.updatedAt = Date.now();
      existingAnswer.versions = safeArray(existingAnswer.versions);
      existingAnswer.versions.push(version);
      applySubmissionStats(room, playerId, version, "answer", true);
      logEvent(room, "update_answer", playerId, { answerId: existingAnswer.id, version: version.version, change: version.change });
      emitRoom(room);
      return;
    }

    const answer = {
      id: makeId("answer"),
      round: room.round,
      promptId: room.assignments[playerId],
      authorId: playerId,
      text: answerText,
      audio: cleanedAudio.audio,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      submittedAtMs: getStageElapsedMs(room),
      versions: [version]
    };
    room.answers.push(answer);
    applySubmissionStats(room, playerId, version, "answer", false);
    logEvent(room, "submit_answer", playerId, { answerId: answer.id, promptId: answer.promptId, version: 1, textLength: answerText.length, audio: version.audioMeta });

    if (getExpectedAnswerers(room).every((player) => room.answers.some((answer) => answer.authorId === player.id))) {
      moveToRevealing(room);
    } else {
      emitRoom(room);
    }
  });

  socket.on("submitGuesses", ({ guesses } = {}) => {
    const room = rooms[socket.data.roomCode];
    const playerId = socket.data.playerId;
    if (!room || room.state !== "guessing" || !playerId) return;
    if (room.guesses.some((entry) => entry.playerId === playerId)) return;

    const cleanGuesses = safeArray(guesses).map((guess) => ({
      answerId: cleanText(guess?.answerId, 80),
      promptAuthorId: normalizeGuessValue(guess?.promptAuthorId),
      answerAuthorId: normalizeGuessValue(guess?.answerAuthorId)
    })).filter((guess) => {
      return guess.answerId && room.answers.some((answer) => answer.id === guess.answerId);
    });

    if (!cleanGuesses.length) return emitError(socket, "Выберите авторов хотя бы для одной шутки.");
    room.guesses.push({ playerId, guesses: cleanGuesses, createdAt: Date.now(), elapsedMs: getStageElapsedMs(room) });
    logEvent(room, "submit_guess", playerId, { guesses: cleanGuesses.length });

    if (getConnectedPlayers(room).every((player) => room.guesses.some((entry) => entry.playerId === player.id))) {
      finishGuessing(room);
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
    if (!canVoteInCurrentRound(room, playerId)) return emitError(socket, "В этом бою голосуют судьи вне дуэли.");
    if (!isChainStoryMode(room) && answer.authorId === playerId) return emitError(socket, COPY.errors.selfVote);

    room.votes.push({ voterId: playerId, answerId, createdAt: Date.now(), elapsedMs: getStageElapsedMs(room) });
    incrementPlayerStat(room, playerId, "votesGiven");
    logEvent(room, "vote_round", playerId, { answerId });

    if (getExpectedVoters(room).every((player) => room.votes.some((vote) => vote.voterId === player.id))) {
      finishVoting(room);
    } else {
      emitRoom(room);
    }
  });

  socket.on("nextRound", () => {
    const room = rooms[socket.data.roomCode];
    if (!ensureHost(socket, room)) return;
    if (room.state !== "scoreboard") return;

    if (isDuelTournamentMode(room)) {
      advanceDuelAfterScoreboard(room);
      return;
    }

    if (room.round >= room.maxRounds) {
      startGrandVoting(room);
    } else {
      room.round += 1;
      if (isSharedPromptMode(room) && room.sharedPromptCollectionComplete) {
        room.currentSharedPromptIndex += 1;
      }
      startRound(room);
    }
  });

  socket.on("submitGrandVote", ({ jokeId } = {}) => {
    const room = rooms[socket.data.roomCode];
    const playerId = socket.data.playerId;
    if (!room || room.state !== "grandVoting" || !room.grandFinal) return;
    if (room.grandFinal.votes.some((vote) => vote.voterId === playerId)) return;

    const available = canPlayerVoteGrand(playerId, room.grandFinal.candidates);
    const joke = available.find((item) => item.jokeId === jokeId);
    if (!joke) return emitError(socket, COPY.errors.grandSelfVote);

    room.grandFinal.votes.push({ voterId: playerId, jokeId, createdAt: Date.now(), elapsedMs: getStageElapsedMs(room) });
    incrementPlayerStat(room, playerId, "votesGiven");
    logEvent(room, "vote_grand", playerId, { jokeId });

    if (getConnectedPlayers(room).every((player) => room.grandFinal.votes.some((vote) => vote.voterId === player.id))) {
      finishGrandVoting(room);
    } else {
      emitRoom(room);
    }
  });

  socket.on("spectatorReaction", ({ emoji } = {}) => {
    const room = rooms[socket.data.roomCode];
    const spectatorId = socket.data.spectatorId;
    if (!room || !spectatorId) return;
    const allowed = ["😂", "🔥", "💀", "👏", "🤯", "👀"];
    const cleanEmoji = allowed.includes(emoji) ? emoji : "😂";
    const spectator = safeArray(room.spectators).find((item) => item.id === spectatorId);
    if (!spectator) return;
    const reaction = { id: makeId("reaction"), spectatorId, name: spectator.name, emoji: cleanEmoji, createdAt: Date.now(), state: room.state, round: room.round };
    spectator.reactions.push(reaction);
    if (spectator.reactions.length > 30) spectator.reactions.shift();
    io.to(room.code).emit("roomNotice", { message: `${spectator.name}: ${cleanEmoji}`, type: "reaction", createdAt: Date.now() });
  });


  socket.on("setPlayerRole", ({ playerId, role, locked = true } = {}) => {
    const room = rooms[socket.data.roomCode];
    if (!ensureHost(socket, room)) return;
    const target = getRoomPlayer(room, cleanSessionId(playerId));
    if (!target || target.banned) return emitError(socket, COPY.errors.targetMissing);
    const nextRole = role === "spectator" ? "spectator" : "player";

    if (nextRole === "player" && target.role === "spectator" && getConnectedPlayers(room).length >= room.settings.maxPlayers) {
      return emitError(socket, COPY.errors.activePlayersFull);
    }

    target.role = nextRole;
    target.roleLocked = Boolean(locked);
    logEvent(room, "set_player_role", socket.data.playerId, { targetId: target.id, role: nextRole, locked: target.roleLocked });
    emitRoom(room);
    emitNotice(room, nextRole === "spectator" ? COPY.notices.movedToSpectator(target.name) : COPY.notices.movedToPlayer(target.name), "role");
    maybeAdvanceAfterPlayerLeave(room);
    emitOpenRooms();
  });

  socket.on("chooseRole", ({ role } = {}) => {
    const room = rooms[socket.data.roomCode];
    const playerId = socket.data.playerId;
    if (!room || !playerId) return;
    if (room.settings.spectatorMode === false) return emitError(socket, "Режим зрителя выключен.");
    if (room.state !== "waiting") return emitError(socket, "Роль можно менять только в лобби.");
    const player = getRoomPlayer(room, playerId);
    if (!player || player.banned) return;
    if (player.roleLocked) return emitError(socket, COPY.errors.roleLocked);
    const nextRole = role === "spectator" ? "spectator" : "player";
    if (nextRole === "player" && player.role === "spectator" && getConnectedPlayers(room).length >= room.settings.maxPlayers) {
      return emitError(socket, COPY.errors.activePlayersFull);
    }
    player.role = nextRole;
    logEvent(room, "choose_role", playerId, { role: nextRole });
    emitRoom(room);
    emitNotice(room, nextRole === "spectator" ? COPY.notices.movedToSpectator(player.name) : COPY.notices.movedToPlayer(player.name), "role");
    emitOpenRooms();
  });

  socket.on("unlockRoleChoice", ({ playerId } = {}) => {
    const room = rooms[socket.data.roomCode];
    if (!ensureHost(socket, room)) return;
    const target = getRoomPlayer(room, cleanSessionId(playerId));
    if (!target || target.banned) return emitError(socket, COPY.errors.targetMissing);
    target.roleLocked = false;
    logEvent(room, "unlock_role_choice", socket.data.playerId, { targetId: target.id });
    emitRoom(room);
    emitNotice(room, COPY.notices.choiceUnlocked(target.name), "role");
  });

  socket.on("transferHost", ({ playerId } = {}) => {
    const room = rooms[socket.data.roomCode];
    if (!ensureHost(socket, room)) return;
    const target = getRoomPlayer(room, cleanSessionId(playerId));
    if (!target || target.banned || !target.connected) return emitError(socket, COPY.errors.targetMissing);
    room.hostId = target.id;
    logEvent(room, "transfer_host", socket.data.playerId, { targetId: target.id });
    emitRoom(room);
    emitNotice(room, COPY.notices.hostChanged(target.name), "host");
    emitOpenRooms();
  });

  socket.on("kickPlayer", ({ playerId } = {}) => {
    const room = rooms[socket.data.roomCode];
    if (!ensureHost(socket, room)) return;
    const targetId = cleanSessionId(playerId);
    const target = getRoomPlayer(room, targetId);
    if (!target) return emitError(socket, COPY.errors.targetMissing);
    if (target.id === room.hostId) return emitError(socket, COPY.errors.cannotKickHost);
    const targetSocket = target.socketId ? io.sockets.sockets.get(target.socketId) : null;
    if (targetSocket) {
      targetSocket.emit("kickedFromRoom", { message: COPY.notices.kicked });
      targetSocket.leave(room.code);
      targetSocket.data.roomCode = null;
      targetSocket.data.playerId = null;
    }
    room.players = room.players.filter((item) => item.id !== target.id);
    logEvent(room, "kick_player", socket.data.playerId, { targetId: target.id });
    emitRoom(room);
    emitNotice(room, COPY.notices.kickedPlayer(target.name), "leave");
    maybeAdvanceAfterPlayerLeave(room);
    emitOpenRooms();
  });

  socket.on("banPlayer", ({ playerId } = {}) => {
    const room = rooms[socket.data.roomCode];
    if (!ensureHost(socket, room)) return;
    const targetId = cleanSessionId(playerId);
    const target = getRoomPlayer(room, targetId);
    if (!target) return emitError(socket, COPY.errors.targetMissing);
    if (target.id === room.hostId) return emitError(socket, COPY.errors.cannotBanHost);
    if (!Array.isArray(room.bannedSessionIds)) room.bannedSessionIds = [];
    if (!room.bannedSessionIds.includes(target.id)) room.bannedSessionIds.push(target.id);
    const targetSocket = target.socketId ? io.sockets.sockets.get(target.socketId) : null;
    if (targetSocket) {
      targetSocket.emit("bannedFromRoom", { message: COPY.notices.banned });
      targetSocket.leave(room.code);
      targetSocket.data.roomCode = null;
      targetSocket.data.playerId = null;
    }
    room.players = room.players.filter((item) => item.id !== target.id);
    logEvent(room, "ban_player", socket.data.playerId, { targetId: target.id });
    emitRoom(room);
    emitNotice(room, COPY.notices.bannedPlayer(target.name), "leave");
    maybeAdvanceAfterPlayerLeave(room);
    emitOpenRooms();
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
    room.jokeArchive = [];
    room.guesses = [];
    room.guessResults = [];
    room.guessArchive = [];
    room.sharedPromptQueue = [];
    room.currentSharedPromptIndex = 0;
    room.sharedPromptCollectionComplete = false;
    room.assignmentHistory = {};
    room.events = [];
    room.grandFinal = null;
    room.finalSummary = null;
    room.titles = [];
    resetChaosData(room);
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
    const spectatorId = socket.data.spectatorId;
    if (!room) return;

    if (spectatorId && !playerId) {
      const spectator = safeArray(room.spectators).find((item) => item.id === spectatorId);
      if (spectator && spectator.socketId === socket.id) {
        spectator.connected = false;
        spectator.socketId = null;
        emitRoom(room);
      }
      return;
    }

    const player = room.players.find((item) => item.id === playerId);
    if (!player) return;

    if (player.disconnectTimer) clearTimeout(player.disconnectTimer);

    player.disconnectTimer = setTimeout(() => {
      const latest = rooms[room.code];
      if (!latest) return;

      const latestPlayer = latest.players.find((item) => item.id === playerId);
      if (!latestPlayer || latestPlayer.socketId !== socket.id) return;

      incrementPlayerStat(latest, playerId, "disconnects");
      logEvent(latest, "disconnect", playerId, {});
      latestPlayer.connected = false;
      latestPlayer.socketId = null;
      latestPlayer.disconnectTimer = null;

      let newHost = null;
      if (latest.hostId === playerId) {
        newHost = getConnectedParticipants(latest).find((item) => item.id !== playerId && !item.banned);
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
