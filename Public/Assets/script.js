window.addEventListener("DOMContentLoaded", () => {
  const socket = io.connect("http://localhost:3000", {
    secure: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect_error", (err) => {
    console.error("Erreur de connexion au serveur:", err);
  });

  socket.on("game_started", (data) => {
    displayDominos(data.playerHands);
    handlePlayerTurn(data.currentPlayerIndex);
  });

  socket.on("mise_a_jour", (data) => {
    if (data.playerName && data.domino) {
      updateGameDisplay(data.chain, data.playerName, data.domino);
    }
    if (data.joueur && data.score) {
      const joueurElement = document.getElementById(`score-${data.joueur}`);
      if (joueurElement) {
        joueurElement.textContent = `Score de ${data.joueur} : ${data.score}`;
      }
    }
  });

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

  const players = ["john", "ruben", "daisy", "berta"];
  let playerHands = {
    john: [],
    ruben: [],
    daisy: [],
    berta: [],
  };

  let currentPlayerIndex = 0;
  let chain = [];

  const startGameButton = document.getElementById("start-game");
  const dominoPool = document.getElementById("domino-pool");

  startGameButton.addEventListener("click", startGame);
  if (startGameButton) {
    startGameButton.addEventListener("click", () => {
      socket.emit("start_game");
    });
  } else {
    console.error("L'élément 'start-game' n'existe pas dans le DOM.");
  }

  if (dominoPool) {
    dominoPool.addEventListener("click", (event) => {
      if (event.target.className === "domino") {
        const dominoText = event.target.textContent.split("-").join("/");
        playDomino(players[currentPlayerIndex], dominoText);
      }
    });
  } else {
    console.error("L'élément 'domino-pool' n'existe pas dans le DOM.");
  }
  let selectedDominoId = null;
  document.addEventListener("keydown", (event) => {
    if (
      selectedDominoId &&
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
    ) {
      const dominoElement = document.getElementById(selectedDominoId);
      if (dominoElement) {
        makeDominoMovableWithArrows(dominoElement, event.key);
      }
    }
  });

  // Fonction pour rendre un domino déplaçable par glisser-déposer
  function makeDominoDraggable(dominoElement) {
    dominoElement.draggable = true;
    dominoElement.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", event.target.id);
    });
  }

  // Exemple d'utilisation des fonctions
  const dominoElement = document.getElementById("domino"); // Remplacez avec l'ID réel de votre domino

  function startGame() {
    shuffle(dominos);
    distributeDominos(dominos, players); // Ajout des paramètres manquants
    const startingPlayerData = findStartingPlayer(players, playerHands); // Ajout des paramètres manquants
    if (startingPlayerData.startingPlayer !== null) {
      currentPlayerIndex = players.indexOf(startingPlayerData.startingPlayer);
      playDomino(
        startingPlayerData.startingPlayer,
        startingPlayerData.startingDomino
      );
      updateGameDisplay(
        chain,
        startingPlayerData.startingPlayer,
        startingPlayerData.startingDomino
      ); // Ajout des paramètres manquants
    } else {
      console.error("Aucun joueur de départ valide trouvé.");
    }
    displayPlayerDominos();
  }
  function shuffle(dominos) {
    for (let i = dominos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dominos[i], dominos[j]] = [dominos[j], dominos[i]];
    }
  }

  function distributeDominos(dominos, players) {
    players.forEach((player) => (playerHands[player] = []));
    for (const player of players) {
      playerHands[player] = dominos.splice(0, 7);
    }
    dominos.forEach((domino, index) => {
      playerHands[players[index % players.length]].push(domino);
    });
    return findStartingPlayer(players, playerHands);
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
  function findStartingPlayer(players, playerHands) {
    for (let i = 6; i >= 0; i--) {
      for (const player of players) {
        if (playerHands[player].includes(`${i}/${i}`)) {
          return { startingPlayer: player, startingDomino: `${i}/${i}` };
        }
      }
    }
    return { startingPlayer: null, startingDomino: null };
  }

  function createDominoElement(domino) {
    const dominoElement = document.createElement("div");
    dominoElement.className = "domino";
    const [leftValue, rightValue] = domino.split("/");
    dominoElement.innerHTML = `<div class="domino-half">${leftValue}</div><div class="domino-half">${rightValue}</div>`;
    return dominoElement;
  }

  function displayDominos(playerHands) {
    Object.keys(playerHands).forEach((player) => {
      const playerDominoContainer = document.getElementById(
        `dominos-${player}`
      );
      if (playerDominoContainer) {
        playerDominoContainer.innerHTML = "";
        playerHands[player].forEach((domino) => {
          playerDominoContainer.appendChild(createDominoElement(domino));
        });
      }
    });
  }

  function handlePlayerTurn(currentPlayerIndex) {
    const currentPlayer = players[currentPlayerIndex];
    console.log(`C'est le tour de ${currentPlayer}`);
  }

  function updateGameDisplay(chain, playerName, domino) {
    // Mise à jour de la chaîne de dominos
    displayDominos(playerHands);
    // Mise à jour de la main du joueur après avoir joué un domino
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
    if (chain.length === 0) {
      return true;
    }
    const [dominoLeft, dominoRight] = domino.split("/").map(Number);
    const [chainStart, chainEnd] = [
      chain[0].split("/")[0],
      chain[chain.length - 1].split("/")[1],
    ].map(Number);
    return (
      dominoLeft === chainStart ||
      dominoLeft === chainEnd ||
      dominoRight === chainStart ||
      dominoRight === chainEnd
    );
  }

  function countPoints(hand) {
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
      socket.emit("action_joueur", {
        playerName,
        domino,
        chain,
        playerHands,
      });
      console.log(
        `${playerName} a joué ${domino} et il reste ${playerHand.length} dominos dans sa main.`
      );
      nextPlayer();
    } else {
      console.log(`${playerName} ne peut pas jouer ${domino}.`);
    }
    function animateDomino(dominoElement) {
      dominoElement.style.transition = "transform 0.5s ease-in-out";
      dominoElement.style.transform = "translateY(-20px)";
      setTimeout(() => {
        dominoElement.style.transform = "translateY(0)";
      }, 500);
    }
  }

  // Suppression de l'appel de test initial
  //playDomino("john", "3/4");
});
