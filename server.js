const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const { MongoClient } = require("mongodb");
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let db, dominosCollection;

async function connectToDb() {
  await client.connect();
  console.log("Connecté à MongoDB");
  db = client.db("multijoueurs-domino");
  dominosCollection = db.collection("domino");
}
connectToDb().catch(console.error);

app.use(express.urlencoded({ extended: true }));

app.post("/formulaire", (req, res) => {
  console.log(req.body);
  res.redirect("/");
});

app.use("/assets", express.static(path.join(__dirname, "Public", "assets")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "assets", "index.html"));
});

let gameData = {
  chain: [],
  players: ["john", "ruben", "daisy", "berta"],
  playerHands: {
    john: [],
    ruben: [],
    daisy: [],
    berta: [],
  },
  currentPlayerIndex: 0,
};

io.on("connection", (socket) => {
  console.log("Un joueur s'est connecté");
  startGame();

  socket.on("action_joueur", (data) => {
    console.log(`${data.playerName} a joué le domino ${data.domino}`);
    if (validatePlayerAction(data.playerName, data.domino)) {
      gameData.chain.push(data.domino);
      const playerHand = gameData.playerHands[data.playerName];
      const dominoIndex = playerHand.indexOf(data.domino);
      if (dominoIndex !== -1) {
        playerHand.splice(dominoIndex, 1);
      }
      gameData.currentPlayerIndex =
        (gameData.currentPlayerIndex + 1) % gameData.players.length;
      io.emit("mise_a_jour", gameData);
    } else {
      socket.emit("action_invalide", { message: "Action non valide." });
    }
  });

  socket.on("disconnect", () => {
    console.log("Un joueur s'est déconnecté");
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Quelque chose s'est mal passé!");
});

function startGame() {
  shuffleAndDistribute();
  io.emit("game_started", gameData);
}

function shuffleAndDistribute() {
  const dominos = createDominos();
  shuffle(dominos);
  distributeDominos(dominos, gameData.players);
  gameData.currentPlayerIndex = findStartingPlayer(gameData.playerHands);
}

function createDominos() {
  const dominos = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      dominos.push(`${i}/${j}`);
    }
  }
  return dominos;
}

function shuffle(dominos) {
  for (let i = dominos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dominos[i], dominos[j]] = [dominos[j], dominos[i]];
  }
}

function distributeDominos(dominos, players) {
  const playerHands = gameData.playerHands;
  players.forEach((player) => (playerHands[player] = []));
  let playerIndex = 0;
  while (dominos.length > 0) {
    playerHands[players[playerIndex]].push(dominos.pop());
    playerIndex = (playerIndex + 1) % players.length;
  }
}

function findStartingPlayer(playerHands) {
  for (let i = 6; i >= 0; i--) {
    for (const player in playerHands) {
      if (playerHands[player].includes(`${i}/${i}`)) {
        return gameData.players.indexOf(player);
      }
    }
  }
  return 0;
}

function validatePlayerAction(playerName, domino) {
  if (gameData.players[gameData.currentPlayerIndex] !== playerName) {
    return false;
  }
  const playerHand = gameData.playerHands[playerName];
  if (!playerHand.includes(domino)) {
    return false;
  }
  return true;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
