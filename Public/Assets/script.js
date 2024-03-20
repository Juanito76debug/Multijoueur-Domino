window.addEventListener("DOMContentLoaded", () => {
    const dominos = [
      "0/0", "0/1", "0/2", "0/3", "0/4", "0/5", "0/6",
      "1/1", "1/2", "1/3", "1/4", "1/5", "1/6",
      "2/2", "2/3", "2/4", "2/5", "2/6",
      "3/3", "3/4", "3/5", "3/6",
      "4/4", "4/5", "4/6",
      "5/5", "5/6",
      "6/6"
    ];
  
    // Fonction pour mélanger les dominos
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
  
    shuffle(dominos);
  
    // Distribuez les dominos aux joueurs
    const players = ["john", "ruben", "daisy", "berta"];
    const playerHands = {};
    for (const player of players) {
      playerHands[player] = dominos.splice(0, 7);
    }
  
    let currentPlayerIndex = 0;
  
    // Fonction pour passer au joueur suivant
    function nextPlayer() {
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      console.log(`C'est le tour de ${players[currentPlayerIndex]}`);
    }
  
    // Fonction pour vérifier si un domino peut être joué
    function canPlay(domino, chain) {
      // Votre logique ici
      return true;
    }
  
    // Fonction pour compter les points d'une main
    function countPoints(hand) {
      // Votre logique ici
      return 0;
    }
  
    // Fonction pour jouer un domino
    function playDomino(playerName, domino) {
      const playerHand = playerHands[playerName];
      const chain = []; // La chaîne de dominos sur la table
  
      if (canPlay(domino, chain)) {
        chain.push(domino);
        playerHand.splice(playerHand.indexOf(domino), 1);
        console.log(`${playerName} a joué ${domino} et il reste ${playerHand.length} dominos dans sa main.`);
        nextPlayer();
      } else {
        console.log(`${playerName} ne peut pas jouer ${domino}.`);
      }
    }
  
    // Exemple d'utilisation
    playDomino("john", "3/4");
  });