const ws = require("ws");
const http = require("http");
const { endGame, startGame } = require("./models/Game.js");
const User = require("./models/User.js");

// list des connections actives
var wsConnections = {};
var wsConnectionsTags = {};
var parties = {};
//list des parties gagnés des utilisateurs connéctées 
var Win={};
//list des parties perdus des utilisateurs connéctées 
var Lost={};

//Initialisation du webSocket
function initWebsocket(app, sessionParser) {
  var server = http.createServer(app);
  var wsserver = new ws.Server({
    server: server,
    verifyClient: (info, done) => {
      sessionParser(info.req, {}, () => {
        done(info.req.session);
      });
    }
  });

  //
  server.listen(process.env.PORT);

  //attente d'une connection du client
  wsserver.on("connection", function(wsconn, req) {
    if (!req.session || !req.session.passport || !req.session.passport.user) {
      return;
    }

    User.findById(req.session.passport.user, function(err, user) {
      if (!user || !user.name) {
        return;
      }
      
      wsconn.on("message", function(data) {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        
        if (!data.type) {
          return;
        }
        //mettre a jour le gagnant de la partie dans la bd 
        if(data.type == "Gagnant"){
          user.partiesWin=user.partiesWin+1;
           user.updateOne({name: user.name},{$set:{partiesWin: user.partiesWin}});
           UpdatesWin(user.name);
          console.log("Jaffiche le Win de user"+ Win[user]);
          user.save();
        }
        //mettre à jour le perdant de la partie dans la bd
        if(data.type == "Perdant"){
          user.partiesLost=user.partiesLost+1;
            user.updateOne({name: user.name},{$set:{partiesLost: user.partiesLost}});
            UpdatesLost(user.name);
          console.log("Jaffiche le lost de user"+ Lost[user]);
            user.save();
        }
        
        if(data.type == "Nbparties"){
          sendMessage("getParties",{ partiesWin : user.partiesWin, partiesLost : user.partiesLost });
        }
        //Envoi de la liste d'utilisateur au client
        if (data.type === "getConnectedList") {
          receivedGetConnectedList(user);
        } else if (data.type === "getChallenges") { // Envoi du challenge au client
          receivedGetChallenges(user, wsconn);
        } else if (data.type === "isGameSocket") {
          receivedInGameSocket(user, wsconn, data);
        } else if (data.type === "move") {//mouvement de l'adversaire recu
          receivedMove(user, wsconn, data);
        }
      });

      wsconn.on("close", function(data) {
        let game = getConnectionTag(wsconn, "game");
        setConnectionTag(wsconn, null);
        // est-ce qu'il y a un autre socket pour ce jeu ?
        if (game && !hasGame(game, user)) {
          // informer l'autre joueur que la partie est terminée
          let opponent = game.getOpponent(user.name);
          sendMessage(
            "endGame",
            { opponent: user.name, reason: "disconnect" },
            { name: opponent }
          );
          endGame(game);
        }

        removeWsConnection(user, wsconn);//supprimer la connection
        sendChangedConnectedList();//mettre a jour la liste des users connectées
      });
      UpdatesWin(user);//mise à jour des parties gagné du user
      UpdatesLost(user);//mise à jour des parties perdus du user
      recordWsConnection(user, wsconn);//attribution du socket au user
      sendChangedConnectedList();//mise à jour de la liste d'users connéctées
    });
  });
}

function endGames(user, wsconn) {
  for (let k in wsConnectionsTags) {
    if (user) {
      if (k !== user.name) {
        continue;
      }
    }
    for (let kk in wsConnectionsTags[k]) {
      if (wsconn) {
        let candidate = wsConnections[k][kk];
        if (candidate !== wsconn) {
          continue;
        }
      }
      let game = wsConnectionsTags[k][kk]["game"];
      if (typeof game !== "undefined") {
        // informer l'autre joueur que la partie est terminée
        let opponent = game.getOpponent(k);
        sendMessage(
          "endGame",
          { opponent: k, reason: "disconnect" },
          { name: opponent }
        );
        endGame(game);
        wsConnectionsTags[k][kk]["game"] = null;
      }
    }
    if (user) {
      break;
    }
  }
}


//
function getConnectionGame(wsConn) {
 return getConnectionTag(wsConn, "game"); 
}

function getConnectionTag(wsConn, tagName) {
  for (let k in wsConnections) {
    for (let kk in wsConnections[k]) {
      if (wsConnections[k][kk] === wsConn) {
        return wsConnectionsTags[k][kk][tagName];
      }
    }
  }
}

//
function getConnectionGames(user) {
 return getConnectionTags("game", user); 
}

//
function getConnectionTags(tagName, user) {
  let r = [];
  for (let k in wsConnectionsTags) {
    if (user) {
      k = user.name;
      if (typeof wsConnections[k] === "undefined") {
        return [];
      }
    }
    for (let kk in wsConnectionsTags[k]) {
      if (wsConnectionsTags[k][kk][tagName]) {
        r.push(wsConnectionsTags[k][kk][tagName]);
      }
    }
  }
  return r;
}

//
function getWsConnections(user) {
  let r = [];
  for (let k in wsConnections) {
    if (user) {
      k = user.name;
      if (typeof wsConnections[k] === "undefined") {
        return [];
      }
    }
    for (let kk in wsConnections[k]) {
      r.push(wsConnections[k][kk]);
    }
    if (user) {
      break;
    }
  }
  return r;
}

//
function getWsConnectionsForGame(game, user) {
  let r = [];
  for (let k in wsConnections) {
    if (user) {
      k = user.name;
      if (typeof wsConnections[k] === "undefined") {
        return [];
      }
    }
    for (let kk in wsConnections[k]) {
      let otherGame = wsConnectionsTags[k][kk]["game"];
      if ((typeof otherGame !== "undefined") && otherGame.equals(game)) {
        r.push(wsConnections[k][kk]);
      }
    }
    if (user) {
      break;
    }
  }
  return r;
}
//récupération de toutes les connections de tous les utilisateurs 
function getWsConnectedUsers() {
  let r = [];
  for (let k in wsConnections) {
    if (!wsConnections[k].length) {
      continue;
    }
    
    console.log("dans le get WsConnectedUsers on a "+ k + "est"+ Win[k]+"defaite"+ Lost[k]);
    r.push({    name : k,
                partiesWin : Win[k],
                partiesLost: Lost[k]
           });
    //r.push({name:k});
  }
  return r;
}
//
function hasGame(game, user) {
  let allGames = getConnectionGames(user);
  for (let i = 0; i < allGames.length; ++i) {
    if (game.equals(allGames[i])) {
      return true;
    }
  }
  return false;
}

//
function recordWsConnection(user, wsconn) {
if (typeof wsConnections[user.name] === "undefined") {
    wsConnections[user.name] = [];
    wsConnectionsTags[user.name] = [];
  }
 
  wsConnections[user.name].push(wsconn);
  wsConnectionsTags[user.name].push({});
}

//
function removeWsConnection(user, wsconn) {
  if (typeof wsConnections[user.name] === "undefined") {
    return;
  }

  endGames(user, wsconn);
  
  for (let k in wsConnections) {
    if (user) {
      k = user.name;
      if (typeof wsConnections[k] === "undefined") {
        return;
      }
    }
    for (let kk in wsConnections[k]) {
      if (wsconn) {
        let candidate = wsConnections[k][kk];
        if (candidate !== wsconn) {
          continue;
        }
      }
      wsConnections[k].splice(kk, 1);
      wsConnectionsTags[k].splice(kk, 1);
    }
    if (user) {
      break;
    }
  }

  if (!wsConnections[user.name].length) {
    delete wsConnections[user.name];
    delete wsConnectionsTags[user.name];
  }
}

//
function receivedGetChallenges(user, wsconn) {
  let allGames = getConnectionGames();
  for (let game of allGames) {
    if (!game.hasUser(user.name) || game.isUserInGame(user.name)) {
      continue;
    }
    if (game.isReady() || game.isStarted()) {
      continue;
    }
    let opponent = game.getOpponent(user.name);
    sendMessage("challenge", { opponent: opponent }, user, wsconn);
  }
}

//
function receivedGetConnectedList(user) {
  sendChangedConnectedList(user);
}

//
function receivedInGameSocket(user, wsconn, data) {
  let opponent = data.opponent;
  let game = startGame(user.name, opponent);

  //
  if (!game) {
    sendMessage(
      "endGame",
      { opponent: opponent, reason: "" },
      user,
      wsconn
    );
    return;
  }

  // est-ce qu'il y a un autre socket pour ce jeu ?
  if (hasGame(game, user)) {
    sendMessage(
      "endGame",
      { opponent: opponent, reason: "alreadyInGame" },
      user,
      wsconn
    );
    return;
  }

  //
  game.setInGame(user.name);
  setConnectionTag(wsconn, "game", game);

  if (!game.isReady()) {
    sendMessage("challenge", { opponent: user.name }, { name: opponent });
  } else {
    sendMessage("startGame", { playInWhite: game.isUser1White() }, { name: game.getUser1() });
    sendMessage("startGame", { playInWhite: game.isUser2White() }, { name: game.getUser2() });
    game.setStarted();
  }
}

//
function receivedMove(user, wsconn, data) {
  let opponent = data.opponent;
  let game = getConnectionGame(wsconn);
  let otherSockets = getWsConnectionsForGame(game, {name: opponent});
  if (otherSockets) {
    for (let i = 0; i < otherSockets.length; ++i) {
      sendMessage("move", data, { name: opponent }, otherSockets[i]);
    }
  }
}

//
function sendChangedConnectedList(user) {
  sendMessage("connectedList", { list: getWsConnectedUsers() }, user);
}

//
function sendMessage(type, data, user, wsconn) {
  if (!data) {
    data = {};
  } else if (typeof data !== "object") {
    data = { data: data };
  }
  data.type = type;
  data.user = user ? { name: user.name } : null;
  
  if ((typeof wsconn !== "undefined") && wsconn) {
    wsconn.send(JSON.stringify(data));
    return;
  }

  let wsconns = getWsConnections(user);
  if (wsconns) {
    for (let wsconn of wsconns) {
      wsconn.send(JSON.stringify(data));
    }
  }
}

//
function setConnectionTag(wsConn, tagName, tagValue) {
  for (let k in wsConnections) {
    for (let kk in wsConnections[k]) {
      if (wsConnections[k][kk] === wsConn) {
        wsConnectionsTags[k][kk][tagName] = tagValue;
      }
    }
  }
}

function UpdatesLost(user){
  Lost[user.name]=user.partiesLost;
  }

function UpdatesWin(user){
  Win[user.name]=user.partiesWin;
}
//
module.exports = {
  getConnectionTag,
  getWsConnections,
  getWsConnectedUsers,
  initWebsocket,
  sendChangedConnectedList,
  sendMessage,
  setConnectionTag
};

  