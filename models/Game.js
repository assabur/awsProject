class Game {
	constructor(user1, user2) {
    //user1 = ("" + user1).toLowerCase();
    //user2 = ("" + user2).toLowerCase();
    if (user2 < user1) {
      let z = user1;
      user1 = user2;
      user2 = z;
    }
    this.user1 = user1;
    this.user2 = user2;
  
    this._init();
  }
  
  equals(game) {
    return this.getUser1() === game.getUser1() && this.getUser2() === game.getUser2();
  }
  
  _init() {
    this.user1InGame = false;
    this.user2InGame = false;
    this.user1IsWhite = Math.random() >= 0.5;
    this.started = false;
  }
  
  getOpponent(currentUser) {
    //currentUser = ("" + currentUser).toLowerCase();
    if (currentUser === this.getUser1()) {
      return this.getUser2();
    } else if (currentUser === this.getUser2()) {
      return this.getUser1();
    } else {
      return null;
    }
  }

  getUser1() {
    return this.user1;    
  }

  getUser2() {
    return this.user2;    
  }
  
  hasUser(user) {
    //user = ("" + user).toLowerCase();
    return user === this.user1 || user === this.user2;
  }
  
  isStarted() {
    return this.started;
  }

  isUser1InGame() {
    return this.user1InGame;
  }

  isUser2InGame() {
    return this.user2InGame;
  }
  
  isUserInGame(user) {
    //user = ("" + user).toLowerCase();
    if (user === this.user1) {
      return this.user1InGame;
    } else if (user === this.user2) {
      return this.user2InGame;
    }
  }

  isUser1White() {
    return this.user1IsWhite;
  }

  isUser2White() {
    return !this.user1IsWhite;
  }
  
  isUserWhite(user) {
    //user = ("" + user).toLowerCase();
    if (user === this.user1) {
      return this.user1IsWhite;
    } else if (user === this.user2) {
      return !this.user1IsWhite;
    }
  }
  
  isInvalid() {
    return !this.user1 || !this.user2 || this.user1 === this.user2;
  }

  isReady() {
    return this.isUser1InGame() && this.isUser2InGame();
  }

  isStarted() {
    return this.started;
  }

  setInGame(user, v) {
    if (typeof v === 'undefined') {
      v = true;
    }
    //user = ("" + user).toLowerCase();
    if (user === this.user1) {
      this.user1InGame = !!v;
    } else if (user === this.user2) {
      this.user2InGame = !!v;
    }
  }
  
  setStarted(v) {
    if (typeof v === 'undefined') {
      v = true;
    }
    this.started = !!v;
  }
};

let games = [];

function startGame(user1, user2) {
  let game = new Game(user1, user2);
  if (game.isInvalid()) {
    return null;
  }
  for (let i = 0; i < games.length; ++i) {
    if (games[i].equals(game)) {
      return games[i];
    }
  }
  games.push(game);
  return game;  
}

function endGame(game) {
  if (!game) {
    return;
  }
  game._init();
  for (let i = 0; i < games.length; ++i) {
    if (games[i].equals(game)) {
      games.splice(i, 1);
      return;
    }
  }
}


module.exports = {
  endGame,
  startGame,
};