window.addEventListener("DOMContentLoaded", () => {
  // Établissez une connexion Socket.IO avec le serveur
  const socket = io.connect("http://localhost:3000", {
    secure: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect_error", (err) => {
    console.error("Erreur de connexion au serveur:", err);
  });

  socket.on("mise_a_jour", (data) => {
    if (data.playerName && data.domino) {
      updateGameDisplay(data.playerName, data.domino);
    }
    if (data.joueur && data.score) {
      const joueurElement = document.getElementById(`score-${data.joueur}`);
      if (joueurElement) {
        joueurElement.textContent = `Score de ${data.joueur} : ${data.score}`;
      }
    }
  });

  // Initialisation des dominos
  const dominos = [
    "0/0",
    "0/1",
    "0/2",
    "0/3",
    "0/4",
    "0/5",
    "0/6",
    "1/1",
    "1/2",
    "1/3",
    "1/4",
    "1/5",
    "1/6",
    "2/2",
    "2/3",
    "2/4",
    "2/5",
    "2/6",
    "3/3",
    "3/4",
    "3/5",
    "3/6",
    "4/4",
    "4/5",
    "4/6",
    "5/5",
    "5/6",
    "6/6",
  ];

  // Initialisation des joueurs et de leurs mains
  const players = ["john", "ruben", "daisy", "berta"];
  let playerHands = {
    john: [],
    ruben: [],
    daisy: [],
    berta: [],
  };

  // Index du joueur actuel et chaîne de dominos sur la table
  let currentPlayerIndex = 0;
  let chain = [];

  // Mélangez et distribuez les dominos
  shuffle(dominos);
  distributeDominos();
  displayPlayerDominos();

  // Fonctions pour la logique du jeu
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function createDominoElement(domino) {
    const [leftValue, rightValue] = domino.split("/");
    const dominoElement = document.createElement("div");
    dominoElement.className = "domino";
    dominoElement.innerHTML = `
      <div class="domino-half">${leftValue}</div>
      <div class="domino-half">${rightValue}</div>
    `;
    return dominoElement;
  }

  function displayPlayerDominos() {
    for (const player in playerHands) {
      const playerDominoContainer = document.createElement("div");
      playerDominoContainer.className = "player-dominos";
      playerDominoContainer.id = `dominos-${player}`;
      playerHands[player].forEach((domino) => {
        const dominoElement = createDominoElement(domino);
        playerDominoContainer.appendChild(dominoElement);
      });
      document.body.appendChild(playerDominoContainer);
    }
  }

  function updateGameDisplay(playerName, domino) {
    const playerHand = playerHands[playerName];
    const dominoIndex = playerHand.indexOf(domino);
    if (dominoIndex !== -1) {
      playerHand.splice(dominoIndex, 1);
      const dominoElement = createDominoElement(domino);
      animateDomino(dominoElement);
      const playerDominoContainer = document.getElementById(
        `dominos-${playerName}`
      );
      playerDominoContainer.appendChild(dominoElement);
    }
  }

  function nextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    console.log(`C'est le tour de ${players[currentPlayerIndex]}`);
  }

  function canPlay(domino, chain) {
    // Ajoutez ici la logique pour vérifier si un domino peut être joué
    return true;
  }

  function countPoints(hand) {
    // Ajoutez ici la logique pour compter les points d'une main
    return hand.reduce((sum, domino) => {
      const values = domino.split("/").map(Number);
      return sum + values[0] + values[1];
    }, 0);
  }

  function playDomino(playerName, domino) {
    const playerHand = playerHands[playerName];
    if (canPlay(domino, chain)) {
      chain.push(domino);
      playerHand.splice(playerHand.indexOf(domino), 1);
      socket.emit("action_joueur", { playerName, domino });
      console.log(
        `${playerName} a joué ${domino} et il reste ${playerHand.length} dominos dans sa main.`
      );
      nextPlayer();
    } else {
      console.log(`${playerName} ne peut pas jouer ${domino}.`);
    }
  }

  function distributeDominos() {
    for (const player of players) {
      playerHands[player] = dominos.splice(0, 7);
    }
  }

  function animateDomino(dominoElement) {
    dominoElement.style.transition = "transform 0.5s ease-in-out";
    dominoElement.style.transform = "translateY(-20px)";
    setTimeout(() => {
      dominoElement.style.transform = "translateY(0)";
    }, 500);
  }

  // Exemple d'utilisation
  playDomino("john", "3/4");
});
