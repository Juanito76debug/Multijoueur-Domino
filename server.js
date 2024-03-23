const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();

const server = http.createServer(app);
const io = socketIO(server);

app.use(express.urlencoded({ extended: true }));

app.post("/formulaire", (req, res) => {
  // Logique pour traiter les données du formulaire
  console.log(req.body); // Assurez-vous d'avoir body-parser configuré pour accéder à req.body

  res.redirect("/"); // Remplacez par le chemin de redirection souhaité
});

app.use("/assets", express.static(path.join(__dirname, "Public", "assets")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "assets", "index.html"));
});

let gameData = {
  chain: [], // La chaîne de dominos sur la table
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

  socket.on("action_joueur", (data) => {
    // Traitez l'action du joueur ici
    console.log(`${data.playerName} a joué le domino ${data.domino}`);

    gameData.chain.push(data.domino);
    const playerHand = gameData.playerHands[data.playerName];
    const dominoIndex = playerHand.indexOf(data.domino);
    if (dominoIndex !== -1) {
      playerHand.splice(dominoIndex, 1);
    }
    // Passez au joueur suivant
    gameData.currentPlayerIndex =
      (gameData.currentPlayerIndex + 1) % gameData.players.length;

    // Informez les autres joueurs
    io.emit("mise_a_jour", gameData); // Utilisez io.emit pour envoyer à tous les clients
  });

  socket.on("disconnect", () => {
    console.log("Un joueur s'est déconnecté");
  });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Quelque chose s'est mal passé!");
});

function validatePlayerAction(data) {
  // Votre logique de validation ici
  return true; // Retourne 'true' si les données sont valides
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
